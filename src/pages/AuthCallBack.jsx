import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../db/supabase';

/**
 * AuthCallback
 * Handles the redirect after OAuth (e.g. Google Sign-In).
 * Place this at route: /auth/callback
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase automatically parses the URL hash on page load.
    // We just wait for the session to be established, then redirect.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/dashboard', { replace: true });
      } else if (event === 'SIGNED_OUT') {
        navigate('/login', { replace: true });
      }
    });

    // Fallback: check current session in case the event already fired
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard', { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eeeeee8f]"
      style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #859F3D12 0%, transparent 60%)' }}>

      <div className="flex flex-col items-center gap-6">
        {/* animated logo */}
        <div className="relative w-16 h-16">
          {/* spinning ring */}
          <svg className="absolute inset-0 w-16 h-16 animate-spin" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="28" stroke="#859F3D" strokeWidth="2" strokeDasharray="44 132"
              strokeLinecap="round" />
          </svg>
          {/* center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-[#31511E] flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-[#F6FCDF]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h7v7H3zm11 0h7v7h-7zm0 11h7v7h-7zM3 14l3.5-3.5L10 14l-3.5 3.5z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* text */}
        <div className="text-center">
          <p className="text-[10px] tracking-[0.3em] text-[#859F3D] uppercase font-bold mb-1">Hope, Inc.</p>
          <p className="text-sm font-semibold text-[#31511E]">Signing you in…</p>
          <p className="text-[11px] text-[#1A1A19]/40 mt-1">Please wait while we set things up.</p>
        </div>

        {/* progress dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#859F3D]"
              style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}