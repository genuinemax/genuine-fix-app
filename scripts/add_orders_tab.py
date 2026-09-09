from pathlib import Path
import re

APP = Path('src/App.jsx')
text = APP.read_text(encoding='utf-8')

if "gf_orders" not in text:
    text = text.replace(
        "  const [stockPurchases, setStockPurchases] = useState(() => {\n    const saved = localStorage.getItem('gf_stock_purchases');\n    return saved ? JSON.parse(saved) : [];\n  });",
        "  const [stockPurchases, setStockPurchases] = useState(() => {\n    const saved = localStorage.getItem('gf_stock_purchases');\n    return saved ? JSON.parse(saved) : [];\n  });\n\n  const [orders, setOrders] = useState(() => {\n    const saved = localStorage.getItem('gf_orders');\n    return saved ? JSON.parse(saved) : [];\n  });"
    )

if "localStorage.setItem('gf_orders'" not in text:
    text = text.replace(
        "  useEffect(() => { localStorage.setItem('gf_stock_purchases', JSON.stringify(stockPurchases)); }, [stockPurchases]);",
        "  useEffect(() => { localStorage.setItem('gf_stock_purchases', JSON.stringify(stockPurchases)); }, [stockPurchases]);\n  useEffect(() => { localStorage.setItem('gf_orders', JSON.stringify(orders)); }, [orders]);"
    )

if "const [orderSearch" not in text:
    text = text.replace(
        "  const [expenseSearch, setExpenseSearch] = useState('');",
        "  const [expenseSearch, setExpenseSearch] = useState('');\n  const [orderSearch, setOrderSearch] = useState('');\n  const [orderStatusFilter, setOrderStatusFilter] = useState('All');\n  const [newOrder, setNewOrder] = useState({ customerName: '', phone: '', items: [{ name: '', price: '', qty: 1, notes: '' }], expectedDate: '', notes: '' });\n  const [editingOrderId, setEditingOrderId] = useState(null);"
    )

if "const handleAddOrder" not in text:
    anchor = "  const handleAddRepair = (e) => {"
    handler = '''  const resetOrderForm = () => {
    setNewOrder({ customerName: '', phone: '', items: [{ name: '', price: '', qty: 1, notes: '' }], expectedDate: '', notes: '' });
    setEditingOrderId(null);
  };

  const updateOrderItem = (index, patch) => {
    setNewOrder(prev => ({ ...prev, items: prev.items.map((item, i) => i === index ? { ...item, ...patch } : item) }));
  };

  const addOrderItem = () => {
    setNewOrder(prev => ({ ...prev, items: [...prev.items, { name: '', price: '', qty: 1, notes: '' }] }));
  };

  const removeOrderItem = (index) => {
    setNewOrder(prev => ({ ...prev, items: prev.items.length <= 1 ? prev.items : prev.items.filter((_, i) => i !== index) }));
  };

  const handleOrderItemSelect = (index, item) => {
    updateOrderItem(index, { name: item.name, price: item.price });
  };

  const handleAddOrder = (e) => {
    e.preventDefault();
    const validItems = newOrder.items
      .map(item => ({ ...item, name: String(item.name || '').trim(), price: Number(item.price || 0), qty: Math.max(1, Number(item.qty || 1)) }))
      .filter(item => item.name);
    if (!newOrder.customerName.trim()) { alert('Please enter customer name.'); return; }
    if (!validItems.length) { alert('Please add at least one order item.'); return; }
    const total = validItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    if (editingOrderId) {
      setOrders(orders.map(order => order.id === editingOrderId ? { ...order, customerName: newOrder.customerName.trim(), phone: newOrder.phone.trim(), items: validItems, expectedDate: newOrder.expectedDate, notes: newOrder.notes, total, updatedAt: getCurrentDateTime() } : order));
      alert('Order updated successfully!');
      resetOrderForm();
      return;
    }
    const order = { id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`, customerName: newOrder.customerName.trim(), phone: newOrder.phone.trim() || 'N/A', items: validItems, total, status: 'Pending', createdAt: getCurrentDateTime(), expectedDate: newOrder.expectedDate || '', notes: newOrder.notes || '' };
    setOrders([order, ...orders]);
    alert(`Order saved successfully! Order #${order.id}`);
    resetOrderForm();
  };

  const editOrder = (order) => {
    setNewOrder({ customerName: order.customerName || '', phone: order.phone || '', items: (order.items || []).map(i => ({ name: i.name || '', price: i.price || '', qty: i.qty || 1, notes: i.notes || '' })), expectedDate: order.expectedDate || '', notes: order.notes || '' });
    setEditingOrderId(order.id);
    setActiveTab('orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateOrderStatus = (id, status) => {
    setOrders(orders.map(order => order.id === id ? { ...order, status, updatedAt: getCurrentDateTime() } : order));
  };

  const deleteOrder = (id) => {
    if (window.confirm('Delete this order record?')) setOrders(orders.filter(order => order.id !== id));
  };

  const filteredOrders = orders
    .slice()
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
    .filter(order => {
      const q = orderSearch.trim().toLowerCase();
      const matchSearch = !q || [order.id, order.customerName, order.phone, order.notes, ...(order.items || []).map(i => i.name)].some(value => String(value || '').toLowerCase().includes(q));
      const matchStatus = orderStatusFilter === 'All' || order.status === orderStatusFilter;
      return matchSearch && matchStatus;
    });

'''
    if anchor not in text:
        raise SystemExit('Order handler anchor not found')
    text = text.replace(anchor, handler + anchor, 1)

# Add orders to backup/restore without disturbing existing data.
text = text.replace(
    "shopInfo, categories, repairs, inventory, devicesStock, expenses, stockPurchases, exportDate",
    "shopInfo, categories, repairs, inventory, devicesStock, expenses, stockPurchases, orders, exportDate"
)
text = text.replace(
    "          if (parsed.stockPurchases) setStockPurchases(parsed.stockPurchases);\n          alert('Shop data restored successfully!');",
    "          if (parsed.stockPurchases) setStockPurchases(parsed.stockPurchases);\n          if (parsed.orders) setOrders(parsed.orders);\n          alert('Shop data restored successfully!');"
)

# Add a dedicated, logically ordered Orders button.
nav_old = "              { id: 'repairs', icon: ShieldCheck, label: 'Job Sheets' },\n              { id: 'devices', icon: Smartphone, label: 'Device Buy/Sell' },"
nav_new = "              { id: 'orders', icon: ClipboardList, label: 'Orders' },\n              { id: 'repairs', icon: ShieldCheck, label: 'Job Sheets' },\n              { id: 'devices', icon: Smartphone, label: 'Device Buy/Sell' },"
if "{ id: 'orders', icon: ClipboardList, label: 'Orders' }" not in text:
    if nav_old not in text:
        raise SystemExit('Navigation anchor not found')
    text = text.replace(nav_old, nav_new, 1)

# Import icon for Orders.
if 'ClipboardList' not in text.split("from 'lucide-react';", 1)[0]:
    text = text.replace('History, Clock3, Filter', 'History, Clock3, Filter, ClipboardList')

# Insert Orders UI before Customer CRM.
if "/* ORDERS / ORDER TAKING TAB */" not in text:
    marker = "        {/* CUSTOMER CRM TAB */}"
    ui = r'''        {/* ORDERS / ORDER TAKING TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <p className={`text-sm uppercase tracking-[0.2em] font-black ${t.textMuted}`}>Order Taking</p>
                <h2 className={`text-2xl font-black ${t.textMain}`}>Customer Orders</h2>
                <p className={`text-sm ${t.textMuted} mt-1`}>Pahila order tipne, status track garne, ani ready bhayepachi billing ma lagne.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <div className={`flex items-center gap-2 ${t.inputBg} border ${t.border} rounded-2xl px-3 py-2.5 w-full sm:w-72`}>
                  <Search size={16} className={t.textMuted} />
                  <input value={orderSearch} onChange={e => setOrderSearch(e.target.value)} placeholder="Search order, customer, phone, item..." className="bg-transparent outline-none text-sm w-full" />
                </div>
                <select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)} className={`p-2.5 ${t.inputBg} border ${t.border} rounded-2xl text-sm font-bold outline-none`}>
                  {['All', 'Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'].map(status => <option key={status}>{status}</option>)}
                </select>
              </div>
            </div>

            <form onSubmit={handleAddOrder} className={`${t.cardBg} border ${t.border} rounded-3xl p-5 sm:p-6 shadow-xl space-y-5`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className={`text-lg font-black ${t.textMain}`}>{editingOrderId ? `Edit Order #${editingOrderId}` : 'New Customer Order'}</h3>
                  <p className={`text-sm ${t.textMuted} mt-1`}>Customer ra item ko details ekai thau bata tipnus.</p>
                </div>
                {editingOrderId && <button type="button" onClick={resetOrderForm} className={`px-3 py-2 rounded-xl border ${t.border} ${t.textMuted} text-sm font-bold`}>Cancel Edit</button>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomerAutocomplete
                  value={newOrder.customerName}
                  placeholder="Customer Full Name"
                  customers={uniqueCustomers}
                  onChange={value => setNewOrder(prev => ({ ...prev, customerName: value }))}
                  onSelect={customer => setNewOrder(prev => ({ ...prev, customerName: customer.name, phone: customer.phone || prev.phone }))}
                  className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none focus:border-blue-600`}
                />
                <input type="text" placeholder="Phone Number" value={newOrder.phone} onChange={e => setNewOrder({...newOrder, phone: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none focus:border-blue-600`} />
                <input type="date" value={newOrder.expectedDate} onChange={e => setNewOrder({...newOrder, expectedDate: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                <input type="text" placeholder="Order Notes / Special Instructions" value={newOrder.notes} onChange={e => setNewOrder({...newOrder, notes: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              </div>

              <div className={`${t.cardSecondary} border ${t.border} rounded-2xl p-4 space-y-3`}>
                <div className="flex items-center justify-between gap-3">
                  <h4 className={`font-black ${t.textMain}`}>Order Items</h4>
                  <button type="button" onClick={addOrderItem} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-black inline-flex items-center gap-1"><Plus size={15}/> Add Item</button>
                </div>
                {newOrder.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    <div className="md:col-span-6">
                      <InventoryAutocomplete
                        value={item.name}
                        placeholder="Search stock item or type item name..."
                        inventory={inventory}
                        onChange={value => updateOrderItem(index, { name: value })}
                        onSelect={selected => handleOrderItemSelect(index, selected)}
                        className={`w-full p-3 ${t.inputBg} border rounded-xl text-sm focus:outline-none focus:border-blue-600`}
                      />
                    </div>
                    <input type="number" min="0" step="0.01" placeholder="Price" value={item.price} onChange={e => updateOrderItem(index, { price: e.target.value })} className={`md:col-span-2 p-3 ${t.inputBg} border rounded-xl text-sm focus:outline-none`} />
                    <input type="number" min="1" step="1" placeholder="Qty" value={item.qty} onChange={e => updateOrderItem(index, { qty: e.target.value })} className={`md:col-span-1 p-3 ${t.inputBg} border rounded-xl text-sm focus:outline-none`} />
                    <input type="text" placeholder="Item note" value={item.notes || ''} onChange={e => updateOrderItem(index, { notes: e.target.value })} className={`md:col-span-2 p-3 ${t.inputBg} border rounded-xl text-sm focus:outline-none`} />
                    <button type="button" onClick={() => removeOrderItem(index)} className="md:col-span-1 p-3 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 flex items-center justify-center" title="Remove item"><Trash2 size={17}/></button>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className={`text-sm ${t.textMuted}`}>Order total: <span className={`text-lg font-black ${t.textMain}`}>NPR {newOrder.items.reduce((sum, item) => sum + Number(item.price || 0) * Math.max(1, Number(item.qty || 1)), 0)}</span></div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl px-5 py-3 shadow-lg shadow-blue-600/30 inline-flex items-center gap-2"><CheckCircle2 size={18}/>{editingOrderId ? 'Update Order' : 'Save Order'}</button>
              </div>
            </form>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>
              <div className={`p-4 border-b ${t.border} ${t.cardSecondary} flex items-center justify-between gap-3`}>
                <div><h3 className={`font-black ${t.textMain}`}>Order History</h3><p className={`text-sm ${t.textMuted} mt-1`}>{filteredOrders.length} order(s) shown</p></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={`${t.tableHeader} font-bold uppercase text-sm border-b`}>
                    <tr><th className="p-4 text-left">Order</th><th className="p-4 text-left">Customer</th><th className="p-4 text-left">Items</th><th className="p-4 text-left">Total</th><th className="p-4 text-left">Expected</th><th className="p-4 text-left">Status</th><th className="p-4 text-right">Action</th></tr>
                  </thead>
                  <tbody className={`divide-y ${t.tableDivide}`}>
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-blue-500/5">
                        <td className="p-4 font-mono font-black text-blue-400">{order.id}<div className={`text-xs ${t.textMuted} mt-1`}>{order.createdAt}</div></td>
                        <td className={`p-4 font-bold ${t.textMain}`}>{order.customerName}<div className={`text-xs ${t.textMuted} mt-1`}>{order.phone}</div></td>
                        <td className={`p-4 ${t.textMuted} min-w-[220px]`}>{(order.items || []).map((item, i) => <div key={i}>{item.name} × {item.qty}</div>)}</td>
                        <td className="p-4 font-black text-emerald-400">NPR {order.total}</td>
                        <td className={`p-4 ${t.textMuted}`}>{order.expectedDate || '—'}</td>
                        <td className="p-4"><select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)} className={`px-2.5 py-2 ${t.inputBg} border ${t.border} rounded-xl text-sm font-bold`}>
                          {['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'].map(status => <option key={status}>{status}</option>)}
                        </select></td>
                        <td className="p-4 text-right whitespace-nowrap"><button onClick={() => editOrder(order)} className="px-3 py-2 rounded-xl bg-blue-500/10 text-blue-400 font-bold mr-2"><Pencil size={15} className="inline mr-1"/>Edit</button><button onClick={() => deleteOrder(order.id)} className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-400 font-bold"><Trash2 size={15} className="inline mr-1"/>Delete</button></td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && <tr><td colSpan="7" className={`p-10 text-center ${t.textMuted}`}>No orders found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

'''
    if marker not in text:
        raise SystemExit('Orders UI marker not found')
    text = text.replace(marker, ui + marker, 1)

APP.write_text(text, encoding='utf-8')
print('Orders tab applied')
