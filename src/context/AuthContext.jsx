import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../db/supabase";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  /* DEV ONLY — role override. Remove before submitting. */
  const [devRoleOverride, setDevRoleOverride] = useState(null);

  useEffect(() => {
    const fetchAndMergeUser = async (currentSession) => {
      if (!currentSession?.user) {
        setCurrentUser(null);
        setLoading(false); // ✅ Always resolve loading even with no session
        return;
      }

      try {
        const { data: userRow, error } = await supabase
          .from('user')
          .select('userid, username, firstname, lastname, user_type, record_status')
          .eq('userid', currentSession.user.id)
          .single();

        if (error || !userRow) {
          console.error("Error fetching user row:", error);
          setCurrentUser(currentSession.user); // Fallback to auth object
        } else {
          setCurrentUser({ ...currentSession.user, ...userRow });
        }
      } catch (err) {
        console.error("fetchAndMergeUser threw:", err);
        setCurrentUser(currentSession.user); // Never leave user stranded
      } finally {
        setLoading(false); // ✅ ALWAYS fires — app never stays blank
      }
    };

    // 1. Check initial session on page load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchAndMergeUser(session);
    });

    // 2. Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        fetchAndMergeUser(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  /* DEV: apply role override to currentUser so all pages see it */
  const effectiveUser = import.meta.env.DEV && devRoleOverride && currentUser
    ? { ...currentUser, user_type: devRoleOverride }
    : currentUser;

  return (
    <AuthContext.Provider value={{
      currentUser: effectiveUser,
      session,
      loading,
      /* DEV ONLY — remove before submitting */
      devRoleOverride,
      setDevRoleOverride,
    }}>
      {children}
    </AuthContext.Provider>
  );
};