-- Fix infinite recursion in RLS policies
-- Run this in Supabase SQL Editor

-- Drop all existing policies on public.users
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Create non-recursive policies for public.users
-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Allow reading is_admin for checking admin status
-- This allows the admin check without recursion
CREATE POLICY "Allow reading is_admin column"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Now fix the course_access_requests policies to avoid recursion
-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins can view all course access requests" ON public.course_access_requests;
DROP POLICY IF EXISTS "Admins can update course access requests" ON public.course_access_requests;

-- Recreate them with a simpler check
-- We'll use a function that checks is_admin directly without triggering RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT is_admin
    FROM public.users
    WHERE id = auth.uid()
    LIMIT 1
  ) = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Admins can view all requests (using function)
CREATE POLICY "Admins view all requests"
ON public.course_access_requests
FOR SELECT
TO authenticated
USING (is_admin() = TRUE);

-- Policy: Admins can update requests (using function)
CREATE POLICY "Admins update requests"
ON public.course_access_requests
FOR UPDATE
TO authenticated
USING (is_admin() = TRUE);

-- Sync users from auth.users to public.users
INSERT INTO public.users (id, email, created_at)
SELECT id, email, created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email;

-- Set your email as admin (CHANGE THIS TO YOUR EMAIL!)
UPDATE public.users
SET is_admin = TRUE
WHERE email = 'YOUR_EMAIL@gmail.com';

-- Verify the setup
SELECT 'RLS policies fixed!' as status;
SELECT id, email, is_admin FROM public.users ORDER BY created_at DESC;
