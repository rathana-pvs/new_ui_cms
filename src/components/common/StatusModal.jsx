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
  
  // Refined button colors - matching professional tone
  const btnClasses = isSuccess 
    ? 'bg-emerald-500 hover:bg-emerald-600' 
    : isError 
      ? 'bg-rose-500 hover:bg-rose-600' 
      : 'bg-primary hover:bg-primary/90';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
        onClick={() => dispatch(closeStatusModal())}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white dark:bg-[#1e2230] rounded shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all z-10 p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        
        {/* Close Button Top Right */}
        <button 
          onClick={() => dispatch(closeStatusModal())}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 group"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:text-slate-600 dark:group-hover:text-slate-200">close</span>
        </button>

        {/* Icon Container */}
        <div className={`w-14 h-14 ${bgColor} rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300`}>
          <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1e2230] shadow-sm flex items-center justify-center">
            <span className={`material-symbols-outlined text-2xl ${iconColor}`}>
              {icon}
            </span>
          </div>
        </div>

        <h3 className="text-[15px] font-normal text-slate-900 dark:text-white mb-2">
          {title || (isSuccess ? 'Success' : isError ? 'Error' : 'Information')}
        </h3>
        
        <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-6 leading-relaxed font-normal">
          {message}
        </p>

        <button 
          className={`px-8 py-1.5 rounded text-white text-xs font-normal transition-all active:scale-[0.98] ${btnClasses}`}
          onClick={() => dispatch(closeStatusModal())}
        >
          {isSuccess ? 'Confirm' : isError ? 'Close' : 'Close'}
        </button>
      </div>
    </div>
  );
}
