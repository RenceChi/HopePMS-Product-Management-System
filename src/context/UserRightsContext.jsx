// src/context/UserRightsContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../db/supabase";

const UserRightsContext = createContext(null);

export const useRights = () => {
  const context = useContext(UserRightsContext);
  if (!context) throw new Error("useRights must be used within a UserRightsProvider");
  return context;
};

export const UserRightsProvider = ({ children }) => {
  const { currentUser, loading} = useAuth();
  const [rights, setRights] = useState({});
  const [rightsLoading, setRightsLoading] = useState(true);

  
  useEffect(() => {
    // Wait for AuthContext to finish resolving before doing anything
    if (loading) return;

    const uid = currentUser?.userid;

    if (!uid) {
      setRights({});
      setRightsLoading(false);
      return;
    }

    const fetchRights = async () => {
      setRightsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_module_rights')
          .select('right_id, rights_value')
          .eq('userid', uid)
          .eq('record_status', 'ACTIVE');

        if (error) throw error;

        const rightsMap = {};
        data.forEach(row => {
          rightsMap[row.right_id] = row.rights_value;
        });
        setRights(rightsMap);
      } catch (err) {
        console.error("Failed to fetch user rights:", err);
        setRights({});
      } finally {
        setRightsLoading(false);
      }
    };

    fetchRights();
  }, [currentUser?.userid, loading]); // ← wait for loading to settle

  const userType = currentUser?.user_type ?? 'USER';

  // ── PR-08: GRANULAR PERMISSION FLAGS ───────────────────────
  // We use the 'rights' map to determine visibility of specific items
  const value = {
    rights,
    rightsLoading,
    userType,
    
    // Role checks
    isUser:       userType === 'USER',
    isAdmin:      userType === 'ADMIN',
    isSuperAdmin: userType === 'SUPERADMIN',

    // Global Gating (Still used for route protection)
    canAccessAdmin: ['ADMIN', 'SUPERADMIN'].includes(userType),
    canViewDeleted: ['ADMIN', 'SUPERADMIN'].includes(userType),

    // 🔒 PR-08: Granular Feature Gating
    // Product listing report right
    canViewRep001: rights['REP_001'] === 1,
    
    // Top selling report right (Usually SuperAdmin only)
    canViewRep002: rights['REP_002'] === 1,
    
    // User management module right
    canManageUsers: rights['ADM_USER'] === 1,

    // Button Gating convenience (for PR-06 compatibility)
    canEdit:   rights['PRD_EDIT'] === 1,
    canDelete: rights['PRD_DEL'] === 1,
    canAdd:    rights['PRD_ADD'] === 1,
  };

  return (
    <UserRightsContext.Provider value={value}>
      {children}
    </UserRightsContext.Provider>
  );
};