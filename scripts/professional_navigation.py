from pathlib import Path

path = Path('src/App.jsx')
text = path.read_text(encoding='utf-8')

old_state = "  const [mobileNavOpen, setMobileNavOpen] = useState(false);"
if "const [openNavGroup" not in text:
    if old_state not in text:
        raise SystemExit('mobileNavOpen state not found; refusing to patch.')
    text = text.replace(old_state, old_state + "\n  const [openNavGroup, setOpenNavGroup] = useState('');", 1)
else:
    text = text.replace("const [openNavGroup, setOpenNavGroup] = useState('MAIN');", "const [openNavGroup, setOpenNavGroup] = useState('');", 1)

start_marker = "      {/* Premium Top Navigation */}"
end_marker = "      {/* Main Container */}"
start = text.find(start_marker)
end = text.find(end_marker)
if start < 0 or end < 0 or end <= start:
    raise SystemExit('Navigation block markers not found; refusing to patch.')

nav = '''      {/* Premium Top Navigation — stable brand + responsive overlay navigation */}
      <nav className={`border-b ${t.border} ${t.navBg} backdrop-blur-xl sticky top-0 z-30 shadow-2xl`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 min-h-[58px]">
            <div className="flex items-center gap-3 shrink-0 w-full sm:w-[270px] sm:min-w-[270px] min-w-0">
              <div className="w-10 h-10 shrink-0 rounded-xl overflow-hidden border border-slate-700 shadow-md bg-slate-900 flex items-center justify-center">
                <img src="/logo.jpg" alt="Genuine Fix Logo" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className={`font-extrabold text-lg ${t.textMain} leading-tight tracking-tight truncate`}>{shopInfo.name}</h1>
                  <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-blue-600/15 text-blue-400 border border-blue-500/20 text-[9px] font-black tracking-wider">PRO</span>
                </div>
                <p className="text-xs text-blue-400 font-bold uppercase tracking-widest truncate">Laptop & Smartphone Repair</p>
              </div>
            </div>

            <div className={`relative w-full min-w-0 flex-1 ${t.cardSecondary} p-1 rounded-2xl border ${t.border} shadow-inner`}>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-1">
                {[
                  { title: 'MAIN', items: [
                    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                    { id: 'customers', icon: Users, label: 'Customers' },
                    { id: 'orders', icon: ClipboardList, label: 'Orders' },
                  ]},
                  { title: 'SALES & SERVICE', items: [
                    { id: 'invoices', icon: FileText, label: 'Invoices' },
                    { id: 'pos', icon: ShoppingBag, label: 'Accessories Bill' },
                    { id: 'repairs', icon: ShieldCheck, label: 'Job Sheets' },
                    { id: 'devices', icon: Smartphone, label: 'Device Buy/Sell' },
                  ]},
                  { title: 'INVENTORY', items: [
                    { id: 'inventory', icon: Package, label: 'Parts Stock' },
                  ]},
                  { title: 'FINANCE & SYSTEM', items: [
                    { id: 'expenses', icon: DollarSign, label: 'Expenses' },
                    { id: 'backup', icon: Download, label: 'Backup' },
                    { id: 'settings', icon: Settings, label: 'Settings' },
                  ]},
                ].map(group => {
                  const isOpen = openNavGroup === group.title;
                  const hasActive = group.items.some(item => item.id === activeTab);
                  return (
                    <div key={group.title} className="relative min-w-0">
                      <button
                        type="button"
                        onClick={() => setOpenNavGroup(isOpen ? '' : group.title)}
                        className={`w-full h-10 flex items-center justify-between gap-2 px-2.5 sm:px-3 rounded-xl text-left transition-all ${hasActive ? 'bg-blue-600/10 text-blue-400' : t.textMuted} hover:bg-blue-600/10`}
                      >
                        <span className="text-[11px] sm:text-sm font-black tracking-wide truncate">{group.title}</span>
                        <ChevronRight size={15} className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90 text-blue-400' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className={`absolute left-0 right-0 top-[calc(100%+8px)] z-50 p-2 rounded-2xl border ${t.border} ${t.cardBg} shadow-2xl ring-1 ring-black/10`}>
                          <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-1.5">
                            {group.items.map(item => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => { setActiveTab(item.id); setOpenNavGroup(group.title); }}
                                className={`w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                  activeTab === item.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                    : `${t.textMuted} hover:text-white hover:bg-blue-600/10`
                                }`}
                              >
                                <item.icon size={15} />
                                <span className="truncate">{item.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

'''
text = text[:start] + nav + text[end:]
path.write_text(text, encoding='utf-8')
print('Responsive professional navigation applied with collapsed default state.')
