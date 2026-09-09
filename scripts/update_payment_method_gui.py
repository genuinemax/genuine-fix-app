from pathlib import Path

p = Path('src/App.jsx')
s = p.read_text()
original = s

# Compact, theme-matching picker: only render it where a payment choice is actually needed.
if 'function PaymentMethodPicker' not in s:
    marker = '\nexport default function App() {'
    component = r'''

function PaymentMethodPicker({ value, onChange, label = 'Payment Method' }) {
  const methods = [
    { value: 'Cash', label: 'Cash', icon: '💵' },
    { value: 'eSewa', label: 'eSewa', icon: '📱' },
    { value: 'Khalti', label: 'Khalti', icon: '📱' },
    { value: 'Bank Transfer', label: 'Bank', icon: '🏦' },
    { value: 'Card', label: 'Card', icon: '💳' },
    { value: 'Other', label: 'Other', icon: '•••' }
  ];
  return (
    <div className="md:col-span-3 space-y-2">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="flex flex-wrap gap-2">
        {methods.map(method => (
          <button
            key={method.value}
            type="button"
            onClick={() => onChange(method.value)}
            className={`px-3 py-2 rounded-xl border text-xs font-black transition ${value === method.value ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20' : 'bg-transparent border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'}`}
          >
            <span className="mr-1.5">{method.icon}</span>{method.label}
          </button>
        ))}
      </div>
    </div>
  );
}
'''
    if marker not in s:
        raise SystemExit('App marker not found')
    s = s.replace(marker, component + marker, 1)

# Track payment method for supplier-due payments without forcing a payment UI elsewhere.
s = s.replace("const [payForm, setPayForm] = useState({ amount: '', date: getLocalDateKey() });", "const [payForm, setPayForm] = useState({ amount: '', date: getLocalDateKey(), paymentMethod: 'Cash' });", 1)
s = s.replace("const [newStockPurchase, setNewStockPurchase] = useState({ partId: '', partName: '', category: categories[0] || 'Mobile Parts', supplierName: '', supplierPhone: '', qty: '', unitCost: '', date: getLocalDateKey(), invoiceNo: '', notes: '' });", "const [newStockPurchase, setNewStockPurchase] = useState({ partId: '', partName: '', category: categories[0] || 'Mobile Parts', supplierName: '', supplierPhone: '', qty: '', unitCost: '', date: getLocalDateKey(), invoiceNo: '', notes: '', paymentMethod: 'Cash' });", 1)

# Add the picker only to the Expenses payment area.
if '<PaymentMethodPicker value={newExpense.paymentMethod}' not in s:
    marker = '''              {newExpense.paymentStatus === 'Partial' && (
                <input type="number" placeholder="Amount Paid Now (NPR)" value={newExpense.paidNow} onChange={e => setNewExpense({...newExpense, paidNow: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              )}

              <SupplierAutocomplete'''
    replacement = '''              {newExpense.paymentStatus === 'Partial' && (
                <input type="number" placeholder="Amount Paid Now (NPR)" value={newExpense.paidNow} onChange={e => setNewExpense({...newExpense, paidNow: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              )}

              {newExpense.paymentStatus !== 'Unpaid' && (
                <PaymentMethodPicker value={newExpense.paymentMethod} onChange={method => setNewExpense({...newExpense, paymentMethod: method})} />
              )}

              <SupplierAutocomplete'''
    if marker not in s:
        raise SystemExit('Expenses payment area not found')
    s = s.replace(marker, replacement, 1)

# Record the selected method for stock purchases instead of hard-coded Cash.
s = s.replace("paymentMethod: 'Cash', notes: newStockPurchase.notes || '', date: newStockPurchase.date", "paymentMethod: newStockPurchase.paymentMethod || 'Cash', notes: newStockPurchase.notes || '', date: newStockPurchase.date", 1)
s = s.replace("setNewStockPurchase({ partId: '', partName: '', category: categories[0] || 'Mobile Parts', supplierName: '', supplierPhone: '', qty: '', unitCost: '', date: todayKey, invoiceNo: '', notes: '' });", "setNewStockPurchase({ partId: '', partName: '', category: categories[0] || 'Mobile Parts', supplierName: '', supplierPhone: '', qty: '', unitCost: '', date: todayKey, invoiceNo: '', notes: '', paymentMethod: 'Cash' });", 1)

# Supplier due payment modal: method is shown only when paying a due bill.
if '<PaymentMethodPicker value={payForm.paymentMethod}' not in s:
    marker = '''            <div className="space-y-3">
              <input type="number" placeholder="Payment Amount (NPR)" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} autoFocus />
              <input type="date" value={payForm.date} onChange={e => setPayForm({...payForm, date: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
            </div>
            <button onClick={() => addExpensePayment(payingExpense.id, payForm.amount, payForm.date)}'''
    replacement = '''            <div className="space-y-3">
              <input type="number" placeholder="Payment Amount (NPR)" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} autoFocus />
              <input type="date" value={payForm.date} onChange={e => setPayForm({...payForm, date: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <PaymentMethodPicker value={payForm.paymentMethod} onChange={method => setPayForm({...payForm, paymentMethod: method})} />
            </div>
            <button onClick={() => addExpensePayment(payingExpense.id, payForm.amount, payForm.date, payForm.paymentMethod)}'''
    if marker not in s:
        raise SystemExit('Pay Due modal area not found')
    s = s.replace(marker, replacement, 1)

s = s.replace("const addExpensePayment = (id, amount, date) => {", "const addExpensePayment = (id, amount, date, paymentMethod = 'Cash') => {", 1)
s = s.replace("const newPayments = [...(exp.payments || []), { amount: applied, date: date || todayKey }];", "const newPayments = [...(exp.payments || []), { amount: applied, date: date || todayKey, paymentMethod: paymentMethod || 'Cash' }];", 1)
s = s.replace("setPayForm({ amount: '', date: todayKey });", "setPayForm({ amount: '', date: todayKey, paymentMethod: 'Cash' });", 1)

p.write_text(s)
print('payment method GUI patch changed source:', s != original)
