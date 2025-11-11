import { useState } from 'react';
import { 
  Box, 
  IconButton, 
  Typography, 
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse
} from '@mui/material';
import {
  ExpandMore,
  ChevronRight,
  PlayArrow,
  Code as CodeIcon,
  MenuOpen,
  Menu as MenuIcon,
  InsertDriveFile,
  Folder,
  FolderOpen
} from '@mui/icons-material';

export const CourseContentSidebar = ({
  open = true,
  onToggle,
  sessions = [],
  filesBySession = {},
  onSelectVideo,
  onSelectFile,
  loading = false
}) => {
  const [expandedSessions, setExpandedSessions] = useState({});
  const [expandedCodeGroups, setExpandedCodeGroups] = useState({});

  const handleSessionToggle = (sessionId) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  const handleCodeGroupToggle = (sessionId) => {
    setExpandedCodeGroups(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  const handleVideoClick = (session) => {
    onSelectVideo(session);
  };

  const handleFileClick = (file, session) => {
    onSelectFile(file, session);
  };

  return (
    <Box
      sx={{
        width: open ? 280 : 60,
        minWidth: open ? 280 : 60,
        height: '100%',
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header with Toggle Button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          minHeight: 56
        }}
      >
        {open && (
          <Typography variant="h6" noWrap sx={{ fontWeight: 'bold', flexGrow: 1 }}>
            Contents
          </Typography>
        )}
        <IconButton onClick={onToggle} size="small">
          {open ? <MenuOpen /> : <MenuIcon />}
        </IconButton>
      </Box>

      {/* Content List */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress size={30} />
          </Box>
        ) : sessions.length === 0 ? (
          open && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
              No sessions published yet
            </Typography>
          )
        ) : (
          <List dense disablePadding>
            {sessions.map((session) => {
              const sessionFiles = filesBySession[session.id] || [];
              const isSessionExpanded = expandedSessions[session.id] || false;
              const isCodeGroupExpanded = expandedCodeGroups[session.id] || false;

              return (
                <Box key={session.id}>
                  {/* Session Header */}
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleSessionToggle(session.id)}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {isSessionExpanded ? <ExpandMore /> : <ChevronRight />}
                      </ListItemIcon>
                      {open && (
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight="bold">
                              Day {session.session_number}: {session.topic}
                            </Typography>
                          }
                        />
                      )}
                      {!open && (
                        <Typography variant="caption" fontWeight="bold">
                          {session.session_number}
                        </Typography>
                      )}
                    </ListItemButton>
                  </ListItem>

                  {/* Session Content (when expanded) */}
                  <Collapse in={isSessionExpanded} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {/* Video Item */}
                      {session.video_url && (
                        <ListItem disablePadding>
                          <ListItemButton
                            sx={{ pl: 4 }}
                            onClick={() => handleVideoClick(session)}
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <PlayArrow sx={{ fontSize: 20, color: 'success.main' }} />
                            </ListItemIcon>
                            {open && (
                              <ListItemText
                                primary={
                                  <Typography variant="body2">
                                    Video Lecture
                                  </Typography>
                                }
                              />
                            )}
                          </ListItemButton>
                        </ListItem>
                      )}

                      {/* Code Files Group */}
                      {sessionFiles.length > 0 && (
                        <>
                          <ListItem disablePadding>
                            <ListItemButton
                              sx={{ pl: 4 }}
                              onClick={() => handleCodeGroupToggle(session.id)}
                            >
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                {isCodeGroupExpanded ? <FolderOpen /> : <Folder />}
                              </ListItemIcon>
                              {open && (
                                <ListItemText
                                  primary={
                                    <Typography variant="body2">
                                      Code Files ({sessionFiles.length})
                                    </Typography>
                                  }
                                />
                              )}
                            </ListItemButton>
                          </ListItem>

                          {/* Individual Files */}
                          <Collapse in={isCodeGroupExpanded} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                              {sessionFiles.map((file) => (
                                <ListItem key={file.id} disablePadding>
                                  <ListItemButton
                                    sx={{ pl: 8 }}
                                    onClick={() => handleFileClick(file, session)}
                                  >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                      <InsertDriveFile sx={{ fontSize: 18 }} />
                                    </ListItemIcon>
                                    {open && (
                                      <ListItemText
                                        primary={
                                          <Typography variant="body2" noWrap>
                                            {file.file_name}
                                          </Typography>
                                        }
                                      />
                                    )}
                                  </ListItemButton>
                                </ListItem>
                              ))}
                            </List>
                          </Collapse>
                        </>
                      )}
                    </List>
                  </Collapse>
                </Box>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );
};
