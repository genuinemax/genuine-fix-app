from pathlib import Path
import re

p = Path('src/App.jsx')
s = p.read_text()
original = s

# Make the reusable picker follow the active app theme instead of hard-coded dark boxes.
s = s.replace(
"function PaymentMethodPicker({ value, onChange, label = 'Payment Method' }) {",
"function PaymentMethodPicker({ value, onChange, label = 'Payment Method', t }) {",
1,
)
s = s.replace(
"<div className=\"md:col-span-3 space-y-2\">\n      <div className=\"text-xs font-black uppercase tracking-[0.16em] text-slate-400\">{label}</div>",
"<div className=\"md:col-span-3 space-y-2\">\n      <div className={`text-xs font-black uppercase tracking-[0.16em] ${t?.textMuted || 'text-slate-400'}`}>{label}</div>",
1,
)
s = s.replace(
"className={`px-3 py-2 rounded-xl border text-xs font-black transition ${value === method.value ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20' : 'bg-transparent border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'}`}",
"className={`px-3 py-2 rounded-xl border text-xs font-black transition ${value === method.value ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20' : `${t?.cardSecondary || 'bg-transparent'} ${t?.border || 'border-slate-700'} ${t?.textMuted || 'text-slate-400'} hover:text-blue-400 hover:border-blue-500/50`}`}",
1,
)

# Replace any legacy <select> whose value is bound to a paymentMethod field.
def replace_payment_selects(src):
    out = []
    pos = 0
    count = 0
    while True:
        start = src.find('<select', pos)
        if start < 0:
            out.append(src[pos:])
            break
        end = src.find('</select>', start)
        if end < 0:
            out.append(src[pos:])
            break
        end += len('</select>')
        block = src[start:end]
        if 'paymentMethod' in block:
            if 'newExpense.paymentMethod' in block:
                replacement = '<PaymentMethodPicker t={t} value={newExpense.paymentMethod} onChange={method => setNewExpense({...newExpense, paymentMethod: method})} />'
            elif 'newStockPurchase.paymentMethod' in block:
                replacement = '<PaymentMethodPicker t={t} value={newStockPurchase.paymentMethod} onChange={method => setNewStockPurchase({...newStockPurchase, paymentMethod: method})} />'
            elif 'payForm.paymentMethod' in block:
                replacement = '<PaymentMethodPicker t={t} value={payForm.paymentMethod} onChange={method => setPayForm({...payForm, paymentMethod: method})} />'
            else:
                replacement = None
            if replacement:
                out.append(src[pos:start])
                out.append(replacement)
                pos = end
                count += 1
                continue
        out.append(src[pos:end])
        pos = end
    return ''.join(out), count

s, replaced = replace_payment_selects(s)

# Pass the active theme to every picker already in the UI.
s = re.sub(r'<PaymentMethodPicker\s+(?!t=)', '<PaymentMethodPicker t={t} ', s)

# Supplier due payments must actually remember the selected payment method.
s = s.replace(
"const addExpensePayment = (id, amount, date) => {",
"const addExpensePayment = (id, amount, date, paymentMethod = 'Cash') => {",
1,
)
s = s.replace(
"const newPayments = [...(exp.payments || []), { amount: applied, date: date || todayKey }];",
"const newPayments = [...(exp.payments || []), { amount: applied, date: date || todayKey, paymentMethod: paymentMethod || 'Cash' }];",
1,
)

# Reset due-payment method cleanly after recording a payment.
s = s.replace(
"setPayForm({ amount: '', date: todayKey });",
"setPayForm({ amount: '', date: todayKey, paymentMethod: 'Cash' });",
1,
)

if s == original:
    raise SystemExit('Payment GUI patch made no changes')
p.write_text(s)
print(f'Payment GUI patch applied. Legacy selects replaced: {replaced}')
