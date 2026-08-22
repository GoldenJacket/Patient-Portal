const patientProfileStyles = {
  pageBox: { p: 4 },
  title: { mb: 2, color: '#134e4a', fontWeight: 600 },
  sectionCard: { background: '#f0fdfa', border: '0.5px solid #99f6e4', borderRadius: '12px', padding: 3 },
  avatarRow: { display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 },
  avatarBox: { width: 48, height: 48, borderRadius: '50%', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 500, color: '#0f766e' },
  nameTitle: { fontSize: '18px', fontWeight: 600, color: '#134e4a' },
  nameSubtitle: { fontSize: '14px', color: '#0f766e' },
  divider: { borderTop: '0.5px solid #99f6e4', mb: 2 },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 },
  infoLabel: { fontSize: '13px', color: '#0f766e', mb: 0.5 },
  infoValue: { fontSize: '16px', color: '#134e4a', fontWeight: 500 },
  editButton: { color: '#0d9488', border: '0.5px solid #99f6e4', borderRadius: '8px', fontSize: '15px' },
  inputSx: {
    mb: 2,
    '& .MuiOutlinedInput-root': { borderRadius: '8px', '& fieldset': { borderColor: '#99f6e4' }, '&:hover fieldset': { borderColor: '#0d9488' }, '&.Mui-focused fieldset': { borderColor: '#0d9488' } },
    '& .MuiInputLabel-root.Mui-focused': { color: '#0d9488' },
  },
  formGrid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 },
  actionsRow: { display: 'flex', gap: 1 },
  saveButton: { background: '#0d9488', color: '#ffffff', borderRadius: '8px', px: 3, '&:hover': { background: '#0f766e' } },
  cancelButton: { color: '#0f766e', border: '0.5px solid #99f6e4', borderRadius: '8px' },
  savedText: { color: '#0d9488', fontSize: '13px', mt: 1 },
  errorText: { color: '#dc2626', fontSize: '13px', mt: 1 },
  loadingBox: { display: 'flex', justifyContent: 'center' },
};

export default patientProfileStyles;
