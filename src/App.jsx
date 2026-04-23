import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; 
import { useRights } from './context/UserRightsContext'; // ✅ Added for PR-05

import ProtectedRoute from './router/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import AuthCallBack from './pages/AuthCallBack'; 
import MainLayout from './components/MainLayout';
import PriceHistSandbox from './test/PriceHistSandbox';


/* ── placeholder pages ── */
const ProductsPage = () => (
  <div>
    <h1 className="text-xl font-bold text-[#31511E] mb-1">Products</h1>
    <p className="text-xs text-[#859F3D]">Welcome to Hope PMS Products.</p>
    <div className="mt-8">
      <PriceHistSandbox />
    </div>
  </div>
);

const ReportsPage = () => (
  <div>
    <h1 className="text-xl font-bold text-[#31511E] mb-1">Reports</h1>
    <p className="text-xs text-[#859F3D]">View system reports here.</p>
  </div>
);

const AdminPage = () => (
  <div>
    <h1 className="text-xl font-bold text-[#31511E] mb-1">Admin Dashboard</h1>
    <p className="text-xs text-[#859F3D]">Manage users and system settings.</p>
  </div>
);

const DeletedItemsPage = () => (
  <div>
    <h1 className="text-xl font-bold text-[#31511E] mb-1">Deleted Items</h1>
    <p className="text-xs text-[#859F3D]">Recover or permanently delete items.</p>
  </div>
);

function App() {
  const { currentUser, loading } = useAuth();
  const { canAccessAdmin, canViewDeleted, rightsLoading } = useRights(); // ✅ Pull permissions from context

  // Show nothing while auth state is being determined
  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallBack />} />

        {/* Protected */}
        <Route 
          path="/products" 
          element={
            <ProtectedRoute>
              <MainLayout user={currentUser}>
                <ProductsPage />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <MainLayout user={currentUser}>
                <ReportsPage />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        
      {/* ✅ Admin Gating */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            {rightsLoading ? null : canAccessAdmin ? (
              <MainLayout user={currentUser}>
                <AdminPage />
              </MainLayout>
            ) : (
              <Navigate to="/products" replace />
            )}
          </ProtectedRoute>
        }
      />

      {/* ✅ Deleted Items Gating */}
      <Route
          path="/deleted-items"
          element={
            <ProtectedRoute>
              {rightsLoading ? null : canViewDeleted ? (
                <MainLayout user={currentUser}>
                  <DeletedItemsPage />
                </MainLayout>
              ) : (
                <Navigate to="/products" replace />
              )}
            </ProtectedRoute>
          }
        />

        {/* Root and fallback */}
        <Route 
          path="/" 
          element={
            <Navigate to={currentUser ? '/products' : '/login'} replace />
          } 
        />
        <Route 
          path="*" 
          element={
            <Navigate to={currentUser ? '/products' : '/login'} replace />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
