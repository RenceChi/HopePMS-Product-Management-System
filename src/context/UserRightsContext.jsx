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
  const { currentUser } = useAuth();
  const [rights, setRights] = useState({});
  const [rightsLoading, setRightsLoading] = useState(true);

  useEffect(() => {
    // No user logged in — clear rights and stop loading
    if (!currentUser?.userid) {
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
          .eq('userid', currentUser.userid)
          .eq('record_status', 'ACTIVE');

        if (error) throw error;

        // Build rights map from DB rows
        // Result: { PRD_ADD: 1, PRD_EDIT: 1, PRD_DEL: 0, REP_001: 1, REP_002: 0, ADM_USER: 0 }
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
  }, [currentUser?.userid]); // Re-fetch only when the logged-in user changes

  // ── Derived role values ───────────────────────────────────
  const userType = currentUser?.user_type ?? 'USER';

  const value = {
    // Raw rights map from DB — used by M2 for button gating
    // Usage: rights.PRD_ADD === 1, rights.PRD_DEL === 1
    rights,
    rightsLoading,

    // Role identity checks
    userType,
    isUser:       userType === 'USER',
    isAdmin:      userType === 'ADMIN',
    isSuperAdmin: userType === 'SUPERADMIN',

    // ── Convenience flags for App.jsx route gating ──────────
    // Both ADMIN and SUPERADMIN can access these routes
    canAccessAdmin:  ['ADMIN', 'SUPERADMIN'].includes(userType),
    canViewDeleted:  ['ADMIN', 'SUPERADMIN'].includes(userType),
  };

  return (
    <UserRightsContext.Provider value={value}>
      {children}
    </UserRightsContext.Provider>
  );
};