import { useState } from 'react';
import { Box, IconButton, Typography, CircularProgress } from '@mui/material';
import { TreeView, TreeItem } from '@mui/lab';
import {
  ExpandMore,
  ChevronRight,
  PlayArrow,
  Code as CodeIcon,
  MenuOpen,
  Menu as MenuIcon,
  InsertDriveFile
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
  const [expanded, setExpanded] = useState([]);

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
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

      {/* Tree View Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: open ? 1 : 0.5 }}>
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
          <TreeView
            aria-label="course contents navigator"
            defaultCollapseIcon={<ExpandMore />}
            defaultExpandIcon={<ChevronRight />}
            expanded={expanded}
            onNodeToggle={handleToggle}
            sx={{ flexGrow: 1 }}
          >
            {sessions.map((session) => {
              const sessionFiles = filesBySession[session.id] || [];
              const sessionNodeId = `session-${session.id}`;
              const videoNodeId = `video-${session.id}`;
              const codeGroupNodeId = `code-group-${session.id}`;

              return (
                <TreeItem
                  key={session.id}
                  nodeId={sessionNodeId}
                  label={
                    open ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Day {session.session_number}: {session.topic}
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Typography variant="caption" fontWeight="bold">
                          {session.session_number}
                        </Typography>
                      </Box>
                    )
                  }
                >
                  {/* Video Node */}
                  {session.video_url && (
                    <TreeItem
                      nodeId={videoNodeId}
                      label={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            py: 0.5,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                          onClick={() => handleVideoClick(session)}
                        >
                          <PlayArrow sx={{ mr: 1, fontSize: 18, color: 'success.main' }} />
                          {open && (
                            <Typography variant="body2">Video Lecture</Typography>
                          )}
                        </Box>
                      }
                    />
                  )}

                  {/* Code Files Group */}
                  {sessionFiles.length > 0 && (
                    <TreeItem
                      nodeId={codeGroupNodeId}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
                          <CodeIcon sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} />
                          {open && (
                            <Typography variant="body2">Code Files</Typography>
                          )}
                        </Box>
                      }
                    >
                      {sessionFiles.map((file) => (
                        <TreeItem
                          key={file.id}
                          nodeId={`file-${file.id}`}
                          label={
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                py: 0.5,
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'action.hover' }
                              }}
                              onClick={() => handleFileClick(file, session)}
                            >
                              <InsertDriveFile sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                              {open && (
                                <Typography variant="body2" noWrap>
                                  {file.file_name}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      ))}
                    </TreeItem>
                  )}
                </TreeItem>
              );
            })}
          </TreeView>
        )}
      </Box>
    </Box>
  );
};
