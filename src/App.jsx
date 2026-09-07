// Genuine Fix PRO Premium GUI — customer CRM, warranty watch, quick actions, responsive polish
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './Login';
import React, { useState, useEffect } from 'react';
import { 
  Wrench, Package, FileText, LayoutDashboard, DollarSign, 
  Trash2, Printer, ShieldCheck, User, CreditCard, Search, Eye, ChevronRight, Download, Upload, ShoppingBag, MessageSquare, Plus, AlertTriangle, ArrowUpRight, ArrowDownRight, X, CheckCircle2, Image as ImageIcon, Pencil, Smartphone, Laptop, Settings, Sun, Moon, Monitor, Users, Bell, PlusCircle, History, Clock3
} from 'lucide-react';


function CustomerAutocomplete({ value, onChange, onSelect, customers, placeholder, className }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || '');

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const suggestions = customers
    .filter(c => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || String(c.phone || '').includes(q);
    })
    .slice(0, 8);

  const handleInput = (e) => {
    const next = e.target.value;
    setQuery(next);
    onChange(next);
    setOpen(true);
  };

  const choose = (customer) => {
    setQuery(customer.name);
    onSelect(customer);
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleInput}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={className}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-40 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
          {suggestions.map((customer, idx) => (
            <button
              key={`${customer.name}-${customer.phone || 'no-phone'}-${idx}`}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(customer)}
              className="w-full px-4 py-3 text-left hover:bg-blue-600/20 transition border-b border-slate-800 last:border-b-0"
            >
              <div className="text-sm font-bold text-white">{customer.name}</div>
              {customer.phone && customer.phone !== 'N/A' && (
                <div className="text-sm text-slate-400 mt-0.5">{customer.phone}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  // ==========================================
  // Keep all useState and useEffect hooks at the top of the component.
  // ==========================================
  const [activeTab, setActiveTab] = useState('invoices');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Shop Settings / Business Rules State (PAN/VAT, Name, etc.)
  const [shopInfo, setShopInfo] = useState(() => {
    const saved = localStorage.getItem('gf_shop_info');
    return saved ? JSON.parse(saved) : {
      name: 'Genuine Fix',
      tagline: 'Laptop & Smartphone Repair Center',
      address: 'Taalchowk, Lekhnath, Pokhara',
      phone: '9765676982',
      panNo: '617749552'
    };
  });

  // Theme / GUI Variety State (Default to 'dim' for eye comfort)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('gf_theme') || 'dim';
  });

  // Theme configuration dictionary
  const themes = {
    dim: {
      appBg: 'bg-[#181B22] text-slate-200',
      navBg: 'bg-[#212631]/90 border-slate-700',
      cardBg: 'bg-[#212631] border-slate-700',
      cardSecondary: 'bg-[#1b1f28] border-slate-700',
      inputBg: 'bg-[#14171f] border-slate-700 text-slate-100 placeholder:text-slate-500',
      tableHeader: 'bg-[#14171f]/80 text-slate-300 border-slate-700',
      tableDivide: 'divide-slate-700/50',
      border: 'border-slate-700',
      textMuted: 'text-slate-400',
      textMain: 'text-slate-100'
    },
    dark: {
      appBg: 'bg-[#0B0F17] text-slate-200',
      navBg: 'bg-[#0F1420]/85 border-slate-800',
      cardBg: 'bg-[#0F1420] border-slate-800',
      cardSecondary: 'bg-slate-900/80 border-slate-800',
      inputBg: 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600',
      tableHeader: 'bg-slate-950/60 text-slate-400 border-slate-800',
      tableDivide: 'divide-slate-800/50',
      border: 'border-slate-800',
      textMuted: 'text-slate-400',
      textMain: 'text-white'
    },
    light: {
      appBg: 'bg-slate-100 text-slate-800',
      navBg: 'bg-white/90 border-slate-200 shadow-sm',
      cardBg: 'bg-white border-slate-200 shadow-sm',
      cardSecondary: 'bg-slate-50 border-slate-200',
      inputBg: 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400',
      tableHeader: 'bg-slate-50 text-slate-600 border-slate-200',
      tableDivide: 'divide-slate-200',
      border: 'border-slate-200',
      textMuted: 'text-slate-500',
      textMain: 'text-slate-900'
    }
  };

  const t = themes[theme] || themes.dim;

  // Dynamic Categories State with LocalStorage
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('gf_categories');
    return saved ? JSON.parse(saved) : [
      'Laptop Parts', 'Mobile Parts', 'Computer/Desktop Parts', 
      'Tablet Parts', 'Unlocking Tools & Credits', 'Accessories'
    ];
  });

  // LocalStorage States with Sample Data pre-loaded
  const [repairs, setRepairs] = useState(() => {
    const saved = localStorage.getItem('gf_repairs');
    return saved ? JSON.parse(saved) : [
      {
        id: 'GF-4821',
        customerName: 'Aakash Gurung',
        phone: '9812345678',
        citizenshipNo: '27-01-74-12345',
        customerPhoto: '',
        citizenshipPhoto: '',
        deviceType: 'Mobile (Unlock)',
        model: 'iPhone 13 Pro',
        totalCost: 5000,
        paidAmount: 2000,
        dueAmount: 3000,
        issue: 'iCloud / Network Unlock',
        warrantyMonths: '',
        status: 'In Progress',
        dateTime: '2026-06-10 11:15:20',
        billType: 'Repair',
        items: [
          { name: 'Mobile (Unlock) - iPhone 13 Pro', price: 5000, qty: 1, remarks: 'iCloud / Network Unlock' }
        ]
      }
    ];
  });

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('gf_inventory');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'iPhone 13 OLED Screen', category: 'Mobile Parts', stock: 3, costPrice: 5000, price: 6500, minStock: 5 },
      { id: 2, name: 'Universal Laptop Battery', category: 'Laptop Parts', stock: 8, costPrice: 2500, price: 3500, minStock: 3 }
    ];
  });

  const [devicesStock, setDevicesStock] = useState(() => {
    const saved = localStorage.getItem('gf_devices_stock');
    return saved ? JSON.parse(saved) : [
      {
        id: 'DEV-1001',
        deviceCategory: 'Second-Hand Phone',
        brandModel: 'iPhone 12 Pro (128GB)',
        imeiOrSerial: '356984102345678',
        condition: 'Good (Battery 88%)',
        partyName: 'Bikash Thapa',
        partyPhone: '9846012345',
        buyPrice: 45000,
        sellPrice: 52000,
        status: 'In Stock',
        date: '2026-06-12'
      }
    ];
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('gf_expenses');
    return saved ? JSON.parse(saved) : [
      { id: 1, description: 'Shop Rent (Taalchowk)', amount: 15000, date: '2026-06-01' }
    ];
  });

  const [stockPurchases, setStockPurchases] = useState(() => {
    const saved = localStorage.getItem('gf_stock_purchases');
    return saved ? JSON.parse(saved) : [];
  });

  // Unique Customers List (Auto-extracted from repairs and device trading for smart customer lookup)
  const uniqueCustomers = Array.from(
    new Map(
      [
        ...repairs
          .filter(r => r.customerName && r.customerName !== 'Walk-in Customer')
          .map(r => ({ name: r.customerName, phone: r.phone })),
        ...devicesStock
          .filter(d => d.partyName && d.partyName !== 'Walk-in Party')
          .map(d => ({ name: d.partyName, phone: d.partyPhone }))
      ]
        .filter(c => c.name)
        .map(c => [c.name.trim().toLowerCase(), { name: c.name.trim(), phone: c.phone || '' }])
    ).values()
  );

  // Form & UI States
  const [newRepair, setNewRepair] = useState({ 
    customerName: '', phone: '', citizenshipNo: '', 
    customerPhoto: '', citizenshipPhoto: '', 
    deviceType: 'Mobile (Unlock)', model: '', totalCost: '', paidAmount: '', issue: '', warrantyMonths: '' 
  });
  
  const [posBill, setPosBill] = useState({
    customerName: '',
    phone: '',
    items: [{ name: '', price: '', qty: 1 }],
    paidAmount: '',
    warrantyMonths: ''
  });

  const [newDevice, setNewDevice] = useState({
    tradeType: 'buy',
    deviceCategory: 'Second-Hand Phone',
    brandModel: '',
    imeiOrSerial: '',
    imeiList: [''],
    condition: 'Good / Fresh',
    partyName: '',
    partyPhone: '',
    buyPrice: '',
    sellPrice: '',
    warrantyMonths: ''
  });
  const [deviceTradeTab, setDeviceTradeTab] = useState('buy');
  const [selectedPurchaseId, setSelectedPurchaseId] = useState('');
  const [editingDeviceId, setEditingDeviceId] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(categories[0] || 'Mobile Parts');
  const [newPart, setNewPart] = useState({ name: '', stock: '', costPrice: '', price: '', minStock: '5', supplierName: '', supplierPhone: '', purchaseDate: new Date().toISOString().split('T')[0] });
  const [editingPartId, setEditingPartId] = useState(null);
  const [newStockPurchase, setNewStockPurchase] = useState({ partId: '', partName: '', category: categories[0] || 'Mobile Parts', supplierName: '', supplierPhone: '', qty: '', unitCost: '', date: new Date().toISOString().split('T')[0], invoiceNo: '', notes: '' });
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'General', itemName: '', quantity: '', unitCost: '', supplierName: '', supplierPhone: '', invoiceNo: '', paymentMethod: 'Cash', notes: '', date: new Date().toISOString().split('T')[0] });
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceFilterTab, setInvoiceFilterTab] = useState('All');

  // useEffects
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => { localStorage.setItem('gf_theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('gf_shop_info', JSON.stringify(shopInfo)); }, [shopInfo]);
  useEffect(() => { localStorage.setItem('gf_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('gf_repairs', JSON.stringify(repairs)); }, [repairs]);
  useEffect(() => { localStorage.setItem('gf_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('gf_devices_stock', JSON.stringify(devicesStock)); }, [devicesStock]);
  useEffect(() => { localStorage.setItem('gf_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('gf_stock_purchases', JSON.stringify(stockPurchases)); }, [stockPurchases]);

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px', fontSize: '18px' }}>Loading...</div>;
  }

  if (!user) {
    return <Login onLoginSuccess={(u) => setUser(u)} />;
  }

  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];
    return `${date} ${time}`;
  };

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewRepair(prev => ({ ...prev, [field]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const totalRevenue = repairs.reduce((acc, curr) => acc + Number(curr.totalCost || 0), 0);
  const totalDue = repairs.reduce((acc, curr) => acc + Number(curr.dueAmount || 0), 0);
  const totalExp = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const totalDevicePurchase = devicesStock.filter(d => (d.tradeType || 'buy') === 'buy').reduce((sum, d) => sum + Number(d.buyPrice || 0), 0);
  const totalDeviceSales = devicesStock.filter(d => d.tradeType === 'sell').reduce((sum, d) => sum + Number(d.sellPrice || 0), 0);
  const totalDeviceProfit = devicesStock.filter(d => d.tradeType === 'sell').reduce((sum, d) => sum + Number(d.profit || 0), 0);
  const totalPartsPurchase = stockPurchases.reduce((sum, p) => sum + Number(p.total || 0), 0);

  // Shop finance automation: sales/income, expenses and estimated net.
  const totalIncome = repairs.reduce((acc, curr) => acc + Number(curr.paidAmount || 0), 0);
  const totalSalesValue = repairs.reduce((acc, curr) => acc + Number(curr.totalCost || 0), 0);
  const netCash = totalIncome - totalExp;
  const todayKey = new Date().toISOString().split('T')[0];
  const todayPartsPurchase = stockPurchases.filter(p => String(p.date || '') === todayKey).reduce((sum, p) => sum + Number(p.total || 0), 0);
  const todayIncome = repairs
    .filter(r => String(r.dateTime || '').startsWith(todayKey))
    .reduce((acc, curr) => acc + Number(curr.paidAmount || 0), 0);
  const todayExpense = expenses
    .filter(e => String(e.date || '') === todayKey)
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const todayNet = todayIncome - todayExpense;

  const exportData = () => {
    const backupData = {
      shopInfo,
      categories,
      repairs,
      inventory,
      devicesStock,
      expenses,
      stockPurchases,
      exportDate: getCurrentDateTime()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GenuineFix_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.repairs && parsed.inventory && parsed.expenses && parsed.categories) {
          if (parsed.shopInfo) setShopInfo(parsed.shopInfo);
          setCategories(parsed.categories);
          setRepairs(parsed.repairs);
          setInventory(parsed.inventory);
          if (parsed.devicesStock) setDevicesStock(parsed.devicesStock);
          setExpenses(parsed.expenses);
          if (parsed.stockPurchases) setStockPurchases(parsed.stockPurchases);
          alert('Shop data restored successfully!');
        } else {
          alert('Invalid backup file format!');
        }
      } catch (err) {
        alert('Failed to read the backup file!');
      }
    };
    reader.readAsText(file);
  };

  const handleCustomerSelect = (customerOrName, formType) => {
    const selected = typeof customerOrName === 'string'
      ? uniqueCustomers.find(c => c.name.toLowerCase() === customerOrName.trim().toLowerCase())
      : customerOrName;
    const name = typeof customerOrName === 'string' ? customerOrName : customerOrName.name;
    const phoneVal = selected?.phone || '';

    if (formType === 'repair') {
      setNewRepair(prev => ({ ...prev, customerName: name, phone: phoneVal || prev.phone }));
    } else if (formType === 'device') {
      setNewDevice(prev => ({ ...prev, partyName: name, partyPhone: phoneVal || prev.partyPhone }));
    } else if (formType === 'pos') {
      setPosBill(prev => ({ ...prev, customerName: name, phone: phoneVal || prev.phone }));
    }
  };

  const handleAddRepair = (e) => {
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
  };

  const getDeviceImeis = (device) => {
    if (Array.isArray(device?.imeis) && device.imeis.length) return device.imeis.filter(Boolean);
    if (Array.isArray(device?.imeiList) && device.imeiList.length) return device.imeiList.filter(Boolean);
    return [device?.imeiOrSerial || 'N/A'];
  };

  const normalizeImeis = (list, fallback = '') => {
    const cleaned = (Array.isArray(list) ? list : []).map(v => String(v || '').trim()).filter(Boolean);
    return cleaned.length ? cleaned : [String(fallback || '').trim() || 'N/A'];
  };

  const addDeviceImeiField = () => {
    setNewDevice(prev => ({ ...prev, imeiList: [...(prev.imeiList?.length ? prev.imeiList : [prev.imeiOrSerial || '']), ''] }));
  };

  const removeDeviceImeiField = (index) => {
    setNewDevice(prev => {
      const list = [...(prev.imeiList?.length ? prev.imeiList : [prev.imeiOrSerial || ''])];
      if (list.length <= 1) return prev;
      list.splice(index, 1);
      return { ...prev, imeiList: list, imeiOrSerial: list[0] || '' };
    });
  };

  const updateDeviceImeiField = (index, value) => {
    setNewDevice(prev => {
      const list = [...(prev.imeiList?.length ? prev.imeiList : [''])];
      list[index] = value;
      return { ...prev, imeiList: list, imeiOrSerial: list[0] || '' };
    });
  };

  const resetDeviceForm = (tradeType = 'buy') => {
    setNewDevice({ tradeType, deviceCategory: 'Second-Hand Phone', brandModel: '', imeiOrSerial: '', imeiList: [''], condition: 'Good / Fresh', partyName: '', partyPhone: '', buyPrice: '', sellPrice: '', warrantyMonths: '' });
    setSelectedPurchaseId('');
    setEditingDeviceId(null);
  };

  const handleAddDevice = (e) => {
    e.preventDefault();
    const isBuy = newDevice.tradeType !== 'sell';
    const today = new Date().toISOString().split('T')[0];

    if (editingDeviceId) {
      const current = devicesStock.find(d => d.id === editingDeviceId);
      if (!current) return;

      if (isBuy) {
        const imeis = normalizeImeis(newDevice.imeiList, newDevice.imeiOrSerial);
        const updated = {
          ...current,
          deviceCategory: newDevice.deviceCategory,
          brandModel: newDevice.brandModel || current.brandModel,
          imeiOrSerial: imeis[0],
          imeis,
          imeiList: imeis,
          condition: newDevice.condition,
          partyName: newDevice.partyName || current.partyName,
          partyPhone: newDevice.partyPhone || current.partyPhone,
          buyPrice: Number(newDevice.buyPrice || 0),
          sellPrice: Number(newDevice.sellPrice || 0),
          warrantyMonths: newDevice.warrantyMonths || ''
        };
        setDevicesStock(devicesStock.map(d => d.id === editingDeviceId ? updated : d));
        resetDeviceForm('buy');
        alert('Purchase record updated successfully!');
        return;
      }

      const salePriceVal = Number(newDevice.sellPrice || 0);
      const purchasePriceVal = Number(current.buyPrice || 0);
      const updatedSale = { ...current, partyName: newDevice.partyName || current.partyName, partyPhone: newDevice.partyPhone || current.partyPhone, sellPrice: salePriceVal, profit: salePriceVal - purchasePriceVal, warrantyMonths: newDevice.warrantyMonths || current.warrantyMonths || '' };
      setDevicesStock(devicesStock.map(d => d.id === editingDeviceId ? updatedSale : d));
      setRepairs(repairs.map(r => r.linkedPurchaseId === updatedSale.linkedPurchaseId && r.billType === 'Device Sale'
        ? { ...r, customerName: updatedSale.partyName, phone: updatedSale.partyPhone, totalCost: salePriceVal, paidAmount: salePriceVal, dueAmount: 0, warrantyMonths: updatedSale.warrantyMonths,
            model: `${updatedSale.brandModel} (IMEI/S: ${updatedSale.imeiOrSerial})`,
            items: [{ name: `${updatedSale.deviceCategory} - ${updatedSale.brandModel} [IMEI: ${updatedSale.imeiOrSerial}]`, price: salePriceVal, qty: 1, remarks: `Condition: ${updatedSale.condition}; Purchase: NPR ${purchasePriceVal}; Profit: NPR ${updatedSale.profit}` }] }
        : r));
      resetDeviceForm('sell');
      alert('Sales record updated successfully!');
      return;
    }

    if (isBuy) {
      const buyPriceVal = Number(newDevice.buyPrice || 0);
      const sellPriceVal = Number(newDevice.sellPrice || 0);
      if (buyPriceVal <= 0) {
        alert('Please enter a valid purchase price per unit.');
        return;
      }

      const imeis = normalizeImeis(newDevice.imeiList, newDevice.imeiOrSerial);
      const duplicateImeis = imeis.filter((imei, idx) => imeis.indexOf(imei) !== idx);
      if (duplicateImeis.length) {
        alert('Duplicate IMEI/Serial found in this entry. Please use a unique IMEI for each phone.');
        return;
      }
      const existingImeis = new Set(devicesStock.flatMap(d => getDeviceImeis(d).map(x => String(x))));
      const alreadyUsed = imeis.filter(imei => existingImeis.has(String(imei)));
      if (alreadyUsed.length) {
        alert(`These IMEI/Serial numbers already exist: ${alreadyUsed.join(', ')}`);
        return;
      }

      const batchId = `BATCH-${Date.now()}`;
      const deviceItems = imeis.map((imei, index) => ({
        id: `DEV-${Date.now()}-${index + 1}`,
        tradeType: 'buy',
        deviceCategory: newDevice.deviceCategory,
        brandModel: newDevice.brandModel || 'Unknown Device',
        imeiOrSerial: imei,
        imeis: [imei],
        imeiList: [imei],
        condition: newDevice.condition,
        partyName: newDevice.partyName || 'Walk-in Seller',
        partyPhone: newDevice.partyPhone || 'N/A',
        buyPrice: buyPriceVal,
        sellPrice: sellPriceVal,
        status: 'In Stock',
        purchaseDate: today,
        date: today,
        warrantyMonths: newDevice.warrantyMonths || '',
        quantityGroup: imeis.length,
        batchId
      }));

      setDevicesStock([...deviceItems.reverse(), ...devicesStock]);

      const totalPurchaseCost = buyPriceVal * deviceItems.length;
      setExpenses([{
        id: `EXP-DEV-${Date.now()}`,
        description: `Device Purchase - ${newDevice.brandModel || 'Unknown Device'} (${deviceItems.length} unit${deviceItems.length > 1 ? 's' : ''})`,
        category: 'Device Purchase',
        amount: totalPurchaseCost,
        quantity: deviceItems.length,
        unitCost: buyPriceVal,
        itemName: newDevice.brandModel || 'Unknown Device',
        supplierName: newDevice.partyName || 'Walk-in Seller',
        supplierPhone: newDevice.partyPhone || 'N/A',
        invoiceNo: '',
        paymentMethod: 'Cash',
        notes: `IMEI/SN: ${imeis.join(', ')}`,
        date: today,
        linkedDeviceIds: deviceItems.map(d => d.id)
      }, ...expenses]);

      resetDeviceForm('buy');
      setDeviceTradeTab('buy');
      alert(`${deviceItems.length} purchase record${deviceItems.length > 1 ? 's' : ''} saved. Total purchase: NPR ${totalPurchaseCost}`);
      return;
    }

    if (!selectedPurchaseId) {
      alert('Please select a purchased device to sell.');
      return;
    }
    const purchase = devicesStock.find(d => d.id === selectedPurchaseId);
    if (!purchase || (purchase.tradeType || 'buy') !== 'buy') {
      alert('Selected purchase record was not found.');
      return;
    }
    if (purchase.status === 'Sold') {
      alert('This device has already been sold.');
      return;
    }

    const salePriceVal = Number(newDevice.sellPrice || purchase.sellPrice || 0);
    const purchasePriceVal = Number(purchase.buyPrice || 0);
    if (salePriceVal <= 0) {
      alert('Please enter a valid selling price.');
      return;
    }

    const saleId = `SALE-${Math.floor(1000 + Math.random() * 9000)}`;
    const imeis = getDeviceImeis(purchase);
    const soldRecord = {
      id: saleId, tradeType: 'sell', linkedPurchaseId: purchase.id,
      purchaseDate: purchase.purchaseDate || purchase.date || '', saleDate: today,
      deviceCategory: purchase.deviceCategory, brandModel: purchase.brandModel,
      imeiOrSerial: purchase.imeiOrSerial, imeis, imeiList: imeis,
      condition: purchase.condition,
      partyName: newDevice.partyName || 'Walk-in Customer', partyPhone: newDevice.partyPhone || 'N/A',
      sellerName: purchase.partyName || 'Walk-in Seller', sellerPhone: purchase.partyPhone || 'N/A',
      buyPrice: purchasePriceVal, sellPrice: salePriceVal, profit: salePriceVal - purchasePriceVal,
      status: 'Sold', warrantyMonths: newDevice.warrantyMonths || purchase.warrantyMonths || '', date: today
    };

    const updatedStock = devicesStock.map(d => d.id === purchase.id ? { ...d, status: 'Sold', soldDate: today, soldRecordId: saleId } : d);
    setDevicesStock([soldRecord, ...updatedStock]);

    const deviceInvoice = {
      id: `DVB-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: soldRecord.partyName, phone: soldRecord.partyPhone, citizenshipNo: '',
      customerPhoto: '', citizenshipPhoto: '', deviceType: soldRecord.deviceCategory,
      model: `${soldRecord.brandModel} (IMEI/S: ${soldRecord.imeiOrSerial})`,
      totalCost: salePriceVal, paidAmount: salePriceVal, dueAmount: 0,
      issue: `${soldRecord.deviceCategory} Sale`, warrantyMonths: soldRecord.warrantyMonths,
      status: 'Delivered', dateTime: getCurrentDateTime(), billType: 'Device Sale',
      linkedPurchaseId: purchase.id, purchasePrice: purchasePriceVal, profit: soldRecord.profit,
      items: [{ name: `${soldRecord.deviceCategory} - ${soldRecord.brandModel} [IMEI: ${soldRecord.imeiOrSerial}]`,
        price: salePriceVal, qty: 1,
        remarks: `Condition: ${soldRecord.condition}; Purchase: NPR ${purchasePriceVal}; Profit: NPR ${soldRecord.profit}` }]
    };
    setRepairs([deviceInvoice, ...repairs]);
    resetDeviceForm('sell');
    setDeviceTradeTab('sell');
    alert(`Sale saved. Purchase: NPR ${purchasePriceVal} | Sale: NPR ${salePriceVal} | Profit: NPR ${soldRecord.profit}`);
  };

  const handleAddPosItem = () => {
    setPosBill({
      ...posBill,
      items: [...posBill.items, { name: '', price: '', qty: 1 }]
    });
  };

  const handlePosItemChange = (index, field, value) => {
    const updatedItems = [...posBill.items];
    updatedItems[index][field] = value;
    
    if (field === 'name') {
      const found = inventory.find(i => i.name.toLowerCase() === value.toLowerCase());
      if (found) {
        updatedItems[index].price = found.price;
      }
    }
    setPosBill({ ...posBill, items: updatedItems });
  };

  const handleRemovePosItem = (index) => {
    const updatedItems = posBill.items.filter((_, i) => i !== index);
    setPosBill({ ...posBill, items: updatedItems });
  };

  const handleSavePosBill = (e) => {
    e.preventDefault();
    const totalCost = posBill.items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 1)), 0);
    const paidAmount = Number(posBill.paidAmount || totalCost);
    const dueAmount = totalCost - paidAmount;
    const itemDescriptions = posBill.items.map(i => `${i.name} (x${i.qty})`).join(', ');

    const updatedInventory = inventory.map(inv => {
      const soldItem = posBill.items.find(i => i.name.toLowerCase() === inv.name.toLowerCase());
      if (soldItem) {
        return { ...inv, stock: Math.max(0, inv.stock - Number(soldItem.qty || 1)) };
      }
      return inv;
    });
    setInventory(updatedInventory);

    const newBill = {
      id: `ACC-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: posBill.customerName || 'Walk-in Customer',
      phone: posBill.phone || 'N/A',
      citizenshipNo: '',
      customerPhoto: '',
      citizenshipPhoto: '',
      deviceType: 'Accessories / Sales',
      model: itemDescriptions || 'Accessories Purchase',
      totalCost,
      paidAmount,
      dueAmount,
      issue: 'Direct Store Sale / Custom Bill',
      warrantyMonths: posBill.warrantyMonths || '',
      status: 'Delivered',
      dateTime: getCurrentDateTime(),
      billType: 'Accessories',
      items: posBill.items.map(i => ({
        name: i.name || 'Accessory Item',
        price: Number(i.price || 0),
        qty: Number(i.qty || 1),
        remarks: 'Store Sale'
      }))
    };

    setRepairs([newBill, ...repairs]);
    setPosBill({ customerName: '', phone: '', items: [{ name: '', price: '', qty: 1 }], paidAmount: '', warrantyMonths: '' });
    alert('Accessories Bill saved successfully!');
  };

  const handleAddPart = (e) => {
    e.preventDefault();
    const qty = Number(newPart.stock || 0), cost = Number(newPart.costPrice || 0);
    if (editingPartId) {
      setInventory(inventory.map(item => item.id === editingPartId ? { ...item, category: selectedCategory, name: newPart.name || item.name, stock: qty, costPrice: cost, price: Number(newPart.price || 0), minStock: Number(newPart.minStock || 5), supplierName: newPart.supplierName || '', supplierPhone: newPart.supplierPhone || '', lastPurchaseDate: newPart.purchaseDate || todayKey } : item));
      setEditingPartId(null);
      setNewPart({ name: '', stock: '', costPrice: '', price: '', minStock: '5', supplierName: '', supplierPhone: '', purchaseDate: todayKey });
      alert('Stock item updated successfully!'); return;
    }
    const id = Date.now();
    const itemName = newPart.name || 'Unnamed Part';
    setInventory([...inventory, { id, category: selectedCategory, name: itemName, stock: qty, costPrice: cost, price: Number(newPart.price || 0), minStock: Number(newPart.minStock || 5), supplierName: newPart.supplierName || '', supplierPhone: newPart.supplierPhone || '', lastPurchaseDate: newPart.purchaseDate || todayKey }]);
    if (qty > 0 && cost > 0) setStockPurchases([{ id: `SP-${Date.now()}`, partId: id, partName: itemName, supplierName: newPart.supplierName || 'N/A', supplierPhone: newPart.supplierPhone || '', qty, unitCost: cost, total: qty * cost, date: newPart.purchaseDate || todayKey, invoiceNo: '', notes: 'Initial stock entry' }, ...stockPurchases]);
    setNewPart({ name: '', stock: '', costPrice: '', price: '', minStock: '5', supplierName: '', supplierPhone: '', purchaseDate: todayKey });
  };

  const handleAddStockPurchase = (e) => {
    e.preventDefault();
    const qty = Number(newStockPurchase.qty || 0), unitCost = Number(newStockPurchase.unitCost || 0);
    if (qty <= 0 || unitCost < 0) { alert('Enter valid quantity and cost.'); return; }
    let part = inventory.find(i => String(i.id) === String(newStockPurchase.partId));
    let partId = part?.id;
    if (!part) {
      if (!newStockPurchase.partName.trim()) { alert('Select a part or enter a new part name.'); return; }
      partId = Date.now();
      part = { id: partId, name: newStockPurchase.partName.trim(), category: newStockPurchase.category, stock: 0, costPrice: unitCost, price: unitCost, minStock: 5, supplierName: '', supplierPhone: '' };
    }
    const oldStock = Number(part.stock || 0), oldCost = Number(part.costPrice || 0), newStock = oldStock + qty;
    const weightedCost = newStock ? ((oldStock * oldCost) + (qty * unitCost)) / newStock : unitCost;
    const updatedPart = { ...part, stock: newStock, costPrice: Math.round(weightedCost * 100) / 100, supplierName: newStockPurchase.supplierName || part.supplierName || '', supplierPhone: newStockPurchase.supplierPhone || part.supplierPhone || '', lastPurchaseDate: newStockPurchase.date };
    const purchaseId = `SP-${Date.now()}`;
    const purchaseTotal = qty * unitCost;
    setInventory(inventory.some(i => i.id === partId) ? inventory.map(i => i.id === partId ? updatedPart : i) : [updatedPart, ...inventory]);
    setStockPurchases([{ id: purchaseId, partId, partName: updatedPart.name, supplierName: newStockPurchase.supplierName || 'N/A', supplierPhone: newStockPurchase.supplierPhone || '', qty, unitCost, total: purchaseTotal, date: newStockPurchase.date, invoiceNo: newStockPurchase.invoiceNo, notes: newStockPurchase.notes }, ...stockPurchases]);
    setExpenses([{ id: `EXP-${purchaseId}`, description: `Parts Purchase - ${updatedPart.name}`, category: 'Parts Purchase', amount: purchaseTotal, quantity: qty, unitCost, itemName: updatedPart.name, supplierName: newStockPurchase.supplierName || 'N/A', supplierPhone: newStockPurchase.supplierPhone || '', invoiceNo: newStockPurchase.invoiceNo || '', paymentMethod: 'Cash', notes: newStockPurchase.notes || '', date: newStockPurchase.date, linkedStockPurchaseId: purchaseId }, ...expenses]);
    setNewStockPurchase({ partId: '', partName: '', category: categories[0] || 'Mobile Parts', supplierName: '', supplierPhone: '', qty: '', unitCost: '', date: todayKey, invoiceNo: '', notes: '' });
    alert(`Stock purchase saved. Total: NPR ${qty * unitCost}`);
  };

  const adjustStock = (id, amount) => setInventory(inventory.map(item => item.id === id ? { ...item, stock: Math.max(0, Number(item.stock) + amount) } : item));

  const handleAddExpense = (e) => {
    e.preventDefault();
    const qty = Number(newExpense.quantity || 0), unitCost = Number(newExpense.unitCost || 0);
    const calculatedAmount = newExpense.category === 'Parts Purchase' && qty > 0 && unitCost > 0 ? qty * unitCost : Number(newExpense.amount || 0);
    if (editingExpenseId) {
      setExpenses(expenses.map(exp => exp.id === editingExpenseId ? { ...exp, ...newExpense, amount: calculatedAmount, quantity: qty || '', unitCost: unitCost || '', date: newExpense.date || exp.date } : exp));
      setEditingExpenseId(null);
      setNewExpense({ description: '', amount: '', category: 'General', itemName: '', quantity: '', unitCost: '', supplierName: '', supplierPhone: '', invoiceNo: '', paymentMethod: 'Cash', notes: '', date: todayKey });
      alert('Expense updated successfully!'); return;
    }
    const expense = { id: Date.now(), description: newExpense.description || (newExpense.itemName ? `Parts Purchase - ${newExpense.itemName}` : 'General Expense'), category: newExpense.category || 'General', amount: calculatedAmount, quantity: qty || '', unitCost: unitCost || '', itemName: newExpense.itemName || '', supplierName: newExpense.supplierName || '', supplierPhone: newExpense.supplierPhone || '', invoiceNo: newExpense.invoiceNo || '', paymentMethod: newExpense.paymentMethod || 'Cash', notes: newExpense.notes || '', date: newExpense.date || todayKey };
    setExpenses([expense, ...expenses]);
    setNewExpense({ description: '', amount: '', category: 'General', itemName: '', quantity: '', unitCost: '', supplierName: '', supplierPhone: '', invoiceNo: '', paymentMethod: 'Cash', notes: '', date: todayKey });
  };

  const markInvoiceAsPaid = (id) => {
    setRepairs(repairs.map(r => {
      if (r.id === id) {
        return { ...r, paidAmount: r.totalCost, dueAmount: 0 };
      }
      return r;
    }));
  };

  const handleUpdateInvoice = (e) => {
    e.preventDefault();
    const total = Number(editingInvoice.totalCost || 0);
    const paid = Number(editingInvoice.paidAmount || 0);
    const updated = {
      ...editingInvoice,
      totalCost: total,
      paidAmount: paid,
      dueAmount: total - paid
    };
    setRepairs(repairs.map(r => r.id === updated.id ? updated : r));
    setEditingInvoice(null);
  };

  const updateJobStatus = (id, status) => {
    setRepairs(repairs.map(r => r.id === id ? { ...r, status } : r));
  };

  const generateInvoiceCanvas = (inv) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1100;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, 160);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(shopInfo.name, 50, 55);

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(shopInfo.tagline.toUpperCase(), 50, 80);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px sans-serif';
    ctx.fillText(`${shopInfo.address}  |  Phone: ${shopInfo.phone}  |  PAN: ${shopInfo.panNo}`, 50, 105);

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`INVOICE #${inv.id}`, 560, 55);

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Date: ${inv.dateTime}`, 560, 85);
    
    const isPaid = Number(inv.dueAmount) <= 0;
    ctx.fillStyle = isPaid ? '#34D399' : '#F87171';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`Status: ${isPaid ? 'PAID IN FULL' : 'DUE PENDING'}`, 560, 110);

    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(50, 185, 700, 95, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('BILL TO:', 70, 210);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(inv.customerName, 70, 238);

    ctx.fillStyle = '#475569';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Phone: ${inv.phone}`, 70, 262);

    ctx.fillText(`Type: ${inv.deviceType || 'Repair & Sales'}`, 420, 210);
    ctx.fillText(`Warranty: ${inv.warrantyMonths || '—'}`, 420, 238);

    ctx.fillStyle = '#1E293B';
    ctx.fillRect(50, 310, 700, 40);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('S.N.', 70, 335);
    ctx.fillText('ITEM / DESCRIPTION', 120, 335);
    ctx.fillText('QTY', 480, 335);
    ctx.fillText('PRICE (NPR)', 560, 335);
    ctx.fillText('TOTAL', 660, 335);

    const itemsList = inv.items && inv.items.length > 0 ? inv.items : [
      { name: inv.model || inv.issue, price: inv.totalCost, qty: 1 }
    ];

    let startY = 375;
    itemsList.forEach((item, index) => {
      ctx.fillStyle = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
      ctx.fillRect(50, startY - 20, 700, 36);

      ctx.strokeStyle = '#F1F5F9';
      ctx.strokeRect(50, startY - 20, 700, 36);

      ctx.fillStyle = '#334155';
      ctx.font = '13px sans-serif';
      ctx.fillText(`${index + 1}`, 75, startY + 2);
      ctx.fillText(item.name || 'Service / Item', 120, startY + 2);
      ctx.fillText(`${item.qty || 1}`, 490, startY + 2);
      ctx.fillText(`${item.price || 0}`, 570, startY + 2);
      ctx.fillText(`${(item.price || 0) * (item.qty || 1)}`, 660, startY + 2);

      startY += 36;
    });

    const totalsY = Math.max(startY + 30, 520);
    
    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.roundRect(430, totalsY, 320, 130, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.font = '13px sans-serif';
    ctx.fillText('Subtotal:', 460, totalsY + 30);
    ctx.fillText(`NPR ${inv.totalCost}`, 630, totalsY + 30);

    ctx.fillText('Amount Paid:', 460, totalsY + 65);
    ctx.fillStyle = '#16A34A';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`NPR ${inv.paidAmount}`, 630, totalsY + 65);

    ctx.strokeStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.moveTo(450, totalsY + 80);
    ctx.lineTo(730, totalsY + 80);
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('BALANCE DUE:', 460, totalsY + 110);
    
    ctx.fillStyle = Number(inv.dueAmount) > 0 ? '#DC2626' : '#16A34A';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`NPR ${inv.dueAmount}`, 615, totalsY + 110);

    const footerY = totalsY + 160;
    
    ctx.fillStyle = '#FEF9C3';
    ctx.strokeStyle = '#FEF08A';
    ctx.beginPath();
    ctx.roundRect(50, footerY, 700, 65, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#854D0E';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('WARRANTY & TRADING TERMS:', 70, footerY + 22);

    ctx.fillStyle = '#713F12';
    ctx.font = '11px sans-serif';
    ctx.fillText('Warranty covers devices/parts as specified. Physical or water damage voids all warranty.', 70, footerY + 42);
    ctx.fillText(`Thank you for choosing ${shopInfo.name}! Your trusted tech partner.`, 70, footerY + 56);

    ctx.fillStyle = '#0F172A';
    ctx.font = '12px sans-serif';
    ctx.fillText('Authorized Signature', 600, footerY + 130);
    ctx.strokeStyle = '#94A3B8';
    ctx.beginPath();
    ctx.moveTo(560, footerY + 105);
    ctx.lineTo(730, footerY + 105);
    ctx.stroke();

    return canvas;
  };

  const downloadInvoiceImage = (inv) => {
    const canvas = generateInvoiceCanvas(inv);
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `Invoice_${inv.id}_${inv.customerName.replace(/\s+/g, '_')}.png`;
    link.click();
  };

  const printInvoice = (inv) => {
    const canvas = generateInvoiceCanvas(inv);
    const dataUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Print Invoice #${inv.id}</title></head>
        <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh; background:#fff;">
          <img src="${dataUrl}" style="max-width:100%; height:auto;" onload="window.print();window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const sendToWhatsApp = (inv) => {
    const text = `*${shopInfo.name.toUpperCase()} - ${shopInfo.tagline.toUpperCase()}*
📍 ${shopInfo.address} | 📞 ${shopInfo.phone} | PAN: ${shopInfo.panNo}
----------------------------------------
👤 *Customer:* ${inv.customerName}
📞 *Phone:* ${inv.phone}
📅 *Date & Time:* ${inv.dateTime}
----------------------------------------
🛠️ *Service/Device:* ${inv.model}
📝 *Details:* ${inv.issue}
🛡️ *Warranty:* ${inv.warrantyMonths || '—'}
----------------------------------------
💰 *Total Cost:* NPR ${inv.totalCost}
💵 *Amount Paid:* NPR ${inv.paidAmount}
🔴 *Balance Due:* NPR ${inv.dueAmount}
----------------------------------------
_Thank you for choosing ${shopInfo.name}!_`;

    let cleanPhone = inv.phone.replace(/\D/g, '');
    if (cleanPhone.length === 10 && cleanPhone.startsWith('9')) {
      cleanPhone = '977' + cleanPhone;
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const deleteRepair = (id) => setRepairs(repairs.filter(r => r.id !== id));
  const deletePart = (id) => { setInventory(inventory.filter(i => i.id !== id)); setStockPurchases(stockPurchases.filter(p => p.partId !== id)); };
  const deleteDevice = (id) => {
    const device = devicesStock.find(d => d.id === id);
    if (device?.tradeType === 'sell' && device.linkedPurchaseId) setDevicesStock(devicesStock.filter(d => d.id !== id).map(d => d.id === device.linkedPurchaseId ? { ...d, status: 'In Stock', soldDate: '', soldRecordId: '' } : d));
    else setDevicesStock(devicesStock.filter(d => d.id !== id));
  };
  const deleteExpense = (id) => setExpenses(expenses.filter(e => e.id !== id));

  const filteredInvoices = repairs.filter(r => {
    const matchesSearch = r.customerName.toLowerCase().includes(invoiceSearch.toLowerCase()) || 
      r.id.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      r.phone.includes(invoiceSearch);
    
    if (invoiceFilterTab === 'Repair') return matchesSearch && r.billType !== 'Accessories' && r.billType !== 'Device Sale';
    if (invoiceFilterTab === 'Accessories') return matchesSearch && r.billType === 'Accessories';
    if (invoiceFilterTab === 'Devices') return matchesSearch && r.billType === 'Device Sale';
    if (invoiceFilterTab === 'Due') return matchesSearch && Number(r.dueAmount) > 0;
    if (invoiceFilterTab === 'Paid') return matchesSearch && Number(r.dueAmount) === 0;
    return matchesSearch;
  });

  const customerRecords = uniqueCustomers
    .map(customer => {
      const customerRepairs = repairs.filter(r =>
        String(r.customerName || '').trim().toLowerCase() === customer.name.toLowerCase()
      );
      const customerDevices = devicesStock.filter(d =>
        String(d.partyName || '').trim().toLowerCase() === customer.name.toLowerCase()
      );
      const lastRepair = customerRepairs
        .slice()
        .sort((a, b) => String(b.dateTime || '').localeCompare(String(a.dateTime || '')))[0];
      return {
        ...customer,
        repairCount: customerRepairs.length,
        deviceCount: customerDevices.length,
        lastVisit: lastRepair?.dateTime || customerDevices[0]?.date || '',
        due: customerRepairs.reduce((sum, r) => sum + Number(r.dueAmount || 0), 0),
        history: [...customerRepairs, ...customerDevices]
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const filteredCustomers = customerRecords.filter(c => {
    const q = customerSearch.trim().toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || String(c.phone || '').includes(q);
  });

  const selectedCustomer = customerRecords.find(
    c => c.name.toLowerCase() === selectedCustomerName.toLowerCase()
  );

  const warrantyJobs = repairs.filter(r => String(r.warrantyMonths || '').trim());
  const warrantyActiveCount = warrantyJobs.length;


  return (
    <div className={`min-h-screen ${t.appBg} font-sans transition-colors duration-200`}>
      {/* Premium Top Navigation */}
      <nav className={`border-b ${t.border} ${t.navBg} backdrop-blur-xl sticky top-0 z-30 shadow-2xl`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-700 shadow-md bg-slate-900 flex items-center justify-center">
              <img src="/logo.jpg" alt="Genuine Fix Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2"><h1 className={`font-extrabold text-lg ${t.textMain} leading-tight tracking-tight`}>{shopInfo.name}</h1><span className="px-1.5 py-0.5 rounded-md bg-blue-600/15 text-blue-400 border border-blue-500/20 text-[9px] font-black tracking-wider">PRO</span></div>
              <p className="text-sm text-blue-400 font-bold uppercase tracking-widest">Laptop & Smartphone Repair</p>
            </div>
          </div>
          
          <div className={`w-full lg:w-auto flex flex-wrap items-center gap-1.5 ${t.cardSecondary} p-1.5 rounded-2xl border ${t.border} shadow-inner`}>
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'customers', icon: Users, label: 'Customers' },
              { id: 'repairs', icon: ShieldCheck, label: 'Job Sheets' },
              { id: 'devices', icon: Smartphone, label: 'Device Buy/Sell' },
              { id: 'pos', icon: ShoppingBag, label: 'Accessories Bill' },
              { id: 'invoices', icon: FileText, label: 'Invoices' },
              { id: 'inventory', icon: Package, label: 'Parts Stock' },
              { id: 'expenses', icon: DollarSign, label: 'Expenses' },
              { id: 'backup', icon: Download, label: 'Backup' },
              { id: 'settings', icon: Settings, label: 'Settings' },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-[1.01]' 
                    : `${t.textMuted} hover:text-white hover:bg-blue-600/10 hover:-translate-y-0.5`
                }`}
              >
                <item.icon size={15} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <p className={`text-sm uppercase tracking-[0.22em] font-black ${t.textMuted}`}>Genuine Fix • Shop Control Center</p>
                <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${t.textMain}`}>Good morning, manage the shop faster.</h2>
              </div>
              <div className={`inline-flex items-center gap-2 ${t.cardSecondary} border ${t.border} rounded-2xl px-3 py-2 text-sm font-bold ${t.textMuted}`}>
                <Clock3 size={15} className="text-blue-400" /> Live shop overview
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className={`bg-gradient-to-br from-blue-500/10 to-transparent border ${t.border} p-6 rounded-3xl shadow-xl`}>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Active Jobs</p>
                <h3 className="text-3xl font-black text-blue-400">{repairs.filter(r => r.status === 'In Progress' || r.status === 'Pending').length}</h3>
                <p className={`text-sm mt-2 ${t.textMuted}`}>Currently in service</p>
              </div>
              <div className={`bg-gradient-to-br from-emerald-500/10 to-transparent border ${t.border} p-6 rounded-3xl shadow-xl`}>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Ready for Pickup</p>
                <h3 className="text-3xl font-black text-emerald-400">{repairs.filter(r => r.status === 'Ready for Pickup' || r.status === 'Completed').length}</h3>
                <p className={`text-sm mt-2 ${t.textMuted}`}>Customers to notify</p>
              </div>
              <div className={`bg-gradient-to-br from-amber-500/10 to-transparent border ${t.border} p-6 rounded-3xl shadow-xl`}>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Today's Jobs</p>
                <h3 className="text-3xl font-black text-amber-400">{repairs.filter(r => String(r.dateTime || '').startsWith(new Date().toISOString().split('T')[0])).length}</h3>
                <p className={`text-sm mt-2 ${t.textMuted}`}>Jobs & bills created today</p>
              </div>
              <div className={`bg-gradient-to-br from-rose-500/10 to-transparent border ${t.border} p-6 rounded-3xl shadow-xl`}>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Low Stock</p>
                <h3 className="text-3xl font-black text-rose-400">{inventory.filter(i => Number(i.stock || 0) <= Number(i.minStock || 5)).length}</h3>
                <p className={`text-sm mt-2 ${t.textMuted}`}>Items need attention</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-5 shadow-xl lg:col-span-2`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className={`text-sm uppercase tracking-[0.18em] font-black ${t.textMuted}`}>Quick Actions</p>
                    <h3 className={`text-base font-black ${t.textMain}`}>Shop counter shortcuts</h3>
                  </div>
                  <PlusCircle size={20} className="text-blue-400" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    ['repairs', 'New Job', ShieldCheck],
                    ['pos', 'New Bill', ShoppingBag],
                    ['devices', 'Device Trade', Smartphone],
                    ['customers', 'Customers', Users]
                  ].map(([id, label, Icon]) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                      className={`${t.cardSecondary} border ${t.border} rounded-2xl p-4 text-left hover:border-blue-500/50 hover:-translate-y-0.5 transition-all group`}>
                      <Icon size={18} className="text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                      <span className={`text-sm font-black ${t.textMain}`}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-5 shadow-xl`}>
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck size={18} className="text-amber-400" />
                  <div>
                    <p className={`text-sm uppercase tracking-[0.18em] font-black ${t.textMuted}`}>Warranty Control</p>
                    <h3 className={`text-base font-black ${t.textMain}`}>Owner sets warranty</h3>
                  </div>
                </div>
                <div className={`${t.cardSecondary} border ${t.border} rounded-2xl p-4`}>
                  <p className={`text-sm font-bold ${t.textMain}`}>{warrantyActiveCount} bills have a warranty entered.</p>
                  <p className={`text-sm ${t.textMuted} mt-1`}>No automatic 30-day rule or expiry alerts. Enter any warranty you choose on each bill.</p>
                </div>
              </div>
            </div>



            <div className={`${t.cardBg} border ${t.border} rounded-3xl p-6 shadow-xl`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-bold ${t.textMain}`}>Recent Bills & Job Sheets</h2>
                <button onClick={() => setActiveTab('invoices')} className="text-blue-400 text-sm font-bold flex items-center gap-1 hover:text-blue-300">
                  View All <ChevronRight size={15}/>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={`${t.tableHeader} font-bold uppercase text-sm border-b`}>
                    <tr>
                      <th className="pb-4 text-left">Bill ID</th>
                      <th className="pb-4 text-left">Customer</th>
                      <th className="pb-4 text-left">Type / Model</th>
                      <th className="pb-4 text-left">Due Amount</th>
                      <th className="pb-4 text-left">Status</th>
                      <th className="pb-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.tableDivide}`}>
                    {repairs.slice(0, 5).map(r => (
                      <tr key={r.id}>
                        <td className="py-4 font-mono font-bold text-blue-400">{r.id}</td>
                        <td className={`py-4 ${t.textMain} font-medium`}>{r.customerName}</td>
                        <td className={`py-4 ${t.textMuted}`}>{r.model}</td>
                        <td className="py-4 font-bold text-rose-400">NPR {r.dueAmount}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full ${t.cardSecondary} ${t.textMuted} text-sm font-bold border ${t.border}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button onClick={() => setSelectedInvoice(r)} className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl text-sm font-bold inline-flex items-center gap-1">
                            <Eye size={14}/> Preview
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-5 shadow-xl`}>
                <p className={`text-sm uppercase tracking-wider font-black ${t.textMuted}`}>Total Income Received</p>
                <p className="text-2xl font-black text-emerald-400 mt-2">NPR {totalIncome}</p>
                <p className={`text-sm ${t.textMuted} mt-1`}>Paid amounts from saved bills</p>
              </div>
              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-5 shadow-xl`}>
                <p className={`text-sm uppercase tracking-wider font-black ${t.textMuted}`}>Total Shop Expense</p>
                <p className="text-2xl font-black text-rose-400 mt-2">NPR {totalExp}</p>
                <p className={`text-sm ${t.textMuted} mt-1`}>All recorded shop expenses</p>
              </div>
              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-5 shadow-xl`}>
                <p className={`text-sm uppercase tracking-wider font-black ${t.textMuted}`}>Estimated Net Cash</p>
                <p className={`text-2xl font-black mt-2 ${netCash >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>NPR {netCash}</p>
                <p className={`text-sm ${t.textMuted} mt-1`}>Income received − expenses</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-5 shadow-xl`}><p className={`text-sm uppercase tracking-wider font-black ${t.textMuted}`}>Device Purchase</p><p className="text-2xl font-black text-amber-400 mt-2">NPR {totalDevicePurchase}</p><p className={`text-sm ${t.textMuted} mt-1`}>Total buy cost recorded</p></div>
              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-5 shadow-xl`}><p className={`text-sm uppercase tracking-wider font-black ${t.textMuted}`}>Device Sales</p><p className="text-2xl font-black text-emerald-400 mt-2">NPR {totalDeviceSales}</p><p className={`text-sm ${t.textMuted} mt-1`}>Total sales value</p></div>
              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-5 shadow-xl`}><p className={`text-sm uppercase tracking-wider font-black ${t.textMuted}`}>Device Profit</p><p className={`text-2xl font-black mt-2 ${totalDeviceProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>NPR {totalDeviceProfit}</p><p className={`text-sm ${t.textMuted} mt-1`}>Sales − purchase cost</p></div>
              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-5 shadow-xl`}><p className={`text-sm uppercase tracking-wider font-black ${t.textMuted}`}>Parts Purchase</p><p className="text-2xl font-black text-blue-400 mt-2">NPR {totalPartsPurchase}</p><p className={`text-sm ${t.textMuted} mt-1`}>Stock purchases recorded</p></div>
            </div>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl p-5 shadow-xl`}>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <p className={`text-sm uppercase tracking-[0.18em] font-black ${t.textMuted}`}>Today</p>
                  <h3 className={`text-base font-black ${t.textMain}`}>Daily cash snapshot</h3>
                </div>
                <DollarSign size={20} className="text-emerald-400" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`${t.cardSecondary} border ${t.border} rounded-2xl p-4`}>
                  <p className={`text-sm ${t.textMuted}`}>Income</p>
                  <p className="text-lg font-black text-emerald-400 mt-1">NPR {todayIncome}</p>
                </div>
                <div className={`${t.cardSecondary} border ${t.border} rounded-2xl p-4`}>
                  <p className={`text-sm ${t.textMuted}`}>Expense</p>
                  <p className="text-lg font-black text-rose-400 mt-1">NPR {todayExpense}</p>
                </div>
                <div className={`${t.cardSecondary} border ${t.border} rounded-2xl p-4`}>
                  <p className={`text-sm ${t.textMuted}`}>Net</p>
                  <p className={`text-lg font-black mt-1 ${todayNet >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>NPR {todayNet}</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* CUSTOMER CRM TAB */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <p className={`text-sm uppercase tracking-[0.2em] font-black ${t.textMuted}`}>Customer CRM</p>
                <h2 className={`text-2xl font-black ${t.textMain}`}>Customers & Repair History</h2>
                <p className={`text-sm ${t.textMuted} mt-1`}>Search customers, see visit count, due amount and previous jobs from one place.</p>
              </div>
              <div className={`flex items-center gap-2 ${t.inputBg} border ${t.border} rounded-2xl px-3 py-2.5 w-full lg:w-80`}>
                <Search size={16} className={t.textMuted} />
                <input
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  placeholder="Search name or phone..."
                  className="bg-transparent outline-none text-sm w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-5 shadow-xl`}>
                <p className={`text-sm uppercase tracking-wider font-black ${t.textMuted}`}>Total Customers</p>
                <p className="text-3xl font-black text-blue-400 mt-2">{customerRecords.length}</p>
              </div>
              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-5 shadow-xl`}>
                <p className={`text-sm uppercase tracking-wider font-black ${t.textMuted}`}>Repeat Customers</p>
                <p className="text-3xl font-black text-emerald-400 mt-2">{customerRecords.filter(c => c.repairCount > 1).length}</p>
              </div>
              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-5 shadow-xl`}>
                <p className={`text-sm uppercase tracking-wider font-black ${t.textMuted}`}>Warranty Entered</p>
                <p className="text-3xl font-black text-amber-400 mt-2">{warrantyActiveCount}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
              <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl xl:col-span-2`}>
                <div className={`p-4 border-b ${t.border} ${t.cardSecondary}`}>
                  <p className={`text-sm font-black ${t.textMain}`}>Customer Directory</p>
                </div>
                <div className="max-h-[520px] overflow-y-auto divide-y divide-slate-700/40">
                  {filteredCustomers.map(c => (
                    <button key={c.name} onClick={() => setSelectedCustomerName(c.name)}
                      className={`w-full text-left p-4 transition ${selectedCustomerName === c.name ? 'bg-blue-600/10 border-l-2 border-blue-500' : 'hover:bg-blue-600/5'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={`font-black text-sm ${t.textMain}`}>{c.name}</p>
                          <p className={`text-sm ${t.textMuted} mt-1`}>{c.phone || 'No phone saved'}</p>
                        </div>
                        <span className="text-sm font-black px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">{c.repairCount} visits</span>
                      </div>
                      {c.due > 0 && <p className="text-sm text-rose-400 font-bold mt-2">Outstanding: NPR {c.due}</p>}
                    </button>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <div className={`p-8 text-center text-sm ${t.textMuted}`}>No customers found.</div>
                  )}
                </div>
              </div>

              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-5 shadow-xl xl:col-span-3`}>
                {!selectedCustomer ? (
                  <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center mb-4">
                      <History size={28} className="text-blue-400" />
                    </div>
                    <h3 className={`font-black ${t.textMain}`}>Select a customer</h3>
                    <p className={`text-sm ${t.textMuted} mt-1 max-w-sm`}>Their repair visits, device trades and outstanding amount will appear here.</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-5 mb-5 border-slate-700/50">
                      <div>
                        <p className={`text-xl font-black ${t.textMain}`}>{selectedCustomer.name}</p>
                        <p className={`text-sm ${t.textMuted} mt-1`}>{selectedCustomer.phone || 'No phone saved'}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-2 rounded-xl bg-blue-500/10 text-blue-400 text-sm font-black">{selectedCustomer.repairCount} visits</span>
                        {selectedCustomer.due > 0 && <span className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-400 text-sm font-black">Due NPR {selectedCustomer.due}</span>}
                      </div>
                    </div>
                    <div className="space-y-3 max-h-[430px] overflow-y-auto">
                      {selectedCustomer.history.map(item => {
                        const isRepair = Boolean(item.id && item.customerName);
                        return (
                          <div key={`${isRepair ? 'repair' : 'device'}-${item.id}`} className={`${t.cardSecondary} border ${t.border} rounded-2xl p-4`}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className={`text-sm font-black ${t.textMain}`}>{isRepair ? (item.model || item.deviceType) : item.brandModel}</p>
                                <p className={`text-sm ${t.textMuted} mt-1`}>{item.id} • {isRepair ? item.dateTime : item.date}</p>
                              </div>
                              <span className={`text-sm font-black px-2 py-1 rounded-full ${isRepair ? 'bg-emerald-500/10 text-emerald-400' : 'bg-violet-500/10 text-violet-400'}`}>
                                {isRepair ? item.status : item.status || 'Device'}
                              </span>
                            </div>
                            {isRepair && <p className={`text-sm ${t.textMuted} mt-3`}>{item.issue || 'Repair / service job'}</p>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* REPAIRS / JOB SHEETS TAB */}
        {activeTab === 'repairs' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className={`text-xl font-bold ${t.textMain}`}>Create Repair / Unlocking Job Sheet</h2>
            <form onSubmit={handleAddRepair} className={`${t.cardBg} border ${t.border} p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4 shadow-xl`}>
              <CustomerAutocomplete
                value={newRepair.customerName}
                placeholder="Customer Full Name"
                customers={uniqueCustomers}
                onChange={value => setNewRepair(prev => ({ ...prev, customerName: value }))}
                onSelect={customer => handleCustomerSelect(customer, 'repair')}
                className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none focus:border-blue-600`}
              />
              <input type="text" placeholder="Phone Number (e.g. 98xxxxxxxx)" value={newRepair.phone} onChange={e => setNewRepair({...newRepair, phone: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none focus:border-blue-600`} />
              <input type="text" placeholder="Citizenship No. (Optional)" value={newRepair.citizenshipNo} onChange={e => setNewRepair({...newRepair, citizenshipNo: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none focus:border-blue-600`} />

              <select value={newRepair.deviceType} onChange={e => setNewRepair({...newRepair, deviceType: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}>
                <option value="Laptop Repair">Laptop Repair</option>
                <option value="Mobile Repair">Mobile Repair</option>
                <option value="Mobile (Unlock)">Mobile (Unlock)</option>
                <option value="Desktop/Computer">Desktop/Computer</option>
                <option value="Tablet Repair">Tablet Repair</option>
              </select>

              <input type="text" placeholder="Device Model (Optional)" value={newRepair.model} onChange={e => setNewRepair({...newRepair, model: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <input type="number" placeholder="Total Cost (NPR)" value={newRepair.totalCost} onChange={e => setNewRepair({...newRepair, totalCost: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <input type="number" placeholder="Paid Amount (NPR)" value={newRepair.paidAmount} onChange={e => setNewRepair({...newRepair, paidAmount: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <input type="text" placeholder="Warranty (e.g. 30 Days, 1 Year)" value={newRepair.warrantyMonths} onChange={e => setNewRepair({...newRepair, warrantyMonths: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <input type="text" placeholder="Issue / Details (Optional)" value={newRepair.issue} onChange={e => setNewRepair({...newRepair, issue: e.target.value})} className={`md:col-span-2 p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />

              <div className={`md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 ${t.cardSecondary} p-4 rounded-2xl border ${t.border}`}>
                <div>
                  <label className="text-sm font-bold text-slate-400 block mb-1">Customer Photo (Optional)</label>
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'customerPhoto')} className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer" />
                  {newRepair.customerPhoto && <span className="text-sm text-emerald-400 mt-1 block font-semibold">✓ Customer Photo Attached</span>}
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-400 block mb-1">Citizenship Photo (Optional)</label>
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'citizenshipPhoto')} className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer" />
                  {newRepair.citizenshipPhoto && <span className="text-sm text-emerald-400 mt-1 block font-semibold">✓ Citizenship Photo Attached</span>}
                </div>
              </div>
              
              <button type="submit" className="md:col-span-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-blue-600/35">Save Job Sheet</button>
            </form>
          </div>
        )}

        {/* DEVICES TAB */}
        {activeTab === 'devices' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className={`text-xl font-bold ${t.textMain}`}>📱 Second-Hand & New Phone / Laptop Trading</h2>
              <p className={`text-sm ${t.textMuted} mt-0.5`}>Buy multiple identical phones from the same party by adding a separate IMEI/Serial for each physical device. Edit records anytime; sales keep purchase price, seller, buyer and profit linked.</p>
            </div>

            <form onSubmit={handleAddDevice} className={`${t.cardBg} border ${t.border} p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4 shadow-xl`}>
              <select
                value={newDevice.tradeType || 'buy'}
                onChange={e => {
                  const tradeType = e.target.value;
                  setNewDevice(prev => ({ ...prev, tradeType }));
                  setDeviceTradeTab(tradeType);
                  setSelectedPurchaseId('');
                }}
                className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
              >
                <option value="buy">BUY / PURCHASE RECORD</option>
                <option value="sell">SELL / SALES RECORD</option>
              </select>

              {newDevice.tradeType === 'sell' ? (
                <select
                  value={selectedPurchaseId}
                  onChange={e => {
                    const id = e.target.value;
                    setSelectedPurchaseId(id);
                    const purchase = devicesStock.find(d => d.id === id);
                    if (purchase) {
                      setNewDevice(prev => ({
                        ...prev,
                        deviceCategory: purchase.deviceCategory,
                        brandModel: purchase.brandModel,
                        imeiOrSerial: purchase.imeiOrSerial,
                        condition: purchase.condition,
                        buyPrice: String(purchase.buyPrice ?? ''),
                        warrantyMonths: purchase.warrantyMonths || ''
                      }));
                    }
                  }}
                  className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
                  required
                >
                  <option value="">Select purchased device...</option>
                  {devicesStock
                    .filter(d => (d.tradeType || 'buy') === 'buy' && (d.status !== 'Sold' || d.id === selectedPurchaseId))
                    .map(d => (
                      <option key={d.id} value={d.id}>
                        {d.brandModel} — IMEI/SN {d.imeiOrSerial} — Buy NPR {d.buyPrice}
                      </option>
                    ))}
                </select>
              ) : (
                <select value={newDevice.deviceCategory} onChange={e => setNewDevice({...newDevice, deviceCategory: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}>
                  <option value="Second-Hand Phone">Second-Hand Phone</option>
                  <option value="Second-Hand Laptop">Second-Hand Laptop</option>
                  <option value="New Phone">New Phone (Brand New)</option>
                  <option value="New Laptop">New Laptop (Brand New)</option>
                </select>
              )}

              <input type="text" placeholder="Brand & Model (e.g. iPhone 13 / Dell Inspiron)" value={newDevice.brandModel} onChange={e => setNewDevice({...newDevice, brandModel: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required readOnly={newDevice.tradeType === 'sell'} />

              {newDevice.tradeType === 'buy' ? (
                <div className={`md:col-span-2 ${t.cardSecondary} border ${t.border} rounded-2xl p-3`}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div>
                      <p className={`text-sm font-black ${t.textMain}`}>IMEI / Serial Numbers</p>
                      <p className={`text-xs ${t.textMuted}`}>Same model + same seller: add one IMEI for each physical phone.</p>
                    </div>
                    <button type="button" onClick={addDeviceImeiField} className="px-3 py-2 bg-blue-600/20 text-blue-400 rounded-xl text-xs font-black">+ Add IMEI</button>
                  </div>
                  <div className="space-y-2">
                    {(newDevice.imeiList?.length ? newDevice.imeiList : [newDevice.imeiOrSerial || '']).map((imei, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input type="text" placeholder={`IMEI / Serial No. ${idx + 1}`} value={imei}
                          onChange={e => updateDeviceImeiField(idx, e.target.value)}
                          className={`flex-1 p-3 ${t.inputBg} border rounded-xl text-sm font-mono focus:outline-none`} required />
                        {(newDevice.imeiList?.length || 1) > 1 && (
                          <button type="button" onClick={() => removeDeviceImeiField(idx)} className="p-3 bg-rose-500/10 text-rose-400 rounded-xl"><X size={16}/></button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <input type="text" placeholder="IMEI / Serial No." value={newDevice.imeiOrSerial} className={`p-3 ${t.inputBg} border rounded-2xl text-sm font-mono focus:outline-none`} required readOnly />
              )}

              <input type="text" placeholder="Condition / Specs (e.g. Battery 90%, Scratchless)" value={newDevice.condition} onChange={e => setNewDevice({...newDevice, condition: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} readOnly={newDevice.tradeType === 'sell'} />
              <CustomerAutocomplete
                value={newDevice.partyName}
                placeholder={newDevice.tradeType === 'buy' ? 'Seller / Party Name' : 'Buyer / Customer Name'}
                customers={uniqueCustomers}
                onChange={value => setNewDevice(prev => ({ ...prev, partyName: value }))}
                onSelect={customer => handleCustomerSelect(customer, 'device')}
                className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
              />
              <input type="text" placeholder={newDevice.tradeType === 'buy' ? 'Seller Phone Number' : 'Customer Phone Number'} value={newDevice.partyPhone} onChange={e => setNewDevice({...newDevice, partyPhone: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />

              <input type="number" placeholder={newDevice.tradeType === 'buy' ? 'Purchase / Buy Price (NPR)' : 'Original Purchase Price (NPR)'} value={newDevice.buyPrice} onChange={e => setNewDevice({...newDevice, buyPrice: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} readOnly={newDevice.tradeType === 'sell'} />
              <input type="number" placeholder={newDevice.tradeType === 'buy' ? 'Expected Selling Price (NPR)' : 'Selling Price (NPR)'} value={newDevice.sellPrice} onChange={e => setNewDevice({...newDevice, sellPrice: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              <input type="text" placeholder="Warranty (optional — enter your own)" value={newDevice.warrantyMonths} onChange={e => setNewDevice({...newDevice, warrantyMonths: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />

              {newDevice.tradeType === 'buy' && (
                <div className={`md:col-span-3 flex flex-wrap items-center justify-between gap-3 ${t.cardSecondary} border ${t.border} rounded-2xl p-3`}>
                  <span className={`text-sm font-bold ${t.textMuted}`}>Units: {(newDevice.imeiList?.filter(v => String(v || '').trim()).length || 1)}</span>
                  <span className={`text-sm font-black ${t.textMain}`}>Total Purchase: NPR {(newDevice.imeiList?.filter(v => String(v || '').trim()).length || 1) * Number(newDevice.buyPrice || 0)}</span>
                </div>
              )}

              <button type="submit" className="md:col-span-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-emerald-600/30">{editingDeviceId ? 'Update Device Record' : (newDevice.tradeType === 'sell' ? 'Save Sale & Generate Bill' : 'Save Purchase Record')}</button>
              {editingDeviceId && <button type="button" onClick={() => resetDeviceForm(newDevice.tradeType || 'buy')} className="md:col-span-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl p-3.5 transition">Cancel Edit</button>}
            </form>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>
              <div className={`p-4 border-b ${t.border} flex flex-wrap gap-2 items-center justify-between`}>
                <div className={`${t.cardSecondary} p-1 rounded-xl border ${t.border} flex`}>
                  <button type="button" onClick={() => setDeviceTradeTab('buy')} className={`px-4 py-2 rounded-lg text-sm font-black transition ${deviceTradeTab === 'buy' ? 'bg-blue-600 text-white' : t.textMuted}`}>Bought / Purchased</button>
                  <button type="button" onClick={() => setDeviceTradeTab('sell')} className={`px-4 py-2 rounded-lg text-sm font-black transition ${deviceTradeTab === 'sell' ? 'bg-emerald-600 text-white' : t.textMuted}`}>Sold / Sales</button>
                </div>
                <div className={`text-sm ${t.textMuted}`}>
                  Bought: {devicesStock.filter(d => (d.tradeType || 'buy') === 'buy').length} • Sold: {devicesStock.filter(d => d.tradeType === 'sell').length}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className={`${t.tableHeader} text-sm uppercase border-b`}>
                    <tr>
                      <th className="p-4">Device & Category</th>
                      <th className="p-4">IMEI / S.N. & Condition</th>
                      <th className="p-4">{deviceTradeTab === 'buy' ? 'Seller / Party' : 'Buyer / Customer'}</th>
                      <th className="p-4">{deviceTradeTab === 'buy' ? 'Purchase Price' : 'Purchase → Sale / Profit'}</th>
                      <th className="p-4">Date / Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.tableDivide}`}>
                    {devicesStock.filter(dev => (dev.tradeType || 'buy') === deviceTradeTab).map(dev => (
                      <tr key={dev.id}>
                        <td className="p-4">
                          <p className={`font-bold ${t.textMain}`}>{dev.brandModel}</p>
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-sm font-bold">{dev.deviceCategory}</span>
                          {dev.linkedPurchaseId && <p className="text-xs text-violet-400 mt-1">Purchase: {dev.linkedPurchaseId}</p>}
                        </td>
                        <td className="p-4">
                          <p className="font-mono text-sm text-blue-400">{getDeviceImeis(dev).join(', ')}</p>
                          {getDeviceImeis(dev).length > 1 && <p className={`text-xs ${t.textMuted}`}>{getDeviceImeis(dev).length} IMEI records</p>}
                          <p className={`text-sm ${t.textMuted}`}>{dev.condition}</p>
                        </td>
                        <td className="p-4">
                          <p className={`font-bold ${t.textMain}`}>{dev.partyName}</p>
                          <p className={`text-sm ${t.textMuted}`}>{dev.partyPhone}</p>
                          {deviceTradeTab === 'sell' && <p className={`text-xs ${t.textMuted} mt-1`}>Bought from: {dev.sellerName || 'N/A'}</p>}
                        </td>
                        <td className="p-4">
                          {deviceTradeTab === 'buy' ? (
                            <p className="text-sm font-bold text-rose-400">NPR {dev.buyPrice}</p>
                          ) : (
                            <>
                              <p className="text-sm text-rose-400">Buy: NPR {dev.buyPrice}</p>
                              <p className="text-sm font-bold text-emerald-400">Sale: NPR {dev.sellPrice}</p>
                              <p className={`text-sm font-black ${Number(dev.profit) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>Profit: NPR {dev.profit}</p>
                            </>
                          )}
                        </td>
                        <td className="p-4">
                          {deviceTradeTab === 'sell' && <p className={`text-xs ${t.textMuted}`}>Bought: {dev.purchaseDate || 'N/A'}</p>}
                          <p className={`text-sm ${t.textMuted}`}>{deviceTradeTab === 'sell' ? (dev.saleDate || dev.date) : (dev.purchaseDate || dev.date)}</p>
                          <span className={`text-sm font-bold ${dev.status === 'Sold' ? 'text-emerald-400' : 'text-blue-400'}`}>{dev.status}</span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => {
                            setEditingDeviceId(dev.id);
                            setNewDevice({ tradeType: dev.tradeType || 'buy', deviceCategory: dev.deviceCategory || 'Second-Hand Phone', brandModel: dev.brandModel || '', imeiOrSerial: dev.imeiOrSerial || '', imeiList: getDeviceImeis(dev), condition: dev.condition || '', partyName: dev.partyName || '', partyPhone: dev.partyPhone || '', buyPrice: String(dev.buyPrice ?? ''), sellPrice: String(dev.sellPrice ?? ''), warrantyMonths: dev.warrantyMonths || '' });
                            setSelectedPurchaseId(dev.linkedPurchaseId || '');
                            setDeviceTradeTab(dev.tradeType || 'buy');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }} className="p-2 bg-amber-500/10 text-amber-400 rounded-xl hover:bg-amber-500/20"><Pencil size={14}/></button>
                          <button onClick={() => { if(window.confirm('Delete this device record?')) deleteDevice(dev.id); }} className="p-2 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20"><Trash2 size={14}/></button>
                        </td>
                      </tr>
                    ))}
                    {devicesStock.filter(dev => (dev.tradeType || 'buy') === deviceTradeTab).length === 0 && (
                      <tr><td colSpan="6" className={`p-8 text-center ${t.textMuted}`}>No {deviceTradeTab === 'buy' ? 'purchase' : 'sales'} records yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ACCESSORIES / POS BILLING TAB */}
        {activeTab === 'pos' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className={`text-xl font-bold ${t.textMain}`}>Accessories & Parts Direct Billing (POS)</h2>
              <p className={`text-sm ${t.textMuted} mt-0.5`}>Pick from stock or type custom item names and prices freely. Stock will deduct automatically.</p>
            </div>

            <form onSubmit={handleSavePosBill} className={`${t.cardBg} border ${t.border} p-6 rounded-3xl space-y-4 shadow-xl`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomerAutocomplete
                  value={posBill.customerName}
                  placeholder="Customer Name"
                  customers={uniqueCustomers}
                  onChange={value => setPosBill(prev => ({ ...prev, customerName: value }))}
                  onSelect={customer => handleCustomerSelect(customer, 'pos')}
                  className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
                />
                <input type="text" placeholder="Phone Number (Optional)" value={posBill.phone} onChange={e => setPosBill({...posBill, phone: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold uppercase text-slate-400">Items List</label>
                {posBill.items.map((item, idx) => (
                  <div key={idx} className={`flex flex-wrap items-center gap-3 ${t.cardSecondary} p-3 rounded-2xl border ${t.border}`}>
                    <input type="text" placeholder="Item Name" value={item.name} onChange={e => handlePosItemChange(idx, 'name', e.target.value)} className={`flex-1 min-w-[200px] p-2.5 ${t.inputBg} border rounded-xl text-sm focus:outline-none`} />
                    <input type="number" placeholder="Price" value={item.price} onChange={e => handlePosItemChange(idx, 'price', e.target.value)} className={`w-28 p-2.5 ${t.inputBg} border rounded-xl text-sm focus:outline-none`} />
                    <input type="number" placeholder="Qty" value={item.qty} onChange={e => handlePosItemChange(idx, 'qty', e.target.value)} className={`w-20 p-2.5 ${t.inputBg} border rounded-xl text-sm focus:outline-none`} />
                    {posBill.items.length > 1 && (
                      <button type="button" onClick={() => handleRemovePosItem(idx)} className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20"><Trash2 size={16}/></button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleAddPosItem} className={`px-4 py-2 ${t.cardSecondary} hover:opacity-80 ${t.textMain} rounded-xl text-sm font-bold border ${t.border}`}>+ Add Another Item</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <input type="number" placeholder="Paid Amount" value={posBill.paidAmount} onChange={e => setPosBill({...posBill, paidAmount: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                <input type="text" placeholder="Warranty (e.g. 30 Days)" value={posBill.warrantyMonths} onChange={e => setPosBill({...posBill, warrantyMonths: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              </div>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-emerald-600/30">Complete Sale & Print Bill</button>
            </form>
          </div>
        )}

        {/* INVOICES TAB */}
        {activeTab === 'invoices' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className={`text-xl font-bold ${t.textMain}`}>Invoices & Records</h2>
              <div className="flex items-center gap-3">
                <input type="text" placeholder="Search by name, ID, phone..." value={invoiceSearch} onChange={e => setInvoiceSearch(e.target.value)} className={`p-2.5 ${t.cardBg} border ${t.border} rounded-xl text-sm ${t.textMain} w-64 focus:outline-none`} />
                <div className={`flex ${t.cardBg} p-1 rounded-xl border ${t.border}`}>
                  {['All', 'Repair', 'Devices', 'Accessories', 'Due', 'Paid'].map(tab => (
                    <button key={tab} onClick={() => setInvoiceFilterTab(tab)} className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${invoiceFilterTab === tab ? 'bg-blue-600 text-white' : `${t.textMuted} hover:text-white`}`}>{tab}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>
              <table className="w-full text-left text-sm">
                <thead className={`${t.tableHeader} text-sm uppercase border-b`}>
                  <tr>
                    <th className="p-4">Invoice ID & Date</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Model / Description</th>
                    <th className="p-4">Total / Due</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${t.tableDivide}`}>
                  {filteredInvoices.map(inv => (
                    <tr key={inv.id}>
                      <td className="p-4 font-mono">
                        <p className="font-bold text-blue-400">{inv.id}</p>
                        <p className={`text-sm ${t.textMuted}`}>{inv.dateTime}</p>
                      </td>
                      <td className="p-4">
                        <p className={`font-bold ${t.textMain}`}>{inv.customerName}</p>
                        <p className={`text-sm ${t.textMuted}`}>{inv.phone}</p>
                      </td>
                      <td className={`p-4 ${t.textMuted}`}>{inv.model}</td>
                      <td className="p-4">
                        <p className={`font-bold ${t.textMain}`}>NPR {inv.totalCost}</p>
                        {Number(inv.dueAmount) > 0 ? (
                          <span className="text-sm font-bold text-rose-400">Due: NPR {inv.dueAmount}</span>
                        ) : (
                          <span className="text-sm font-bold text-emerald-400">Paid in Full</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <select
                          value={inv.status || 'Pending'}
                          onChange={e => updateJobStatus(inv.id, e.target.value)}
                          className={`px-2.5 py-1.5 ${t.inputBg} border ${t.border} rounded-xl text-sm font-bold focus:outline-none`}
                        >
                          {['Pending', 'In Progress', 'Ready for Pickup', 'Delivered', 'Cancelled'].map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <button onClick={() => setSelectedInvoice(inv)} className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl text-sm font-bold">Preview</button>
                        <button onClick={() => setEditingInvoice(inv)} className="px-3 py-1.5 bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 rounded-xl text-sm font-bold inline-flex items-center gap-1">
                          <Pencil size={14}/> Edit
                        </button>
                        <button onClick={() => { if(window.confirm('Delete this record?')) deleteRepair(inv.id); }} className="p-2 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 inline-flex items-center align-middle">
                          <Trash2 size={14}/>
                        </button>
                        {Number(inv.dueAmount) > 0 && (
                          <button onClick={() => markInvoiceAsPaid(inv.id)} className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 rounded-xl text-sm font-bold">Mark Paid</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* INVENTORY / PARTS STOCK TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className={`text-xl font-bold ${t.textMain}`}>Parts & Accessories Inventory</h2>
              <p className={`text-sm ${t.textMuted} mt-1`}>Track stock quantity, supplier/party, purchase cost and every daily parts purchase.</p>
            </div>

            <form onSubmit={handleAddPart} className={`${t.cardBg} border ${t.border} p-6 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-4 shadow-xl`}>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="text" placeholder="Part Name" value={newPart.name} onChange={e => setNewPart({...newPart, name: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} required />
              <input type="number" placeholder="Stock Quantity" value={newPart.stock} onChange={e => setNewPart({...newPart, stock: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} required />
              <input type="number" placeholder="Cost Price (NPR)" value={newPart.costPrice} onChange={e => setNewPart({...newPart, costPrice: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              <input type="number" placeholder="Selling Price (NPR)" value={newPart.price} onChange={e => setNewPart({...newPart, price: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} required />
              <input type="text" placeholder="Supplier / Party Name" value={newPart.supplierName} onChange={e => setNewPart({...newPart, supplierName: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              <input type="text" placeholder="Supplier Phone" value={newPart.supplierPhone} onChange={e => setNewPart({...newPart, supplierPhone: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              <input type="date" value={newPart.purchaseDate} onChange={e => setNewPart({...newPart, purchaseDate: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              <input type="number" placeholder="Minimum Stock" value={newPart.minStock} onChange={e => setNewPart({...newPart, minStock: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              <button type="submit" className="md:col-span-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl p-3.5 transition">{editingPartId ? 'Update Stock Item' : 'Add New Part to Stock'}</button>
              {editingPartId && <button type="button" onClick={() => { setEditingPartId(null); setNewPart({ name: '', stock: '', costPrice: '', price: '', minStock: '5', supplierName: '', supplierPhone: '', purchaseDate: todayKey }); }} className="bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl p-3.5">Cancel Edit</button>}
            </form>

            <datalist id="gf-supplier-list">
              {Array.from(new Set([...inventory.map(i => i.supplierName), ...stockPurchases.map(p => p.supplierName), ...expenses.map(e => e.supplierName)].filter(Boolean))).map(name => <option key={name} value={name} />)}
            </datalist>

            <form onSubmit={handleAddStockPurchase} className={`${t.cardBg} border ${t.border} p-6 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-4 shadow-xl`}>
              <div className="md:col-span-4">
                <h3 className={`font-black ${t.textMain}`}>Daily Parts Purchase / Stock In</h3>
                <p className={`text-sm ${t.textMuted}`}>Select an existing part or enter a new one. Stock and average cost update automatically.</p>
              </div>
              <select value={newStockPurchase.partId} onChange={e => { const part = inventory.find(i => String(i.id) === e.target.value); setNewStockPurchase({...newStockPurchase, partId: e.target.value, partName: part?.name || '', category: part?.category || newStockPurchase.category}); }} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`}>
                <option value="">Select existing part...</option>
                {inventory.map(item => <option key={item.id} value={item.id}>{item.name} — Stock {item.stock}</option>)}
              </select>
              <input type="text" placeholder="New Part Name (if not listed)" value={newStockPurchase.partName} onChange={e => setNewStockPurchase({...newStockPurchase, partName: e.target.value, partId: ''})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              <select value={newStockPurchase.category} onChange={e => setNewStockPurchase({...newStockPurchase, category: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="text" placeholder="Supplier / Party Name" list="gf-supplier-list" value={newStockPurchase.supplierName} onChange={e => setNewStockPurchase({...newStockPurchase, supplierName: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} required />
              <input type="text" placeholder="Supplier Phone" value={newStockPurchase.supplierPhone} onChange={e => setNewStockPurchase({...newStockPurchase, supplierPhone: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              <input type="number" placeholder="Quantity" value={newStockPurchase.qty} onChange={e => setNewStockPurchase({...newStockPurchase, qty: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} required />
              <input type="number" placeholder="Unit Cost (NPR)" value={newStockPurchase.unitCost} onChange={e => setNewStockPurchase({...newStockPurchase, unitCost: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} required />
              <input type="date" value={newStockPurchase.date} onChange={e => setNewStockPurchase({...newStockPurchase, date: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              <input type="text" placeholder="Supplier Invoice / Bill No." value={newStockPurchase.invoiceNo} onChange={e => setNewStockPurchase({...newStockPurchase, invoiceNo: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              <input type="text" placeholder="Notes" value={newStockPurchase.notes} onChange={e => setNewStockPurchase({...newStockPurchase, notes: e.target.value})} className={`md:col-span-2 p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              <div className={`p-3 ${t.cardSecondary} border ${t.border} rounded-2xl font-black ${t.textMain}`}>Total: NPR {Number(newStockPurchase.qty || 0) * Number(newStockPurchase.unitCost || 0)}</div>
              <button type="submit" className="md:col-span-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl p-3.5 transition">Save Parts Purchase & Update Stock</button>
            </form>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>
              <div className={`p-4 border-b ${t.border} flex flex-wrap items-center justify-between gap-3`}>
                <div><h3 className={`font-black ${t.textMain}`}>Current Stock</h3><p className={`text-sm ${t.textMuted}`}>Total parts purchase: NPR {totalPartsPurchase} • Current stock value: NPR {inventory.reduce((sum, i) => sum + (Number(i.stock || 0) * Number(i.costPrice || 0)), 0)}</p></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className={`${t.tableHeader} uppercase border-b`}><tr><th className="p-4">Part</th><th className="p-4">Category</th><th className="p-4">Stock</th><th className="p-4">Cost / Sell</th><th className="p-4">Supplier</th><th className="p-4">Last Purchase</th><th className="p-4 text-right">Actions</th></tr></thead>
                  <tbody className={`divide-y ${t.tableDivide}`}>
                    {inventory.map(item => <tr key={item.id}>
                      <td className={`p-4 font-bold ${t.textMain}`}>{item.name}</td><td className={`p-4 ${t.textMuted}`}>{item.category}</td>
                      <td className={`p-4 font-bold ${Number(item.stock) <= Number(item.minStock || 0) ? 'text-rose-400' : 'text-blue-400'}`}>{item.stock} units</td>
                      <td className={`p-4 ${t.textMuted}`}>NPR {item.costPrice} / <span className="text-emerald-400 font-bold">NPR {item.price}</span></td>
                      <td className="p-4"><p className={`font-bold ${t.textMain}`}>{item.supplierName || '—'}</p><p className={`text-xs ${t.textMuted}`}>{item.supplierPhone || ''}</p></td>
                      <td className={`p-4 ${t.textMuted}`}>{item.lastPurchaseDate || '—'}</td>
                      <td className="p-4 text-right space-x-2"><button onClick={() => adjustStock(item.id, 1)} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg font-bold">+</button><button onClick={() => adjustStock(item.id, -1)} className="px-2.5 py-1 bg-rose-500/10 text-rose-400 rounded-lg font-bold">-</button><button onClick={() => { setEditingPartId(item.id); setSelectedCategory(item.category); setNewPart({ name: item.name, stock: String(item.stock), costPrice: String(item.costPrice ?? ''), price: String(item.price ?? ''), minStock: String(item.minStock ?? 5), supplierName: item.supplierName || '', supplierPhone: item.supplierPhone || '', purchaseDate: item.lastPurchaseDate || todayKey }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-2 bg-amber-500/10 text-amber-400 rounded-xl"><Pencil size={14}/></button><button onClick={() => { if(window.confirm('Delete this stock item?')) deletePart(item.id); }} className="p-2 bg-rose-500/10 text-rose-400 rounded-xl"><Trash2 size={14}/></button></td>
                    </tr>)}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>
              <div className="p-4"><h3 className={`font-black ${t.textMain}`}>Purchase History</h3></div>
              <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className={`${t.tableHeader} uppercase border-b`}><tr><th className="p-4">Date</th><th className="p-4">Part</th><th className="p-4">Supplier / Party</th><th className="p-4">Qty</th><th className="p-4">Unit Cost</th><th className="p-4">Total</th><th className="p-4">Bill No.</th></tr></thead><tbody className={`divide-y ${t.tableDivide}`}>{stockPurchases.map(pur => <tr key={pur.id}><td className={`p-4 ${t.textMuted}`}>{pur.date}</td><td className={`p-4 font-bold ${t.textMain}`}>{pur.partName}</td><td className="p-4"><p className={`font-bold ${t.textMain}`}>{pur.supplierName}</p><p className={`text-xs ${t.textMuted}`}>{pur.supplierPhone}</p></td><td className={`p-4 ${t.textMuted}`}>{pur.qty}</td><td className={`p-4 ${t.textMuted}`}>NPR {pur.unitCost}</td><td className="p-4 font-black text-rose-400">NPR {pur.total}</td><td className={`p-4 ${t.textMuted}`}>{pur.invoiceNo || '—'}</td></tr>)}</tbody></table></div>
            </div>
          </div>
        )}

        {/* EXPENSES TAB */}
        {activeTab === 'expenses' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div><h2 className={`text-xl font-bold ${t.textMain}`}>Shop Expenses & Daily Parts Purchases</h2><p className={`text-sm ${t.textMuted} mt-1`}>Record rent, bills, tools and daily expenses. Quantity × unit cost calculates automatically, and supplier/party details are stored for each purchase.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-5`}><p className={`text-sm ${t.textMuted}`}>Total Expenses</p><p className="text-2xl font-black text-rose-400 mt-1">NPR {totalExp}</p></div>
              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-5`}><p className={`text-sm ${t.textMuted}`}>Parts Purchases</p><p className="text-2xl font-black text-amber-400 mt-1">NPR {totalPartsPurchase}</p></div>
              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-5`}><p className={`text-sm ${t.textMuted}`}>Today's Parts Buy</p><p className="text-2xl font-black text-blue-400 mt-1">NPR {todayPartsPurchase}</p></div>
              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-5`}><p className={`text-sm ${t.textMuted}`}>Today's Total Expense</p><p className="text-2xl font-black text-rose-400 mt-1">NPR {todayExpense}</p></div>
              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-5`}><p className={`text-sm ${t.textMuted}`}>Net Cash</p><p className={`text-2xl font-black mt-1 ${netCash >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>NPR {netCash}</p></div>
            </div>

            <form onSubmit={handleAddExpense} className={`${t.cardBg} border ${t.border} p-6 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-4 shadow-xl`}>
              <input type="date" value={newExpense.date || todayKey} onChange={e => setNewExpense({...newExpense, date: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`}>
                <option>General</option><option>Rent</option><option>Electricity</option><option>Internet</option><option>Staff Salary</option><option>Parts Purchase</option><option>Transport</option><option>Tools</option><option>Marketing</option><option>Other</option>
              </select>
              <input type="text" placeholder="Description / Expense Name" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className={`md:col-span-2 p-3 ${t.inputBg} border rounded-2xl text-sm`} required />
              <input type="text" placeholder="Part / Item Name" value={newExpense.itemName} onChange={e => setNewExpense({...newExpense, itemName: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              <input type="number" placeholder="Quantity" value={newExpense.quantity} onChange={e => setNewExpense({...newExpense, quantity: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              <input type="number" placeholder="Unit Cost (NPR)" value={newExpense.unitCost} onChange={e => setNewExpense({...newExpense, unitCost: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              <input type="number" placeholder="Amount (NPR)" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} required={newExpense.category !== 'Parts Purchase'} />
              <input type="text" placeholder="Supplier / Party Name" list="gf-supplier-list" value={newExpense.supplierName} onChange={e => setNewExpense({...newExpense, supplierName: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              <input type="text" placeholder="Supplier Phone" value={newExpense.supplierPhone} onChange={e => setNewExpense({...newExpense, supplierPhone: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              <input type="text" placeholder="Invoice / Bill No." value={newExpense.invoiceNo} onChange={e => setNewExpense({...newExpense, invoiceNo: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              <select value={newExpense.paymentMethod} onChange={e => setNewExpense({...newExpense, paymentMethod: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`}><option>Cash</option><option>Bank</option><option>eSewa</option><option>Khalti</option><option>Credit</option></select>
              <input type="text" placeholder="Notes" value={newExpense.notes} onChange={e => setNewExpense({...newExpense, notes: e.target.value})} className={`md:col-span-2 p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              <div className={`p-3 ${t.cardSecondary} border ${t.border} rounded-2xl font-black ${t.textMain}`}>Calculated: NPR {newExpense.category === 'Parts Purchase' ? Number(newExpense.quantity || 0) * Number(newExpense.unitCost || 0) : Number(newExpense.amount || 0)}</div>
              <button type="submit" className="md:col-span-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl p-3.5 transition">{editingExpenseId ? 'Update Expense Record' : 'Add Expense Record'}</button>
              {editingExpenseId && <button type="button" onClick={() => { setEditingExpenseId(null); setNewExpense({ description: '', amount: '', category: 'General', itemName: '', quantity: '', unitCost: '', supplierName: '', supplierPhone: '', invoiceNo: '', paymentMethod: 'Cash', notes: '', date: todayKey }); }} className="bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl p-3.5">Cancel Edit</button>}
            </form>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>
              <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className={`${t.tableHeader} uppercase border-b`}><tr><th className="p-4">Date</th><th className="p-4">Category / Description</th><th className="p-4">Item / Qty × Cost</th><th className="p-4">Supplier</th><th className="p-4">Payment</th><th className="p-4">Amount</th><th className="p-4 text-right">Action</th></tr></thead>
                <tbody className={`divide-y ${t.tableDivide}`}>{expenses.map(exp => <tr key={exp.id}><td className={`p-4 ${t.textMuted}`}>{exp.date}</td><td className="p-4"><p className={`font-bold ${t.textMain}`}>{exp.description}</p><p className={`text-xs ${t.textMuted}`}>{exp.category}</p>{exp.invoiceNo && <p className={`text-xs ${t.textMuted}`}>Bill: {exp.invoiceNo}</p>}</td><td className={`p-4 ${t.textMuted}`}>{exp.itemName || '—'}{exp.quantity ? <div>{exp.quantity} × NPR {exp.unitCost}</div> : null}</td><td className="p-4"><p className={`font-bold ${t.textMain}`}>{exp.supplierName || '—'}</p><p className={`text-xs ${t.textMuted}`}>{exp.supplierPhone || ''}</p></td><td className={`p-4 ${t.textMuted}`}>{exp.paymentMethod || 'Cash'}</td><td className="p-4 font-black text-rose-400">NPR {exp.amount}</td><td className="p-4 text-right space-x-2"><button onClick={() => { setEditingExpenseId(exp.id); setNewExpense({ description: exp.description || '', amount: String(exp.amount ?? ''), category: exp.category || 'General', itemName: exp.itemName || '', quantity: String(exp.quantity ?? ''), unitCost: String(exp.unitCost ?? ''), supplierName: exp.supplierName || '', supplierPhone: exp.supplierPhone || '', invoiceNo: exp.invoiceNo || '', paymentMethod: exp.paymentMethod || 'Cash', notes: exp.notes || '', date: exp.date || todayKey }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-2 bg-amber-500/10 text-amber-400 rounded-xl"><Pencil size={14}/></button><button onClick={() => { if(window.confirm('Delete this expense record?')) deleteExpense(exp.id); }} className="p-2 bg-rose-500/10 text-rose-400 rounded-xl"><Trash2 size={14}/></button></td></tr>)}</tbody>
              </table></div>
            </div>
          </div>
        )}

        {/* BACKUP & RESTORE TAB */}
        {activeTab === 'backup' && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
            <h2 className={`text-xl font-bold ${t.textMain}`}>Data Backup & Restore</h2>
            <div className={`${t.cardBg} border ${t.border} p-8 rounded-3xl space-y-6 shadow-xl text-center`}>
              <div>
                <h3 className={`font-bold ${t.textMain} text-lg`}>Download Backup File</h3>
                <p className={`text-sm ${t.textMuted} mt-1`}>Export all your repairs, device trading, inventory, expenses into a secure JSON file.</p>
                <button onClick={exportData} className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition shadow-lg shadow-blue-600/30 inline-flex items-center gap-2">
                  <Download size={18}/> Export Backup Now
                </button>
              </div>

              <hr className={t.border} />

              <div>
                <h3 className={`font-bold ${t.textMain} text-lg`}>Restore from Backup</h3>
                <p className={`text-sm ${t.textMuted} mt-1`}>Upload your previously exported JSON backup file to restore shop data.</p>
                <label className="mt-4 inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition shadow-lg shadow-emerald-600/30 cursor-pointer">
                  <Upload size={18} className="inline mr-2"/> Select & Restore Backup File
                  <input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS & THEME VARIETIES TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
            <h2 className={`text-xl font-bold ${t.textMain}`}>Settings & GUI Theme Preferences</h2>
            <div className={`${t.cardBg} border ${t.border} p-8 rounded-3xl space-y-6 shadow-xl`}>
              
              {/* Shop Profile Details / PAN Setup */}
              <div className="space-y-4 border-b pb-6 border-slate-700">
                <h3 className={`font-bold ${t.textMain} text-base`}>🏢 Shop Profile & PAN Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`text-sm ${t.textMuted} block mb-1`}>Shop Name</label>
                    <input type="text" value={shopInfo.name} onChange={e => setShopInfo({...shopInfo, name: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                  </div>
                  <div>
                    <label className={`text-sm ${t.textMuted} block mb-1`}>PAN / VAT Number</label>
                    <input type="text" value={shopInfo.panNo} onChange={e => setShopInfo({...shopInfo, panNo: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                  </div>
                  <div>
                    <label className={`text-sm ${t.textMuted} block mb-1`}>Phone Number</label>
                    <input type="text" value={shopInfo.phone} onChange={e => setShopInfo({...shopInfo, phone: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                  </div>
                  <div>
                    <label className={`text-sm ${t.textMuted} block mb-1`}>Address</label>
                    <input type="text" value={shopInfo.address} onChange={e => setShopInfo({...shopInfo, address: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                  </div>
                </div>
              </div>

              {/* Theme Selector */}
              <div className="space-y-4">
                <h3 className={`font-bold ${t.textMain} text-base`}>🎨 Appearance & Color Theme</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'dim', label: 'Dim Tech (Default)', bg: 'bg-[#181B22]' },
                    { id: 'dark', label: 'Pure Dark', bg: 'bg-[#0B0F17]' },
                    { id: 'light', label: 'Light Mode', bg: 'bg-slate-100 text-slate-800' }
                  ].map(thm => (
                    <button
                      key={thm.id}
                      onClick={() => setTheme(thm.id)}
                      className={`p-4 rounded-2xl border text-sm font-bold transition flex flex-col items-center gap-2 ${thm.bg} ${
                        theme === thm.id ? 'border-blue-500 ring-2 ring-blue-500/30' : t.border
                      }`}
                    >
                      <span>{thm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* INVOICE PREVIEW MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setSelectedInvoice(null)} 
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-750 transition"
            >
              <X size={18}/>
            </button>

            <div className="space-y-6 text-sm">
              {/* Header */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-black">{shopInfo.name}</h2>
                  <p className="text-sm text-sky-400 font-bold uppercase">{shopInfo.tagline}</p>
                  <p className="text-sm text-slate-400 mt-1">{shopInfo.address} | Phone: {shopInfo.phone} | PAN: {shopInfo.panNo}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sky-400 font-bold">INVOICE #{selectedInvoice.id}</p>
                  <p className="text-sm text-slate-300">Date: {selectedInvoice.dateTime}</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-sm font-bold mt-1 ${
                    Number(selectedInvoice.dueAmount) <= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {Number(selectedInvoice.dueAmount) <= 0 ? 'PAID IN FULL' : 'DUE PENDING'}
                  </span>
                </div>
              </div>

              {/* Customer Box */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase">Bill To:</p>
                  <p className="font-bold text-base text-slate-900">{selectedInvoice.customerName}</p>
                  <p className="text-sm text-slate-600">Phone: {selectedInvoice.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600"><strong className="text-slate-400">Type:</strong> {selectedInvoice.deviceType || 'Repair & Sales'}</p>
                  <p className="text-sm text-slate-600"><strong className="text-slate-400">Warranty:</strong> {selectedInvoice.warrantyMonths || '30 Days'}</p>
                  <p className="text-sm text-slate-600"><strong className="text-slate-400">Visit Count:</strong> {repairs.filter(r => r.customerName?.trim().toLowerCase() === selectedInvoice.customerName?.trim().toLowerCase()).length}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-white font-bold uppercase">
                    <tr>
                      <th className="p-3">S.N.</th>
                      <th className="p-3">Item / Description</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3">Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                      selectedInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-3">{idx + 1}</td>
                          <td className="p-3 font-medium">{item.name}</td>
                          <td className="p-3">{item.qty || 1}</td>
                          <td className="p-3">NPR {item.price}</td>
                          <td className="p-3 text-right font-bold">NPR {(item.price || 0) * (item.qty || 1)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-3">1</td>
                        <td className="p-3 font-medium">{selectedInvoice.model || selectedInvoice.issue}</td>
                        <td className="p-3">1</td>
                        <td className="p-3">NPR {selectedInvoice.totalCost}</td>
                        <td className="p-3 text-right font-bold">NPR {selectedInvoice.totalCost}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="flex justify-end pt-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 w-72 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>NPR {selectedInvoice.totalCost}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Amount Paid:</span>
                    <span className="font-bold text-emerald-600">NPR {selectedInvoice.paidAmount}</span>
                  </div>
                  <hr className="border-slate-200" />
                  <div className="flex justify-between text-sm font-extrabold text-slate-900">
                    <span>BALANCE DUE:</span>
                    <span className={Number(selectedInvoice.dueAmount) > 0 ? 'text-red-600' : 'text-emerald-600'}>
                      NPR {selectedInvoice.dueAmount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Terms */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm space-y-1">
                <p className="font-bold text-amber-800 uppercase">WARRANTY & TRADING TERMS:</p>
                <p className="text-amber-900">Warranty covers devices/parts as specified. Physical or water damage voids all warranty.</p>
                <p className="text-amber-900 font-medium">Thank you for choosing {shopInfo.name}! Your trusted tech partner.</p>
              </div>

              {/* Signature line */}
              <div className="pt-8 flex justify-end">
                <div className="text-center">
                  <div className="w-48 border-b border-slate-400 mb-1"></div>
                  <p className="text-sm font-bold text-slate-800">Authorized Signature</p>
                </div>
              </div>

            </div>

            {/* Modal Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button 
                onClick={() => downloadInvoiceImage(selectedInvoice)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow transition"
              >
                <Download size={15}/> Download Image
              </button>
              <button 
                onClick={() => printInvoice(selectedInvoice)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow transition"
              >
                <Printer size={15}/> Print Bill
              </button>
              <button 
                onClick={() => sendToWhatsApp(selectedInvoice)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow transition"
              >
                <MessageSquare size={15}/> Send to WhatsApp
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EDIT INVOICE MODAL */}
      {editingInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${t.cardBg} border ${t.border} rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-700">
              <h3 className={`text-lg font-bold ${t.textMain}`}>Edit Invoice #{editingInvoice.id}</h3>
              <button onClick={() => setEditingInvoice(null)} className="p-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"><X size={18}/></button>
            </div>

            <form onSubmit={handleUpdateInvoice} className="space-y-4">
              <div>
                <label className={`text-sm ${t.textMuted} block mb-1`}>Customer Name</label>
                <input type="text" value={editingInvoice.customerName} onChange={e => setEditingInvoice({...editingInvoice, customerName: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              </div>
              <div>
                <label className={`text-sm ${t.textMuted} block mb-1`}>Phone Number</label>
                <input type="text" value={editingInvoice.phone} onChange={e => setEditingInvoice({...editingInvoice, phone: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm ${t.textMuted} block mb-1`}>Total Cost (NPR)</label>
                  <input type="number" value={editingInvoice.totalCost} onChange={e => setEditingInvoice({...editingInvoice, totalCost: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
                </div>
                <div>
                  <label className={`text-sm ${t.textMuted} block mb-1`}>Paid Amount (NPR)</label>
                  <input type="number" value={editingInvoice.paidAmount} onChange={e => setEditingInvoice({...editingInvoice, paidAmount: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
                </div>
              </div>
              <div>
                <label className={`text-sm ${t.textMuted} block mb-1`}>Job Status</label>
                <select value={editingInvoice.status || 'Pending'} onChange={e => setEditingInvoice({...editingInvoice, status: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}>
                  {['Pending', 'In Progress', 'Ready for Pickup', 'Delivered', 'Cancelled'].map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingInvoice(null)} className={`px-4 py-2.5 ${t.cardSecondary} ${t.textMain} rounded-xl text-sm font-bold border ${t.border}`}>Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30">Update Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
