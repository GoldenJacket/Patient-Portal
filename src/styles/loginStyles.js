const loginStyles = {
  page: {
    minHeight: '100vh',
    background: '#0d9488',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  card: { width: '100%', maxWidth: 380 },
  title: { color: '#ffffff', fontWeight: 600, textAlign: 'center', mb: 0.5 },
  subtitle: { color: '#ccfbf1', fontSize: '14px', textAlign: 'center', mb: 3 },
  inputField: {
    mb: 2,
    '& .MuiOutlinedInput-root': {
      background: 'rgba(255,255,255,0.15)',
      borderRadius: '8px',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
      '&.Mui-focused fieldset': { borderColor: '#ffffff' },
    },
    '& .MuiInputLabel-root': { color: '#ccfbf1' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#ffffff' },
    '& .MuiOutlinedInput-input': { color: '#ffffff' },
  },
  iconButton: { color: '#ccfbf1' },
  errorText: { color: '#fca5a5', fontSize: '13px', mb: 1.5, textAlign: 'center' },
  signInButton: {
    background: '#ffffff',
    color: '#0d9488',
    fontWeight: 600,
    borderRadius: '8px',
    padding: '10px',
    mb: 2,
    '&:hover': { background: '#f0fdfa' },
  },
  progress: { color: '#0d9488' },
  registerText: { color: '#ccfbf1', fontSize: '13px', textAlign: 'center' },
  registerLink: { color: '#ffffff', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' },
};

export default loginStyles;
