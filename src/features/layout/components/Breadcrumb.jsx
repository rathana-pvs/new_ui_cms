export default function Breadcrumb({ activeTab, onTabChange, openTabs = [], onCloseTab, labels = {} }) {
  const getTabIcon = (id) => {
    if (id.startsWith('host:')) return 'monitoring';
    if (id.startsWith('db:')) return 'table_chart';
    return 'description';
  };

  const getTabLabel = (id) => {
    if (labels[id]) return labels[id];
    switch (id) {
      case 'server': return 'server';
      case 'demodb': return 'demodb';
      default: return id;
    }
  };

  return (
    <div className="bg-slate-200/60 dark:bg-[#0a0c10] border-b border-slate-200 dark:border-slate-800">
      <div className="flex overflow-x-auto scrollbar-hide">
        {openTabs.map((tabId) => (
          <div 
            key={tabId}
            className={`group flex items-center gap-2.5 px-4 py-2.5 border-r border-slate-200 dark:border-slate-800 border-t-2 font-medium text-sm cursor-pointer min-w-[140px] transition-colors whitespace-nowrap ${activeTab === tabId ? 'bg-background-light dark:bg-[#1a1b1e] border-t-blue-500 dark:border-t-blue-500' : 'bg-transparent hover:bg-slate-200 dark:hover:bg-[#151822] border-t-transparent text-slate-500 dark:text-slate-400'}`}
            onClick={() => onTabChange(tabId)}
          >
            <span className={`material-symbols-outlined text-[16px] ${activeTab === tabId ? 'text-blue-600 dark:text-blue-500' : 'opacity-70'}`}>
              {getTabIcon(tabId)}
            </span>
            <span className={activeTab === tabId ? 'text-slate-800 dark:text-slate-200' : ''}>
              {getTabLabel(tabId)}
            </span>
            <div 
              className={`flex items-center justify-center p-0.5 ml-auto rounded transition-colors ${activeTab === tabId ? 'text-blue-600 dark:text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-500/20' : 'opacity-0 group-hover:opacity-100 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tabId);
              }}
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
