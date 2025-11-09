# SkillMint File Structure

```
D:\SkillMint\react_website\
│
├── 📄 .env                          # Environment variables (EDIT THIS!)
├── 📄 .gitignore                    # Git ignore file
├── 📄 package.json                  # Dependencies
├── 📄 vite.config.js                # Vite configuration
├── 📄 index.html                    # HTML entry point
│
├── 📖 QUICKSTART.md                 # ⭐ START HERE - Quick setup guide
├── 📖 README_SETUP.md               # Detailed setup instructions
├── 📖 PROJECT_SUMMARY.md            # What's been built
├── 📖 FILE_STRUCTURE.md             # This file
├── 📄 supabase_setup.sql            # Database setup script
│
├── 📁 public/                       # Static assets
│   └── vite.svg
│
├── 📁 src/                          # Source code
│   │
│   ├── 📄 main.jsx                  # Entry point - wraps app with providers
│   ├── 📄 App.jsx                   # Main app component with routing
│   ├── 📄 theme.js                  # Material-UI custom theme (green colors)
│   │
│   ├── 📁 lib/                      # Library/utility files
│   │   └── 📄 supabaseClient.js     # Supabase configuration and client
│   │
│   ├── 📁 contexts/                 # React contexts for state management
│   │   └── 📄 AuthContext.jsx       # Authentication state and functions
│   │
│   ├── 📁 components/               # Reusable components
│   │   ├── 📄 NavBar.jsx            # Navigation bar with auth status
│   │   ├── 📄 CourseCard.jsx        # Course card component
│   │   └── 📄 ProtectedRoute.jsx    # Route wrapper for auth protection
│   │
│   └── 📁 pages/                    # Page components
│       ├── 📄 HomePage.jsx          # Home page with course list
│       └── 📄 CourseDetail.jsx      # Individual course detail page
│
└── 📁 node_modules/                 # Installed dependencies (auto-generated)
```

## File Descriptions

### Root Level Configuration

| File | Purpose | Action Required |
|------|---------|----------------|
| `.env` | Supabase credentials | ✅ **EDIT THIS** - Add your Supabase URL and key |
| `.gitignore` | Files to ignore in git | ✅ Already configured |
| `package.json` | Project dependencies | ✅ Already configured |
| `vite.config.js` | Vite build config | ✅ Already configured |

### Documentation Files

| File | Purpose | When to Use |
|------|---------|-------------|
| `QUICKSTART.md` | Step-by-step setup | ⭐ **Start here** |
| `README_SETUP.md` | Detailed documentation | For reference |
| `PROJECT_SUMMARY.md` | What's been built | Overview |
| `supabase_setup.sql` | Database setup | Copy to Supabase SQL Editor |

### Source Code Structure

#### Core Files

**`src/main.jsx`** - Application Entry Point
- Wraps app with BrowserRouter
- Adds Material-UI ThemeProvider
- Includes AuthProvider for auth state
- Renders the App component

**`src/App.jsx`** - Main Application
- Sets up React Router routes
- Includes NavBar on all pages
- Routes:
  - `/` → HomePage (public)
  - `/course/:id` → CourseDetail (protected)

**`src/theme.js`** - UI Theme
- Custom Material-UI theme
- Green color scheme for SkillMint
- Typography settings
- Component style overrides

#### Library (`src/lib/`)

**`supabaseClient.js`** - Supabase Setup
- Creates Supabase client
- Configures authentication
- Exports for use throughout app

#### Contexts (`src/contexts/`)

**`AuthContext.jsx`** - Authentication Management
- Manages user authentication state
- Provides `signInWithGoogle()` function
- Provides `signOut()` function
- Handles post-authentication redirects
- Makes auth state available to all components

#### Components (`src/components/`)

**`NavBar.jsx`** - Navigation Bar
- Shows "SkillMint" branding
- Displays sign-in button (when not authenticated)
- Shows user email and sign-out button (when authenticated)
- Sticky at top of all pages

**`CourseCard.jsx`** - Course Display Card
- Shows course image
- Displays course title
- Shows course description (truncated)
- Clickable to navigate to course detail

**`ProtectedRoute.jsx`** - Authentication Guard
- Wraps protected pages
- Checks if user is authenticated
- Redirects to Google sign-in if not
- Remembers intended destination
- Returns user to intended page after sign-in

#### Pages (`src/pages/`)

**`HomePage.jsx`** - Course Listing Page
- Fetches courses from Supabase
- Displays courses in responsive grid
- Shows loading state while fetching
- Handles errors gracefully
- **Public** - No authentication required

**`CourseDetail.jsx`** - Individual Course Page
- Displays single course details
- Shows course image, title, description
- Back button to return to home
- **Protected** - Requires authentication

## Component Relationships

```
main.jsx
  └── BrowserRouter
      └── ThemeProvider
          └── AuthProvider
              └── App.jsx
                  ├── NavBar.jsx (uses AuthContext)
                  └── Routes
                      ├── HomePage.jsx
                      │   └── CourseCard.jsx (multiple)
                      └── ProtectedRoute.jsx (uses AuthContext)
                          └── CourseDetail.jsx
```

## Data Flow

### Authentication Flow
```
User Action → Component
             ↓
          AuthContext
             ↓
       Supabase Auth
             ↓
       Google OAuth
             ↓
    User Authenticated
             ↓
     Redirect to Course
```

### Course Data Flow
```
Component Mount
       ↓
  Supabase Query
       ↓
  PostgreSQL Database
       ↓
  JSON Response
       ↓
  React State Update
       ↓
  UI Renders
```

## Important Files to Edit

### Before First Run
1. ✅ `.env` - Add your Supabase credentials

### For Customization
1. `src/theme.js` - Change colors, fonts, styles
2. `supabase_setup.sql` - Modify course data
3. `src/components/NavBar.jsx` - Customize branding

### Adding Features
- New pages → `src/pages/`
- New components → `src/components/`
- New routes → `src/App.jsx`
- Database changes → Supabase dashboard

## Dependencies Overview

### Core Framework
- `react` - UI library
- `react-dom` - DOM rendering
- `vite` - Build tool

### UI/Styling
- `@mui/material` - Material-UI components
- `@emotion/react` - CSS-in-JS
- `@emotion/styled` - Styled components
- `@mui/icons-material` - Material icons

### Routing
- `react-router-dom` - Client-side routing

### Backend/Auth
- `@supabase/supabase-js` - Supabase client

## Quick Navigation

- **Setup Instructions**: `QUICKSTART.md`
- **Detailed Docs**: `README_SETUP.md`
- **What's Built**: `PROJECT_SUMMARY.md`
- **Database Setup**: `supabase_setup.sql`
- **Main App Logic**: `src/App.jsx`
- **Auth Logic**: `src/contexts/AuthContext.jsx`
- **Home Page**: `src/pages/HomePage.jsx`
- **Course Detail**: `src/pages/CourseDetail.jsx`

---

**Total Files**: ~20 (including documentation)
**Lines of Code**: ~500 (application code)
**Time to Setup**: ~20 minutes
