# Troubleshooting Guide

## 🔴 Error: "infinite recursion detected in policy for relation 'users'"

### Problem
The RLS (Row Level Security) policies were creating a circular dependency when checking if a user is an admin.

### Solution

**Run `supabase_fix_rls_recursion.sql`** in Supabase SQL Editor:

1. Open the file `supabase_fix_rls_recursion.sql`
2. **IMPORTANT**: Update line 75 with your admin email:
   ```sql
   WHERE email = 'YOUR_EMAIL@gmail.com';
   ```
3. Go to **Supabase Dashboard** → **SQL Editor**
4. Copy and paste the entire SQL script
5. Click **Run**

### What the Fix Does

1. **Removes recursive policies**: Deletes the policies that were causing the recursion
2. **Creates simpler policies**: 
   - Users can view their own profile
   - Everyone can read the `is_admin` column (needed for admin checks)
   - Users can update their own profile
3. **Creates a helper function**: `is_admin()` function that bypasses RLS for admin checks
4. **Syncs user emails**: Copies all emails from `auth.users` to `public.users`
5. **Sets admin status**: Marks your email as admin

---

## 🔴 Admin Button Not Showing

### Checklist

1. **Verify you're marked as admin:**
   ```sql
   SELECT id, email, is_admin FROM public.users WHERE is_admin = TRUE;
   ```
   - Should show your email with `is_admin = true`

2. **If not shown, manually set it:**
   ```sql
   UPDATE public.users
   SET is_admin = TRUE
   WHERE email = 'your-email@gmail.com';
   ```

3. **Sign out and sign back in**
   - The admin status is checked on login
   - Refresh might not be enough

4. **Clear browser cache**
   - Sometimes the old state is cached
   - Try incognito/private mode

5. **Check browser console**
   - Look for any errors related to `checkIsAdmin`
   - Make sure there are no RLS policy errors

---

## 🔴 User Email Shows as "Unknown"

### Fix 1: Sync Users Manually

Run this in SQL Editor:
```sql
INSERT INTO public.users (id, email, created_at)
SELECT id, email, created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email;
```

### Fix 2: Verify RLS Policies

Check that admins can read all users:
```sql
-- Test if you can see all users
SELECT id, email FROM public.users;
```

If you get permission errors, the RLS policy might be wrong.

### Fix 3: Check the Trigger

The trigger should sync new users automatically:
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

If missing, run `supabase_fix_user_emails.sql`.

---

## 🔴 Can't Approve/Reject Requests

### Possible Causes

1. **Not logged in as admin**
   - Verify with: `SELECT * FROM public.users WHERE id = auth.uid();`

2. **RLS policy blocking updates**
   - Run `supabase_fix_rls_recursion.sql` to fix policies

3. **Network error**
   - Check browser console for API errors
   - Check Supabase logs in Dashboard

---

## 🔴 Course Access Request Not Working

### Debug Steps

1. **Check if request was created:**
   ```sql
   SELECT * FROM course_access_requests 
   ORDER BY created_at DESC LIMIT 5;
   ```

2. **Verify RLS allows INSERT:**
   ```sql
   -- Test as authenticated user
   SELECT * FROM course_access_requests WHERE user_id = auth.uid();
   ```

3. **Check browser console** for JavaScript errors

---

## 🧪 Testing Checklist

### As Regular User
- [ ] Can see courses on home page
- [ ] Can click a course and sign in
- [ ] Can click "Request Access" button
- [ ] See success message after requesting
- [ ] Status shows "Pending"

### As Admin
- [ ] See "Admin" button in navbar
- [ ] Can access `/admin` page
- [ ] See all pending requests with user emails
- [ ] Can click "Approve" and status updates
- [ ] Can click "Reject" and status updates

### After Approval
- [ ] User can see the course content
- [ ] Green success message shows
- [ ] "Request Access" button is gone

---

## 🔍 Useful SQL Queries

### View All Users
```sql
SELECT id, email, is_admin, created_at 
FROM public.users 
ORDER BY created_at DESC;
```

### View All Requests
```sql
SELECT 
  car.id,
  car.status,
  u.email as user_email,
  c.title as course_title,
  car.created_at
FROM course_access_requests car
JOIN public.users u ON car.user_id = u.id
JOIN courses c ON car.course_id = c.id
ORDER BY car.created_at DESC;
```

### Count Requests by Status
```sql
SELECT status, COUNT(*) 
FROM course_access_requests 
GROUP BY status;
```

### Find Your User ID
```sql
SELECT auth.uid() as my_user_id, 
       u.email, 
       u.is_admin 
FROM public.users u 
WHERE u.id = auth.uid();
```

### Check RLS Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 🆘 Still Having Issues?

1. **Check Supabase Logs:**
   - Dashboard → Logs → Auth Logs
   - Dashboard → Logs → Database Logs

2. **Check Browser Console:**
   - Press F12
   - Look for red errors
   - Check the Network tab for failed requests

3. **Verify Environment Variables:**
   - `.env` file has correct Supabase URL and key
   - Restart dev server after changing `.env`

4. **Database Connection:**
   - Make sure your Supabase project is active
   - Check project status in Supabase Dashboard

---

## 📝 Quick Reset (Nuclear Option)

If everything is broken, start fresh:

```sql
-- Drop and recreate everything
DROP TABLE IF EXISTS public.course_access_requests CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Then run:
-- 1. supabase_create_public_users.sql
-- 2. supabase_admin_setup.sql
-- 3. supabase_fix_rls_recursion.sql
```

**WARNING**: This will delete all access requests and user data!

---

## ✅ Verification Script

Run this to verify everything is set up correctly:

```sql
-- 1. Check if tables exist
SELECT 'Tables:' as check_type, 
       EXISTS(SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') as users_exists,
       EXISTS(SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') as courses_exists,
       EXISTS(SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'course_access_requests') as requests_exists;

-- 2. Check if you're admin
SELECT 'Admin check:' as check_type, id, email, is_admin 
FROM public.users 
WHERE id = auth.uid();

-- 3. Check function exists
SELECT 'Functions:' as check_type, 
       EXISTS(SELECT FROM pg_proc WHERE proname = 'is_admin') as is_admin_exists,
       EXISTS(SELECT FROM pg_proc WHERE proname = 'handle_new_user') as handle_new_user_exists;

-- 4. Count RLS policies
SELECT 'RLS Policies:' as check_type, 
       tablename, 
       COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename;
```

Expected results:
- All tables should exist (TRUE)
- Your email should show with `is_admin = true`
- Both functions should exist (TRUE)
- Each table should have policies

---

**If you're still stuck, check the error message in the browser console and search for it in this guide!**
