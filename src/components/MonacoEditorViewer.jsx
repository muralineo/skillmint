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
  useMediaQuery,
  Paper,
  Divider
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Download as DownloadIcon, 
  PlayArrow as RunIcon,
  Terminal as TerminalIcon
} from '@mui/icons-material';
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
  
  // Console output state
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [showConsole, setShowConsole] = useState(false);

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

  const handleRunCode = () => {
    if (!activeFile) return;
    
    // Only run JavaScript/TypeScript files
    const language = getLanguageFromFileName(activeFile.file_name);
    if (!['javascript', 'typescript'].includes(language)) {
      setConsoleOutput([{ type: 'error', message: 'Only JavaScript files can be executed' }]);
      setShowConsole(true);
      return;
    }

    setConsoleOutput([]);
    setShowConsole(true);
    
    const outputs = [];
    
    // Override console methods to capture output
    const captureConsole = {
      log: (...args) => outputs.push({ type: 'log', message: args.map(String).join(' ') }),
      error: (...args) => outputs.push({ type: 'error', message: args.map(String).join(' ') }),
      warn: (...args) => outputs.push({ type: 'warn', message: args.map(String).join(' ') }),
      info: (...args) => outputs.push({ type: 'info', message: args.map(String).join(' ') })
    };
    
    try {
      // Create a function with captured console
      const code = activeFile.file_content;
      const func = new Function('console', code);
      
      // Execute the code
      func(captureConsole);
      
      if (outputs.length === 0) {
        outputs.push({ type: 'info', message: '✓ Code executed successfully (no output)' });
      }
    } catch (error) {
      outputs.push({ type: 'error', message: `Error: ${error.message}` });
    }
    
    setConsoleOutput(outputs);
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

      {/* Toolbar with Run and Download Buttons */}
      {activeFile && (
        <Toolbar variant="dense" sx={{ gap: 2, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" flexGrow={1}>
            {activeFile.file_name} ({activeFile.language})
          </Typography>
          {['javascript', 'typescript'].includes(getLanguageFromFileName(activeFile.file_name)) && (
            <Button
              startIcon={<RunIcon />}
              onClick={handleRunCode}
              size="small"
              variant="contained"
              color="success"
            >
              Run Code
            </Button>
          )}
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
        <Box 
          flexGrow={1} 
          overflow="hidden"
          display="flex"
          flexDirection="column"
          height={showConsole ? '60%' : '100%'}
        >
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

      {/* Console Output */}
      {showConsole && (
        <Box 
          sx={{ 
            height: '40%',
            borderTop: 2,
            borderColor: 'divider',
            bgcolor: monacoTheme === 'vs-dark' ? '#1e1e1e' : '#f5f5f5',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              p: 1, 
              bgcolor: monacoTheme === 'vs-dark' ? '#252526' : '#e0e0e0',
              borderBottom: 1,
              borderColor: 'divider'
            }}
          >
            <TerminalIcon fontSize="small" />
            <Typography variant="body2" fontWeight="bold" flexGrow={1}>
              Console Output
            </Typography>
            <IconButton size="small" onClick={() => setShowConsole(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box 
            sx={{ 
              flexGrow: 1, 
              overflow: 'auto', 
              p: 2,
              fontFamily: 'monospace',
              fontSize: '13px'
            }}
          >
            {consoleOutput.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Run your code to see output here...
              </Typography>
            ) : (
              consoleOutput.map((output, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    mb: 0.5,
                    color: output.type === 'error' ? '#f44336' : 
                           output.type === 'warn' ? '#ff9800' : 
                           output.type === 'info' ? '#2196f3' :
                           monacoTheme === 'vs-dark' ? '#d4d4d4' : '#000',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {output.type === 'error' && '❌ '}
                  {output.type === 'warn' && '⚠️ '}
                  {output.type === 'info' && 'ℹ️ '}
                  {output.message}
                </Box>
              ))
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};
