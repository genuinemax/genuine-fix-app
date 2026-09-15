from pathlib import Path

APP = Path('src/App.jsx')
text = APP.read_text(encoding='utf-8')

# Keep one canonical React handler for Job Sheet deletion.
handler_anchor = "  const handleAddRepair = (e) => {"
handler = '''  const deleteJobSheet = (id) => {
    const job = repairs.find(r => r.id === id);
    if (!job) return;
    if (!window.confirm(`Delete Job Sheet ${job.id}? This action cannot be undone.`)) return;
    setRepairs(prev => prev.filter(r => r.id !== id));
    if (selectedInvoice?.id === id) setSelectedInvoice(null);
  };

'''
if 'const deleteJobSheet = (id) =>' not in text and handler_anchor in text:
    text = text.replace(handler_anchor, handler + handler_anchor, 1)

# Replace only the canonical Job Sheet History Action cell.
map_anchor = "{repairs.filter(r => (r.billType || 'Repair') === 'Repair').map(job => ("
start = text.find(map_anchor)
if start >= 0:
    cell_start = text.find('<td className="p-4 text-right">', start)
    if cell_start >= 0:
        cell_end = text.find('</td>', cell_start)
        if cell_end >= 0:
            replacement = '''<td className="p-4 text-right">
                          <div className="flex flex-wrap justify-end items-center gap-1.5">
                            <button type="button" onClick={() => setSelectedInvoice(job)} className="px-3 py-1.5 bg-blue-600/15 text-blue-400 hover:bg-blue-600/25 rounded-xl font-bold inline-flex items-center gap-1.5">
                              <Eye size={14}/> View
                            </button>
                            <button type="button" onClick={() => window.GenuineFixEditRecord?.('repairs', job.id)} className="px-3 py-1.5 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 rounded-xl font-bold inline-flex items-center gap-1.5">
                              <Pencil size={14}/> Edit
                            </button>
                            <button type="button" onClick={() => printInvoice(job)} className="px-3 py-1.5 bg-violet-500/15 text-violet-400 hover:bg-violet-500/25 rounded-xl font-bold inline-flex items-center gap-1.5">
                              <Printer size={14}/> Print
                            </button>
                            <button type="button" data-gf-native-jobsheet-delete="1" onClick={() => deleteJobSheet(job.id)} className="px-3 py-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl font-bold inline-flex items-center gap-1.5">
                              <Trash2 size={14}/> Delete
                            </button>
                          </div>
                        </td>'''
            text = text[:cell_start] + replacement + text[cell_end + len('</td>'):]

# Prevent the multi-issue helper from forcing a full page reload after React has already saved the new Job Sheet.
ISSUES = Path('src/job-sheet-issues.js')
issues_text = ISSUES.read_text(encoding='utf-8')
issues_text = issues_text.replace("        window.location.reload();\n", "", 1)
ISSUES.write_text(issues_text, encoding='utf-8')

# Accessories Bill discount + invoice deletion.
if "./accessories-discount" not in text:
    text = text.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { calculateAccessoriesBillTotals } from './accessories-discount';", 1)
if "./invoice-actions" not in text:
    text = text.replace("import { calculateAccessoriesBillTotals } from './accessories-discount';", "import { calculateAccessoriesBillTotals } from './accessories-discount';\nimport { deleteInvoiceById } from './invoice-actions';", 1)

old_state = """  const [posBill, setPosBill] = useState({
    customerName: '',
    phone: '',
    items: [{ name: '', price: '', qty: 1, nonStock: false }],
    paidAmount: '',
    warrantyMonths: ''
  });"""
new_state = """  const [posBill, setPosBill] = useState({
    customerName: '',
    phone: '',
    items: [{ name: '', price: '', qty: 1, nonStock: false }],
    paidAmount: '',
    discountType: 'percentage',
    discountValue: '',
    warrantyMonths: ''
  });"""
text = text.replace(old_state, new_state, 1)

start = text.find('  const handleSavePosBill = (e) => {')
end = text.find('  const handleAddPart = (e) => {', start)
if start >= 0 and end > start and 'calculateAccessoriesBillTotals(' not in text[start:end]:
    handler = '''  const handleSavePosBill = (e) => {
    e.preventDefault();
    const subtotal = posBill.items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 1)), 0);
    const { discount, total, paidAmount, dueAmount } = calculateAccessoriesBillTotals(subtotal, posBill.discountType, posBill.discountValue, posBill.paidAmount);
    const itemDescriptions = posBill.items.map(i => `${i.name} (x${i.qty})`).join(', ');
    const requested = {};
    posBill.items.forEach(item => {
      if (item.nonStock) return;
      const key = String(item.name || '').trim().toLowerCase();
      if (key) requested[key] = (requested[key] || 0) + Number(item.qty || 1);
    });
    for (const [key, qty] of Object.entries(requested)) {
      const inv = inventory.find(i => String(i.name || '').trim().toLowerCase() === key);
      if (!inv) { alert(`Stock item not found: ${key}`); return; }
      if (Number(inv.stock || 0) < qty) { alert(`Insufficient stock for ${inv.name}. Available: ${inv.stock}, requested: ${qty}`); return; }
    }
    setInventory(inventory.map(inv => {
      const key = String(inv.name || '').trim().toLowerCase();
      return requested[key] ? { ...inv, stock: Number(inv.stock || 0) - requested[key] } : inv;
    }));
    const newBill = {
      id: `ACC-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: posBill.customerName || 'Walk-in Customer', phone: posBill.phone || 'N/A',
      citizenshipNo: '', customerPhoto: '', citizenshipPhoto: '',
      deviceType: 'Accessories / Sales', model: itemDescriptions || 'Accessories Purchase',
      totalCost: total, subtotal, discountAmount: discount,
      discountType: posBill.discountType || 'percentage', discountValue: Number(posBill.discountValue || 0),
      paidAmount, dueAmount, issue: 'Direct Store Sale / Custom Bill',
      warrantyMonths: posBill.warrantyMonths || '', status: 'Delivered', dateTime: getCurrentDateTime(), billType: 'Accessories',
      items: posBill.items.map(i => ({ name: i.name || 'Accessory Item', price: Number(i.price || 0), qty: Number(i.qty || 1), remarks: 'Store Sale' }))
    };
    setRepairs([newBill, ...repairs]);
    setPosBill({ customerName: '', phone: '', items: [{ name: '', price: '', qty: 1, nonStock: false }], paidAmount: '', discountType: 'percentage', discountValue: '', warrantyMonths: '' });
    alert('Accessories Bill saved successfully!');
  };

'''
    text = text[:start] + handler + text[end:]

if 'const deleteInvoice = (id) =>' not in text:
    delete_invoice = '''  const deleteInvoice = (id) => {
    const invoice = repairs.find(r => r.id === id);
    if (!invoice) return;
    if (!window.confirm(`Delete Invoice ${invoice.id}? This action cannot be undone.`)) return;
    setRepairs(prev => deleteInvoiceById(prev, id));
    if (selectedInvoice?.id === id) setSelectedInvoice(null);
  };

'''
    text = text.replace(handler_anchor, delete_invoice + handler_anchor, 1)

old_preview = """  const posBillSubtotal = posBill.items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 1)), 0);\n"""
if 'const posBillPreview = calculateAccessoriesBillTotals(' not in text:
    text = text.replace(old_preview, old_preview + """  const posBillPreview = calculateAccessoriesBillTotals(posBillSubtotal, posBill.discountType, posBill.discountValue, posBill.paidAmount);\n""", 1)

old_payment = """              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">\n                <input type="number" placeholder="Paid Amount (NPR)" value={posBill.paidAmount} onChange={e => setPosBill({...posBill, paidAmount: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />\n                <input type="text" placeholder="Warranty (e.g. 7 Days Replacement)" value={posBill.warrantyMonths} onChange={e => setPosBill({...posBill, warrantyMonths: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />\n              </div>\n\n              <button type="submit"""
new_payment = """              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">\n                <div className={`p-4 ${t.cardSecondary} border ${t.border} rounded-2xl`}>\n                  <div className="flex items-center justify-between gap-3 mb-3">\n                    <label className={`text-sm font-black ${t.textMain}`}>Discount</label>\n                    <select value={posBill.discountType} onChange={e => setPosBill({...posBill, discountType: e.target.value})} className={`px-3 py-2 ${t.inputBg} border ${t.border} rounded-xl text-sm font-bold focus:outline-none`}>\n                      <option value="percentage">Percentage (%)</option>\n                      <option value="fixed">Fixed (NPR)</option>\n                    </select>\n                  </div>\n                  <input type="number" min="0" max={posBill.discountType === 'percentage' ? 100 : undefined} step="0.01" placeholder={posBill.discountType === 'percentage' ? 'Discount %' : 'Discount Amount (NPR)'} value={posBill.discountValue} onChange={e => setPosBill({...posBill, discountValue: e.target.value})} className={`w-full p-3 ${t.inputBg} border ${t.border} rounded-2xl text-sm focus:outline-none`} />\n                </div>\n                <div className="space-y-3">\n                  <input type="number" min="0" placeholder="Paid Amount (NPR)" value={posBill.paidAmount} onChange={e => setPosBill({...posBill, paidAmount: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />\n                  <input type="text" placeholder="Warranty (e.g. 7 Days Replacement)" value={posBill.warrantyMonths} onChange={e => setPosBill({...posBill, warrantyMonths: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />\n                </div>\n              </div>\n              <div className={`rounded-2xl border ${t.border} ${t.cardSecondary} p-4 space-y-2`}>\n                <div className={`flex justify-between text-sm ${t.textMuted}`}><span>Subtotal</span><span>NPR {posBillPreview.subtotal.toLocaleString()}</span></div>\n                {posBillPreview.discount > 0 && <div className="flex justify-between text-sm text-amber-400"><span>Discount</span><span>- NPR {posBillPreview.discount.toLocaleString()}</span></div>}\n                <div className={`flex justify-between pt-2 border-t ${t.border} text-base font-black ${t.textMain}`}><span>Grand Total</span><span className="text-emerald-400">NPR {posBillPreview.total.toLocaleString()}</span></div>\n                <div className="flex justify-between text-sm text-rose-400 font-bold"><span>Balance Due</span><span>NPR {posBillPreview.dueAmount.toLocaleString()}</span></div>\n              </div>\n              <button type="submit"""
if old_payment in text:
    text = text.replace(old_payment, new_payment, 1)

old_canvas = """    ctx.roundRect(430, totalsY, 320, 130, 8);\n    ctx.fill();\n    ctx.stroke();\n\n    ctx.fillStyle = '#64748B';\n    ctx.font = '13px sans-serif';\n    ctx.fillText('Subtotal:', 460, totalsY + 30);\n    ctx.fillText(`NPR ${inv.totalCost}`, 630, totalsY + 30);\n\n    ctx.fillText('Amount Paid:', 460, totalsY + 65);\n    ctx.fillStyle = '#16A34A';\n    ctx.font = 'bold 13px sans-serif';\n    ctx.fillText(`NPR ${inv.paidAmount}`, 630, totalsY + 65);\n\n    ctx.strokeStyle = '#CBD5E1';\n    ctx.beginPath();\n    ctx.moveTo(450, totalsY + 80);\n    ctx.lineTo(730, totalsY + 80);\n    ctx.stroke();\n\n    ctx.fillStyle = '#0F172A';\n    ctx.font = 'bold 15px sans-serif';\n    ctx.fillText('BALANCE DUE:', 460, totalsY + 110);\n    \n    ctx.fillStyle = Number(inv.dueAmount) > 0 ? '#DC2626' : '#16A34A';\n    ctx.font = 'bold 16px monospace';\n    ctx.fillText(`NPR ${inv.dueAmount}`, 615, totalsY + 110);\n"""
new_canvas = """    const invoiceSubtotal = Number(inv.subtotal ?? inv.totalCost ?? 0);\n    const invoiceDiscount = Number(inv.discountAmount || 0);\n    const hasDiscount = invoiceDiscount > 0;\n    ctx.roundRect(430, totalsY, 320, hasDiscount ? 155 : 130, 8);\n    ctx.fill();\n    ctx.stroke();\n    ctx.fillStyle = '#64748B';\n    ctx.font = '13px sans-serif';\n    ctx.fillText(hasDiscount ? 'Subtotal:' : 'Grand Total:', 460, totalsY + 30);\n    ctx.fillText(`NPR ${hasDiscount ? invoiceSubtotal : Number(inv.totalCost || 0)}`, 630, totalsY + 30);\n    let paymentY = totalsY + 65;\n    if (hasDiscount) {\n      ctx.fillStyle = '#D97706';\n      ctx.font = '13px sans-serif';\n      ctx.fillText(`Discount${inv.discountType === 'percentage' ? ` (${inv.discountValue || 0}%)` : ''}:`, 460, totalsY + 55);\n      ctx.fillText(`- NPR ${invoiceDiscount}`, 630, totalsY + 55);\n      ctx.fillStyle = '#64748B';\n      ctx.fillText('Grand Total:', 460, totalsY + 80);\n      ctx.fillText(`NPR ${Number(inv.totalCost || 0)}`, 630, totalsY + 80);\n      paymentY = totalsY + 105;\n    }\n    ctx.fillStyle = '#64748B';\n    ctx.fillText('Amount Paid:', 460, paymentY);\n    ctx.fillStyle = '#16A34A';\n    ctx.font = 'bold 13px sans-serif';\n    ctx.fillText(`NPR ${inv.paidAmount}`, 630, paymentY);\n    const dividerY = paymentY + 15;\n    ctx.strokeStyle = '#CBD5E1';\n    ctx.beginPath();\n    ctx.moveTo(450, dividerY);\n    ctx.lineTo(730, dividerY);\n    ctx.stroke();\n    ctx.fillStyle = '#0F172A';\n    ctx.font = 'bold 15px sans-serif';\n    ctx.fillText('BALANCE DUE:', 460, dividerY + 30);\n    ctx.fillStyle = Number(inv.dueAmount) > 0 ? '#DC2626' : '#16A34A';\n    ctx.font = 'bold 16px monospace';\n    ctx.fillText(`NPR ${inv.dueAmount}`, 615, dividerY + 30);\n"""
if old_canvas in text:
    text = text.replace(old_canvas, new_canvas, 1)

old_wa = """💰 *Total Cost:* NPR ${inv.totalCost}\n💵 *Amount Paid:* NPR ${inv.paidAmount}"""
new_wa = """💰 *Grand Total:* NPR ${inv.totalCost}\n${Number(inv.discountAmount || 0) > 0 ? `🧾 *Subtotal:* NPR ${inv.subtotal}\n🏷️ *Discount:* - NPR ${inv.discountAmount}\n` : ''}💵 *Amount Paid:* NPR ${inv.paidAmount}"""
if old_wa in text:
    text = text.replace(old_wa, new_wa, 1)

old_view = """                          <button onClick={() => setSelectedInvoice(inv)} className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl font-bold inline-flex items-center gap-1">\n                            <Eye size={14}/> View\n                          </button>"""
new_view = old_view + """\n                          <button onClick={() => deleteInvoice(inv.id)} className="px-3 py-1.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 rounded-xl font-bold inline-flex items-center gap-1">\n                            <Trash2 size={14}/> Delete\n                          </button>"""
if old_view in text and 'onClick={() => deleteInvoice(inv.id)}' not in text:
    text = text.replace(old_view, new_view, 1)

old_modal_total = """              <div className="flex justify-between text-white font-bold text-sm">\n                <span>Total Amount:</span>\n                <span>NPR {selectedInvoice.totalCost}</span>\n              </div>"""
new_modal_total = """              {Number(selectedInvoice.discountAmount || 0) > 0 && (\n                <>\n                  <div className="flex justify-between text-slate-400"><span>Subtotal:</span><span>NPR {Number(selectedInvoice.subtotal || selectedInvoice.totalCost || 0).toLocaleString()}</span></div>\n                  <div className="flex justify-between text-amber-400"><span>Discount{selectedInvoice.discountType === 'percentage' ? ` (${selectedInvoice.discountValue || 0}%)` : ''}:</span><span>- NPR {Number(selectedInvoice.discountAmount || 0).toLocaleString()}</span></div>\n                </>\n              )}\n              <div className="flex justify-between text-white font-bold text-sm">\n                <span>Grand Total:</span>\n                <span>NPR {Number(selectedInvoice.totalCost || 0).toLocaleString()}</span>\n              </div>"""
if old_modal_total in text:
    text = text.replace(old_modal_total, new_modal_total, 1)

old_wa_button = """              <button onClick={() => sendToWhatsApp(selectedInvoice)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition text-sm">\n                <MessageSquare size={16}/> WhatsApp\n              </button>"""
new_wa_button = old_wa_button + """\n              <button onClick={() => deleteInvoice(selectedInvoice.id)} className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-bold rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition text-sm">\n                <Trash2 size={16}/> Delete\n              </button>"""
if old_wa_button in text and 'deleteInvoice(selectedInvoice.id)' not in text:
    text = text.replace(old_wa_button, new_wa_button, 1)

APP.write_text(text, encoding='utf-8')
print('Canonical Job Sheet + Accessories invoice updates applied during prebuild.')
