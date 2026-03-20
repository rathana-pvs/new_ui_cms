import { useSelector } from 'react-redux';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';

export default function Footer() {
  const { selectedHostUid, hosts, authorizedHosts, hostEnvs } = useSelector((state) => state.host);
  const currentHost = hosts.find(h => h.uid === selectedHostUid);
  const isConnected = selectedHostUid && authorizedHosts.includes(selectedHostUid);
  const version = hostEnvs[selectedHostUid]?.CUBRIDVER || '11.2.0.4501';

  return (
    <footer className="bg-background border-t border-border/50 px-6 py-2.5 flex items-center justify-between shadow-2xl z-[100]">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 group">
          {selectedHostUid ? (
            <>
              <div className="relative">
                <div className={`size-2.5 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-muted/30'}`}></div>
                {isConnected && <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20 size-2.5"></div>}
              </div>
              <Typography variant="caption" className="font-black text-foreground/60 transition-colors group-hover:text-primary">
                {isConnected ? 'LIVE' : 'IDLE'}
              </Typography>
              <div className="h-4 w-px bg-border/50 mx-1"></div>
              <Typography variant="body2" className="text-foreground/40 font-bold font-mono">
                {currentHost?.address || 'unknown'}:{currentHost?.port || '1523'}
              </Typography>
            </>
          ) : (
            <div className="flex items-center gap-2 opacity-30 italic">
               <Icon name="link_off" size="xs" />
               <Typography variant="caption" className="font-black">No Active Connection</Typography>
            </div>
          )}
        </div>
        
        {selectedHostUid && (
          <div className="flex items-center gap-2 group">
             <Icon name="verified" size="xs" className="text-primary/40 group-hover:text-primary transition-colors" />
             <Typography variant="caption" className="font-black opacity-30 uppercase tracking-widest text-[9px] group-hover:opacity-60 transition-opacity">
                Engine {version}
             </Typography>
          </div>
        )}
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 px-3 py-1 bg-muted/5 rounded-full border border-border/30 hover:border-primary/30 transition-all duration-300">
          <Icon name="text_snippet" size="xs" className="text-foreground/40" />
          <Typography variant="caption" className="font-black text-[9px] text-foreground/40 uppercase tracking-tighter">UTF-8</Typography>
        </div>
        
        <div className="flex items-center gap-2">
           <Typography variant="caption" className={`font-black uppercase tracking-[0.2em] text-[10px] ${selectedHostUid ? 'text-primary' : 'text-foreground/20'}`}>
             {selectedHostUid ? 'Ready' : 'Terminated'}
           </Typography>
        </div>
      </div>
    </footer>
  );
}
