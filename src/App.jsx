import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; 
import { useRights } from './context/UserRightsContext'; 

import ProtectedRoute from './router/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import AuthCallBack from './pages/AuthCallBack'; 
import MainLayout from './components/MainLayout';
import PriceHistSandbox from './test/PriceHistSandbox';

/* ── PR-06: Updated ProductsPage with UI Gating ── */
const ProductsPage = () => {
  // Pull granular rights from our context
  const { canEdit, canDelete, isAdmin } = useRights();

  // Mock data for demonstration
  const mockProducts = [
    { id: 1, name: "Sample Product", price: 100, created_by: "Admin", updated_at: "2024-05-20" }
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#31511E] mb-1">Products</h1>
          <p className="text-xs text-[#859F3D]">Welcome to Hope PMS Products.</p>
        </div>

        {/* 🔒 UI GATING: Only show Add button if user has edit/add rights */}
        {canEdit && (
          <button className="bg-[#31511E] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-[#4a7a22] transition-colors">
            + Add Product
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#EDF1D6] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F6FCDF] border-b border-[#EDF1D6]">
              <th className="px-4 py-3 text-xs font-bold text-[#31511E] uppercase">Product</th>
              <th className="px-4 py-3 text-xs font-bold text-[#31511E] uppercase">Price</th>
              
              {/* 🔒 RULE: Stamp column visible ONLY to ADMIN/SUPERADMIN */}
              {isAdmin && (
                <th className="px-4 py-3 text-xs font-bold text-[#31511E] uppercase">Audit Stamp</th>
              )}
              
              <th className="px-4 py-3 text-xs font-bold text-[#31511E] uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockProducts.map((prod) => (
              <tr key={prod.id} className="hover:bg-[#F6FCDF]/30 transition-colors">
                <td className="px-4 py-3 text-sm text-[#1A1A19] font-medium">{prod.name}</td>
                <td className="px-4 py-3 text-sm text-[#1A1A19]">₱{prod.price}</td>
                
                {/* 🔒 RULE: Display Stamp data only for Admin */}
                {isAdmin && (
                  <td className="px-4 py-3 text-[10px] text-[#859F3D] leading-tight">
                    Created by: {prod.created_by} <br/>
                    Last Update: {prod.updated_at}
                  </td>
                )}

                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    {/* 🔒 UI GATING: Edit Button */}
                    {canEdit && (
                      <button className="text-blue-600 hover:underline text-xs font-bold uppercase">Edit</button>
                    )}
                    {/* 🔒 UI GATING: Delete Button (Soft-delete logic) */}
                    {canDelete && (
                      <button className="text-red-600 hover:underline text-xs font-bold uppercase">Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 border-t border-[#EDF1D6] pt-6">
        <PriceHistSandbox />
      </div>
    </div>
  );
};

/* ── Other Page Placeholders remain the same ── */
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

const DeletedItemsPage = () => (
  <div className="p-4">
    <h1 className="text-xl font-bold text-[#31511E] mb-1">Deleted Items</h1>
    <p className="text-xs text-[#859F3D]">Recover or permanently delete items.</p>
  </div>
);

function App() {
  const { currentUser, loading } = useAuth();
  const { canAccessAdmin, canViewDeleted, rightsLoading } = useRights();

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallBack />} />

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

        <Route path="/" element={<Navigate to={currentUser ? '/products' : '/login'} replace />} />
        <Route path="*" element={<Navigate to={currentUser ? '/products' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;