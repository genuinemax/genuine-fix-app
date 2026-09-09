from pathlib import Path

path = Path('src/App.jsx')
text = path.read_text(encoding='utf-8')

old = '''              <input type="number" placeholder="Min Stock Warning" value={newPart.minStock} onChange={e => setNewPart({...newPart, minStock: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />

              <button type="submit" className="md:col-span-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-blue-600/35">'''
new = '''              <input type="number" placeholder="Min Stock Warning" value={newPart.minStock} onChange={e => setNewPart({...newPart, minStock: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <textarea placeholder="Notes / Remarks (Optional)" value={newPart.notes || ''} onChange={e => setNewPart({...newPart, notes: e.target.value})} rows="3" className={`md:col-span-3 p-3 ${t.inputBg} border ${t.border} rounded-2xl text-sm focus:outline-none resize-y`} />

              <button type="submit" className="md:col-span-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-blue-600/35">'''
if old not in text:
    raise SystemExit('Parts stock entry location not found; refusing to patch.')
text = text.replace(old, new, 1)

# Save notes when creating or editing a part.
text = text.replace("supplierPhone: newPart.supplierPhone || '', lastPurchaseDate:", "supplierPhone: newPart.supplierPhone || '', notes: newPart.notes || '', lastPurchaseDate:")

# Ensure every parts-entry reset keeps the notes field.
text = text.replace("supplierPhone: '', purchaseDate: todayKey", "supplierPhone: '', notes: '', purchaseDate: todayKey")

path.write_text(text, encoding='utf-8')
print('Added a visible Notes / Remarks box to Parts Stock entry and saved it with inventory items.')
