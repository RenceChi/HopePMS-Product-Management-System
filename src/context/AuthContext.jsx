import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../db/supabase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession]         = useState(null);
  const [loading, setLoading]         = useState(true);

  // Guard ref — tracks the last session user ID we fetched for.
  // Prevents the double-call that happens because getSession() and
  // onAuthStateChange(INITIAL_SESSION) both fire on mount and both
  // previously triggered fetchAndMergeUser for the same session.
  const lastFetchedUid = useRef(null);

  useEffect(() => {
    const fetchAndMergeUser = async (currentSession) => {
      if (!currentSession?.user) {
        lastFetchedUid.current = null;
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      const uid = currentSession.user.id;

      // Skip if we already fetched for this exact user ID.
      // This deduplicates the getSession() + INITIAL_SESSION double-fire.
      if (lastFetchedUid.current === uid) {
        setLoading(false);
        return;
      }
      lastFetchedUid.current = uid;

      try {
        const { data: userRow, error } = await supabase
          .from('user')
          .select('userid, username, firstname, lastname, user_type, record_status')
          .eq('userid', uid)
          .single();

        if (error || !userRow) {
          console.error('Error fetching user row:', error);
          // PENDING — holds ProtectedRoute in null state instead of
          // triggering a premature signOut + redirect to /login?error=inactive
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
        // PENDING here too — catch block should never signOut the user
        setCurrentUser({
          ...currentSession.user,
          user_type:     'USER',
          record_status: 'PENDING',
        });
      } finally {
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
        lastFetchedUid.current = null;
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      if (event === 'TOKEN_REFRESHED') {
        setSession(session);
        return;
      }

      // ✅ ADD THIS BLOCK
      if (event === 'SIGNED_IN') {
        lastFetchedUid.current = null; // reset so same-account re-login isn't blocked
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