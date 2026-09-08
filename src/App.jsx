// Genuine Fix PRO Premium GUI — customer CRM, warranty watch, quick actions, responsive polish
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
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'General', paidNow: '', itemName: '', quantity: '', unitCost: '', supplierName: '', supplierPhone: '', invoiceNo: '', paymentMethod: 'Cash', notes: '', date: getLocalDateKey() });
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [payingExpense, setPayingExpense] = useState(null);
  const [payForm, setPayForm] = useState({ amount: '', date: getLocalDateKey() });
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
  const totalExp = expenses.reduce((acc, curr) => acc + Number(curr.paidAmount !== undefined ? curr.paidAmount : curr.amount || 0), 0);
  const totalSupplierDue = expenses.reduce((acc, curr) => acc + Number(curr.dueAmount || 0), 0);
  const supplierDueList = Object.values(expenses.filter(e => Number(e.dueAmount || 0) > 0).reduce((map, e) => {
    const key = (e.supplierName || 'Unknown Supplier').trim() || 'Unknown Supplier';
    if (!map[key]) map[key] = { name: key, phone: e.supplierPhone || '', due: 0, bills: 0 };
    map[key].due += Number(e.dueAmount || 0);
    map[key].bills += 1;
    return map;
  }, {})).sort((a, b) => b.due - a.due);

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
    .reduce((acc, curr) => acc + Number(curr.paidAmount !== undefined ? curr.paidAmount : curr.amount || 0), 0);
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
    // Paid Now can be less than the total amount — the rest is tracked as due (udhaaro) to the supplier.
    const paidNowRaw = newExpense.paidNow === '' || newExpense.paidNow === undefined ? calculatedAmount : Number(newExpense.paidNow || 0);
    const paidNowVal = Math.max(0, Math.min(paidNowRaw, calculatedAmount));
    const dueVal = Math.max(0, calculatedAmount - paidNowVal);
    if (editingExpenseId) {
      setExpenses(expenses.map(exp => exp.id === editingExpenseId ? {
        ...exp,
        description: newExpense.description || exp.description,
        category: newExpense.category || exp.category,
        amount: calculatedAmount,
        quantity: qty || '', unitCost: unitCost || '',
        itemName: newExpense.itemName || exp.itemName || '',
        supplierName: newExpense.supplierName || exp.supplierName || '',
        supplierPhone: newExpense.supplierPhone || exp.supplierPhone || '',
        invoiceNo: newExpense.invoiceNo || exp.invoiceNo || '',
        paymentMethod: newExpense.paymentMethod || exp.paymentMethod || 'Cash',
        notes: newExpense.notes || exp.notes || '',
        date: newExpense.date || exp.date
      } : exp));
      setEditingExpenseId(null);
      setNewExpense({ description: '', amount: '', category: 'General', paidNow: '', itemName: '', quantity: '', unitCost: '', supplierName: '', supplierPhone: '', invoiceNo: '', paymentMethod: 'Cash', notes: '', date: todayKey });
      alert('Expense updated successfully!'); return;
    }
    const expense = {
      id: Date.now(),
      description: newExpense.description || (newExpense.itemName ? `Parts Purchase - ${newExpense.itemName}` : 'General Expense'),
      category: newExpense.category || 'General',
      amount: calculatedAmount,
      paidAmount: paidNowVal,
      dueAmount: dueVal,
      payments: paidNowVal > 0 ? [{ amount: paidNowVal, date: newExpense.date || todayKey }] : [],
      quantity: qty || '', unitCost: unitCost || '',
      itemName: newExpense.itemName || '',
      supplierName: newExpense.supplierName || '',
      supplierPhone: newExpense.supplierPhone || '',
      invoiceNo: newExpense.invoiceNo || '',
      paymentMethod: newExpense.paymentMethod || 'Cash',
      notes: newExpense.notes || '',
      date: newExpense.date || todayKey
    };
    setExpenses([expense, ...expenses]);
    setNewExpense({ description: '', amount: '', category: 'General', paidNow: '', itemName: '', quantity: '', unitCost: '', supplierName: '', supplierPhone: '', invoiceNo: '', paymentMethod: 'Cash', notes: '', date: todayKey });
    if (dueVal > 0) alert(`Expense saved. Paid now: NPR ${paidNowVal} | Baaki (Due)${newExpense.supplierName ? ' to ' + newExpense.supplierName : ''}: NPR ${dueVal}`);
  };

  // Record an installment / advance payment against an outstanding credit purchase (udhaaro tracking)
  const addExpensePayment = (id, amount, date) => {
    const payAmt = Number(amount || 0);
    if (payAmt <= 0) { alert('Enter a valid payment amount.'); return; }
    let overpaid = false;
    setExpenses(expenses.map(exp => {
      if (exp.id !== id) return exp;
      const currentDue = Number(exp.dueAmount || 0);
      const applied = Math.min(payAmt, currentDue);
      if (payAmt > currentDue) overpaid = true;
      const newPaid = Number(exp.paidAmount !== undefined ? exp.paidAmount : exp.amount || 0) + applied;
      const newDue = Math.max(0, currentDue - applied);
      const newPayments = [...(exp.payments || []), { amount: applied, date: date || todayKey }];
      return { ...exp, paidAmount: newPaid, dueAmount: newDue, payments: newPayments };
    }));
    if (overpaid) alert('Entered amount was more than the remaining due — only the due amount was recorded.');
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
    ctx.font = '14px sans-serif';
    ctx.fillText(`Address: ${shopInfo.address}`, 50, 110);
    ctx.fillText(`Phone: ${shopInfo.phone} | PAN No: ${shopInfo.panNo}`, 50, 135);

    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(inv.billType === 'Device Purchase' ? 'DEVICE PURCHASE VOUCHER' : inv.billType === 'Parts Purchase' ? 'PARTS PURCHASE INVOICE' : inv.billType === 'Device Sale' ? 'DEVICE SALE INVOICE' : 'TAX / REPAIR INVOICE', 500, 55, 260);

    ctx.fillStyle = '#64748B';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Invoice No: ${inv.id}`, 500, 85);
    ctx.fillText(`Date: ${inv.dateTime || inv.date || getCurrentDateTime()}`, 500, 105);
    ctx.fillText(`Status: ${inv.status || 'Paid'}`, 500, 125);

    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(50, 190, 700, 90, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('CUSTOMER / PARTY DETAILS:', 75, 220);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText(`Name: ${inv.customerName || 'Walk-in Customer'}`, 75, 245);
    ctx.fillText(`Phone: ${inv.phone || 'N/A'}`, 75, 268);
    if (inv.citizenshipNo) {
      ctx.fillText(`Citizenship No: ${inv.citizenshipNo}`, 400, 245);
    }

    let startY = 320;
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(50, startY, 700, 35);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('DESCRIPTION', 70, startY + 23);
    ctx.fillText('QTY', 480, startY + 23);
    ctx.fillText('PRICE (NPR)', 550, startY + 23);
    ctx.fillText('TOTAL', 660, startY + 23);

    startY += 35;
    ctx.font = '14px sans-serif';
    const items = inv.items?.length ? inv.items : [{ name: inv.model || inv.deviceType || 'Repair & Maintenance', price: inv.totalCost, qty: 1, remarks: inv.issue }];
    
    items.forEach((item, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
      ctx.fillRect(50, startY, 700, 45);
      ctx.strokeStyle = '#E2E8F0';
      ctx.strokeRect(50, startY, 700, 45);

      ctx.fillStyle = '#1E293B';
      ctx.fillText(item.name || '', 70, startY + 20, 380);
      if (item.remarks) {
        ctx.fillStyle = '#64748B';
        ctx.font = '11px sans-serif';
        ctx.fillText(item.remarks, 70, startY + 36, 380);
        ctx.font = '14px sans-serif';
      }
      ctx.fillStyle = '#1E293B';
      ctx.fillText(String(item.qty || 1), 485, startY + 28);
      ctx.fillText(Number(item.price || 0).toLocaleString(), 550, startY + 28);
      ctx.fillText((Number(item.price || 0) * Number(item.qty || 1)).toLocaleString(), 660, startY + 28);
      startY += 45;
    });

    startY += 20;
    ctx.fillStyle = '#1E293B';
    ctx.font = '14px sans-serif';
    const totalC = Number(inv.totalCost || 0);
    const paidC = Number(inv.paidAmount || 0);
    const dueC = Number(inv.dueAmount || 0);

    ctx.fillText('Total Amount:', 500, startY);
    ctx.fillText(`NPR ${totalC.toLocaleString()}`, 640, startY);
    startY += 25;
    ctx.fillText('Paid Amount:', 500, startY);
    ctx.fillText(`NPR ${paidC.toLocaleString()}`, 640, startY);
    startY += 25;
    ctx.fillStyle = dueC > 0 ? '#EF4444' : '#10B981';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Due Balance:', 500, startY);
    ctx.fillText(`NPR ${dueC.toLocaleString()}`, 640, startY);

    if (inv.warrantyMonths) {
      startY += 40;
      ctx.fillStyle = '#EFF6FF';
      ctx.strokeStyle = '#BFDBFE';
      ctx.beginPath();
      ctx.roundRect(50, startY, 700, 40, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1E40AF';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`Warranty Period: ${inv.warrantyMonths} Months. Terms & conditions apply.`, 70, startY + 25);
    }

    startY += 90;
    ctx.strokeStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.moveTo(70, startY); ctx.lineTo(270, startY);
    ctx.moveTo(530, startY); ctx.lineTo(730, startY);
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.font = '12px sans-serif';
    ctx.fillText('Customer Signature', 110, startY + 20);
    ctx.fillText(`For: ${shopInfo.name}`, 580, startY + 20);

    return canvas.toDataURL('image/png');
  };

  const printInvoice = (inv) => {
    const dataUrl = generateInvoiceCanvas(inv);
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head><title>Invoice ${inv.id}</title></head>
        <body style="margin:0; background:#eee; display:flex; justify-content:center; align-items:center; min-height:100vh;">
          <img src="${dataUrl}" style="max-width:100%; height:auto; box-shadow: 0 10px 25px rgba(0,0,0,0.2);" />
          <script>setTimeout(() => { window.print(); }, 500);</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const downloadInvoiceImage = (inv) => {
    const dataUrl = generateInvoiceCanvas(inv);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Invoice_${inv.id}_${inv.customerName || 'Customer'}.png`;
    a.click();
  };

  return (
    <div className={`min-h-screen ${t.appBg} font-sans selection:bg-blue-500 selection:text-white transition-colors duration-200`}>
      {/* Top Header */}
      <header className={`${t.navBg} backdrop-blur-md sticky top-0 z-30 border-b transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Wrench className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                {shopInfo.name} <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">PRO</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">{shopInfo.tagline} • PAN: {shopInfo.panNo}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center bg-[#14171f]/80 px-4 py-2 rounded-2xl border border-slate-700 text-xs text-slate-300 gap-4">
              <div><span className="text-slate-400">Today Sales:</span> <strong className="text-white">NPR {todayIncome.toLocaleString()}</strong></div>
              <div className="w-px h-3 bg-slate-700"></div>
              <div><span className="text-slate-400">Net Cash:</span> <strong className="text-emerald-400">NPR {todayNet.toLocaleString()}</strong></div>
            </div>

            <div className="flex items-center bg-[#14171f] p-1 rounded-2xl border border-slate-700">
              <button onClick={() => setTheme('dim')} className={`p-2 rounded-xl transition ${theme === 'dim' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`} title="Dim Tech Theme">
                <Monitor className="w-4 h-4" />
              </button>
              <button onClick={() => setTheme('dark')} className={`p-2 rounded-xl transition ${theme === 'dark' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`} title="OLED Dark Theme">
                <Moon className="w-4 h-4" />
              </button>
              <button onClick={() => setTheme('light')} className={`p-2 rounded-xl transition ${theme === 'light' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`} title="Light Theme">
                <Sun className="w-4 h-4" />
              </button>
            </div>

            <button onClick={() => auth.signOut()} className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 transition">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={`${t.cardBg} border-b sticky top-20 z-20 backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar space-x-2 py-3">
          {[
            { id: 'invoices', label: 'Invoices & Jobs', icon: FileText },
            { id: 'pos', label: 'POS Billing', icon: ShoppingBag },
            { id: 'devices', label: 'Device Trade & Stock', icon: Smartphone },
            { id: 'inventory', label: 'Parts & Stock', icon: Package },
            { id: 'expenses', label: 'Expenses & Supplier Due', icon: DollarSign },
            { id: 'crm', label: 'Customer CRM', icon: Users },
            { id: 'dashboard', label: 'Dashboard & Reports', icon: LayoutDashboard },
            { id: 'settings', label: 'Shop Settings', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  active 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]' 
                    : `${t.textMuted} hover:bg-slate-800/50 hover:text-white`
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ================================= TAB 1: INVOICES & REPAIR JOBS ================================= */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`${t.cardBg} p-6 rounded-3xl border shadow-xl relative overflow-hidden`}>
                <div className="absolute right-4 top-4 p-3 bg-blue-500/10 rounded-2xl text-blue-400"><FileText className="w-6 h-6" /></div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Invoices</div>
                <div className="text-3xl font-black text-white mt-2">{repairs.length}</div>
              </div>
              <div className={`${t.cardBg} p-6 rounded-3xl border shadow-xl relative overflow-hidden`}>
                <div className="absolute right-4 top-4 p-3 bg-emerald-500/10 rounded-2xl text-emerald-400"><DollarSign className="w-6 h-6" /></div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</div>
                <div className="text-3xl font-black text-emerald-400 mt-2">NPR {totalRevenue.toLocaleString()}</div>
              </div>
              <div className={`${t.cardBg} p-6 rounded-3xl border shadow-xl relative overflow-hidden`}>
                <div className="absolute right-4 top-4 p-3 bg-amber-500/10 rounded-2xl text-amber-400"><Clock3 className="w-6 h-6" /></div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Due (Baaki)</div>
                <div className="text-3xl font-black text-amber-400 mt-2">NPR {totalDue.toLocaleString()}</div>
              </div>
              <div className={`${t.cardBg} p-6 rounded-3xl border shadow-xl relative overflow-hidden flex items-center justify-center`}>
                <button 
                  onClick={() => setActiveTab('pos')}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-5 h-5" /> New Quick Sale / POS
                </button>
              </div>
            </div>

            {/* New Repair / Job Form */}
            <div className={`${t.cardBg} rounded-3xl border p-6 shadow-2xl`}>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-400" /> Create New Repair / Job Sheet
              </h2>
              <form onSubmit={handleAddRepair} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Customer Name</label>
                  <CustomerAutocomplete
                    value={newRepair.customerName}
                    onChange={(val) => setNewRepair({ ...newRepair, customerName: val })}
                    onSelect={(cust) => handleCustomerSelect(cust, 'repair')}
                    customers={uniqueCustomers}
                    placeholder="Customer Full Name"
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newRepair.phone}
                    onChange={(e) => setNewRepair({ ...newRepair, phone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Citizenship No. (Optional)</label>
                  <input
                    type="text"
                    value={newRepair.citizenshipNo}
                    onChange={(e) => setNewRepair({ ...newRepair, citizenshipNo: e.target.value })}
                    placeholder="XX-XX-XX-XXXXX"
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Device Category</label>
                  <select
                    value={newRepair.deviceType}
                    onChange={(e) => setNewRepair({ ...newRepair, deviceType: e.target.value })}
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                  >
                    <option value="Mobile Repair">Mobile Repair</option>
                    <option value="Mobile (Unlock)">Mobile (Unlock)</option>
                    <option value="Laptop Repair">Laptop Repair</option>
                    <option value="Computer Repair">Computer Repair</option>
                    <option value="Tablet Repair">Tablet Repair</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Device Model & Specs</label>
                  <input
                    type="text"
                    value={newRepair.model}
                    onChange={(e) => setNewRepair({ ...newRepair, model: e.target.value })}
                    placeholder="e.g. iPhone 13 Pro / Dell Latitude"
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Total Cost (NPR)</label>
                  <input
                    type="number"
                    value={newRepair.totalCost}
                    onChange={(e) => setNewRepair({ ...newRepair, totalCost: e.target.value })}
                    placeholder="5000"
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Paid Amount (NPR)</label>
                  <input
                    type="number"
                    value={newRepair.paidAmount}
                    onChange={(e) => setNewRepair({ ...newRepair, paidAmount: e.target.value })}
                    placeholder="2000"
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Warranty Period</label>
                  <select
                    value={newRepair.warrantyMonths}
                    onChange={(e) => setNewRepair({ ...newRepair, warrantyMonths: e.target.value })}
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                  >
                    <option value="">No Warranty</option>
                    <option value="1">1 Month</option>
                    <option value="3">3 Months</option>
                    <option value="6">6 Months</option>
                    <option value="12">1 Year</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Issue / Remarks / Unlocking Details</label>
                  <input
                    type="text"
                    value={newRepair.issue}
                    onChange={(e) => setNewRepair({ ...newRepair, issue: e.target.value })}
                    placeholder="e.g. iCloud unlock / Screen replacement / Dead repair"
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                  />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" /> Save Job Sheet
                  </button>
                </div>
              </form>
            </div>

            {/* Invoices List / Table */}
            <div className={`${t.cardBg} rounded-3xl border shadow-2xl overflow-hidden`}>
              <div className="p-6 border-b border-slate-700 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      placeholder="Search by invoice #, customer name, phone..."
                      value={invoiceSearch}
                      onChange={(e) => setInvoiceSearch(e.target.value)}
                      className={`w-full pl-11 pr-4 py-2.5 rounded-2xl ${t.inputBg} border text-xs outline-none focus:border-blue-500 transition`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                  {['All', 'Repair', 'Accessories', 'Device Sale', 'Device Purchase', 'Parts Purchase'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setInvoiceFilterTab(tab)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                        invoiceFilterTab === tab ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`${t.tableHeader} text-xs font-black uppercase tracking-wider`}>
                      <th className="p-4">Inv # & Date</th>
                      <th className="p-4">Customer / Party</th>
                      <th className="p-4">Device / Model</th>
                      <th className="p-4">Total (NPR)</th>
                      <th className="p-4">Paid (NPR)</th>
                      <th className="p-4">Due (Baaki)</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.tableDivide} text-sm`}>
                    {repairs
                      .filter(r => {
                        if (invoiceFilterTab !== 'All' && r.billType !== invoiceFilterTab) return false;
                        if (!invoiceSearch) return true;
                        const q = invoiceSearch.toLowerCase();
                        return (r.id && r.id.toLowerCase().includes(q)) ||
                               (r.customerName && r.customerName.toLowerCase().includes(q)) ||
                               (r.phone && r.phone.toLowerCase().includes(q)) ||
                               (r.model && r.model.toLowerCase().includes(q));
                      })
                      .map(inv => {
                        const due = Number(inv.dueAmount || 0);
                        return (
                          <tr key={inv.id} className="hover:bg-slate-800/30 transition">
                            <td className="p-4 font-medium text-white">
                              <div>{inv.id}</div>
                              <div className="text-xs text-slate-400 font-normal">{inv.dateTime || inv.date}</div>
                              <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700">
                                {inv.billType || 'Repair'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-white">{inv.customerName}</div>
                              <div className="text-xs text-slate-400">{inv.phone}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-slate-200">{inv.model || inv.deviceType}</div>
                              <div className="text-xs text-slate-400 truncate max-w-xs">{inv.issue}</div>
                            </td>
                            <td className="p-4 font-bold text-white">NPR {Number(inv.totalCost || 0).toLocaleString()}</td>
                            <td className="p-4 font-bold text-emerald-400">NPR {Number(inv.paidAmount || 0).toLocaleString()}</td>
                            <td className="p-4 font-bold">
                              <span className={due > 0 ? 'text-amber-400 font-black' : 'text-slate-400'}>
                                NPR {due.toLocaleString()}
                              </span>
                            </td>
                            <td className="p-4">
                              <select
                                value={inv.status || 'Pending'}
                                onChange={(e) => updateJobStatus(inv.id, e.target.value)}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-white border border-slate-700 outline-none font-semibold"
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Ready">Ready</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Paid">Paid</option>
                              </select>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              {due > 0 && (
                                <button
                                  onClick={() => markInvoiceAsPaid(inv.id)}
                                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl text-xs font-bold border border-emerald-500/30 transition"
                                  title="Mark as Fully Paid"
                                >
                                  Settle
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedInvoice(inv)}
                                className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl transition"
                                title="View & Print Invoice"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setRepairs(repairs.filter(r => r.id !== inv.id))}
                                className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition"
                                title="Delete Invoice"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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

        {/* ================================= TAB 2: POS BILLING ================================= */}
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className={`${t.cardBg} rounded-3xl border p-6 shadow-2xl`}>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-400" /> POS Accessories & Parts Billing
                </h2>
                <form onSubmit={handleSavePosBill} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Customer Name</label>
                      <CustomerAutocomplete
                        value={posBill.customerName}
                        onChange={(val) => setPosBill({ ...posBill, customerName: val })}
                        onSelect={(cust) => handleCustomerSelect(cust, 'pos')}
                        customers={uniqueCustomers}
                        placeholder="Walk-in Customer"
                        className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={posBill.phone}
                        onChange={(e) => setPosBill({ ...posBill, phone: e.target.value })}
                        placeholder="98XXXXXXXX"
                        className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-400">Bill Items</label>
                      <button
                        type="button"
                        onClick={handleAddPosItem}
                        className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl text-xs font-bold transition flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Item
                      </button>
                    </div>

                    <div className="space-y-3">
                      {posBill.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-[#14171f] p-3 rounded-2xl border border-slate-800">
                          <input
                            type="text"
                            list={`inventory-list-${idx}`}
                            placeholder="Item / Accessory Name"
                            value={item.name}
                            onChange={(e) => handlePosItemChange(idx, 'name', e.target.value)}
                            className={`flex-1 px-3 py-2 rounded-xl ${t.inputBg} border text-xs outline-none focus:border-blue-500`}
                          />
                          <datalist id={`inventory-list-${idx}`}>
                            {inventory.map(inv => (
                              <option key={inv.id} value={inv.name}>{inv.name} (Stock: {inv.stock} | NPR {inv.price})</option>
                            ))}
                          </datalist>

                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.qty}
                            onChange={(e) => handlePosItemChange(idx, 'qty', e.target.value)}
                            className={`w-20 px-3 py-2 rounded-xl ${t.inputBg} border text-xs outline-none focus:border-blue-500`}
                            min="1"
                          />

                          <input
                            type="number"
                            placeholder="Price (NPR)"
                            value={item.price}
                            onChange={(e) => handlePosItemChange(idx, 'price', e.target.value)}
                            className={`w-28 px-3 py-2 rounded-xl ${t.inputBg} border text-xs outline-none focus:border-blue-500`}
                          />

                          {posBill.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePosItem(idx)}
                              className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Paid Amount (NPR)</label>
                      <input
                        type="number"
                        value={posBill.paidAmount}
                        onChange={(e) => setPosBill({ ...posBill, paidAmount: e.target.value })}
                        placeholder="Leave blank if fully paid"
                        className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Warranty Period</label>
                      <select
                        value={posBill.warrantyMonths}
                        onChange={(e) => setPosBill({ ...posBill, warrantyMonths: e.target.value })}
                        className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                      >
                        <option value="">No Warranty</option>
                        <option value="1">1 Month</option>
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="12">1 Year</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
                  >
                    <Printer className="w-5 h-5" /> Generate & Save POS Bill
                  </button>
                </form>
              </div>
            </div>

            {/* POS Summary / Quick Inventory Sidebar */}
            <div className="space-y-6">
              <div className={`${t.cardBg} rounded-3xl border p-6 shadow-2xl`}>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-400" /> Fast Inventory Select
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {inventory.map(item => (
                    <div key={item.id} className="p-3 bg-[#14171f] rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">{item.name}</div>
                        <div className="text-xs text-slate-400">Stock: {item.stock} | NPR {item.price}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const last = posBill.items[posBill.items.length - 1];
                          if (last && !last.name) {
                            const updated = [...posBill.items];
                            updated[updated.length - 1] = { name: item.name, price: item.price, qty: 1 };
                            setPosBill({ ...posBill, items: updated });
                          } else {
                            setPosBill({ ...posBill, items: [...posBill.items, { name: item.name, price: item.price, qty: 1 }] });
                          }
                        }}
                        className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl text-xs font-bold transition"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================= TAB 3: DEVICE TRADE & STOCK ================================= */}
        {activeTab === 'devices' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`${t.cardBg} p-6 rounded-3xl border shadow-xl relative overflow-hidden`}>
                <div className="absolute right-4 top-4 p-3 bg-blue-500/10 rounded-2xl text-blue-400"><Smartphone className="w-6 h-6" /></div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">In-Stock Devices</div>
                <div className="text-3xl font-black text-white mt-2">
                  {devicesStock.filter(d => (d.tradeType || 'buy') === 'buy' && d.status !== 'Sold').length}
                </div>
              </div>
              <div className={`${t.cardBg} p-6 rounded-3xl border shadow-xl relative overflow-hidden`}>
                <div className="absolute right-4 top-4 p-3 bg-emerald-500/10 rounded-2xl text-emerald-400"><DollarSign className="w-6 h-6" /></div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Device Sales</div>
                <div className="text-3xl font-black text-emerald-400 mt-2">NPR {totalDeviceSales.toLocaleString()}</div>
              </div>
              <div className={`${t.cardBg} p-6 rounded-3xl border shadow-xl relative overflow-hidden`}>
                <div className="absolute right-4 top-4 p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><TrendingUp className="w-6 h-6" /></div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Device Trading Profit</div>
                <div className="text-3xl font-black text-indigo-400 mt-2">NPR {totalDeviceProfit.toLocaleString()}</div>
              </div>
              <div className={`${t.cardBg} p-6 rounded-3xl border shadow-xl relative overflow-hidden flex items-center justify-center`}>
                <div className="flex bg-[#14171f] p-1.5 rounded-2xl border border-slate-700 w-full">
                  <button
                    onClick={() => { setDeviceTradeTab('buy'); resetDeviceForm('buy'); }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${deviceTradeTab === 'buy' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    Buy Device
                  </button>
                  <button
                    onClick={() => { setDeviceTradeTab('sell'); resetDeviceForm('sell'); }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${deviceTradeTab === 'sell' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    Sell Device
                  </button>
                </div>
              </div>
            </div>

            {/* Device Buy / Sell Form */}
            <div className={`${t.cardBg} rounded-3xl border p-6 shadow-2xl`}>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-400" /> 
                {deviceTradeTab === 'buy' ? (editingDeviceId ? 'Edit Device Purchase Record' : 'Record Second-Hand Device Purchase') : (editingDeviceId ? 'Edit Device Sale Record' : 'Record Second-Hand Device Sale')}
              </h2>
              <form onSubmit={handleAddDevice} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Device Category</label>
                  <select
                    value={newDevice.deviceCategory}
                    onChange={(e) => setNewDevice({ ...newDevice, deviceCategory: e.target.value })}
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                  >
                    <option value="Second-Hand Phone">Second-Hand Phone</option>
                    <option value="Second-Hand Laptop">Second-Hand Laptop</option>
                    <option value="Second-Hand Tablet">Second-Hand Tablet</option>
                    <option value="Refurbished Device">Refurbished Device</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Brand & Model Name</label>
                  <input
                    type="text"
                    value={newDevice.brandModel}
                    onChange={(e) => setNewDevice({ ...newDevice, brandModel: e.target.value })}
                    placeholder="e.g. iPhone 12 Pro (128GB)"
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                    required
                  />
                </div>

                {deviceTradeTab === 'buy' ? (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">IMEI or Serial Number(s)</label>
                    <div className="space-y-2">
                      {newDevice.imeiList.map((imei, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={imei}
                            onChange={(e) => updateDeviceImeiField(idx, e.target.value)}
                            placeholder={`IMEI / Serial #${idx + 1}`}
                            className={`flex-1 px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                            required={idx === 0}
                          />
                          {newDevice.imeiList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDeviceImeiField(idx)}
                              className="p-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-2xl transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addDeviceImeiField}
                        className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Add Another IMEI / Serial
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Select In-Stock Device</label>
                    <select
                      value={selectedPurchaseId}
                      onChange={(e) => {
                        const pid = e.target.value;
                        setSelectedPurchaseId(pid);
                        const p = devicesStock.find(d => d.id === pid);
                        if (p) {
                          setNewDevice({
                            ...newDevice,
                            brandModel: p.brandModel,
                            deviceCategory: p.deviceCategory,
                            imeiOrSerial: p.imeiOrSerial,
                            buyPrice: p.buyPrice,
                            sellPrice: p.sellPrice || '',
                            partyName: p.partyName,
                            partyPhone: p.partyPhone
                          });
                        }
                      }}
                      className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                      required
                    >
                      <option value="">-- Choose In-Stock Device --</option>
                      {devicesStock.filter(d => (d.tradeType || 'buy') === 'buy' && d.status !== 'Sold').map(d => (
                        <option key={d.id} value={d.id}>{d.brandModel} [IMEI: {d.imeiOrSerial}] - Buy: NPR {d.buyPrice}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Condition & Battery Health</label>
                  <input
                    type="text"
                    value={newDevice.condition}
                    onChange={(e) => setNewDevice({ ...newDevice, condition: e.target.value })}
                    placeholder="e.g. Good (Battery 88%)"
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    {deviceTradeTab === 'buy' ? "Seller's Name" : "Customer's Name"}
                  </label>
                  <CustomerAutocomplete
                    value={newDevice.partyName}
                    onChange={(val) => setNewDevice({ ...newDevice, partyName: val })}
                    onSelect={(cust) => handleCustomerSelect(cust, 'device')}
                    customers={uniqueCustomers}
                    placeholder="Full Name"
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newDevice.partyPhone}
                    onChange={(e) => setNewDevice({ ...newDevice, partyPhone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Citizenship No. (Mandatory for Buying)</label>
                  <input
                    type="text"
                    value={newDevice.citizenshipNo}
                    onChange={(e) => setNewDevice({ ...newDevice, citizenshipNo: e.target.value })}
                    placeholder="XX-XX-XX-XXXXX"
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Citizenship Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleDeviceImageUpload(e, 'citizenshipPhoto')}
                    className={`w-full px-3 py-2 rounded-2xl ${t.inputBg} border text-xs outline-none`}
                  />
                  {newDevice.citizenshipPhoto && (
                    <span className="text-[10px] text-emerald-400 font-bold mt-1 block">✓ Photo Attached</span>
                  )}
                </div>

                {deviceTradeTab === 'buy' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Purchase Price per unit (NPR)</label>
                    <input
                      type="number"
                      value={newDevice.buyPrice}
                      onChange={(e) => setNewDevice({ ...newDevice, buyPrice: e.target.value })}
                      placeholder="45000"
                      className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Expected / Selling Price (NPR)</label>
                  <input
                    type="number"
                    value={newDevice.sellPrice}
                    onChange={(e) => setNewDevice({ ...newDevice, sellPrice: e.target.value })}
                    placeholder="52000"
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Warranty Period</label>
                  <select
                    value={newDevice.warrantyMonths}
                    onChange={(e) => setNewDevice({ ...newDevice, warrantyMonths: e.target.value })}
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                  >
                    <option value="">No Warranty</option>
                    <option value="1">1 Month</option>
                    <option value="3">3 Months</option>
                    <option value="6">6 Months</option>
                    <option value="12">1 Year</option>
                  </select>
                </div>

                <div className="md:col-span-4 flex justify-end gap-3">
                  {editingDeviceId && (
                    <button
                      type="button"
                      onClick={() => resetDeviceForm(deviceTradeTab)}
                      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className={`px-8 py-3 font-bold text-white rounded-2xl shadow-lg transition flex items-center gap-2 ${
                      deviceTradeTab === 'buy' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                    }`}
                  >
                    <Plus className="w-5 h-5" /> {deviceTradeTab === 'buy' ? (editingDeviceId ? 'Update Purchase' : 'Save Device Purchase') : (editingDeviceId ? 'Update Sale' : 'Complete Device Sale')}
                  </button>
                </div>
              </form>
            </div>

            {/* Devices Stock & Sales History Table */}
            <div className={`${t.cardBg} rounded-3xl border shadow-2xl overflow-hidden`}>
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Second-Hand Devices Inventory & Trade History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`${t.tableHeader} text-xs font-black uppercase tracking-wider`}>
                      <th className="p-4">Date & Type</th>
                      <th className="p-4">Device & IMEI / Serial</th>
                      <th className="p-4">Party / Customer</th>
                      <th className="p-4">Condition</th>
                      <th className="p-4">Buy Price</th>
                      <th className="p-4">Sell Price / Profit</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.tableDivide} text-sm`}>
                    {devicesStock.map(d => {
                      const isSell = d.tradeType === 'sell';
                      const imeis = getDeviceImeis(d);
                      return (
                        <tr key={d.id} className="hover:bg-slate-800/30 transition">
                          <td className="p-4 font-medium text-white">
                            <div>{d.date || d.purchaseDate}</div>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isSell ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>
                              {isSell ? 'Device Sale' : 'Device Purchase'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-white">{d.brandModel}</div>
                            <div className="text-xs text-slate-400">
                              IMEI/SN: {imeis.join(', ')}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-white">{d.partyName || d.sellerName}</div>
                            <div className="text-xs text-slate-400">{d.partyPhone || d.sellerPhone}</div>
                          </td>
                          <td className="p-4 text-slate-300 text-xs">{d.condition || 'N/A'}</td>
                          <td className="p-4 font-bold text-slate-200">NPR {Number(d.buyPrice || 0).toLocaleString()}</td>
                          <td className="p-4">
                            {isSell ? (
                              <div>
                                <div className="font-bold text-emerald-400">NPR {Number(d.sellPrice || 0).toLocaleString()}</div>
                                <div className="text-xs text-indigo-400 font-semibold">Profit: +NPR {Number(d.profit || 0).toLocaleString()}</div>
                              </div>
                            ) : (
                              <div className="text-slate-400 text-xs">Expected: NPR {Number(d.sellPrice || 0).toLocaleString()}</div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                              d.status === 'Sold' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {d.status || 'In Stock'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            {!isSell && d.status !== 'Sold' && (
                              <button
                                onClick={() => {
                                  setDeviceTradeTab('sell');
                                  setSelectedPurchaseId(d.id);
                                  setNewDevice({
                                    ...newDevice,
                                    tradeType: 'sell',
                                    brandModel: d.brandModel,
                                    deviceCategory: d.deviceCategory,
                                    imeiOrSerial: d.imeiOrSerial,
                                    buyPrice: d.buyPrice,
                                    sellPrice: d.sellPrice || '',
                                    warrantyMonths: d.warrantyMonths || ''
                                  });
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl text-xs font-bold transition"
                              >
                                Sell
                              </button>
                            )}
                            {!isSell && (
                              <button
                                onClick={() => generateDevicePurchaseBill(d)}
                                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl text-xs font-bold transition"
                                title="Print Buy Voucher"
                              >
                                Voucher
                              </button>
                            )}
                            {isSell && (
                              <button
                                onClick={() => restoreDeviceSale(d.id)}
                                className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 rounded-xl text-xs font-bold transition"
                                title="Restore device to In Stock"
                              >
                                Restore
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (isSell) {
                                  restoreDeviceSale(d.id);
                                } else {
                                  setDevicesStock(devicesStock.filter(x => x.id !== d.id));
                                }
                              }}
                              className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

        {/* ================================= TAB 4: PARTS & STOCK ================================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`${t.cardBg} p-6 rounded-3xl border shadow-xl relative overflow-hidden`}>
                <div className="absolute right-4 top-4 p-3 bg-blue-500/10 rounded-2xl text-blue-400"><Package className="w-6 h-6" /></div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Stock Items</div>
                <div className="text-3xl font-black text-white mt-2">{inventory.reduce((sum, i) => sum + Number(i.stock || 0), 0)}</div>
              </div>
              <div className={`${t.cardBg} p-6 rounded-3xl border shadow-xl relative overflow-hidden`}>
                <div className="absolute right-4 top-4 p-3 bg-emerald-500/10 rounded-2xl text-emerald-400"><DollarSign className="w-6 h-6" /></div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Valuation</div>
                <div className="text-3xl font-black text-emerald-400 mt-2">
                  NPR {inventory.reduce((sum, i) => sum + (Number(i.stock || 0) * Number(i.costPrice || 0)), 0).toLocaleString()}
                </div>
              </div>
              <div className={`${t.cardBg} p-6 rounded-3xl border shadow-xl relative overflow-hidden`}>
                <div className="absolute right-4 top-4 p-3 bg-amber-500/10 rounded-2xl text-amber-400"><AlertTriangle className="w-6 h-6" /></div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts</div>
                <div className="text-3xl font-black text-amber-400 mt-2">
                  {inventory.filter(i => Number(i.stock || 0) <= Number(i.minStock || 5)).length}
                </div>
              </div>
            </div>

            {/* Quick Restock / Stock Purchase Form */}
            <div className={`${t.cardBg} rounded-3xl border p-6 shadow-2xl`}>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-400" /> Stock Purchase / Restock Form (Supplier Udhaaro Tracking)
              </h2>
              <form onSubmit={handleAddStockPurchase} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Select Existing Part</label>
                  <select
                    value={newStockPurchase.partId}
                    onChange={(e) => {
                      const pid = e.target.value;
                      const p = inventory.find(i => String(i.id) === pid);
                      setNewStockPurchase({
                        ...newStockPurchase,
                        partId: pid,
                        partName: p ? p.name : '',
                        category: p ? p.category : newStockPurchase.category,
                        unitCost: p ? p.costPrice : ''
                      });
                    }}
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                  >
                    <option value="">-- Choose Part or Create New Below --</option>
                    {inventory.map(i => (
                      <option key={i.id} value={i.id}>{i.name} (Stock: {i.stock})</option>
                    ))}
                  </select>
                </div>

                {!newStockPurchase.partId && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">New Part Name</label>
                      <input
                        type="text"
                        value={newStockPurchase.partName}
                        onChange={(e) => setNewStockPurchase({ ...newStockPurchase, partName: e.target.value })}
                        placeholder="e.g. iPhone 13 OLED Screen"
                        className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                        required={!newStockPurchase.partId}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                      <select
                        value={newStockPurchase.category}
                        onChange={(e) => setNewStockPurchase({ ...newStockPurchase, category: e.target.value })}
                        className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    value={newStockPurchase.supplierName}
                    onChange={(e) => setNewStockPurchase({ ...newStockPurchase, supplierName: e.target.value })}
                    placeholder="Supplier / Distributor Name"
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Supplier Phone</label>
                  <input
                    type="text"
                    value={newStockPurchase.supplierPhone}
                    onChange={(e) => setNewStockPurchase({ ...newStockPurchase, supplierPhone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Quantity Added</label>
                  <input
                    type="number"
                    value={newStockPurchase.qty}
                    onChange={(e) => setNewStockPurchase({ ...newStockPurchase, qty: e.target.value })}
                    placeholder="5"
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Unit Cost Price (NPR)</label>
                  <input
                    type="number"
                    value={newStockPurchase.unitCost}
                    onChange={(e) => setNewStockPurchase({ ...newStockPurchase, unitCost: e.target.value })}
                    placeholder="4500"
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Supplier Invoice / Bill No.</label>
                  <input
                    type="text"
                    value={newStockPurchase.invoiceNo}
                    onChange={(e) => setNewStockPurchase({ ...newStockPurchase, invoiceNo: e.target.value })}
                    placeholder="INV-9921"
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                  />
                </div>

                <div className="md:col-span-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Save Stock Purchase & Auto-Record Expense
                  </button>
                </div>
              </form>
            </div>

            {/* Inventory Items Table */}
            <div className={`${t.cardBg} rounded-3xl border shadow-2xl overflow-hidden`}>
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Parts & Inventory Stock</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`${t.tableHeader} text-xs font-black uppercase tracking-wider`}>
                      <th className="p-4">Part Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Stock Qty</th>
                      <th className="p-4">Cost Price</th>
                      <th className="p-4">Selling Price</th>
                      <th className="p-4">Supplier</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.tableDivide} text-sm`}>
                    {inventory.map(item => {
                      const low = Number(item.stock || 0) <= Number(item.minStock || 5);
                      return (
                        <tr key={item.id} className="hover:bg-slate-800/30 transition">
                          <td className="p-4 font-bold text-white">{item.name}</td>
                          <td className="p-4 text-slate-300 text-xs">{item.category}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                              low ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {item.stock} units {low && '⚠️ Low'}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-slate-300">NPR {Number(item.costPrice || 0).toLocaleString()}</td>
                          <td className="p-4 font-bold text-emerald-400">NPR {Number(item.price || 0).toLocaleString()}</td>
                          <td className="p-4 text-slate-400 text-xs">{item.supplierName || 'N/A'}</td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => adjustStock(item.id, 1)}
                              className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg text-xs font-bold"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => adjustStock(item.id, -1)}
                              className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 rounded-lg text-xs font-bold"
                            >
                              -1
                            </button>
                            <button
                              onClick={() => setInventory(inventory.filter(i => i.id !== item.id))}
                              className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

        {/* ================================= TAB 5: EXPENSES & SUPPLIER DUE ================================= */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`${t.cardBg} p-6 rounded-3xl border shadow-xl relative overflow-hidden`}>
                <div className="absolute right-4 top-4 p-3 bg-red-500/10 rounded-2xl text-red-400"><DollarSign className="w-6 h-6" /></div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Expenses Paid</div>
                <div className="text-3xl font-black text-red-400 mt-2">NPR {totalExp.toLocaleString()}</div>
              </div>
              <div className={`${t.cardBg} p-6 rounded-3xl border shadow-xl relative overflow-hidden`}>
                <div className="absolute right-4 top-4 p-3 bg-amber-500/10 rounded-2xl text-amber-400"><Clock3 className="w-6 h-6" /></div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Supplier Due (Udhaaro)</div>
                <div className="text-3xl font-black text-amber-400 mt-2">NPR {totalSupplierDue.toLocaleString()}</div>
              </div>
              <div className={`${t.cardBg} p-6 rounded-3xl border shadow-xl relative overflow-hidden flex items-center justify-center`}>
                <div className="text-xs text-slate-400 text-center">
                  Track shop rent, tools, electricity, and supplier credit accounts.
                </div>
              </div>
            </div>

            {/* Supplier Due Summary Cards */}
            {supplierDueList.length > 0 && (
              <div className={`${t.cardBg} rounded-3xl border p-6 shadow-2xl`}>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Supplier Due Accounts (Udhaaro to Pay)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {supplierDueList.map((sup, idx) => (
                    <div key={idx} className="p-4 bg-[#14171f] rounded-2xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">{sup.name}</div>
                        {sup.phone && <div className="text-xs text-slate-400">{sup.phone}</div>}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Due Balance</div>
                          <div className="text-lg font-black text-amber-400">NPR {sup.due.toLocaleString()}</div>
                        </div>
                        <div className="text-xs text-slate-400">{sup.bills} bill{sup.bills > 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Expense Form */}
            <div className={`${t.cardBg} rounded-3xl border p-6 shadow-2xl`}>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-400" /> 
                {editingExpenseId ? 'Edit Expense Record' : 'Record New Expense or Supplier Credit Bill'}
              </h2>
              <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Expense Category</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                  >
                    <option value="General">General / Shop Expense</option>
                    <option value="Rent">Shop Rent</option>
                    <option value="Electricity">Electricity / Utilities</option>
                    <option value="Parts Purchase">Parts Purchase (Udhaaro)</option>
                    <option value="Device Purchase">Device Purchase</option>
                    <option value="Salary">Staff Salary</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Description / Title</label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="e.g. Shop Rent for June / Display Distributor Bill"
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Supplier Name (Optional)</label>
                  <input
                    type="text"
                    value={newExpense.supplierName}
                    onChange={(e) => setNewExpense({ ...newExpense, supplierName: e.target.value })}
                    placeholder="Distributor Name"
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Total Amount (NPR)</label>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="15000"
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Paid Now (NPR) [Rest is Due]</label>
                  <input
                    type="number"
                    value={newExpense.paidNow}
                    onChange={(e) => setNewExpense({ ...newExpense, paidNow: e.target.value })}
                    placeholder="Leave blank if fully paid"
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none focus:border-blue-500 transition`}
                  />
                </div>

                <div className="md:col-span-4 flex justify-end gap-3">
                  {editingExpenseId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingExpenseId(null);
                        setNewExpense({ description: '', amount: '', category: 'General', paidNow: '', itemName: '', quantity: '', unitCost: '', supplierName: '', supplierPhone: '', invoiceNo: '', paymentMethod: 'Cash', notes: '', date: todayKey });
                      }}
                      className="px-6 py-3 bg-slate-800 text-slate-300 font-bold rounded-2xl transition"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> {editingExpenseId ? 'Update Expense' : 'Save Expense / Udhaaro'}
                  </button>
                </div>
              </form>
            </div>

            {/* Expenses List Table */}
            <div className={`${t.cardBg} rounded-3xl border shadow-2xl overflow-hidden`}>
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Expenses & Supplier Credit Ledger</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`${t.tableHeader} text-xs font-black uppercase tracking-wider`}>
                      <th className="p-4">Date & Category</th>
                      <th className="p-4">Description / Supplier</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Paid Amount</th>
                      <th className="p-4">Due (Baaki)</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.tableDivide} text-sm`}>
                    {expenses.map(exp => {
                      const totalAmt = Number(exp.amount || 0);
                      const paidAmt = Number(exp.paidAmount !== undefined ? exp.paidAmount : totalAmt);
                      const dueAmt = Number(exp.dueAmount !== undefined ? exp.dueAmount : Math.max(0, totalAmt - paidAmt));
                      return (
                        <tr key={exp.id} className="hover:bg-slate-800/30 transition">
                          <td className="p-4 font-medium text-white">
                            <div>{exp.date}</div>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700">
                              {exp.category}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-white">{exp.description}</div>
                            {exp.supplierName && <div className="text-xs text-slate-400">Supplier: {exp.supplierName}</div>}
                          </td>
                          <td className="p-4 font-bold text-white">NPR {totalAmt.toLocaleString()}</td>
                          <td className="p-4 font-bold text-emerald-400">NPR {paidAmt.toLocaleString()}</td>
                          <td className="p-4 font-bold">
                            <span className={dueAmt > 0 ? 'text-amber-400 font-black' : 'text-slate-400'}>
                              NPR {dueAmt.toLocaleString()}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            {dueAmt > 0 && (
                              <button
                                onClick={() => {
                                  setPayingExpense(exp);
                                  setPayForm({ amount: dueAmt, date: todayKey });
                                }}
                                className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl text-xs font-bold transition"
                              >
                                Pay Due
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditingExpenseId(exp.id);
                                setNewExpense({
                                  description: exp.description,
                                  amount: exp.amount,
                                  category: exp.category,
                                  paidNow: paidAmt,
                                  supplierName: exp.supplierName || '',
                                  supplierPhone: exp.supplierPhone || '',
                                  invoiceNo: exp.invoiceNo || '',
                                  paymentMethod: exp.paymentMethod || 'Cash',
                                  notes: exp.notes || '',
                                  date: exp.date || todayKey
                                });
                                window.scrollTo({ top: 300, behavior: 'smooth' });
                              }}
                              className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl transition"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setExpenses(expenses.filter(e => e.id !== exp.id))}
                              className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

        {/* ================================= TAB 6: CUSTOMER CRM ================================= */}
        {activeTab === 'crm' && (
          <div className={`${t.cardBg} rounded-3xl border shadow-2xl overflow-hidden`}>
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" /> Customer CRM & Repair History Directory
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`${t.tableHeader} text-xs font-black uppercase tracking-wider`}>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Phone Number</th>
                    <th className="p-4">Total Repairs / Orders</th>
                    <th className="p-4">Total Spent</th>
                    <th className="p-4 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${t.tableDivide} text-sm`}>
                  {uniqueCustomers.map((cust, idx) => {
                    const custRepairs = repairs.filter(r => r.customerName && r.customerName.toLowerCase() === cust.name.toLowerCase());
                    const spent = custRepairs.reduce((sum, r) => sum + Number(r.totalCost || 0), 0);
                    return (
                      <tr key={idx} className="hover:bg-slate-800/30 transition">
                        <td className="p-4 font-bold text-white">{cust.name}</td>
                        <td className="p-4 text-slate-300">{cust.phone || 'N/A'}</td>
                        <td className="p-4 text-slate-300 font-semibold">{custRepairs.length} order(s)</td>
                        <td className="p-4 font-bold text-emerald-400">NPR {spent.toLocaleString()}</td>
                        <td className="p-4 text-right">
                          {cust.phone && cust.phone !== 'N/A' && (
                            <a
                              href={`https://wa.me/977${cust.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(cust.name)},%20greeting%20from%20Genuine%20Fix!`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5"
                            >
                              <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================= TAB 7: DASHBOARD & REPORTS ================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`${t.cardBg} p-6 rounded-3xl border shadow-xl relative overflow-hidden`}>
                <div className="absolute right-4 top-4 p-3 bg-blue-500/10 rounded-2xl text-blue-400"><DollarSign className="w-6 h-6" /></div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</div>
                <div className="text-3xl font-black text-white mt-2">NPR {totalRevenue.toLocaleString()}</div>
              </div>
              <div className={`${t.cardBg} p-6 rounded-3xl border shadow-xl relative overflow-hidden`}>
                <div className="absolute right-4 top-4 p-3 bg-emerald-500/10 rounded-2xl text-emerald-400"><DollarSign className="w-6 h-6" /></div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Income Received</div>
                <div className="text-3xl font-black text-emerald-400 mt-2">NPR {totalIncome.toLocaleString()}</div>
              </div>
              <div className={`${t.cardBg} p-6 rounded-3xl border shadow-xl relative overflow-hidden`}>
                <div className="absolute right-4 top-4 p-3 bg-red-500/10 rounded-2xl text-red-400"><DollarSign className="w-6 h-6" /></div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Expenses</div>
                <div className="text-3xl font-black text-red-400 mt-2">NPR {totalExp.toLocaleString()}</div>
              </div>
              <div className={`${t.cardBg} p-6 rounded-3xl border shadow-xl relative overflow-hidden`}>
                <div className="absolute right-4 top-4 p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><DollarSign className="w-6 h-6" /></div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Profit / Cash</div>
                <div className="text-3xl font-black text-indigo-400 mt-2">NPR {netCash.toLocaleString()}</div>
              </div>
            </div>

            <div className={`${t.cardBg} rounded-3xl border p-6 shadow-2xl`}>
              <h3 className="text-lg font-bold text-white mb-4">Quick Financial Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3 bg-[#14171f] p-4 rounded-2xl border border-slate-800">
                  <div className="flex justify-between"><span className="text-slate-400">Total Invoices Generated:</span> <strong className="text-white">{repairs.length}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">Total Sales Value:</span> <strong className="text-white">NPR {totalSalesValue.toLocaleString()}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">Total Customer Due (Baaki):</span> <strong className="text-amber-400">NPR {totalDue.toLocaleString()}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">Supplier Due (Udhaaro):</span> <strong className="text-amber-400">NPR {totalSupplierDue.toLocaleString()}</strong></div>
                </div>
                <div className="space-y-3 bg-[#14171f] p-4 rounded-2xl border border-slate-800">
                  <div className="flex justify-between"><span className="text-slate-400">Device Trading Buy Total:</span> <strong className="text-white">NPR {totalDevicePurchase.toLocaleString()}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">Device Trading Sales Total:</span> <strong className="text-white">NPR {totalDeviceSales.toLocaleString()}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">Device Trading Profit:</span> <strong className="text-emerald-400">NPR {totalDeviceProfit.toLocaleString()}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">Parts Stock Valuation:</span> <strong className="text-emerald-400">NPR {inventory.reduce((sum, i) => sum + (Number(i.stock || 0) * Number(i.costPrice || 0)), 0).toLocaleString()}</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================= TAB 8: SHOP SETTINGS ================================= */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`${t.cardBg} rounded-3xl border p-6 shadow-2xl space-y-4`}>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" /> Shop & Invoice Profile
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Shop Name</label>
                  <input
                    type="text"
                    value={shopInfo.name}
                    onChange={(e) => setShopInfo({ ...shopInfo, name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={shopInfo.tagline}
                    onChange={(e) => setShopInfo({ ...shopInfo, tagline: e.target.value })}
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Address / Location</label>
                  <input
                    type="text"
                    value={shopInfo.address}
                    onChange={(e) => setShopInfo({ ...shopInfo, address: e.target.value })}
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={shopInfo.phone}
                    onChange={(e) => setShopInfo({ ...shopInfo, phone: e.target.value })}
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={shopInfo.panNo}
                    onChange={(e) => setShopInfo({ ...shopInfo, panNo: e.target.value })}
                    className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none`}
                  />
                </div>
              </div>
            </div>

            <div className={`${t.cardBg} rounded-3xl border p-6 shadow-2xl space-y-6`}>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-400" /> Data Backup & Restore
              </h3>
              <p className="text-xs text-slate-400">
                Download a complete JSON backup of all your shop repairs, inventory, devices, expenses, and settings. You can restore it anytime.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={exportData}
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Export Backup
                </button>
                <label className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" /> Import Backup
                  <input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* INVOICE PREVIEW & PRINT MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className={`${t.cardBg} rounded-3xl border max-w-3xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto`}>
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute right-6 top-6 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Printer className="w-5 h-5 text-blue-400" /> Invoice Preview ({selectedInvoice.id})
            </h3>

            <div className="bg-white p-4 rounded-2xl flex justify-center overflow-x-auto">
              <img src={generateInvoiceCanvas(selectedInvoice)} alt="Invoice" className="max-w-full h-auto rounded-xl shadow-lg" />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => downloadInvoiceImage(selectedInvoice)}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Image
              </button>
              <button
                onClick={() => printInvoice(selectedInvoice)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAY DUE / INSTALLMENT MODAL */}
      {payingExpense && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${t.cardBg} rounded-3xl border max-w-md w-full p-6 shadow-2xl space-y-4 relative`}>
            <button
              onClick={() => setPayingExpense(null)}
              className="absolute right-6 top-6 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white">Pay Due / Installment</h3>
            <p className="text-xs text-slate-400">
              Record payment for: <strong className="text-white">{payingExpense.description}</strong> ({payingExpense.supplierName || 'General'})
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Due Remaining</label>
                <div className="text-xl font-black text-amber-400">NPR {Number(payingExpense.dueAmount || 0).toLocaleString()}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Payment Amount (NPR)</label>
                <input
                  type="number"
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                  className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={payForm.date}
                  onChange={(e) => setPayForm({ ...payForm, date: e.target.value })}
                  className={`w-full px-4 py-3 rounded-2xl ${t.inputBg} border text-sm outline-none`}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setPayingExpense(null)}
                className="px-5 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-2xl text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  addExpensePayment(payingExpense.id, payForm.amount, payForm.date);
                  setPayingExpense(null);
                }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-600/30 transition"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
