from pathlib import Path

APP = Path('src/App.jsx')
text = APP.read_text(encoding='utf-8')

# Job Sheet totals use the same safe discount rules as the Accessories POS flow.
if "./job-sheet-discount" not in text:
    text = text.replace(
        "import { deleteInvoiceById } from './invoice-actions';",
        "import { deleteInvoiceById } from './invoice-actions';\nimport { calculateJobSheetTotals } from './job-sheet-discount';",
        1,
    )

# Keep the customer device credential separate from any application/login password.
# Existing records are preserved: the UI reads legacy `password` values as a fallback.
old_state = """  const [newRepair, setNewRepair] = useState({
    customerName: '', phone: '', citizenshipNo: '',
    customerPhoto: '', citizenshipPhoto: '',
    deviceType: 'Mobile (Unlock)', model: '', totalCost: '', paidAmount: '', issue: '', warrantyMonths: ''
  });"""
new_state = """  const [newRepair, setNewRepair] = useState({
    customerName: '', phone: '', citizenshipNo: '',
    customerPhoto: '', citizenshipPhoto: '',
    deviceType: 'Mobile (Unlock)', model: '', totalCost: '', discountType: 'percentage', discountValue: '', paidAmount: '', devicePasscode: '', issue: '', warrantyMonths: ''
  });"""
if old_state in text:
    text = text.replace(old_state, new_state, 1)

# If an earlier build injected the wrong `password` field, migrate that UI state name.
text = text.replace("discountValue: '', paidAmount: '', password: '', issue:", "discountValue: '', paidAmount: '', devicePasscode: '', issue:")
text = text.replace("paidAmount: '', password: '', issue:", "paidAmount: '', devicePasscode: '', issue:")

old_handler = """  const handleAddRepair = (e) => {
    e.preventDefault();
    const total = Number(newRepair.totalCost || 0);
    const paid = Number(newRepair.paidAmount || 0);
    const repairItem = {
      ...newRepair,"""
new_handler = """  const handleAddRepair = (e) => {
    e.preventDefault();
    const { subtotal, discount, total, paidAmount, dueAmount } = calculateJobSheetTotals(
      newRepair.totalCost,
      newRepair.discountType,
      newRepair.discountValue,
      newRepair.paidAmount
    );
    const repairItem = {
      ...newRepair,
      devicePasscode: newRepair.devicePasscode || newRepair.password || '',
      subtotal,
      discountAmount: discount,
      discountType: newRepair.discountType || 'percentage',
      discountValue: Number(newRepair.discountValue || 0),
      totalCost: total,
      paidAmount,
      dueAmount,"""
if old_handler in text:
    text = text.replace(old_handler, new_handler, 1)

# Replace the old reset object, including any previously injected password key.
import re
text = re.sub(
    r"setNewRepair\(\{ customerName: '', phone: '', citizenshipNo: '', customerPhoto: '', citizenshipPhoto: '', deviceType: 'Mobile \(Unlock\)', model: '', totalCost: '', (?:discountType: 'percentage', discountValue: '', )?paidAmount: '', (?:password|devicePasscode): '', issue: '', warrantyMonths: '' \}\);",
    "setNewRepair({ customerName: '', phone: '', citizenshipNo: '', customerPhoto: '', citizenshipPhoto: '', deviceType: 'Mobile (Unlock)', model: '', totalCost: '', discountType: 'percentage', discountValue: '', paidAmount: '', devicePasscode: '', issue: '', warrantyMonths: '' });",
    text,
    count=1,
)

# Add/replace the Job Sheet form fields while preserving the existing GUI classes.
old_payment = """              <input type=\"text\" placeholder=\"Device Model (Optional)\" value={newRepair.model} onChange={e => setNewRepair({...newRepair, model: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <input type=\"number\" placeholder=\"Total Cost (NPR)\" value={newRepair.totalCost} onChange={e => setNewRepair({...newRepair, totalCost: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <input type=\"number\" placeholder=\"Paid Amount (NPR)\" value={newRepair.paidAmount} onChange={e => setNewRepair({...newRepair, paidAmount: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <input type=\"text\" placeholder=\"Warranty (e.g. 30 Days, 1 Year)\" value={newRepair.warrantyMonths} onChange={e => setNewRepair({...newRepair, warrantyMonths: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />"""
new_payment = """              <input type=\"text\" placeholder=\"Device Model (Optional)\" value={newRepair.model} onChange={e => setNewRepair({...newRepair, model: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <input type=\"number\" min=\"0\" placeholder=\"Subtotal / Total Cost (NPR)\" value={newRepair.totalCost} onChange={e => setNewRepair({...newRepair, totalCost: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <div className={`md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 ${t.cardSecondary} p-3 rounded-2xl border ${t.border}`}>
                <select value={newRepair.discountType} onChange={e => setNewRepair({...newRepair, discountType: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}>
                  <option value=\"percentage\">Discount (%)</option>
                  <option value=\"fixed\">Discount (NPR)</option>
                </select>
                <input type=\"number\" min=\"0\" max={newRepair.discountType === 'percentage' ? 100 : undefined} step=\"0.01\" placeholder={newRepair.discountType === 'percentage' ? 'Discount %' : 'Discount Amount (NPR)'} value={newRepair.discountValue} onChange={e => setNewRepair({...newRepair, discountValue: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              </div>
              <input type=\"number\" min=\"0\" placeholder=\"Paid Amount (NPR)\" value={newRepair.paidAmount} onChange={e => setNewRepair({...newRepair, paidAmount: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <input type=\"text\" autoComplete=\"off\" placeholder=\"Device Passcode / Pattern (Optional)\" value={newRepair.devicePasscode || newRepair.password || ''} onChange={e => setNewRepair({...newRepair, devicePasscode: e.target.value, password: undefined})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <input type=\"text\" placeholder=\"Warranty (e.g. 30 Days, 1 Year)\" value={newRepair.warrantyMonths} onChange={e => setNewRepair({...newRepair, warrantyMonths: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <div className={`md:col-span-3 flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${t.cardSecondary} border ${t.border} rounded-2xl`}>
                <div className={`text-sm ${t.textMuted}`}>Subtotal: <span className={`font-black ${t.textMain}`}>NPR {Number(newRepair.totalCost || 0).toLocaleString()}</span></div>
                <div className=\"text-sm text-amber-400\">Discount: <span className=\"font-black\">- NPR {calculateJobSheetTotals(newRepair.totalCost, newRepair.discountType, newRepair.discountValue, newRepair.paidAmount).discount.toLocaleString()}</span></div>
                <div className=\"text-sm text-emerald-400\">Grand Total: <span className=\"font-black\">NPR {calculateJobSheetTotals(newRepair.totalCost, newRepair.discountType, newRepair.discountValue, newRepair.paidAmount).total.toLocaleString()}</span></div>
                <div className=\"text-sm text-rose-400\">Due: <span className=\"font-black\">NPR {calculateJobSheetTotals(newRepair.totalCost, newRepair.discountType, newRepair.discountValue, newRepair.paidAmount).dueAmount.toLocaleString()}</span></div>
              </div>"""
if old_payment in text:
    text = text.replace(old_payment, new_payment, 1)

# If the form was already patched by an earlier version, correct only the passcode control.
text = text.replace(
    'type="password" autoComplete="off" placeholder="Device Password / PIN (Optional)" value={newRepair.password} onChange={e => setNewRepair({...newRepair, password: e.target.value})}',
    'type="text" autoComplete="off" placeholder="Device Passcode / Pattern (Optional)" value={newRepair.devicePasscode || newRepair.password || \'\'} onChange={e => setNewRepair({...newRepair, devicePasscode: e.target.value, password: undefined})}'
)

# Show the passcode in the existing on-screen invoice/job preview only. printInvoice does not use this block.
preview_anchor = """                <div><span className=\"text-slate-500\">Warranty:</span> {selectedInvoice.warrantyMonths || '—'}</div>"""
preview_line = """                <div><span className=\"text-slate-500\">Warranty:</span> {selectedInvoice.warrantyMonths || '—'}</div>
                <div><span className=\"text-slate-500\">Device Passcode / Pattern:</span> {selectedInvoice.devicePasscode || selectedInvoice.password || '—'}</div>"""
if preview_anchor in text and 'selectedInvoice.devicePasscode' not in text:
    text = text.replace(preview_anchor, preview_line, 1)

APP.write_text(text, encoding='utf-8')
