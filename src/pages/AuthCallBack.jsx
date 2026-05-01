import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../db/supabase';

/**
 AuthCallback
 Handles the redirect after OAuth (e.g. Google Sign-In).
 Route: /auth/callback
 **/
export default function AuthCallBack() {
  const navigate = useNavigate();
  let handled = false;

  useEffect(() => {
    let handled = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
         handled = true; // ← block any second SIGNED_IN from re-running this

          let userRow = null;
          for (let i = 0; i < 5; i++) {
            const { data } = await supabase
              .from('user')
              .select('record_status')
              .eq('userid', session.user.id)
              .single();

            if (data) { userRow = data; break; }
            await new Promise(res => setTimeout(res, 800));
          }

          if (!userRow || userRow.record_status !== 'ACTIVE') {
            await supabase.auth.signOut();
            navigate('/login?error=inactive', { replace: true });
          } else {
            navigate('/products', { replace: true });
          }
        }

        // Handle cases where the OAuth token in the URL is invalid
        // or the session could not be established by Supabase
        if (event === 'SIGNED_OUT') {
          navigate('/login', { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eeeeee8f]"
      style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #859F3D12 0%, transparent 60%)' }}>

      <div className="flex flex-col items-center gap-6">
        {/* animated logo */}
        <div className="relative w-16 h-16">
          <svg className="absolute inset-0 w-16 h-16 animate-spin" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="28" stroke="#859F3D" strokeWidth="2" strokeDasharray="44 132"
              strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-[#31511E] flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-[#F6FCDF]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h7v7H3zm11 0h7v7h-7zm0 11h7v7h-7zM3 14l3.5-3.5L10 14l-3.5 3.5z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] tracking-[0.3em] text-[#859F3D] uppercase font-bold mb-1">Hope, Inc.</p>
          <p className="text-sm font-semibold text-[#31511E]">Signing you in…</p>
          <p className="text-[11px] text-[#1A1A19]/40 mt-1">Please wait while we set things up.</p>
        </div>

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