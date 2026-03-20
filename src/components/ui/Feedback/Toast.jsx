import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Typography from '../Foundation/Typography';
import Icon from '../Foundation/Icon';

let toastTimeout;

const variants = {
  success: 'bg-emerald-600 text-white shadow-emerald-500/20',
  error: 'bg-destructive text-white shadow-destructive/20',
  info: 'bg-slate-900 text-white shadow-slate-900/20',
};

const icons = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
};

export default function Toast({ 
  message, 
  variant = 'info', 
  isOpen, 
  onClose,
  duration = 3000
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        onClose();
      }, duration);
    } else {
      setIsMounted(false);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className={`
      fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-lg shadow-2xl transition-all animate-in slide-in-from-right fade-in duration-300
      ${variants[variant] || variants.info}
    `}>
      <Icon name={icons[variant] || icons.info} size="md" />
      <Typography variant="span" className="font-bold tracking-tight">
        {message}
      </Typography>
      <button 
        onClick={onClose}
        className="ml-2 hover:bg-white/10 rounded-md transition-colors p-0.5"
      >
        <Icon name="close" size="sm" />
      </button>
    </div>,
    document.body
  );
}
