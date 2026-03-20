import { useRef } from 'react';

export default function ConfigSourceEditor({ rawContent, handleSourceChange }) {
  const textareaRef = useRef(null);
  const preRef = useRef(null);

  const syncScroll = (e) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.target.scrollTop;
      preRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const renderHighlightedContent = () => {
    return rawContent.split('\n').map((line, i) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('#')) {
        return <span key={i} className="text-slate-400 dark:text-slate-500 italic opacity-80">{line}{'\n'}</span>;
      }
      if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
        return <span key={i} className="text-bk-yellow font-medium">{line}{'\n'}</span>;
      }
      return <span key={i}>{line}{'\n'}</span>;
    });
  };

  return (
    <div className="flex-1 relative p-4 bg-slate-100 dark:bg-black/20">
      <div className="h-full w-full bg-white dark:bg-[#1a1c1e] rounded-[6px] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-slate-800/50">
           <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 font-mono tracking-tight uppercase">cubrid_broker.conf</span>
        </div>
        
        <div className="flex-1 relative overflow-hidden">
          <pre 
            ref={preRef}
            className="absolute inset-0 p-5 font-mono text-[13px] leading-relaxed text-slate-800 dark:text-slate-300 pointer-events-none whitespace-pre-wrap break-all overflow-hidden"
            aria-hidden="true"
          >
            {renderHighlightedContent()}
          </pre>

          <textarea 
            ref={textareaRef}
            value={rawContent}
            onChange={handleSourceChange}
            onScroll={syncScroll}
            spellCheck="false"
            className="absolute inset-0 w-full h-full bg-transparent p-5 font-mono text-[13px] leading-relaxed text-transparent caret-slate-800 dark:caret-bk-yellow outline-none resize-none custom-scrollbar whitespace-pre-wrap break-all overflow-auto"
            placeholder="# Enter broker configuration here..."
          />
        </div>

        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-black/20 flex items-center justify-between">
           <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Comments are preserved in Source View</span>
           <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono text-right">Lines: {rawContent.split('\n').length}</span>
        </div>
      </div>
    </div>
  );
}
