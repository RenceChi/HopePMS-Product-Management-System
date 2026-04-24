// src/pages/ProductsPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRights } from '../context/UserRightsContext';
import { getProducts } from '../services/productService';

export default function ProductsPage() {
  const { currentUser } = useAuth();
  const { rights, canAccessAdmin, rightsLoading } = useRights();

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const data = await getProducts(currentUser?.user_type);
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setProductsLoading(false);
      }
    };

    if (currentUser?.user_type) {
      loadProducts();
    }
  }, [currentUser?.user_type]);

  // ── Loading state ─────────────────────────────────────────
  if (productsLoading || rightsLoading) {
    return (
      <div className="p-4 flex items-center justify-center h-48">
        <p className="text-sm text-[#859F3D]">Loading products...</p>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────
  if (error) {
    return (
      <div className="p-4">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#31511E] mb-1">Products</h1>
          <p className="text-xs text-[#859F3D]">Welcome to Hope PMS Products.</p>
        </div>

        {/* Add button — gated by PRD_ADD right */}
        {rights.PRD_ADD === 1 && (
          <button className="bg-[#31511E] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-[#4a7a22] transition-colors">
            + Add Product
          </button>
        )}
      </div>

      {/* ── Empty state ── */}
      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#EDF1D6] p-8 text-center">
          <p className="text-sm text-[#859F3D]">No products found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-[#EDF1D6] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F6FCDF] border-b border-[#EDF1D6]">
                <th className="px-4 py-3 text-xs font-bold text-[#31511E] uppercase">
                  Product Code
                </th>
                <th className="px-4 py-3 text-xs font-bold text-[#31511E] uppercase">
                  Description
                </th>
                <th className="px-4 py-3 text-xs font-bold text-[#31511E] uppercase">
                  Unit
                </th>
                <th className="px-4 py-3 text-xs font-bold text-[#31511E] uppercase">
                  Status
                </th>

                {/* Stamp column — ADMIN and SUPERADMIN only */}
                {canAccessAdmin && (
                  <th className="px-4 py-3 text-xs font-bold text-[#31511E] uppercase">
                    Stamp
                  </th>
                )}

                <th className="px-4 py-3 text-xs font-bold text-[#31511E] uppercase text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr
                  key={prod.prodcode}
                  className="hover:bg-[#F6FCDF]/30 transition-colors border-b border-[#EDF1D6] last:border-b-0"
                >
                  <td className="px-4 py-3 text-sm text-[#1A1A19] font-medium">
                    {prod.prodcode}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#1A1A19]">
                    {prod.description ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#1A1A19]">
                    {prod.unit ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      prod.record_status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {prod.record_status}
                    </span>
                  </td>

                  {/* Stamp cell — ADMIN and SUPERADMIN only */}
                  {canAccessAdmin && (
                    <td className="px-4 py-3 text-[10px] text-[#859F3D] leading-tight">
                      {prod.stamp ?? '—'}
                    </td>
                  )}

                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      {/* Edit — gated by PRD_EDIT right */}
                      {rights.PRD_EDIT === 1 && (
                        <button className="text-blue-600 hover:underline text-xs font-bold uppercase">
                          Edit
                        </button>
                      )}
                      {/* Soft delete — gated by PRD_DEL right */}
                      {rights.PRD_DEL === 1 && (
                        <button className="text-red-600 hover:underline text-xs font-bold uppercase">
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}