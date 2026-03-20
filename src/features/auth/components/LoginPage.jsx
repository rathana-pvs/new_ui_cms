import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../authSlice';
import { authApi } from '../authApi';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const validate = () => {
    const errs = {};
    if (!username.trim()) errs.username = 'Username is required';
    if (!password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setApiError('');
    dispatch(loginStart());
    try {
      const response = await authApi.login(username, password);
      const token = response?.token;
      dispatch(loginSuccess({ token, user: { id: username } }));
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Login failed. Please check your credentials.';
      dispatch(loginFailure(msg));
      setApiError(msg);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-bk-main font-sans selection:bg-bk-yellow/30">
      
      {/* Left Panel: Hero & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0a0a0a] border-r border-white/5">
        {/* Background Animation/Image */}
        <div className="absolute inset-0 z-0 opacity-40">
           <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-sky-500/20 rounded-full blur-[120px] animate-pulse"></div>
           <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-bk-yellow/10 rounded-full blur-[150px]"></div>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        </div>

        {/* Brand Content */}
        <div className="relative z-10 w-full flex flex-col justify-between p-20">
          <div>
            <div className="flex items-center gap-4 mb-12 group cursor-pointer">
              <div className="w-12 h-12 bg-white rounded-[6px] flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
                <img src="/cubrid-logo.png" alt="CUBRID" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">CUBRID <span className="text-bk-yellow/80 font-light">Manager</span></h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Enterprise Database Suite</p>
              </div>
            </div>

            <h1 className="text-6xl font-black text-white leading-[1.1] mb-8 tracking-tighter">
              The Bridge to <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-bk-yellow via-yellow-200 to-white">Unlimited Data.</span>
            </h1>
            
            <p className="text-xl text-slate-400 font-light leading-relaxed max-w-lg mb-12">
              Optimized for Online Transaction Processing (OLTP). CUBRID is an open-source, relational database management system with unique object extensions.
            </p>

            <div className="space-y-6">
              {[
                { title: 'High Availability', desc: 'Automatic failover and heartbeat monitoring for 24/7 uptime.' },
                { title: 'Full Scalability', desc: '3-tier architecture separating app, broker, and server layers.' },
                { title: 'True Open Source', desc: 'Powerful SQL-based RDBMS designed for web services.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-[6px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
                  <div className="w-10 h-10 rounded-[6px] bg-bk-yellow/10 flex items-center justify-center shrink-0 group-hover:bg-bk-yellow transition-colors">
                    <span className="material-symbols-outlined text-bk-yellow group-hover:text-bk-side">{['bolt', 'layers', 'code'][i]}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm tracking-wide">{item.title}</h4>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
             <div className="flex gap-6">
                <a href="https://www.cubrid.org" target="_blank" rel="noreferrer" className="hover:text-bk-yellow transition-colors">Official Website</a>
                <a href="https://github.com/CUBRID" target="_blank" rel="noreferrer" className="hover:text-bk-yellow transition-colors">GitHub</a>
             </div>
             <span>Build v12.4.0-Final</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 md:p-16 bg-white dark:bg-bk-main relative overflow-hidden">
        
        {/* Subtle background decoration for form side */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-bk-yellow/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-sm space-y-10 relative z-10">
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Login</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Access your database environment.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider ml-1">Username</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-slate-400 group-focus-within:text-bk-yellow transition-colors">account_circle</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); if (errors.username) setErrors({ ...errors, username: '' }); }}
                    className={`w-full pl-12 pr-4 py-4 bg-white dark:bg-bk-side border-2 ${errors.username ? 'border-rose-500' : 'border-slate-100 dark:border-transparent group-focus-within:border-bk-yellow/50'} rounded-[6px] outline-none shadow-sm transition-all dark:text-white placeholder:text-slate-400 text-sm`}
                    placeholder="Enter username"
                  />
                </div>
                {errors.username && <p className="text-[11px] text-rose-500 font-medium ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span>{errors.username}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider leading-none">Password</label>
                  <Link to="/forgot-password" size="sm" className="text-[10px] font-bold text-bk-yellow hover:text-bk-yellow/80 transition-colors tracking-widest">Forgot?</Link>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-slate-400 group-focus-within:text-bk-yellow transition-colors">lock_open</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: '' }); }}
                    className={`w-full pl-12 pr-12 py-4 bg-white dark:bg-bk-side border-2 ${errors.password ? 'border-rose-500' : 'border-slate-100 dark:border-transparent group-focus-within:border-bk-yellow/50'} rounded-[6px] outline-none shadow-sm transition-all dark:text-white text-sm`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {errors.password && <p className="text-[11px] text-rose-500 font-medium ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span>{errors.password}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3 group cursor-pointer w-fit select-none">
              <input type="checkbox" id="remember" className="peer sr-only" />
              <div onClick={() => document.getElementById('remember').click()} className="w-5 h-5 rounded-[6px] border-2 border-slate-200 dark:border-white/10 peer-checked:bg-bk-yellow peer-checked:border-bk-yellow flex items-center justify-center transition-all bg-white dark:bg-bk-side">
                <span className="material-symbols-outlined text-bk-side text-[14px] font-bold opacity-0 peer-checked:opacity-100 transition-opacity">check</span>
              </div>
              <label htmlFor="remember" className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors cursor-pointer tracking-wide">Remember device</label>
            </div>

            {apiError && (
              <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-[6px] flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <span className="material-symbols-outlined text-rose-500 text-[20px]">error_outline</span>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">{apiError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 dark:bg-bk-yellow text-white dark:text-bk-side font-black rounded-[6px] shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="tracking-widest text-xs">Authorize Access</span>
                  <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">login</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              New to CUBRID?{' '}
              <Link to="/register" className="font-black text-slate-900 dark:text-bk-yellow hover:underline decoration-2 underline-offset-4">Create Account</Link>
            </p>
          </div>
        </div>

        {/* Legal links */}
        <div className="absolute bottom-12 flex items-center gap-8 opacity-40 hover:opacity-100 transition-opacity duration-300">
           <img src="/cubrid-logo.png" alt="CUBRID logo" className="h-5 object-contain dark:brightness-0 dark:invert" />
           <div className="flex gap-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <a href="#" className="hover:text-bk-yellow transition-colors">Terms</a>
              <a href="#" className="hover:text-bk-yellow transition-colors">Privacy</a>
              <a href="#" className="hover:text-bk-yellow transition-colors">About</a>
           </div>
        </div>
      </div>
    </div>
  );
}
