import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; 

import ProtectedRoute from './router/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import AuthCallBack from './pages/AuthCallBack'; // ✅ Using the Vercel-safe capitalized name!
import MainLayout from './components/MainLayout';
import ProductSandbox from './test/ProductSandbox';
import PriceHistSandbox from './test/PriceHistSandbox';

/* ── placeholder pages (replace with real ones later) ── */
const ProductsPage = () => (
  <div>
    <h1 className="text-xl font-bold text-[#31511E] mb-1">Products</h1>
    <p className="text-xs text-[#859F3D]">Welcome to Hope PMS Products.</p>
    <div className="mt-8">
      <ProductSandbox />
    </div>
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
  // ✅ Consuming currentUser instead of session for more accurate routing logic
  const { currentUser, loading } = useAuth();

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
              {/* Passing currentUser back to MainLayout */}
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
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <MainLayout user={currentUser}>
                <AdminPage />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/deleted-items" 
          element={
            <ProtectedRoute>
              <MainLayout user={currentUser}>
                <DeletedItemsPage />
              </MainLayout>
            </ProtectedRoute>
          } 
        />

        {/* Root and fallback — explicit redirect based on auth state */}
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