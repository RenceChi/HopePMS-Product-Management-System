import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import ProtectedRoute from './router/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import AuthCallBack from './pages/AuthCallBack';
import MainLayout from './components/MainLayout';

/* ── Sprint 2 pages ── */
import ProductListPage from './pages/ProductListPage';
import DeletedItemsPage from './pages/DeletedItemsPage';


/* ── placeholder pages (replace with real ones in Sprint 2/3) ── */
const DashboardPage = () => (
  <div>
    <h1 className="text-xl font-bold text-[#31511E] mb-1">Dashboard</h1>
    <p className="text-xs text-[#859F3D]">Welcome to Hope PMS.</p>
  </div>
);

const PriceHistoryStandalonePage = () => (
  <div>
    <h1 className="text-xl font-bold text-[#31511E] mb-1">Price History</h1>
    <p className="text-xs text-[#859F3D]">
      Use the price history panel on a product row to view and add price entries.
    </p>
  </div>
);

const SalesPage = () => (
  <div>
    <h1 className="text-xl font-bold text-[#31511E] mb-1">Sales</h1>
    <p className="text-xs text-[#859F3D]">Sales records will appear here.</p>
  </div>
);

const CustomersPage = () => (
  <div>
    <h1 className="text-xl font-bold text-[#31511E] mb-1">Customers</h1>
    <p className="text-xs text-[#859F3D]">Customer management coming in Sprint 3.</p>
  </div>
);

const PaymentsPage = () => (
  <div>
    <h1 className="text-xl font-bold text-[#31511E] mb-1">Payments</h1>
    <p className="text-xs text-[#859F3D]">Payment records coming in Sprint 3.</p>
  </div>
);

const ReportsPage = () => (
  <div>
    <h1 className="text-xl font-bold text-[#31511E] mb-1">Reports</h1>
    <p className="text-xs text-[#859F3D]">Reports module coming in Sprint 3.</p>
  </div>
);

const AdminPage = () => (
  <div>
    <h1 className="text-xl font-bold text-[#31511E] mb-1">Admin — User Management</h1>
    <p className="text-xs text-[#859F3D]">User management coming in Sprint 3.</p>
  </div>
);

/* ── route guard for admin-only pages ── */
function AdminRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  const userType = currentUser?.user_type ?? 'USER';
  if (!['ADMIN', 'SUPERADMIN'].includes(userType)) {
    return <Navigate to="/products" replace />;
  }
  return children;
}

function App() {
  const { currentUser, loading } = useAuth();
  if (loading) return null;

  const wrap = (page) => (
    <ProtectedRoute>
      <MainLayout user={currentUser}>{page}</MainLayout>
    </ProtectedRoute>
  );

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"         element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallBack />} />

        {/* Protected — general */}
        <Route path="/dashboard"    element={wrap(<DashboardPage />)} />
        <Route path="/products"     element={wrap(<ProductListPage />)} />
        <Route path="/price-history" element={wrap(<PriceHistoryStandalonePage />)} />
        <Route path="/sales"        element={wrap(<SalesPage />)} />
        <Route path="/customers"    element={wrap(<CustomersPage />)} />
        <Route path="/payments"     element={wrap(<PaymentsPage />)} />
        <Route path="/reports"      element={wrap(<ReportsPage />)} />

        {/* Protected — admin/superadmin only */}
        <Route
          path="/deleted-items"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <MainLayout user={currentUser}>
                  <DeletedItemsPage />
                </MainLayout>
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <MainLayout user={currentUser}>
                  <AdminPage />
                </MainLayout>
              </AdminRoute>
            </ProtectedRoute>
          }
        />


        {/* Root and fallback */}
        <Route path="/"  element={<Navigate to={currentUser ? '/products' : '/login'} replace />} />
        <Route path="*"  element={<Navigate to={currentUser ? '/products' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;