import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  Box,
  Tabs,
  Tab,
  IconButton,
  Button,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Close as CloseIcon, Download as DownloadIcon } from '@mui/icons-material';
import { getLanguageFromFileName } from '../lib/courseContent';

/**
 * Download edited file to user's computer
 */
export const downloadEditedFile = (fileName, content) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const MonacoEditorViewer = ({
  openFiles = [],
  activeFileId,
  onChangeContent,
  onActivate,
  onClose
}) => {
  const theme = useTheme();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const monacoTheme = theme.palette.mode === 'dark' || prefersDarkMode ? 'vs-dark' : 'light';

  const activeFile = openFiles.find(f => f.id === activeFileId);
  const activeTabIndex = openFiles.findIndex(f => f.id === activeFileId);

  const handleTabChange = (event, newIndex) => {
    if (openFiles[newIndex]) {
      onActivate(openFiles[newIndex].id);
    }
  };

  const handleCloseTab = (fileId, event) => {
    event.stopPropagation();
    onClose(fileId);
  };

  const handleDownload = () => {
    if (activeFile) {
      downloadEditedFile(activeFile.file_name, activeFile.file_content);
    }
  };

  const handleEditorChange = (value) => {
    if (activeFile && value !== undefined) {
      onChangeContent(activeFile.id, value);
    }
  };

  if (openFiles.length === 0) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
        p={4}
      >
        <Typography variant="body1" color="text.secondary">
          Select a code file from the sidebar to view it here
        </Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {/* Tab Bar */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs
          value={activeTabIndex >= 0 ? activeTabIndex : 0}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 48 }}
        >
          {openFiles.map((file) => (
            <Tab
              key={file.id}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2">{file.file_name}</Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleCloseTab(file.id, e)}
                    sx={{ ml: 0.5, p: 0.5 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
              sx={{ textTransform: 'none', minHeight: 48 }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Toolbar with Download Button */}
      {activeFile && (
        <Toolbar variant="dense" sx={{ gap: 2, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" flexGrow={1}>
            {activeFile.file_name} ({activeFile.language})
          </Typography>
          <Button
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            size="small"
            variant="outlined"
          >
            Download
          </Button>
        </Toolbar>
      )}

      {/* Monaco Editor */}
      {activeFile && (
        <Box flexGrow={1} overflow="hidden">
          <Editor
            height="100%"
            language={getLanguageFromFileName(activeFile.file_name)}
            value={activeFile.file_content}
            onChange={handleEditorChange}
            theme={monacoTheme}
            options={{
              automaticLayout: true,
              wordWrap: 'on',
              minimap: { enabled: true },
              fontSize: 14,
              scrollBeyondLastLine: false,
              readOnly: false,
              lineNumbers: 'on',
              roundedSelection: true,
              cursorStyle: 'line',
              glyphMargin: false,
              folding: true,
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};
