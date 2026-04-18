import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // ✅ Consume context instead of Supabase directly

import ProtectedRoute from './router/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import AuthCallBack from './pages/AuthCallBack'; // ✅ Using the Vercel-safe capitalized name!
import MainLayout from './components/MainLayout';

/* ── placeholder pages (replace with real ones later) ── */
const ProductsPage = () => (
  <div>
    <h1 className="text-xl font-bold text-[#31511E] mb-1">Products</h1>
    <p className="text-xs text-[#859F3D]">Welcome to Hope PMS Products.</p>
  </div>
);

function App() {
  // ✅ Bug #6 Fixed: Consume global auth state instead of running a duplicate listener
  const { session, loading } = useAuth();

  // While checking auth state, show nothing (or a spinner)
  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* public */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallBack />} />

        {/* protected */}
        <Route
          path="/products"
          element={
            // ✅ Bug #7 Fixed: Removed 'session={session}' prop. 
            // ProtectedRoute will read directly from AuthContext now.
            <ProtectedRoute>
              {/* Removed user={session?.user} prop. MainLayout should also use useAuth() internally! */}
              <MainLayout>
                <ProductsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to={session ? '/products' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;