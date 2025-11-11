import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardMedia,
  Paper,
  Link as MuiLink
} from '@mui/material';
import { ArrowBack, Lock, HourglassEmpty, CheckCircle, PlayCircleOutline } from '@mui/icons-material';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { checkCourseAccess, requestCourseAccess } from '../lib/courseAccess';
import { fetchCourseSessions, fetchSessionCodeFiles } from '../lib/courseContent';
import { CourseContentSidebar } from '../components/CourseContentSidebar';
import { MonacoEditorViewer } from '../components/MonacoEditorViewer';

export const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessStatus, setAccessStatus] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Course content state
  const [sessions, setSessions] = useState([]);
  const [filesBySession, setFilesBySession] = useState({});
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [errorSessions, setErrorSessions] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Content selection state
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedView, setSelectedView] = useState(null); // 'video' | 'code' | null
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);

  useEffect(() => {
    if (id && user) {
      fetchCourseAndAccess();
    }
  }, [id, user]);

  // Load course content when user has access
  useEffect(() => {
    if (accessStatus?.hasAccess && course?.id) {
      loadCourseContent();
    }
  }, [accessStatus?.hasAccess, course?.id]);

  const fetchCourseAndAccess = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Check access status
      const access = await checkCourseAccess(user.id, id);
      setAccessStatus(access);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseContent = async () => {
    try {
      setLoadingSessions(true);
      setErrorSessions(null);

      console.group('🔍 Loading Course Content');
      console.log('Course ID:', course.id);
      console.log('User ID:', user?.id);
      console.log('Access Status:', accessStatus);

      // Fetch all sessions for this course
      const sessionsData = await fetchCourseSessions(course.id);
      console.log('✅ Sessions fetched:', sessionsData.length, sessionsData);
      setSessions(sessionsData);

      // Fetch code files for each session
      const filesMap = {};
      for (const session of sessionsData) {
        const files = await fetchSessionCodeFiles(session.id);
        filesMap[session.id] = files;
        console.log(`📁 Files for session ${session.session_number}:`, files.length, files);
      }
      setFilesBySession(filesMap);
      console.log('✅ All files loaded:', filesMap);
      console.groupEnd();
    } catch (err) {
      console.error('❌ Error loading course content:', err);
      console.groupEnd();
      setErrorSessions(err.message || 'Failed to load course content');
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRequestAccess = async () => {
    setRequesting(true);
    const result = await requestCourseAccess(user.id, id);
    setRequesting(false);
    
    if (result.success) {
      setRequestSuccess(true);
      setAccessStatus({ hasAccess: false, status: 'pending', hasRequested: true });
    } else {
      setError(result.error);
    }
  };

  const handleSelectVideo = (session) => {
    setSelectedSessionId(session.id);
    setSelectedView('video');
  };

  const handleSelectFile = (file, session) => {
    setSelectedSessionId(session.id);
    setSelectedView('code');
    
    // Add file to openFiles if not already present
    if (!openFiles.find(f => f.id === file.id)) {
      setOpenFiles(prev => [...prev, file]);
    }
    setActiveFileId(file.id);
  };

  const handleChangeFileContent = (fileId, newContent) => {
    setOpenFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, file_content: newContent } : f
    ));
  };

  const handleActivateFile = (fileId) => {
    setActiveFileId(fileId);
  };

  const handleCloseFile = (fileId) => {
    setOpenFiles(prev => prev.filter(f => f.id !== fileId));
    if (activeFileId === fileId) {
      const remaining = openFiles.filter(f => f.id !== fileId);
      setActiveFileId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Error loading course: {error}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Back to Courses
        </Button>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Course not found</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Back to Courses
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/')}
        sx={{ mb: 3 }}
      >
        Back to Courses
      </Button>

      <Card>
        <CardMedia
          component="img"
          height="400"
          image={course.image_url || 'https://via.placeholder.com/600x400?text=Course'}
          alt={course.title}
        />
        <Box sx={{ p: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold', color: '#2e7d32' }}
          >
            {course.title}
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            {course.description}
          </Typography>

          {/* Access Control Section */}
          {!accessStatus?.hasAccess && (
            <Paper
              elevation={3}
              sx={{
                p: 3,
                mt: 3,
                bgcolor: accessStatus?.status === 'pending' ? '#fff3e0' : accessStatus?.status === 'rejected' ? '#ffebee' : '#e3f2fd',
                border: '2px solid',
                borderColor: accessStatus?.status === 'pending' ? '#ff9800' : accessStatus?.status === 'rejected' ? '#f44336' : '#2196f3'
              }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                {accessStatus?.status === 'pending' ? (
                  <HourglassEmpty sx={{ fontSize: 40, color: '#ff9800' }} />
                ) : accessStatus?.status === 'rejected' ? (
                  <Lock sx={{ fontSize: 40, color: '#f44336' }} />
                ) : (
                  <Lock sx={{ fontSize: 40, color: '#2196f3' }} />
                )}
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {accessStatus?.status === 'pending'
                      ? 'Access Request Pending'
                      : accessStatus?.status === 'rejected'
                      ? 'Access Request Rejected'
                      : 'Course Access Required'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {accessStatus?.status === 'pending'
                      ? 'Your request has been sent to the admin. You will be able to access this course once approved.'
                      : accessStatus?.status === 'rejected'
                      ? 'Your access request was rejected. Please contact the administrator for more information.'
                      : 'You need approval to access this course content.'}
                  </Typography>
                </Box>
              </Box>

              {requestSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle />
                    <Typography>
                      The request has been sent to the admin. You will soon be able to access the course after admin approval.
                    </Typography>
                  </Box>
                </Alert>
              )}

              {!accessStatus?.hasRequested && accessStatus?.status !== 'rejected' && (
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleRequestAccess}
                  disabled={requesting}
                  sx={{ mt: 1 }}
                >
                  {requesting ? 'Sending Request...' : 'Request Access'}
                </Button>
              )}
            </Paper>
          )}

          {/* Course Content - Only visible with access */}
          {/* Replaced placeholder with actual course content sidebar and viewer */}
          {accessStatus?.hasAccess && (
            <Box sx={{ mt: 4 }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircle />
                  <Typography>You have access to this course!</Typography>
                </Box>
              </Alert>
              
              {errorSessions && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Error loading content: {errorSessions}
                </Alert>
              )}

              {/* Course Content Layout with Sidebar and Main Area */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 0,
                  height: '70vh',
                  minHeight: 500,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                  bgcolor: 'background.default'
                }}
              >
                {/* Sidebar */}
                <CourseContentSidebar
                  open={sidebarOpen}
                  onToggle={() => setSidebarOpen(prev => !prev)}
                  sessions={sessions}
                  filesBySession={filesBySession}
                  onSelectVideo={handleSelectVideo}
                  onSelectFile={handleSelectFile}
                  loading={loadingSessions}
                />

                {/* Main Content Area */}
                <Box
                  sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    bgcolor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {loadingSessions ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <CircularProgress />
                    </Box>
                  ) : selectedView === 'video' ? (
                    // Video View
                    <Box p={4} display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                      {sessions.find(s => s.id === selectedSessionId)?.video_url ? (
                        <>
                          <PlayCircleOutline sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
                          <Typography variant="h5" gutterBottom fontWeight="bold">
                            {sessions.find(s => s.id === selectedSessionId)?.topic}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" mb={3}>
                            Day {sessions.find(s => s.id === selectedSessionId)?.session_number}
                          </Typography>
                          <Button
                            variant="contained"
                            size="large"
                            color="success"
                            startIcon={<PlayCircleOutline />}
                            component={MuiLink}
                            href={sessions.find(s => s.id === selectedSessionId)?.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ textTransform: 'none' }}
                          >
                            Watch Recording
                          </Button>
                        </>
                      ) : (
                        <Typography variant="body1" color="text.secondary">
                          No video URL available for this session.
                        </Typography>
                      )}
                    </Box>
                  ) : selectedView === 'code' ? (
                    // Monaco Editor View
                    <MonacoEditorViewer
                      openFiles={openFiles}
                      activeFileId={activeFileId}
                      onChangeContent={handleChangeFileContent}
                      onActivate={handleActivateFile}
                      onClose={handleCloseFile}
                    />
                  ) : (
                    // Welcome / Empty State
                    <Box p={4} display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                      <Typography variant="h6" gutterBottom color="text.secondary">
                        Welcome to {course.title}!
                      </Typography>
                      <Typography variant="body1" color="text.secondary" textAlign="center">
                        Select a video lecture or code file from the sidebar to get started.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Card>
    </Container>
  );
};
