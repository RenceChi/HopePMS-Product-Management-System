// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useRights } from './context/UserRightsContext';

import ProtectedRoute from './router/ProtectedRoute';
import AdminRoute from './router/AdminRoute';
import AuthPage from './pages/AuthPage';
import AuthCallBack from './pages/AuthCallBack';
import MainLayout from './components/MainLayout';
import ProductListPage from './pages/ProductListPage';
import DeletedItemsPage from './pages/DeletedItemsPage';

/* ── Placeholder pages — replace in Sprint 2/3 PRs ── */
const ReportsPage = () => (
  <div className="p-4">
    <h1 className="text-xl font-bold text-[#31511E] mb-1">Reports</h1>
    <p className="text-xs text-[#859F3D]">View system reports here.</p>
  </div>
);

const AdminPage = () => (
  <div className="p-4">
    <h1 className="text-xl font-bold text-[#31511E] mb-1">Admin Dashboard</h1>
    <p className="text-xs text-[#859F3D]">Manage users and system settings.</p>
  </div>
);



function App() {
  const { currentUser, loading } = useAuth();
  const { rightsLoading } = useRights();

  // Wait for both auth and rights to resolve before rendering routes
  if (loading || rightsLoading) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ── */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallBack />} />

        {/* ── Protected — any authenticated ACTIVE user ── */}
        <Route path="/products" element={
          <ProtectedRoute>
            <MainLayout user={currentUser}>
              <ProductListPage />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute>
            <MainLayout user={currentUser}>
              <ReportsPage />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* ── Admin only — ADMIN and SUPERADMIN ── */}
        <Route path="/admin" element={
          <AdminRoute>
            <MainLayout user={currentUser}>
              <AdminPage />
            </MainLayout>
          </AdminRoute>
        } />

        <Route path="/deleted-items" element={
          <AdminRoute>
            <MainLayout user={currentUser}>
              <DeletedItemsPage />
            </MainLayout>
          </AdminRoute>
        } />

        {/* ── Fallback ── */}
        <Route path="/" element={
          <Navigate to={currentUser ? '/products' : '/login'} replace />
        } />
        <Route path="*" element={
          <Navigate to={currentUser ? '/products' : '/login'} replace />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;