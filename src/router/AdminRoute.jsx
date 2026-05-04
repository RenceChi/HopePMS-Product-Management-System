import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRights } from '../context/UserRightsContext';

const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const { rightsLoading } = useRights();

  // Wait for auth to resolve
  if (loading || rightsLoading) return null;
  
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