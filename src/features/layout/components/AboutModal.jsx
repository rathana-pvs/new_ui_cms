import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAboutCubrid } from '../appBarSlice';

export default function AboutModal() {
  const dispatch = useDispatch();
  const { isAboutCubridOpen } = useSelector((state) => state.appBar);

  if (!isAboutCubridOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-bk-side w-full max-w-[420px] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Decorative Header */}
        <div className="h-24 bg-gradient-to-r from-bk-main to-slate-900 relative flex items-center justify-center overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/20"></div>
           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl relative z-10 translate-y-6 border-4 border-white dark:border-bk-side">
              <img src="/cubrid-logo.png" alt="CUBRID Logo" className="w-10 h-10 object-contain" />
           </div>
        </div>

        <div className="px-8 pt-10 pb-8 text-center space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">CUBRID <span className="text-bk-yellow italic">Manager</span></h2>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1">Enterprise Web Management</p>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed px-2 text-justify bg-slate-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-100 dark:border-white/5 italic">
            "CUBRID is an open-source SQL-based RDBMS with object extensions. The name combines 'Cube' (Data Space) and 'Bridge' (Data Bridge), reflecting its role as a secure connection between users and their critical infrastructure."
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Core Version</span>
              <span className="text-xs text-slate-900 dark:text-white font-black">12.4.0-Final</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Web Interface</span>
              <span className="text-xs text-slate-900 dark:text-white font-black">v1.1.2</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Environment</span>
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                 <span className="text-xs text-slate-900 dark:text-white font-black uppercase tracking-tighter">Production Ready</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => dispatch(setAboutCubrid(false))}
              className="w-full py-4 bg-slate-900 dark:bg-bk-yellow text-white dark:text-bk-side text-xs font-black uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all active:scale-[0.98] shadow-lg"
            >
              Acknowledge & Close
            </button>
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 tracking-widest uppercase">
              © 2026 CUBRID Corporation. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
