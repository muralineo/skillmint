-- Course Content Tables: Sessions and Code Files
-- Run this in Supabase SQL Editor

-- Create course_sessions table
create table if not exists public.course_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  session_number integer not null check (session_number > 0),
  topic text not null,
  video_url text,
  created_at timestamptz not null default now(),
  unique (course_id, session_number)
);

-- Create session_code_files table
create table if not exists public.session_code_files (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.course_sessions(id) on delete cascade,
  file_name text not null,
  file_content text not null default '',
  language text not null,
  created_at timestamptz not null default now(),
  unique (session_id, file_name)
);

-- Enable Row Level Security
alter table public.course_sessions enable row level security;
alter table public.session_code_files enable row level security;

-- Create indexes for performance
create index if not exists idx_course_sessions_course_id on public.course_sessions(course_id, session_number);
create index if not exists idx_session_code_files_session_id on public.session_code_files(session_id, file_name);

-- RLS Policies for course_sessions
-- Read: Approved users and admins can view sessions
create policy "Read sessions for approved or admin"
on public.course_sessions
for select
to authenticated
using (
  exists (
    select 1
    from public.course_access_requests car
    where car.course_id = course_sessions.course_id
      and car.user_id = auth.uid()
      and car.status = 'approved'
  )
  or exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
);

-- Insert: Only admins can create sessions
create policy "Admins insert sessions"
on public.course_sessions
for insert
to authenticated
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true));

-- Update: Only admins can update sessions
create policy "Admins update sessions"
on public.course_sessions
for update
to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true));

-- Delete: Only admins can delete sessions
create policy "Admins delete sessions"
on public.course_sessions
for delete
to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true));

-- RLS Policies for session_code_files
-- Read: Approved users and admins can view code files
create policy "Read files for approved or admin"
on public.session_code_files
for select
to authenticated
using (
  exists (
    select 1
    from public.course_sessions s
    join public.course_access_requests car on car.course_id = s.course_id
    where s.id = session_code_files.session_id
      and car.user_id = auth.uid()
      and car.status = 'approved'
  )
  or exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
);

-- Insert: Only admins can create files
create policy "Admins insert files"
on public.session_code_files
for insert
to authenticated
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true));

-- Update: Only admins can update files
create policy "Admins update files"
on public.session_code_files
for update
to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true))
with check (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true));

-- Delete: Only admins can delete files
create policy "Admins delete files"
on public.session_code_files
for delete
to authenticated
using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true));
