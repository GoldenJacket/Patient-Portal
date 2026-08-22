import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { supabase } from '../utils/supabaseClient';
import patientProfileStyles from '../styles/patientProfileStyles';

function getInitials(first, last) {
  return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase() || '?';
}

export default function PatientProfile({ userEmail }) {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', age: '', race: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!userEmail) return;

    async function fetchProfile() {
      setLoading(true);
      setSaveError('');
      const { data } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('user_email', userEmail)
        .single();

      if (data) {
        setProfile(data);
        setForm({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          age: data.age?.toString() || '',
          race: data.race || '',
          address: data.address || '',
        });
      } else {
        setEditing(true);
      }
      setLoading(false);
    }

    fetchProfile();
  }, [userEmail]);

  async function handleSave() {
    setSaving(true);
    setSaveError('');

    const payload = {
      user_email: userEmail,
      first_name: form.first_name?.trim() || null,
      last_name: form.last_name?.trim() || null,
      age: form.age === '' ? null : Number(form.age),
      race: form.race?.trim() || null,
      address: form.address?.trim() || null,
    };

    let result;
    if (profile?.id) {
      result = await supabase
        .from('patient_profiles')
        .update(payload)
        .eq('id', profile.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('patient_profiles')
        .insert(payload)
        .select()
        .single();
    }

    const { data, error } = result;

    if (!error) {
      setProfile(data);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setSaveError(error.message || 'Unable to save profile.');
    }
    setSaving(false);
  }

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const inputSx = patientProfileStyles.inputSx;

  if (loading) {
    return <Box sx={{ ...patientProfileStyles.pageBox, ...patientProfileStyles.loadingBox }}><CircularProgress sx={{ color: '#0d9488' }} /></Box>;
  }

  return (
    <Box sx={patientProfileStyles.pageBox}>
      <Typography variant="h5" sx={patientProfileStyles.title}>Patient Profile</Typography>

      <Box sx={patientProfileStyles.sectionCard}>

        {/* Avatar + name row */}
        {profile && !editing && (
          <>
            <Box sx={patientProfileStyles.avatarRow}>
              <Box sx={patientProfileStyles.avatarBox}>{getInitials(profile.first_name, profile.last_name)}</Box>
              <Box>
                <Typography sx={patientProfileStyles.nameTitle}>{profile.first_name} {profile.last_name}</Typography>
                <Typography sx={patientProfileStyles.nameSubtitle}>Patient</Typography>
              </Box>
            </Box>

            <Box sx={patientProfileStyles.divider} />

            <Box sx={patientProfileStyles.infoGrid}>
              <Box>
                <Typography sx={patientProfileStyles.infoLabel}>Age</Typography>
                <Typography sx={patientProfileStyles.infoValue}>{profile.age}</Typography>
              </Box>
              <Box>
                <Typography sx={patientProfileStyles.infoLabel}>Race</Typography>
                <Typography sx={patientProfileStyles.infoValue}>{profile.race}</Typography>
              </Box>
              <Box sx={{ gridColumn: 'span 2' }}>
                <Typography sx={patientProfileStyles.infoLabel}>Address</Typography>
                <Typography sx={patientProfileStyles.infoValue}>{profile.address}</Typography>
              </Box>
            </Box>

            <Button onClick={() => setEditing(true)} sx={patientProfileStyles.editButton}>Edit Profile</Button>
          </>
        )}

        {/* Edit form */}
        {editing && (
          <>
            <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#0f766e', mb: 2 }}>{profile ? 'Edit your profile' : 'Set up your profile'}</Typography>

            <Box sx={patientProfileStyles.formGrid2}>
              <TextField label="First Name" value={form.first_name || ''} onChange={handleChange('first_name')} sx={inputSx} />
              <TextField label="Last Name" value={form.last_name || ''} onChange={handleChange('last_name')} sx={inputSx} />
            </Box>
            <Box sx={patientProfileStyles.formGrid2}>
              <TextField label="Age" value={form.age || ''} onChange={handleChange('age')} sx={inputSx} />
              <TextField label="Race" value={form.race || ''} onChange={handleChange('race')} sx={inputSx} />
            </Box>
            <TextField fullWidth label="Address" value={form.address || ''} onChange={handleChange('address')} sx={inputSx} />

            <Box sx={patientProfileStyles.actionsRow}>
              <Button onClick={handleSave} disabled={saving} sx={patientProfileStyles.saveButton}>{saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Save'}</Button>
              {profile && (<Button onClick={() => setEditing(false)} sx={patientProfileStyles.cancelButton}>Cancel</Button>)}
            </Box>

            {saved && <Typography sx={patientProfileStyles.savedText}>Profile saved!</Typography>}
            {saveError && <Typography sx={patientProfileStyles.errorText}>{saveError}</Typography>}
          </>
        )}
      </Box>
    </Box>
  );
}
