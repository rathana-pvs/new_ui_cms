import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../authApi';

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

  // Password strength
  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-accent-red' };
    if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-accent-orange' };
    if (score <= 3) return { level: 3, label: 'Good', color: 'bg-accent-yellow' };
    return { level: 4, label: 'Strong', color: 'bg-accent-green' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-bk-main relative overflow-hidden font-sans">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-bk-yellow/5 blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-bk-yellow/5 blur-3xl"></div>

        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-bk-yellow/2 blur-3xl"></div>
      </div>


      <div className="w-full max-w-md mx-4 relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-bk-yellow/10 mb-4">
            <span className="material-symbols-outlined text-bk-yellow text-3xl" style={{ fontVariationSettings: "'wght' 300" }}>person_add</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Create Account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Register a new CUBRID Manager account
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white dark:bg-bk-side rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-200/60 dark:border-slate-800 p-8">

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]" style={{ fontVariationSettings: "'wght' 300" }}>
                  person
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); clearFieldError('username'); }}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border ${errors.username ? 'border-accent-red focus:ring-accent-red/20' : 'border-slate-200 dark:border-slate-800 focus:ring-bk-yellow/20'} bg-slate-50 dark:bg-bk-main/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-bk-yellow/50 transition-all`}
                  placeholder="Choose a username"
                />
              </div>

              {errors.username && (
                <p className="mt-1.5 text-xs text-accent-red flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {errors.username}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]" style={{ fontVariationSettings: "'wght' 300" }}>
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
                  className={`w-full pl-10 pr-12 py-2.5 text-sm rounded-xl border ${errors.password ? 'border-accent-red focus:ring-accent-red/20' : 'border-slate-200 dark:border-slate-800 focus:ring-bk-yellow/20'} bg-slate-50 dark:bg-bk-main/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-bk-yellow/50 transition-all`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-bk-yellow transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'wght' 300" }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {/* Password Strength */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${i <= strength.level ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs mt-1 ${strength.level <= 1 ? 'text-accent-red' : strength.level <= 2 ? 'text-accent-orange' : strength.level <= 3 ? 'text-accent-yellow' : 'text-accent-green'}`}>
                    {strength.label}
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="mt-1.5 text-xs text-accent-red flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]" style={{ fontVariationSettings: "'wght' 300" }}>
                  lock_reset
                </span>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword'); }}
                  className={`w-full pl-10 pr-12 py-2.5 text-sm rounded-xl border ${errors.confirmPassword ? 'border-accent-red focus:ring-accent-red/20' : confirmPassword && password === confirmPassword ? 'border-accent-green focus:ring-accent-green/20' : 'border-slate-200 dark:border-slate-800 focus:ring-bk-yellow/20'} bg-slate-50 dark:bg-bk-main/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-bk-yellow/50 transition-all`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-bk-yellow transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'wght' 300" }}>
                    {showConfirm ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {confirmPassword && password === confirmPassword && !errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-accent-green flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Passwords match
                </p>
              )}
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-accent-red flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* API Error */}
            {apiError && (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-accent-red bg-accent-red/10 border border-accent-red/20 rounded-xl">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {apiError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-bk-yellow hover:bg-bk-yellow/90 text-bk-side text-sm font-bold rounded-xl shadow-lg shadow-bk-yellow/10 hover:shadow-bk-yellow/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'wght' 500" }}>person_add</span>
                  Create Account
                </>
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400">or</span>
            </div>
          </div>

          {/* Back to Login */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-bk-yellow hover:underline transition-all inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'wght' 300" }}>arrow_back</span>
              Back to login
            </Link>
          </p>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
          © 2026 CUBRID. All rights reserved.
        </p>
      </div>
    </div>
  );
}
