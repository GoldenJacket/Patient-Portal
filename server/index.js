import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ============================================
// INPUT SANITIZATION
// ============================================
function sanitizeFHIRField(value) {
  if (typeof value !== "string") return "";

  return value
    .trim()
    .replace(/[<>]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[^\x20-\x7E\n]/g, "")
    .slice(0, 1000);
}

// ============================================
// POST /api/explain
// Lab result explanation with caching
// ============================================
app.post("/api/explain", async (req, res) => {
  try {
    const { labData } = req.body;

    if (!labData) {
      return res.status(400).json({ error: "labData is required" });
    }

    const safeLabData = sanitizeFHIRField(labData);

    if (!safeLabData) {
      return res.status(400).json({ error: "Invalid lab data provided" });
    }

    const cacheKey = Buffer.from(safeLabData).toString("base64");

    // Check cache first
    const { data: cached } = await supabase
      .from("ai_cache")
      .select("explanation")
      .eq("cache_key", cacheKey)
      .single();

    if (cached) {
      console.log("Cache hit");
      return res.json({ explanation: cached.explanation, cached: true });
    }

    // Cache miss — call Anthropic
    console.log("Cache miss — calling Anthropic");
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: `You are a helpful health assistant. Explain this lab result in 2-3 plain sentences a patient can understand. No headers, no bullet points, no markdown. Be friendly and non-alarming. End with a reminder to consult their doctor. Lab result: ${safeLabData}`,
        },
      ],
    });

    const explanation = message.content[0].text;

    // Store in cache
    await supabase
      .from("ai_cache")
      .insert({ cache_key: cacheKey, explanation });

    return res.json({ explanation, cached: false });

  } catch (error) {
    console.error("Error in /api/explain:", error);
    if (error.status === 429) {
      return res.status(429).json({ error: "Rate limit reached, please try again shortly" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ============================================
// POST /api/chat
// General health assistant chat (no caching)
// ============================================
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    const safeMessage = sanitizeFHIRField(message);

    if (!safeMessage) {
      return res.status(400).json({ error: "Invalid message provided" });
    }

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `You are a helpful health assistant. Answer succinctly and kindly. User: ${safeMessage}`,
        },
      ],
    });

    const reply = response.content[0].text;
    return res.json({ reply });

  } catch (error) {
    console.error("Error in /api/chat:", error);
    if (error.status === 429) {
      return res.status(429).json({ error: "Rate limit reached, please try again shortly" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ============================================
// Health check
// ============================================
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
