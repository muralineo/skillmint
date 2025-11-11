-- ===============================================
-- COURSE CONTENT DIAGNOSTIC SCRIPT
-- Run this in Supabase SQL Editor to diagnose why content isn't showing
-- ===============================================

-- STEP 1: List all courses
-- Copy the course_id you're testing with
SELECT 
  '📚 COURSES' as section,
  id as course_id,
  title,
  created_at
FROM courses
ORDER BY created_at DESC;

-- STEP 2: Check if sessions exist for your course
-- Replace 'YOUR_COURSE_ID' with actual course ID from STEP 1
SELECT 
  '📝 SESSIONS' as section,
  id as session_id,
  session_number,
  topic,
  video_url,
  CASE WHEN video_url IS NOT NULL THEN '✅ Has Video' ELSE '❌ No Video' END as video_status,
  created_at
FROM course_sessions
WHERE course_id = 'YOUR_COURSE_ID'  -- ⚠️ REPLACE THIS
ORDER BY session_number;

-- STEP 3: Check if code files exist for sessions
-- Replace 'YOUR_COURSE_ID' with actual course ID
SELECT 
  '📁 CODE FILES' as section,
  cs.session_number as day,
  cs.topic,
  scf.file_name,
  scf.language,
  LENGTH(scf.file_content) as file_size_bytes,
  CASE WHEN scf.file_content IS NOT NULL THEN '✅ Has Content' ELSE '❌ Empty' END as content_status
FROM session_code_files scf
JOIN course_sessions cs ON cs.id = scf.session_id
WHERE cs.course_id = 'YOUR_COURSE_ID'  -- ⚠️ REPLACE THIS
ORDER BY cs.session_number, scf.file_name;

-- STEP 4: Check user access status
-- Replace 'YOUR_COURSE_ID' with actual course ID
SELECT 
  '🔐 USER ACCESS' as section,
  u.email,
  car.status,
  CASE 
    WHEN car.status = 'approved' THEN '✅ APPROVED - Should see content'
    WHEN car.status = 'pending' THEN '⏳ PENDING - Needs admin approval'
    WHEN car.status = 'rejected' THEN '❌ REJECTED - Cannot access'
    ELSE '❓ UNKNOWN STATUS'
  END as access_status,
  car.created_at as requested_at,
  car.updated_at as status_changed_at
FROM course_access_requests car
JOIN users u ON u.id = car.user_id
WHERE car.course_id = 'YOUR_COURSE_ID'  -- ⚠️ REPLACE THIS
ORDER BY car.created_at DESC;

-- STEP 5: Check RLS policies are enabled
SELECT 
  '🛡️ RLS STATUS' as section,
  tablename,
  CASE WHEN rowsecurity THEN '✅ Enabled' ELSE '❌ Disabled' END as rls_status
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('course_sessions', 'session_code_files')
ORDER BY tablename;

-- STEP 6: List RLS policies
SELECT 
  '📋 RLS POLICIES' as section,
  tablename,
  policyname,
  cmd as operation,
  CASE WHEN permissive = 'PERMISSIVE' THEN '✅' ELSE '❌' END as permissive
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('course_sessions', 'session_code_files')
ORDER BY tablename, cmd;

-- ===============================================
-- QUICK FIX QUERIES (Run if needed)
-- ===============================================

-- FIX 1: Approve a user's access
-- Uncomment and replace placeholders
/*
UPDATE course_access_requests
SET status = 'approved', updated_at = NOW()
WHERE user_id = 'USER_ID_HERE'  -- ⚠️ REPLACE
  AND course_id = 'COURSE_ID_HERE';  -- ⚠️ REPLACE
*/

-- FIX 2: Find user ID by email
/*
SELECT id, email FROM users WHERE email = 'user@example.com';
*/

-- FIX 3: Verify current user can access (test RLS)
-- This simulates what the app sees
/*
SELECT 
  cs.*,
  EXISTS (
    SELECT 1
    FROM course_access_requests car
    WHERE car.course_id = cs.course_id
      AND car.user_id = auth.uid()
      AND car.status = 'approved'
  ) as should_see_this
FROM course_sessions cs
WHERE cs.course_id = 'YOUR_COURSE_ID';
*/
