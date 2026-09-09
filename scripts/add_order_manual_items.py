from pathlib import Path

APP = Path('src/App.jsx')
text = APP.read_text(encoding='utf-8')

# Add an explicit per-line Stock/Manual mode so orders can include items that are not in inventory.
state_anchor = "  const [newOrder, setNewOrder] = useState({ customerName: '', phone: '', items: [{ name: '', price: '', qty: 1, notes: '' }], expectedDate: '', notes: '' });"
state_new = "  const [newOrder, setNewOrder] = useState({ customerName: '', phone: '', items: [{ name: '', price: '', qty: 1, notes: '', mode: 'stock' }], expectedDate: '', notes: '' });"
if state_anchor in text:
    text = text.replace(state_anchor, state_new, 1)

text = text.replace("setNewOrder({ customerName: '', phone: '', items: [{ name: '', price: '', qty: 1, notes: '' }], expectedDate: '', notes: '' });", "setNewOrder({ customerName: '', phone: '', items: [{ name: '', price: '', qty: 1, notes: '', mode: 'stock' }], expectedDate: '', notes: '' });", 1)
text = text.replace("items: [...prev.items, { name: '', price: '', qty: 1, notes: '' }]", "items: [...prev.items, { name: '', price: '', qty: 1, notes: '', mode: 'stock' }]", 1)
text = text.replace("items: (order.items || []).map(i => ({ name: i.name || '', price: i.price || '', qty: i.qty || 1, notes: i.notes || '' }))", "items: (order.items || []).map(i => ({ name: i.name || '', price: i.price || '', qty: i.qty || 1, notes: i.notes || '', mode: i.mode || 'stock' }))", 1)

# Make manual items explicit in the saved order data. Existing stock/manual data remains backward compatible.
old_map = ".map(item => ({ ...item, name: String(item.name || '').trim(), price: Number(item.price || 0), qty: Math.max(1, Number(item.qty || 1)) }))"
new_map = ".map(item => ({ ...item, mode: item.mode || 'stock', name: String(item.name || '').trim(), price: Number(item.price || 0), qty: Math.max(1, Number(item.qty || 1)) }))"
text = text.replace(old_map, new_map, 1)

# Replace the order-item picker block with a stock/manual switch and manual fields.
start = "                  <div key={index} className=\"grid grid-cols-1 md:grid-cols-12 gap-2 items-center\">"
end = "                  </div>\n                ))}"
start_i = text.find(start)
if start_i < 0:
    raise SystemExit('order item row start not found')
end_i = text.find(end, start_i)
if end_i < 0:
    raise SystemExit('order item row end not found')
row = text[start_i:end_i + len("                  </div>")]
if 'Stock Item' not in row or 'Manual Item' not in row:
    replacement = '''                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    <div className="md:col-span-2 flex gap-2">
                      <button type="button" onClick={() => updateOrderItem(index, { mode: 'stock' })} className={`flex-1 px-2.5 py-2.5 rounded-xl text-xs font-black border transition ${item.mode !== 'manual' ? 'bg-blue-600 text-white border-blue-600' : `${t.inputBg} ${t.border} ${t.textMuted}`}`}>Stock Item</button>
                      <button type="button" onClick={() => updateOrderItem(index, { mode: 'manual' })} className={`flex-1 px-2.5 py-2.5 rounded-xl text-xs font-black border transition ${item.mode === 'manual' ? 'bg-amber-500 text-white border-amber-500' : `${t.inputBg} ${t.border} ${t.textMuted}`}`}>Manual Item</button>
                    </div>
                    <div className="md:col-span-4">
                      {item.mode === 'manual' ? (
                        <input type="text" placeholder="Manual item / service name..." value={item.name} onChange={e => updateOrderItem(index, { name: e.target.value })} className={`w-full p-3 ${t.inputBg} border rounded-xl text-sm focus:outline-none focus:border-blue-600`} />
                      ) : (
                        <InventoryAutocomplete value={item.name} placeholder="Search stock item..." inventory={inventory} onChange={value => updateOrderItem(index, { name: value })} onSelect={selected => handleOrderItemSelect(index, selected)} className={`w-full p-3 ${t.inputBg} border rounded-xl text-sm focus:outline-none focus:border-blue-600`} />
                      )}
                    </div>
                    <input type="number" min="0" step="0.01" placeholder="Price" value={item.price} onChange={e => updateOrderItem(index, { price: e.target.value })} className={`md:col-span-2 p-3 ${t.inputBg} border rounded-xl text-sm focus:outline-none`} />
                    <input type="number" min="1" step="1" placeholder="Qty" value={item.qty} onChange={e => updateOrderItem(index, { qty: e.target.value })} className={`md:col-span-1 p-3 ${t.inputBg} border rounded-xl text-sm focus:outline-none`} />
                    <input type="text" placeholder="Item note" value={item.notes || ''} onChange={e => updateOrderItem(index, { notes: e.target.value })} className={`md:col-span-2 p-3 ${t.inputBg} border rounded-xl text-sm focus:outline-none`} />
                    <button type="button" onClick={() => removeOrderItem(index)} className="md:col-span-1 p-3 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 flex items-center justify-center" title="Remove item"><Trash2 size={17}/></button>
                  </div>'''
    text = text[:start_i] + replacement + text[end_i + len("                  </div>"):]

APP.write_text(text, encoding='utf-8')
print('Order manual-item mode patch applied.')
