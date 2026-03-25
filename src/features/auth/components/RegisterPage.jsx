import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../authApi';

import { Icon } from '../../../components/ds/foundation/Icon';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!username.trim()) errs.username = 'Username is required';
    else if (username.length < 3) errs.username = 'Username must be at least 3 characters';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
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
    setLoading(true);
    try {
      await authApi.register(username, password);
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const clearFieldError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Standard', color: 'bg-rose-500', icon: 'shield_lock', text: 'text-rose-500' };
    if (score <= 2) return { level: 2, label: 'Average', color: 'bg-amber-500', icon: 'lock', text: 'text-amber-500' };
    if (score <= 3) return { level: 3, label: 'Secure', color: 'bg-blue-500', icon: 'verified', text: 'text-blue-500' };
    return { level: 4, label: 'Highly Secure', color: 'bg-emerald-500', icon: 'workspace_premium', text: 'text-emerald-500' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen flex bg-white dark:bg-bk-main font-sans selection:bg-bk-yellow/30">
      
      {/* Left Panel: Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0a0a0a] border-r border-white/5">
        <div className="absolute inset-0 z-0 opacity-40">
           <div className="absolute top-[30%] left-[20%] w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>
           <div className="absolute bottom-[10%] left-[5%] w-[300px] h-[300px] bg-bk-yellow/5 rounded-full blur-[120px]"></div>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20"></div>
        </div>

        <div className="relative z-10 w-full flex flex-col justify-between p-20">
          <div>
            <Link to="/login" className="flex items-center gap-4 mb-14 group w-fit transition-all hover:translate-x-[-4px]">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:border-white transition-all">
                <Icon name="arrow_back" size="sm" weight={300} className="text-slate-400 group-hover:text-bk-side" />
              </div>
              <span className="text-sm font-black text-slate-400 group-hover:text-white tracking-widest">Back to Login</span>
            </Link>

            <div className="flex items-center gap-4 mb-10">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-2 shadow-xl shadow-white/5">
                 <img src="/cubrid-logo.png" alt="CUBRID" className="object-contain" />
               </div>
               <h3 className="text-xl font-bold text-white tracking-widest uppercase italic">Registration</h3>
            </div>

            <h2 className="text-5xl font-black text-white leading-[1.1] mb-8 tracking-tighter">
              Build your <span className="text-bk-yellow">Data Foundation</span> <br/>
              on solid ground.
            </h2>
            <p className="text-lg text-slate-400 font-light leading-relaxed max-w-lg mb-12">
              Join the official CUBRID community. Experience a powerful, 3-tier architecture designed specifically for modern web application performance.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: 'Architecture', val: '3-Tier', icon: 'hub' },
                { label: 'License', val: 'Open Source', icon: 'verified_user' },
                { label: 'Performance', val: 'MVCC', icon: 'speed' },
                { label: 'Security', val: 'Enterprise', icon: 'security' }
              ].map((stat, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-bk-yellow/30 transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon name={stat.icon} size="sm" weight={300} className="text-bk-yellow/40 group-hover:text-bk-yellow transition-colors" />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  </div>
                  <p className="text-lg font-bold text-white tracking-tight">{stat.val}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.3em]">
            CUBRID RELATIONAL DATABASE MANAGEMENT SYSTEM
          </div>
        </div>
      </div>

      {/* Right Panel: Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 md:p-16 relative bg-slate-50 dark:bg-bk-main overflow-y-auto">
        
        <div className="w-full max-w-sm space-y-10 py-10">
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Register</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Create your administrative account to start managing your data clusters.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider ml-1">Username</label>
                <div className="relative group">
                  <Icon name="person_pin" size="sm" weight={300} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-bk-yellow transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); clearFieldError('username'); }}
                    className={`w-full pl-12 pr-4 py-3.5 bg-white dark:bg-bk-side border ${errors.username ? 'border-rose-500' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-bk-yellow/50'} rounded-2xl outline-none shadow-sm transition-all dark:text-white text-sm`}
                    placeholder="Pick a unique name"
                  />
                </div>
                {errors.username && <p className="text-[11px] text-rose-500 font-medium ml-1 flex items-center gap-1"><Icon name="error" size="sm" weight={300} />{errors.username}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider ml-1">Password</label>
                <div className="relative group">
                  <span className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] transition-colors
                    ${strength.level > 0 && password ? strength.text : 'text-slate-400 group-focus-within:text-bk-yellow'}`}>
                    {strength.level >= 3 ? 'verified_user' : 'fingerprint'}
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
                    className={`w-full pl-12 pr-12 py-3.5 bg-white dark:bg-bk-side border ${errors.password ? 'border-rose-500' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-bk-yellow/50'} rounded-2xl outline-none shadow-sm transition-all dark:text-white text-sm`}
                    placeholder="Create security keys"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <Icon name={showPassword ? 'visibility_off' : 'visibility'} size="sm" weight={300} />
                  </button>
                </div>
                
                {password && (
                  <div className="px-1 pt-1 animate-in fade-in duration-200">
                    <div className="flex gap-1.5 h-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i <= strength.level ? strength.color : 'bg-slate-200 dark:bg-white/5'}`}></div>
                      ))}
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400 flex items-center gap-1.5">
                      Security: <span className={`flex items-center gap-1 ${strength.text}`}>
                        <Icon name={strength.icon} size="sm" weight={300} />
                        {strength.label}
                      </span>
                    </p>
                  </div>
                )}
                {errors.password && <p className="text-[11px] text-rose-500 font-medium ml-1 flex items-center gap-1"><Icon name="error" size="sm" weight={300} />{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider ml-1">Confirm Security</label>
                <div className="relative group">
                  <Icon name="verified" size="sm" weight={300} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-bk-yellow transition-colors" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword'); }}
                    className={`w-full pl-12 pr-12 py-3.5 bg-white dark:bg-bk-side border ${errors.confirmPassword ? 'border-rose-500' : confirmPassword && password === confirmPassword ? 'border-emerald-500/50' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-bk-yellow/50'} rounded-2xl outline-none shadow-sm transition-all dark:text-white text-sm`}
                    placeholder="Repeat keys"
                  />
                   <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <Icon name={showConfirm ? 'visibility_off' : 'visibility'} size="sm" weight={300} />
                  </button>
                </div>
                {confirmPassword && password === confirmPassword && !errors.confirmPassword && (
                   <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-bold ml-1 animate-in fade-in transition-all">
                      <Icon name="verified" size="sm" weight={300} />
                      <span>Ready to sync</span>
                   </div>
                )}
                {errors.confirmPassword && <p className="text-[11px] text-rose-500 font-medium ml-1 flex items-center gap-1"><Icon name="error" size="sm" weight={300} />{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="pt-4">
               <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 dark:bg-bk-yellow text-white dark:text-bk-side font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="tracking-widest text-xs">Create Master Account</span>
                    <Icon name="person_add" size="sm" weight={300} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {apiError && (
              <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl flex items-center gap-3">
                <Icon name="report" size="sm" weight={300} className="text-rose-500" />
                <p className="text-xs text-rose-600 dark:text-rose-400 font-bold leading-relaxed">{apiError}</p>
              </div>
            )}
          </form>

          <div className="pt-2 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-black text-slate-900 dark:text-bk-yellow hover:underline decoration-2 underline-offset-4">Login</Link>
            </p>
          </div>

          <p className="text-center text-[10px] text-slate-500/60 dark:text-slate-400/40 leading-relaxed max-w-[280px] mx-auto pt-4">
            By joining, you agree to the CUBRID Open Source <a href="#" className="underline font-bold text-slate-900/40 dark:text-white/40 hover:text-bk-yellow transition-colors">Project Terms</a> and data processing policies.
          </p>
        </div>
      </div>
    </div>
  );
}
