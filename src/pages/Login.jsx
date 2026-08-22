import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { loginUser } from '../utils/auth';
import loginStyles from '../styles/loginStyles';

export default function Login({ onLogin, setPage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  async function handleLogin() {
    setError('');
    // Read from DOM in case autofill bypassed React state
    const emailVal = emailRef.current?.querySelector('input')?.value || email;
    const passwordVal = passwordRef.current?.querySelector('input')?.value || password;
    setLoading(true);
    const result = await loginUser(emailVal, passwordVal);
    setLoading(false);
    if (result.success) {
      onLogin(result.user);
    } else {
      setError(result.message);
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <Box sx={loginStyles.page}>
      <Box sx={loginStyles.card}>
        <Typography variant="h5" sx={loginStyles.title}>
          Patient Portal
        </Typography>
        <Typography sx={loginStyles.subtitle}>
          Sign in to your account
        </Typography>

        <TextField ref={emailRef} fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown}
          sx={loginStyles.inputField}
        />

        <TextField ref={passwordRef} fullWidth label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown}
          InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={loginStyles.iconButton}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }}
          sx={loginStyles.inputField}
        />

        {error && <Typography sx={loginStyles.errorText}>{error}</Typography>}

        <Button fullWidth onClick={handleLogin} disabled={loading}
          sx={loginStyles.signInButton}>
          {loading ? <CircularProgress size={20} sx={loginStyles.progress} /> : 'Sign In'}
        </Button>

        <Typography sx={loginStyles.registerText}>
          Don't have an account?{' '}
          <span onClick={() => setPage('register')} style={loginStyles.registerLink}>
            Register
          </span>
        </Typography>
      </Box>
    </Box>
  );
}
