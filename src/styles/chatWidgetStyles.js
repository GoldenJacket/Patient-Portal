const chatWidgetStyles = {
  paper: {
    position: 'fixed',
    right: 20,
    bottom: 20,
    width: 340,
    maxHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 2,
    overflow: 'hidden',
    zIndex: 1400,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    p: 1.25,
    background: '#0f766e',
    color: '#fff',
  },
  headerTitle: { fontWeight: 600 },
  closeButton: { color: '#fff' },
  messagesContainer: {
    p: 1.25,
    overflowY: 'auto',
    flex: 1,
    background: '#f7fdfc',
  },
  messageRow: (fromUser) => ({
    mb: 1.25,
    display: 'flex',
    justifyContent: fromUser ? 'flex-end' : 'flex-start',
  }),
  bubble: (fromUser) => ({
    maxWidth: '78%',
    background: fromUser ? '#dcfce7' : '#ffffff',
    border: '0.5px solid #e6f6ef',
    p: 1,
    borderRadius: 1,
  }),
  messageText: { fontSize: 13, color: '#134e4a' },
  inputRow: {
    display: 'flex',
    gap: 1,
    p: 1,
    alignItems: 'center',
    borderTop: '0.5px solid #e6f6ef',
  },
  sendButton: {
    minWidth: 44,
    p: '6px 10px',
  },
  progressOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: '-10px',
    marginLeft: '-10px',
  },
  relativeContainer: { position: 'relative' },
};

export default chatWidgetStyles;
