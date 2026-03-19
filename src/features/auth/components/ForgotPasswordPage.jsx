import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-bk-main font-sans selection:bg-bk-yellow/30">
      
      {/* Left Panel: Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0a0a0a] border-r border-white/5">
        <div className="absolute inset-0 z-0 opacity-40">
           <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[120px] animate-pulse"></div>
           <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] bg-bk-yellow/5 rounded-full blur-[100px]"></div>
        </div>
        
        <div className="relative z-10 w-full flex flex-col justify-between p-20">
          <div>
            <Link to="/login" className="flex items-center gap-4 mb-14 group w-fit transition-all hover:translate-x-[-4px]">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:border-white transition-all">
                <span className="material-symbols-outlined text-slate-400 group-hover:text-bk-side">arrow_back</span>
              </div>
              <span className="text-sm font-black text-slate-400 group-hover:text-white tracking-widest">Back to Login</span>
            </Link>

            <div className="flex items-center gap-4 mb-10">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-2 shadow-xl shadow-white/5">
                 <img src="/cubrid-logo.png" alt="CUBRID" className="object-contain" />
               </div>
               <h3 className="text-xl font-bold text-white tracking-widest uppercase italic">Recovery</h3>
            </div>

            <h2 className="text-6xl font-black text-white leading-[1.1] mb-8 tracking-tighter">
              Lost your <span className="text-rose-500">Security Bridge?</span>
            </h2>
            <p className="text-xl text-slate-400 font-light leading-relaxed max-w-lg mb-12">
              Don't worry. Account recovery is handled with the same enterprise-grade security as our database clustering. We'll help you get back online.
            </p>

            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 max-w-sm">
                <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-bk-yellow">info</span>
                    <p className="text-xs font-bold text-white uppercase tracking-widest">Security Protocol</p>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">You will receive a one-time cryptographic link to authorize a new master password creation.</p>
            </div>
          </div>

          <div className="text-[10px] font-medium text-slate-700 uppercase tracking-[0.2em]">
            Cubrid Manager Security Infrastructure
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-bk-main relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-sm space-y-10 relative z-10">
          {!submitted ? (
            <>
              <div className="space-y-4">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Recovery</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Enter your registered email address to begin the authentication reset process.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider ml-1">Email Address</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-slate-400 group-focus-within:text-bk-yellow transition-colors">alternate_email</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white dark:bg-bk-side border-2 border-slate-100 dark:border-transparent group-focus-within:border-bk-yellow/50 rounded-2xl outline-none shadow-sm transition-all dark:text-white text-sm"
                      placeholder="admin@organization.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-slate-900 dark:bg-bk-yellow text-white dark:text-bk-side font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="tracking-widest text-xs">Request Recovery Key</span>
                      <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">rocket_launch</span>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-8 animate-in zoom-in-95 duration-300">
               <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                <span className="material-symbols-outlined text-5xl text-emerald-500">mark_email_read</span>
              </div>
              <div className="space-y-3 px-4">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">Link Transmitted</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Reset instructions have been successfully sent to <span className="text-slate-900 dark:text-white font-black">{email}</span>.</p>
              </div>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-bk-yellow hover:text-[#ffd700] p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 transition-all w-full shadow-sm hover:shadow-md"
              >
                Resend protocol
              </button>
            </div>
          )}

          <div className="pt-6 text-center">
             <Link to="/login" className="inline-flex items-center gap-2 text-xs font-black tracking-[0.2em] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                Authorize Login
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
