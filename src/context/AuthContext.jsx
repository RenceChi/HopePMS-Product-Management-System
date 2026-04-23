import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../db/supabase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndMergeUser = async (currentSession) => {
      if (!currentSession?.user) {
        setCurrentUser(null);
        setLoading(false);
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
          // ✅ Safe fallback — most restrictive defaults
          setCurrentUser({
            ...currentSession.user,
            user_type: 'USER',
            record_status: 'INACTIVE',
          });
        } else {
          // ✅ Full merge — user_type and record_status available everywhere
          setCurrentUser({ ...currentSession.user, ...userRow });
        }
      } catch (err) {
        console.error("fetchAndMergeUser threw:", err);
        setCurrentUser({
          ...currentSession.user,
          user_type: 'USER',
          record_status: 'INACTIVE',
        });
      } finally {
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchAndMergeUser(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        fetchAndMergeUser(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser,
      session,
      loading,
      userType: currentUser?.user_type ?? 'USER', // 
    }}>
      {children}
    </AuthContext.Provider>
  );
};