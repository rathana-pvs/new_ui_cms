export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-2 flex items-center justify-between text-[11px] text-slate-500">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-green-500"></span>
          Connected to 127.0.0.1:1523
        </span>
        <span>Version 11.2.0.4501</span>
      </div>
      <div className="flex items-center gap-4">
        <span>UTF-8 Encoding</span>
        <span className="font-medium">Ready</span>
      </div>
    </footer>
  );
}
