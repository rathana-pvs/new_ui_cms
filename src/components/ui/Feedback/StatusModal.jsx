import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeStatusModal } from '../../../features/layout/layoutSlice';
import Modal from '../Layout/Modal';
import Button from '../Foundation/Button';
import Typography from '../Foundation/Typography';
import Icon from '../Foundation/Icon';

export default function StatusModal() {
  const dispatch = useDispatch();
  const { statusModal } = useSelector((state) => state.layout);
  const { isOpen, type, title, message } = statusModal;

  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';
  
  const icon = isSuccess ? 'verified' : isError ? 'report' : 'info';
  const colorClass = isSuccess ? 'text-emerald-500' : isError ? 'text-rose-500' : 'text-primary';
  const bgClass = isSuccess ? 'bg-emerald-500/10' : isError ? 'bg-rose-500/10' : 'bg-primary/10';
  const borderClass = isSuccess ? 'border-emerald-500/20' : isError ? 'border-rose-500/20' : 'border-primary/20';

  const footer = (
    <Button 
      variant={isSuccess ? 'primary' : isError ? 'danger' : 'secondary'} 
      className="w-full py-4 font-black uppercase tracking-widest text-[10px]"
      onClick={() => dispatch(closeStatusModal())}
    >
      {isSuccess ? 'Acknowledge' : 'Continue'}
    </Button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => dispatch(closeStatusModal())}
      title={title || (isSuccess ? 'Response Valid' : isError ? 'System Fault' : 'Notification')}
      icon={icon}
      footer={footer}
      maxWidth="max-w-[380px]"
    >
      <div className="flex flex-col items-center justify-center text-center space-y-6 py-4 animate-in fade-in zoom-in-95 duration-200">
         <div className={`w-16 h-16 rounded-[12px] flex items-center justify-center border-2 border-dashed rotate-3
           ${bgClass} ${borderClass}`}>
            <div className="w-11 h-11 rounded-[10px] bg-background shadow-premium flex items-center justify-center border border-border/50">
               <Icon name={icon} size="lg" className={colorClass} />
            </div>
         </div>
         
         <div className="space-y-2 px-4">
            <Typography variant="h3" className="font-black tracking-tight">{title}</Typography>
            <Typography variant="body" className="opacity-60 leading-relaxed font-medium">
               {message}
            </Typography>
         </div>

         <div className="w-full pt-4 border-t border-border/30 flex justify-center">
            <div className="flex items-center gap-1.5 opacity-20">
               <div className="w-1 h-1 rounded-full bg-foreground" />
               <div className="w-1 h-1 rounded-full bg-foreground" />
               <div className="w-1 h-1 rounded-full bg-foreground" />
            </div>
         </div>
      </div>
    </Modal>
  );
}
