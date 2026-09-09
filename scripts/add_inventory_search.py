from pathlib import Path
import re

APP = Path('src/App.jsx')
text = APP.read_text(encoding='utf-8')

# 1) Add reusable searchable inventory picker for POS.
marker = "\n\nexport default function App() {"
component = r'''

function InventoryAutocomplete({ value, onChange, onSelect, inventory, placeholder, className }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || '');

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const suggestions = inventory
    .filter(item => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return String(item.name || '').toLowerCase().includes(q) ||
        String(item.category || '').toLowerCase().includes(q) ||
        String(item.supplierName || '').toLowerCase().includes(q);
    })
    .slice(0, 12);

  const handleInput = (e) => {
    const next = e.target.value;
    setQuery(next);
    onChange(next);
    setOpen(true);
  };

  const choose = (item) => {
    setQuery(item.name);
    onSelect(item);
    setOpen(false);
  };

  return (
    <div className="relative flex-1 min-w-0">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className={`${className} pl-9`}
          autoComplete="off"
          required
        />
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
          {suggestions.map(item => (
            <button
              key={item.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(item)}
              className="w-full px-4 py-3 text-left hover:bg-blue-600/25 transition border-b border-slate-800 last:border-b-0"
            >
              <div className="text-sm font-bold text-white">{item.name}</div>
              <div className="text-xs text-slate-400 mt-0.5">{item.category || 'Stock'} • Stock: {item.stock} • NPR {item.price}</div>
            </button>
          ))}
        </div>
      )}
      {open && query.trim() && suggestions.length === 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl px-4 py-3 text-sm text-slate-400">
          No matching stock item found.
        </div>
      )}
    </div>
  );
}
'''
if 'function InventoryAutocomplete(' not in text:
    if marker not in text:
        raise SystemExit('App marker not found')
    text = text.replace(marker, component + marker, 1)

# 2) Add search states.
state_anchor = "  const [expenseSearch, setExpenseSearch] = useState('');"
state_insert = "  const [inventorySearch, setInventorySearch] = useState('');\n  const [stockHistorySearch, setStockHistorySearch] = useState('');\n"
if 'const [inventorySearch, setInventorySearch]' not in text:
    if state_anchor not in text:
        raise SystemExit('state anchor not found')
    text = text.replace(state_anchor, state_insert + state_anchor, 1)

# 3) Add filtered inventory/history data.
filter_anchor = "  const uniqueExpenseDescriptions = Array.from(new Set(expenses.map(e => e.description).filter(Boolean)));"
filter_insert = r'''
  const filteredInventory = inventory.filter(item => {
    const q = inventorySearch.trim().toLowerCase();
    if (!q) return true;
    return [item.name, item.category, item.supplierName, item.supplierPhone]
      .some(value => String(value || '').toLowerCase().includes(q));
  });

  const filteredStockPurchases = [...stockPurchases]
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    .filter(p => {
      const q = stockHistorySearch.trim().toLowerCase();
      if (!q) return true;
      return [p.partName, p.supplierName, p.invoiceNo, p.notes, p.date]
        .some(value => String(value || '').toLowerCase().includes(q));
    });
'''
if 'const filteredInventory = inventory.filter' not in text:
    if filter_anchor not in text:
        raise SystemExit('filter anchor not found')
    text = text.replace(filter_anchor, filter_anchor + '\n' + filter_insert, 1)

# 4) Replace the POS stock <select> with a searchable picker.
pos_select = re.compile(
    r'''\) : \(\s*<select\s+value=\{item\.name\}[\s\S]*?</select>\s*\)''',
    re.MULTILINE,
)
pos_replacement = r''') : (
                    <InventoryAutocomplete
                      value={item.name}
                      inventory={inventory}
                      placeholder="Search stock item or accessory..."
                      onChange={value => {
                        const nextItems = [...posBill.items];
                        nextItems[idx].name = value;
                        setPosBill({ ...posBill, items: nextItems });
                      }}
                      onSelect={invItem => {
                        const nextItems = [...posBill.items];
                        nextItems[idx].name = invItem.name;
                        nextItems[idx].price = invItem.price;
                        setPosBill({ ...posBill, items: nextItems });
                      }}
                      className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
                    />
                  )'''
text, n = pos_select.subn(pos_replacement, text, count=1)
if n != 1:
    raise SystemExit(f'POS select replacement count={n}')

# 5) Add current-stock search and use filteredInventory in the inventory table.
inv_section_start = text.find('        {/* PARTS STOCK / INVENTORY TAB */}')
if inv_section_start < 0:
    raise SystemExit('inventory section not found')
inv_section_end = text.find('        {/* EXPENSES TAB */}', inv_section_start)
if inv_section_end < 0:
    raise SystemExit('inventory section end not found')
section = text[inv_section_start:inv_section_end]

if 'placeholder="Search stock by name, category or supplier..."' not in section:
    table_anchor = '''            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>'''
    search_block = '''            <div className={`${t.cardBg} border ${t.border} rounded-2xl p-4 flex items-center gap-3`}>
              <Search size={18} className={t.textMuted} />
              <input
                type="text"
                value={inventorySearch}
                onChange={e => setInventorySearch(e.target.value)}
                placeholder="Search stock by name, category or supplier..."
                className={`w-full bg-transparent outline-none text-sm ${t.textMain}`}
              />
              <span className={`text-xs font-bold whitespace-nowrap ${t.textMuted}`}>{filteredInventory.length} items</span>
            </div>

'''
    if table_anchor not in section:
        raise SystemExit('inventory table anchor not found')
    section = section.replace(table_anchor, search_block + table_anchor, 1)
    section = section.replace('{inventory.map(item => (', '{filteredInventory.map(item => (', 1)

# 6) Add searchable stock purchase history beneath the current stock table.
if 'Stock Purchase History' not in section:
    history_block = '''

            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>
              <div className="p-5 border-b border-slate-700/50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <h3 className={`text-lg font-black ${t.textMain}`}>Stock Purchase History</h3>
                  <p className={`text-sm ${t.textMuted}`}>Search previous purchases by item, supplier, invoice, notes or date.</p>
                </div>
                <div className={`flex items-center gap-2 ${t.inputBg} border ${t.border} rounded-2xl px-3 py-2.5 w-full lg:w-96`}>
                  <History size={16} className={t.textMuted} />
                  <input
                    value={stockHistorySearch}
                    onChange={e => setStockHistorySearch(e.target.value)}
                    placeholder="Search purchase history..."
                    className="bg-transparent outline-none text-sm w-full"
                  />
                  <span className={`text-xs font-bold ${t.textMuted}`}>{filteredStockPurchases.length}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                {filteredStockPurchases.length === 0 ? (
                  <div className={`p-6 text-sm ${t.textMuted}`}>No stock purchase history found.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className={`${t.tableHeader} font-bold uppercase text-sm border-b`}>
                      <tr>
                        <th className="p-4 text-left">Date</th>
                        <th className="p-4 text-left">Item</th>
                        <th className="p-4 text-left">Supplier</th>
                        <th className="p-4 text-right">Qty</th>
                        <th className="p-4 text-right">Unit Cost</th>
                        <th className="p-4 text-right">Total</th>
                        <th className="p-4 text-left">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${t.tableDivide}`}>
                      {filteredStockPurchases.map(p => (
                        <tr key={p.id} className="hover:bg-blue-600/5 transition">
                          <td className={`p-4 ${t.textMuted}`}>{p.date || '—'}</td>
                          <td className={`p-4 font-bold ${t.textMain}`}>{p.partName || '—'}<div className={`text-xs ${t.textMuted}`}>{p.notes || ''}</div></td>
                          <td className={`p-4 ${t.textMuted}`}>{p.supplierName || '—'}</td>
                          <td className={`p-4 text-right font-bold ${t.textMain}`}>{p.qty || 0}</td>
                          <td className="p-4 text-right">NPR {Number(p.unitCost || 0).toLocaleString()}</td>
                          <td className={`p-4 text-right font-black ${t.textMain}`}>NPR {Number(p.total || 0).toLocaleString()}</td>
                          <td className={`p-4 ${t.textMuted}`}>{p.invoiceNo || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>'''
    close_marker = '''          </div>
        )}'''
    pos = section.rfind(close_marker)
    if pos < 0:
        raise SystemExit('inventory section close marker not found')
    section = section[:pos] + history_block + '\n' + section[pos:]

text = text[:inv_section_start] + section + text[inv_section_end:]
APP.write_text(text, encoding='utf-8')
print('Inventory search + history patch applied successfully.')
