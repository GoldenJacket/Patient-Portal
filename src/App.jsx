import { useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import Typography from '@mui/material/Typography';

import PatientProfile from './pages/PatientProfile';
import MedicalData from './pages/MedicalData';
import Login from './pages/Login';
import Register from './pages/Register';
import UploadReport from './pages/UploadReport';
import { useFhir } from './hooks/useFhir';
import { supabase } from './utils/supabaseClient';

const USER_STORAGE_KEY = 'patientPortal.currentUser';
const PAGE_STORAGE_KEY = 'patientPortal.currentPage';
const PORTAL_PAGES = ['patientProfile', 'medicalData', 'uploadReport'];

export default function App() {
  const [page, setPage] = useState(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (!savedUser) return 'login';

      const savedPage = localStorage.getItem(PAGE_STORAGE_KEY);
      return PORTAL_PAGES.includes(savedPage) ? savedPage : 'patientProfile';
    } catch {
      return 'login';
    }
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [fhirPatientId, setFhirPatientId] = useState(null);
  const [documentTexts, setDocumentTexts] = useState([]);

  const { conditions, observations, loading, error } = useFhir(fhirPatientId);

  useEffect(() => {
    if (!currentUser?.email) return;
    supabase
      .from('documents')
      .select('name, document_files(extracted_text)')
      .eq('user_email', currentUser.email)
      .then(({ data }) => {
        if (!data) return;
        setDocumentTexts(
          data
            .map((d) => {
              const files = d.document_files;
              const text = Array.isArray(files) ? files[0]?.extracted_text : files?.extracted_text;
              return text ? { name: d.name, text } : null;
            })
            .filter(Boolean)
        );
      });
  }, [currentUser, page]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
      if (PORTAL_PAGES.includes(page)) {
        localStorage.setItem(PAGE_STORAGE_KEY, page);
      }
      return;
    }

    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(PAGE_STORAGE_KEY);
  }, [currentUser, page]);

  const handleLogin = (user) => {
  setCurrentUser(user);
  if (user.fhirPatientId) setFhirPatientId(user.fhirPatientId);
  setPage('patientProfile');
};

  const handleLogout = () => {
    setCurrentUser(null);
    setFhirPatientId(null);
    setDocumentTexts([]);
    setPage('login');
  };

 const renderPage = () => {
  if (page === 'patientProfile') return <PatientProfile userEmail={currentUser?.email} onProfileUpdate={setFhirPatientId} />;
  if (page === 'medicalData') return <MedicalData conditions={conditions} observations={observations} documentTexts={documentTexts} />;
  if (page === 'uploadReport') return <UploadReport userEmail={currentUser?.email} />;
};

  if (!currentUser) {
    if (page === 'register') return <Register setPage={setPage} />;
    return <Login onLogin={handleLogin} setPage={setPage} />;
  }

  return (
    <Box sx={{ minHeight: '100vh', background: '#f0fdfa' }}>
      <AppBar position="sticky" elevation={0} sx={{ background: '#0d9488', borderBottom: '1px solid #99f6e4' }}>
        <Container>
          <Toolbar disableGutters sx={{ marginX: 0, padding: 0 }}>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, color: '#ffffff' }}>
              Patient Portal
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography sx={{ color: '#ccfbf1', fontSize: '13px', mr: 1 }}>
                {currentUser?.first_name ? `${currentUser.first_name} ${currentUser.last_name}` : currentUser?.email}
              </Typography>
              <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} size="large" edge="end" aria-label="menu">
                <MenuIcon />
              </IconButton>
              <Menu
                id="app-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={() => { setPage('patientProfile'); setAnchorEl(null); }} selected={page === 'patientProfile'}>Patient Profile</MenuItem>
                <MenuItem onClick={() => { setPage('medicalData'); setAnchorEl(null); }} selected={page === 'medicalData'}>Medical Data</MenuItem>
                <MenuItem onClick={() => { setPage('uploadReport'); setAnchorEl(null); }} selected={page === 'uploadReport'}>Upload Reports</MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleLogout(); setAnchorEl(null); }}>
                  <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>{renderPage()}</Box>
    </Box>
  );
}
