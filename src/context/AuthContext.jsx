import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../db/supabase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession]         = useState(null);
  const [loading, setLoading]         = useState(true);

  const fetchInFlight = useRef(false);

  useEffect(() => {
    const fetchAndMergeUser = async (currentSession) => {
      if (!currentSession?.user) {
        fetchInFlight.current = false;
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      if (fetchInFlight.current) return;
      fetchInFlight.current = true;

      try {
        const { data: userRow, error } = await supabase
          .from('user')
          .select('userid, username, firstname, lastname, user_type, record_status')
          .eq('userid', currentSession.user.id)
          .single();

        if (error || !userRow) {
          console.error('Error fetching user row:', error);
          await supabase.auth.signOut(); // clean signout if row missing
          setCurrentUser(null);
        } else {
          setCurrentUser({ ...currentSession.user, ...userRow });
        }
      } catch (err) {
        console.error('fetchAndMergeUser threw:', err);
        await supabase.auth.signOut(); // clean signout on exception too
        setCurrentUser(null);
      } finally {
        fetchInFlight.current = false;
        setLoading(false);
      }
    };

    // ✅ REMOVED getSession() entirely — onAuthStateChange handles
    // the initial session via INITIAL_SESSION event on mount,
    // which eliminates the race condition between the two callers.
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
          return;
        }

        // INITIAL_SESSION fires on mount (replaces getSession)
        // SIGNED_IN fires on login
        // Both should fetch the user row fresh
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          fetchInFlight.current = false; // reset so this event always fetches
          fetchAndMergeUser(session);
          return;
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