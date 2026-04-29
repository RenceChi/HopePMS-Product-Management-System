// src/pages/UserManagementPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRights } from '../context/UserRightsContext';
import { supabase } from '../db/supabase';

export default function UserManagementPage() {
  const { currentUser } = useAuth();
  const { canManageUsers } = useRights();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🚀 Fetch users from Supabase
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        setError(null);

        // Fetching from the 'user' table
        const { data, error: fetchError } = await supabase
          .from('user')
          .select('*')
          .order('username', { ascending: true });

        if (fetchError) throw fetchError;
        setUsers(data || []);
      } catch (err) {
        console.error('Error fetching users:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (canManageUsers) {
      fetchUsers();
    }
  }, [canManageUsers]);

  // 🔒 SECURITY CHECK: If they don't have ADM_USER right, block the whole page
  if (!canManageUsers) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-red-600 font-bold">Access Denied</h2>
        <p className="text-gray-600">You do not have permission to manage users.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="text-xl font-bold text-[#1A1A19]">User Management</h1>
        <p className="text-xs text-[#859F3D]">Manage system access and permissions.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
          <strong>Database Error:</strong> {error}. 
          <p className="mt-1">Please check your Supabase RLS policies for the 'user' table.</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-[#EDF1D6] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F6FCDF] border-b border-[#EDF1D6]">
              <th className="px-4 py-3 text-[10px] font-bold uppercase text-[#31511E]">Username</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase text-[#31511E]">Type</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase text-[#31511E]">Status</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase text-[#31511E] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-xs text-gray-400">
                  Loading user database...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-xs text-gray-400">
                  No users found or access restricted.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                // 🔒 PR-09 GUARD: Identify if the target row is a SUPERADMIN
                const isSuperAdminRow = user.user_type === 'SUPERADMIN';

                return (
                  <tr key={user.userid} className={`border-b border-[#EDF1D6] ${isSuperAdminRow ? 'bg-gray-50' : ''}`}>
                    <td className="px-4 py-3 text-sm">{user.username}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{user.user_type}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        user.record_status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {user.record_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {/* 🔒 Disable buttons if target is SUPERADMIN */}
                        <button
                          disabled={isSuperAdminRow}
                          className={`text-[10px] font-bold uppercase px-3 py-1 rounded transition-all ${
                            isSuperAdminRow 
                              ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                              : 'text-blue-600 hover:bg-blue-50 border border-blue-100'
                          }`}
                          title={isSuperAdminRow ? "SuperAdmin accounts are immutable" : ""}
                        >
                          {isSuperAdminRow ? '🔒 Immutable' : 'Edit Rights'}
                        </button>
                        
                        <button
                          disabled={isSuperAdminRow}
                          className={`text-[10px] font-bold uppercase px-3 py-1 rounded transition-all ${
                            isSuperAdminRow 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-red-600 hover:bg-red-50 border border-red-100'
                          }`}
                        >
                          {user.record_status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center gap-2 px-2">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        <p className="text-[10px] text-gray-400 italic">
          Note: System-level protections prevent modification of SuperAdmin accounts.
        </p>
      </div>
    </div>
  );
}