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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
        onClick={() => dispatch(closeStatusModal())}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800/50 overflow-hidden transform transition-all z-10 p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        
        {/* Close Button Top Right */}
        <button 
          onClick={() => dispatch(closeStatusModal())}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 group"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:text-slate-600 dark:group-hover:text-slate-200">close</span>
        </button>

        {/* Animated Icon Container */}
        <div className={`w-20 h-20 ${bgColor} rounded-full flex items-center justify-center mb-6 animate-in zoom-in motion-safe:duration-500 delay-100`}>
          <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center">
            <span className={`material-symbols-outlined text-4xl ${iconColor}`}>
              {icon}
            </span>
          </div>
        </div>

        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          {title || (isSuccess ? 'Success!' : isError ? 'Error Occurred' : 'Information')}
        </h3>
        
        <p className="text-[15px] text-slate-500 dark:text-slate-400 mb-8 leading-relaxed font-medium">
          {message}
        </p>

        <button 
          className={`w-full py-3.5 rounded-2xl text-white font-bold text-[15px] transition-all active:scale-[0.97] shadow-xl hover:shadow-2xl ${btnClasses}`}
          onClick={() => dispatch(closeStatusModal())}
        >
          {isSuccess ? 'Great' : isError ? 'I Understand' : 'Close'}
        </button>
      </div>
    </div>
  );
}
