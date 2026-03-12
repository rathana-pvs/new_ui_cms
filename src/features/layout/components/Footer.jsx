export default function Footer() {
  return (
    <footer className="bg-white dark:bg-bk-main border-t border-slate-200 dark:border-slate-800 px-6 py-2.5 flex items-center justify-between text-[11px] text-slate-500 font-sans">
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20"></span>
          <span className="dark:text-slate-300 font-medium">Connected to 127.0.0.1:1523</span>
        </span>
        <span className="dark:text-slate-500">Version 11.2.0.4501</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px]">text_snippet</span>
          <span className="dark:text-slate-400">UTF-8</span>
        </div>
        <span className="font-medium text-bk-yellow tracking-wide text-[11px]">Ready</span>
      </div>
    </footer>
  );
}
