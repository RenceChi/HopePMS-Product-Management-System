import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../db/supabase';

/* ─── reusable field ─────────────────────────────── */
const Field = ({ label, type = 'text', placeholder, value, onChange, error, extra }) => {
  const [show, setShow] = useState(false);
  const isPass = type === 'password';
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between items-center">
        <label className="text-[10px] tracking-[0.18em] font-semibold uppercase"
          style={{ color: 'rgba(49,81,30,0.65)' }}>
          {label}
        </label>
        {extra}
      </div>
      <div className="relative">
        <input
          type={isPass && show ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full rounded-2xl px-4 py-2.5 text-sm outline-none transition-all duration-200"
          style={{
            background: 'white',
            color: '#1A1A19',
            boxShadow: error
              ? '0 0 0 2px rgba(239,68,68,0.4), 0 2px 8px rgba(49,81,30,0.06)'
              : '0 2px 8px rgba(49,81,30,0.06)',
          }}
          onFocus={e => e.target.style.boxShadow = '0 0 0 2px rgba(133,159,61,0.45), 0 2px 8px rgba(49,81,30,0.06)'}
          onBlur={e => e.target.style.boxShadow = error
            ? '0 0 0 2px rgba(239,68,68,0.4), 0 2px 8px rgba(49,81,30,0.06)'
            : '0 2px 8px rgba(49,81,30,0.06)'}
        />
        {isPass && (
          <button type="button" tabIndex={-1} onClick={() => setShow(s => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: 'rgba(133,159,61,0.5)' }}>
            {show ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  );
};

const GoogleIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

/* ─── main ───────────────────────────────────────── */
export default function AuthPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [isAnimating, setIsAnimating] = useState(false);
  const [panelOnRight, setPanelOnRight] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginErr, setLoginErr] = useState({});
  const [regData, setRegData] = useState({ firstname: '', lastname: '', username: '', email: '', password: '', confirm: '' });
  const [regErr, setRegErr] = useState({});

  const switchMode = (to) => {
    if (to === mode || isAnimating) return;
    setMsg({ type: '', text: '' });
    setIsAnimating(true);
    if (to === 'register') {
      setPanelOnRight(true);
      setTimeout(() => { setMode('register'); setIsAnimating(false); }, 200);
    } else {
      setPanelOnRight(false);
      setTimeout(() => { setMode('login'); setIsAnimating(false); }, 200);
    }
  };

  const validateLogin = () => {
    const e = {};
    if (!loginData.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(loginData.email)) e.email = 'Invalid email';
    if (!loginData.password) e.password = 'Password is required';
    setLoginErr(e); return !Object.keys(e).length;
  };
  const validateReg = () => {
    const e = {};
    if (!regData.firstname.trim()) e.firstname = 'Required';
    if (!regData.lastname.trim()) e.lastname = 'Required';
    if (!regData.username.trim()) e.username = 'Required';
    if (!regData.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(regData.email)) e.email = 'Invalid email';
    if (!regData.password) e.password = 'Required';
    else if (regData.password.length < 8) e.password = 'At least 8 characters';
    if (regData.confirm !== regData.password) e.confirm = 'Passwords do not match';
    setRegErr(e); return !Object.keys(e).length;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setLoading(true); setMsg({ type: '', text: '' });
    const { error } = await supabase.auth.signInWithPassword({ email: loginData.email, password: loginData.password });
    setLoading(false);
    if (error) setMsg({ type: 'error', text: error.message });
    else navigate('/dashboard');
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateReg()) return;
    setLoading(true); setMsg({ type: '', text: '' });
    const { error } = await supabase.auth.signUp({
      email: regData.email, password: regData.password,
      options: { data: { username: regData.username, firstname: regData.firstname, lastname: regData.lastname } },
    });
    setLoading(false);
    if (error) setMsg({ type: 'error', text: error.message });
    else setMsg({ type: 'success', text: 'Account created! Check your email to confirm.' });
  };
  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setMsg({ type: 'error', text: error.message }); setGoogleLoading(false); }
  };

  const isLogin = mode === 'login';
  const panelLeft = panelOnRight ? '58%' : '0%';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-0"
      style={{
        background: 'linear-gradient(135deg, #eeeeee8f 0%, #eeeeee8f 60%, #e4eed8 100%)',
        backgroundImage: `radial-gradient(circle, rgba(49,81,30,0.13) 1px, transparent 1px)`,
        backgroundSize: '36px 36px',
      }}>

      {/* ══ DESKTOP CARD ══ */}
      <div className="relative w-full max-w-[720px] rounded-3xl overflow-hidden hidden md:block"
        style={{
          minHeight: '520px', /* ← increased from 480px for more breathing room */
          background: '#edeeed',
          boxShadow: '0 24px 80px rgba(26, 26, 25, 0.38)',
        }}>

        {/* ── SIGN IN form — RIGHT side ── */}
        <div className="absolute inset-y-0 right-0 w-[58%] flex items-center justify-center px-10 py-10"
          style={{
            opacity: isLogin ? 1 : 0,
            transform: isLogin ? 'translateX(0)' : 'translateX(24px)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
            pointerEvents: isLogin ? 'auto' : 'none',
          }}>
          <div className="w-full max-w-xs">
            <h2 className="text-xl font-bold text-center mb-5"
              style={{ fontFamily: 'Georgia, serif', color: '#1A1A19' }}>
              Sign In
            </h2>
            {msg.text && (
              <div className={`mb-3 px-4 py-2 rounded-xl text-xs font-medium ${msg.type === 'error'
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'}`}>
                {msg.text}
              </div>
            )}
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <Field label="Email Address" type="email" placeholder="you@example.com"
                value={loginData.email} onChange={e => setLoginData(p => ({ ...p, email: e.target.value }))}
                error={loginErr.email} />
              <Field label="Password" type="password" placeholder="••••••••"
                value={loginData.password} onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                error={loginErr.password}
                extra={
                  <button type="button" className="text-[10px] font-semibold" style={{ color: '#859F3D' }}>
                    Forgot password?
                  </button>
                }
              />
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-2xl text-[11px] font-bold tracking-[0.18em] uppercase text-white mt-1
                  transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #4a7a22 0%, #859F3D 100%)', boxShadow: '0 4px 16px rgba(49,81,30,0.3)' }}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'rgba(49,81,30,0.12)' }} />
                <span className="text-[10px] tracking-widest uppercase" style={{ color: 'rgba(49,81,30,0.35)' }}>or</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(49,81,30,0.12)' }} />
              </div>
              <button type="button" onClick={handleGoogle} disabled={googleLoading}
                className="w-full flex items-center justify-center gap-2.5 bg-white py-3 rounded-2xl
                  text-[11px] font-semibold transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-60 hover:bg-white/50"
                style={{ color: '#1A1A19', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', border: '1px solid rgba(49,81,30,0.1)' }}>
                <GoogleIcon />
                {googleLoading ? 'Redirecting…' : 'Sign in with Google'}
              </button>
              <p className="text-center text-[11px]" style={{ color: 'rgba(26,26,25,0.45)' }}>
                No account?{' '}
                <button type="button" onClick={() => switchMode('register')}
                  className="font-bold" style={{ color: '#31511E'  }}>Sign up</button>
              </p>
            </form>
          </div>
        </div>

        {/* ── SIGN UP form — LEFT side ── */}
        <div className="absolute inset-y-0 left-0 w-[58%] flex items-center justify-center px-10 py-10"
          style={{
            opacity: !isLogin ? 1 : 0,
            transform: !isLogin ? 'translateX(0)' : 'translateX(-24px)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
            pointerEvents: !isLogin ? 'auto' : 'none',
          }}>
          <div className="w-full max-w-xs">
            <h2 className="text-xl font-bold text-center mb-5"
              style={{ fontFamily: 'Georgia, serif', color: '#1A1A19' }}>
              Create Account
            </h2>
            {msg.text && (
              <div className={`mb-2 px-3 py-2 rounded-xl text-xs font-medium ${msg.type === 'error'
                ? 'bg-red-50 text-red-400 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'}`}>
                {msg.text}
              </div>
            )}
            <form onSubmit={handleRegister} className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Field label="First Name" placeholder="First Name"
                  value={regData.firstname} onChange={e => setRegData(p => ({ ...p, firstname: e.target.value }))}
                  error={regErr.firstname} />
                <Field label="Last Name" placeholder="Last Name"
                  value={regData.lastname} onChange={e => setRegData(p => ({ ...p, lastname: e.target.value }))}
                  error={regErr.lastname} />
              </div>
              <Field label="Username" placeholder="Username"
                value={regData.username} onChange={e => setRegData(p => ({ ...p, username: e.target.value }))}
                error={regErr.username} />
              <Field label="Email Address" type="email" placeholder="you@example.com"
                value={regData.email} onChange={e => setRegData(p => ({ ...p, email: e.target.value }))}
                error={regErr.email} />
              <div className="flex gap-2">
                <Field label="Password" type="password" placeholder="Password"
                  value={regData.password} onChange={e => setRegData(p => ({ ...p, password: e.target.value }))}
                  error={regErr.password} />
                <Field label="Confirm" type="password" placeholder="Confirm"
                  value={regData.confirm} onChange={e => setRegData(p => ({ ...p, confirm: e.target.value }))}
                  error={regErr.confirm} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-2xl text-[11px] font-bold tracking-[0.18em] uppercase text-white mt-1
                  transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #4a7a22 0%, #859F3D 100%)', boxShadow: '0 4px 16px rgba(49,81,30,0.3)' }}>
                {loading ? 'Creating…' : 'Create Account'}
              </button>
              <p className="text-center text-[11px]" style={{ color: 'rgba(26,26,25,0.45)' }}>
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('login')}
                  className="font-bold" style={{ color: '#31511E' }}>Sign in</button>
              </p>
            </form>
          </div>
        </div>

        {/* ══ GREEN SLIDING PANEL ══ */}
        <div
          className="absolute inset-y-0 w-[42%] rounded-3xl overflow-hidden z-10"
          style={{
            left: panelLeft,
            transition: 'left 0.55s cubic-bezier(0.77,0,0.18,1)',
            background: 'linear-gradient(150deg, #3d6b1e 0%, #31511E 55%, #1e3512 100%)',
          }}
        >
          <div className="absolute top-[-60px] right-[-60px] w-56 h-56 rounded-full"
            style={{ background: 'rgba(133,159,61,0.13)' }} />
          <div className="absolute bottom-[-40px] left-[-40px] w-48 h-48 rounded-full"
            style={{ background: 'rgba(133,159,61,0.09)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
            style={{ border: '1px solid rgba(133,159,61,0.09)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[190px] h-[190px] rounded-full"
            style={{ border: '1px solid rgba(133,159,61,0.07)' }} />

          <div className="relative z-10 h-full flex flex-col items-center justify-center px-7 text-center gap-3">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center"
              style={{
                background: 'rgba(133,159,61,0.18)',
                border: '1px solid rgba(133,159,61,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}>
              <svg className="w-8 h-8" style={{ color: '#a8c44a' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h7v7H3zm11 0h7v7h-7zm0 11h7v7h-7zM3 14l3.5-3.5L10 14l-3.5 3.5z" />
              </svg>
            </div>

            <div>
              <p className="text-[12px] tracking-[0.35em] font-bold uppercase" style={{ color: '#859F3D' }}>
                Hope, Inc.
              </p>
              <p className="text-[8px] tracking-[0.28em] uppercase" style={{ color: 'rgba(246,252,223,0.35)' }}>
                Product Management System
              </p>
              <div className="w-5 h-px mx-auto mt-2 mb-1" style={{ background: '#859F3D' }} />
            </div>

            <div style={{
              opacity: isAnimating ? 0 : 1,
              transform: isAnimating ? 'translateY(6px)' : 'translateY(0)',
              transition: 'opacity 0.25s ease, transform 0.25s ease',
            }}>
              <h3 className="text-2xl font-black text-white leading-tight mb-2"
                style={{ fontFamily: 'Georgia, serif' }}>
                {isLogin ? 'Welcome Back!' : 'Welcome!'}
              </h3>
              <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(246,252,223,0.6)' }}>
                {isLogin
                  ? <>Don't have an account yet?<br />Sign up and start managing your products.</>
                  : <>Already have an account?<br />Sign in and continue where you left off.</>}
              </p>
              <button
                onClick={() => switchMode(isLogin ? 'register' : 'login')}
                className="px-8 py-2 rounded-full text-[11px] tracking-[0.2em] font-bold uppercase text-white
                  transition-all duration-200 hover:bg-white/10 active:scale-95"
                style={{ border: '1.5px solid rgba(255,255,255,0.45)' }}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ DESKTOP FOOTER ══ */}
      <div className="hidden md:flex flex-col items-center gap-1 mt-8 pb-1">
        <p className="text-[12px]" style={{ color: 'rgba(49,81,30,0.25)' }}>
          © {new Date().getFullYear()} Hope, Inc. All rights reserved.
        </p>
      </div>

      {/* ══ MOBILE LAYOUT ══ */}
      <div className="md:hidden flex flex-col w-full">
        <div className="flex flex-col rounded-3xl overflow-hidden"
          style={{ background: '#edeeed', boxShadow: '0 24px 80px rgba(26, 26, 25, 0.32)' }}>
          {/* compact green header */}
          <div className="relative flex items-center justify-center gap-1 py-5 px-6 flex-shrink-0"
            style={{ background: 'linear-gradient(150deg, #3d6b1e 0%, #31511E 100%)' }}>
            <div className="absolute top-[-20px] right-[-20px] w-24 h-24 rounded-full"
              style={{ background: 'rgba(133,159,61,0.12)' }} />
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(133,159,61,0.2)', border: '1px solid rgba(133,159,61,0.3)' }}>
              <svg className="w-5 h-5" style={{ color: '#a8c44a' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h7v7H3zm11 0h7v7h-7zm0 11h7v7h-7zM3 14l3.5-3.5L10 14l-3.5 3.5z" />
              </svg>
            </div>
            <div>
              <p className="text-[8px] tracking-[0.3em] font-bold uppercase" style={{ color: '#859F3D' }}>Hope, Inc.</p>
              <p className="text-[6.5px] tracking-[0.22em] uppercase" style={{ color: 'rgba(246,252,223,0.4)' }}>
                Product Management System
              </p>
            </div>
          </div>

          {/* mobile tab switcher */}
          <div className="flex mx-6 mt-5 rounded-2xl overflow-hidden"
            style={{ background: 'rgba(49,81,30,0.08)' }}>
            {['login', 'register'].map(tab => (
              <button key={tab} onClick={() => switchMode(tab)}
                className="flex-1 py-2.5 text-[11px] font-bold tracking-wide uppercase rounded-2xl transition-all duration-300"
                style={{
                  background: mode === tab ? '#31511E' : 'transparent',
                  color: mode === tab ? '#edeeed' : 'rgba(49,81,30,0.5)',
                }}>
                {tab === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* mobile form area */}
          <div className="relative overflow-hidden" style={{ minHeight: '450px' }}>
            {/* sign in */}
            <div className="absolute inset-0 px-6 py-8 flex flex-col"
              style={{
                opacity: isLogin ? 1 : 0,
                transform: isLogin ? 'translateX(0)' : 'translateX(-20px)',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                pointerEvents: isLogin ? 'auto' : 'none',
              }}>
              {msg.text && (
                <div className={`mb-3 px-4 py-2.5 rounded-xl text-xs font-medium ${msg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {msg.text}
                </div>
              )}
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <Field label="Email Address" type="email" placeholder="you@example.com"
                  value={loginData.email} onChange={e => setLoginData(p => ({ ...p, email: e.target.value }))}
                  error={loginErr.email} />
                <Field label="Password" type="password" placeholder="••••••••"
                  value={loginData.password} onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                  error={loginErr.password}
                  extra={<button type="button" className="text-[10px] font-semibold" style={{ color: '#859F3D' }}>Forgot password?</button>}
                />
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-2xl text-[11px] font-bold tracking-[0.18em] uppercase text-white
                    transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #4a7a22 0%, #859F3D 100%)', boxShadow: '0 4px 16px rgba(49,81,30,0.3)' }}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: 'rgba(49,81,30,0.12)' }} />
                  <span className="text-[10px] tracking-widest uppercase" style={{ color: 'rgba(49,81,30,0.35)' }}>or</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(49,81,30,0.12)' }} />
                </div>
                <button type="button" onClick={handleGoogle} disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-2.5 bg-white py-3.5 rounded-2xl
                    text-[11px] font-semibold transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-60  hover:bg-white/50"
                  style={{ color: '#1A1A19', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', border: '1px solid rgba(49,81,30,0.1)' }}>
                  <GoogleIcon />
                  {googleLoading ? 'Redirecting…' : 'Sign in with Google'}
                </button>
              </form>
            </div>

            {/* sign up */}
            <div className="absolute inset-0 px-6 py-8 flex flex-col overflow-y-auto"
              style={{
                opacity: !isLogin ? 1 : 0,
                transform: !isLogin ? 'translateX(0)' : 'translateX(20px)',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                pointerEvents: !isLogin ? 'auto' : 'none',
              }}>
              {msg.text && (
                <div className={`mb-3 px-4 py-2.5 rounded-xl text-xs font-medium ${msg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {msg.text}
                </div>
              )}
              <form onSubmit={handleRegister} className="flex flex-col gap-1">
                <div className="flex gap-3">
                  <Field label="First Name" placeholder="First Name"
                    value={regData.firstname} onChange={e => setRegData(p => ({ ...p, firstname: e.target.value }))}
                    error={regErr.firstname} />
                  <Field label="Last Name" placeholder="Last Name"
                    value={regData.lastname} onChange={e => setRegData(p => ({ ...p, lastname: e.target.value }))}
                    error={regErr.lastname} />
                </div>
                <Field label="Username" placeholder="Username"
                  value={regData.username} onChange={e => setRegData(p => ({ ...p, username: e.target.value }))}
                  error={regErr.username} />
                <Field label="Email Address" type="email" placeholder="you@example.com"
                  value={regData.email} onChange={e => setRegData(p => ({ ...p, email: e.target.value }))}
                  error={regErr.email} />
                <div className="flex gap-3">
                  <Field label="Password" type="password" placeholder="Password"
                    value={regData.password} onChange={e => setRegData(p => ({ ...p, password: e.target.value }))}
                    error={regErr.password} />
                  <Field label="Confirm" type="password" placeholder="Confirm"
                    value={regData.confirm} onChange={e => setRegData(p => ({ ...p, confirm: e.target.value }))}
                    error={regErr.confirm} />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-2xl text-[11px] font-bold tracking-[0.18em] uppercase text-white mt-1
                    transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #4a7a22 0%, #859F3D 100%)', boxShadow: '0 4px 16px rgba(49,81,30,0.3)' }}>
                  {loading ? 'Creating…' : 'Create Account'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ══ MOBILE FOOTER ══ */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1 py-1 px-1 mt-10">
          <p className="text-[10px]" style={{ color: 'rgba(49,81,30,0.25)' }}>
            © {new Date().getFullYear()} Hope, Inc. All rights reserved.
          </p>
        </div>
      </div>

    </div>
  );
}