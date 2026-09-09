from pathlib import Path

path = Path('src/App.jsx')
s = path.read_text(encoding='utf-8')
original = s

# State for editing a stock purchase from history.
state_anchor = "  const [selectedStockPurchase, setSelectedStockPurchase] = useState(null);\n"
state_new = state_anchor + "  const [editingStockPurchaseId, setEditingStockPurchaseId] = useState(null);\n"
if "const [editingStockPurchaseId, setEditingStockPurchaseId] = useState(null);" not in s:
    if state_anchor not in s:
        raise SystemExit('Stock purchase view state not found; refusing to patch.')
    s = s.replace(state_anchor, state_new, 1)

# Add edit/delete handlers before handleAddStockPurchase.
handler_anchor = "  const handleAddStockPurchase = (e) => {\n"
handlers = '''  const startEditStockPurchase = (purchase) => {
    setEditingStockPurchaseId(purchase.id);
    setNewStockPurchase({
      partId: purchase.partId || '',
      partName: purchase.partName || '',
      category: purchase.category || categories[0] || 'Mobile Parts',
      supplierName: purchase.supplierName || '',
      supplierPhone: purchase.supplierPhone || '',
      qty: purchase.qty ?? '',
      unitCost: purchase.unitCost ?? '',
      date: purchase.date || todayKey,
      invoiceNo: purchase.invoiceNo || '',
      notes: purchase.notes || '',
      paymentMethod: purchase.paymentMethod || 'Cash'
    });
    setSelectedStockPurchase(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteStockPurchase = (purchase) => {
    if (!window.confirm(`Delete stock purchase for ${purchase.partName || 'this item'}? This will also remove the recorded purchase expense, but it will not automatically reverse current stock.`)) return;
    setStockPurchases(stockPurchases.filter(p => p.id !== purchase.id));
    setExpenses(expenses.filter(e => e.linkedStockPurchaseId !== purchase.id));
    if (editingStockPurchaseId === purchase.id) {
      setEditingStockPurchaseId(null);
      setNewStockPurchase({ partId: '', partName: '', category: categories[0] || 'Mobile Parts', supplierName: '', supplierPhone: '', qty: '', unitCost: '', date: todayKey, invoiceNo: '', notes: '', paymentMethod: 'Cash' });
    }
  };

'''
if 'const startEditStockPurchase = ' not in s:
    if handler_anchor not in s:
        raise SystemExit('Stock purchase handler anchor not found; refusing to patch.')
    s = s.replace(handler_anchor, handlers + handler_anchor, 1)

# Convert the purchase-save handler into edit-or-create behavior. Editing updates the history row and its linked expense;
# current inventory is intentionally left unchanged so historical editing cannot silently alter physical stock.
old = '''  const handleAddStockPurchase = (e) => {
    e.preventDefault();
    const qty = Number(newStockPurchase.qty || 0), unitCost = Number(newStockPurchase.unitCost || 0);
    if (qty <= 0 || unitCost < 0) { alert('Enter valid quantity and cost.'); return; }
    let part = inventory.find(i => String(i.id) === String(newStockPurchase.partId));
'''
new = '''  const handleAddStockPurchase = (e) => {
    e.preventDefault();
    const qty = Number(newStockPurchase.qty || 0), unitCost = Number(newStockPurchase.unitCost || 0);
    if (qty <= 0 || unitCost < 0) { alert('Enter valid quantity and cost.'); return; }

    if (editingStockPurchaseId) {
      const existing = stockPurchases.find(p => p.id === editingStockPurchaseId);
      if (!existing) { alert('Stock purchase record not found.'); return; }
      const purchaseTotal = qty * unitCost;
      const updatedPurchase = {
        ...existing,
        partId: newStockPurchase.partId || existing.partId,
        partName: newStockPurchase.partName || existing.partName,
        category: newStockPurchase.category || existing.category,
        supplierName: newStockPurchase.supplierName || 'N/A',
        supplierPhone: newStockPurchase.supplierPhone || '',
        qty,
        unitCost,
        total: purchaseTotal,
        date: newStockPurchase.date || existing.date,
        invoiceNo: newStockPurchase.invoiceNo || '',
        notes: newStockPurchase.notes || '',
        paymentMethod: newStockPurchase.paymentMethod || existing.paymentMethod || 'Cash'
      };
      setStockPurchases(stockPurchases.map(p => p.id === editingStockPurchaseId ? updatedPurchase : p));
      setExpenses(expenses.map(exp => exp.linkedStockPurchaseId === editingStockPurchaseId ? {
        ...exp,
        description: `Parts Purchase - ${updatedPurchase.partName}`,
        amount: purchaseTotal,
        paidAmount: purchaseTotal,
        dueAmount: 0,
        quantity: qty,
        unitCost,
        itemName: updatedPurchase.partName,
        supplierName: updatedPurchase.supplierName,
        supplierPhone: updatedPurchase.supplierPhone,
        invoiceNo: updatedPurchase.invoiceNo,
        paymentMethod: updatedPurchase.paymentMethod,
        notes: updatedPurchase.notes,
        date: updatedPurchase.date
      } : exp));
      setEditingStockPurchaseId(null);
      setNewStockPurchase({ partId: '', partName: '', category: categories[0] || 'Mobile Parts', supplierName: '', supplierPhone: '', qty: '', unitCost: '', date: todayKey, invoiceNo: '', notes: '', paymentMethod: 'Cash' });
      alert('Stock purchase history updated. Current stock was not changed.');
      return;
    }

    let part = inventory.find(i => String(i.id) === String(newStockPurchase.partId));
'''
if 'Current stock was not changed.' not in s:
    if old not in s:
        raise SystemExit('Stock purchase save block not found; refusing to patch.')
    s = s.replace(old, new, 1)

# Make the entry form button label clear while editing.
s = s.replace("<button type=\"submit\" className=\"bg-blue-600", "<button type=\"submit\" className=\"bg-blue-600", 1)
s = s.replace("{editingPartId ? 'Update Part Details' : 'Add New Part to Stock'}", "{editingPartId ? 'Update Part Details' : 'Add New Part to Stock'}", 1)

# Add Edit + Delete buttons beside View in the history table.
old_view = '''                          <td className="p-4 text-right">
                            <button type="button" onClick={() => setSelectedStockPurchase(p)} className="px-3 py-1.5 bg-blue-600/15 text-blue-400 hover:bg-blue-600/25 rounded-xl font-bold inline-flex items-center gap-1.5">
                              <Eye size={14}/> View
                            </button>
                          </td>'''
new_view = '''                          <td className="p-4 text-right">
                            <div className="flex justify-end items-center gap-1.5">
                              <button type="button" onClick={() => startEditStockPurchase(p)} className="px-3 py-1.5 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 rounded-xl font-bold inline-flex items-center gap-1.5">
                                <Pencil size={14}/> Edit
                              </button>
                              <button type="button" onClick={() => deleteStockPurchase(p)} className="p-2 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 rounded-xl" title="Delete purchase">
                                <Trash2 size={14}/>
                              </button>
                              <button type="button" onClick={() => setSelectedStockPurchase(p)} className="px-3 py-1.5 bg-blue-600/15 text-blue-400 hover:bg-blue-600/25 rounded-xl font-bold inline-flex items-center gap-1.5">
                                <Eye size={14}/> View
                              </button>
                            </div>
                          </td>'''
if 'startEditStockPurchase(p)' not in s:
    if old_view not in s:
        raise SystemExit('Stock history View action not found; refusing to patch.')
    s = s.replace(old_view, new_view, 1)

path.write_text(s, encoding='utf-8')
print('Stock history Edit/Delete/View actions changed source:', s != original)
