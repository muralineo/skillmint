# SkillMint Quick Start Checklist

Follow these steps to get your SkillMint application up and running:

## ✅ Step-by-Step Setup

### 1. ✏️ Environment Variables (2 minutes)
- [ ] Edit `.env` file in project root
- [ ] Add your Supabase URL (from Supabase Dashboard → Settings → API)
- [ ] Add your Supabase anon key (from same location)

### 2. 🗄️ Database Setup (3 minutes)
- [ ] Go to [supabase.com](https://supabase.com) and open your project
- [ ] Navigate to SQL Editor
- [ ] Copy the contents of `supabase_setup.sql`
- [ ] Paste and run in SQL Editor
- [ ] Verify 6 courses were created in Table Editor

### 3. 🔐 Google OAuth Setup (5-10 minutes)

#### In Supabase:
- [ ] Go to Authentication → Providers → Google
- [ ] Toggle Google to **Enabled**
- [ ] Copy the **Callback URL** (looks like: `https://xxx.supabase.co/auth/v1/callback`)

#### In Google Cloud Console:
- [ ] Go to [console.cloud.google.com](https://console.cloud.google.com)
- [ ] Create or select a project
- [ ] Navigate to APIs & Services → OAuth consent screen
  - [ ] Choose External
  - [ ] Fill in App name, User support email, Developer contact
  - [ ] Add scopes: email, profile, openid
  - [ ] Add your Google account as test user (if testing mode)
- [ ] Navigate to APIs & Services → Credentials
  - [ ] Create Credentials → OAuth client ID
  - [ ] Application type: Web application
  - [ ] Authorized redirect URIs: paste Supabase callback URL
  - [ ] Click Create
  - [ ] Copy Client ID and Client Secret

#### Back in Supabase:
- [ ] Go to Authentication → Providers → Google
- [ ] Paste Client ID
- [ ] Paste Client Secret
- [ ] Click Save

#### Auth URL Configuration:
- [ ] Go to Settings → Auth → URL Configuration
- [ ] Set Site URL: `http://localhost:5173`
- [ ] Set Additional Redirect URLs: `http://localhost:5173`
- [ ] Click Save

### 4. 🚀 Run the Application (1 minute)
Open PowerShell in project directory and run:
```powershell
powershell -ExecutionPolicy Bypass -Command "npm run dev"
```

- [ ] Visit `http://localhost:5173` in your browser
- [ ] You should see the SkillMint home page with courses!

### 5. 🧪 Test Authentication Flow (2 minutes)
- [ ] Click on any course card
- [ ] You'll be redirected to Google sign-in
- [ ] Sign in with your Google account
- [ ] After sign-in, you should be automatically redirected to the course detail page
- [ ] Your email should appear in the navbar
- [ ] Try navigating between different courses (should work without re-authenticating)
- [ ] Click "Sign out" to test logout

## 🎉 You're Done!

Your SkillMint application is now fully functional!

## 📖 Next Steps

- Read `README_SETUP.md` for detailed documentation
- Customize the theme in `src/theme.js`
- Add more courses via Supabase Table Editor
- Explore the code structure in `src/`

## ❓ Having Issues?

### Courses not showing?
- Check `.env` has correct values
- Verify SQL script ran successfully in Supabase
- Check browser console for errors

### Google sign-in not working?
- Verify all OAuth settings in both Supabase and Google Cloud Console
- Make sure your Google account is added as a test user
- Check Site URL is set to `http://localhost:5173` in Supabase

### Still stuck?
- Check `README_SETUP.md` for detailed troubleshooting
- Review Supabase logs (Dashboard → Logs)
- Check browser developer console for errors

---

**Estimated Total Setup Time:** 15-20 minutes

Happy Learning! 🎓
