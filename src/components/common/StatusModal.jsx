import { useDispatch, useSelector } from 'react-redux';
import { closeStatusModal } from '../../features/layout/layoutSlice';

export default function StatusModal() {
  const dispatch = useDispatch();
  const { statusModal } = useSelector((state) => state.layout);
  const { isOpen, type, title, message } = statusModal;

  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';
  
  const icon = isSuccess ? 'check_circle' : isError ? 'error' : 'info';
  const iconColor = isSuccess ? 'text-emerald-500' : isError ? 'text-rose-500' : 'text-blue-500';
  const bgColor = isSuccess ? 'bg-emerald-50 dark:bg-emerald-500/10' : isError ? 'bg-rose-50 dark:bg-rose-500/10' : 'bg-blue-50 dark:bg-blue-500/10';
  
  // Refined button colors - removing harsh shadows
  const btnClasses = isSuccess 
    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' 
    : isError 
      ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' 
      : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      
      {/* Modal Content */}
      <div className="relative bg-white dark:bg-[#1e2230] w-full max-w-sm rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all z-10 p-7 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        
        {/* Close Button Top Right */}
        <button 
          onClick={() => dispatch(closeStatusModal())}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Icon Container */}
        <div className={`w-16 h-16 ${bgColor} rounded-2xl flex items-center justify-center mb-5 shadow-sm`}>
          <span className={`material-symbols-outlined text-[34px] ${iconColor}`}>
            {icon}
          </span>
        </div>

        <h3 className="text-[17px] font-bold text-slate-800 dark:text-white mb-2 tracking-tight">
          {title || (isSuccess ? 'Success!' : isError ? 'Error Occurred' : 'Information')}
        </h3>
        
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-6 leading-relaxed font-medium px-2">
          {message}
        </p>

        <button 
          className={`w-full h-[40px] rounded-md text-white font-bold text-[14px] transition-all hover:brightness-105 active:scale-[0.98] shadow-sm ${btnClasses}`}
          onClick={() => dispatch(closeStatusModal())}
        >
          {isSuccess ? 'Continue' : isError ? 'I Understand' : 'Close'}
        </button>
      </div>
    </div>
  );
}
