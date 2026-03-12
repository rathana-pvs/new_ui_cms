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
    else if (password.length < 4) errs.password = 'Password must be at least 4 characters';
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-bk-main relative overflow-hidden font-sans">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-bk-yellow/5 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-bk-yellow/5 blur-3xl"></div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-bk-yellow/2 blur-3xl"></div>
      </div>


      <div className="w-full max-w-md mx-4 relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-bk-yellow/10 mb-4">
            <span className="material-symbols-outlined text-bk-yellow text-3xl" style={{ fontVariationSettings: "'wght' 300" }}>database</span>
          </div>

          <h1 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight">
            Cubrid Manager
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sign in to your account
          </p>
        </div>

        {/* Login Card */}
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
                  onChange={(e) => { setUsername(e.target.value); if (errors.username) setErrors({ ...errors, username: '' }); }}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border ${errors.username ? 'border-accent-red focus:ring-accent-red/20' : 'border-slate-200 dark:border-slate-800 focus:ring-bk-yellow/20'} bg-slate-50 dark:bg-bk-main/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-bk-yellow/50 transition-all`}
                  placeholder="Enter your username"
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
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: '' }); }}
                  className={`w-full pl-10 pr-12 py-2.5 text-sm rounded-xl border ${errors.password ? 'border-accent-red focus:ring-accent-red/20' : 'border-slate-200 dark:border-slate-800 focus:ring-bk-yellow/20'} bg-slate-50 dark:bg-bk-main/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-bk-yellow/50 transition-all`}
                  placeholder="Enter your password"
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

              {errors.password && (
                <p className="mt-1.5 text-xs text-accent-red flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-bk-yellow focus:ring-bk-yellow/30 bg-white dark:bg-bk-main cursor-pointer" />
                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-bk-yellow transition-colors">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-slate-500 hover:text-bk-yellow transition-colors"
              >
                Forgot password?
              </Link>

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
              className="w-full py-2.5 px-4 bg-bk-yellow hover:bg-bk-yellow/90 text-bk-side text-sm font-medium rounded-xl shadow-lg shadow-bk-yellow/10 hover:shadow-bk-yellow/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'wght' 500" }}>login</span>
                  Sign in
                </>
              )}
            </button>

          </form>

          {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white dark:bg-bk-side px-3 text-xs text-slate-500 tracking-wide font-medium">or</span>
              </div>
            </div>


          {/* Register Link */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-bk-yellow hover:underline transition-all"
            >
              Create account
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
