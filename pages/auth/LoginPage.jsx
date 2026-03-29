import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../db/supabase'

const EyeIcon = ({ show }) => show ? (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const AuthPage = () => {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [phase, setPhase] = useState('idle')
  const [contentVisible, setContentVisible] = useState(true)
  const [sweepDir, setSweepDir] = useState('from-left')

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [showLoginPass, setShowLoginPass] = useState(false)

  const [regForm, setRegForm] = useState({ firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: '' })
  const [regErrors, setRegErrors] = useState({})
  const [regError, setRegError] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [regSuccess, setRegSuccess] = useState(false)
  const [showRegPass, setShowRegPass] = useState(false)
  const [showRegConfirm, setShowRegConfirm] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const switchMode = (toLogin) => {
    if (phase !== 'idle') return
    setContentVisible(false)
    setPhase('expand')
    setTimeout(() => {
      setIsLogin(toLogin)
      setSweepDir(toLogin ? 'from-left' : 'from-right')
      setPhase('contract')
      setTimeout(() => {
        setContentVisible(true)
        setPhase('idle')
      }, 480)
    }, 420)
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault(); setLoginLoading(true); setLoginError('')
    const { error } = await supabase.auth.signInWithPassword({ email: loginForm.email, password: loginForm.password })
    if (error) { setLoginError(error.message); setLoginLoading(false) }
    else navigate('/dashboard')
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setGoogleLoading(false)
  }

  const validateReg = () => {
    const e = {}
    if (!regForm.firstName.trim()) e.firstName = 'Required'
    if (!regForm.lastName.trim()) e.lastName = 'Required'
    if (!regForm.username.trim()) e.username = 'Required'
    if (!regForm.email.trim()) e.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email)) e.email = 'Invalid email'
    if (!regForm.password) e.password = 'Required'
    else if (regForm.password.length < 8) e.password = 'Min 8 chars'
    if (regForm.password !== regForm.confirmPassword) e.confirmPassword = "Passwords don't match"
    return e
  }

  const handleRegSubmit = async (e) => {
    e.preventDefault()
    const errs = validateReg()
    if (Object.keys(errs).length > 0) { setRegErrors(errs); return }
    setRegLoading(true); setRegError('')
    const { data, error } = await supabase.auth.signUp({
      email: regForm.email, password: regForm.password,
      options: {
        data: { first_name: regForm.firstName, last_name: regForm.lastName, username: regForm.username },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) { setRegError(error.message); setRegLoading(false); return }
    if (data.user) {
      await supabase.from('user').insert({
        userid: data.user.id, email: regForm.email, username: regForm.username,
        user_type: 'USER', record_status: 'ACTIVE', created_by: data.user.id,
      })
    }
    setRegSuccess(true); setRegLoading(false)
  }

  // LOGIN  → teal RIGHT: 36% top-left, 58% bottom-left
  // SIGNUP → teal LEFT:  70% top-right, 48% bottom-right
  const getClipPath = () => {
    if (phase === 'expand') return 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
    if (isLogin) return 'polygon(35% 0%, 100% 0%, 100% 100%, 55% 100%)'
    return 'polygon(0% 0%, 63% 0%, 45% 100%, 0% 100%)'
  }
  const getTrans = () => phase === 'idle' ? 'none' : 'clip-path 0.42s cubic-bezier(0.76,0,0.24,1)'
  const getJustify = () => {
    if (phase === 'expand') return 'center'
    return isLogin ? 'flex-end' : 'flex-start'
  }
  const getPad = () => {
    if (phase === 'expand') return '0'
    return isLogin ? '0 5% 0 0' : '0 0 0 5%'
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── COLOR TOKENS ──
           #859F3D  olive green (accent)
           #F6FCDF  light cream (teal panel bg)
           #31511E  dark forest green (dark accent)
           #1A1A19  near-black (background)
        */

        .auth-page {
          min-height: 100vh;
          background: #eeeeee8f;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 20px;
          font-family: 'Rajdhani', sans-serif;
          overflow: hidden; position: relative;
        }
        .blob {
          position: absolute; border-radius: 50%;
          filter: blur(130px); pointer-events: none;
          animation: blobFloat 12s ease-in-out infinite alternate;
        }
        @keyframes blobFloat {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(24px,16px) scale(1.06); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* ══ DESKTOP CARD ══ */
        .desktop-card {
          position: relative;
          width: 100%; max-width: 860px;
          border-radius: 22px; overflow: hidden;
          display: flex;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.7),
            0 8px 32px rgba(49,81,30,0.12),
            0 32px 80px rgba(49,81,30,0.1);
          animation: fadeUp 0.5s ease forwards;
        }

        /* Login panel — glassmorphism */
        .panel-login {
          width: 42%; flex-shrink: 0;
          background: rgba(255, 255, 255, 0.07);
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          border-right: 1px solid rgba(255, 255, 255, 0.07);
          display: flex; align-items: center; justify-content: center;
          padding: 40px 36px;
          min-height: 480px;
        }
        /* Signup panel — glassmorphism */
        .panel-signup {
          width: 70%; flex-shrink: 0;
          background: rgba(255, 255, 255, 0.07);
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          display: flex; align-items: center; justify-content: center;
          padding: 40px 42px;
          min-height: 480px;
        }
        .form-inner { width: 100%; max-width: 300px; }

        /* ══ TEAL (CREAM) OVERLAY ══ */
        .teal-overlay {
          position: absolute; inset: 0; z-index: 10;
          background: linear-gradient(145deg, #31511E 0%, #3d6424 50%, #2a4419 100%);
          display: flex; align-items: center;
          pointer-events: none;
        }
        .teal-overlay.idle { pointer-events: auto; }

        @keyframes sweepFromLeft {
          from { opacity:0; transform:translateX(-34px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes sweepFromRight {
          from { opacity:0; transform:translateX(34px); }
          to   { opacity:1; transform:translateX(0); }
        }
        .teal-inner {
          display:flex; flex-direction:column;
          align-items:center; text-align:center;
          max-width: 280px; padding: 0 8px;
        }
        .teal-inner.hidden     { opacity: 0; }
        .teal-inner.from-left  { animation: sweepFromLeft  0.36s cubic-bezier(0.34,1.2,0.64,1) forwards; }
        .teal-inner.from-right { animation: sweepFromRight 0.36s cubic-bezier(0.34,1.2,0.64,1) forwards; }

        /* ── Logo area inspired by the reference image ── */
        .logo-area {
          display: flex; flex-direction: column; align-items: center;
          margin-bottom: 20px;
        }

        /* Isometric-style phone/tablet icon */
        .logo-icon-wrap {
          width: 80px; height: 80px;
          border-radius: 20px;
          background: linear-gradient(135deg, #31511E 0%, #859F3D 100%);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px;
          box-shadow:
            0 8px 24px rgba(49,81,30,0.35),
            0 2px 6px rgba(0,0,0,0.2);
          position: relative;
          overflow: hidden;
        }
        .logo-icon-wrap::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(246,252,223,0.15) 0%, transparent 60%);
          border-radius: 20px;
        }

        .logo-company {
          font-family: 'Orbitron', sans-serif;
          font-size: 22px; font-weight: 900;
          color: #F6FCDF;
          letter-spacing: 2px;
          text-transform: uppercase;
          line-height: 1;
          margin-bottom: 4px;
        }
        .logo-tagline {
          font-family: 'Montserrat', sans-serif;
          font-size: 9px; font-weight: 600;
          color: #859F3D;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          line-height: 1.4;
          text-align: center;
        }

        /* Divider line between logo and welcome text */
        .logo-divider {
          width: 40px; height: 2px;
          background: linear-gradient(90deg, transparent, #859F3D, transparent);
          margin: 14px auto;
          border-radius: 2px;
        }

        .teal-heading {
          font-family: 'Orbitron', sans-serif;
          font-size: 15px; font-weight: 700; color: #F6FCDF;
          text-transform: uppercase; line-height: 1.3; margin-bottom: 7px;
          letter-spacing: 1px;
        }
        .teal-body {
          font-size: 11px; color: rgba(246,252,223,0.65);
          line-height: 1.8; font-weight: 500;
          font-family: 'Montserrat', sans-serif;
        }

        /* ══ FORM STYLES ══ */
        .f-title {
          font-size: 22px; font-weight: 700; color: #1A1A19;
          text-align: center; margin-bottom: 20px;
          font-family: 'Rajdhani', sans-serif;
        }
        .f-row { position: relative; width: 100%; margin-bottom: 10px; }
        .f-input {
          width: 100%; padding: 9px 34px 9px 13px;
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 9px;
          color: #1A1A19; font-size: 12.5px;
          font-family: 'Rajdhani', sans-serif; font-weight: 500;
          outline: none; transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(49,81,30,0.06);
        }
        .f-input::placeholder { color: rgba(26,26,25,0.35); }
        .f-input:focus {
          background: rgba(255,255,255,0.85);
          border-color: rgba(133,159,61,0.5);
          box-shadow: 0 0 0 3px rgba(133,159,61,0.1), 0 2px 8px rgba(49,81,30,0.06);
        }
        .f-icon {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          color: rgba(133,159,61,0.6); display: flex;
        }
        .eye-btn {
          background: none; border: none; cursor: pointer;
          color: rgba(133,159,61,0.6); display: flex; transition: color 0.18s;
        }
        .eye-btn:hover { color: #31511E; }
        .f-err { color: #c0392b; font-size: 10px; margin-top: 2px; font-weight: 600; }

        .two-col {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 8px; margin-bottom: 10px;
        }
        .two-col .f-row { margin-bottom: 0; }

        .f-forgot {
          display: block; text-align: right; margin: 0 0 12px;
          font-size: 11px; color: rgba(49,81,30,0.5);
          text-decoration: none; font-weight: 500; transition: color 0.18s;
        }
        .f-forgot:hover { color: #31511E; }

        .f-btn {
          width: 100%; padding: 10px; border: none; border-radius: 30px;
          background: linear-gradient(90deg, #31511E, #859F3D);
          color: #F6FCDF; font-size: 12.5px; font-weight: 700; cursor: pointer;
          font-family: 'Rajdhani', sans-serif; letter-spacing: 2px;
          text-transform: uppercase; margin-bottom: 10px;
          transition: all 0.22s ease;
          box-shadow: 0 4px 18px rgba(49,81,30,0.25);
        }
        .f-btn:hover   { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(49,81,30,0.35); }
        .f-btn:active  { transform: translateY(0); }
        .f-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .f-google {
          width: 100%; padding: 8px 12px; border-radius: 30px;
          background: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.8);
          color: rgba(26,26,25,0.65); font-size: 12px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          gap: 7px; font-family: 'Rajdhani', sans-serif; letter-spacing: 1px;
          transition: all 0.2s ease; backdrop-filter: blur(12px);
          box-shadow: 0 2px 8px rgba(49,81,30,0.06);
        }
        .f-google:hover { background: rgba(255,255,255,0.85); border-color: rgba(133,159,61,0.35); transform: translateY(-1px); }

        .f-divider { display: flex; align-items: center; gap: 8px; margin: 8px 0; }
        .f-line { flex: 1; height: 1px; background: rgba(49,81,30,0.15); }
        .f-or   { font-size: 10px; color: rgba(26,26,25,0.3); letter-spacing: 1.5px; white-space: nowrap; }

        .f-switch {
          font-size: 11.5px; color: rgba(26,26,25,0.45);
          text-align: center; margin-top: 9px; font-weight: 500;
        }
        .f-switch span { color: #31511E; cursor: pointer; font-weight: 700; transition: all 0.18s; }
        .f-switch span:hover { text-shadow: 0 0 10px rgba(49,81,30,0.4); }

        /* ══ MOBILE (≤ 640px) ══ */
        .mobile-card { display: none; }

        @media (max-width: 640px) {
          .desktop-card { display: none; }
          .mobile-card {
            display: flex; flex-direction: column;
            width: 100%; max-width: 390px;
            border-radius: 22px; overflow: hidden;
            box-shadow:
              0 0 0 1px rgba(49,81,30,0.15),
              0 28px 64px rgba(0,0,0,0.12);
            animation: fadeUp 0.5s ease forwards;
          }
          .mob-teal {
            background: linear-gradient(145deg, #F6FCDF 0%, #edf7c0 50%, #dff0a8 100%);
            padding: 28px 24px 52px;
            clip-path: polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%);
            display: flex; flex-direction: column; align-items: center; text-align: center;
          }
          .mob-logo-wrap {
            width: 60px; height: 60px; border-radius: 16px;
            background: linear-gradient(135deg, #31511E 0%, #859F3D 100%);
            display: flex; align-items: center; justify-content: center;
            margin-bottom: 10px;
            box-shadow: 0 6px 20px rgba(49,81,30,0.3);
          }
          .mob-company {
            font-family: 'Orbitron', sans-serif;
            font-size: 16px; font-weight: 900; color: #31511E;
            letter-spacing: 2px; text-transform: uppercase; margin-bottom: 3px;
          }
          .mob-tagline {
            font-family: 'Montserrat', sans-serif;
            font-size: 8px; font-weight: 600; color: #859F3D;
            letter-spacing: 2px; text-transform: uppercase;
          }
          .mob-body {
            background: #F6FCDF;
            border-top: 1px solid rgba(49,81,30,0.15);
            padding: 24px 22px 28px;
          }
          .mob-tabs {
            display: flex;
            background: rgba(49,81,30,0.06);
            border: 1px solid rgba(49,81,30,0.15);
            border-radius: 30px; padding: 3px; margin-bottom: 18px;
          }
          .mob-tab {
            flex: 1; padding: 7px 0; border: none; border-radius: 26px;
            background: transparent; color: rgba(26,26,25,0.35);
            font-size: 11.5px; font-weight: 700; letter-spacing: 1.5px;
            text-transform: uppercase; cursor: pointer;
            font-family: 'Rajdhani', sans-serif; transition: all 0.22s ease;
          }
          .mob-tab.active {
            background: linear-gradient(90deg, #31511E, #859F3D);
            color: #F6FCDF; box-shadow: 0 2px 12px rgba(49,81,30,0.3);
          }
          @keyframes mobIn {
            from { opacity:0; transform:translateY(10px); }
            to   { opacity:1; transform:translateY(0); }
          }
          .mob-form { animation: mobIn 0.26s ease forwards; }
          .mob-form .two-col { grid-template-columns: 1fr; }
        }

        @media (max-width: 360px) {
          .mob-body { padding: 20px 16px 24px; }
        }
      `}</style>

      <div className="auth-page">
        <div className="blob" style={{ width:500, height:500, background:'#859F3D', opacity:0.12, top:'-190px', left:'-170px' }} />
        <div className="blob" style={{ width:400, height:400, background:'#31511E', opacity:0.08, bottom:'-140px', right:'-110px', animationDelay:'3s' }} />
        <div className="blob" style={{ width:300, height:300, background:'#859F3D', opacity:0.07, top:'60%', left:'40%', animationDelay:'5s' }} />

        {/* ══════════ DESKTOP ══════════ */}
        <div className="desktop-card">

          {/* Login panel */}
          <div className="panel-login">
            <div className="form-inner">
              <h2 className="f-title">Login</h2>
              <form onSubmit={handleLoginSubmit}>
                <div className="f-row">
                  <input className="f-input" type="email" placeholder="Email address"
                    value={loginForm.email}
                    onChange={e => { setLoginForm({ ...loginForm, email: e.target.value }); setLoginError('') }}
                    required
                  />
                  <span className="f-icon">
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                    </svg>
                  </span>
                </div>
                <div className="f-row">
                  <input className="f-input" type={showLoginPass ? 'text' : 'password'} placeholder="Password"
                    value={loginForm.password}
                    onChange={e => { setLoginForm({ ...loginForm, password: e.target.value }); setLoginError('') }}
                    required
                  />
                  <span className="f-icon">
                    <button type="button" className="eye-btn" onClick={() => setShowLoginPass(v => !v)}>
                      <EyeIcon show={showLoginPass} />
                    </button>
                  </span>
                </div>
                <a href="#" className="f-forgot">Forgot password?</a>
                {loginError && <p className="f-err" style={{ textAlign:'center', marginBottom:8 }}>{loginError}</p>}
                <button type="submit" disabled={loginLoading} className="f-btn">
                  {loginLoading ? 'Signing in…' : 'Login'}
                </button>
              </form>
              <div className="f-divider"><div className="f-line"/><span className="f-or">OR CONTINUE WITH</span><div className="f-line"/></div>
              <button onClick={handleGoogle} disabled={googleLoading} className="f-google">
                {googleLoading ? 'Redirecting…' : (<>
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </>)}
              </button>
              <p className="f-switch">No account? <span onClick={() => switchMode(false)}>Sign up</span></p>
            </div>
          </div>

          {/* Signup panel */}
          <div className="panel-signup">
            <div className="form-inner">
              {regSuccess ? (
                <div style={{ textAlign:'center' }}>
                  <div style={{ width:52,height:52,borderRadius:'50%',background:'rgba(133,159,61,0.12)',border:'2px solid rgba(133,159,61,0.35)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#859F3D" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <h3 style={{ color:'#F6FCDF',fontWeight:700,marginBottom:8,fontSize:16 }}>Check your email!</h3>
                  <p style={{ color:'rgba(246,252,223,0.4)',fontSize:12,lineHeight:1.7 }}>
                    Sent to <span style={{ color:'#859F3D' }}>{regForm.email}</span>
                  </p>
                  <button onClick={() => { switchMode(true); setRegSuccess(false) }} className="f-btn" style={{ marginTop:18 }}>
                    Back to Login
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="f-title">Sign up</h2>
                  <form onSubmit={handleRegSubmit}>
                    <div className="two-col">
                      <div>
                        <div className="f-row">
                          <input className="f-input" type="text" placeholder="First Name"
                            value={regForm.firstName}
                            onChange={e => { setRegForm({ ...regForm, firstName: e.target.value }); setRegErrors({ ...regErrors, firstName:'' }) }}
                          />
                        </div>
                        {regErrors.firstName && <p className="f-err">{regErrors.firstName}</p>}
                      </div>
                      <div>
                        <div className="f-row">
                          <input className="f-input" type="text" placeholder="Last Name"
                            value={regForm.lastName}
                            onChange={e => { setRegForm({ ...regForm, lastName: e.target.value }); setRegErrors({ ...regErrors, lastName:'' }) }}
                          />
                        </div>
                        {regErrors.lastName && <p className="f-err">{regErrors.lastName}</p>}
                      </div>
                    </div>
                    <div className="f-row">
                      <input className="f-input" type="text" placeholder="Username"
                        value={regForm.username}
                        onChange={e => { setRegForm({ ...regForm, username: e.target.value }); setRegErrors({ ...regErrors, username:'' }) }}
                      />
                      {regErrors.username && <p className="f-err">{regErrors.username}</p>}
                    </div>
                    <div className="f-row">
                      <input className="f-input" type="email" placeholder="Email address"
                        value={regForm.email}
                        onChange={e => { setRegForm({ ...regForm, email: e.target.value }); setRegErrors({ ...regErrors, email:'' }) }}
                      />
                      {regErrors.email && <p className="f-err">{regErrors.email}</p>}
                    </div>
                    <div className="two-col">
                      <div>
                        <div className="f-row">
                          <input className="f-input" type={showRegPass ? 'text' : 'password'} placeholder="Password"
                            value={regForm.password}
                            onChange={e => { setRegForm({ ...regForm, password: e.target.value }); setRegErrors({ ...regErrors, password:'' }) }}
                          />
                          <span className="f-icon">
                            <button type="button" className="eye-btn" onClick={() => setShowRegPass(v => !v)}><EyeIcon show={showRegPass}/></button>
                          </span>
                        </div>
                        {regErrors.password && <p className="f-err">{regErrors.password}</p>}
                      </div>
                      <div>
                        <div className="f-row">
                          <input className="f-input" type={showRegConfirm ? 'text' : 'password'} placeholder="Confirm"
                            value={regForm.confirmPassword}
                            onChange={e => { setRegForm({ ...regForm, confirmPassword: e.target.value }); setRegErrors({ ...regErrors, confirmPassword:'' }) }}
                          />
                          <span className="f-icon">
                            <button type="button" className="eye-btn" onClick={() => setShowRegConfirm(v => !v)}><EyeIcon show={showRegConfirm}/></button>
                          </span>
                        </div>
                        {regErrors.confirmPassword && <p className="f-err">{regErrors.confirmPassword}</p>}
                      </div>
                    </div>
                    {regError && <p className="f-err" style={{ textAlign:'center', marginBottom:6 }}>{regError}</p>}
                    <button type="submit" disabled={regLoading} className="f-btn">
                      {regLoading ? 'Creating account…' : 'Sign up'}
                    </button>
                  </form>
                  <p className="f-switch">Have an account? <span onClick={() => switchMode(true)}>Login</span></p>
                </>
              )}
            </div>
          </div>

          {/* ── CREAM PANEL OVERLAY ── */}
          <div
            className={`teal-overlay${phase === 'idle' ? ' idle' : ''}`}
            style={{
              clipPath: getClipPath(),
              transition: getTrans(),
              justifyContent: getJustify(),
              padding: getPad(),
            }}
          >
            <div
              className={`teal-inner ${!contentVisible ? 'hidden' : sweepDir}`}
              key={isLogin ? 'lg' : 'sg'}
            >
              {/* Logo area */}
              <div className="logo-area">
                <div className="logo-icon-wrap">
                  {/* Isometric-inspired chart/phone SVG */}
                  <svg width="48" height="48" viewBox="0 0 100 100" fill="none">
                    {/* Phone shape */}
                    <rect x="22" y="12" width="56" height="76" rx="10" fill="rgba(246,252,223,0.15)" stroke="rgba(246,252,223,0.5)" strokeWidth="2"/>
                    {/* Screen */}
                    <rect x="28" y="20" width="44" height="52" rx="4" fill="rgba(246,252,223,0.1)" stroke="rgba(246,252,223,0.3)" strokeWidth="1"/>
                    {/* Bar chart bars */}
                    <rect x="34" y="52" width="7" height="14" rx="2" fill="rgba(246,252,223,0.5)"/>
                    <rect x="44" y="44" width="7" height="22" rx="2" fill="rgba(246,252,223,0.7)"/>
                    <rect x="54" y="36" width="7" height="30" rx="2" fill="rgba(246,252,223,0.9)"/>
                    {/* Trend line */}
                    <polyline points="37,50 47,42 57,34" stroke="rgba(246,252,223,0.8)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    {/* Dot on trend */}
                    <circle cx="57" cy="34" r="2.5" fill="#F6FCDF"/>
                    {/* Home button */}
                    <circle cx="50" cy="78" r="4" stroke="rgba(246,252,223,0.4)" strokeWidth="1.5" fill="none"/>
                  </svg>
                </div>

                <div className="logo-company">HOPE, Inc</div>
                <div className="logo-tagline">Product Management System</div>
              </div>

              <div className="logo-divider" />

              {isLogin ? (
                <>
                  <h2 className="teal-heading">WELCOME BACK!</h2>
                  <p className="teal-body">We're happy to have you back! If you need anything, we're here to help.</p>
                </>
              ) : (
                <>
                  <h2 className="teal-heading">WELCOME!</h2>
                  <p className="teal-body">We're delighted to have you here. Fill in your details to get started.</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ══════════ MOBILE ══════════ */}
        <div className="mobile-card">
          <div className="mob-teal">
            <div className="mob-logo-wrap">
              <svg width="34" height="34" viewBox="0 0 100 100" fill="none">
                <rect x="22" y="12" width="56" height="76" rx="10" fill="rgba(246,252,223,0.15)" stroke="rgba(246,252,223,0.5)" strokeWidth="2"/>
                <rect x="28" y="20" width="44" height="52" rx="4" fill="rgba(246,252,223,0.1)" stroke="rgba(246,252,223,0.3)" strokeWidth="1"/>
                <rect x="34" y="52" width="7" height="14" rx="2" fill="rgba(246,252,223,0.5)"/>
                <rect x="44" y="44" width="7" height="22" rx="2" fill="rgba(246,252,223,0.7)"/>
                <rect x="54" y="36" width="7" height="30" rx="2" fill="rgba(246,252,223,0.9)"/>
                <polyline points="37,50 47,42 57,34" stroke="rgba(246,252,223,0.8)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="57" cy="34" r="2.5" fill="#F6FCDF"/>
                <circle cx="50" cy="78" r="4" stroke="rgba(246,252,223,0.4)" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <p className="mob-company">HOPE, Inc</p>
            <p className="mob-tagline">Product Management System</p>
          </div>
          <div className="mob-body">
            <div className="mob-tabs">
              <button className={`mob-tab${isLogin ? ' active' : ''}`} onClick={() => setIsLogin(true)}>Login</button>
              <button className={`mob-tab${!isLogin ? ' active' : ''}`} onClick={() => setIsLogin(false)}>Sign Up</button>
            </div>
            {isLogin ? (
              <div className="mob-form" key="ml">
                <form onSubmit={handleLoginSubmit}>
                  <div className="f-row">
                    <input className="f-input" type="email" placeholder="Email address" value={loginForm.email} onChange={e => { setLoginForm({ ...loginForm, email: e.target.value }); setLoginError('') }} required/>
                    <span className="f-icon"><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/></svg></span>
                  </div>
                  <div className="f-row">
                    <input className="f-input" type={showLoginPass ? 'text' : 'password'} placeholder="Password" value={loginForm.password} onChange={e => { setLoginForm({ ...loginForm, password: e.target.value }); setLoginError('') }} required/>
                    <span className="f-icon"><button type="button" className="eye-btn" onClick={() => setShowLoginPass(v => !v)}><EyeIcon show={showLoginPass}/></button></span>
                  </div>
                  <a href="#" className="f-forgot">Forgot password?</a>
                  {loginError && <p className="f-err" style={{ textAlign:'center', marginBottom:8 }}>{loginError}</p>}
                  <button type="submit" disabled={loginLoading} className="f-btn">{loginLoading ? 'Signing in…' : 'Login'}</button>
                </form>
                <div className="f-divider"><div className="f-line"/><span className="f-or">OR CONTINUE WITH</span><div className="f-line"/></div>
                <button onClick={handleGoogle} disabled={googleLoading} className="f-google">
                  {googleLoading ? 'Redirecting…' : (<><svg width="14" height="14" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>Sign in with Google</>)}
                </button>
              </div>
            ) : (
              <div className="mob-form" key="ms">
                {regSuccess ? (
                  <div style={{ textAlign:'center', padding:'6px 0' }}>
                    <div style={{ width:48,height:48,borderRadius:'50%',background:'rgba(133,159,61,0.12)',border:'2px solid rgba(133,159,61,0.3)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#859F3D" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <h3 style={{ color:'#F6FCDF',fontWeight:700,marginBottom:7,fontSize:15 }}>Check your email!</h3>
                    <p style={{ color:'rgba(246,252,223,0.4)',fontSize:11.5,lineHeight:1.7 }}>Sent to <span style={{ color:'#859F3D' }}>{regForm.email}</span></p>
                    <button onClick={() => { setIsLogin(true); setRegSuccess(false) }} className="f-btn" style={{ marginTop:16 }}>Back to Login</button>
                  </div>
                ) : (
                  <form onSubmit={handleRegSubmit}>
                    <div className="two-col">
                      <div><div className="f-row"><input className="f-input" type="text" placeholder="First Name" value={regForm.firstName} onChange={e => { setRegForm({ ...regForm, firstName: e.target.value }); setRegErrors({ ...regErrors, firstName:'' }) }}/></div>{regErrors.firstName && <p className="f-err">{regErrors.firstName}</p>}</div>
                      <div><div className="f-row"><input className="f-input" type="text" placeholder="Last Name" value={regForm.lastName} onChange={e => { setRegForm({ ...regForm, lastName: e.target.value }); setRegErrors({ ...regErrors, lastName:'' }) }}/></div>{regErrors.lastName && <p className="f-err">{regErrors.lastName}</p>}</div>
                    </div>
                    <div className="f-row"><input className="f-input" type="text" placeholder="Username" value={regForm.username} onChange={e => { setRegForm({ ...regForm, username: e.target.value }); setRegErrors({ ...regErrors, username:'' }) }}/>{regErrors.username && <p className="f-err">{regErrors.username}</p>}</div>
                    <div className="f-row"><input className="f-input" type="email" placeholder="Email address" value={regForm.email} onChange={e => { setRegForm({ ...regForm, email: e.target.value }); setRegErrors({ ...regErrors, email:'' }) }}/>{regErrors.email && <p className="f-err">{regErrors.email}</p>}</div>
                    <div className="f-row"><input className="f-input" type={showRegPass ? 'text' : 'password'} placeholder="Password" value={regForm.password} onChange={e => { setRegForm({ ...regForm, password: e.target.value }); setRegErrors({ ...regErrors, password:'' }) }}/><span className="f-icon"><button type="button" className="eye-btn" onClick={() => setShowRegPass(v => !v)}><EyeIcon show={showRegPass}/></button></span>{regErrors.password && <p className="f-err">{regErrors.password}</p>}</div>
                    <div className="f-row"><input className="f-input" type={showRegConfirm ? 'text' : 'password'} placeholder="Confirm Password" value={regForm.confirmPassword} onChange={e => { setRegForm({ ...regForm, confirmPassword: e.target.value }); setRegErrors({ ...regErrors, confirmPassword:'' }) }}/><span className="f-icon"><button type="button" className="eye-btn" onClick={() => setShowRegConfirm(v => !v)}><EyeIcon show={showRegConfirm}/></button></span>{regErrors.confirmPassword && <p className="f-err">{regErrors.confirmPassword}</p>}</div>
                    {regError && <p className="f-err" style={{ textAlign:'center', marginTop:5 }}>{regError}</p>}
                    <button type="submit" disabled={regLoading} className="f-btn">{regLoading ? 'Creating account…' : 'Sign up'}</button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  )
}

export default AuthPage