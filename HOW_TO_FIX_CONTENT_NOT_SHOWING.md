# Why Course Content Isn't Showing - Diagnosis & Fix Guide

## 🔍 Quick Diagnosis Checklist

Follow these steps in order to identify the issue:

### Step 1: Open Browser Console (F12)
1. Open the course detail page where content should appear
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Look for debug output starting with "🔍 Loading Course Content"

**What you should see:**
```
🔍 Loading Course Content
  Course ID: <your-course-id>
  User ID: <your-user-id>
  Access Status: {hasAccess: true, status: 'approved'}
  ✅ Sessions fetched: 5 [Array of sessions]
  📁 Files for session 1: 3 [Array of files]
  ...
  ✅ All files loaded: {Object with files by session}
```

### Step 2: Check What's Missing

**If you see "Access Status: {hasAccess: false}"**
- ❌ **Issue:** User doesn't have approved access
- ✅ **Solution:** Go to [Step 3 - Fix User Access](#step-3-fix-user-access-most-common-issue)

**If you see "Sessions fetched: 0 []"**
- ❌ **Issue:** No sessions exist in database OR RLS is blocking access
- ✅ **Solution:** Go to [Step 4 - Verify Sessions Exist](#step-4-verify-sessions-exist)

**If you see "Files for session X: 0 []"**
- ❌ **Issue:** No files uploaded OR RLS is blocking file access
- ✅ **Solution:** Go to [Step 5 - Verify Files Exist](#step-5-verify-files-exist)

**If you see errors in red**
- ❌ **Issue:** Database or RLS error
- ✅ **Solution:** Go to [Step 6 - Fix RLS Policies](#step-6-fix-rls-policies)

---

## 🔧 FIXES

### Step 3: Fix User Access (MOST COMMON ISSUE)

**Run the diagnostic SQL first:**
1. Open **Supabase Dashboard** → **SQL Editor**
2. Open the file `diagnose_course_content.sql` I created
3. Replace `'YOUR_COURSE_ID'` with your actual course ID (keep the quotes)
4. Click **Run**
5. Look at the "🔐 USER ACCESS" section

**If status is 'pending' or 'rejected':**

```sql
-- Get the user's ID from their email
SELECT id, email FROM users WHERE email = 'user@example.com';
-- Copy the 'id' value

-- Approve the user for the course
UPDATE course_access_requests
SET status = 'approved', updated_at = NOW()
WHERE user_id = 'PASTE_USER_ID_HERE'
  AND course_id = 'YOUR_COURSE_ID_HERE';
```

**If no access request exists at all:**
1. User must first request access from the course detail page
2. Admin must approve it OR run the SQL above to approve

---

### Step 4: Verify Sessions Exist

**Check if you've created sessions:**

```sql
-- See all sessions for your course
SELECT 
  id,
  session_number,
  topic,
  video_url,
  created_at
FROM course_sessions
WHERE course_id = 'YOUR_COURSE_ID'
ORDER BY session_number;
```

**If you see 0 rows:**
- You need to create sessions first!
- Go to: **Admin Panel** → `/admin/courses/{courseId}/content`
- Click **"Add Session"**
- Fill in:
  - Session Number: 1
  - Topic: "Day 1: Introduction"
  - Video URL: (optional, your Zoho link)
- Click **Save**

**If you see sessions but users can't see them:**
- RLS policies might be blocking access
- Go to [Step 6 - Fix RLS Policies](#step-6-fix-rls-policies)

---

### Step 5: Verify Files Exist

**Check if files are uploaded:**

```sql
-- See all files for your course
SELECT 
  cs.session_number,
  cs.topic,
  scf.file_name,
  scf.language,
  LENGTH(scf.file_content) as content_size
FROM session_code_files scf
JOIN course_sessions cs ON cs.id = scf.session_id
WHERE cs.course_id = 'YOUR_COURSE_ID'
ORDER BY cs.session_number, scf.file_name;
```

**If you see 0 rows:**
- You need to upload files!
- Go to: **Admin Panel** → `/admin/courses/{courseId}/content`
- Click on a session in the left panel
- Click **"Add File"** in the right panel
- Fill in:
  - File Name: "app.js" (must include extension)
  - Language: Will auto-detect from extension
  - File Content: Paste your code
- Click **Save**

**If you see files but users can't see them:**
- RLS policies might be blocking access
- Go to [Step 6 - Fix RLS Policies](#step-6-fix-rls-policies)

---

### Step 6: Fix RLS Policies

**Check if RLS is causing the issue:**

```sql
-- Test if RLS policies are working
-- This checks if the tables have RLS enabled
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('course_sessions', 'session_code_files');
```

**Expected result:** Both should show `rowsecurity = true`

**If RLS is enabled but queries return empty arrays:**

The RLS policies might be too restrictive. Check if the policies exist:

```sql
-- List all policies
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('course_sessions', 'session_code_files')
ORDER BY tablename, policyname;
```

**You should see these policies:**
- `course_sessions`: SELECT, INSERT, UPDATE, DELETE policies
- `session_code_files`: SELECT, INSERT, UPDATE, DELETE policies

**If policies are missing:**
1. Open `supabase_course_content.sql` from your project root
2. Go to **Supabase Dashboard** → **SQL Editor**
3. Copy and paste the entire SQL file
4. Click **Run**

---

### Step 7: Complete Verification Script

Run this comprehensive check to see the full picture:

```sql
-- 1. Check course exists
SELECT 'Course' as item, id, title FROM courses WHERE id = 'YOUR_COURSE_ID';

-- 2. Check sessions exist
SELECT 'Sessions' as item, COUNT(*) as count 
FROM course_sessions 
WHERE course_id = 'YOUR_COURSE_ID';

-- 3. Check files exist
SELECT 'Files' as item, COUNT(*) as count 
FROM session_code_files scf
JOIN course_sessions cs ON cs.id = scf.session_id
WHERE cs.course_id = 'YOUR_COURSE_ID';

-- 4. Check user access
SELECT 
  'User Access' as item,
  u.email,
  car.status,
  car.created_at
FROM course_access_requests car
JOIN users u ON u.id = car.user_id
WHERE car.course_id = 'YOUR_COURSE_ID'
ORDER BY car.created_at DESC;

-- 5. Test if current user can read sessions (simulates what app sees)
SELECT 
  'Can Read Sessions' as item,
  COUNT(*) as sessions_visible
FROM course_sessions cs
WHERE cs.course_id = 'YOUR_COURSE_ID';
```

---

## 🎯 Most Common Issue & Quick Fix

**90% of the time, the issue is:**
❌ User has NOT been approved for course access

**Quick Fix:**
```sql
-- 1. Find user ID
SELECT id, email FROM users WHERE email = 'REPLACE_WITH_USER_EMAIL';

-- 2. Approve access
UPDATE course_access_requests
SET status = 'approved', updated_at = NOW()
WHERE user_id = 'REPLACE_WITH_USER_ID_FROM_STEP_1'
  AND course_id = 'REPLACE_WITH_COURSE_ID';
```

After running this:
1. Refresh the course detail page
2. User should now see green "You have access" message
3. Sessions and files should appear in sidebar

---

## 📋 How to Get Course ID and User Email

### Get Course ID:
**Option 1 - From URL:**
- Open the course detail page
- Look at browser URL: `/courses/<THIS_IS_YOUR_COURSE_ID>`
- Copy the UUID after `/courses/`

**Option 2 - From Database:**
```sql
SELECT id, title FROM courses ORDER BY created_at DESC;
```

### Get User Email:
**Option 1 - From User:**
- Ask the user what email they signed up with

**Option 2 - From Database:**
```sql
-- See all users
SELECT id, email, created_at FROM users ORDER BY created_at DESC;

-- See users who requested access
SELECT DISTINCT u.email
FROM course_access_requests car
JOIN users u ON u.id = car.user_id
ORDER BY u.email;
```

---

## 🚀 Step-by-Step: Adding Your First Course Content

1. **Become an Admin** (if not already):
   ```sql
   UPDATE users SET is_admin = true WHERE email = 'your@email.com';
   ```

2. **Create a Course** (if not exists):
   - Go to home page, courses should be listed
   - Note the course ID from URL

3. **Go to Admin Content Panel**:
   - Navigate to: `http://localhost:5173/admin/courses/{courseId}/content`
   - Replace `{courseId}` with your actual course ID

4. **Add a Session**:
   - Click "Add Session"
   - Session Number: 1
   - Topic: "Introduction to Course"
   - Video URL: (paste your Zoho recording link)
   - Click "Save"

5. **Add Code Files**:
   - Click the session you just created (in left panel)
   - Click "Add File" (in right panel)
   - File Name: "index.html"
   - Language: "html" (auto-detected)
   - File Content: Paste your HTML code
   - Click "Save"
   - Repeat for more files (app.js, styles.css, etc.)

6. **Approve User Access**:
   ```sql
   -- Get user ID
   SELECT id FROM users WHERE email = 'student@email.com';
   
   -- Approve access
   UPDATE course_access_requests
   SET status = 'approved'
   WHERE user_id = '<USER_ID>' AND course_id = '<COURSE_ID>';
   ```

7. **Test as Student**:
   - Log in as the student user
   - Go to course detail page
   - You should see:
     - ✅ Green "You have access" message
     - 📚 Sidebar with sessions
     - 📁 Code files under each session
     - 🎥 Video icon for sessions with video URLs

---

## 🐛 Still Not Working?

If you've tried everything above and it's still not working:

1. **Check browser console** (F12) for exact error messages
2. **Run the diagnostic SQL** in `diagnose_course_content.sql`
3. **Share these details:**
   - Course ID
   - User email
   - Console output from browser
   - Results from diagnostic SQL
   - Screenshots of the issue

---

## 📞 Debug Commands for Support

If asking for help, run these and share results:

```sql
-- Complete diagnostic dump
SELECT 'COURSE' as type, id, title FROM courses WHERE id = 'YOUR_COURSE_ID'
UNION ALL
SELECT 'SESSIONS', id::text, 'Count: ' || COUNT(*)::text FROM course_sessions WHERE course_id = 'YOUR_COURSE_ID' GROUP BY id
UNION ALL
SELECT 'ACCESS', u.email, car.status FROM course_access_requests car JOIN users u ON u.id = car.user_id WHERE car.course_id = 'YOUR_COURSE_ID';
```

Good luck! 🍀
