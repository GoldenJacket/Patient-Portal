const uploadReportStyles = {
  pageBox: { p: 4 },
  title: { mb: 0.5, color: '#134e4a', fontWeight: 600 },
  subtitle: { fontSize: '14px', color: '#0f766e', mb: 2 },
  alert: { mb: 2, borderRadius: '10px' },
  dropzone: (dragActive) => ({
    background: dragActive ? '#ccfbf1' : '#f0fdfa',
    border: `2px dashed ${dragActive ? '#0d9488' : '#99f6e4'}`,
    borderRadius: '12px',
    padding: 4,
    textAlign: 'center',
    cursor: 'pointer',
    mb: 3,
    transition: 'all 0.2s',
    '&:hover': { background: '#ccfbf1', borderColor: '#0d9488' },
  }),
  dropIcon: { marginBottom: 8 },
  dropPrimary: { color: '#134e4a', fontSize: '14px' },
  dropSecondary: { color: '#0f766e', fontSize: '12px', mt: 0.5 },
  docsCard: { background: '#f0fdfa', border: '0.5px solid #99f6e4', borderRadius: '12px', padding: 3 },
  docsHeading: { fontSize: '13px', fontWeight: 500, color: '#0f766e', mb: 2 },
  loadingBox: { display: 'flex', justifyContent: 'center', py: 2 },
  docItem: { display: 'flex', alignItems: 'center', gap: 2, background: '#ffffff', border: '0.5px solid #99f6e4', borderRadius: '10px', padding: '12px 16px', mb: 1.5 },
  docName: { fontSize: '13px', color: '#134e4a', fontWeight: 500 },
  docMeta: { fontSize: '11px', color: '#0f766e' },
  deleteButton: { fontSize: '12px', color: '#A32D2D', border: '0.5px solid #F7C1C1', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', '&:hover': { background: '#FCEBEB' } },
};

export default uploadReportStyles;
