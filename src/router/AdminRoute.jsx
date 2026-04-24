// src/router/AdminRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // Wait for auth to resolve
  if (loading) return null;

  // Not logged in
  if (!currentUser) return <Navigate to="/login" replace />;

  // Logged in but USER — redirect to products
  if (!['ADMIN', 'SUPERADMIN'].includes(currentUser.user_type)) {
    return <Navigate to="/products" replace />;
  }

  // ADMIN or SUPERADMIN — allow through
  return children;
};

export default AdminRoute;