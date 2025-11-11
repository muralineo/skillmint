import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { NavBar } from './components/NavBar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute';
import { HomePage } from './pages/HomePage';
import { CourseDetail } from './pages/CourseDetail';
import { AdminPage } from './pages/AdminPage';
import { AdminCourseContent } from './pages/admin/AdminCourseContent';

function App() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/course/:id"
          element={
            <ProtectedRoute>
              <CourseDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/courses/:courseId/content"
          element={
            <ProtectedAdminRoute>
              <AdminCourseContent />
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    </Box>
  );
}

export default App;
