import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../db/supabase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession]         = useState(null);
  const [loading, setLoading]         = useState(true);

  // ✅ CHANGED: replaced lastFetchedUid with fetchInFlight
  const fetchInFlight = useRef(false);

  useEffect(() => {
    const fetchAndMergeUser = async (currentSession) => {
      if (!currentSession?.user) {
        fetchInFlight.current = false;
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      if (fetchInFlight.current) {
        setLoading(false);
        return;
      }

      fetchInFlight.current = true;

      try {
        const { data: userRow, error } = await supabase
          .from('user')
          .select('userid, username, firstname, lastname, user_type, record_status')
          .eq('userid', currentSession.user.id)
          .single();

        if (error || !userRow) {
          console.error('Error fetching user row:', error);
          setCurrentUser({
            ...currentSession.user,
            user_type:     'USER',
            record_status: 'PENDING',
          });
        } else {
          setCurrentUser({ ...currentSession.user, ...userRow });
        }
      } catch (err) {
        console.error('fetchAndMergeUser threw:', err);
        setCurrentUser({
          ...currentSession.user,
          user_type:     'USER',
          record_status: 'PENDING',
        });
      } finally {
        fetchInFlight.current = false;
        setLoading(false);
      }
    };

    // Initial session check on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchAndMergeUser(session);
    });

    // Auth state listener — handles login, logout, token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);

        if (event === 'SIGNED_OUT') {
          fetchInFlight.current = false;
          setCurrentUser(null);
          setLoading(false);
          return;
        }

        if (event === 'TOKEN_REFRESHED') {
          setSession(session);
          return;
        }

        if (event === 'SIGNED_IN') {
          fetchInFlight.current = false;
        }

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
      userType: currentUser?.user_type ?? 'USER',
    }}>
      {children}
    </AuthContext.Provider>
  );
};