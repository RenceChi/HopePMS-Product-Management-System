import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getProducts,
  softDeleteProduct,
  getUserRights,
} from '../services/productService';
import AddProductModal from '../components/AddProductModal';
import EditProductModal from '../components/EditProductModal';
import SoftDeleteConfirmDialog from '../components/SoftDeleteConfirmDialog';
import PriceHistoryPanel from '../components/PriceHistoryPanel';

const StatusBadge = ({ status }) => (
  <span
    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide"
    style={status === 'ACTIVE'
      ? { background: 'rgba(133,159,61,0.12)', color: '#31511E' }
      : { background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}
  >
    <span className="w-1.5 h-1.5 rounded-full"
      style={{ background: status === 'ACTIVE' ? '#859F3D' : '#dc2626' }} />
    {status}
  </span>
);

const SkeletonRow = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3.5 rounded-full animate-pulse"
          style={{ background: 'rgba(133,159,61,0.1)', width: `${60 + (i * 13) % 30}%` }} />
      </td>
    ))}
  </tr>
);

function ActionBtn({ title, color, hoverBg, hoverColor, onClick, children }) {
  return (
    <button title={title} onClick={onClick}
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
      style={{ color }}
      onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = hoverColor; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = color; }}>
      {children}
    </button>
  );
}

export default function ProductListPage() {
  const { currentUser } = useAuth();
  const userType  = currentUser?.user_type ?? 'USER';
  const userId    = currentUser?.userid ?? currentUser?.id ?? '';
  const showStamp = ['ADMIN', 'SUPERADMIN'].includes(userType);

  // Rights fetched from DB — never rely on currentUser for rights
  const [rights, setRights] = useState({ PRD_ADD: false, PRD_EDIT: false, PRD_DEL: false });
  const [rightsLoading, setRightsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setRightsLoading(true);
    getUserRights(userId, userType)
      .then(map => setRights(map))
      .catch(console.error)
      .finally(() => setRightsLoading(false));
  }, [userId, userType]); // userType in deps so dev switcher triggers re-fetch

  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [showAdd, setShowAdd]           = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let data = await getProducts(userType);
      if (userType !== 'USER' && statusFilter !== 'ALL')
        data = data.filter(p => p.record_status === statusFilter);
      setProducts(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [userType, statusFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (prodcode) => {
    try {
      await softDeleteProduct(prodcode, userId);
      setDeleteTarget(null);
      fetchProducts();
      return null;
    } catch (err) { return err; }
  };

  const visible = products.filter(p =>
    p.prodcode?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const colCount = 4 + (showStamp ? 1 : 0) + 1;
  const isLoading = loading || rightsLoading;

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1A1A19' }}>Products</h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(26,26,25,0.45)' }}>
            Manage product catalogue
            <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase"
              style={{ background: 'rgba(133,159,61,0.12)', color: '#31511E' }}>
              {userType}
            </span>
          </p>
        </div>
        {rights.PRD_ADD && (
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0"
            style={{ background: '#31511E', color: '#F6FCDF', boxShadow: '0 2px 10px rgba(49,81,30,0.25)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#3d6626'}
            onMouseLeave={e => e.currentTarget.style.background = '#31511E'}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
            </svg>
            Add Product
          </button>
        )}
      </div>

      {/* toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
            fill="none" stroke="rgba(133,159,61,0.5)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
          </svg>
          <input type="text" placeholder="Search by code or description…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
            style={{ background: 'white', color: '#1A1A19', boxShadow: '0 2px 8px rgba(49,81,30,0.07)' }}
            onFocus={e => e.target.style.boxShadow = '0 0 0 2px rgba(133,159,61,0.35), 0 2px 8px rgba(49,81,30,0.07)'}
            onBlur={e => e.target.style.boxShadow = '0 2px 8px rgba(49,81,30,0.07)'} />
        </div>
        {userType !== 'USER' && (
          <div className="flex rounded-xl overflow-hidden shrink-0"
            style={{ boxShadow: '0 2px 8px rgba(49,81,30,0.07)', background: 'white' }}>
            {['ACTIVE', 'INACTIVE', 'ALL'].map(val => (
              <button key={val} onClick={() => setStatusFilter(val)}
                className="px-3.5 py-2 text-xs font-semibold transition-all"
                style={{ background: statusFilter === val ? '#31511E' : 'transparent',
                  color: statusFilter === val ? '#F6FCDF' : 'rgba(26,26,25,0.5)' }}>
                {val}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {/* table */}
      <div className="flex-1 overflow-hidden rounded-2xl"
        style={{ background: 'white', boxShadow: '0 4px 24px rgba(26,26,25,0.07)', border: '1px solid rgba(133,159,61,0.1)' }}>
        <div className="overflow-x-auto h-full">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(133,159,61,0.12)' }}>
                {['Prod. Code', 'Description', 'Unit', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.15em] uppercase"
                    style={{ color: 'rgba(133,159,61,0.6)', background: 'rgba(246,252,223,0.45)' }}>{h}</th>
                ))}
                {showStamp && (
                  <th className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.15em] uppercase"
                    style={{ color: 'rgba(133,159,61,0.6)', background: 'rgba(246,252,223,0.45)' }}>Stamp</th>
                )}
                <th className="px-4 py-3 text-right text-[10px] font-bold tracking-[0.15em] uppercase"
                  style={{ color: 'rgba(133,159,61,0.6)', background: 'rgba(246,252,223,0.45)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={colCount} />)
                : visible.length === 0
                  ? (
                    <tr><td colSpan={colCount} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2">
                        <svg width="32" height="32" fill="none" stroke="rgba(133,159,61,0.3)" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                        </svg>
                        <p className="text-sm font-medium" style={{ color: 'rgba(26,26,25,0.35)' }}>
                          {search ? 'No results found' : 'No products yet'}
                        </p>
                      </div>
                    </td></tr>
                  )
                  : visible.map((product, idx) => (
                    <tr key={product.prodcode} className="transition-colors"
                      style={{
                        borderBottom: idx < visible.length - 1 ? '1px solid rgba(133,159,61,0.07)' : 'none',
                        background: product.record_status === 'INACTIVE' ? 'rgba(239,68,68,0.02)' : 'transparent',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(133,159,61,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background =
                        product.record_status === 'INACTIVE' ? 'rgba(239,68,68,0.02)' : 'transparent'}>
                      <td className="px-4 py-3 text-sm font-bold" style={{ color: '#31511E' }}>{product.prodcode}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#1A1A19' }}>{product.description}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-lg font-medium"
                          style={{ background: 'rgba(133,159,61,0.09)', color: '#31511E' }}>{product.unit}</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={product.record_status} /></td>
                      {showStamp && (
                        <td className="px-4 py-3 text-[11px] font-mono max-w-[180px] truncate"
                          style={{ color: 'rgba(26,26,25,0.4)' }} title={product.stamp}>
                          {product.stamp ?? '—'}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <ActionBtn title="Price History" color="rgba(133,159,61,0.6)"
                            hoverBg="rgba(133,159,61,0.12)" hoverColor="#31511E"
                            onClick={() => setHistoryTarget(product)}>
                            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                            </svg>
                          </ActionBtn>
                          {rights.PRD_EDIT && product.record_status === 'ACTIVE' && (
                            <ActionBtn title="Edit Product" color="rgba(26,26,25,0.4)"
                              hoverBg="rgba(133,159,61,0.12)" hoverColor="#31511E"
                              onClick={() => setEditTarget(product)}>
                              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                              </svg>
                            </ActionBtn>
                          )}
                          {rights.PRD_DEL && product.record_status === 'ACTIVE' && (
                            <ActionBtn title="Soft Delete" color="rgba(220,38,38,0.5)"
                              hoverBg="rgba(239,68,68,0.09)" hoverColor="#dc2626"
                              onClick={() => setDeleteTarget(product)}>
                              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            </ActionBtn>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        {!isLoading && (
          <div className="px-4 py-2.5 flex items-center justify-between"
            style={{ borderTop: '1px solid rgba(133,159,61,0.08)' }}>
            <p className="text-[10px]" style={{ color: 'rgba(26,26,25,0.35)' }}>
              {visible.length} product{visible.length !== 1 ? 's' : ''} shown
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="text-[10px] underline"
                style={{ color: 'rgba(133,159,61,0.6)' }}>Clear search</button>
            )}
          </div>
        )}
      </div>

      {showAdd && (
        <AddProductModal currentUser={currentUser}
          onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); fetchProducts(); }} />
      )}
      {editTarget && (
        <EditProductModal product={editTarget} currentUser={currentUser}
          onClose={() => setEditTarget(null)}
          onSuccess={() => { setEditTarget(null); fetchProducts(); }} />
      )}
      {deleteTarget && (
        <SoftDeleteConfirmDialog product={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget.prodcode)} />
      )}
      {historyTarget && (
        <PriceHistoryPanel product={historyTarget} currentUser={currentUser}
          onClose={() => setHistoryTarget(null)} />
      )}
    </div>
  );
}