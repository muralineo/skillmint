# Debug Course Content Not Showing

## Quick Diagnosis Steps

### Step 1: Check Browser Console
Open your browser's Developer Tools (F12) and check the Console tab for errors.

### Step 2: Verify User Access in Database

Run this SQL in Supabase SQL Editor:

```sql
-- Check if user has approved access
SELECT 
  car.id,
  car.user_id,
  car.course_id,
  car.status,
  car.created_at,
  u.email as user_email,
  c.title as course_title
FROM course_access_requests car
LEFT JOIN users u ON u.id = car.user_id
LEFT JOIN courses c ON c.id = car.course_id
WHERE car.course_id = 'YOUR_COURSE_ID_HERE'
ORDER BY car.created_at DESC;
```

**Expected Result:** Status should be `'approved'` for the user who should see content.

### Step 3: Check if Sessions Exist

```sql
-- Check sessions for the course
SELECT 
  cs.id,
  cs.course_id,
  cs.session_number,
  cs.topic,
  cs.video_url,
  cs.created_at,
  c.title as course_title
FROM course_sessions cs
LEFT JOIN courses c ON c.id = cs.course_id
WHERE cs.course_id = 'YOUR_COURSE_ID_HERE'
ORDER BY cs.session_number;
```

**Expected Result:** You should see the sessions you created.

### Step 4: Check if Code Files Exist

```sql
-- Check code files for sessions
SELECT 
  scf.id,
  scf.session_id,
  scf.file_name,
  scf.language,
  LENGTH(scf.file_content) as content_length,
  cs.session_number,
  cs.topic
FROM session_code_files scf
LEFT JOIN course_sessions cs ON cs.id = scf.session_id
WHERE cs.course_id = 'YOUR_COURSE_ID_HERE'
ORDER BY cs.session_number, scf.file_name;
```

**Expected Result:** You should see the code files you uploaded.

### Step 5: Test RLS Policies

Run this as the user who should see content (replace USER_ID):

```sql
-- Test if user can read sessions (simulating RLS)
SELECT 
  cs.*,
  EXISTS (
    SELECT 1
    FROM course_access_requests car
    WHERE car.course_id = cs.course_id
      AND car.user_id = 'USER_ID_HERE'  -- Replace with actual user ID
      AND car.status = 'approved'
  ) as has_access
FROM course_sessions cs
WHERE cs.course_id = 'YOUR_COURSE_ID_HERE';
```

**Expected Result:** `has_access` column should be `true`.

### Step 6: Check RLS Policies Are Enabled

```sql
-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('course_sessions', 'session_code_files');
```

**Expected Result:** Both tables should show `rowsecurity = true`.

### Step 7: List All Policies

```sql
-- List RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('course_sessions', 'session_code_files')
ORDER BY tablename, policyname;
```

**Expected Result:** You should see 4 policies per table (SELECT, INSERT, UPDATE, DELETE).

## Common Issues & Fixes

### Issue 1: User Not Approved
**Symptom:** User can't see sessions even though they exist

**Fix:**
```sql
-- Approve the user's access
UPDATE course_access_requests
SET status = 'approved'
WHERE user_id = 'USER_ID_HERE'
  AND course_id = 'COURSE_ID_HERE';
```

### Issue 2: RLS Policies Not Applied
**Symptom:** Policies missing in Step 7

**Fix:** Re-run the `supabase_course_content.sql` file, specifically the RLS policies section.

### Issue 3: Wrong User ID
**Symptom:** User sees "You have access" but no sessions

**Fix:** Verify the user ID matches:
```sql
-- Get user ID from email
SELECT id, email FROM users WHERE email = 'user@example.com';

-- Check if course_access_requests uses correct user_id
SELECT * FROM course_access_requests WHERE user_id = 'CORRECT_USER_ID';
```

### Issue 4: Network/API Errors
**Symptom:** Console shows 401/403 errors

**Fix:** 
1. Check if user is logged in
2. Verify Supabase API keys are correct
3. Check if RLS policies are too restrictive

### Issue 5: React State Not Updating
**Symptom:** Sessions load in network tab but don't display

**Fix:** Add debug logging to CourseDetail.jsx:

Add this after line 92 in CourseDetail.jsx:
```javascript
console.log('Sessions loaded:', sessionsData);
console.log('Access status:', accessStatus);
console.log('Has access:', accessStatus?.hasAccess);
```

And after line 100:
```javascript
console.log('Files loaded:', filesMap);
```

### Issue 6: Empty Arrays Returned
**Symptom:** API returns `[]` but data exists in database

**Fix:** The RLS policy might be blocking the read. Temporarily test without RLS:

```sql
-- TEMPORARILY disable RLS for testing (DON'T DO THIS IN PRODUCTION)
ALTER TABLE course_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE session_code_files DISABLE ROW LEVEL SECURITY;

-- After testing, re-enable:
ALTER TABLE course_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_code_files ENABLE ROW LEVEL SECURITY;
```

## Quick Fix: Verify Everything

Run this comprehensive check:

```sql
-- Complete diagnostic query
WITH user_access AS (
  SELECT 
    car.user_id,
    car.course_id,
    car.status,
    u.email
  FROM course_access_requests car
  LEFT JOIN users u ON u.id = car.user_id
  WHERE car.course_id = 'YOUR_COURSE_ID_HERE'
)
SELECT 
  'User Access' as check_type,
  ua.email,
  ua.status,
  CASE WHEN ua.status = 'approved' THEN '✅ PASS' ELSE '❌ FAIL - Not Approved' END as result
FROM user_access ua

UNION ALL

SELECT 
  'Sessions Exist' as check_type,
  cs.topic,
  cs.session_number::text,
  CASE WHEN COUNT(*) > 0 THEN '✅ PASS' ELSE '❌ FAIL - No Sessions' END as result
FROM course_sessions cs
WHERE cs.course_id = 'YOUR_COURSE_ID_HERE'
GROUP BY cs.id, cs.topic, cs.session_number

UNION ALL

SELECT 
  'Code Files Exist' as check_type,
  scf.file_name,
  cs.session_number::text,
  CASE WHEN COUNT(*) > 0 THEN '✅ PASS' ELSE '❌ FAIL - No Files' END as result
FROM session_code_files scf
LEFT JOIN course_sessions cs ON cs.id = scf.session_id
WHERE cs.course_id = 'YOUR_COURSE_ID_HERE'
GROUP BY scf.id, scf.file_name, cs.session_number;
```

## Still Not Working?

If you've tried everything above and it's still not working, add this temporary debug output to your CourseDetail.jsx:

**After line 105**, add:
```javascript
console.group('🔍 Course Content Debug');
console.log('Course ID:', course?.id);
console.log('User ID:', user?.id);
console.log('Access Status:', accessStatus);
console.log('Sessions Loaded:', sessions.length, sessions);
console.log('Files by Session:', filesBySession);
console.log('Loading Sessions:', loadingSessions);
console.log('Error Sessions:', errorSessions);
console.groupEnd();
```

Then check your browser console and share what you see!

## Contact Debug Info

When asking for help, provide:
1. Browser console errors (if any)
2. Results from Step 2, 3, and 4 SQL queries
3. User email and course ID you're testing with
4. Screenshot of the page showing the issue
