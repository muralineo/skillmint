# Course Content Feature - Setup Guide

## ✅ Completed

1. **Packages Installed**
   - `@monaco-editor/react` - Monaco Editor for React
   - `@mui/lab` - MUI TreeView components

2. **Database Schema Created**
   - File: `supabase_course_content.sql`
   - Tables:
     - `course_sessions` (id, course_id, session_number, topic, video_url, created_at)
     - `session_code_files` (id, session_id, file_name, file_content, language, created_at)
   - Row Level Security (RLS) policies configured
   - Indexes for performance

3. **API Helpers Created**
   - File: `src/lib/courseContent.js`
   - Functions for CRUD operations on sessions and code files
   - Language detection helper for Monaco Editor

4. **Components Created**
   - `src/components/MonacoEditorViewer.jsx` - Code editor with tabs and download
   - `src/components/CourseContentSidebar.jsx` - Collapsible tree view sidebar

5. **CourseDetail Page Updated**
   - Integrated sidebar and Monaco editor
   - Video URL display with "Watch Recording" button
   - File management (open, edit, download, close tabs)
   - Empty states handled

## 🔧 Next Steps - YOU NEED TO DO THESE

### Step 1: Run Database Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase_course_content.sql` from your project root
4. Copy and paste the entire SQL content
5. Click **Run** to create the tables and policies

### Step 2: Create Admin Page

You need to create an admin page to manage course content. Here's what's needed:

#### File to Create: `src/pages/admin/AdminCourseContent.jsx`

This page should include:
- **Sessions List**: Display all sessions for a course
- **Add/Edit Session Form**: 
  - Session number (integer > 0)
  - Topic (required)
  - Video URL (optional)
- **Code Files Manager**: For each session
  - File name (required, with extension)
  - Language dropdown (javascript, typescript, html, css, json, python, markdown, plaintext)
  - File content (multiline text area)
- **Delete Buttons** with confirmation dialogs
- **Validation**: Client-side validation + DB constraints

**Reference Implementation Outline:**

```jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
// Import MUI components as needed

export const AdminCourseContent = () => {
  // Check admin access
  // Manage sessions state
  // Manage files state
  // CRUD handlers
  // Render UI with forms and tables
};
```

### Step 3: Add Routing

You need to:
1. Check your `src/App.jsx` or equivalent routing file
2. Add a new route for the admin page:
   ```jsx
   <Route path="/admin/courses/:courseId/content" element={<AdminCourseContent />} />
   ```
3. Add navigation link from your existing admin area

### Step 4: Create Admin Route Protection (Optional but Recommended)

Create `src/components/ProtectedAdminRoute.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { checkIsAdmin } from '../lib/courseAccess';
import { CircularProgress, Box, Alert } from '@mui/material';

export const ProtectedAdminRoute = ({ children }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      const admin = await checkIsAdmin(user.id);
      setIsAdmin(admin);
      setLoading(false);
    };
    verifyAdmin();
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <Box p={4}>
        <Alert severity="error">Access Denied: Admin privileges required</Alert>
      </Box>
    );
  }

  return children;
};
```

### Step 5: Set Up Admin User

In your Supabase database, you need to mark at least one user as admin:

```sql
-- Run this in Supabase SQL Editor
UPDATE public.users
SET is_admin = true
WHERE email = 'your-admin-email@example.com';
```

Replace `'your-admin-email@example.com'` with your actual email.

### Step 6: Test the Feature

#### As Admin:
1. Go to `/admin/courses/{courseId}/content`
2. Add a session (e.g., Day 1: Introduction)
3. Add video URL (Zoho recording link)
4. Add code files (e.g., `app.js`, `index.html`, `styles.css`)
5. Edit and delete sessions/files

#### As Student (Approved User):
1. Go to `/courses/{courseId}`
2. Request access (if needed)
3. Admin approves access
4. View sidebar with sessions
5. Click video → opens Zoho URL
6. Click code file → opens in Monaco Editor
7. Edit code and download

## 📚 Key Features

### For Students:
- ✅ Collapsible sidebar showing course structure
- ✅ Day-wise sessions with topics
- ✅ Video lecture links (opens Zoho recordings)
- ✅ Code files viewer with Monaco Editor
- ✅ Full Monaco features (syntax highlighting, IntelliSense, etc.)
- ✅ Edit code locally (in-memory only)
- ✅ Download edited files
- ✅ Multiple file tabs
- ✅ No server persistence (download-only workflow)

### For Admins:
- ⏳ Manage sessions (add/edit/delete)
- ⏳ Upload/manage code files
- ⏳ Set video URLs
- ⏳ Organize content by days

## 🐛 Troubleshooting

### Database Issues
- **Error: relation "course_sessions" does not exist**
  → Run the SQL migration (Step 1)

- **Error: permission denied for table course_sessions**
  → Check RLS policies are correctly applied
  → Verify user has is_admin = true

### UI Issues
- **Monaco Editor not showing**
  → Check browser console for errors
  → Ensure @monaco-editor/react is installed
  → Check container has fixed height

- **Sidebar not visible**
  → Check sessions are loading
  → Check browser console for errors

### Access Issues
- **Students can't see content even after approval**
  → Check RLS policies on course_sessions and session_code_files
  → Verify course_access_requests status = 'approved'

## 📝 File Structure

```
src/
├── components/
│   ├── CourseContentSidebar.jsx  ✅
│   ├── MonacoEditorViewer.jsx    ✅
│   └── ProtectedAdminRoute.jsx    ⏳ (you need to create)
├── lib/
│   ├── courseContent.js           ✅
│   ├── courseAccess.js            ✅
│   └── supabaseClient.js          ✅
├── pages/
│   ├── CourseDetail.jsx           ✅
│   └── admin/
│       └── AdminCourseContent.jsx ⏳ (you need to create)
└── App.jsx                         ⏳ (you need to add routes)
```

## 🔒 Security Notes

1. **RLS Policies**: Already configured in SQL file
   - Students can only read sessions/files for approved courses
   - Only admins can create/update/delete

2. **File Downloads**: Client-side only
   - No server storage of student edits
   - Download uses Blob API

3. **Admin Verification**: Check `is_admin` flag before allowing management operations

## 🎨 Customization Ideas

- Change sidebar width (currently 280px open, 60px closed)
- Modify Monaco Editor theme
- Add file type icons in sidebar
- Add session progress tracking
- Add "Download All" button for session files
- Add search/filter in sidebar

## ❓ Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs for database errors
3. Verify all SQL migrations ran successfully
4. Ensure user has proper access rights

---

**Legend:**
- ✅ = Completed
- ⏳ = You need to implement

Good luck! 🚀
