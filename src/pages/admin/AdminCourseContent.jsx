import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack,
  VideoLibrary,
  Code as CodeIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { checkIsAdmin } from '../../lib/courseAccess';
import {
  fetchCourseSessions,
  fetchSessionCodeFiles,
  createSession,
  updateSession,
  deleteSession,
  createCodeFile,
  updateCodeFile,
  deleteCodeFile,
  getLanguageFromFileName
} from '../../lib/courseContent';

const LANGUAGES = [
  'javascript',
  'typescript',
  'html',
  'css',
  'json',
  'python',
  'markdown',
  'plaintext'
];

export const AdminCourseContent = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Access control
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Files state
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Dialog states
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'session' | 'file', id, name }

  // Form states
  const [sessionForm, setSessionForm] = useState({
    id: null,
    session_number: '',
    topic: '',
    video_url: ''
  });
  const [fileForm, setFileForm] = useState({
    id: null,
    file_name: '',
    file_content: '',
    language: 'javascript'
  });

  // UI states
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Check admin access
  useEffect(() => {
    const verifyAdmin = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      const admin = await checkIsAdmin(user.id);
      setIsAdmin(admin);
      setCheckingAccess(false);
      if (!admin) {
        showSnackbar('Access denied: Admin privileges required', 'error');
        setTimeout(() => navigate('/'), 2000);
      }
    };
    verifyAdmin();
  }, [user, navigate]);

  // Load sessions
  useEffect(() => {
    if (isAdmin && courseId) {
      loadSessions();
    }
  }, [isAdmin, courseId]);

  // Load files when session selected
  useEffect(() => {
    if (selectedSession) {
      loadFiles(selectedSession.id);
    }
  }, [selectedSession]);

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const data = await fetchCourseSessions(courseId);
      setSessions(data);
    } catch (err) {
      showSnackbar(`Error loading sessions: ${err.message}`, 'error');
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadFiles = async (sessionId) => {
    try {
      setLoadingFiles(true);
      const data = await fetchSessionCodeFiles(sessionId);
      setFiles(data);
    } catch (err) {
      showSnackbar(`Error loading files: ${err.message}`, 'error');
    } finally {
      setLoadingFiles(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Session handlers
  const handleOpenSessionDialog = (session = null) => {
    if (session) {
      setSessionForm({
        id: session.id,
        session_number: session.session_number,
        topic: session.topic,
        video_url: session.video_url || ''
      });
    } else {
      setSessionForm({
        id: null,
        session_number: sessions.length + 1,
        topic: '',
        video_url: ''
      });
    }
    setSessionDialogOpen(true);
  };

  const handleCloseSessionDialog = () => {
    setSessionDialogOpen(false);
    setSessionForm({ id: null, session_number: '', topic: '', video_url: '' });
  };

  const handleSaveSession = async () => {
    try {
      setSaving(true);
      
      // Validate
      if (!sessionForm.session_number || !sessionForm.topic) {
        showSnackbar('Session number and topic are required', 'error');
        return;
      }

      if (sessionForm.session_number <= 0) {
        showSnackbar('Session number must be greater than 0', 'error');
        return;
      }

      const sessionData = {
        session_number: parseInt(sessionForm.session_number),
        topic: sessionForm.topic,
        video_url: sessionForm.video_url || null
      };

      if (sessionForm.id) {
        await updateSession(sessionForm.id, sessionData);
        showSnackbar('Session updated successfully');
      } else {
        await createSession(courseId, sessionData);
        showSnackbar('Session created successfully');
      }

      handleCloseSessionDialog();
      loadSessions();
    } catch (err) {
      const errorMsg = err.message.includes('duplicate') 
        ? 'A session with this number already exists'
        : err.message;
      showSnackbar(`Error saving session: ${errorMsg}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSession = (session) => {
    setDeleteTarget({ type: 'session', id: session.id, name: `Day ${session.session_number}: ${session.topic}` });
    setDeleteDialogOpen(true);
  };

  // File handlers
  const handleOpenFileDialog = (file = null) => {
    if (file) {
      setFileForm({
        id: file.id,
        file_name: file.file_name,
        file_content: file.file_content,
        language: file.language
      });
    } else {
      setFileForm({
        id: null,
        file_name: '',
        file_content: '',
        language: 'javascript'
      });
    }
    setFileDialogOpen(true);
  };

  const handleCloseFileDialog = () => {
    setFileDialogOpen(false);
    setFileForm({ id: null, file_name: '', file_content: '', language: 'javascript' });
  };

  const handleSaveFile = async () => {
    try {
      setSaving(true);

      // Validate
      if (!fileForm.file_name || !fileForm.language) {
        showSnackbar('File name and language are required', 'error');
        return;
      }

      if (fileForm.file_name.includes('/') || fileForm.file_name.includes('\\')) {
        showSnackbar('File name cannot contain slashes', 'error');
        return;
      }

      if (!fileForm.file_name.includes('.')) {
        showSnackbar('File name must include an extension (e.g., .js, .html)', 'error');
        return;
      }

      const fileData = {
        file_name: fileForm.file_name,
        file_content: fileForm.file_content,
        language: fileForm.language
      };

      if (fileForm.id) {
        await updateCodeFile(fileForm.id, fileData);
        showSnackbar('File updated successfully');
      } else {
        await createCodeFile(selectedSession.id, fileData);
        showSnackbar('File created successfully');
      }

      handleCloseFileDialog();
      loadFiles(selectedSession.id);
    } catch (err) {
      const errorMsg = err.message.includes('duplicate')
        ? 'A file with this name already exists in this session'
        : err.message;
      showSnackbar(`Error saving file: ${errorMsg}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFile = (file) => {
    setDeleteTarget({ type: 'file', id: file.id, name: file.file_name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setSaving(true);
      if (deleteTarget.type === 'session') {
        await deleteSession(deleteTarget.id);
        showSnackbar('Session deleted successfully');
        if (selectedSession?.id === deleteTarget.id) {
          setSelectedSession(null);
          setFiles([]);
        }
        loadSessions();
      } else {
        await deleteCodeFile(deleteTarget.id);
        showSnackbar('File deleted successfully');
        loadFiles(selectedSession.id);
      }
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      showSnackbar(`Error deleting: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFileNameChange = (fileName) => {
    const detectedLanguage = getLanguageFromFileName(fileName);
    setFileForm(prev => ({
      ...prev,
      file_name: fileName,
      language: detectedLanguage
    }));
  };

  if (checkingAccess) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Access Denied: Admin privileges required</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/')}
        sx={{ mb: 3 }}
      >
        Back to Courses
      </Button>

      <Typography variant="h4" gutterBottom fontWeight="bold">
        Manage Course Content
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Course ID: {courseId}
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, mt: 4 }}>
        {/* Sessions Panel */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Sessions
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenSessionDialog()}
              >
                Add Session
              </Button>
            </Box>

            {loadingSessions ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : sessions.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                No sessions yet. Click "Add Session" to create one.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Day</TableCell>
                      <TableCell>Topic</TableCell>
                      <TableCell>Video</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow
                        key={session.id}
                        hover
                        selected={selectedSession?.id === session.id}
                        onClick={() => setSelectedSession(session)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{session.session_number}</TableCell>
                        <TableCell>{session.topic}</TableCell>
                        <TableCell>
                          {session.video_url ? (
                            <Chip icon={<VideoLibrary />} label="Yes" size="small" color="success" />
                          ) : (
                            <Chip label="No" size="small" />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenSessionDialog(session);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(session);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Files Panel */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Code Files
                {selectedSession && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    Day {selectedSession.session_number}: {selectedSession.topic}
                  </Typography>
                )}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenFileDialog()}
                disabled={!selectedSession}
              >
                Add File
              </Button>
            </Box>

            {!selectedSession ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                Select a session to manage its files
              </Typography>
            ) : loadingFiles ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : files.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                No files yet. Click "Add File" to create one.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>File Name</TableCell>
                      <TableCell>Language</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {files.map((file) => (
                      <TableRow key={file.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <CodeIcon fontSize="small" color="primary" />
                            {file.file_name}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={file.language} size="small" />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenFileDialog(file)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteFile(file)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Session Dialog */}
      <Dialog open={sessionDialogOpen} onClose={handleCloseSessionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {sessionForm.id ? 'Edit Session' : 'Add Session'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Session Number *"
              type="number"
              value={sessionForm.session_number}
              onChange={(e) => setSessionForm({ ...sessionForm, session_number: e.target.value })}
              fullWidth
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Topic *"
              value={sessionForm.topic}
              onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })}
              fullWidth
              placeholder="e.g., Introduction to React"
            />
            <TextField
              label="Video URL (Optional)"
              value={sessionForm.video_url}
              onChange={(e) => setSessionForm({ ...sessionForm, video_url: e.target.value })}
              fullWidth
              placeholder="https://..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSessionDialog}>Cancel</Button>
          <Button
            onClick={handleSaveSession}
            variant="contained"
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Dialog */}
      <Dialog open={fileDialogOpen} onClose={handleCloseFileDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {fileForm.id ? 'Edit File' : 'Add File'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="File Name *"
              value={fileForm.file_name}
              onChange={(e) => handleFileNameChange(e.target.value)}
              fullWidth
              placeholder="e.g., app.js, index.html, styles.css"
              helperText="Must include file extension"
            />
            <FormControl fullWidth>
              <InputLabel>Language *</InputLabel>
              <Select
                value={fileForm.language}
                onChange={(e) => setFileForm({ ...fileForm, language: e.target.value })}
                label="Language *"
              >
                {LANGUAGES.map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    {lang}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="File Content"
              value={fileForm.file_content}
              onChange={(e) => setFileForm({ ...fileForm, file_content: e.target.value })}
              fullWidth
              multiline
              rows={12}
              placeholder="Enter your code here..."
              sx={{ fontFamily: 'monospace' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFileDialog}>Cancel</Button>
          <Button
            onClick={handleSaveFile}
            variant="contained"
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {deleteTarget?.type === 'session' ? 'session' : 'file'}{' '}
            "<strong>{deleteTarget?.name}</strong>"?
          </Typography>
          {deleteTarget?.type === 'session' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This will also delete all code files associated with this session.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};
