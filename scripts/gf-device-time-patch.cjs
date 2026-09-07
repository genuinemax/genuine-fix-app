const fs = require('fs');
const path = require('path');

const appPath = path.join(process.cwd(), 'src', 'App.jsx');
let s = fs.readFileSync(appPath, 'utf8');
const marker = '// GF DEVICE TRADE + TIME GREETING PATCH';
if (s.includes(marker)) {
  console.log('Genuine Fix device/time patch already applied.');
  process.exit(0);
}

const must = (ok, msg) => { if (!ok) throw new Error(msg); };

const stateNeedle = "  const [posBill, setPosBill] = useState({";
const stateInsert = "  const [deviceTradeTab, setDeviceTradeTab] = useState('buy');\n\n";
must(s.includes(stateNeedle), 'Could not find POS state anchor.');
s = s.replace(stateNeedle, stateInsert + stateNeedle);

const deviceStateNeedle = "  const [newDevice, setNewDevice] = useState({\n    deviceCategory: 'Second-Hand Phone',";
must(s.includes(deviceStateNeedle), 'Could not find newDevice state.');
s = s.replace(deviceStateNeedle, "  const [newDevice, setNewDevice] = useState({\n    tradeType: 'buy',\n    deviceCategory: 'Second-Hand Phone',");

const dateFn = [
  '  const getCurrentDateTime = () => {',
  '    const now = new Date();',
  "    const date = now.toISOString().split('T')[0];",
  "    const time = now.toTimeString().split(' ')[0];",
  '    return `${date} ${time}`;',
  '  };',
].join('\n') + '\n';
must(s.includes(dateFn), 'Could not find date/time helper.');
const greetingFn = dateFn + [
  '  const getTimeGreeting = () => {',
  '    const hour = new Date().getHours();',
  "    if (hour >= 5 && hour < 12) return 'Good morning';",
  "    if (hour >= 12 && hour < 17) return 'Good afternoon';",
  "    if (hour >= 17 && hour < 21) return 'Good evening';",
  "    return 'Good night';",
  '  };',
].join('\n') + '\n';
s = s.replace(dateFn, greetingFn);
s = s.replace('>Good morning, manage the shop faster.</h2>', '>{getTimeGreeting()}, manage the shop faster.</h2>');

const handlerStart = s.indexOf('  const handleAddDevice = (e) => {');
const handlerEnd = s.indexOf('\n  const handleAddPosItem = () =>', handlerStart);
must(handlerStart >= 0 && handlerEnd > handlerStart, 'Could not find handleAddDevice block.');
const newHandler = `  const handleAddDevice = (e) => {
    e.preventDefault();
    const sellPriceVal = Number(newDevice.sellPrice || 0);
    const buyPriceVal = Number(newDevice.buyPrice || 0);
    const isBuy = newDevice.tradeType === 'buy';

    const deviceItem = {
      id: \`DEV-\${Math.floor(1000 + Math.random() * 9000)}\`,
      tradeType: newDevice.tradeType,
      deviceCategory: newDevice.deviceCategory,
      brandModel: newDevice.brandModel || 'Unknown Device',
      imeiOrSerial: newDevice.imeiOrSerial || 'N/A',
      condition: newDevice.condition,
      partyName: newDevice.partyName || (isBuy ? 'Walk-in Seller' : 'Walk-in Customer'),
      partyPhone: newDevice.partyPhone || 'N/A',
      buyPrice: buyPriceVal,
      sellPrice: sellPriceVal,
      status: isBuy ? 'In Stock' : 'Sold',
      warrantyMonths: newDevice.warrantyMonths || '',
      date: new Date().toISOString().split('T')[0]
    };

    setDevicesStock([deviceItem, ...devicesStock]);

    if (!isBuy) {
      const deviceInvoice = {
        id: \`DVB-\${Math.floor(1000 + Math.random() * 9000)}\`,
        customerName: newDevice.partyName || 'Walk-in Customer',
        phone: newDevice.partyPhone || 'N/A',
        citizenshipNo: '',
        customerPhoto: '',
        citizenshipPhoto: '',
        deviceType: newDevice.deviceCategory,
        model: \`${newDevice.brandModel} (IMEI/S: \${newDevice.imeiOrSerial})\`,
        totalCost: sellPriceVal,
        paidAmount: sellPriceVal,
        dueAmount: 0,
        issue: \`${newDevice.deviceCategory} Sale\`,
        warrantyMonths: newDevice.warrantyMonths || '',
        status: 'Delivered',
        dateTime: getCurrentDateTime(),
        billType: 'Device Sale',
        items: [
          {
            name: \`${newDevice.deviceCategory} - \${newDevice.brandModel} [IMEI: \${newDevice.imeiOrSerial}]\`,
            price: sellPriceVal,
            qty: 1,
            remarks: \`Condition: \${newDevice.condition}\`
          }
        ]
      };
      setRepairs([deviceInvoice, ...repairs]);
    }

    setNewDevice({
      tradeType: newDevice.tradeType,
      deviceCategory: 'Second-Hand Phone',
      brandModel: '',
      imeiOrSerial: '',
      condition: 'Good / Fresh',
      partyName: '',
      partyPhone: '',
      buyPrice: '',
      sellPrice: '',
      warrantyMonths: ''
    });
    setDeviceTradeTab(newDevice.tradeType);
    alert(isBuy ? 'Device purchase record saved separately!' : 'Device sale record saved and bill generated!');
  };
`;
s = s.slice(0, handlerStart) + newHandler + s.slice(handlerEnd);

const tabStart = s.indexOf('        {/* DEVICES TAB */}');
const tabEnd = s.indexOf('        {/* ACCESSORIES / POS BILLING TAB */}', tabStart);
must(tabStart >= 0 && tabEnd > tabStart, 'Could not find devices tab.');
const deviceTab = `        {/* DEVICES TAB */}
        {activeTab === 'devices' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className={\`text-xl font-bold \${t.textMain}\`}>📱 Second-Hand & New Phone / Laptop Trading</h2>
              <p className={\`text-sm \${t.textMuted} mt-0.5\`}>Buy/purchase records and sell/sales records are kept separately, with IMEI/serial and party details.</p>
            </div>

            <form onSubmit={handleAddDevice} className={\`\${t.cardBg} border \${t.border} p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4 shadow-xl\`}>
              <select value={newDevice.tradeType} onChange={e => setNewDevice({...newDevice, tradeType: e.target.value})} className={\`p-3 \${t.inputBg} border rounded-2xl text-sm focus:outline-none\`}>
                <option value="buy">BUY / PURCHASE RECORD</option>
                <option value="sell">SELL / SALES RECORD</option>
              </select>
              <select value={newDevice.deviceCategory} onChange={e => setNewDevice({...newDevice, deviceCategory: e.target.value})} className={\`p-3 \${t.inputBg} border rounded-2xl text-sm focus:outline-none\`}>
                <option value="Second-Hand Phone">Second-Hand Phone</option>
                <option value="Second-Hand Laptop">Second-Hand Laptop</option>
                <option value="New Phone">New Phone (Brand New)</option>
                <option value="New Laptop">New Laptop (Brand New)</option>
              </select>

              <input type="text" placeholder="Brand & Model (e.g. iPhone 13 / Dell Inspiron)" value={newDevice.brandModel} onChange={e => setNewDevice({...newDevice, brandModel: e.target.value})} className={\`p-3 \${t.inputBg} border rounded-2xl text-sm focus:outline-none\`} required />
              <input type="text" placeholder="IMEI Number or Serial No." value={newDevice.imeiOrSerial} onChange={e => setNewDevice({...newDevice, imeiOrSerial: e.target.value})} className={\`p-3 \${t.inputBg} border rounded-2xl text-sm focus:outline-none\`} required />
              <input type="text" placeholder="Condition / Specs (e.g. Battery 90%, Scratchless)" value={newDevice.condition} onChange={e => setNewDevice({...newDevice, condition: e.target.value})} className={\`p-3 \${t.inputBg} border rounded-2xl text-sm focus:outline-none\`} />

              <CustomerAutocomplete
                value={newDevice.partyName}
                placeholder={newDevice.tradeType === 'buy' ? 'Seller / Party Name' : 'Buyer / Customer Name'}
                customers={uniqueCustomers}
                onChange={value => setNewDevice(prev => ({ ...prev, partyName: value }))}
                onSelect={customer => handleCustomerSelect(customer, 'device')}
                className={\`w-full p-3 \${t.inputBg} border rounded-2xl text-sm focus:outline-none\`}
              />
              <input type="text" placeholder={newDevice.tradeType === 'buy' ? 'Seller Phone Number' : 'Customer Phone Number'} value={newDevice.partyPhone} onChange={e => setNewDevice({...newDevice, partyPhone: e.target.value})} className={\`p-3 \${t.inputBg} border rounded-2xl text-sm focus:outline-none\`} />

              <input type="number" placeholder={newDevice.tradeType === 'buy' ? 'Purchase / Buy Price (NPR)' : 'Original Cost / Buy Price (NPR)'} value={newDevice.buyPrice} onChange={e => setNewDevice({...newDevice, buyPrice: e.target.value})} className={\`p-3 \${t.inputBg} border rounded-2xl text-sm focus:outline-none\`} />
              <input type="number" placeholder={newDevice.tradeType === 'sell' ? 'Selling Price (NPR)' : 'Expected Selling Price (NPR)'} value={newDevice.sellPrice} onChange={e => setNewDevice({...newDevice, sellPrice: e.target.value})} className={\`p-3 \${t.inputBg} border rounded-2xl text-sm focus:outline-none\`} required />
              <input type="text" placeholder="Warranty (optional — enter your own)" value={newDevice.warrantyMonths} onChange={e => setNewDevice({...newDevice, warrantyMonths: e.target.value})} className={\`p-3 \${t.inputBg} border rounded-2xl text-sm focus:outline-none\`} />

              <button type="submit" className="md:col-span-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-emerald-600/30">{newDevice.tradeType === 'buy' ? 'Save Purchase Record' : 'Save Sale & Generate Bill'}</button>
            </form>

            <div className={\`\${t.cardBg} border \${t.border} rounded-3xl overflow-hidden shadow-xl\`}>
              <div className={\`p-4 border-b \${t.border} flex flex-wrap gap-2 items-center justify-between\`}>
                <div className={\`flex \${t.cardSecondary} p-1 rounded-xl border \${t.border}\`}>
                  <button type="button" onClick={() => setDeviceTradeTab('buy')} className={\`px-4 py-2 rounded-lg text-sm font-black transition \${deviceTradeTab === 'buy' ? 'bg-blue-600 text-white' : t.textMuted}\`}>Bought / Purchased</button>
                  <button type="button" onClick={() => setDeviceTradeTab('sell')} className={\`px-4 py-2 rounded-lg text-sm font-black transition \${deviceTradeTab === 'sell' ? 'bg-emerald-600 text-white' : t.textMuted}\`}>Sold / Sales</button>
                </div>
                <div className={\`text-sm \${t.textMuted}\`}>Bought: {devicesStock.filter(d => (d.tradeType || 'buy') === 'buy').length} • Sold: {devicesStock.filter(d => d.tradeType === 'sell').length}</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className={\`\${t.tableHeader} text-sm uppercase border-b\`}>
                    <tr>
                      <th className="p-4">Device & Category</th>
                      <th className="p-4">IMEI / S.N. & Condition</th>
                      <th className="p-4">{deviceTradeTab === 'buy' ? 'Seller / Party' : 'Buyer / Customer'}</th>
                      <th className="p-4">{deviceTradeTab === 'buy' ? 'Purchase Price' : 'Sale Price'}</th>
                      <th className="p-4">Date / Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={\`divide-y \${t.tableDivide}\`}>
                    {devicesStock.filter(dev => (dev.tradeType || 'buy') === deviceTradeTab).map(dev => (
                      <tr key={dev.id}>
                        <td className="p-4"><p className={\`font-bold \${t.textMain}\`}>{dev.brandModel}</p><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-sm font-bold">{dev.deviceCategory}</span></td>
                        <td className="p-4"><p className="font-mono text-sm text-blue-400">{dev.imeiOrSerial}</p><p className={\`text-sm \${t.textMuted}\`}>{dev.condition}</p></td>
                        <td className="p-4"><p className={\`font-bold \${t.textMain}\`}>{dev.partyName}</p><p className={\`text-sm \${t.textMuted}\`}>{dev.partyPhone}</p></td>
                        <td className="p-4">{deviceTradeTab === 'buy' ? <p className="text-sm font-bold text-rose-400">NPR {dev.buyPrice}</p> : <p className="text-sm font-bold text-emerald-400">NPR {dev.sellPrice}</p>}</td>
                        <td className="p-4"><p className={\`text-sm \${t.textMuted}\`}>{dev.date}</p><span className={\`text-sm font-bold \${dev.status === 'Sold' ? 'text-emerald-400' : 'text-blue-400'}\`}>{dev.status}</span></td>
                        <td className="p-4 text-right"><button onClick={() => deleteDevice(dev.id)} className="p-2 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20"><Trash2 size={14}/></button></td>
                      </tr>
                    ))}
                    {devicesStock.filter(dev => (dev.tradeType || 'buy') === deviceTradeTab).length === 0 && <tr><td colSpan="6" className={\`p-8 text-center \${t.textMuted}\`}>No {deviceTradeTab === 'buy' ? 'purchase' : 'sales'} records yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

`;
s = s.slice(0, tabStart) + marker + '\n' + deviceTab + s.slice(tabEnd);

fs.writeFileSync(appPath, s);
console.log('Applied Genuine Fix device buy/sell separation + time greeting patch.');
