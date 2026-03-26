import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './router/ProtectedRoute';
import AppLayout from './layout/AppLayout';

// Import Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import Products from './pages/Products';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import DeletedItems from './pages/DeletedItems';

function App() {
  // Hardcoded for testing. Change to true to test the protected views!
  const mockSession = null; 

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected Routes wrapped in the AppLayout */}
        <Route 
          element={
            <ProtectedRoute session={mockSession}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Default route redirects to products */}
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<Products />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/deleted-items" element={<DeletedItems />} />
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;