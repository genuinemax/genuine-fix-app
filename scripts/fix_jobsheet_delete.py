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

# Replace only the canonical Job Sheet History Action cell. This is intentionally
# inside App.jsx so the UI has a single React owner and no DOM injector is needed.
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
                            <button type="button" onClick={() => window.GenuineFixEditRecord?.('repairs', job.id)} className="px-3 py-1.5 bg-amber-500/15 text-amber-400 hover:bg-amber-600/25 rounded-xl font-bold inline-flex items-center gap-1.5">
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

# Native React Job Sheet issue presets and issue/discount state.
if 'const GF_JOB_ISSUE_PRESETS = [' not in text:
    app_anchor = 'export default function App() {'
    presets = '''const GF_JOB_ISSUE_PRESETS = [
  'Screen Replacement',
  'Battery Replacement',
  'Charging Port Repair',
  'Keyboard Replacement',
  'SSD / HDD Replacement',
  'Windows / OS Installation',
  'Software / Driver Issue',
  'Overheating / Fan Service',
  'Data Recovery / Backup',
  'Water / Liquid Damage',
  'Motherboard Repair',
  'iCloud / Network Unlock',
  'FRP Unlock',
  'Password / Pattern Unlock',
  'Camera / Speaker / Mic Repair',
  'General Repair / Maintenance'
];

'''
    if app_anchor in text:
        text = text.replace(app_anchor, presets + app_anchor, 1)

old_state = '''  const [newRepair, setNewRepair] = useState({ \n    customerName: '', phone: '', citizenshipNo: '', \n    customerPhoto: '', citizenshipPhoto: '', \n    deviceType: 'Mobile (Unlock)', model: '', totalCost: '', paidAmount: '', issue: '', warrantyMonths: '' \n  });'''
new_state = '''  const [newRepair, setNewRepair] = useState({ \n    customerName: '', phone: '', citizenshipNo: '', \n    customerPhoto: '', citizenshipPhoto: '', \n    deviceType: 'Mobile (Unlock)', model: '', totalCost: '', paidAmount: '', issue: '', warrantyMonths: '',
    issues: [{ type: 'preset', name: '', amount: '' }], discountType: 'amount', discountValue: ''
  });'''
if old_state in text:
    text = text.replace(old_state, new_state, 1)

old_handler = '''  const handleAddRepair = (e) => {
    e.preventDefault();
    const total = Number(newRepair.totalCost || 0);
    const paid = Number(newRepair.paidAmount || 0);
    const repairItem = {
      ...newRepair,
      id: `GF-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: newRepair.customerName || 'Walk-in Customer',
      phone: newRepair.phone || 'N/A',
      model: newRepair.model || 'General Device',
      totalCost: total,
      paidAmount: paid,
      dueAmount: total - paid,
      issue: newRepair.issue || 'General Repair / Unlocking',
      warrantyMonths: newRepair.warrantyMonths || '',
      status: 'Pending',
      dateTime: getCurrentDateTime(),
      billType: 'Repair',
      items: [
        {
          name: newRepair.model ? `${newRepair.deviceType} - ${newRepair.model}` : newRepair.deviceType,
          price: total,
          qty: 1,
          remarks: newRepair.issue || 'Repair & Maintenance'
        }
      ]
    };
    setRepairs([repairItem, ...repairs]);
    setNewRepair({ customerName: '', phone: '', citizenshipNo: '', customerPhoto: '', citizenshipPhoto: '', deviceType: 'Mobile (Unlock)', model: '', totalCost: '', paidAmount: '', issue: '', warrantyMonths: '' });
    alert('Job Sheet saved successfully!');
  };'''
new_handler = '''  const jobSheetIssues = Array.isArray(newRepair.issues) && newRepair.issues.length
    ? newRepair.issues
    : [{ type: 'manual', name: newRepair.issue || '', amount: newRepair.totalCost || '' }];
  const jobSheetSubtotal = jobSheetIssues.reduce((sum, item) => sum + Math.max(0, Number(item.amount || 0)), 0);
  const rawJobSheetDiscount = Math.max(0, Number(newRepair.discountValue || 0));
  const jobSheetDiscountAmount = newRepair.discountType === 'percent'
    ? Math.min(jobSheetSubtotal, (jobSheetSubtotal * rawJobSheetDiscount) / 100)
    : Math.min(jobSheetSubtotal, rawJobSheetDiscount);
  const jobSheetGrandTotal = Math.max(0, jobSheetSubtotal - jobSheetDiscountAmount);
  const jobSheetPaid = Math.min(jobSheetGrandTotal, Math.max(0, Number(newRepair.paidAmount || 0)));
  const jobSheetDue = Math.max(0, jobSheetGrandTotal - jobSheetPaid);

  const updateJobSheetIssue = (index, patch) => {
    setNewRepair(prev => ({
      ...prev,
      issues: (prev.issues || [{ type: 'preset', name: '', amount: '' }]).map((item, i) => i === index ? { ...item, ...patch } : item)
    }));
  };

  const addJobSheetIssue = () => {
    setNewRepair(prev => ({ ...prev, issues: [...(prev.issues || []), { type: 'preset', name: '', amount: '' }] }));
  };

  const removeJobSheetIssue = (index) => {
    setNewRepair(prev => {
      const next = (prev.issues || []).filter((_, i) => i !== index);
      return { ...prev, issues: next.length ? next : [{ type: 'preset', name: '', amount: '' }] };
    });
  };

  const handleAddRepair = (e) => {
    e.preventDefault();
    const validIssues = jobSheetIssues
      .map(item => ({
        name: String(item.name || '').trim(),
        amount: Math.max(0, Number(item.amount || 0))
      }))
      .filter(item => item.name && item.amount > 0);

    if (!validIssues.length) {
      alert('Please add at least one issue and amount.');
      return;
    }

    const subtotal = validIssues.reduce((sum, item) => sum + item.amount, 0);
    const discountValue = Math.max(0, Number(newRepair.discountValue || 0));
    const discountAmount = newRepair.discountType === 'percent'
      ? Math.min(subtotal, (subtotal * Math.min(100, discountValue)) / 100)
      : Math.min(subtotal, discountValue);
    const grandTotal = Math.max(0, subtotal - discountAmount);
    const paid = Math.min(grandTotal, Math.max(0, Number(newRepair.paidAmount || 0)));
    const due = Math.max(0, grandTotal - paid);
    const issueSummary = validIssues.map(item => item.name).join(' + ');
    const repairItem = {
      ...newRepair,
      id: `GF-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: newRepair.customerName || 'Walk-in Customer',
      phone: newRepair.phone || 'N/A',
      model: newRepair.model || 'General Device',
      issues: validIssues.map(item => ({ name: item.name, amount: item.amount })),
      subtotal,
      discountType: newRepair.discountType || 'amount',
      discountValue,
      discountAmount,
      grandTotal,
      totalCost: grandTotal,
      paidAmount: paid,
      dueAmount: due,
      issue: issueSummary || 'General Repair / Unlocking',
      warrantyMonths: newRepair.warrantyMonths || '',
      status: 'Pending',
      dateTime: getCurrentDateTime(),
      billType: 'Repair',
      items: validIssues.map(item => ({
        name: newRepair.model ? `${newRepair.deviceType} - ${newRepair.model}` : newRepair.deviceType,
        price: item.amount,
        qty: 1,
        remarks: item.name
      }))
    };
    setRepairs(prev => [repairItem, ...prev]);
    setNewRepair({ customerName: '', phone: '', citizenshipNo: '', customerPhoto: '', citizenshipPhoto: '', deviceType: 'Mobile (Unlock)', model: '', totalCost: '', paidAmount: '', issue: '', warrantyMonths: '', issues: [{ type: 'preset', name: '', amount: '' }], discountType: 'amount', discountValue: '' });
    alert(`Job Sheet saved successfully! Total: NPR ${grandTotal} | Due: NPR ${due}`);
  };'''
if old_handler in text:
    text = text.replace(old_handler, new_handler, 1)

old_form_fields = '''              <input type="text" placeholder="Device Model (Optional)" value={newRepair.model} onChange={e => setNewRepair({...newRepair, model: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <input type="number" placeholder="Total Cost (NPR)" value={newRepair.totalCost} onChange={e => setNewRepair({...newRepair, totalCost: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <input type="number" placeholder="Paid Amount (NPR)" value={newRepair.paidAmount} onChange={e => setNewRepair({...newRepair, paidAmount: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <input type="text" placeholder="Warranty (e.g. 30 Days, 1 Year)" value={newRepair.warrantyMonths} onChange={e => setNewRepair({...newRepair, warrantyMonths: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <input type="text" placeholder="Issue / Details (Optional)" value={newRepair.issue} onChange={e => setNewRepair({...newRepair, issue: e.target.value})} className={`md:col-span-2 p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />'''
new_form_fields = '''              <input type="text" placeholder="Device Model (Optional)" value={newRepair.model} onChange={e => setNewRepair({...newRepair, model: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />

              <div className={`md:col-span-3 ${t.cardSecondary} border ${t.border} rounded-2xl p-4`}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <label className={`text-sm font-black ${t.textMain}`}>Issue List</label>
                    <p className={`text-xs ${t.textMuted} mt-0.5`}>Add multiple issues and enter a separate NPR amount for each.</p>
                  </div>
                  <button type="button" onClick={addJobSheetIssue} className="px-3 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl text-xs font-black inline-flex items-center gap-1.5"><Plus size={14}/> Add Issue</button>
                </div>
                <div className="space-y-2">
                  {jobSheetIssues.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-2 items-center">
                      {item.type === 'manual' ? (
                        <div className="flex gap-2">
                          <input type="text" placeholder="Enter manual issue / details" value={item.name} onChange={e => updateJobSheetIssue(index, { name: e.target.value })} className={`flex-1 p-3 ${t.inputBg} border rounded-xl text-sm focus:outline-none`} />
                          <button type="button" onClick={() => updateJobSheetIssue(index, { type: 'preset', name: '' })} className="px-3 rounded-xl bg-slate-700/60 text-slate-300 text-xs font-bold">List</button>
                        </div>
                      ) : (
                        <select value={item.name} onChange={e => setNewRepair(prev => ({ ...prev, issues: (prev.issues || []).map((it, i) => i === index ? (e.target.value === '__manual__' ? { ...it, type: 'manual', name: '' } : { ...it, type: 'preset', name: e.target.value }) : it) }))} className={`p-3 ${t.inputBg} border rounded-xl text-sm focus:outline-none`}>
                          <option value="">Select Issue...</option>
                          {GF_JOB_ISSUE_PRESETS.map(issue => <option key={issue} value={issue}>{issue}</option>)}
                          <option value="__manual__">Manual Issue</option>
                        </select>
                      )}
                      <input type="number" min="0" step="1" placeholder="Amount (NPR)" value={item.amount} onChange={e => updateJobSheetIssue(index, { amount: e.target.value })} className={`p-3 ${t.inputBg} border rounded-xl text-sm focus:outline-none`} />
                      <button type="button" onClick={() => removeJobSheetIssue(index)} className="p-3 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl" title="Remove issue"><X size={16}/></button>
                    </div>
                  ))}
                </div>
              </div>'''
if old_form_fields in text:
    text = text.replace(old_form_fields, new_form_fields, 1)

# Make discount entry impossible to miss: two explicit mode buttons and a dedicated % input.
old_discount = '''                  <div>
                    <label className={`text-xs font-black ${t.textMuted}`}>Discount</label>
                    <div className="flex gap-2 mt-1">
                      <select value={newRepair.discountType} onChange={e => setNewRepair({...newRepair, discountType: e.target.value})} className={`w-24 p-3 ${t.inputBg} border rounded-xl text-sm focus:outline-none`}>
                        <option value="amount">NPR</option>
                        <option value="percent">%</option>
                      </select>
                      <input type="number" min="0" step="1" placeholder="Discount" value={newRepair.discountValue} onChange={e => setNewRepair({...newRepair, discountValue: e.target.value})} className={`flex-1 p-3 ${t.inputBg} border rounded-xl text-sm focus:outline-none`} />
                    </div>
                  </div>'''
new_discount = '''                  <div>
                    <label className={`text-xs font-black ${t.textMuted}`}>Discount</label>
                    <div className="grid grid-cols-2 gap-2 mt-1 mb-2">
                      <button type="button" onClick={() => setNewRepair(prev => ({ ...prev, discountType: 'amount' }))} className={`p-2.5 rounded-xl border text-sm font-black transition ${newRepair.discountType === 'amount' ? 'bg-blue-600 text-white border-blue-500' : `${t.inputBg} ${t.border} ${t.textMuted}`}`}>NPR</button>
                      <button type="button" onClick={() => setNewRepair(prev => ({ ...prev, discountType: 'percent', discountValue: Math.min(100, Number(prev.discountValue || 0)) }))} className={`p-2.5 rounded-xl border text-sm font-black transition ${newRepair.discountType === 'percent' ? 'bg-blue-600 text-white border-blue-500' : `${t.inputBg} ${t.border} ${t.textMuted}`}`}>%</button>
                    </div>
                    <input type="number" min="0" max={newRepair.discountType === 'percent' ? 100 : undefined} step="0.01" placeholder={newRepair.discountType === 'percent' ? 'Discount % (0–100)' : 'Discount amount (NPR)'} value={newRepair.discountValue} onChange={e => setNewRepair({...newRepair, discountValue: newRepair.discountType === 'percent' ? Math.min(100, Math.max(0, Number(e.target.value || 0))) : e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-xl text-sm focus:outline-none`} />
                  </div>'''
if old_discount in text:
    text = text.replace(old_discount, new_discount, 1)

# Prevent the multi-issue helper from forcing a full page reload after React has
# already saved the new Job Sheet. The reload was causing the splash/white-screen loop.
ISSUES = Path('src/job-sheet-issues.js')
issues_text = ISSUES.read_text(encoding='utf-8')
issues_text = issues_text.replace("        window.location.reload();\n", "", 1)
ISSUES.write_text(issues_text, encoding='utf-8')

APP.write_text(text, encoding='utf-8')
print('Canonical React Job Sheet actions, issue list, and discount controls applied.')
