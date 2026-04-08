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
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setCurrentUser(session?.user ?? null);
    setLoading(false);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setSession(session);
      setCurrentUser(session?.user ?? null);
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