from pathlib import Path
import re

path = Path('src/App.jsx')
text = path.read_text(encoding='utf-8')

start = text.find("            {[\n              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },")
end_marker = "            ].map(item => ("
end = text.find(end_marker, start)
if start < 0 or end < 0:
    raise SystemExit('Navigation array block not found; refusing to patch.')

replacement = """            {[\n              {\n                title: 'MAIN',\n                items: [\n                  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },\n                  { id: 'customers', icon: Users, label: 'Customers' },\n                  { id: 'orders', icon: ClipboardList, label: 'Orders' },\n                ],\n              },\n              {\n                title: 'SALES',\n                items: [\n                  { id: 'invoices', icon: FileText, label: 'Invoices' },\n                  { id: 'pos', icon: ShoppingBag, label: 'Accessories Bill' },\n                  { id: 'repairs', icon: ShieldCheck, label: 'Job Sheets' },\n                  { id: 'devices', icon: Smartphone, label: 'Device Buy/Sell' },\n                ],\n              },\n              {\n                title: 'INVENTORY',\n                items: [\n                  { id: 'inventory', icon: Package, label: 'Parts Stock' },\n                  { id: 'stock-history', icon: History, label: 'Stock History' },\n                ],\n              },\n              {\n                title: 'FINANCE',\n                items: [\n                  { id: 'expenses', icon: DollarSign, label: 'Expenses' },\n                  { id: 'supplier', icon: Users, label: 'Supplier / Udhaaro' },\n                ],\n              },\n              {\n                title: 'SYSTEM',\n                items: [\n                  { id: 'backup', icon: Download, label: 'Backup' },\n                  { id: 'settings', icon: Settings, label: 'Settings' },\n                ],\n              },\n            ].map(group => (\n              <div key={group.title} className=\"flex flex-wrap items-center gap-1.5 px-1\">\n                <span className={`hidden xl:block px-1.5 text-[9px] font-black tracking-widest ${t.textMuted} opacity-70`}>{group.title}</span>\n                {group.items.map(item => (\n                  <button \n                    key={item.id}\n                    onClick={() => setActiveTab(item.id)}\n                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${\n                      activeTab === item.id \n                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-[1.01]' \n                        : `${t.textMuted} hover:text-white hover:bg-blue-600/10 hover:-translate-y-0.5`\n                    }`}\n                  >\n                    <item.icon size={15} />\n                    <span>{item.label}</span>\n                  </button>\n                ))}\n              </div>\n            ))"""

text = text[:start] + replacement + text[end + len(end_marker):]
path.write_text(text, encoding='utf-8')
print('Organized navigation groups applied.')
