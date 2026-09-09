from pathlib import Path

p = Path('src/App.jsx')
s = p.read_text(encoding='utf-8')
original = s

state_anchor = "  const [selectedStockPurchase, setSelectedStockPurchase] = useState(null);\n"
if "const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);" not in s:
    if state_anchor not in s:
        raise SystemExit('Inventory view state anchor not found; refusing to patch.')
    s = s.replace(state_anchor, state_anchor + "  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);\n", 1)

old_actions = '''                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => { setEditingPartId(item.id); setSelectedCategory(item.category); setNewPart({ name: item.name, stock: item.stock, costPrice: item.costPrice, markupPercent: Number(item.costPrice) > 0 ? Math.round(((Number(item.price || 0) - Number(item.costPrice || 0)) / Number(item.costPrice || 1)) * 10000) / 100 : '', price: item.price, minStock: item.minStock || '5', supplierName: item.supplierName || '', supplierPhone: item.supplierPhone || '', purchaseDate: item.lastPurchaseDate || todayKey }); }} className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl font-bold">Edit</button>
                          <button onClick={() => setInventory(inventory.filter(i => i.id !== item.id))} className="px-3 py-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-xl font-bold"><Trash2 size={14}/></button>
                        </td>'''
new_actions = '''                        <td className="p-4 text-right">
                          <div className="flex justify-end items-center gap-1.5">
                            <button type="button" onClick={() => { setEditingPartId(item.id); setSelectedCategory(item.category); setNewPart({ name: item.name, stock: item.stock, costPrice: item.costPrice, markupPercent: Number(item.costPrice) > 0 ? Math.round(((Number(item.price || 0) - Number(item.costPrice || 0)) / Number(item.costPrice || 1)) * 10000) / 100 : '', price: item.price, minStock: item.minStock || '5', supplierName: item.supplierName || '', supplierPhone: item.supplierPhone || '', purchaseDate: item.lastPurchaseDate || todayKey, notes: item.notes || '' }); }} className="px-3 py-1.5 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 rounded-xl font-bold inline-flex items-center gap-1.5"><Pencil size={14}/> Edit</button>
                            <button type="button" onClick={() => setInventory(inventory.filter(i => i.id !== item.id))} className="p-2 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 rounded-xl" title="Delete item"><Trash2 size={14}/></button>
                            <button type="button" onClick={() => setSelectedInventoryItem(item)} className="px-3 py-1.5 bg-blue-600/15 text-blue-400 hover:bg-blue-600/25 rounded-xl font-bold inline-flex items-center gap-1.5"><Eye size={14}/> View</button>
                          </div>
                        </td>'''
if old_actions in s:
    s = s.replace(old_actions, new_actions, 1)
elif 'setSelectedInventoryItem(item)' not in s:
    raise SystemExit('Inventory action row not found; refusing to patch.')

modal_anchor = '''

            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>
              <div className="p-5 border-b border-slate-700/50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <h3 className={`text-lg font-black ${t.textMain}`}>Stock Purchase History</h3>'''
modal = '''

            {selectedInventoryItem && (
              <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedInventoryItem(null)}>
                <div className={`${t.cardBg} border ${t.border} rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden`} onClick={e => e.stopPropagation()}>
                  <div className={`p-5 border-b ${t.border} flex items-center justify-between gap-3`}>
                    <div>
                      <p className={`text-xs uppercase tracking-[0.2em] font-black ${t.textMuted}`}>Inventory Item Detail</p>
                      <h3 className={`text-xl font-black ${t.textMain}`}>{selectedInventoryItem.name}</h3>
                    </div>
                    <button type="button" onClick={() => setSelectedInventoryItem(null)} className={`p-2 rounded-xl ${t.cardSecondary} ${t.textMuted} hover:text-white`}><X size={18}/></button>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      ['Category', selectedInventoryItem.category || '—'],
                      ['Stock Qty', `${Number(selectedInventoryItem.stock || 0).toLocaleString()} units`],
                      ['Cost Price', `NPR ${Number(selectedInventoryItem.costPrice || 0).toLocaleString()}`],
                      ['Selling Price', `NPR ${Number(selectedInventoryItem.price || 0).toLocaleString()}`],
                      ['Min Stock Warning', `${Number(selectedInventoryItem.minStock || 5).toLocaleString()} units`],
                      ['Supplier', selectedInventoryItem.supplierName || '—'],
                      ['Supplier Phone', selectedInventoryItem.supplierPhone || '—'],
                      ['Last Purchase Date', selectedInventoryItem.lastPurchaseDate || '—'],
                    ].map(([label, value]) => (
                      <div key={label} className={`${t.cardSecondary} border ${t.border} rounded-2xl p-4`}>
                        <div className={`text-xs uppercase tracking-wide font-black ${t.textMuted}`}>{label}</div>
                        <div className={`text-sm font-bold ${t.textMain} mt-1 break-words`}>{value}</div>
                      </div>
                    ))}
                    <div className={`sm:col-span-2 ${t.cardSecondary} border ${t.border} rounded-2xl p-4`}>
                      <div className={`text-xs uppercase tracking-wide font-black ${t.textMuted}`}>Notes / Remarks</div>
                      <div className={`text-sm ${t.textMain} mt-1 whitespace-pre-wrap break-words`}>{selectedInventoryItem.notes || 'No notes added.'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}'''
if 'Inventory Item Detail' not in s:
    if modal_anchor not in s:
        raise SystemExit('Inventory history anchor not found; refusing to patch.')
    s = s.replace(modal_anchor, modal + modal_anchor, 1)

p.write_text(s, encoding='utf-8')
print('Inventory View action changed source:', s != original)
