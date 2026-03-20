import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAboutCubrid } from '../appBarSlice';
import Modal from '../../../components/ui/Layout/Modal';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';

export default function AboutModal() {
  const dispatch = useDispatch();
  const { isAboutCubridOpen } = useSelector((state) => state.appBar);

  if (!isAboutCubridOpen) return null;

  return (
    <Modal
      isOpen={isAboutCubridOpen}
      onClose={() => dispatch(setAboutCubrid(false))}
      title="About CUBRID Manager"
      size="md"
    >
      <div className="relative -mx-6 -mt-6 mb-8 overflow-hidden h-32 flex items-center justify-center bg-gradient-to-br from-primary to-accent-indigo">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="relative z-10 w-20 h-20 bg-background rounded-2xl flex items-center justify-center shadow-premium-lg border border-border/50 animate-in zoom-in-95 duration-500 delay-100">
           <img src="/cubrid-logo.png" alt="CUBRID Logo" className="w-12 h-12 object-contain" />
        </div>
      </div>

      <div className="text-center space-y-8 px-2">
        <div>
          <Typography variant="h3" className="font-black tracking-tight mb-2">
            CUBRID <span className="text-primary italic">Manager</span>
          </Typography>
          <Typography variant="caption" className="font-black opacity-30 uppercase tracking-[0.3em]">
            Enterprise Web Management
          </Typography>
        </div>

        <div className="relative p-5 rounded-2xl bg-muted/5 border border-border/50 group hover:border-primary/20 transition-all duration-500">
           <div className="absolute -top-3 -left-2 bg-background p-1">
              <Icon name="format_quote" size="xs" className="text-primary/40 rotate-180" />
           </div>
           <Typography variant="body2" className="italic opacity-60 leading-relaxed font-medium">
             CUBRID is an open-source SQL-based RDBMS with object extensions. The name combines 'Cube' (Data Space) and 'Bridge' (Data Bridge), reflecting its role as a secure connection between users and their critical infrastructure.
           </Typography>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-border/30">
             <Typography variant="caption" className="font-black opacity-40 uppercase tracking-widest">Core Version</Typography>
             <Typography variant="body2" className="font-black font-mono">12.4.0-Final</Typography>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-border/30">
             <Typography variant="caption" className="font-black opacity-40 uppercase tracking-widest">Web Interface</Typography>
             <Typography variant="body2" className="font-black font-mono">v1.1.2</Typography>
          </div>
          <div className="flex justify-between items-center py-3">
             <Typography variant="caption" className="font-black opacity-40 uppercase tracking-widest">Environment</Typography>
             <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <Typography variant="caption" className="font-black text-emerald-600 uppercase tracking-tighter">Production Ready</Typography>
             </div>
          </div>
        </div>

        <div className="pt-4 space-y-6">
          <button 
            onClick={() => dispatch(setAboutCubrid(false))}
            className="w-full py-4 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest rounded-xl hover:shadow-premium-lg hover:-translate-y-0.5 transition-all active:translate-y-0 active:scale-95 shadow-premium"
          >
            Acknowledge & Close
          </button>
          <Typography variant="caption" className="block font-black opacity-20 tracking-[0.2em] uppercase text-[9px]">
            © 2026 CUBRID Corporation. All rights reserved.
          </Typography>
        </div>
      </div>
    </Modal>
  );
}
