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

              {newDevice.tradeType === 'buy' && newDevice.deviceCategory.startsWith('Second-Hand') && (
                <div className={`md:col-span-3 ${t.cardSecondary} border ${t.border} rounded-2xl p-4`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <input type="text" placeholder="Citizenship / Nagarikta No. (optional)" value={newDevice.citizenshipNo || ''} onChange={e => setNewDevice({...newDevice, citizenshipNo: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} />
                    <div>
                      <label className={`text-sm font-bold ${t.textMuted} block mb-2`}>Seller Nagarikta Photo (optional)</label><p className={`text-xs ${t.textMuted} mb-2`}>Stored with this browser backup. Keep sensitive citizenship images protected.</p>
                      <input type="file" accept="image/*" onChange={e => handleDeviceImageUpload(e, 'citizenshipPhoto')} className={`w-full p-2 ${t.inputBg} border rounded-2xl text-sm`} />
                      {newDevice.citizenshipPhoto && <div className="mt-2 flex items-center gap-3"><img src={newDevice.citizenshipPhoto} alt="Citizenship preview" className="h-16 w-24 object-cover rounded-lg border" /><button type="button" onClick={() => setNewDevice(prev => ({...prev, citizenshipPhoto: ''}))} className="text-xs text-rose-400 font-bold">Remove</button></div>}
                    </div>
                  </div>
                </div>
              )}

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
              {editingDeviceId && newDevice.tradeType === 'sell' && <button type="button" onClick={() => restoreDeviceSale(editingDeviceId)} className="md:col-span-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl p-3.5 transition inline-flex items-center justify-center gap-2"><History size={17}/> Restore Sale / Return To Stock</button>}
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
                          <span className={`text-sm font-bold ${dev.status === 'Sold' ? 'text-rose-400' : 'text-blue-400'}`}>{dev.status || 'In Stock'}</span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => {
                            setEditingDeviceId(dev.id);
                            setNewDevice({ tradeType: dev.tradeType || 'buy', deviceCategory: dev.deviceCategory || 'Second-Hand Phone', brandModel: dev.brandModel || '', imeiOrSerial: dev.imeiOrSerial || '', imeiList: getDeviceImeis(dev), condition: dev.condition || '', partyName: dev.partyName || '', partyPhone: dev.partyPhone || '', buyPrice: String(dev.buyPrice ?? ''), sellPrice: String(dev.sellPrice ?? ''), warrantyMonths: dev.warrantyMonths || '', citizenshipNo: dev.citizenshipNo || '', citizenshipPhoto: dev.citizenshipPhoto || '' });
                            setSelectedPurchaseId(dev.linkedPurchaseId || '');
                            setDeviceTradeTab(dev.tradeType || 'buy');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }} className="p-2 bg-amber-500/10 text-amber-400 rounded-xl hover:bg-amber-500/20"><Pencil size={14}/></button>
                          {deviceTradeTab === 'sell' && <button onClick={() => restoreDeviceSale(dev.id)} title="Restore sale / return to stock" className="p-2 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20"><History size={14}/></button>}
                          {deviceTradeTab === 'buy' && <button onClick={() => generateDevicePurchaseBill(dev)} title="Generate purchase bill" className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20"><Printer size={14}/></button>}
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
                  placeholder="Customer Full Name (Optional)"
                  customers={uniqueCustomers}
                  onChange={value => setPosBill(prev => ({ ...prev, customerName: value }))}
                  onSelect={customer => handleCustomerSelect(customer, 'pos')}
                  className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
                />
                <input 
                  type="text" 
                  placeholder="Phone Number" 
                  value={posBill.phone} 
                  onChange={e => setPosBill({...posBill, phone: e.target.value})} 
                  className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} 
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className={`text-sm font-bold ${t.textMain}`}>Bill Items / Accessories</label>
                  <button type="button" onClick={handleAddPosItem} className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl text-xs font-bold flex items-center gap-1">
                    <Plus size={14}/> Add Item
                  </button>
                </div>

                {posBill.items.map((item, index) => (
                  <div key={index} className={`flex flex-col sm:flex-row gap-2 items-center ${t.cardSecondary} p-3 rounded-2xl border ${t.border}`}>
                    <select
                      value={item.name}
                      onChange={e => handlePosItemChange(index, 'name', e.target.value)}
                      className={`flex-1 p-2.5 ${t.inputBg} border rounded-xl text-sm focus:outline-none`}
                    >
                      <option value="">Select inventory part or type custom...</option>
                      {inventory.map(inv => (
                        <option key={inv.id} value={inv.name}>{inv.name} (Stock: {inv.stock} | NPR {inv.price})</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Item name / Custom"
                      value={item.name}
                      onChange={e => handlePosItemChange(index, 'name', e.target.value)}
                      className={`flex-1 p-2.5 ${t.inputBg} border rounded-xl text-sm focus:outline-none`}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Price (NPR)"
                      value={item.price}
                      onChange={e => handlePosItemChange(index, 'price', e.target.value)}
                      className={`w-32 p-2.5 ${t.inputBg} border rounded-xl text-sm focus:outline-none`}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={item.qty}
                      onChange={e => handlePosItemChange(index, 'qty', e.target.value)}
                      className={`w-20 p-2.5 ${t.inputBg} border rounded-xl text-sm focus:outline-none`}
                      required
                    />
                    {posBill.items.length > 1 && (
                      <button type="button" onClick={() => handleRemovePosItem(index)} className="p-2.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl">
                        <Trash2 size={16}/>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <input
                  type="number"
                  placeholder="Paid Amount (NPR) - leave empty if fully paid"
                  value={posBill.paidAmount}
                  onChange={e => setPosBill({...posBill, paidAmount: e.target.value})}
                  className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
                />
                <input
                  type="text"
                  placeholder="Warranty (e.g. 7 Days check warranty)"
                  value={posBill.warrantyMonths}
                  onChange={e => setPosBill({...posBill, warrantyMonths: e.target.value})}
                  className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
                />
              </div>

              <div className={`flex items-center justify-between p-4 ${t.cardSecondary} rounded-2xl border ${t.border}`}>
                <span className={`text-sm font-bold ${t.textMuted}`}>Total POS Bill Amount</span>
                <span className="text-xl font-black text-emerald-400">
                  NPR {posBill.items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 1)), 0)}
                </span>
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-blue-600/30">
                Complete Sale & Generate Bill
              </button>
            </form>
          </div>
        )}

        {/* INVOICES & BILLS TAB */}
        {activeTab === 'invoices' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className={`text-xl font-bold ${t.textMain}`}>Invoices & Job Sheets Archive</h2>
                <p className={`text-sm ${t.textMuted} mt-0.5`}>Search, preview, print, send to WhatsApp or mark dues as paid.</p>
              </div>
              <div className={`flex items-center gap-2 ${t.inputBg} border ${t.border} rounded-2xl px-3 py-2 w-full lg:w-80`}>
                <Search size={16} className={t.textMuted} />
                <input
                  type="text"
                  placeholder="Search invoice #, customer, phone..."
                  value={invoiceSearch}
                  onChange={e => setInvoiceSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-full"
                />
              </div>
            </div>

            <div className={`flex flex-wrap gap-2 ${t.cardBg} p-2 rounded-2xl border ${t.border}`}>
              {['All', 'Repair', 'Accessories', 'Devices', 'Due', 'Paid'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setInvoiceFilterTab(tab)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                    invoiceFilterTab === tab ? 'bg-blue-600 text-white shadow-md' : `${t.textMuted} hover:text-white`
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className={`${t.tableHeader} text-sm uppercase border-b`}>
                    <tr>
                      <th className="p-4">ID & Date</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Device / Details</th>
                      <th className="p-4">Total / Due</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.tableDivide}`}>
                    {filteredInvoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-blue-600/5 transition">
                        <td className="p-4">
                          <p className="font-mono font-bold text-blue-400">{inv.id}</p>
                          <p className={`text-xs ${t.textMuted}`}>{inv.dateTime}</p>
                        </td>
                        <td className="p-4">
                          <p className={`font-bold ${t.textMain}`}>{inv.customerName}</p>
                          <p className={`text-xs ${t.textMuted}`}>{inv.phone}</p>
                        </td>
                        <td className="p-4">
                          <p className={`font-bold ${t.textMain}`}>{inv.model || inv.deviceType}</p>
                          <p className={`text-xs ${t.textMuted} truncate max-w-xs`}>{inv.issue}</p>
                        </td>
                        <td className="p-4">
                          <p className={`font-bold ${t.textMain}`}>NPR {inv.totalCost}</p>
                          {Number(inv.dueAmount) > 0 ? (
                            <p className="text-xs font-bold text-rose-400">Due: NPR {inv.dueAmount}</p>
                          ) : (
                            <p className="text-xs font-bold text-emerald-400">Fully Paid</p>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${t.border} ${t.cardSecondary} ${t.textMuted}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1">
                          <button onClick={() => setSelectedInvoice(inv)} title="Preview / Print" className="p-2 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20"><Eye size={15}/></button>
                          <button onClick={() => printInvoice(inv)} title="Direct Print" className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20"><Printer size={15}/></button>
                          <button onClick={() => sendToWhatsApp(inv)} title="Send WhatsApp Bill" className="p-2 bg-emerald-600/20 text-emerald-300 rounded-xl hover:bg-emerald-600/30"><MessageSquare size={15}/></button>
                          {Number(inv.dueAmount) > 0 && (
                            <button onClick={() => markInvoiceAsPaid(inv.id)} title="Mark Paid" className="p-2 bg-amber-500/10 text-amber-400 rounded-xl hover:bg-amber-500/20"><CheckCircle2 size={15}/></button>
                          )}
                          <button onClick={() => { setEditingInvoice(inv); }} title="Edit Invoice" className="p-2 bg-purple-500/10 text-purple-400 rounded-xl hover:bg-purple-500/20"><Pencil size={15}/></button>
                          <button onClick={() => { if(window.confirm('Delete this invoice?')) deleteRepair(inv.id); }} title="Delete" className="p-2 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20"><Trash2 size={15}/></button>
                        </td>
                      </tr>
                    ))}
                    {filteredInvoices.length === 0 && (
                      <tr><td colSpan="6" className={`p-8 text-center ${t.textMuted}`}>No invoices found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PARTS & INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className={`text-xl font-bold ${t.textMain}`}>Parts Stock & Inventory Management</h2>
            <form onSubmit={handleAddPart} className={`${t.cardBg} border ${t.border} p-6 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-4 shadow-xl`}>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <input type="text" placeholder="Part Name (e.g. iPhone 13 OLED)" value={newPart.name} onChange={e => setNewPart({...newPart, name: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              <input type="number" placeholder="Initial Stock Quantity" value={newPart.stock} onChange={e => setNewPart({...newPart, stock: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              <input type="number" placeholder="Cost Price (NPR)" value={newPart.costPrice} onChange={e => setNewPart({...newPart, costPrice: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              <input type="number" placeholder="Selling Price (NPR)" value={newPart.price} onChange={e => setNewPart({...newPart, price: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              <input type="number" placeholder="Min Stock Alert Level" value={newPart.minStock} onChange={e => setNewPart({...newPart, minStock: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <input type="text" placeholder="Supplier Name (optional)" value={newPart.supplierName} onChange={e => setNewPart({...newPart, supplierName: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <button type="submit" className="md:col-span-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-blue-600/30">{editingPartId ? 'Update Stock Item' : 'Add Part to Inventory'}</button>
            </form>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl p-6 shadow-xl space-y-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-bold ${t.textMain}`}>Stock Purchase / Restock Log</h3>
                  <p className={`text-sm ${t.textMuted}`}>Restock inventory and auto-record purchase expenses.</p>
                </div>
              </div>
              <form onSubmit={handleAddStockPurchase} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <select value={newStockPurchase.partId} onChange={e => {
                  const id = e.target.value;
                  const found = inventory.find(i => String(i.id) === id);
                  setNewStockPurchase(prev => ({ ...prev, partId: id, partName: found ? found.name : prev.partName, category: found ? found.category : prev.category }));
                }} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`}>
                  <option value="">Select existing part...</option>
                  {inventory.map(i => <option key={i.id} value={i.id}>{i.name} (Stock: {i.stock})</option>)}
                </select>
                <input type="text" placeholder="Or new part name" value={newStockPurchase.partName} onChange={e => setNewStockPurchase({...newStockPurchase, partName: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} />
                <input type="number" placeholder="Quantity added" value={newStockPurchase.qty} onChange={e => setNewStockPurchase({...newStockPurchase, qty: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} required />
                <input type="number" placeholder="Unit cost (NPR)" value={newStockPurchase.unitCost} onChange={e => setNewStockPurchase({...newStockPurchase, unitCost: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} required />
                <input type="text" placeholder="Supplier Name" value={newStockPurchase.supplierName} onChange={e => setNewStockPurchase({...newStockPurchase, supplierName: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} />
                <input type="text" placeholder="Supplier Bill / Invoice No." value={newStockPurchase.invoiceNo} onChange={e => setNewStockPurchase({...newStockPurchase, invoiceNo: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} />
                <input type="date" value={newStockPurchase.date} onChange={e => setNewStockPurchase({...newStockPurchase, date: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} />
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl p-3 transition">Record Restock & Expense</button>
              </form>

              {stockPurchases.length > 0 && (
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left text-sm">
                    <thead className={`${t.tableHeader} text-sm uppercase border-b`}>
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Part Name</th>
                        <th className="p-3">Supplier</th>
                        <th className="p-3">Qty & Unit Cost</th>
                        <th className="p-3">Total Cost</th>
                        <th className="p-3 text-right">Bill</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${t.tableDivide}`}>
                      {stockPurchases.map(pur => (
                        <tr key={pur.id}>
                          <td className="p-3 text-slate-400">{pur.date}</td>
                          <td className="p-3 font-bold text-white">{pur.partName}</td>
                          <td className="p-3 text-slate-300">{pur.supplierName || 'N/A'}</td>
                          <td className="p-3 text-slate-300">{pur.qty} × NPR {pur.unitCost}</td>
                          <td className="p-3 font-bold text-emerald-400">NPR {pur.total}</td>
                          <td className="p-3 text-right">
                            <button onClick={() => generatePartsPurchaseBill(pur)} className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20" title="Generate purchase bill"><Printer size={14}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className={`${t.tableHeader} text-sm uppercase border-b`}>
                    <tr>
                      <th className="p-4">Category</th>
                      <th className="p-4">Part Name</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Cost Price</th>
                      <th className="p-4">Selling Price</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.tableDivide}`}>
                    {inventory.map(item => (
                      <tr key={item.id}>
                        <td className="p-4"><span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 font-bold text-xs">{item.category}</span></td>
                        <td className={`p-4 font-bold ${t.textMain}`}>{item.name}</td>
                        <td className="p-4">
                          <span className={`font-bold ${Number(item.stock) <= Number(item.minStock || 5) ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {item.stock} units
                          </span>
                        </td>
                        <td className={`p-4 ${t.textMuted}`}>NPR {item.costPrice}</td>
                        <td className="p-4 font-bold text-blue-400">NPR {item.price}</td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => adjustStock(item.id, 1)} className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 rounded-lg font-bold">+1</button>
                          <button onClick={() => adjustStock(item.id, -1)} className="px-2.5 py-1 bg-rose-600/20 text-rose-400 rounded-lg font-bold">-1</button>
                          <button onClick={() => { setEditingPartId(item.id); setSelectedCategory(item.category); setNewPart({ name: item.name, stock: item.stock, costPrice: item.costPrice, price: item.price, minStock: item.minStock || 5, supplierName: item.supplierName || '', supplierPhone: item.supplierPhone || '', purchaseDate: item.lastPurchaseDate || todayKey }); window.scrollTo({top:0, behavior:'smooth'}); }} className="p-2 bg-amber-500/10 text-amber-400 rounded-xl"><Pencil size={14}/></button>
                          <button onClick={() => { if(window.confirm('Delete this part?')) deletePart(item.id); }} className="p-2 bg-rose-500/10 text-rose-400 rounded-xl"><Trash2 size={14}/></button>
                        </td>
                      </tr>
                    ))}
                    {inventory.length === 0 && (
                      <tr><td colSpan="6" className={`p-8 text-center ${t.textMuted}`}>No parts in inventory.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* EXPENSES TAB */}
        {activeTab === 'expenses' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className={`text-xl font-bold ${t.textMain}`}>Shop Expenses & Outflows</h2>
            <form onSubmit={handleAddExpense} className={`${t.cardBg} border ${t.border} p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4 shadow-xl`}>
              <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`}>
                <option value="General">General Expense</option>
                <option value="Rent">Shop Rent</option>
                <option value="Electricity">Electricity / Utilities</option>
                <option value="Parts Purchase">Parts Purchase</option>
                <option value="Device Purchase">Device Purchase</option>
                <option value="Salary">Staff Salary</option>
                <option value="Tools">Tools & Equipment</option>
                <option value="Other">Other Expense</option>
              </select>
              <input type="text" placeholder="Expense Description (e.g. Shop Rent for June)" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} required />
              <input type="number" placeholder="Amount (NPR)" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} required />
              <input type="date" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              <button type="submit" className="md:col-span-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-blue-600/30">{editingExpenseId ? 'Update Expense' : 'Record Expense'}</button>
            </form>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className={`${t.tableHeader} text-sm uppercase border-b`}>
                    <tr>
                      <th className="p-4">Date</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.tableDivide}`}>
                    {expenses.map(exp => (
                      <tr key={exp.id}>
                        <td className={`p-4 ${t.textMuted}`}>{exp.date}</td>
                        <td className="p-4"><span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 font-bold text-xs">{exp.category}</span></td>
                        <td className={`p-4 font-bold ${t.textMain}`}>{exp.description}</td>
                        <td className="p-4 font-bold text-rose-400">NPR {exp.amount}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => { if(window.confirm('Delete this expense?')) deleteExpense(exp.id); }} className="p-2 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20"><Trash2 size={14}/></button>
                        </td>
                      </tr>
                    ))}
                    {expenses.length === 0 && (
                      <tr><td colSpan="5" className={`p-8 text-center ${t.textMuted}`}>No expenses recorded.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* BACKUP & RESTORE TAB */}
        {activeTab === 'backup' && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
            <h2 className={`text-xl font-bold ${t.textMain}`}>Data Backup & Restore</h2>
            <div className={`${t.cardBg} border ${t.border} p-6 rounded-3xl space-y-6 shadow-xl`}>
              <div>
                <h3 className={`font-bold ${t.textMain}`}>Download Shop Backup</h3>
                <p className={`text-sm ${t.textMuted} mt-1`}>Save all repairs, inventory, devices, expenses and shop info to a secure JSON file on your computer.</p>
                <button onClick={exportData} className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-600/30">
                  <Download size={18}/> Export Backup File
                </button>
              </div>
              <hr className={t.border} />
              <div>
                <h3 className={`font-bold ${t.textMain}`}>Restore From Backup</h3>
                <p className={`text-sm ${t.textMuted} mt-1`}>Upload a previously exported Genuine Fix backup JSON file to restore your shop records.</p>
                <input type="file" accept=".json" onChange={importData} className="mt-4 text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer" />
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
            <h2 className={`text-xl font-bold ${t.textMain}`}>Shop Settings & Business Profile</h2>
            <div className={`${t.cardBg} border ${t.border} p-6 rounded-3xl space-y-4 shadow-xl`}>
              <div>
                <label className={`text-sm font-bold ${t.textMuted} block mb-1`}>Shop Name</label>
                <input type="text" value={shopInfo.name} onChange={e => setShopInfo({...shopInfo, name: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              </div>
              <div>
                <label className={`text-sm font-bold ${t.textMuted} block mb-1`}>Tagline</label>
                <input type="text" value={shopInfo.tagline} onChange={e => setShopInfo({...shopInfo, tagline: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              </div>
              <div>
                <label className={`text-sm font-bold ${t.textMuted} block mb-1`}>Address</label>
                <input type="text" value={shopInfo.address} onChange={e => setShopInfo({...shopInfo, address: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              </div>
              <div>
                <label className={`text-sm font-bold ${t.textMuted} block mb-1`}>Phone Number</label>
                <input type="text" value={shopInfo.phone} onChange={e => setShopInfo({...shopInfo, phone: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              </div>
              <div>
                <label className={`text-sm font-bold ${t.textMuted} block mb-1`}>PAN / VAT Number</label>
                <input type="text" value={shopInfo.panNo} onChange={e => setShopInfo({...shopInfo, panNo: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm`} />
              </div>

              <div>
                <label className={`text-sm font-bold ${t.textMuted} block mb-2`}>Theme / Appearance</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ['dim', 'Dim Slate', Moon],
                    ['dark', 'Dark Tech', Monitor],
                    ['light', 'Clean Light', Sun]
                  ].map(([key, label, Icon]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTheme(key)}
                      className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-bold text-sm transition ${
                        theme === key ? 'bg-blue-600 text-white border-blue-500 shadow-md' : `${t.cardSecondary} ${t.textMuted} ${t.border}`
                      }`}
                    >
                      <Icon size={16}/> {label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => alert('Shop settings saved successfully!')} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-blue-600/30 mt-2">
                Save Settings
              </button>
            </div>
          </div>
        )}

      </main>

      {/* INVOICE PREVIEW MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className={`${t.cardBg} border ${t.border} rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-700/50">
              <div>
                <p className={`text-xs font-mono font-bold text-blue-400`}>INVOICE PREVIEW</p>
                <h3 className={`text-xl font-black ${t.textMain}`}>#{selectedInvoice.id}</h3>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="p-2 rounded-2xl bg-slate-800 text-slate-400 hover:text-white">
                <X size={18}/>
              </button>
            </div>

            <div className={`p-5 rounded-2xl ${t.cardSecondary} border ${t.border} space-y-3`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-base font-black ${t.textMain}`}>{selectedInvoice.customerName}</p>
                  <p className={`text-sm ${t.textMuted}`}>Phone: {selectedInvoice.phone}</p>
                  {selectedInvoice.citizenshipNo && <p className={`text-sm ${t.textMuted}`}>Citizenship No: {selectedInvoice.citizenshipNo}</p>}
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${t.textMuted}`}>{selectedInvoice.dateTime}</p>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold mt-1 ${Number(selectedInvoice.dueAmount) > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {Number(selectedInvoice.dueAmount) > 0 ? `Due: NPR ${selectedInvoice.dueAmount}` : 'Paid in Full'}
                  </span>
                </div>
              </div>
              <hr className="border-slate-700/40" />
              <div>
                <p className={`text-xs uppercase font-bold text-slate-400`}>Service / Item</p>
                <p className={`text-sm font-bold ${t.textMain} mt-0.5`}>{selectedInvoice.model || selectedInvoice.issue}</p>
                {selectedInvoice.warrantyMonths && <p className="text-xs text-amber-400 font-bold mt-1">Warranty: {selectedInvoice.warrantyMonths}</p>}
              </div>
              <div className="flex justify-between items-center pt-2 font-bold text-sm">
                <span className={t.textMuted}>Total Cost: NPR {selectedInvoice.totalCost}</span>
                <span className="text-emerald-400">Paid: NPR {selectedInvoice.paidAmount}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => printInvoice(selectedInvoice)} className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30">
                <Printer size={16}/> Print Bill
              </button>
              <button onClick={() => downloadInvoiceImage(selectedInvoice)} className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30">
                <Download size={16}/> Download Image
              </button>
              <button onClick={() => sendToWhatsApp(selectedInvoice)} className="py-3 px-4 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold rounded-2xl flex items-center justify-center gap-2">
                <MessageSquare size={16}/> WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT INVOICE MODAL */}
      {editingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleUpdateInvoice} className={`${t.cardBg} border ${t.border} rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-700/50">
              <h3 className={`text-lg font-black ${t.textMain}`}>Edit Invoice #{editingInvoice.id}</h3>
              <button type="button" onClick={() => setEditingInvoice(null)} className="p-1 rounded-xl text-slate-400 hover:text-white"><X size={18}/></button>
            </div>
            <div>
              <label className={`text-xs font-bold ${t.textMuted} block mb-1`}>Customer Name</label>
              <input type="text" value={editingInvoice.customerName} onChange={e => setEditingInvoice({...editingInvoice, customerName: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm`} required />
            </div>
            <div>
              <label className={`text-xs font-bold ${t.textMuted} block mb-1`}>Phone Number</label>
              <input type="text" value={editingInvoice.phone} onChange={e => setEditingInvoice({...editingInvoice, phone: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm`} />
            </div>
            <div>
              <label className={`text-xs font-bold ${t.textMuted} block mb-1`}>Device Model / Details</label>
              <input type="text" value={editingInvoice.model} onChange={e => setEditingInvoice({...editingInvoice, model: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-xs font-bold ${t.textMuted} block mb-1`}>Total Cost (NPR)</label>
                <input type="number" value={editingInvoice.totalCost} onChange={e => setEditingInvoice({...editingInvoice, totalCost: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm`} required />
              </div>
              <div>
                <label className={`text-xs font-bold ${t.textMuted} block mb-1`}>Paid Amount (NPR)</label>
                <input type="number" value={editingInvoice.paidAmount} onChange={e => setEditingInvoice({...editingInvoice, paidAmount: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm`} required />
              </div>
            </div>
            <div>
              <label className={`text-xs font-bold ${t.textMuted} block mb-1`}>Warranty (optional)</label>
              <input type="text" value={editingInvoice.warrantyMonths || ''} onChange={e => setEditingInvoice({...editingInvoice, warrantyMonths: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm`} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditingInvoice(null)} className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-2xl">Cancel</button>
              <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30">Save Changes</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
