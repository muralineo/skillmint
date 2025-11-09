-- SkillMint Database Setup Script
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists pgcrypto;

-- Create courses table
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.courses enable row level security;

-- Create policy to allow public read access
-- This allows anyone to view courses without authentication
create policy "Public can read courses"
on public.courses
for select
to public
using (true);

-- Optional: Create policy for authenticated users to insert courses
-- Uncomment if you want authenticated users to be able to add courses
-- create policy "Authenticated users can insert courses"
-- on public.courses
-- for insert
-- to authenticated
-- with check (true);

-- Optional: Create policy for authenticated users to update their own courses
-- Uncomment and modify if you want users to manage their courses
-- create policy "Users can update their own courses"
-- on public.courses
-- for update
-- to authenticated
-- using (auth.uid() = user_id)
-- with check (auth.uid() = user_id);

-- Seed data: Sample courses
insert into public.courses (title, description, image_url)
values
('React Basics', 'Learn the fundamentals of React including components, state, and props. This course covers JSX, component lifecycle, hooks, and state management. Perfect for beginners looking to get started with modern web development.', 'https://picsum.photos/seed/react/600/400'),
('Advanced React Patterns', 'Dive into advanced patterns and performance optimizations. Master compound components, render props, higher-order components, and React performance best practices. Take your React skills to the next level.', 'https://picsum.photos/seed/advanced/600/400'),
('UI with Material-UI', 'Build beautiful UIs quickly using Material-UI. Learn how to customize themes, use pre-built components, and create responsive layouts that work across all devices. Make your apps look professional with minimal effort.', 'https://picsum.photos/seed/mui/600/400'),
('JavaScript Fundamentals', 'Master the core concepts of JavaScript including variables, functions, objects, arrays, and ES6+ features. Build a solid foundation for modern web development.', 'https://picsum.photos/seed/javascript/600/400'),
('Node.js Backend Development', 'Learn server-side JavaScript with Node.js. Build RESTful APIs, work with databases, implement authentication, and deploy your applications to production.', 'https://picsum.photos/seed/nodejs/600/400'),
('Full Stack Web Development', 'Combine frontend and backend skills to build complete web applications. Learn React, Node.js, databases, authentication, and deployment strategies.', 'https://picsum.photos/seed/fullstack/600/400');

-- Verify the data was inserted
select * from public.courses order by created_at desc;
