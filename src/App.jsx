import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { NavBar } from './components/NavBar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { CourseDetail } from './pages/CourseDetail';

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
      </Routes>
    </Box>
  );
}

export default App;
