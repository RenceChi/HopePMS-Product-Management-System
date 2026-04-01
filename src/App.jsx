import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './db/supabase';

import ProtectedRoute from './router/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import AuthCallback from './pages/AuthCallback';
import MainLayout from './components/MainLayout';

/* ── placeholder pages (replace with real ones later) ── */
const Dashboard = () => (
  <div>
    <h1 className="text-xl font-bold text-[#31511E] mb-1">Dashboard</h1>
    <p className="text-xs text-[#859F3D]">Welcome to Hope PMS.</p>
  </div>
);

function App() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // While checking auth state, show nothing (or a spinner)
  if (session === undefined) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* public */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute session={session}>
              <MainLayout user={session?.user}>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to={session ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;