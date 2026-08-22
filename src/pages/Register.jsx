import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { registerUser } from '../utils/auth';
import registerStyles from '../styles/registerStyles';

export default function Register({ setPage }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (field) => (e) => { setForm((prev) => ({ ...prev, [field]: e.target.value })); setError(''); };

  async function handleSubmit() {
    setError('');
    if (!form.firstName.trim() || !form.lastName.trim()) { setError('Please enter your first and last name.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    const result = await registerUser(form.email, form.password, form.firstName.trim(), form.lastName.trim());
    setLoading(false);
    if (result.success) { setSuccess(true); }
    else { setError(result.message); }
  }

  const inputSx = registerStyles.inputSx;

  if (success) {
    return (
      <Box sx={registerStyles.page}>
        <Box sx={registerStyles.successBox}>
          <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 600, mb: 1 }}>Account Created!</Typography>
          <Typography sx={registerStyles.subtitle}>Welcome, {form.firstName}! Your account has been successfully created.</Typography>
          <Button fullWidth onClick={() => setPage('login')} sx={registerStyles.signInButton}>Go to Sign In</Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={registerStyles.page}>
      <Box sx={registerStyles.card}>
        <Typography variant="h5" sx={registerStyles.title}>Create Account</Typography>
        <Typography sx={registerStyles.subtitle}>Join the Patient Portal today</Typography>

        <Box sx={registerStyles.formGrid}>
          <TextField label="First Name" value={form.firstName} onChange={handleChange('firstName')} sx={inputSx} />
          <TextField label="Last Name" value={form.lastName} onChange={handleChange('lastName')} sx={inputSx} />
        </Box>

        <TextField fullWidth label="Email" value={form.email} onChange={handleChange('email')} sx={inputSx} />

        <TextField
          fullWidth label="Password"
          type={showPassword ? 'text' : 'password'}
          value={form.password} onChange={handleChange('password')}
          InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={registerStyles.iconButton}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }}
          sx={inputSx}
        />

        <TextField
          fullWidth label="Confirm Password"
          type={showConfirm ? 'text' : 'password'}
          value={form.confirmPassword} onChange={handleChange('confirmPassword')}
          InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end" sx={registerStyles.iconButton}>{showConfirm ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }}
          sx={inputSx}
        />

        {error && (
          <Typography sx={registerStyles.errorText}>{error}</Typography>
        )}

        <Button fullWidth onClick={handleSubmit} disabled={loading} sx={{ ...registerStyles.signInButton, mb: 2 }}>
          {loading ? <CircularProgress size={20} sx={registerStyles.progress} /> : 'Create Account'}
        </Button>

        <Typography sx={registerStyles.registerText}>
          Already have an account?{' '}
          <span onClick={() => setPage('login')} style={registerStyles.registerLink}>
            Sign In
          </span>
        </Typography>
      </Box>
    </Box>
  );
}
