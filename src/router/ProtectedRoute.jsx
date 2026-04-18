import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../db/supabase';

const ProtectedRoute = ({ children, session }) => {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    if (!session) { setStatus('no-session'); return; }

    supabase
      .from('user')
      .select('record_status')
      .eq('userid', session.user.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setStatus('inactive'); return; }
        setStatus(data.record_status === 'ACTIVE' ? 'active' : 'inactive');
      });
  }, [session]);

  if (status === 'checking') return null;
  if (status === 'no-session') return <Navigate to="/login" replace />;
  if (status === 'inactive') {
    supabase.auth.signOut();
    return <Navigate to="/login?error=inactive" replace />;
  }
  return children;
};

export default ProtectedRoute;
