-- SkillMint - Fix Authentication Issue
-- Run this in Supabase SQL Editor to fix the "Database error saving new user" issue

-- The auth.users table is automatically created by Supabase, but we need to ensure
-- the auth schema and related objects have proper permissions

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO anon;

-- Ensure the auth.users table exists and has proper permissions
-- (This is usually automatic, but let's verify)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
        RAISE NOTICE 'auth.users table does not exist - Supabase should create this automatically';
        RAISE NOTICE 'Please contact Supabase support or check your project setup';
    ELSE
        RAISE NOTICE 'auth.users table exists - permissions will be verified';
    END IF;
END $$;

-- Verify courses table exists (from previous setup)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
        -- Create courses table if it doesn't exist
        RAISE NOTICE 'Creating courses table...';
        
        create extension if not exists pgcrypto;

        create table if not exists public.courses (
          id uuid primary key default gen_random_uuid(),
          title text not null,
          description text,
          image_url text,
          created_at timestamptz default now()
        );

        alter table public.courses enable row level security;

        create policy "Public can read courses"
        on public.courses
        for select
        to public
        using (true);

        -- Seed data
        insert into public.courses (title, description, image_url)
        values
        ('React Basics', 'Learn the fundamentals of React including components, state, and props. This course covers JSX, component lifecycle, hooks, and state management. Perfect for beginners looking to get started with modern web development.', 'https://picsum.photos/seed/react/600/400'),
        ('Advanced React Patterns', 'Dive into advanced patterns and performance optimizations. Master compound components, render props, higher-order components, and React performance best practices. Take your React skills to the next level.', 'https://picsum.photos/seed/advanced/600/400'),
        ('UI with Material-UI', 'Build beautiful UIs quickly using Material-UI. Learn how to customize themes, use pre-built components, and create responsive layouts that work across all devices. Make your apps look professional with minimal effort.', 'https://picsum.photos/seed/mui/600/400'),
        ('JavaScript Fundamentals', 'Master the core concepts of JavaScript including variables, functions, objects, arrays, and ES6+ features. Build a solid foundation for modern web development.', 'https://picsum.photos/seed/javascript/600/400'),
        ('Node.js Backend Development', 'Learn server-side JavaScript with Node.js. Build RESTful APIs, work with databases, implement authentication, and deploy your applications to production.', 'https://picsum.photos/seed/nodejs/600/400'),
        ('Full Stack Web Development', 'Combine frontend and backend skills to build complete web applications. Learn React, Node.js, databases, authentication, and deployment strategies.', 'https://picsum.photos/seed/fullstack/600/400');
        
        RAISE NOTICE 'Courses table created and seeded successfully';
    ELSE
        RAISE NOTICE 'Courses table already exists';
    END IF;
END $$;

-- Verify the setup
SELECT 'Courses table check:' as info, count(*) as course_count FROM public.courses;
