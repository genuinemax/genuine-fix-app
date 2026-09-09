from pathlib import Path

p = Path('src/App.jsx')
s = p.read_text(encoding='utf-8')
original = s

old_state = "const [newPart, setNewPart] = useState({ name: '', stock: '', costPrice: '', markupPercent: '', price: '', minStock: '5', supplierName: '', supplierPhone: '', purchaseDate: getLocalDateKey() });"
new_state = "const [newPart, setNewPart] = useState({ name: '', stock: '', costPrice: '', markupPercent: '', price: '', minStock: '5', supplierName: '', supplierPhone: '', purchaseDate: getLocalDateKey(), notes: '' });"
if old_state in s:
    s = s.replace(old_state, new_state, 1)

reset_old = "{ name: '', stock: '', costPrice: '', markupPercent: '', price: '', minStock: '5', supplierName: '', supplierPhone: '', purchaseDate: todayKey }"
reset_new = "{ name: '', stock: '', costPrice: '', markupPercent: '', price: '', minStock: '5', supplierName: '', supplierPhone: '', purchaseDate: todayKey, notes: '' }"
s = s.replace(reset_old, reset_new)

# Persist notes when editing or creating an inventory item.
s = s.replace("supplierPhone: newPart.supplierPhone || '', lastPurchaseDate: newPart.purchaseDate || todayKey } : item)", "supplierPhone: newPart.supplierPhone || '', notes: newPart.notes || item.notes || '', lastPurchaseDate: newPart.purchaseDate || todayKey } : item)", 1)
s = s.replace("supplierPhone: newPart.supplierPhone || '', lastPurchaseDate: newPart.purchaseDate || todayKey }]);", "supplierPhone: newPart.supplierPhone || '', notes: newPart.notes || '', lastPurchaseDate: newPart.purchaseDate || todayKey }]);", 1)

# Carry the same note into the initial stock purchase history entry.
s = s.replace("invoiceNo: '', notes: 'Initial stock entry' }, ...stockPurchases]", "invoiceNo: '', notes: newPart.notes || 'Initial stock entry' }, ...stockPurchases]", 1)

# Add a proper multiline notes box to the Parts Stock entry form.
ui_anchor = '''              <input type="number" placeholder="Min Stock Warning" value={newPart.minStock} onChange={e => setNewPart({...newPart, minStock: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />

              <button type="submit"'''
ui_replacement = '''              <input type="number" placeholder="Min Stock Warning" value={newPart.minStock} onChange={e => setNewPart({...newPart, minStock: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <textarea
                rows="3"
                placeholder="Notes / Remarks (optional) — e.g. quality, supplier detail, location, warranty..."
                value={newPart.notes}
                onChange={e => setNewPart({...newPart, notes: e.target.value})}
                className={`md:col-span-3 p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none resize-y`}
              />

              <button type="submit"'''
if ui_anchor in s:
    s = s.replace(ui_anchor, ui_replacement, 1)
elif 'placeholder="Notes / Remarks (optional)' not in s:
    raise SystemExit('Parts Stock entry form anchor not found; refusing to patch.')

p.write_text(s, encoding='utf-8')
print('Inventory entry notes patch changed source:', s != original)
