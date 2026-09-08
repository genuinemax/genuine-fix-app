import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './Login';
import React, { useState, useEffect } from 'react';
import { 
  Wrench, Package, FileText, LayoutDashboard, DollarSign, 
  Trash2, Printer, ShieldCheck, User, CreditCard, Search, Eye, ChevronRight, Download, Upload, ShoppingBag, MessageSquare, Plus, AlertTriangle, ArrowUpRight, ArrowDownRight, X, CheckCircle2, Image as ImageIcon, Pencil, Smartphone, Laptop, Settings, Sun, Moon, Monitor, Users, Bell, PlusCircle, History, Clock3
} from 'lucide-react';


const getLocalDateKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

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
  const [clockTick, setClockTick] = useState(Date.now());

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

  // Expense specific states added for enhanced filtering & management
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseFilterCategory, setExpenseFilterCategory] = useState('All');

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
    citizenshipNo: '',
    citizenshipPhoto: '',
    buyPrice: '',
    sellPrice: '',
    warrantyMonths: ''
  });
  const [deviceTradeTab, setDeviceTradeTab] = useState('buy');
  const [selectedPurchaseId, setSelectedPurchaseId] = useState('');
  const [editingDeviceId, setEditingDeviceId] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(categories[0] || 'Mobile Parts');
  const [newPart, setNewPart] = useState({ name: '', stock: '', costPrice: '', price: '', minStock: '5', supplierName: '', supplierPhone: '', purchaseDate: getLocalDateKey() });
  const [editingPartId, setEditingPartId] = useState(null);
  const [newStockPurchase, setNewStockPurchase] = useState({ partId: '', partName: '', category: categories[0] || 'Mobile Parts', supplierName: '', supplierPhone: '', qty: '', unitCost: '', date: getLocalDateKey(), invoiceNo: '', notes: '' });
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'General', itemName: '', quantity: '', unitCost: '', supplierName: '', supplierPhone: '', invoiceNo: '', paymentMethod: 'Cash', notes: '', date: getLocalDateKey() });
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

  useEffect(() => {
    const timer = setInterval(() => setClockTick(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { localStorage.setItem('gf_theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('gf_shop_info', JSON.stringify(shopInfo)); }, [shopInfo]);
  useEffect(() => { localStorage.setItem('gf_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('gf_repairs', JSON.stringify(repairs)); }, [repairs]);
  useEffect(() => { localStorage.setItem('gf_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('gf_devices_stock', JSON.stringify(devicesStock)); }, [devicesStock]);
  useEffect(() => { localStorage.setItem('gf_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('gf_stock_purchases', JSON.stringify(stockPurchases)); }, [stockPurchases]);

  // One-time data integrity repair: a purchase cannot be marked Sold unless a linked sale record exists.
  useEffect(() => {
    if (localStorage.getItem('gf_device_integrity_v2')) return;
    const salePurchaseIds = new Set(devicesStock.filter(d => d.tradeType === 'sell' && d.linkedPurchaseId).map(d => d.linkedPurchaseId));
    const repaired = devicesStock.map(d => {
      if ((d.tradeType || 'buy') === 'buy' && d.status === 'Sold' && !salePurchaseIds.has(d.id)) {
        return { ...d, status: 'In Stock', soldDate: '', soldRecordId: '' };
      }
      return d;
    });
    if (JSON.stringify(repaired) !== JSON.stringify(devicesStock)) setDevicesStock(repaired);
    localStorage.setItem('gf_device_integrity_v2', '1');
  }, []);

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px', fontSize: '18px' }}>Loading...</div>;
  }

  if (!user) {
    return <Login onLoginSuccess={(u) => setUser(u)} />;
  }

  const getCurrentDateTime = () => {
    const now = new Date();
    const date = getLocalDateKey();
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

  const handleDeviceImageUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return; }
    if (file.size > 2 * 1024 * 1024) { alert('Please keep the citizenship photo under 2 MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setNewDevice(prev => ({ ...prev, [field]: reader.result }));
    reader.readAsDataURL(file);
  };

  const salesBills = repairs.filter(r => !['Device Purchase', 'Parts Purchase'].includes(r.billType));
  const totalRevenue = salesBills.reduce((acc, curr) => acc + Number(curr.totalCost || 0), 0);
  const totalDue = repairs.reduce((acc, curr) => acc + Number(curr.dueAmount || 0), 0);
  const totalExp = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const totalDevicePurchase = devicesStock.filter(d => (d.tradeType || 'buy') === 'buy').reduce((sum, d) => sum + Number(d.buyPrice || 0), 0);
  const totalDeviceSales = devicesStock.filter(d => d.tradeType === 'sell').reduce((sum, d) => sum + Number(d.sellPrice || 0), 0);
  const totalDeviceProfit = devicesStock.filter(d => d.tradeType === 'sell').reduce((sum, d) => sum + Number(d.profit || 0), 0);
  const totalPartsPurchase = stockPurchases.reduce((sum, p) => sum + Number(p.total || 0), 0);

  const totalIncome = salesBills.reduce((acc, curr) => acc + Number(curr.paidAmount || 0), 0);
  const totalSalesValue = salesBills.reduce((acc, curr) => acc + Number(curr.totalCost || 0), 0);
  const netCash = totalIncome - totalExp;
  const todayKey = getLocalDateKey();
  const todayPartsPurchase = stockPurchases.filter(p => String(p.date || '') === todayKey).reduce((sum, p) => sum + Number(p.total || 0), 0);
  const todayIncome = repairs
    .filter(r => String(r.dateTime || '').startsWith(todayKey) && !['Device Purchase', 'Parts Purchase'].includes(r.billType))
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
    a.download = `GenuineFix_Backup_${getLocalDateKey()}.json`;
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
    setNewDevice({ tradeType, deviceCategory: 'Second-Hand Phone', brandModel: '', imeiOrSerial: '', imeiList: [''], condition: 'Good / Fresh', partyName: '', partyPhone: '', citizenshipNo: '', citizenshipPhoto: '', buyPrice: '', sellPrice: '', warrantyMonths: '' });
    setSelectedPurchaseId('');
    setEditingDeviceId(null);
  };

  const handleAddDevice = (e) => {
    e.preventDefault();
    const isBuy = newDevice.tradeType !== 'sell';
    const today = getLocalDateKey();

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
          warrantyMonths: newDevice.warrantyMonths || current.warrantyMonths || '',
          citizenshipNo: newDevice.citizenshipNo || current.citizenshipNo || '',
          citizenshipPhoto: newDevice.citizenshipPhoto || current.citizenshipPhoto || ''
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
      linkedPurchaseId: purchase.id, purchasePrice: purchasePriceVal, profit: soldRecord.profit, stockStatusAfterSale: 'Sold',
      items: [{ name: `${soldRecord.deviceCategory} - ${soldRecord.brandModel} [IMEI: ${soldRecord.imeiOrSerial}]`,
        price: salePriceVal, qty: 1,
        remarks: `Condition: ${soldRecord.condition}; Purchase: NPR ${purchasePriceVal}; Profit: NPR ${soldRecord.profit}` }]
    };
    setRepairs([deviceInvoice, ...repairs]);
    resetDeviceForm('sell');
    setDeviceTradeTab('sell');
    alert(`Sale saved. Purchase: NPR ${purchasePriceVal} | Sale: NPR ${salePriceVal} | Profit: NPR ${soldRecord.profit}`);
  };

  const generateDevicePurchaseBill = (dev) => {
    const bill = {
      id: `PUR-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: dev.partyName || 'Seller / Party',
      phone: dev.partyPhone || 'N/A',
      citizenshipNo: dev.citizenshipNo || '',
      customerPhoto: '',
      citizenshipPhoto: dev.citizenshipPhoto || '',
      deviceType: dev.deviceCategory || 'Device Purchase',
      model: `${dev.brandModel || 'Device'} (IMEI/S: ${dev.imeiOrSerial || 'N/A'})`,
      totalCost: Number(dev.buyPrice || 0),
      paidAmount: Number(dev.buyPrice || 0),
      dueAmount: 0,
      issue: 'Purchase / Buy Record',
      warrantyMonths: dev.warrantyMonths || '',
      status: 'Paid',
      dateTime: getCurrentDateTime(),
      billType: 'Device Purchase',
      linkedPurchaseId: dev.id,
      purchasePrice: Number(dev.buyPrice || 0),
      items: [{ name: `${dev.deviceCategory || 'Device'} - ${dev.brandModel || ''} [IMEI: ${dev.imeiOrSerial || 'N/A'}]`, price: Number(dev.buyPrice || 0), qty: 1, remarks: `Purchased from: ${dev.partyName || 'N/A'}; Condition: ${dev.condition || 'N/A'}` }]
    };
    setRepairs([bill, ...repairs]);
    setSelectedInvoice(bill);
  };

  const restoreDeviceSale = (saleId) => {
    const sale = devicesStock.find(d => d.id === saleId);
    if (!sale || sale.tradeType !== 'sell' || !sale.linkedPurchaseId) return;
    if (!window.confirm(`Restore ${sale.brandModel || 'this device'} to In Stock? This will remove the sale record and its sale bill.`)) return;
    setDevicesStock(devicesStock.filter(d => d.id !== saleId).map(d => d.id === sale.linkedPurchaseId ? { ...d, status: 'In Stock', soldDate: '', soldRecordId: '' } : d));
    setRepairs(repairs.filter(r => !(r.billType === 'Device Sale' && r.linkedPurchaseId === sale.linkedPurchaseId)));
    setDeviceTradeTab('buy');
    alert('Sale restored. Device is back In Stock.');
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

    const requested = {};
    posBill.items.forEach(item => {
      const key = String(item.name || '').trim().toLowerCase();
      if (key) requested[key] = (requested[key] || 0) + Number(item.qty || 1);
    });
    for (const [key, qty] of Object.entries(requested)) {
      const inv = inventory.find(i => String(i.name || '').trim().toLowerCase() === key);
      if (!inv) { alert(`Stock item not found: ${key}`); return; }
      if (Number(inv.stock || 0) < qty) { alert(`Insufficient stock for ${inv.name}. Available: ${inv.stock}, requested: ${qty}`); return; }
    }
    const updatedInventory = inventory.map(inv => {
      const key = String(inv.name || '').trim().toLowerCase();
      return requested[key] ? { ...inv, stock: Number(inv.stock || 0) - requested[key] } : inv;
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

  const generatePartsPurchaseBill = (pur) => {
    const bill = {
      id: `SPB-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: pur.supplierName || 'Supplier / Party',
      phone: pur.supplierPhone || 'N/A',
      citizenshipNo: '', customerPhoto: '', citizenshipPhoto: '',
      deviceType: 'Parts Purchase', model: pur.partName || 'Parts / Stock',
      totalCost: Number(pur.total || 0), paidAmount: Number(pur.total || 0), dueAmount: 0,
      issue: 'Parts / Stock Purchase', warrantyMonths: '', status: 'Paid', dateTime: getCurrentDateTime(),
      billType: 'Parts Purchase', linkedStockPurchaseId: pur.id,
      items: [{ name: pur.partName || 'Part', price: Number(pur.unitCost || 0), qty: Number(pur.qty || 1), remarks: `Purchased from: ${pur.supplierName || 'N/A'}${pur.invoiceNo ? `; Supplier Bill: ${pur.invoiceNo}` : ''}` }]
    };
    setRepairs([bill, ...repairs]);
    setSelectedInvoice(bill);
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
    
    if (invoiceFilterTab === 'Repair') return matchesSearch && r.billType !== 'Accessories' && r.billType !== 'Device Sale' && r.billType !== 'Device Purchase';
    if (invoiceFilterTab === 'Accessories') return matchesSearch && r.billType === 'Accessories';
    if (invoiceFilterTab === 'Devices') return matchesSearch && (r.billType === 'Device Sale' || r.billType === 'Device Purchase');
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
                <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${t.textMain}`}>{(() => { const h = new Date(clockTick).getHours(); const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Good night'; return `${greeting}, manage the shop faster.`; })()}</h2>
                 <p className={`text-sm ${t.textMuted} mt-1`}>{new Date(clockTick).toLocaleString('en-NP', { dateStyle: 'full', timeStyle: 'medium' })}</p>
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
                <h3 className="text-3xl font-black text-amber-400">{repairs.filter(r => String(r.dateTime || '').startsWith(getLocalDateKey())).length}</h3>
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

        {/* EXPENSES TAB (Enhanced with features while preserving all core code) */}
        {activeTab === 'expenses' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className={`text-sm uppercase tracking-wider font-black ${t.textMuted}`}>Shop Ledger</p>
                <h2 className={`text-2xl font-black ${t.textMain}`}>Expense Management & Tracking</h2>
                <p className={`text-sm ${t.textMuted} mt-1`}>Record rent, bills, utility, parts purchase expenses and filter easily.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    const printWin = window.open('', '_blank');
                    const expHtml = expenses.map(e => `<tr><td>${e.date}</td><td>${e.description}</td><td>${e.category || 'General'}</td><td>NPR ${e.amount}</td></tr>`).join('');
                    printWin.document.write(`<html><head><title>Expenses Report</title></head><body style="font-family:sans-serif;padding:20px;"><h2>${shopInfo.name} - Expenses Report</h2><table border="1" cellpadding="8" style="border-collapse:collapse;width:100%;"><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th></tr>${expHtml}</table></body></html>`);
                    printWin.document.close();
                    printWin.print();
                  }}
                  className={`px-4 py-2.5 rounded-2xl border ${t.border} ${t.cardSecondary} text-sm font-bold flex items-center gap-2 hover:bg-blue-600/10`}
                >
                  <Printer size={16}/> Print Report
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-5 shadow-xl`}>
                <p className={`text-sm uppercase tracking-wider font-black ${t.textMuted}`}>Total Expenses Recorded</p>
                <p className="text-3xl font-black text-rose-400 mt-2">NPR {totalExp}</p>
                <p className={`text-sm ${t.textMuted} mt-1`}>All-time recorded shop outflows</p>
              </div>
              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-5 shadow-xl`}>
                <p className={`text-sm uppercase tracking-wider font-black ${t.textMuted}`}>Today's Expenses</p>
                <p className="text-3xl font-black text-amber-400 mt-2">NPR {todayExpense}</p>
                <p className={`text-sm ${t.textMuted} mt-1`}>Outflows recorded today ({todayKey})</p>
              </div>
              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-5 shadow-xl`}>
                <p className={`text-sm uppercase tracking-wider font-black ${t.textMuted}`}>Expense Categories</p>
                <p className="text-3xl font-black text-blue-400 mt-2">{new Set(expenses.map(e => e.category || 'General')).size}</p>
                <p className={`text-sm ${t.textMuted} mt-1`}>Active expense types</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-6 shadow-xl`}>
                <h3 className={`text-lg font-black ${t.textMain} mb-4`}>{editingExpenseId ? 'Edit Expense Record' : 'Add New Expense'}</h3>
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div>
                    <label className={`text-xs uppercase tracking-wider font-bold ${t.textMuted} block mb-1.5`}>Category</label>
                    <select 
                      value={newExpense.category} 
                      onChange={e => setNewExpense({...newExpense, category: e.target.value})} 
                      className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none focus:border-blue-500`}
                    >
                      <option value="General">General Expense</option>
                      <option value="Shop Rent">Shop Rent</option>
                      <option value="Electricity / Utilities">Electricity / Utilities</option>
                      <option value="Parts Purchase">Parts Purchase</option>
                      <option value="Device Purchase">Device Purchase</option>
                      <option value="Salary / Staff">Salary / Staff</option>
                      <option value="Food & Tea">Food & Tea</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label className={`text-xs uppercase tracking-wider font-bold ${t.textMuted} block mb-1.5`}>Description</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Monthly Electricity Bill / Tea Shop" 
                      value={newExpense.description} 
                      onChange={e => setNewExpense({...newExpense, description: e.target.value})} 
                      className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none focus:border-blue-500`} 
                    />
                  </div>

                  {newExpense.category === 'Parts Purchase' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`text-xs uppercase tracking-wider font-bold ${t.textMuted} block mb-1.5`}>Quantity</label>
                        <input 
                          type="number" 
                          placeholder="Qty" 
                          value={newExpense.quantity} 
                          onChange={e => setNewExpense({...newExpense, quantity: e.target.value})} 
                          className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none focus:border-blue-500`} 
                        />
                      </div>
                      <div>
                        <label className={`text-xs uppercase tracking-wider font-bold ${t.textMuted} block mb-1.5`}>Unit Cost (NPR)</label>
                        <input 
                          type="number" 
                          placeholder="Cost" 
                          value={newExpense.unitCost} 
                          onChange={e => setNewExpense({...newExpense, unitCost: e.target.value})} 
                          className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none focus:border-blue-500`} 
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className={`text-xs uppercase tracking-wider font-bold ${t.textMuted} block mb-1.5`}>Amount (NPR)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 1500" 
                        value={newExpense.amount} 
                        onChange={e => setNewExpense({...newExpense, amount: e.target.value})} 
                        className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none focus:border-blue-500`} 
                      />
                    </div>
                  )}

                  <div>
                    <label className={`text-xs uppercase tracking-wider font-bold ${t.textMuted} block mb-1.5`}>Date</label>
                    <input 
                      type="date" 
                      value={newExpense.date} 
                      onChange={e => setNewExpense({...newExpense, date: e.target.value})} 
                      className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none focus:border-blue-500`} 
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/30 transition">
                      {editingExpenseId ? 'Update Expense' : 'Save Expense'}
                    </button>
                    {editingExpenseId && (
                      <button 
                        type="button" 
                        onClick={() => { setEditingExpenseId(null); setNewExpense({ description: '', amount: '', category: 'General', itemName: '', quantity: '', unitCost: '', supplierName: '', supplierPhone: '', invoiceNo: '', paymentMethod: 'Cash', notes: '', date: todayKey }); }}
                        className={`px-4 py-3 border ${t.border} rounded-2xl text-sm font-bold`}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-6 shadow-xl lg:col-span-2 flex flex-col`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <h3 className={`text-lg font-black ${t.textMain}`}>Expense History</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className={`flex items-center gap-2 ${t.inputBg} border ${t.border} rounded-xl px-3 py-1.5`}>
                      <Search size={14} className={t.textMuted} />
                      <input 
                        type="text" 
                        placeholder="Search description..." 
                        value={expenseSearch} 
                        onChange={e => setExpenseSearch(e.target.value)} 
                        className="bg-transparent outline-none text-xs w-32 sm:w-44" 
                      />
                    </div>
                    <select 
                      value={expenseFilterCategory} 
                      onChange={e => setExpenseFilterCategory(e.target.value)} 
                      className={`px-3 py-1.5 ${t.inputBg} border rounded-xl text-xs font-bold outline-none`}
                    >
                      <option value="All">All Categories</option>
                      <option value="Shop Rent">Shop Rent</option>
                      <option value="Electricity / Utilities">Utilities</option>
                      <option value="Parts Purchase">Parts Purchase</option>
                      <option value="Device Purchase">Device Purchase</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-sm">
                    <thead className={`${t.tableHeader} font-bold uppercase text-xs border-b`}>
                      <tr>
                        <th className="pb-3 text-left">Date</th>
                        <th className="pb-3 text-left">Description</th>
                        <th className="pb-3 text-left">Category</th>
                        <th className="pb-3 text-right">Amount (NPR)</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${t.tableDivide}`}>
                      {expenses
                        .filter(e => {
                          const matchesSearch = String(e.description || '').toLowerCase().includes(expenseSearch.toLowerCase());
                          const matchesCat = expenseFilterCategory === 'All' || (e.category || 'General') === expenseFilterCategory;
                          return matchesSearch && matchesCat;
                        })
                        .map(exp => (
                          <tr key={exp.id} className="hover:bg-blue-600/5 transition">
                            <td className={`py-3.5 text-xs ${t.textMuted}`}>{exp.date}</td>
                            <td className={`py-3.5 font-bold ${t.textMain}`}>{exp.description}</td>
                            <td className="py-3.5">
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                {exp.category || 'General'}
                              </span>
                            </td>
                            <td className="py-3.5 text-right font-black text-rose-400">NPR {exp.amount}</td>
                            <td className="py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button 
                                  onClick={() => {
                                    setEditingExpenseId(exp.id);
                                    setNewExpense({
                                      description: exp.description || '',
                                      amount: exp.amount || '',
                                      category: exp.category || 'General',
                                      itemName: exp.itemName || '',
                                      quantity: exp.quantity || '',
                                      unitCost: exp.unitCost || '',
                                      supplierName: exp.supplierName || '',
                                      supplierPhone: exp.supplierPhone || '',
                                      invoiceNo: exp.invoiceNo || '',
                                      paymentMethod: exp.paymentMethod || 'Cash',
                                      notes: exp.notes || '',
                                      date: exp.date || todayKey
                                    });
                                  }} 
                                  className="p-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition"
                                  title="Edit"
                                >
                                  <Pencil size={13}/>
                                </button>
                                <button 
                                  onClick={() => deleteExpense(exp.id)} 
                                  className="p-1.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 rounded-lg transition"
                                  title="Delete"
                                >
                                  <Trash2 size={13}/>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {expenses.length === 0 && (
                        <tr>
                          <td colSpan="5" className={`py-12 text-center text-sm ${t.textMuted}`}>No expenses recorded yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INVENTORY / PARTS STOCK TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className={`text-xl font-bold ${t.textMain}`}>Parts Stock & Inventory Management</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <form onSubmit={handleAddPart} className={`${t.cardBg} border ${t.border} p-6 rounded-3xl space-y-4 shadow-xl`}>
                <h3 className={`text-base font-bold ${t.textMain}`}>{editingPartId ? 'Edit Part Item' : 'Add New Part / Item'}</h3>
                <div>
                  <label className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1">Category</label>
                  <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <input type="text" placeholder="Part Name (e.g. iPhone 13 Screen)" value={newPart.name} onChange={e => setNewPart({...newPart, name: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Initial Stock" value={newPart.stock} onChange={e => setNewPart({...newPart, stock: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                  <input type="number" placeholder="Min Alert Stock" value={newPart.minStock} onChange={e => setNewPart({...newPart, minStock: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Cost Price (NPR)" value={newPart.costPrice} onChange={e => setNewPart({...newPart, costPrice: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                  <input type="number" placeholder="Selling Price (NPR)" value={newPart.price} onChange={e => setNewPart({...newPart, price: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/30">
                  {editingPartId ? 'Update Part' : 'Add to Inventory'}
                </button>
              </form>

              <div className={`${t.cardBg} border ${t.border} p-6 rounded-3xl shadow-xl lg:col-span-2`}>
                <h3 className={`text-base font-bold ${t.textMain} mb-4`}>Parts Stock Inventory</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={`${t.tableHeader} font-bold uppercase text-sm border-b`}>
                      <tr>
                        <th className="pb-3 text-left">Part Name</th>
                        <th className="pb-3 text-left">Category</th>
                        <th className="pb-3 text-center">Stock</th>
                        <th className="pb-3 text-right">Cost Price</th>
                        <th className="pb-3 text-right">Selling Price</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${t.tableDivide}`}>
                      {inventory.map(item => {
                        const isLow = Number(item.stock || 0) <= Number(item.minStock || 5);
                        return (
                          <tr key={item.id}>
                            <td className={`py-3.5 font-bold ${t.textMain}`}>{item.name}</td>
                            <td className={`py-3.5 ${t.textMuted}`}>{item.category}</td>
                            <td className="py-3.5 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isLow ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {item.stock} units
                              </span>
                            </td>
                            <td className={`py-3.5 text-right ${t.textMuted}`}>NPR {item.costPrice}</td>
                            <td className="py-3.5 text-right font-bold text-blue-400">NPR {item.price}</td>
                            <td className="py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button onClick={() => adjustStock(item.id, 1)} className="px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded-lg text-xs font-bold" title="Add 1 Stock">+</button>
                                <button onClick={() => adjustStock(item.id, -1)} className="px-2 py-1 bg-amber-600/20 text-amber-400 rounded-lg text-xs font-bold" title="Reduce 1 Stock">-</button>
                                <button onClick={() => { setEditingPartId(item.id); setSelectedCategory(item.category); setNewPart({ name: item.name, stock: item.stock, costPrice: item.costPrice, price: item.price, minStock: item.minStock || 5, supplierName: item.supplierName || '', supplierPhone: item.supplierPhone || '', purchaseDate: item.lastPurchaseDate || todayKey }); }} className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg" title="Edit"><Pencil size={13}/></button>
                                <button onClick={() => deletePart(item.id)} className="p-1.5 bg-rose-600/20 text-rose-400 rounded-lg" title="Delete"><Trash2 size={13}/></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DEVICE BUY / SELL TAB */}
        {activeTab === 'devices' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className={`text-xl font-bold ${t.textMain}`}>Second-Hand Device Trading & Inventory</h2>
                <p className={`text-sm ${t.textMuted} mt-0.5`}>Buy second-hand devices, record multiple IMEIs, and sell with profit tracking.</p>
              </div>
              <div className={`flex rounded-2xl p-1 border ${t.border} ${t.cardSecondary}`}>
                <button onClick={() => { setDeviceTradeTab('buy'); resetDeviceForm('buy'); }} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${deviceTradeTab === 'buy' ? 'bg-blue-600 text-white shadow' : `${t.textMuted} hover:text-white`}`}>Buy Device</button>
                <button onClick={() => { setDeviceTradeTab('sell'); resetDeviceForm('sell'); }} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${deviceTradeTab === 'sell' ? 'bg-emerald-600 text-white shadow' : `${t.textMuted} hover:text-white`}`}>Sell Device</button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <form onSubmit={handleAddDevice} className={`${t.cardBg} border ${t.border} p-6 rounded-3xl space-y-4 shadow-xl`}>
                <h3 className={`text-base font-bold ${t.textMain}`}>{editingDeviceId ? 'Edit Record' : deviceTradeTab === 'buy' ? 'Record Device Purchase (Buy)' : 'Sell From Stock'}</h3>
                
                {deviceTradeTab === 'buy' && (
                  <div className="space-y-4">
                    <select value={newDevice.deviceCategory} onChange={e => setNewDevice({...newDevice, deviceCategory: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}>
                      <option value="Second-Hand Phone">Second-Hand Phone</option>
                      <option value="Second-Hand Laptop">Second-Hand Laptop</option>
                      <option value="Tablet / iPad">Tablet / iPad</option>
                    </select>

                    <input type="text" placeholder="Brand & Model (e.g. iPhone 12 Pro 128GB)" value={newDevice.brandModel} onChange={e => setNewDevice({...newDevice, brandModel: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs uppercase tracking-wider font-bold text-slate-400">IMEI / Serial Number(s)</label>
                        <button type="button" onClick={addDeviceImeiField} className="text-xs font-bold text-blue-400 hover:text-blue-300">+ Add another IMEI</button>
                      </div>
                      <div className="space-y-2">
                        {(newDevice.imeiList?.length ? newDevice.imeiList : [newDevice.imeiOrSerial || '']).map((imei, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              type="text"
                              placeholder={`IMEI / Serial #${idx + 1}`}
                              value={imei}
                              onChange={e => updateDeviceImeiField(idx, e.target.value)}
                              className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
                            />
                            {idx > 0 && (
                              <button type="button" onClick={() => removeDeviceImeiField(idx)} className="px-3 bg-rose-600/20 text-rose-400 rounded-2xl text-xs font-bold hover:bg-rose-600/30">✕</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <input type="text" placeholder="Condition (e.g. Good, Battery 88%, Minor scratch)" value={newDevice.condition} onChange={e => setNewDevice({...newDevice, condition: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />

                    <CustomerAutocomplete
                      value={newDevice.partyName}
                      onChange={val => setNewDevice({...newDevice, partyName: val})}
                      onSelect={cust => handleCustomerSelect(cust, 'device')}
                      customers={uniqueCustomers}
                      placeholder="Seller Name (e.g. Bikash Thapa)"
                      className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
                    />

                    <input type="text" placeholder="Seller Phone" value={newDevice.partyPhone} onChange={e => setNewDevice({...newDevice, partyPhone: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                    <input type="text" placeholder="Citizenship No (Optional)" value={newDevice.citizenshipNo} onChange={e => setNewDevice({...newDevice, citizenshipNo: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />

                    <div className="grid grid-cols-2 gap-3">
                      <input type="number" placeholder="Buy Price (NPR)" value={newDevice.buyPrice} onChange={e => setNewDevice({...newDevice, buyPrice: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                      <input type="number" placeholder="Expected Sell Price" value={newDevice.sellPrice} onChange={e => setNewDevice({...newDevice, sellPrice: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                    </div>

                    <input type="text" placeholder="Warranty (e.g. 1 Month Shop Warranty)" value={newDevice.warrantyMonths} onChange={e => setNewDevice({...newDevice, warrantyMonths: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                  </div>
                )}

                {deviceTradeTab === 'sell' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1">Select In-Stock Device to Sell</label>
                      <select value={selectedPurchaseId} onChange={e => {
                        setSelectedPurchaseId(e.target.value);
                        const found = devicesStock.find(d => d.id === e.target.value);
                        if (found) setNewDevice(prev => ({ ...prev, sellPrice: found.sellPrice || '', warrantyMonths: found.warrantyMonths || '' }));
                      }} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}>
                        <option value="">-- Choose Device from Stock --</option>
                        {devicesStock.filter(d => (d.tradeType || 'buy') === 'buy' && d.status === 'In Stock').map(d => (
                          <option key={d.id} value={d.id}>
                            {d.brandModel} (IMEI: {d.imeiOrSerial}) - Buy: {d.buyPrice}
                          </option>
                        ))}
                      </select>
                    </div>

                    <CustomerAutocomplete
                      value={newDevice.partyName}
                      onChange={val => setNewDevice({...newDevice, partyName: val})}
                      onSelect={cust => handleCustomerSelect(cust, 'device')}
                      customers={uniqueCustomers}
                      placeholder="Customer Name (Buyer)"
                      className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
                    />

                    <input type="text" placeholder="Customer Phone" value={newDevice.partyPhone} onChange={e => setNewDevice({...newDevice, partyPhone: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                    <input type="number" placeholder="Final Selling Price (NPR)" value={newDevice.sellPrice} onChange={e => setNewDevice({...newDevice, sellPrice: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                    <input type="text" placeholder="Warranty (e.g. 1 Month Warranty)" value={newDevice.warrantyMonths} onChange={e => setNewDevice({...newDevice, warrantyMonths: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                  </div>
                )}

                <button type="submit" className={`w-full py-3 text-white rounded-2xl font-bold text-sm shadow-lg ${deviceTradeTab === 'buy' ? 'bg-blue-600 shadow-blue-600/30' : 'bg-emerald-600 shadow-emerald-600/30'}`}>
                  {editingDeviceId ? 'Update Record' : deviceTradeTab === 'buy' ? 'Save Purchase & Stock' : 'Complete Sale & Bill'}
                </button>
              </form>

              <div className={`${t.cardBg} border ${t.border} p-6 rounded-3xl shadow-xl lg:col-span-2`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-base font-bold ${t.textMain}`}>Device Trading Stock & History</h3>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold">In Stock: {devicesStock.filter(d => (d.tradeType || 'buy') === 'buy' && d.status === 'In Stock').length}</span>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold">Sold: {devicesStock.filter(d => d.tradeType === 'sell').length}</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={`${t.tableHeader} font-bold uppercase text-sm border-b`}>
                      <tr>
                        <th className="pb-3 text-left">Device / Model</th>
                        <th className="pb-3 text-left">IMEI / S.N.</th>
                        <th className="pb-3 text-left">Party / Status</th>
                        <th className="pb-3 text-right">Buy / Sell</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${t.tableDivide}`}>
                      {devicesStock.map(dev => {
                        const isSell = dev.tradeType === 'sell';
                        return (
                          <tr key={dev.id}>
                            <td className={`py-3.5 font-bold ${t.textMain}`}>
                              {dev.brandModel}
                              <div className={`text-xs ${t.textMuted} font-normal`}>{dev.deviceCategory}</div>
                            </td>
                            <td className="py-3.5 font-mono text-xs text-blue-400">{dev.imeiOrSerial || 'N/A'}</td>
                            <td className="py-3.5">
                              <div className={`font-medium ${t.textMain}`}>{dev.partyName}</div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isSell ? 'bg-emerald-500/20 text-emerald-400' : dev.status === 'Sold' ? 'bg-slate-500/20 text-slate-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                {isSell ? 'Sold Record' : dev.status}
                              </span>
                            </td>
                            <td className="py-3.5 text-right font-bold">
                              {isSell ? (
                                <span className="text-emerald-400">NPR {dev.sellPrice} <span className="text-xs block text-slate-400">Profit: +{dev.profit}</span></span>
                              ) : (
                                <span className="text-blue-400">NPR {dev.buyPrice}</span>
                              )}
                            </td>
                            <td className="py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {!isSell && dev.status === 'In Stock' && (
                                  <button onClick={() => generateDevicePurchaseBill(dev)} className="px-2 py-1 bg-amber-600/20 text-amber-400 rounded-lg text-xs font-bold" title="Generate Purchase Bill">Bill</button>
                                )}
                                {isSell && (
                                  <button onClick={() => restoreDeviceSale(dev.id)} className="px-2 py-1 bg-amber-600/20 text-amber-400 rounded-lg text-xs font-bold" title="Restore to In Stock">Restore</button>
                                )}
                                <button onClick={() => deleteDevice(dev.id)} className="p-1.5 bg-rose-600/20 text-rose-400 rounded-lg" title="Delete"><Trash2 size={13}/></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACCESSORIES BILL (POS) TAB */}
        {activeTab === 'pos' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className={`text-xl font-bold ${t.textMain}`}>Direct Store Bill / Accessories POS</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <form onSubmit={handleSavePosBill} className={`${t.cardBg} border ${t.border} p-6 rounded-3xl space-y-4 shadow-xl lg:col-span-2`}>
                <h3 className={`text-base font-bold ${t.textMain}`}>Create Retail / Accessory Bill</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CustomerAutocomplete
                    value={posBill.customerName}
                    onChange={val => setPosBill({...posBill, customerName: val})}
                    onSelect={cust => handleCustomerSelect(cust, 'pos')}
                    customers={uniqueCustomers}
                    placeholder="Customer Name"
                    className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
                  />
                  <input type="text" placeholder="Customer Phone" value={posBill.phone} onChange={e => setPosBill({...posBill, phone: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-wider font-bold text-slate-400">Bill Items & Parts</label>
                    <button type="button" onClick={handleAddPosItem} className="text-xs font-bold text-blue-400 hover:text-blue-300">+ Add Item</button>
                  </div>
                  {posBill.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input type="text" list="inventory-items" placeholder="Item Name / Part" value={item.name} onChange={e => handlePosItemChange(index, 'name', e.target.value)} className={`flex-1 p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                      <datalist id="inventory-items">
                        {inventory.map(i => <option key={i.id} value={i.name} />)}
                      </datalist>
                      <input type="number" placeholder="Qty" value={item.qty} onChange={e => handlePosItemChange(index, 'qty', e.target.value)} className={`w-20 p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                      <input type="number" placeholder="Price" value={item.price} onChange={e => handlePosItemChange(index, 'price', e.target.value)} className={`w-28 p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                      {posBill.items.length > 1 && (
                        <button type="button" onClick={() => handleRemovePosItem(index)} className="p-3 bg-rose-600/20 text-rose-400 rounded-2xl"><Trash2 size={15}/></button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <input type="number" placeholder="Paid Amount (NPR)" value={posBill.paidAmount} onChange={e => setPosBill({...posBill, paidAmount: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                  <input type="text" placeholder="Warranty (e.g. 1 Year Warranty)" value={posBill.warrantyMonths} onChange={e => setPosBill({...posBill, warrantyMonths: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                </div>

                <button type="submit" className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/30">
                  Save & Print Bill
                </button>
              </form>

              <div className={`${t.cardBg} border ${t.border} p-6 rounded-3xl shadow-xl`}>
                <h3 className={`text-base font-bold ${t.textMain} mb-3`}>Quick Summary</h3>
                <div className={`${t.cardSecondary} border ${t.border} p-4 rounded-2xl space-y-3`}>
                  <div className="flex justify-between text-sm">
                    <span className={t.textMuted}>Total Items:</span>
                    <span className={`font-bold ${t.textMain}`}>{posBill.items.reduce((sum, i) => sum + Number(i.qty || 1), 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={t.textMuted}>Total Amount:</span>
                    <span className="font-bold text-blue-400">NPR {posBill.items.reduce((sum, i) => sum + (Number(i.price || 0) * Number(i.qty || 1)), 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INVOICES & JOB SHEETS TAB */}
        {activeTab === 'invoices' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className={`text-xl font-bold ${t.textMain}`}>Invoices, Job Sheets & Bills</h2>
                <p className={`text-sm ${t.textMuted} mt-0.5`}>Search, preview, print, and share bills via WhatsApp.</p>
              </div>
              <div className={`flex items-center gap-2 ${t.inputBg} border ${t.border} rounded-2xl px-3 py-2 w-full sm:w-80`}>
                <Search size={16} className={t.textMuted} />
                <input type="text" placeholder="Search by customer, phone, bill ID..." value={invoiceSearch} onChange={e => setInvoiceSearch(e.target.value)} className="bg-transparent outline-none text-sm w-full" />
              </div>
            </div>

            <div className={`flex gap-1.5 overflow-x-auto pb-2`}>
              {['All', 'Repair', 'Accessories', 'Devices', 'Due', 'Paid'].map(tab => (
                <button key={tab} onClick={() => setInvoiceFilterTab(tab)} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${invoiceFilterTab === tab ? 'bg-blue-600 text-white shadow' : `${t.cardSecondary} ${t.textMuted} hover:text-white border ${t.border}`}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={`${t.tableHeader} font-bold uppercase text-sm border-b`}>
                    <tr>
                      <th className="py-4 px-4 text-left">Bill ID</th>
                      <th className="py-4 px-4 text-left">Customer</th>
                      <th className="py-4 px-4 text-left">Type / Model</th>
                      <th className="py-4 px-4 text-left">Total</th>
                      <th className="py-4 px-4 text-left">Due</th>
                      <th className="py-4 px-4 text-left">Status</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.tableDivide}`}>
                    {filteredInvoices.map(inv => {
                      const isPaid = Number(inv.dueAmount || 0) <= 0;
                      return (
                        <tr key={inv.id} className="hover:bg-blue-600/5 transition">
                          <td className="py-4 px-4 font-mono font-bold text-blue-400">{inv.id}</td>
                          <td className="py-4 px-4">
                            <div className={`font-bold ${t.textMain}`}>{inv.customerName}</div>
                            <div className={`text-xs ${t.textMuted}`}>{inv.phone}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className={`font-medium ${t.textMain}`}>{inv.model}</div>
                            <div className={`text-xs ${t.textMuted}`}>{inv.billType || inv.deviceType}</div>
                          </td>
                          <td className={`py-4 px-4 font-bold ${t.textMain}`}>NPR {inv.totalCost}</td>
                          <td className="py-4 px-4 font-bold text-rose-400">NPR {inv.dueAmount}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isPaid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                              {isPaid ? 'Paid' : 'Due'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => setSelectedInvoice(inv)} className="p-2 bg-blue-600/20 text-blue-400 rounded-xl" title="Preview"><Eye size={14}/></button>
                              <button onClick={() => printInvoice(inv)} className="p-2 bg-slate-600/20 text-slate-300 rounded-xl" title="Print"><Printer size={14}/></button>
                              <button onClick={() => sendToWhatsApp(inv)} className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl" title="WhatsApp"><MessageSquare size={14}/></button>
                              <button onClick={() => deleteRepair(inv.id)} className="p-2 bg-rose-600/20 text-rose-400 rounded-xl" title="Delete"><Trash2 size={14}/></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* JOB SHEETS TAB */}
        {activeTab === 'repairs' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className={`text-xl font-bold ${t.textMain}`}>Repair & Unlocking Job Sheets</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <form onSubmit={handleAddRepair} className={`${t.cardBg} border ${t.border} p-6 rounded-3xl space-y-4 shadow-xl`}>
                <h3 className={`text-base font-bold ${t.textMain}`}>Create New Job Sheet</h3>
                <CustomerAutocomplete
                  value={newRepair.customerName}
                  onChange={val => setNewRepair({...newRepair, customerName: val})}
                  onSelect={cust => handleCustomerSelect(cust, 'repair')}
                  customers={uniqueCustomers}
                  placeholder="Customer Name"
                  className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
                />
                <input type="text" placeholder="Customer Phone" value={newRepair.phone} onChange={e => setNewRepair({...newRepair, phone: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                <select value={newRepair.deviceType} onChange={e => setNewRepair({...newRepair, deviceType: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}>
                  <option value="Mobile (Unlock)">Mobile (Unlock)</option>
                  <option value="Laptop Repair">Laptop Repair</option>
                  <option value="Computer / Desktop">Computer / Desktop</option>
                  <option value="Tablet / iPad">Tablet / iPad</option>
                </select>
                <input type="text" placeholder="Device Model (e.g. iPhone 13 Pro / Dell Inspiron)" value={newRepair.model} onChange={e => setNewRepair({...newRepair, model: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                <textarea placeholder="Issue Description / Unlocking Details" value={newRepair.issue} onChange={e => setNewRepair({...newRepair, issue: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none h-24`} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Total Cost (NPR)" value={newRepair.totalCost} onChange={e => setNewRepair({...newRepair, totalCost: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                  <input type="number" placeholder="Paid Advance" value={newRepair.paidAmount} onChange={e => setNewRepair({...newRepair, paidAmount: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                </div>
                <input type="text" placeholder="Warranty (e.g. 1 Month Repair Warranty)" value={newRepair.warrantyMonths} onChange={e => setNewRepair({...newRepair, warrantyMonths: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/30">
                  Save Job Sheet
                </button>
              </form>

              <div className={`${t.cardBg} border ${t.border} p-6 rounded-3xl shadow-xl lg:col-span-2`}>
                <h3 className={`text-base font-bold ${t.textMain} mb-4`}>Active Repair Job Sheets</h3>
                <div className="space-y-3">
                  {repairs.filter(r => r.billType === 'Repair').map(job => (
                    <div key={job.id} className={`${t.cardSecondary} border ${t.border} p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-400">{job.id}</span>
                          <span className="text-xs text-slate-400">{job.dateTime}</span>
                        </div>
                        <h4 className={`font-bold ${t.textMain} mt-1`}>{job.customerName} ({job.phone})</h4>
                        <p className={`text-xs ${t.textMuted} mt-0.5`}>{job.model} — {job.issue}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <select value={job.status} onChange={e => updateJobStatus(job.id, e.target.value)} className={`p-2 ${t.inputBg} border rounded-xl text-xs font-bold outline-none`}>
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Ready for Pickup">Ready for Pickup</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                        <button onClick={() => setSelectedInvoice(job)} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">View</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BACKUP TAB */}
        {activeTab === 'backup' && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto text-center py-10">
            <div className={`p-8 ${t.cardBg} border ${t.border} rounded-3xl shadow-xl space-y-6`}>
              <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center">
                <Download size={32} />
              </div>
              <div>
                <h2 className={`text-2xl font-black ${t.textMain}`}>Backup & Restore Data</h2>
                <p className={`text-sm ${t.textMuted} mt-1`}>Safeguard all your shop records, invoices, inventory, and customer lists.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <button onClick={exportData} className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2">
                  <Download size={16}/> Download Backup JSON
                </button>
                <label className="px-6 py-3.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-bold text-sm cursor-pointer flex items-center justify-center gap-2">
                  <Upload size={16}/> Restore Backup
                  <input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl mx-auto">
            <div className={`p-8 ${t.cardBg} border ${t.border} rounded-3xl shadow-xl space-y-6`}>
              <h2 className={`text-xl font-bold ${t.textMain}`}>Shop Profile & Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1">Shop Name</label>
                  <input type="text" value={shopInfo.name} onChange={e => setShopInfo({...shopInfo, name: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1">Tagline</label>
                  <input type="text" value={shopInfo.tagline} onChange={e => setShopInfo({...shopInfo, tagline: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1">Address</label>
                  <input type="text" value={shopInfo.address} onChange={e => setShopInfo({...shopInfo, address: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1">Phone Number</label>
                    <input type="text" value={shopInfo.phone} onChange={e => setShopInfo({...shopInfo, phone: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1">PAN No</label>
                    <input type="text" value={shopInfo.panNo} onChange={e => setShopInfo({...shopInfo, panNo: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-2">Select Theme Style</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'dim', name: 'Dim Gray', bg: 'bg-[#181B22]' },
                      { id: 'dark', name: 'Pure Dark', bg: 'bg-[#0B0F17]' },
                      { id: 'light', name: 'Clean Light', bg: 'bg-slate-200' },
                    ].map(thm => (
                      <button key={thm.id} onClick={() => setTheme(thm.id)} className={`p-4 rounded-2xl border text-center font-bold text-sm transition ${theme === thm.id ? 'border-blue-500 bg-blue-600/20 text-blue-400' : 'border-slate-700 text-slate-400 hover:text-white'}`}>
                        <div className={`w-6 h-6 rounded-full ${thm.bg} mx-auto mb-2 border border-slate-600`} />
                        {thm.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Invoice Modal Preview */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className={`${t.cardBg} border ${t.border} max-w-2xl w-full rounded-3xl p-6 shadow-2xl relative space-y-6 my-8`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-700">
              <div>
                <h3 className={`text-lg font-black ${t.textMain}`}>Invoice #{selectedInvoice.id}</h3>
                <p className={`text-xs ${t.textMuted}`}>{selectedInvoice.dateTime}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"><X size={18}/></button>
            </div>

            <div className={`${t.cardSecondary} border ${t.border} p-4 rounded-2xl space-y-2 text-sm`}>
              <div className="flex justify-between"><span className={t.textMuted}>Customer:</span><span className={`font-bold ${t.textMain}`}>{selectedInvoice.customerName} ({selectedInvoice.phone})</span></div>
              <div className="flex justify-between"><span className={t.textMuted}>Device / Model:</span><span className={`font-bold ${t.textMain}`}>{selectedInvoice.model}</span></div>
              <div className="flex justify-between"><span className={t.textMuted}>Total Cost:</span><span className="font-bold text-blue-400">NPR {selectedInvoice.totalCost}</span></div>
              <div className="flex justify-between"><span className={t.textMuted}>Amount Paid:</span><span className="font-bold text-emerald-400">NPR {selectedInvoice.paidAmount}</span></div>
              <div className="flex justify-between"><span className={t.textMuted}>Balance Due:</span><span className="font-bold text-rose-400">NPR {selectedInvoice.dueAmount}</span></div>
              {selectedInvoice.warrantyMonths && (
                <div className="flex justify-between"><span className={t.textMuted}>Warranty:</span><span className="font-bold text-amber-400">{selectedInvoice.warrantyMonths}</span></div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button onClick={() => printInvoice(selectedInvoice)} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2">
                <Printer size={16}/> Print Bill
              </button>
              <button onClick={() => downloadInvoiceImage(selectedInvoice)} className={`px-5 py-3 border ${t.border} ${t.cardSecondary} hover:bg-slate-800 rounded-2xl font-bold text-sm flex items-center justify-center gap-2`}>
                <Download size={16}/> Download PNG
              </button>
              <button onClick={() => sendToWhatsApp(selectedInvoice)} className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
                <MessageSquare size={16}/> WhatsApp
              </button>
              {Number(selectedInvoice.dueAmount) > 0 && (
                <button onClick={() => { markInvoiceAsPaid(selectedInvoice.id); setSelectedInvoice(null); }} className="w-full py-3 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-2xl font-bold text-sm">
                  Mark as Paid in Full
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
