# SkillMint - Course Platform Setup Guide

## 🎯 Overview
SkillMint is a course platform built with React, Material-UI, and Supabase that features:
- Public course browsing
- Google OAuth authentication via Supabase
- Protected course detail pages
- Automatic redirect back to intended course after authentication

## 📋 Prerequisites
- Node.js installed (v16 or higher)
- A Supabase account (free tier works)
- A Google Cloud Console account for OAuth setup

## 🚀 Setup Instructions

### 1. Configure Supabase

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned

#### Set Environment Variables
1. Open `.env` in the project root
2. Replace the placeholders with your actual values from Supabase Dashboard → Settings → API:
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
   ```

### 2. Create Database Table

Go to Supabase SQL Editor and run:

```sql
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

-- Optional seed data
insert into public.courses (title, description, image_url)
values
('React Basics', 'Learn the fundamentals of React including components, state, and props.', 'https://picsum.photos/seed/react/600/400'),
('Advanced React Patterns', 'Dive into advanced patterns and performance optimizations.', 'https://picsum.photos/seed/advanced/600/400'),
('UI with Material-UI', 'Build beautiful UIs quickly using Material-UI.', 'https://picsum.photos/seed/mui/600/400');
```

### 3. Configure Google OAuth

#### In Supabase Dashboard:

1. **Settings → Auth → URL Configuration:**
   - Site URL: `http://localhost:5173`
   - Additional Redirect URLs: `http://localhost:5173`

2. **Authentication → Providers → Google:**
   - Toggle Google to **Enabled**
   - Copy the **Callback URL (for OAuth)** shown (it will look like: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`)

#### In Google Cloud Console:

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services → OAuth consent screen**
   - Choose **External** user type
   - Fill in required fields (App name, User support email, Developer contact)
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if app is in testing mode

4. Navigate to **APIs & Services → Credentials**
   - Click **Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: `SkillMint`
   - **Authorized redirect URIs:** Paste the Callback URL you copied from Supabase
   - Click **Create**

5. Copy the **Client ID** and **Client Secret**

#### Back in Supabase:

1. Go back to **Authentication → Providers → Google**
2. Paste your **Client ID** and **Client Secret**
3. Click **Save**

### 4. Run the Application

```powershell
# Make sure you're in the project directory
cd D:\SkillMint\react_website

# Start the development server
powershell -ExecutionPolicy Bypass -Command "npm run dev"
```

The app will be available at: `http://localhost:5173`

## 🧪 Testing the Application

### Test Flow:

1. **Home Page (Unauthenticated):**
   - Visit `http://localhost:5173`
   - You should see a list of courses
   - No authentication required to view the home page

2. **Clicking a Course (Triggers Auth):**
   - Click on any course card
   - You'll be redirected to Google sign-in
   - Sign in with your Google account
   - After successful authentication, you'll be automatically redirected back to the specific course detail page you clicked

3. **Authenticated Navigation:**
   - Once signed in, you can navigate between courses without re-authenticating
   - Your email and avatar will appear in the navbar
   - Click "Sign out" to log out

4. **Direct Course Link (Deep Linking):**
   - Copy a course detail URL (e.g., `http://localhost:5173/course/COURSE-ID`)
   - Open in a new incognito/private window
   - You'll be prompted to sign in
   - After authentication, you'll be returned to that specific course

## 📁 Project Structure

```
src/
├── lib/
│   └── supabaseClient.js        # Supabase configuration
├── contexts/
│   └── AuthContext.jsx          # Authentication state management
├── components/
│   ├── NavBar.jsx               # Navigation bar with auth status
│   ├── CourseCard.jsx           # Course card component
│   └── ProtectedRoute.jsx       # Route protection wrapper
├── pages/
│   ├── HomePage.jsx             # Home page with course list
│   └── CourseDetail.jsx         # Course detail page (protected)
├── theme.js                     # Material-UI theme (green branding)
├── App.jsx                      # Main app with routing
└── main.jsx                     # Entry point with providers
```

## 🔧 Troubleshooting

### Courses Don't Load
- Verify `.env` has correct Supabase URL and anon key
- Check that the courses table exists in Supabase
- Ensure RLS policy allows SELECT to public
- Check browser console for errors

### Google Sign-In Fails
- Verify Site URL in Supabase Auth settings matches `http://localhost:5173`
- Check that Google OAuth Client ID and Secret are correctly set in Supabase
- Ensure the Authorized redirect URI in Google Cloud Console matches the Supabase callback URL
- If app is in testing mode in Google Cloud, ensure your Google account is added as a test user

### Not Redirected After Sign-In
- Check browser console for navigation errors
- Verify localStorage has no stale `postAuthReturnTo` entries
- Clear browser cache and cookies, then try again

### PowerShell Execution Policy Error
- Use: `powershell -ExecutionPolicy Bypass -Command "npm run dev"`
- Or set execution policy: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

## 🚢 Building for Production

```powershell
# Build the app
powershell -ExecutionPolicy Bypass -Command "npm run build"

# Preview the production build
powershell -ExecutionPolicy Bypass -Command "npm run preview"
```

### Production Deployment Notes:
1. Update Supabase Auth URL Configuration with your production domain
2. Add production domain to Google Cloud OAuth authorized redirect URIs
3. Update environment variables with production values
4. Consider enabling stricter RLS policies for course management

## 🎨 Customization

### Theme Colors
Edit `src/theme.js` to customize the Material-UI theme with your brand colors.

### Course Data
Currently courses are stored in Supabase. To add more courses:
1. Go to Supabase Table Editor
2. Select the `courses` table
3. Insert new rows with title, description, and image_url

## 📚 Future Enhancements
- Add course categories and search
- Implement course enrollment tracking
- Add admin interface for course management
- Support video lessons and attachments
- Add user progress tracking
- Implement course reviews and ratings

## 🤝 Support
For issues, please check:
- Supabase logs (Dashboard → Logs)
- Browser console errors
- Network tab in developer tools

---

Built with ❤️ using React, Material-UI, and Supabase
