import { supabase } from './supabaseClient';

/**
 * Fetch all sessions for a specific course, sorted by session number
 * @param {string} courseId - UUID of the course
 * @returns {Promise<Array>} Array of session objects
 */
export const fetchCourseSessions = async (courseId) => {
  const { data, error } = await supabase
    .from('course_sessions')
    .select('*')
    .eq('course_id', courseId)
    .order('session_number', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

/**
 * Fetch all code files for a specific session, sorted by file name
 * @param {string} sessionId - UUID of the session
 * @returns {Promise<Array>} Array of code file objects
 */
export const fetchSessionCodeFiles = async (sessionId) => {
  const { data, error } = await supabase
    .from('session_code_files')
    .select('*')
    .eq('session_id', sessionId)
    .order('file_name', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

/**
 * Create a new session for a course (admin only)
 * @param {string} courseId - UUID of the course
 * @param {Object} sessionData - { session_number, topic, video_url? }
 * @returns {Promise<Object>} Created session object
 */
export const createSession = async (courseId, sessionData) => {
  const payload = { ...sessionData, course_id: courseId };
  const { data, error } = await supabase
    .from('course_sessions')
    .insert([payload])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Update an existing session (admin only)
 * @param {string} sessionId - UUID of the session
 * @param {Object} sessionData - Fields to update { session_number?, topic?, video_url? }
 * @returns {Promise<Object>} Updated session object
 */
export const updateSession = async (sessionId, sessionData) => {
  const { data, error } = await supabase
    .from('course_sessions')
    .update(sessionData)
    .eq('id', sessionId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Delete a session and all its associated code files (admin only)
 * @param {string} sessionId - UUID of the session
 * @returns {Promise<boolean>} True if successful
 */
export const deleteSession = async (sessionId) => {
  const { error } = await supabase
    .from('course_sessions')
    .delete()
    .eq('id', sessionId);
  
  if (error) throw error;
  return true;
};

/**
 * Create a new code file for a session (admin only)
 * @param {string} sessionId - UUID of the session
 * @param {Object} fileData - { file_name, file_content, language }
 * @returns {Promise<Object>} Created file object
 */
export const createCodeFile = async (sessionId, fileData) => {
  const payload = { ...fileData, session_id: sessionId };
  const { data, error } = await supabase
    .from('session_code_files')
    .insert([payload])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Update an existing code file (admin only)
 * @param {string} fileId - UUID of the file
 * @param {Object} fileData - Fields to update { file_name?, file_content?, language? }
 * @returns {Promise<Object>} Updated file object
 */
export const updateCodeFile = async (fileId, fileData) => {
  const { data, error } = await supabase
    .from('session_code_files')
    .update(fileData)
    .eq('id', fileId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Delete a code file (admin only)
 * @param {string} fileId - UUID of the file
 * @returns {Promise<boolean>} True if successful
 */
export const deleteCodeFile = async (fileId) => {
  const { error } = await supabase
    .from('session_code_files')
    .delete()
    .eq('id', fileId);
  
  if (error) throw error;
  return true;
};

/**
 * Get Monaco Editor language ID from file extension
 * @param {string} fileName - File name with extension
 * @returns {string} Monaco language ID
 */
export const getLanguageFromFileName = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  const languageMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'json': 'json',
    'py': 'python',
    'md': 'markdown',
    'txt': 'plaintext',
    'xml': 'xml',
    'yml': 'yaml',
    'yaml': 'yaml',
    'sh': 'shell',
    'bash': 'shell',
  };
  return languageMap[ext] || 'plaintext';
};
