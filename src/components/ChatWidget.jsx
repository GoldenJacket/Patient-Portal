import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import CircularProgress from '@mui/material/CircularProgress';
import { getChatReply } from '../utils/openaiService';
import chatWidgetStyles from '../styles/chatWidgetStyles';

function buildInitialMessages(contextObservation, documentTexts) {
  const msgs = [{ from: 'ai', text: 'Hi — I can help answer questions about your medical data. Ask me anything.' }];
  if (contextObservation) {
    msgs.push({ from: 'ai', text: `Context: ${contextObservation.title}. ${contextObservation.details}` });
  }
  if (documentTexts.length > 0) {
    const names = documentTexts.map((d) => d.name).join(', ');
    msgs.push({ from: 'ai', text: `I also have access to your uploaded document${documentTexts.length > 1 ? 's' : ''}: ${names}.` });
  }
  return msgs;
}

export default function ChatWidget({ open, onClose, contextObservation, documentTexts = [] }) {
  const [messages, setMessages] = useState(() => buildInitialMessages(contextObservation, documentTexts));
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setMessages(buildInitialMessages(contextObservation, documentTexts));
      setInput('');
      setLoading(false);
    }
  }, [open, contextObservation, documentTexts]);

  if (!open) return null;

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg = { from: 'user', text: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const prompt = contextObservation
        ? `Lab result: ${contextObservation.title}\nDetails: ${contextObservation.details}\nUser: ${trimmed}`
        : trimmed;
      const docContext = documentTexts
        .map((d) => `--- ${d.name} ---\n${d.text}`)
        .join('\n\n')
        .slice(0, 6000);
      const reply = await getChatReply(prompt, docContext);
      setMessages((m) => [...m, { from: 'ai', text: reply }]);
    } catch {
      setMessages((m) => [...m, { from: 'ai', text: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Paper elevation={6} sx={chatWidgetStyles.paper}>
      <Box sx={chatWidgetStyles.header}>
        <Typography sx={chatWidgetStyles.headerTitle}>AI Chat</Typography>
        <IconButton size="small" onClick={onClose} sx={chatWidgetStyles.closeButton} aria-label="close chat">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={chatWidgetStyles.messagesContainer}>
        {messages.map((m, idx) => (
          <Box key={idx} sx={chatWidgetStyles.messageRow(m.from === 'user')}>
            <Box sx={chatWidgetStyles.bubble(m.from === 'user')}>
              <Typography sx={chatWidgetStyles.messageText}>{m.text}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={chatWidgetStyles.inputRow}>
        <TextField
          size="small"
          placeholder="Type a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }}
          fullWidth
        />
        <Box sx={chatWidgetStyles.relativeContainer}>
          <Button variant="contained" color="primary" onClick={handleSend} disabled={loading} sx={chatWidgetStyles.sendButton}>
            <SendIcon />
          </Button>
          {loading && (
            <CircularProgress size={20} sx={chatWidgetStyles.progressOverlay} />
          )}
        </Box>
      </Box>
    </Paper>
  );
}
