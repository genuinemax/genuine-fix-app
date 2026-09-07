const fs = require('fs');
const path = require('path');

const appPath = path.join(process.cwd(), 'src', 'App.jsx');
let s = fs.readFileSync(appPath, 'utf8');
const marker = '// GF PRO SHOP POLISH PATCH';
if (s.includes(marker)) {
  console.log('Genuine Fix PRO shop polish patch already applied.');
  process.exit(0);
}
const must = (ok, msg) => { if (!ok) throw new Error(msg); };

// 1) Job sheet: technician + expected delivery date + live due amount + safer payment validation.
const repairStateOld = "deviceType: 'Mobile (Unlock)', model: '', totalCost: '', paidAmount: '', issue: '', warrantyMonths: ''";
const repairStateNew = "deviceType: 'Mobile (Unlock)', model: '', totalCost: '', paidAmount: '', issue: '', warrantyMonths: '', technician: '', expectedDate: ''";
must(s.includes(repairStateOld), 'Repair state anchor not found.');
s = s.replace(repairStateOld, repairStateNew);

const repairValidationOld = `  const handleAddRepair = (e) => {\n    e.preventDefault();\n    const total = Number(newRepair.totalCost || 0);\n    const paid = Number(newRepair.paidAmount || 0);\n    const repairItem = {`;
const repairValidationNew = `  const handleAddRepair = (e) => {\n    e.preventDefault();\n    const total = Number(newRepair.totalCost || 0);\n    const paid = Number(newRepair.paidAmount || 0);\n    if (total < 0 || paid < 0 || paid > total) {\n      alert('Please check Total Cost and Paid Amount. Paid amount cannot be greater than total.');\n      return;\n    }\n    const repairItem = {`;
must(s.includes(repairValidationOld), 'Repair handler anchor not found.');
s = s.replace(repairValidationOld, repairValidationNew);

const repairFieldsOld = `      warrantyMonths: newRepair.warrantyMonths || '',\n      status: 'Pending',`;
const repairFieldsNew = `      warrantyMonths: newRepair.warrantyMonths || '',\n      technician: newRepair.technician || '',\n      expectedDate: newRepair.expectedDate || '',\n      status: 'Pending',`;
must(s.includes(repairFieldsOld), 'Repair record fields anchor not found.');
s = s.replace(repairFieldsOld, repairFieldsNew);

const repairResetOld = "setNewRepair({ customerName: '', phone: '', citizenshipNo: '', customerPhoto: '', citizenshipPhoto: '', deviceType: 'Mobile (Unlock)', model: '', totalCost: '', paidAmount: '', issue: '', warrantyMonths: '' });";
const repairResetNew = "setNewRepair({ customerName: '', phone: '', citizenshipNo: '', customerPhoto: '', citizenshipPhoto: '', deviceType: 'Mobile (Unlock)', model: '', totalCost: '', paidAmount: '', issue: '', warrantyMonths: '', technician: '', expectedDate: '' });";
must(s.includes(repairResetOld), 'Repair reset anchor not found.');
s = s.replace(repairResetOld, repairResetNew);

const repairFormOld = `              <input type="text" placeholder="Warranty (e.g. 30 Days, 1 Year)" value={newRepair.warrantyMonths} onChange={e => setNewRepair({...newRepair, warrantyMonths: e.target.value})} className={\`p-3 \${t.inputBg} border rounded-2xl text-sm focus:outline-none\`} />\n              <input type="text" placeholder="Issue / Details (Optional)" value={newRepair.issue} onChange={e => setNewRepair({...newRepair, issue: e.target.value})} className={\`md:col-span-2 p-3 \${t.inputBg} border rounded-2xl text-sm focus:outline-none\`} />`;
const repairFormNew = `              <input type="text" placeholder="Warranty (optional — e.g. 30 Days, 1 Year)" value={newRepair.warrantyMonths} onChange={e => setNewRepair({...newRepair, warrantyMonths: e.target.value})} className={\`p-3 \${t.inputBg} border rounded-2xl text-sm focus:outline-none\`} />\n              <input type="text" placeholder="Assigned Technician (Optional)" value={newRepair.technician} onChange={e => setNewRepair({...newRepair, technician: e.target.value})} className={\`p-3 \${t.inputBg} border rounded-2xl text-sm focus:outline-none\`} />\n              <input type="date" value={newRepair.expectedDate} onChange={e => setNewRepair({...newRepair, expectedDate: e.target.value})} className={\`p-3 \${t.inputBg} border rounded-2xl text-sm focus:outline-none\`} title="Expected Delivery Date" />\n              <input type="text" placeholder="Issue / Details (Optional)" value={newRepair.issue} onChange={e => setNewRepair({...newRepair, issue: e.target.value})} className={\`md:col-span-3 p-3 \${t.inputBg} border rounded-2xl text-sm focus:outline-none\`} />\n              <div className={\`md:col-span-3 flex flex-wrap items-center justify-between gap-3 \${t.cardSecondary} p-4 rounded-2xl border \${t.border}\`}>\n                <span className={\`text-sm font-bold \${t.textMuted}\`}>Due Amount</span>\n                <span className={\`text-xl font-black \${Number(newRepair.totalCost || 0) - Number(newRepair.paidAmount || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'}\`}>NPR {Math.max(0, Number(newRepair.totalCost || 0) - Number(newRepair.paidAmount || 0))}</span>\n              </div>`;
must(s.includes(repairFormOld), 'Repair form anchor not found.');
s = s.replace(repairFormOld, repairFormNew);

// 2) Inventory search and no-results state.
const invoiceState = "  const [invoiceFilterTab, setInvoiceFilterTab] = useState('All');";
must(s.includes(invoiceState), 'Invoice state anchor not found.');
s = s.replace(invoiceState, invoiceState + "\n  const [inventorySearch, setInventorySearch] = useState('');");

const filteredInvoicesNeedle = "  const filteredInvoices = repairs.filter(r => {";
must(s.includes(filteredInvoicesNeedle), 'Invoice filter anchor not found.');
s = s.replace(filteredInvoicesNeedle, `  const filteredInventory = inventory.filter(item => {\n    const q = inventorySearch.trim().toLowerCase();\n    if (!q) return true;\n    return String(item.name || '').toLowerCase().includes(q) || String(item.category || '').toLowerCase().includes(q);\n  });\n\n${filteredInvoicesNeedle}`);

const inventoryHeaderOld = `            <div className="flex items-center justify-between">\n              <h2 className={\`text-xl font-bold \${t.textMain}\`}>Parts & Accessories Inventory</h2>\n            </div>`;
const inventoryHeaderNew = `            <div className="flex flex-wrap items-center justify-between gap-3">\n              <h2 className={\`text-xl font-bold \${t.textMain}\`}>Parts & Accessories Inventory</h2>\n              <div className={\`flex items-center gap-2 \${t.inputBg} border \${t.border} rounded-2xl px-3 py-2.5 w-full md:w-80\`}>\n                <Search size={17} className={t.textMuted} />\n                <input value={inventorySearch} onChange={e => setInventorySearch(e.target.value)} placeholder="Search part or category..." className={\`bg-transparent outline-none w-full text-sm \${t.textMain}\`} />\n                {inventorySearch && <button type="button" onClick={() => setInventorySearch('')} className={t.textMuted}><X size={16}/></button>}\n              </div>\n            </div>`;
must(s.includes(inventoryHeaderOld), 'Inventory header anchor not found.');
s = s.replace(inventoryHeaderOld, inventoryHeaderNew);

must(s.includes('{inventory.map(item => ('), 'Inventory map anchor not found.');
s = s.replace('{inventory.map(item => (', '{filteredInventory.map(item => (');
const inventoryBodyNeedle = `                  ))}\n                </tbody>\n              </table>\n            </div>\n          </div>\n        )}\n\n        {/* EXPENSES TAB */}`;
const inventoryBodyNew = `                  ))}\n                  {filteredInventory.length === 0 && (\n                    <tr><td colSpan="5" className={\`p-8 text-center \${t.textMuted}\`}>No matching stock items found.</td></tr>\n                  )}\n                </tbody>\n              </table>\n            </div>\n          </div>\n        )}\n\n        {/* EXPENSES TAB */}`;
must(s.includes(inventoryBodyNeedle), 'Inventory empty-state anchor not found.');
s = s.replace(inventoryBodyNeedle, inventoryBodyNew);

// 3) Device purchase should count as an expense automatically after the device/time patch runs.
const deviceHandlerExpenseNeedle = `    setDevicesStock([deviceItem, ...devicesStock]);\n\n    if (!isBuy) {`;
const deviceHandlerExpenseNew = `    setDevicesStock([deviceItem, ...devicesStock]);\n\n    if (isBuy && buyPriceVal > 0) {\n      setExpenses([{\n        id: Date.now(),\n        description: \`Device Purchase - \${newDevice.brandModel || 'Unknown Device'}\`,\n        category: 'Device Purchase',\n        amount: buyPriceVal,\n        date: new Date().toISOString().split('T')[0]\n      }, ...expenses]);\n    }\n\n    if (!isBuy) {`;
must(s.includes(deviceHandlerExpenseNeedle), 'Device handler anchor not found.');
s = s.replace(deviceHandlerExpenseNeedle, deviceHandlerExpenseNew);

// 4) Expenses table: show category too.
const expenseHeadOld = `                    <th className="p-4">Description</th>\n                    <th className="p-4">Amount</th>`;
const expenseHeadNew = `                    <th className="p-4">Description</th>\n                    <th className="p-4">Category</th>\n                    <th className="p-4">Amount</th>`;
must(s.includes(expenseHeadOld), 'Expense header anchor not found.');
s = s.replace(expenseHeadOld, expenseHeadNew);
const expenseRowOld = `                      <td className={\`p-4 font-bold \${t.textMain}\`}>{exp.description}</td>\n                      <td className="p-4 font-bold text-rose-400">NPR {exp.amount}</td>`;
const expenseRowNew = `                      <td className={\`p-4 font-bold \${t.textMain}\`}>{exp.description}</td>\n                      <td className={\`p-4 \${t.textMuted}\`}>{exp.category || 'General'}</td>\n                      <td className="p-4 font-bold text-rose-400">NPR {exp.amount}</td>`;
must(s.includes(expenseRowOld), 'Expense row anchor not found.');
s = s.replace(expenseRowOld, expenseRowNew);

// 5) Optional warranty wording + invoice fallback.
s = s.replace('placeholder="Warranty (e.g. 30 Days)"', 'placeholder="Warranty (optional — enter your own)"');
s = s.replace("selectedInvoice.warrantyMonths || '30 Days'", "selectedInvoice.warrantyMonths || '—'");

// 6) Invoice preview shows technician and expected delivery when available.
const invoiceTypeNeedle = `<p className="text-sm text-slate-600"><strong className="text-slate-400">Warranty:</strong> {selectedInvoice.warrantyMonths || '—'}</p>`;
const invoiceTypeNew = `${invoiceTypeNeedle}\n                  {selectedInvoice.technician && <p className="text-sm text-slate-600"><strong className="text-slate-400">Technician:</strong> {selectedInvoice.technician}</p>}\n                  {selectedInvoice.expectedDate && <p className="text-sm text-slate-600"><strong className="text-slate-400">Expected:</strong> {selectedInvoice.expectedDate}</p>}`;
must(s.includes(invoiceTypeNeedle), 'Invoice preview anchor not found.');
s = s.replace(invoiceTypeNeedle, invoiceTypeNew);

s = marker + '\n' + s;
fs.writeFileSync(appPath, s);
console.log('Applied Genuine Fix PRO shop polish patch.');
