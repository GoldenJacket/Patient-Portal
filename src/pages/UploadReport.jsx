import { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Modal from '@mui/material/Modal';
import { supabase } from '../utils/supabaseClient';
import { extractTextFromPdf } from '../utils/pdfUtils';

const MAX_FILE_SIZE_MB = 10;

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function UploadReport({ userEmail }) {
  const [documents, setDocuments] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [viewLoadingId, setViewLoadingId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!userEmail) return;
    supabase
      .from('documents')
      .select('id, user_email, name, size, uploaded_at')
      .eq('user_email', userEmail)
      .order('uploaded_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setDocuments(data || []);
        setLoading(false);
      });
  }, [userEmail, refreshKey]);

  const handleFiles = async (files) => {
    setAlert(null);
    const validFiles = [];
    const rejected = [];
    Array.from(files).forEach((file) => {
      if (file.type !== 'application/pdf') {
        rejected.push(`${file.name} (not a PDF)`);
      } else if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        rejected.push(`${file.name} (exceeds ${MAX_FILE_SIZE_MB}MB limit)`);
      } else {
        validFiles.push(file);
      }
    });
    if (rejected.length) {
      setAlert({ type: 'error', message: `Rejected: ${rejected.join(', ')}` });
    }
    if (validFiles.length) {
      let successCount = 0;
      for (const file of validFiles) {
        let fileData;
        try {
          fileData = await fileToDataUrl(file);
        } catch {
          setAlert({ type: 'error', message: `Failed to read ${file.name}.` });
          continue;
        }
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .insert({ user_email: userEmail, name: file.name, size: file.size })
          .select('id')
          .single();
        if (docError) {
          setAlert({ type: 'error', message: `Failed to save ${file.name}: ${docError.message}` });
          continue;
        }
        const extractedText = await extractTextFromPdf(file);
        const { error: fileError } = await supabase
          .from('document_files')
          .insert({ document_id: docData.id, file_data: fileData, extracted_text: extractedText || null });
        if (fileError) {
          // Roll back the document row if file storage fails
          await supabase.from('documents').delete().eq('id', docData.id);
          setAlert({ type: 'error', message: `Failed to save ${file.name}: ${fileError.message}` });
        } else {
          successCount++;
        }
      }
      if (successCount > 0) {
        setAlert({ type: 'success', message: `${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully.` });
        setRefreshKey((k) => k + 1);
      }
    }
  };

  const handleView = async (doc) => {
    setViewLoadingId(doc.id);
    const { data, error } = await supabase
      .from('document_files')
      .select('file_data')
      .eq('document_id', doc.id)
      .single();
    setViewLoadingId(null);
    if (error || !data?.file_data) {
      setAlert({ type: 'error', message: 'Could not load this document.' });
      return;
    }
    // Convert data URL to a blob URL so the iframe can render it
    const response = await fetch(data.file_data);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    setViewingDoc({ name: doc.name, url: blobUrl });
  };

  const handleCloseViewer = () => {
    if (viewingDoc?.url) URL.revokeObjectURL(viewingDoc.url);
    setViewingDoc(null);
  };

  const handleDelete = async (doc) => {
    await supabase.from('documents').delete().eq('id', doc.id);
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
  };

  const handleDrop = (e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); };
  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = () => setDragActive(false);

  return (
    <Box p={4}>
      <Typography variant="h5" sx={{ mb: 0.5, color: '#134e4a', fontWeight: 600 }}>Upload Reports</Typography>
      <Typography sx={{ fontSize: '14px', color: '#0f766e', mb: 2 }}>Upload PDF medical documents. You can review and manage them below.</Typography>

      {alert && <Alert severity={alert.type} onClose={() => setAlert(null)} sx={{ mb: 2, borderRadius: '10px' }}>{alert.message}</Alert>}

      <Box
        onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        sx={{ background: dragActive ? '#ccfbf1' : '#f0fdfa', border: `2px dashed ${dragActive ? '#0d9488' : '#99f6e4'}`, borderRadius: '12px', padding: 4, textAlign: 'center', cursor: 'pointer', mb: 3, transition: 'all 0.2s', '&:hover': { background: '#ccfbf1', borderColor: '#0d9488' } }}
      >
        <input ref={fileInputRef} type="file" accept="application/pdf" multiple hidden onChange={(e) => { if (e.target.files.length) handleFiles(e.target.files); e.target.value = ''; }} />
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <Typography sx={{ color: '#134e4a', fontSize: '14px' }}><strong>Click to upload</strong> or drag and drop</Typography>
        <Typography sx={{ color: '#0f766e', fontSize: '12px', mt: 0.5 }}>PDF files only · Max {MAX_FILE_SIZE_MB}MB</Typography>
      </Box>

      <Box sx={{ background: '#f0fdfa', border: '0.5px solid #99f6e4', borderRadius: '12px', padding: 3 }}>
        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#0f766e', mb: 2 }}>
          Uploaded Documents ({documents.length})
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} sx={{ color: '#0d9488' }} />
          </Box>
        ) : documents.length === 0 ? (
          <Typography sx={{ color: '#0f766e', fontSize: '13px' }}>No documents uploaded yet.</Typography>
        ) : (
          documents.map((doc) => (
            <Box key={doc.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, background: '#ffffff', border: '0.5px solid #99f6e4', borderRadius: '10px', padding: '12px 16px', mb: 1.5 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
              <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontSize: '13px', color: '#134e4a', fontWeight: 500 }}>{doc.name}</Typography>
                <Typography sx={{ fontSize: '11px', color: '#0f766e' }}>{formatFileSize(doc.size)} · {formatDate(doc.uploaded_at)}</Typography>
              </Box>
              <Box
                onClick={() => handleView(doc)}
                sx={{ fontSize: '12px', color: '#0f766e', border: '0.5px solid #99f6e4', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5, '&:hover': { background: '#f0fdfa' } }}
              >
                {viewLoadingId === doc.id ? <CircularProgress size={10} sx={{ color: '#0d9488' }} /> : null}
                View
              </Box>
              <Box onClick={() => handleDelete(doc)} sx={{ fontSize: '12px', color: '#A32D2D', border: '0.5px solid #F7C1C1', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', '&:hover': { background: '#FCEBEB' } }}>
                Delete
              </Box>
            </Box>
          ))
        )}
      </Box>

      <Modal open={!!viewingDoc} onClose={handleCloseViewer}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '82vw', height: '90vh', background: '#fff', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 24 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5, borderBottom: '1px solid #e0f2f1', background: '#f0fdfa' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#134e4a' }}>{viewingDoc?.name}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box
                component="a"
                href={viewingDoc?.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontSize: '12px', color: '#0f766e', border: '0.5px solid #99f6e4', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', textDecoration: 'none', '&:hover': { background: '#ccfbf1' } }}
              >
                Open in new tab
              </Box>
              <Box onClick={handleCloseViewer} sx={{ fontSize: '12px', color: '#134e4a', border: '0.5px solid #99f6e4', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', '&:hover': { background: '#ccfbf1' } }}>
                Close
              </Box>
            </Box>
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <iframe
              src={viewingDoc?.url}
              title={viewingDoc?.name}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
