# Admin & Course Access Request System - Setup Guide

## 🎯 What's Been Added

You now have a complete **course access approval system** with:
- **Request Access Button**: Users must request permission to view course details
- **Admin Dashboard**: Manage all access requests with approve/reject options
- **Status Tracking**: Pending, approved, and rejected states
- **Admin-Only Access**: Secure admin panel with role-based access

---

## 🚀 Setup Instructions

### Step 1: Run the Database Setup SQL

1. Go to **Supabase Dashboard** → **SQL Editor**

2. Copy and paste the contents of `supabase_admin_setup.sql`

3. **IMPORTANT**: Before running, update line 90-92:
   ```sql
   UPDATE public.users
   SET is_admin = TRUE
   WHERE email = 'YOUR_EMAIL@gmail.com';
   ```
   Replace `YOUR_EMAIL@gmail.com` with your actual Google account email

4. Click **Run** to execute the SQL

5. Verify the setup:
   - Go to **Table Editor**
   - Check that `course_access_requests` table was created
   - Check that `public.users` table has `is_admin` column
   - Verify you're marked as admin in the users table

---

## ✅ How It Works

### For Regular Users

1. **Browse Courses**: Users can see all courses on the home page without logging in

2. **Click a Course**: When a user clicks on a course:
   - They're authenticated with Google (if not already)
   - Redirected to the course detail page

3. **Request Access**: On the course detail page:
   - If they don't have access, they see a **"Request Access"** button
   - Clicking it sends a request to the admin
   - A success message appears: *"The request has been sent to the admin. You will soon be able to access the course after admin approval."*

4. **Status Display**:
   - **Pending**: Shows an orange alert with hourglass icon
   - **Rejected**: Shows a red alert with lock icon
   - **Approved**: User can view the full course content

### For Admin Users

1. **Admin Button**: Admins see an **"Admin"** button in the navbar

2. **Admin Dashboard** (`/admin`):
   - View all course access requests
   - Stats cards showing pending, approved, and rejected counts
   - Tabs to filter requests by status
   - Table with user email, course name, request date, and status

3. **Approve/Reject**:
   - Click **"Approve"** to grant access
   - Click **"Reject"** to deny access
   - Status updates in real-time

---

## 📁 Files Created/Modified

### New Files
- ✅ `src/lib/courseAccess.js` - Helper functions for access management
- ✅ `src/pages/AdminPage.jsx` - Admin dashboard
- ✅ `src/components/ProtectedAdminRoute.jsx` - Admin route protection
- ✅ `supabase_admin_setup.sql` - Database setup script

### Modified Files
- ✅ `src/pages/CourseDetail.jsx` - Added access request UI
- ✅ `src/components/NavBar.jsx` - Added admin button
- ✅ `src/App.jsx` - Added `/admin` route

---

## 🗄️ Database Schema

### `course_access_requests` Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | References auth.users |
| `course_id` | UUID | References courses |
| `status` | TEXT | 'pending', 'approved', or 'rejected' |
| `created_at` | TIMESTAMPTZ | Request creation time |
| `updated_at` | TIMESTAMPTZ | Last update time |

### `public.users` Table (Updated)
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `email` | TEXT | User email |
| `is_admin` | BOOLEAN | Admin flag (default: false) |
| `created_at` | TIMESTAMPTZ | Account creation time |
| `updated_at` | TIMESTAMPTZ | Last update time |

---

## 🔐 Row Level Security (RLS) Policies

### Course Access Requests

1. **Users can view their own requests**
   ```sql
   auth.uid() = user_id
   ```

2. **Users can create their own requests**
   ```sql
   auth.uid() = user_id
   ```

3. **Admins can view all requests**
   ```sql
   EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE)
   ```

4. **Admins can update requests**
   ```sql
   EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE)
   ```

---

## 🧪 Testing the System

### Test as a Regular User

1. Sign out (if signed in)
2. Click on any course
3. Sign in with a non-admin Google account
4. You should see the **"Request Access"** button
5. Click it and verify the success message appears
6. Status should show **"Access Request Pending"**

### Test as an Admin

1. Sign in with your admin Google account (the one you set in SQL)
2. You should see an **"Admin"** button in the navbar
3. Click **"Admin"** to go to the dashboard
4. You should see the pending request from the regular user
5. Click **"Approve"**
6. The status should update to **"Approved"**

### Verify Approval

1. Sign out and sign back in as the regular user
2. Go to the course you requested access to
3. You should now see the full course content with a green success message

---

## 🎨 UI Components

### Course Detail Page States

**No Access** (Blue):
- Lock icon
- "Course Access Required" heading
- "Request Access" button

**Pending** (Orange):
- Hourglass icon
- "Access Request Pending" heading
- Message about waiting for approval

**Rejected** (Red):
- Lock icon
- "Access Request Rejected" heading
- Message to contact administrator

**Approved** (Green):
- Checkmark icon
- "You have access to this course!" message
- Full course content displayed

### Admin Dashboard

- **Stats Cards**: Show counts for pending, approved, and rejected requests
- **Tabs**: Filter by All, Pending, Approved, Rejected
- **Table**: Shows user email, course name, request date, status, and actions
- **Buttons**: Green "Approve" and red "Reject" for pending requests

---

## 🔧 Making More Admins

To add more admin users:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run:
   ```sql
   UPDATE public.users
   SET is_admin = TRUE
   WHERE email = 'NEW_ADMIN_EMAIL@gmail.com';
   ```
3. The user will see the **Admin** button next time they refresh

Or manually in **Table Editor**:
1. Go to `public.users` table
2. Find the user row
3. Set `is_admin` to `true`

---

## 📊 Monitoring Requests

### View All Requests
```sql
SELECT 
  car.id,
  car.status,
  car.created_at,
  u.email as user_email,
  c.title as course_title
FROM course_access_requests car
JOIN public.users u ON car.user_id = u.id
JOIN courses c ON car.course_id = c.id
ORDER BY car.created_at DESC;
```

### Count by Status
```sql
SELECT 
  status,
  COUNT(*) as count
FROM course_access_requests
GROUP BY status;
```

---

## 🚨 Troubleshooting

### Admin button not showing
- Verify you ran the SQL with your correct email
- Check the `public.users` table to confirm `is_admin = true`
- Sign out and sign back in
- Clear browser cache

### Can't see pending requests in admin panel
- Check RLS policies are created correctly
- Verify you're signed in as an admin user
- Check browser console for errors
- Verify the user made a request by checking the database

### "Access Denied" when visiting /admin
- You're not marked as admin in the database
- Run the UPDATE query with your email
- Sign out and sign back in

### Request button doesn't work
- Check browser console for errors
- Verify `course_access_requests` table exists
- Check RLS policies allow INSERT for authenticated users

---

## 🎉 Success!

Your SkillMint platform now has a complete course access management system with:
- ✅ User access requests
- ✅ Admin approval workflow
- ✅ Status tracking and notifications
- ✅ Secure role-based access control

Users can request access to courses, and admins can manage all requests from a beautiful dashboard!

---

**Questions?** Check the browser console for errors or review Supabase logs in the Dashboard.
