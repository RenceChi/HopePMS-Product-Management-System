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
  const { currentUser, loading } = useAuth();
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
          .from('user_module_rights') // ✅ Confirmed Lowercase
          .select('right_id, rights_value')
          .eq('userid', uid)
          .eq('record_status', 'ACTIVE');

        if (error) throw error;

        const rightsMap = {};
        if (data) {
          data.forEach(row => {
            rightsMap[row.right_id] = row.rights_value;
          });
        }
        setRights(rightsMap);
      } catch (err) {
        console.error("Failed to fetch user rights:", err);
        setRights({});
      } finally {
        setRightsLoading(false);
      }
    };

    fetchRights();
  }, [currentUser?.userid, loading]);

  const userType = currentUser?.user_type ?? 'USER';

  const value = {
    rights,
    rightsLoading,
    userType,
    
    // Role checks
    isUser:       userType === 'USER',
    isAdmin:      userType === 'ADMIN',
    isSuperAdmin: userType === 'SUPERADMIN',

    // Global Gating
    canAccessAdmin: ['ADMIN', 'SUPERADMIN'].includes(userType),
    canViewDeleted: ['ADMIN', 'SUPERADMIN'].includes(userType),

    // 🔒 PR-08/09: Granular Feature Gating
    canViewRep001: rights['REP_001'] === 1,
    canViewRep002: rights['REP_002'] === 1,
    canManageUsers: rights['ADM_USER'] === 1,

    // Button Gating convenience
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