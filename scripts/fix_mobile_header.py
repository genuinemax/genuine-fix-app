from pathlib import Path
import re

path = Path('src/App.jsx')
text = path.read_text(encoding='utf-8')

# Keep the navigation state collapsed by default.
text = text.replace(
    "const [openNavGroup, setOpenNavGroup] = useState('MAIN');",
    "const [openNavGroup, setOpenNavGroup] = useState('');"
)

nav_start = "      {/* Premium Top Navigation — stable brand + overlay navigation */}"
main_marker = "      {/* Main Container */}"

if nav_start not in text or main_marker not in text:
    raise SystemExit('Navigation markers not found; refusing to patch.')

nav = '''      {/* Premium Top Navigation — responsive in-flow navigation */}
      <nav className={`border-b ${t.border} ${t.navBg} backdrop-blur-xl sticky top-0 z-30 shadow-2xl`}>
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 sm:py-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 min-h-[58px]">
            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-[270px] sm:min-w-[270px]">
              <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl overflow-hidden border border-slate-700 shadow-md bg-slate-900 flex items-center justify-center">
                <img src="/logo.jpg" alt="Genuine Fix Logo" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className={`font-extrabold text-base sm:text-lg ${t.textMain} leading-tight tracking-tight truncate`}>{shopInfo.name}</h1>
                  <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-blue-600/15 text-blue-400 border border-blue-500/20 text-[9px] font-black tracking-wider">PRO</span>
                </div>
                <p className="text-[10px] sm:text-xs text-blue-400 font-bold uppercase tracking-widest truncate">Laptop & Smartphone Repair</p>
              </div>
            </div>

            <div className={`w-full min-w-0 ${t.cardSecondary} p-1.5 rounded-2xl border ${t.border} shadow-inner`}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
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
                    <button
                      key={group.title}
                      type="button"
                      onClick={() => setOpenNavGroup(isOpen ? '' : group.title)}
                      className={`w-full h-9 sm:h-10 flex items-center justify-between gap-1.5 sm:gap-2 px-2.5 sm:px-3 rounded-xl text-left transition-all ${hasActive ? 'bg-blue-600/10 text-blue-400' : t.textMuted} hover:bg-blue-600/10`}
                    >
                      <span className="text-[10px] sm:text-sm font-black tracking-wide truncate">{group.title}</span>
                      <ChevronRight size={15} className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90 text-blue-400' : ''}`} />
                    </button>
                  );
                })}
              </div>

              {openNavGroup && (() => {
                const group = [
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
                ].find(g => g.title === openNavGroup);
                if (!group) return null;
                return (
                  <div className={`mt-1.5 p-2 rounded-2xl border ${t.border} ${t.cardBg} shadow-inner`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
                      {group.items.map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => { setActiveTab(item.id); setOpenNavGroup(''); }}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
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
                );
              })()}
            </div>
          </div>
        </div>
      </nav>

'''

before, rest = text.split(nav_start, 1)
_, after = rest.split(main_marker, 1)
text = before + nav + main_marker + after
path.write_text(text, encoding='utf-8')
print('Navigation changed to an in-flow responsive layout so mobile section tabs and their items cannot overlap or hide behind the header.')
