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
import UserManagementPage from './pages/UserManagementPage';
import ProductReportPage from './pages/ProductReportPage';   // REP_001
import TopSellingPage from './pages/TopSellingPage';         // REP_002

function App() {
  const { currentUser, loading } = useAuth();
  const { rightsLoading } = useRights();

  const isReady = !loading && !rightsLoading;

  

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

        {/* REP_001 — Product Price Report (all authenticated roles) */}
        <Route path="/reports/product-listing" element={
          <ProtectedRoute>
            <MainLayout user={currentUser}>
              <ProductReportPage />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* REP_002 — Top Selling Report (SUPERADMIN only — page self-guards via canViewRep002) */}
        <Route path="/reports/top-selling" element={
          <ProtectedRoute>
            <MainLayout user={currentUser}>
              <TopSellingPage />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* ── Admin only — ADMIN and SUPERADMIN ── */}
        <Route path="/admin" element={
          <AdminRoute>
            <MainLayout user={currentUser}>
              <UserManagementPage />
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

        {/* ── Fallback ──
            Only evaluated after auth+rights are fully resolved (see guard
            above), so currentUser here is always the real final value —
            never an intermediate null from a cold start race condition.
        ── */}
        <Route path="/" element={
            isReady
              ? <Navigate to={currentUser ? '/products' : '/login'} replace />
              : null
          } />
          <Route path="*" element={
            isReady
              ? <Navigate to={currentUser ? '/products' : '/login'} replace />
              : null
          } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;