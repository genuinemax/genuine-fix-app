from pathlib import Path
import re

APP = Path('src/App.jsx')
text = APP.read_text(encoding='utf-8')

if "./job-sheet-discount" not in text:
    text = text.replace(
        "import { deleteInvoiceById } from './invoice-actions';",
        "import { deleteInvoiceById } from './invoice-actions';\nimport { calculateJobSheetTotals } from './job-sheet-discount';",
        1,
    )

# Normalize the Job Sheet form state regardless of whitespace/formatting added by other build patches.
state_pattern = r"const \[newRepair, setNewRepair\] = useState\(\{.*?\n\s*\}\);"
state_replacement = """const [newRepair, setNewRepair] = useState({
    customerName: '', phone: '', citizenshipNo: '',
    customerPhoto: '', citizenshipPhoto: '',
    deviceType: 'Mobile (Unlock)', model: '', totalCost: '', discountType: 'percentage', discountValue: '', paidAmount: '', devicePasscode: '', issue: '', warrantyMonths: ''
  });"""
text, state_count = re.subn(state_pattern, state_replacement, text, count=1, flags=re.S)
if state_count != 1:
    raise SystemExit('Job Sheet newRepair state block not found')

# Normalize the save handler. This also removes the stale `paid` reference left by an earlier patch.
handler_pattern = r"(const handleAddRepair = \(e\) => \{.*?const repairItem = \{)(.*?)(\n\s*\};\n\s*setRepairs\(\[repairItem, \.\.\.repairs\]\);)"
handler_match = re.search(handler_pattern, text, flags=re.S)
if not handler_match:
    raise SystemExit('Job Sheet handleAddRepair block not found')
handler_body = handler_match.group(2)
handler_body = re.sub(r"\n\s*const total = Number\(newRepair\.totalCost \|\| 0\);\n\s*const paid = Number\(newRepair\.paidAmount \|\| 0\);", "", handler_body)
if 'calculateJobSheetTotals' not in handler_body:
    handler_body = """\n    e.preventDefault();
    const { subtotal, discount, total, paidAmount, dueAmount } = calculateJobSheetTotals(
      newRepair.totalCost,
      newRepair.discountType,
      newRepair.discountValue,
      newRepair.paidAmount
    );""" + handler_body
else:
    handler_body = re.sub(r"\n\s*e\.preventDefault\(\);\n\s*const \{ subtotal, discount, total, paidAmount, dueAmount \} = calculateJobSheetTotals\(.*?\n\s*\);", """\n    e.preventDefault();
    const { subtotal, discount, total, paidAmount, dueAmount } = calculateJobSheetTotals(
      newRepair.totalCost,
      newRepair.discountType,
      newRepair.discountValue,
      newRepair.paidAmount
    );""", handler_body, count=1, flags=re.S)

# Ensure the repair object has the calculated totals and the customer's device credential.
handler_body = re.sub(r"\n\s*\.\.\.newRepair,", "\n      ...newRepair,", handler_body, count=1)
if 'devicePasscode:' not in handler_body:
    handler_body = handler_body.replace("\n      ...newRepair,", "\n      ...newRepair,\n      devicePasscode: newRepair.devicePasscode || newRepair.password || '',", 1)

# Remove duplicate/stale money fields from the old handler, keeping the calculated fields at the top.
handler_body = re.sub(r"\n\s*totalCost: total,\n\s*paidAmount: paid,\n\s*dueAmount: total - paid,", "", handler_body, count=1)
handler_body = re.sub(r"\n\s*id: `GF-\$\{Math\.floor\(1000 \+ Math\.random\(\) \* 9000\)\}`,", "\n      id: `GF-${Math.floor(1000 + Math.random() * 9000)}`,", handler_body, count=1)

text = text[:handler_match.start(2)] + handler_body + text[handler_match.end(2):]

# Normalize the form control to a visible text field that accepts PIN/password/pattern notation.
passcode_control = r"<input type=\"(?:password|text)\"[^>]*placeholder=\"(?:Device Password / PIN|Device Passcode / Pattern) \(Optional\)\"[^>]*/>"
passcode_replacement = '<input type="text" autoComplete="off" placeholder="Device Passcode / Pattern (Optional)" value={newRepair.devicePasscode || newRepair.password || \'\'} onChange={e => setNewRepair({...newRepair, devicePasscode: e.target.value, password: undefined})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />'
text, passcode_count = re.subn(passcode_control, passcode_replacement, text, count=1)
if passcode_count == 0:
    payment_anchor = '              <input type="number" min="0" placeholder="Paid Amount (NPR)" value={newRepair.paidAmount} onChange={e => setNewRepair({...newRepair, paidAmount: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />'
    if payment_anchor in text:
        text = text.replace(payment_anchor, payment_anchor + "\n" + passcode_replacement, 1)
    else:
        raise SystemExit('Job Sheet passcode form anchor not found')

# Reset the form without losing the discount/passcode fields.
text = re.sub(
    r"setNewRepair\(\{[^;]*?deviceType: 'Mobile \(Unlock\)', model: '', totalCost: '',.*?issue: '', warrantyMonths: '' \}\);",
    "setNewRepair({ customerName: '', phone: '', citizenshipNo: '', customerPhoto: '', citizenshipPhoto: '', deviceType: 'Mobile (Unlock)', model: '', totalCost: '', discountType: 'percentage', discountValue: '', paidAmount: '', devicePasscode: '', issue: '', warrantyMonths: '' });",
    text,
    count=1,
    flags=re.S,
)

# On-screen Job Sheet/Invoice preview may show the credential; the printInvoice canvas/print flow is untouched.
preview_anchor = "                <div><span className=\"text-slate-500\">Warranty:</span> {selectedInvoice.warrantyMonths || '—'}</div>"
preview_line = "                <div><span className=\"text-slate-500\">Warranty:</span> {selectedInvoice.warrantyMonths || '—'}</div>\n                <div><span className=\"text-slate-500\">Device Passcode / Pattern:</span> {selectedInvoice.devicePasscode || selectedInvoice.password || '—'}</div>"
if preview_anchor in text and 'selectedInvoice.devicePasscode' not in text:
    text = text.replace(preview_anchor, preview_line, 1)

APP.write_text(text, encoding='utf-8')
