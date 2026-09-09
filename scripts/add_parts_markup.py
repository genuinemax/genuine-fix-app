from pathlib import Path
import re

p = Path('src/App.jsx')
s = p.read_text()
original = s

# Add markup percentage to the parts form state.
old_state = "const [newPart, setNewPart] = useState({ name: '', stock: '', costPrice: '', price: '', minStock: '5', supplierName: '', supplierPhone: '', purchaseDate: getLocalDateKey() });"
new_state = "const [newPart, setNewPart] = useState({ name: '', stock: '', costPrice: '', markupPercent: '', price: '', minStock: '5', supplierName: '', supplierPhone: '', purchaseDate: getLocalDateKey() });"
if old_state in s:
    s = s.replace(old_state, new_state, 1)

# Calculate SP from CP + markup percentage whenever the part is saved.
old_calc = "const qty = Number(newPart.stock || 0), cost = Number(newPart.costPrice || 0);"
new_calc = "const qty = Number(newPart.stock || 0), cost = Number(newPart.costPrice || 0), markupPercent = Number(newPart.markupPercent || 0);\n    const sellingPrice = Math.round((cost * (1 + markupPercent / 100)) * 100) / 100;"
if old_calc in s and "const sellingPrice = Math.round((cost * (1 + markupPercent / 100))" not in s:
    s = s.replace(old_calc, new_calc, 1)

# Store markup percentage and calculated SP on edit/save.
s = s.replace("costPrice: cost, price: Number(newPart.price || 0), minStock:", "costPrice: cost, markupPercent, price: sellingPrice, minStock:", 1)
s = s.replace("costPrice: cost, price: Number(newPart.price || 0), minStock:", "costPrice: cost, markupPercent, price: sellingPrice, minStock:", 1)

# Reset the markup field after add/edit.
s = s.replace("{ name: '', stock: '', costPrice: '', price: '', minStock: '5', supplierName:", "{ name: '', stock: '', costPrice: '', markupPercent: '', price: '', minStock: '5', supplierName:")

# When editing an existing item, derive the current markup from CP -> SP so the field is prefilled.
old_edit = "setNewPart({ name: item.name, stock: item.stock, costPrice: item.costPrice, price: item.price, minStock: item.minStock || '5', supplierName: item.supplierName || '', supplierPhone: item.supplierPhone || '', purchaseDate: item.lastPurchaseDate || todayKey });"
new_edit = "setNewPart({ name: item.name, stock: item.stock, costPrice: item.costPrice, markupPercent: Number(item.costPrice) > 0 ? Math.round(((Number(item.price || 0) - Number(item.costPrice || 0)) / Number(item.costPrice || 1)) * 10000) / 100 : '', price: item.price, minStock: item.minStock || '5', supplierName: item.supplierName || '', supplierPhone: item.supplierPhone || '', purchaseDate: item.lastPurchaseDate || todayKey });"
if old_edit in s:
    s = s.replace(old_edit, new_edit, 1)

# Replace the manual SP input with percentage input + live calculated SP display.
old_ui = '<input type="number" placeholder="Selling Price (NPR)" value={newPart.price} onChange={e => setNewPart({...newPart, price: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />'
new_ui = '''<input type="number" min="0" step="0.01" placeholder="Profit / Markup %" value={newPart.markupPercent} onChange={e => setNewPart(prev => ({ ...prev, markupPercent: e.target.value, price: Number(prev.costPrice || 0) > 0 ? String(Math.round((Number(prev.costPrice || 0) * (1 + Number(e.target.value || 0) / 100)) * 100) / 100) : '' }))} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              <div className={`p-3 ${t.cardSecondary} border ${t.border} rounded-2xl flex items-center justify-between gap-3`}>
                <div>
                  <div className={`text-xs font-bold uppercase tracking-wide ${t.textMuted}`}>Selling Price (SP)</div>
                  <div className={`text-lg font-black ${t.textMain}`}>NPR {Number(newPart.price || 0).toLocaleString()}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black">Auto</span>
              </div>'''
if old_ui in s:
    s = s.replace(old_ui, new_ui, 1)

# Make changing cost price also immediately recalculate SP from the entered percentage.
old_cost_ui = '<input type="number" placeholder="Cost Price (NPR)" value={newPart.costPrice} onChange={e => setNewPart({...newPart, costPrice: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />'
new_cost_ui = '<input type="number" min="0" step="0.01" placeholder="Cost Price (NPR)" value={newPart.costPrice} onChange={e => setNewPart(prev => ({ ...prev, costPrice: e.target.value, price: Number(e.target.value || 0) > 0 ? String(Math.round((Number(e.target.value || 0) * (1 + Number(prev.markupPercent || 0) / 100)) * 100) / 100) : "" }))} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />'
if old_cost_ui in s:
    s = s.replace(old_cost_ui, new_cost_ui, 1)

if 'placeholder="Profit / Markup %"' not in s:
    raise SystemExit('Markup percentage UI was not added')
if 'const sellingPrice = Math.round((cost * (1 + markupPercent / 100))' not in s:
    raise SystemExit('Selling price calculation was not added')

p.write_text(s)
print('parts markup patch changed source:', s != original)
