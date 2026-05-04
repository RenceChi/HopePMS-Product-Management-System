import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../db/supabase';
import { useRights } from '../context/UserRightsContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const { rightsLoading } = useRights();

  if (loading || rightsLoading) return null;

  // No session at all — send to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // DB fetch returned null / RLS issue — hold without signing out.
  // AuthContext will re-render once the real row arrives.


  // Confirmed inactive account — sign out and show the error message
  if (currentUser.record_status !== 'ACTIVE') {
    supabase.auth.signOut();
    return <Navigate to="/login?error=inactive" replace />;
  }

  return children;
};

export default ProtectedRoute;