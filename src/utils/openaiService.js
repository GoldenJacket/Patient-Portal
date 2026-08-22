export async function getLabExplanation(title, details) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: `You are a helpful health assistant. Explain this lab result in 2-3 plain sentences a patient can understand. No headers, no bullet points, no markdown. Be friendly and non-alarming. End with a reminder to consult their doctor. Lab result: ${title}. ${details}`,
          },
        ],
      }),
    });

    const data = await response.json();
    return data.content[0].text;
  } catch {
    return 'Unable to generate explanation at this time.';
  }
}

export async function getChatReply(message, documentContext = '') {
  const system = documentContext
    ? `You are a helpful health assistant. Answer succinctly and kindly.\n\nThe patient has uploaded the following medical documents. Use them to answer questions when relevant:\n\n${documentContext}`
    : 'You are a helpful health assistant. Answer succinctly and kindly.';

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 300,
        system,
        messages: [{ role: 'user', content: message }],
      }),
    });

    const data = await response.json();
    return data.content && data.content[0] ? data.content[0].text : 'Sorry, no response.';
  } catch {
    return 'Unable to contact AI service at this time.';
  }
}
