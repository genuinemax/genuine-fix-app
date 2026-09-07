const fs = require('fs');
const path = require('path');

const appPath = path.join(process.cwd(), 'src', 'App.jsx');
let s = fs.readFileSync(appPath, 'utf8');
const marker = '// GF FINAL FORM PATCH';
if (s.includes(marker)) {
  console.log('Genuine Fix final form patch already applied.');
  process.exit(0);
}

const must = (ok, msg) => { if (!ok) throw new Error(msg); };

// Allow a general repair category in addition to the common repair types.
const repairOptionNeedle = `                <option value="Tablet Repair">Tablet Repair</option>`;
must(s.includes(repairOptionNeedle), 'Repair category anchor not found.');
s = s.replace(repairOptionNeedle, repairOptionNeedle + `\n                <option value="Other / General Electronics">Other / General Electronics</option>`);

// Device purchase: buy price is required for a BUY record; selling price is required only for SELL.
const buyPriceNeedle = `value={newDevice.buyPrice} onChange={e => setNewDevice({...newDevice, buyPrice: e.target.value})} className={\`p-3 \${t.inputBg} border rounded-2xl text-sm focus:outline-none\`} />`;
const buyPriceNew = `value={newDevice.buyPrice} onChange={e => setNewDevice({...newDevice, buyPrice: e.target.value})} className={\`p-3 \${t.inputBg} border rounded-2xl text-sm focus:outline-none\`} required={newDevice.tradeType === 'buy'} />`;
must(s.includes(buyPriceNeedle), 'Buy price input anchor not found.');
s = s.replace(buyPriceNeedle, buyPriceNew);

const sellPriceNeedle = `value={newDevice.sellPrice} onChange={e => setNewDevice({...newDevice, sellPrice: e.target.value})} className={\`p-3 \${t.inputBg} border rounded-2xl text-sm focus:outline-none\`} required />`;
const sellPriceNew = `value={newDevice.sellPrice} onChange={e => setNewDevice({...newDevice, sellPrice: e.target.value})} className={\`p-3 \${t.inputBg} border rounded-2xl text-sm focus:outline-none\`} required={newDevice.tradeType === 'sell'} />`;
must(s.includes(sellPriceNeedle), 'Sell price input anchor not found.');
s = s.replace(sellPriceNeedle, sellPriceNew);

// Prevent empty/zero expense records.
const expenseHandlerNeedle = `  const handleAddExpense = (e) => {\n    e.preventDefault();\n    setExpenses([...expenses, {`;
const expenseHandlerNew = `  const handleAddExpense = (e) => {\n    e.preventDefault();\n    const expenseAmount = Number(newExpense.amount || 0);\n    if (expenseAmount <= 0) {\n      alert('Please enter a valid expense amount greater than 0.');\n      return;\n    }\n    setExpenses([...expenses, {`;
must(s.includes(expenseHandlerNeedle), 'Expense handler anchor not found.');
s = s.replace(expenseHandlerNeedle, expenseHandlerNew);

s = marker + '\n' + s;
fs.writeFileSync(appPath, s);
console.log('Applied Genuine Fix final form patch.');
