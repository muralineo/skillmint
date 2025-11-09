-- Admin and Course Access Request System Setup
-- Run this in Supabase SQL Editor

-- Add is_admin column to public.users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create course_access_requests table
CREATE TABLE IF NOT EXISTS public.course_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Enable RLS on course_access_requests
ALTER TABLE public.course_access_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own requests
CREATE POLICY "Users can view their own course access requests"
ON public.course_access_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can create their own requests
CREATE POLICY "Users can create course access requests"
ON public.course_access_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all requests
CREATE POLICY "Admins can view all course access requests"
ON public.course_access_requests
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND is_admin = TRUE
    )
);

-- Policy: Admins can update requests
CREATE POLICY "Admins can update course access requests"
ON public.course_access_requests
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND is_admin = TRUE
    )
);

-- Update public.users policies to allow reading is_admin field
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_course_access_requests_user_id ON public.course_access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_course_access_requests_course_id ON public.course_access_requests(course_id);
CREATE INDEX IF NOT EXISTS idx_course_access_requests_status ON public.course_access_requests(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_course_access_requests_updated_at ON public.course_access_requests;
CREATE TRIGGER update_course_access_requests_updated_at
BEFORE UPDATE ON public.course_access_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Make yourself an admin (replace YOUR_EMAIL with your actual Google account email)
-- IMPORTANT: Update this with your email address!
UPDATE public.users
SET is_admin = TRUE
WHERE email = 'YOUR_EMAIL@gmail.com';

-- Verify setup
SELECT 'Tables created successfully!' as status;
SELECT * FROM public.users WHERE is_admin = TRUE;
