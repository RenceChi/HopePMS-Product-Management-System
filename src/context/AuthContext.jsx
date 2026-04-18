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

  useEffect(() => {
    // ✅ Bug #5 Fixed: Helper function to fetch and merge custom user data
    const fetchAndMergeUser = async (currentSession) => {
      if (!currentSession?.user) {
        setCurrentUser(null);
        return;
      }

      const { data: userRow, error } = await supabase
        .from('user')
        .select('userid, username, firstname, lastname, user_type, record_status')
        .eq('userid', currentSession.user.id)
        .single();

      if (error) {
        console.error("Error fetching custom user details:", error);
        setCurrentUser(currentSession.user); // Fallback to just the auth object
      } else {
        // Spread both objects together into one powerful currentUser
        setCurrentUser({ ...currentSession.user, ...userRow });
      }
    };

    // 1. Check the initial session on page load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      await fetchAndMergeUser(session);
      setLoading(false);
    });

    // 2. Listen for active login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        await fetchAndMergeUser(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, session, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};