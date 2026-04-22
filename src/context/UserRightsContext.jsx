import { createContext, useContext, useMemo } from "react";
import { useAuth } from "./AuthContext";

// 1. Initialize the Context
const UserRightsContext = createContext();

// 2. Custom Hook for easy access in components
export const useRights = () => {
  const context = useContext(UserRightsContext);
  if (!context) {
    throw new Error("useRights must be used within a UserRightsProvider");
  }
  return context;
};

export const UserRightsProvider = ({ children }) => {
  const { currentUser } = useAuth(); // Consume AuthContext

  // 3. Define the Permissions Logic
  // We use useMemo so we only recalculate when the currentUser changes
  const rights = useMemo(() => {
    const role = currentUser?.user_type;

    return {
      // Role Checks
      isAdmin: role === 'Admin',
      isStaff: role === 'Staff',
      isViewer: role === 'Viewer',

      // Feature Gating (PR-06 & PR-07)
      canEdit: ['Admin', 'Staff'].includes(role),
      canDelete: role === 'Admin',
      canAccessAdmin: role === 'Admin',
      canViewDeleted: role === 'Admin',
      
      // Helper for UI loading states
      hasRightsLoaded: !!currentUser
    };
  }, [currentUser]);

  return (
    <UserRightsContext.Provider value={rights}>
      {children}
    </UserRightsContext.Provider>
  );
};