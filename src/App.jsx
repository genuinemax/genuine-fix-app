// Genuine Fix PRO Premium GUI — customer CRM, warranty watch, quick actions, responsive polish
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './Login';
import React, { useState, useEffect } from 'react';
import { 
  Wrench, Package, FileText, LayoutDashboard, DollarSign, 
  Trash2, Printer, ShieldCheck, User, CreditCard, Search, Eye, ChevronRight, Download, Upload, ShoppingBag, MessageSquare, Plus, AlertTriangle, ArrowUpRight, ArrowDownRight, X, CheckCircle2, Image as ImageIcon, Pencil, Smartphone, Laptop, Settings, Sun, Moon, Monitor, Users, Bell, PlusCircle, History, Clock3, Filter
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
              className="w-full px-4 py-3 text-left hover:bg-blue-600/25 transition border-b border-slate-800 last:border-b-0"
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

// Supplier Autocomplete for Expenses Section
function SupplierAutocomplete({ value, onChange, onSelect, suppliers, placeholder, className }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || '');

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const suggestions = suppliers
    .filter(s => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || String(s.phone || '').includes(q);
    })
    .slice(0, 8);

  const handleInput = (e) => {
    const next = e.target.value;
    setQuery(next);
    onChange(next);
    setOpen(true);
  };

  const choose = (supplier) => {
    setQuery(supplier.name);
    onSelect(supplier);
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
          {suggestions.map((sup, idx) => (
            <button
              key={`${sup.name}-${sup.phone || 'no-phone'}-${idx}`}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(sup)}
              className="w-full px-4 py-3 text-left hover:bg-blue-600/25 transition border-b border-slate-800 last:border-b-0"
            >
              <div className="text-sm font-bold text-white">{sup.name}</div>
              {sup.phone && sup.phone !== 'N/A' && (
                <div className="text-sm text-slate-400 mt-0.5">{sup.phone}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
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

  // Theme / GUI Variety State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('gf_theme') || 'dim';
  });

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

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('gf_categories');
    return saved ? JSON.parse(saved) : [
      'Laptop Parts', 'Mobile Parts', 'Computer/Desktop Parts', 
      'Tablet Parts', 'Unlocking Tools & Credits', 'Accessories'
    ];
  });

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
      { id: 1, description: 'Shop Rent (Taalchowk)', amount: 15000, paidAmount: 15000, dueAmount: 0, category: 'Shop Rent', date: '2026-06-01', paymentMethod: 'Cash', supplierName: 'Landlord', notes: 'Monthly rent' }
    ];
  });

  const [stockPurchases, setStockPurchases] = useState(() => {
    const saved = localStorage.getItem('gf_stock_purchases');
    return saved ? JSON.parse(saved) : [];
  });

  // Unique Customers List
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

  // Unique Suppliers List extracted from existing expenses and stock purchases
  const uniqueSuppliers = Array.from(
    new Map(
      [
        ...expenses
          .filter(e => e.supplierName && e.supplierName !== 'N/A' && e.supplierName !== 'Unknown Supplier')
          .map(e => ({ name: e.supplierName, phone: e.supplierPhone || '' })),
        ...stockPurchases
          .filter(sp => sp.supplierName && sp.supplierName !== 'N/A')
          .map(sp => ({ name: sp.supplierName, phone: sp.supplierPhone || '' })),
        ...inventory
          .filter(inv => inv.supplierName)
          .map(inv => ({ name: inv.supplierName, phone: inv.supplierPhone || '' }))
      ]
        .filter(s => s.name)
        .map(s => [s.name.trim().toLowerCase(), { name: s.name.trim(), phone: s.phone || '' }])
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
  
  // Enhanced Expenses States with Payment Status & Autoname suggest
  const [newExpense, setNewExpense] = useState({ 
    description: '', amount: '', category: 'General', paymentStatus: 'Paid', paidNow: '', 
    itemName: '', quantity: '', unitCost: '', supplierName: '', 
    supplierPhone: '', invoiceNo: '', paymentMethod: 'Cash', notes: '', date: getLocalDateKey() 
  });
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [payingExpense, setPayingExpense] = useState(null);
  const [payForm, setPayForm] = useState({ amount: '', date: getLocalDateKey() });
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('All');
  const [expenseStatusFilter, setExpenseStatusFilter] = useState('All');
  const [viewingExpenseDetails, setViewingExpenseDetails] = useState(null);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceFilterTab, setInvoiceFilterTab] = useState('All');

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
  
  // Expense metrics
  const totalExp = expenses.reduce((acc, curr) => acc + Number(curr.amount !== undefined ? curr.amount : curr.paidAmount || 0), 0);
  const totalExpensePaid = expenses.reduce((acc, curr) => acc + Number(curr.paidAmount !== undefined ? curr.paidAmount : curr.amount || 0), 0);
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
  const netCash = totalIncome - totalExpensePaid;
  const todayKey = getLocalDateKey();
  const todayIncome = repairs
    .filter(r => String(r.dateTime || '').startsWith(todayKey) && !['Device Purchase', 'Parts Purchase'].includes(r.billType))
    .reduce((acc, curr) => acc + Number(curr.paidAmount || 0), 0);
  const todayExpense = expenses
    .filter(e => String(e.date || '') === todayKey)
    .reduce((acc, curr) => acc + Number(curr.paidAmount !== undefined ? curr.paidAmount : curr.amount || 0), 0);
  const todayNet = todayIncome - todayExpense;

  const exportData = () => {
    const backupData = {
      shopInfo, categories, repairs, inventory, devicesStock, expenses, stockPurchases, exportDate: getCurrentDateTime()
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

  const handleSupplierSelect = (supplierOrName) => {
    const selected = typeof supplierOrName === 'string'
      ? uniqueSuppliers.find(s => s.name.toLowerCase() === supplierOrName.trim().toLowerCase())
      : supplierOrName;
    const name = typeof supplierOrName === 'string' ? supplierOrName : supplierOrName.name;
    const phoneVal = selected?.phone || '';

    setNewExpense(prev => ({ ...prev, supplierName: name, supplierPhone: phoneVal || prev.supplierPhone }));
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

  const handleDeleteRepair = (id) => {
    if (window.confirm(`Are you sure you want to delete job history / bill #${id}?`)) {
      setRepairs(repairs.filter(r => r.id !== id));
    }
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
        paidAmount: totalPurchaseCost,
        dueAmount: 0,
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

  const restoreDeviceSale = (saleId) => {
    const sale = devicesStock.find(d => d.id === saleId);
    if (!sale || sale.tradeType !== 'sell' || !sale.linkedPurchaseId) return;
    if (!window.confirm(`Restore ${sale.brandModel || 'this device'} to In Stock? This will remove the sale record and its sale bill.`)) return;
    setDevicesStock(devicesStock.filter(d => d.id !== saleId).map(d => d.id === sale.linkedPurchaseId ? { ...d, status: 'In Stock', soldDate: '', soldRecordId: '' } : d));
    setRepairs(repairs.filter(r => !(r.billType === 'Device Sale' && r.linkedPurchaseId === sale.linkedPurchaseId)));
    setDeviceTradeTab('buy');
    alert('Sale restored. Device is back In Stock.');
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
    setExpenses([{ id: `EXP-${purchaseId}`, description: `Parts Purchase - ${updatedPart.name}`, category: 'Parts Purchase', amount: purchaseTotal, paidAmount: purchaseTotal, dueAmount: 0, payments: [{ amount: purchaseTotal, date: newStockPurchase.date }], quantity: qty, unitCost, itemName: updatedPart.name, supplierName: newStockPurchase.supplierName || 'N/A', supplierPhone: newStockPurchase.supplierPhone || '', invoiceNo: newStockPurchase.invoiceNo || '', paymentMethod: 'Cash', notes: newStockPurchase.notes || '', date: newStockPurchase.date, linkedStockPurchaseId: purchaseId }, ...expenses]);
    setNewStockPurchase({ partId: '', partName: '', category: categories[0] || 'Mobile Parts', supplierName: '', supplierPhone: '', qty: '', unitCost: '', date: todayKey, invoiceNo: '', notes: '' });
    alert(`Stock purchase saved. Total: NPR ${qty * unitCost}`);
  };

  // ==========================================
  // ENHANCED EXPENSES HANDLERS (Autoname & Paid/Unpaid)
  // ==========================================
  const handleAddExpense = (e) => {
    e.preventDefault();
    const qty = Number(newExpense.quantity || 0), unitCost = Number(newExpense.unitCost || 0);
    const calculatedAmount = (newExpense.category === 'Parts Purchase' || newExpense.category === 'Device Purchase') && qty > 0 && unitCost > 0 ? qty * unitCost : Number(newExpense.amount || 0);
    
    if (calculatedAmount <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }

    let paidNowVal = 0;
    let dueVal = 0;

    if (newExpense.paymentStatus === 'Paid') {
      paidNowVal = calculatedAmount;
      dueVal = 0;
    } else if (newExpense.paymentStatus === 'Unpaid') {
      paidNowVal = 0;
      dueVal = calculatedAmount;
    } else {
      // Partial
      const rawPaid = newExpense.paidNow === '' ? 0 : Number(newExpense.paidNow || 0);
      paidNowVal = Math.max(0, Math.min(rawPaid, calculatedAmount));
      dueVal = Math.max(0, calculatedAmount - paidNowVal);
    }

    if (editingExpenseId) {
      setExpenses(expenses.map(exp => exp.id === editingExpenseId ? {
        ...exp,
        description: newExpense.description || exp.description,
        category: newExpense.category || exp.category,
        amount: calculatedAmount,
        paidAmount: paidNowVal,
        dueAmount: dueVal,
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
      setNewExpense({ description: '', amount: '', category: 'General', paymentStatus: 'Paid', paidNow: '', itemName: '', quantity: '', unitCost: '', supplierName: '', supplierPhone: '', invoiceNo: '', paymentMethod: 'Cash', notes: '', date: todayKey });
      alert('Expense updated successfully!'); 
      return;
    }

    const expense = {
      id: Date.now(),
      description: newExpense.description || (newExpense.itemName ? `Purchase - ${newExpense.itemName}` : 'General Shop Expense'),
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
    setNewExpense({ description: '', amount: '', category: 'General', paymentStatus: 'Paid', paidNow: '', itemName: '', quantity: '', unitCost: '', supplierName: '', supplierPhone: '', invoiceNo: '', paymentMethod: 'Cash', notes: '', date: todayKey });
    alert(`Expense saved successfully. Paid: NPR ${paidNowVal}${dueVal > 0 ? ` | Due Udhaaro: NPR ${dueVal}` : ''}`);
  };

  const addExpensePayment = (id, amount, date) => {
    const payAmt = Number(amount || 0);
    if (payAmt <= 0) { alert('Enter a valid payment amount.'); return; }
    let overpaid = false;
    setExpenses(expenses.map(exp => {
      if (exp.id !== id) return exp;
      const currentDue = Number(exp.dueAmount || 0);
      const applied = Math.min(payAmt, currentDue);
      if (payAmt > currentDue) overpaid = true;
      const newPaid = Number(exp.paidAmount || 0) + applied;
      const newDue = Math.max(0, currentDue - applied);
      const newPayments = [...(exp.payments || []), { amount: applied, date: date || todayKey }];
      return { ...exp, paidAmount: newPaid, dueAmount: newDue, payments: newPayments };
    }));
    setPayingExpense(null);
    setPayForm({ amount: '', date: todayKey });
    if (overpaid) alert('Entered amount exceeded remaining due — only the due amount was applied.');
    else alert('Payment recorded successfully!');
  };

  const deleteExpense = (id) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  // Unique suggestions list for autocomplete description/autoname feature
  const uniqueExpenseDescriptions = Array.from(new Set(expenses.map(e => e.description).filter(Boolean)));

  const filteredExpenses = expenses.filter(exp => {
    const matchSearch = String(exp.description || '').toLowerCase().includes(expenseSearch.toLowerCase()) ||
      String(exp.supplierName || '').toLowerCase().includes(expenseSearch.toLowerCase()) ||
      String(exp.invoiceNo || '').toLowerCase().includes(expenseSearch.toLowerCase());
    const matchCat = expenseCategoryFilter === 'All' || exp.category === expenseCategoryFilter;
    const matchStatus = expenseStatusFilter === 'All' || 
      (expenseStatusFilter === 'Paid' && Number(exp.dueAmount || 0) <= 0) ||
      (expenseStatusFilter === 'Due' && Number(exp.dueAmount || 0) > 0);
    return matchSearch && matchCat && matchStatus;
  });

  const markInvoiceAsPaid = (id) => {
    setRepairs(repairs.map(r => r.id === id ? { ...r, paidAmount: r.totalCost, dueAmount: 0 } : r));
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
              <div className="flex items-center gap-2">
                <h1 className={`font-extrabold text-lg ${t.textMain} leading-tight tracking-tight`}>{shopInfo.name}</h1>
                <span className="px-1.5 py-0.5 rounded-md bg-blue-600/15 text-blue-400 border border-blue-500/20 text-[9px] font-black tracking-wider">PRO</span>
              </div>
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
                        <td className="py-4 text-right flex items-center justify-end gap-2">
                          <button onClick={() => setSelectedInvoice(r)} className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl text-sm font-bold inline-flex items-center gap-1">
                            <Eye size={14}/> Preview
                          </button>
                          <button onClick={() => handleDeleteRepair(r.id)} title="Delete Job History" className="p-1.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 rounded-xl text-sm font-bold inline-flex items-center">
                            <Trash2 size={14}/>
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
                <p className={`text-sm uppercase tracking-wider font-black ${t.textMuted}`}>Total Shop Expense Paid</p>
                <p className="text-2xl font-black text-rose-400 mt-2">NPR {totalExpensePaid}</p>
                <p className={`text-sm ${t.textMuted} mt-1`}>Cash actually paid out so far</p>
              </div>
              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-5 shadow-xl`}>
                <p className={`text-sm uppercase tracking-wider font-black ${t.textMuted}`}>Estimated Net Cash</p>
                <p className={`text-2xl font-black mt-2 ${netCash >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>NPR {netCash}</p>
                <p className={`text-sm ${t.textMuted} mt-1`}>Income received − expenses paid</p>
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
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-black px-2 py-1 rounded-full ${isRepair ? 'bg-emerald-500/10 text-emerald-400' : 'bg-violet-500/10 text-violet-400'}`}>
                                  {isRepair ? item.status : item.status || 'Device'}
                                </span>
                                {isRepair && (
                                  <button onClick={() => handleDeleteRepair(item.id)} title="Delete Job History" className="p-1.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 rounded-xl">
                                    <Trash2 size={14}/>
                                  </button>
                                )}
                              </div>
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

              <button type="submit" className="md:col-span-3 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition shadow-lg shadow-blue-600/30">
                Save & Print Job Sheet
              </button>
            </form>

            <div className={`${t.cardBg} border ${t.border} p-6 rounded-3xl shadow-xl space-y-4`}>
              <h3 className={`text-lg font-bold ${t.textMain}`}>Active & Saved Job Sheets</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={`${t.tableHeader} font-bold uppercase text-sm border-b`}>
                    <tr>
                      <th className="pb-3 text-left">ID</th>
                      <th className="pb-3 text-left">Customer</th>
                      <th className="pb-3 text-left">Device / Issue</th>
                      <th className="pb-3 text-left">Total</th>
                      <th className="pb-3 text-left">Due</th>
                      <th className="pb-3 text-left">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.tableDivide}`}>
                    {repairs.filter(r => !['Device Sale', 'Device Purchase', 'Accessories'].includes(r.billType)).map(r => (
                      <tr key={r.id}>
                        <td className="py-3 font-mono font-bold text-blue-400">{r.id}</td>
                        <td className={`py-3 ${t.textMain} font-medium`}>{r.customerName}</td>
                        <td className={`py-3 ${t.textMuted}`}>{r.model || r.deviceType}</td>
                        <td className={`py-3 ${t.textMain}`}>NPR {r.totalCost}</td>
                        <td className="py-3 font-bold text-rose-400">NPR {r.dueAmount}</td>
                        <td className="py-3">
                          <select value={r.status} onChange={e => {
                            const val = e.target.value;
                            setRepairs(repairs.map(item => item.id === r.id ? { ...item, status: val } : item));
                          }} className={`px-2 py-1 rounded-xl text-xs font-bold ${t.inputBg} border ${t.border}`}>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Ready for Pickup">Ready for Pickup</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="py-3 text-right flex items-center justify-end gap-2">
                          <button onClick={() => setSelectedInvoice(r)} className="px-2.5 py-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl text-xs font-bold inline-flex items-center gap-1">
                            <Eye size={12}/> View
                          </button>
                          <button onClick={() => handleDeleteRepair(r.id)} title="Delete Job History" className="p-1 bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 rounded-xl text-xs font-bold inline-flex items-center">
                            <Trash2 size={12}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DEVICE BUY / SELL TAB */}
        {activeTab === 'devices' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className={`text-sm uppercase tracking-[0.2em] font-black ${t.textMuted}`}>Second-Hand & New Device Trading</p>
                <h2 className={`text-2xl font-black ${t.textMain}`}>Device Buy & Sell Inventory</h2>
              </div>
              <div className={`inline-flex p-1 ${t.cardSecondary} border ${t.border} rounded-2xl`}>
                <button onClick={() => { setDeviceTradeTab('buy'); resetDeviceForm('buy'); }} className={`px-4 py-2 rounded-xl text-sm font-bold transition ${deviceTradeTab === 'buy' ? 'bg-blue-600 text-white shadow' : `${t.textMuted} hover:text-white`}`}>
                  Buy / Stock In
                </button>
                <button onClick={() => { setDeviceTradeTab('sell'); resetDeviceForm('sell'); }} className={`px-4 py-2 rounded-xl text-sm font-bold transition ${deviceTradeTab === 'sell' ? 'bg-blue-600 text-white shadow' : `${t.textMuted} hover:text-white`}`}>
                  Sell Device
                </button>
                <button onClick={() => setDeviceTradeTab('stock')} className={`px-4 py-2 rounded-xl text-sm font-bold transition ${deviceTradeTab === 'stock' ? 'bg-blue-600 text-white shadow' : `${t.textMuted} hover:text-white`}`}>
                  Stock Records ({devicesStock.length})
                </button>
              </div>
            </div>

            {deviceTradeTab === 'buy' && (
              <div className={`${t.cardBg} border ${t.border} p-6 rounded-3xl shadow-xl space-y-5`}>
                <h3 className={`text-lg font-bold ${t.textMain}`}>{editingDeviceId ? 'Edit Device Purchase Record' : 'Record New Device Purchase (Buy)'}</h3>
                <form onSubmit={handleAddDevice} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select value={newDevice.deviceCategory} onChange={e => setNewDevice({...newDevice, deviceCategory: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}>
                    <option value="Second-Hand Phone">Second-Hand Phone</option>
                    <option value="Second-Hand Laptop">Second-Hand Laptop</option>
                    <option value="Tablet / iPad">Tablet / iPad</option>
                    <option value="Smartwatch">Smartwatch</option>
                  </select>
                  <input type="text" placeholder="Brand & Model (e.g. iPhone 12 Pro 128GB)" value={newDevice.brandModel} onChange={e => setNewDevice({...newDevice, brandModel: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
                  <input type="text" placeholder="Condition (e.g. Good, Battery 88%)" value={newDevice.condition} onChange={e => setNewDevice({...newDevice, condition: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />

                  <div className="md:col-span-3 space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-wider ${t.textMuted}`}>IMEI / Serial Number(s)</label>
                    {(newDevice.imeiList?.length ? newDevice.imeiList : [newDevice.imeiOrSerial || '']).map((imeiVal, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          placeholder={`IMEI or Serial Number #${idx + 1}`}
                          value={imeiVal}
                          onChange={e => updateDeviceImeiField(idx, e.target.value)}
                          className={`flex-1 p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
                        />
                        {idx > 0 && (
                          <button type="button" onClick={() => removeDeviceImeiField(idx)} className="px-3 bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 rounded-2xl font-bold">
                            <Trash2 size={16}/>
                          </button>
                        )}
                      </div>
                    ))}
                    {!editingDeviceId && (
                      <button type="button" onClick={addDeviceImeiField} className="text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 mt-1">
                        <Plus size={14}/> Add another IMEI / unit in batch
                      </button>
                    )}
                  </div>

                  <CustomerAutocomplete
                    value={newDevice.partyName}
                    placeholder="Seller Name (Party)"
                    customers={uniqueCustomers}
                    onChange={value => setNewDevice(prev => ({ ...prev, partyName: value }))}
                    onSelect={customer => handleCustomerSelect(customer, 'device')}
                    className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none focus:border-blue-600`}
                  />
                  <input type="text" placeholder="Seller Phone" value={newDevice.partyPhone} onChange={e => setNewDevice({...newDevice, partyPhone: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                  <input type="text" placeholder="Seller Citizenship No." value={newDevice.citizenshipNo} onChange={e => setNewDevice({...newDevice, citizenshipNo: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />

                  <input type="number" placeholder="Buy Price (NPR)" value={newDevice.buyPrice} onChange={e => setNewDevice({...newDevice, buyPrice: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
                  <input type="number" placeholder="Expected Sell Price (NPR)" value={newDevice.sellPrice} onChange={e => setNewDevice({...newDevice, sellPrice: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                  <input type="text" placeholder="Warranty (e.g. 30 Days Store Warranty)" value={newDevice.warrantyMonths} onChange={e => setNewDevice({...newDevice, warrantyMonths: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />

                  <div className="md:col-span-3 flex items-center gap-3">
                    <button type="submit" className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition shadow-lg shadow-blue-600/30">
                      {editingDeviceId ? 'Update Purchase Record' : 'Save Device Purchase (Deduct Cash & Add Stock)'}
                    </button>
                    {editingDeviceId && (
                      <button type="button" onClick={() => resetDeviceForm('buy')} className="px-6 py-3.5 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold transition">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {deviceTradeTab === 'sell' && (
              <div className={`${t.cardBg} border ${t.border} p-6 rounded-3xl shadow-xl space-y-5`}>
                <h3 className={`text-lg font-bold ${t.textMain}`}>{editingDeviceId ? 'Edit Device Sale Record' : 'Sell Device from Stock'}</h3>
                <form onSubmit={handleAddDevice} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {!editingDeviceId && (
                    <div className="md:col-span-3">
                      <label className={`text-xs font-bold uppercase tracking-wider ${t.textMuted} mb-2 block`}>Select In-Stock Device</label>
                      <select value={selectedPurchaseId} onChange={e => {
                        const id = e.target.value;
                        setSelectedPurchaseId(id);
                        const found = devicesStock.find(d => d.id === id);
                        if (found) {
                          setNewDevice(prev => ({
                            ...prev,
                            brandModel: found.brandModel,
                            sellPrice: found.sellPrice || '',
                            warrantyMonths: found.warrantyMonths || ''
                          }));
                        }
                      }} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required>
                        <option value="">-- Choose available device --</option>
                        {devicesStock.filter(d => (d.tradeType || 'buy') === 'buy' && d.status !== 'Sold').map(d => (
                          <option key={d.id} value={d.id}>
                            {d.brandModel} [IMEI/S: {d.imeiOrSerial}] — Bought @ NPR {d.buyPrice}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <CustomerAutocomplete
                    value={newDevice.partyName}
                    placeholder="Buyer Name (Customer)"
                    customers={uniqueCustomers}
                    onChange={value => setNewDevice(prev => ({ ...prev, partyName: value }))}
                    onSelect={customer => handleCustomerSelect(customer, 'device')}
                    className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none focus:border-blue-600`}
                  />
                  <input type="text" placeholder="Buyer Phone" value={newDevice.partyPhone} onChange={e => setNewDevice({...newDevice, partyPhone: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                  <input type="number" placeholder="Selling Price (NPR)" value={newDevice.sellPrice} onChange={e => setNewDevice({...newDevice, sellPrice: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
                  <input type="text" placeholder="Warranty (e.g. 30 Days Store Warranty)" value={newDevice.warrantyMonths} onChange={e => setNewDevice({...newDevice, warrantyMonths: e.target.value})} className={`md:col-span-3 p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />

                  <div className="md:col-span-3 flex items-center gap-3">
                    <button type="submit" className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition shadow-lg shadow-emerald-600/30">
                      {editingDeviceId ? 'Update Sale Record' : 'Complete Sale & Generate Bill'}
                    </button>
                    {editingDeviceId && (
                      <button type="button" onClick={() => resetDeviceForm('sell')} className="px-6 py-3.5 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold transition">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {deviceTradeTab === 'stock' && (
              <div className={`${t.cardBg} border ${t.border} p-6 rounded-3xl shadow-xl space-y-4`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-bold ${t.textMain}`}>All Device Trade Records</h3>
                  <div className="flex gap-4 text-sm">
                    <span className="text-blue-400 font-bold">Total Bought: NPR {totalDevicePurchase}</span>
                    <span className="text-emerald-400 font-bold">Total Sales: NPR {totalDeviceSales}</span>
                    <span className="text-amber-400 font-bold">Profit: NPR {totalDeviceProfit}</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={`${t.tableHeader} font-bold uppercase text-sm border-b`}>
                      <tr>
                        <th className="pb-3 text-left">Type / ID</th>
                        <th className="pb-3 text-left">Model & IMEI</th>
                        <th className="pb-3 text-left">Party</th>
                        <th className="pb-3 text-left">Price (Buy/Sell)</th>
                        <th className="pb-3 text-left">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${t.tableDivide}`}>
                      {devicesStock.map(d => {
                        const isSell = d.tradeType === 'sell';
                        return (
                          <tr key={d.id}>
                            <td className="py-3 font-mono font-bold text-blue-400">
                              <span className={`px-2 py-0.5 rounded text-xs ${isSell ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                {isSell ? 'SALE' : 'BUY'}
                              </span>
                              <div className="text-xs text-slate-500 mt-0.5">{d.id}</div>
                            </td>
                            <td className={`py-3 ${t.textMain}`}>
                              <div className="font-bold">{d.brandModel}</div>
                              <div className="text-xs text-slate-400 font-mono">IMEI/S: {d.imeiOrSerial}</div>
                            </td>
                            <td className={`py-3 ${t.textMuted}`}>{d.partyName} ({d.partyPhone})</td>
                            <td className="py-3">
                              {isSell ? (
                                <div>
                                  <div className="text-emerald-400 font-bold">Sell: NPR {d.sellPrice}</div>
                                  <div className="text-xs text-amber-400">Profit: NPR {d.profit}</div>
                                </div>
                              ) : (
                                <div>
                                  <div className="text-blue-400 font-bold">Buy: NPR {d.buyPrice}</div>
                                  <div className="text-xs text-slate-400">Sell Est: NPR {d.sellPrice || '—'}</div>
                                </div>
                              )}
                            </td>
                            <td className="py-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${d.status === 'Sold' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                {d.status || 'In Stock'}
                              </span>
                            </td>
                            <td className="py-3 text-right flex items-center justify-end gap-2">
                              {!isSell && d.status !== 'Sold' && (
                                <button onClick={() => {
                                  setDeviceTradeTab('sell');
                                  setSelectedPurchaseId(d.id);
                                  setNewDevice(prev => ({ ...prev, brandModel: d.brandModel, sellPrice: d.sellPrice || '', warrantyMonths: d.warrantyMonths || '' }));
                                }} className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 rounded-xl text-xs font-bold">
                                  Sell
                                </button>
                              )}
                              {isSell && (
                                <button onClick={() => restoreDeviceSale(d.id)} className="px-2.5 py-1 bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 rounded-xl text-xs font-bold">
                                  Restore Stock
                                </button>
                              )}
                              <button onClick={() => {
                                if (isSell) {
                                  setDeviceTradeTab('sell');
                                  setEditingDeviceId(d.id);
                                  setNewDevice(prev => ({ ...prev, tradeType: 'sell', partyName: d.partyName, partyPhone: d.partyPhone, sellPrice: d.sellPrice, warrantyMonths: d.warrantyMonths || '' }));
                                } else {
                                  setDeviceTradeTab('buy');
                                  setEditingDeviceId(d.id);
                                  setNewDevice(prev => ({ ...prev, tradeType: 'buy', deviceCategory: d.deviceCategory, brandModel: d.brandModel, imeiOrSerial: d.imeiOrSerial, imeiList: d.imeis || [d.imeiOrSerial], condition: d.condition, partyName: d.partyName, partyPhone: d.partyPhone, buyPrice: d.buyPrice, sellPrice: d.sellPrice, warrantyMonths: d.warrantyMonths || '' }));
                                }
                              }} className="p-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl">
                                <Pencil size={12}/>
                              </button>
                              <button onClick={() => {
                                if (window.confirm('Delete this device record?')) {
                                  if (isSell) restoreDeviceSale(d.id);
                                  setDevicesStock(devicesStock.filter(item => item.id !== d.id));
                                }
                              }} className="p-1 bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 rounded-xl">
                                <Trash2 size={12}/>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ACCESSORIES BILL / POS TAB */}
        {activeTab === 'pos' && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
            <div>
              <p className={`text-sm uppercase tracking-[0.2em] font-black ${t.textMuted}`}>Point of Sale & Accessories</p>
              <h2 className={`text-2xl font-black ${t.textMain}`}>Direct Counter Billing</h2>
            </div>

            <form onSubmit={handleSavePosBill} className={`${t.cardBg} border ${t.border} p-6 rounded-3xl shadow-xl space-y-6`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomerAutocomplete
                  value={posBill.customerName}
                  placeholder="Customer Full Name (Optional)"
                  customers={uniqueCustomers}
                  onChange={value => setPosBill(prev => ({ ...prev, customerName: value }))}
                  onSelect={customer => handleCustomerSelect(customer, 'pos')}
                  className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none focus:border-blue-600`}
                />
                <input type="text" placeholder="Customer Phone (Optional)" value={posBill.phone} onChange={e => setPosBill({...posBill, phone: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className={`text-sm font-bold uppercase tracking-wider ${t.textMuted}`}>Bill Items</label>
                  <button type="button" onClick={() => setPosBill({...posBill, items: [...posBill.items, { name: '', price: '', qty: 1 }]})} className="text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1">
                    <Plus size={14}/> Add Item
                  </button>
                </div>

                {posBill.items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <select
                      value={item.name}
                      onChange={e => {
                        const name = e.target.value;
                        const match = inventory.find(i => i.name === name);
                        const nextItems = [...posBill.items];
                        nextItems[index].name = name;
                        if (match) nextItems[index].price = match.price;
                        setPosBill({ ...posBill, items: nextItems });
                      }}
                      className={`flex-2 p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
                    >
                      <option value="">-- Select stock item or type below --</option>
                      {inventory.map(inv => (
                        <option key={inv.id} value={inv.name}>
                          {inv.name} (Stock: {inv.stock} | NPR {inv.price})
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Item Name / Accessory"
                      value={item.name}
                      onChange={e => {
                        const nextItems = [...posBill.items];
                        nextItems[index].name = e.target.value;
                        setPosBill({ ...posBill, items: nextItems });
                      }}
                      className={`flex-2 p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
                      required
                    />

                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={e => {
                        const nextItems = [...posBill.items];
                        nextItems[index].qty = e.target.value;
                        setPosBill({ ...posBill, items: nextItems });
                      }}
                      className={`w-20 p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
                      required
                    />

                    <input
                      type="number"
                      placeholder="Price (NPR)"
                      value={item.price}
                      onChange={e => {
                        const nextItems = [...posBill.items];
                        nextItems[index].price = e.target.value;
                        setPosBill({ ...posBill, items: nextItems });
                      }}
                      className={`w-32 p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
                      required
                    />

                    {posBill.items.length > 1 && (
                      <button type="button" onClick={() => setPosBill({...posBill, items: posBill.items.filter((_, i) => i !== index)})} className="p-3 bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 rounded-2xl">
                        <Trash2 size={16}/>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                <input type="number" placeholder="Paid Amount (NPR) — leave blank if full paid" value={posBill.paidAmount} onChange={e => setPosBill({...posBill, paidAmount: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                <input type="text" placeholder="Warranty (e.g. 7 Days Replacement)" value={posBill.warrantyMonths} onChange={e => setPosBill({...posBill, warrantyMonths: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              </div>

              <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition shadow-lg shadow-blue-600/30">
                Complete Sale & Generate Invoice
              </button>
            </form>
          </div>
        )}

        {/* INVOICES & BILLS TAB */}
        {activeTab === 'invoices' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <p className={`text-sm uppercase tracking-[0.2em] font-black ${t.textMuted}`}>Billing Records</p>
                <h2 className={`text-2xl font-black ${t.textMain}`}>Invoices & Job Sheets Archive</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className={`flex items-center gap-2 ${t.inputBg} border ${t.border} rounded-2xl px-3 py-2 w-64`}>
                  <Search size={16} className={t.textMuted} />
                  <input
                    value={invoiceSearch}
                    onChange={e => setInvoiceSearch(e.target.value)}
                    placeholder="Search invoice #, customer..."
                    className="bg-transparent outline-none text-sm w-full"
                  />
                </div>
                <div className={`inline-flex p-1 ${t.cardSecondary} border ${t.border} rounded-2xl`}>
                  {['All', 'Repair', 'Accessories', 'Devices', 'Due', 'Paid'].map(tab => (
                    <button key={tab} onClick={() => setInvoiceFilterTab(tab)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${invoiceFilterTab === tab ? 'bg-blue-600 text-white shadow' : `${t.textMuted} hover:text-white`}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl shadow-xl overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={`${t.tableHeader} font-bold uppercase text-sm border-b`}>
                    <tr>
                      <th className="p-4 text-left">Invoice ID</th>
                      <th className="p-4 text-left">Customer / Phone</th>
                      <th className="p-4 text-left">Device / Items</th>
                      <th className="p-4 text-left">Total</th>
                      <th className="p-4 text-left">Due</th>
                      <th className="p-4 text-left">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.tableDivide}`}>
                    {filteredInvoices.map(inv => {
                      const isPaid = Number(inv.dueAmount || 0) <= 0;
                      return (
                        <tr key={inv.id} className="hover:bg-blue-600/5 transition">
                          <td className="p-4 font-mono font-bold text-blue-400">{inv.id}</td>
                          <td className="p-4">
                            <div className={`font-bold ${t.textMain}`}>{inv.customerName}</div>
                            <div className={`text-xs ${t.textMuted}`}>{inv.phone}</div>
                          </td>
                          <td className="p-4">
                            <div className={`${t.textMain} font-medium`}>{inv.model || inv.issue}</div>
                            <div className={`text-xs ${t.textMuted}`}>{inv.dateTime}</div>
                          </td>
                          <td className={`p-4 font-bold ${t.textMain}`}>NPR {inv.totalCost}</td>
                          <td className="p-4">
                            <span className={`font-bold ${Number(inv.dueAmount || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              NPR {inv.dueAmount}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isPaid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                              {isPaid ? 'Paid' : 'Due Due'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!isPaid && (
                                <button onClick={() => markInvoiceAsPaid(inv.id)} className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 rounded-xl text-xs font-bold">
                                  Mark Paid
                                </button>
                              )}
                              <button onClick={() => setSelectedInvoice(inv)} className="px-2.5 py-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl text-xs font-bold inline-flex items-center gap-1">
                                <Eye size={12}/> View
                              </button>
                              <button onClick={() => printInvoice(inv)} className="p-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-200 rounded-xl">
                                <Printer size={14}/>
                              </button>
                              <button onClick={() => sendToWhatsApp(inv)} className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl">
                                <MessageSquare size={14}/>
                              </button>
                              <button onClick={() => handleDeleteRepair(inv.id)} title="Delete Job History" className="p-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 rounded-xl">
                                <Trash2 size={14}/>
                              </button>
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

        {/* PARTS INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className={`text-sm uppercase tracking-[0.2em] font-black ${t.textMuted}`}>Inventory Control</p>
                <h2 className={`text-2xl font-black ${t.textMain}`}>Parts Stock & Supplier Purchases</h2>
              </div>
              <div className={`flex items-center gap-2 ${t.cardSecondary} p-1.5 rounded-2xl border ${t.border}`}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${selectedCategory === cat ? 'bg-blue-600 text-white shadow' : `${t.textMuted} hover:text-white`}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`${t.cardBg} border ${t.border} p-6 rounded-3xl shadow-xl space-y-4`}>
                <h3 className={`text-lg font-bold ${t.textMain}`}>{editingPartId ? 'Edit Part' : `Add New Part in [${selectedCategory}]`}</h3>
                <form onSubmit={handleAddPart} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" placeholder="Part Name (e.g. iPhone 13 OLED Screen)" value={newPart.name} onChange={e => setNewPart({...newPart, name: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
                  <input type="number" placeholder="Initial Stock Qty" value={newPart.stock} onChange={e => setNewPart({...newPart, stock: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
                  <input type="number" placeholder="Cost Price (NPR)" value={newPart.costPrice} onChange={e => setNewPart({...newPart, costPrice: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
                  <input type="number" placeholder="Selling Price (NPR)" value={newPart.price} onChange={e => setNewPart({...newPart, price: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
                  <input type="text" placeholder="Supplier Name" value={newPart.supplierName} onChange={e => setNewPart({...newPart, supplierName: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                  <input type="text" placeholder="Supplier Phone" value={newPart.supplierPhone} onChange={e => setNewPart({...newPart, supplierPhone: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />

                  <button type="submit" className="md:col-span-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition shadow-lg shadow-blue-600/30">
                    {editingPartId ? 'Update Part Item' : 'Save New Part Item'}
                  </button>
                </form>
              </div>

              <div className={`${t.cardBg} border ${t.border} p-6 rounded-3xl shadow-xl space-y-4`}>
                <h3 className={`text-lg font-bold ${t.textMain}`}>Restock Existing Part</h3>
                <form onSubmit={handleAddStockPurchase} className="space-y-3">
                  <select value={newStockPurchase.partId} onChange={e => {
                    const id = e.target.value;
                    const p = inventory.find(i => String(i.id) === id);
                    setNewStockPurchase(prev => ({
                      ...prev,
                      partId: id,
                      partName: p ? p.name : '',
                      category: p ? p.category : prev.category,
                      unitCost: p ? p.costPrice : ''
                    }));
                  }} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}>
                    <option value="">-- Choose part to restock --</option>
                    {inventory.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.name} (Current Stock: {i.stock})
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Restock Qty" value={newStockPurchase.qty} onChange={e => setNewStockPurchase({...newStockPurchase, qty: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
                    <input type="number" placeholder="Unit Cost (NPR)" value={newStockPurchase.unitCost} onChange={e => setNewStockPurchase({...newStockPurchase, unitCost: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
                  </div>

                  <input type="text" placeholder="Supplier Name" value={newStockPurchase.supplierName} onChange={e => setNewStockPurchase({...newStockPurchase, supplierName: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                  <input type="text" placeholder="Invoice No. / Bill Ref" value={newStockPurchase.invoiceNo} onChange={e => setNewStockPurchase({...newStockPurchase, invoiceNo: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />

                  <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition shadow-lg shadow-emerald-600/30">
                    Confirm Stock Restock & Record Expense
                  </button>
                </form>
              </div>
            </div>

            <div className={`${t.cardBg} border ${t.border} p-6 rounded-3xl shadow-xl space-y-4`}>
              <h3 className={`text-lg font-bold ${t.textMain}`}>Parts in Stock [{selectedCategory}]</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={`${t.tableHeader} font-bold uppercase text-sm border-b`}>
                    <tr>
                      <th className="pb-3 text-left">Part Name</th>
                      <th className="pb-3 text-left">Stock</th>
                      <th className="pb-3 text-left">Cost Price</th>
                      <th className="pb-3 text-left">Selling Price</th>
                      <th className="pb-3 text-left">Supplier</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.tableDivide}`}>
                    {inventory.filter(i => i.category === selectedCategory).map(item => (
                      <tr key={item.id}>
                        <td className={`py-3 font-bold ${t.textMain}`}>{item.name}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${Number(item.stock || 0) <= Number(item.minStock || 5) ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                            {item.stock} units
                          </span>
                        </td>
                        <td className={`py-3 ${t.textMuted}`}>NPR {item.costPrice}</td>
                        <td className={`py-3 font-bold ${t.textMain}`}>NPR {item.price}</td>
                        <td className={`py-3 ${t.textMuted}`}>{item.supplierName || '—'}</td>
                        <td className="py-3 text-right flex items-center justify-end gap-2">
                          <button onClick={() => {
                            setSelectedCategory(item.category);
                            setEditingPartId(item.id);
                            setNewPart({ name: item.name, stock: item.stock, costPrice: item.costPrice, price: item.price, minStock: item.minStock || '5', supplierName: item.supplierName || '', supplierPhone: item.supplierPhone || '', purchaseDate: item.lastPurchaseDate || todayKey });
                          }} className="p-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl">
                            <Pencil size={14}/>
                          </button>
                          <button onClick={() => {
                            if (window.confirm(`Delete part ${item.name}?`)) {
                              setInventory(inventory.filter(i => i.id !== item.id));
                            }
                          }} className="p-1 bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 rounded-xl">
                            <Trash2 size={14}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* EXPENSES TAB */}
        {activeTab === 'expenses' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <p className={`text-sm uppercase tracking-[0.2em] font-black ${t.textMuted}`}>Shop Ledger</p>
                <h2 className={`text-2xl font-black ${t.textMain}`}>Expenses & Supplier Dues (Udhaaro)</h2>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className={`${t.cardBg} border ${t.border} px-4 py-2.5 rounded-2xl`}>
                  <p className="text-xs uppercase text-slate-400 font-bold">Total Expense Paid</p>
                  <p className="text-lg font-black text-rose-400">NPR {totalExpensePaid}</p>
                </div>
                <div className={`${t.cardBg} border ${t.border} px-4 py-2.5 rounded-2xl`}>
                  <p className="text-xs uppercase text-slate-400 font-bold">Supplier Due (Udhaaro)</p>
                  <p className="text-lg font-black text-amber-400">NPR {totalSupplierDue}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`${t.cardBg} border ${t.border} p-6 rounded-3xl shadow-xl lg:col-span-1 space-y-4`}>
                <h3 className={`text-lg font-bold ${t.textMain}`}>{editingExpenseId ? 'Edit Expense Record' : 'Record New Expense'}</h3>
                <form onSubmit={handleAddExpense} className="space-y-3">
                  <div>
                    <label className={`text-xs font-bold uppercase tracking-wider ${t.textMuted} mb-1 block`}>Expense Category</label>
                    <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}>
                      <option value="General">General Shop Expense</option>
                      <option value="Shop Rent">Shop Rent</option>
                      <option value="Electricity / Internet">Electricity / Internet</option>
                      <option value="Parts Purchase">Parts Purchase</option>
                      <option value="Device Purchase">Device Purchase</option>
                      <option value="Salary / Staff">Salary / Staff</option>
                      <option value="Tea & Snacks">Tea & Snacks</option>
                      <option value="Transport">Transport</option>
                    </select>
                  </div>

                  <div>
                    <label className={`text-xs font-bold uppercase tracking-wider ${t.textMuted} mb-1 block`}>Description / Autoname</label>
                    <input
                      type="text"
                      list="expense-desc-suggestions"
                      placeholder="e.g. Shop Rent for June"
                      value={newExpense.description}
                      onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                      className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
                    />
                    <datalist id="expense-desc-suggestions">
                      {uniqueExpenseDescriptions.map((desc, idx) => <option key={idx} value={desc} />)}
                    </datalist>
                  </div>

                  {(newExpense.category === 'Parts Purchase' || newExpense.category === 'Device Purchase') ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={`text-xs font-bold uppercase tracking-wider ${t.textMuted} mb-1 block`}>Quantity</label>
                        <input type="number" placeholder="Qty" value={newExpense.quantity} onChange={e => setNewExpense({...newExpense, quantity: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                      </div>
                      <div>
                        <label className={`text-xs font-bold uppercase tracking-wider ${t.textMuted} mb-1 block`}>Unit Cost (NPR)</label>
                        <input type="number" placeholder="Unit Cost" value={newExpense.unitCost} onChange={e => setNewExpense({...newExpense, unitCost: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className={`text-xs font-bold uppercase tracking-wider ${t.textMuted} mb-1 block`}>Total Amount (NPR)</label>
                      <input type="number" placeholder="Amount" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
                    </div>
                  )}

                  <div>
                    <label className={`text-xs font-bold uppercase tracking-wider ${t.textMuted} mb-1 block`}>Payment Status</label>
                    <select value={newExpense.paymentStatus} onChange={e => setNewExpense({...newExpense, paymentStatus: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}>
                      <option value="Paid">Fully Paid Now</option>
                      <option value="Unpaid">Unpaid (Udhaaro / Due)</option>
                      <option value="Partial">Partial Payment</option>
                    </select>
                  </div>

                  {newExpense.paymentStatus === 'Partial' && (
                    <div>
                      <label className={`text-xs font-bold uppercase tracking-wider ${t.textMuted} mb-1 block`}>Paid Amount Now (NPR)</label>
                      <input type="number" placeholder="Paid Now" value={newExpense.paidNow} onChange={e => setNewExpense({...newExpense, paidNow: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                    </div>
                  )}

                  <div>
                    <label className={`text-xs font-bold uppercase tracking-wider ${t.textMuted} mb-1 block`}>Supplier Name</label>
                    <SupplierAutocomplete
                      value={newExpense.supplierName}
                      placeholder="Supplier / Party Name"
                      suppliers={uniqueSuppliers}
                      onChange={value => setNewExpense(prev => ({ ...prev, supplierName: value }))}
                      onSelect={sup => handleSupplierSelect(sup)}
                      className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none focus:border-blue-600`}
                    />
                  </div>

                  <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition shadow-lg shadow-blue-600/30">
                    {editingExpenseId ? 'Update Expense' : 'Save Expense Record'}
                  </button>
                </form>
              </div>

              <div className={`${t.cardBg} border ${t.border} p-6 rounded-3xl shadow-xl lg:col-span-2 space-y-4`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className={`flex items-center gap-2 ${t.inputBg} border ${t.border} rounded-2xl px-3 py-2 w-72`}>
                    <Search size={16} className={t.textMuted} />
                    <input
                      value={expenseSearch}
                      onChange={e => setExpenseSearch(e.target.value)}
                      placeholder="Search description or supplier..."
                      className="bg-transparent outline-none text-sm w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select value={expenseCategoryFilter} onChange={e => setExpenseCategoryFilter(e.target.value)} className={`p-2 ${t.inputBg} border rounded-xl text-xs font-bold`}>
                      <option value="All">All Categories</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      <option value="Shop Rent">Shop Rent</option>
                      <option value="General">General</option>
                    </select>
                    <select value={expenseStatusFilter} onChange={e => setExpenseStatusFilter(e.target.value)} className={`p-2 ${t.inputBg} border rounded-xl text-xs font-bold`}>
                      <option value="All">All Status</option>
                      <option value="Paid">Paid</option>
                      <option value="Due">Due / Udhaaro</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={`${t.tableHeader} font-bold uppercase text-sm border-b`}>
                      <tr>
                        <th className="pb-3 text-left">Date / Desc</th>
                        <th className="pb-3 text-left">Category & Supplier</th>
                        <th className="pb-3 text-left">Amount</th>
                        <th className="pb-3 text-left">Due</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${t.tableDivide}`}>
                      {filteredExpenses.map(exp => {
                        const dueVal = Number(exp.dueAmount || 0);
                        const paidVal = Number(exp.paidAmount !== undefined ? exp.paidAmount : exp.amount || 0);
                        const totalVal = Number(exp.amount || paidVal + dueVal);
                        return (
                          <tr key={exp.id}>
                            <td className="py-3">
                              <div className={`font-bold ${t.textMain}`}>{exp.description}</div>
                              <div className={`text-xs ${t.textMuted}`}>{exp.date}</div>
                            </td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400 font-bold">{exp.category}</span>
                              <div className={`text-xs ${t.textMuted} mt-0.5`}>{exp.supplierName || 'N/A'}</div>
                            </td>
                            <td className={`py-3 font-bold ${t.textMain}`}>NPR {totalVal}</td>
                            <td className="py-3">
                              <span className={`font-bold ${dueVal > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                NPR {dueVal}
                              </span>
                            </td>
                            <td className="py-3 text-right flex items-center justify-end gap-2">
                              {dueVal > 0 && (
                                <button onClick={() => setPayingExpense(exp)} className="px-2.5 py-1 bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 rounded-xl text-xs font-bold">
                                  Pay Due
                                </button>
                              )}
                              <button onClick={() => {
                                setEditingExpenseId(exp.id);
                                setNewExpense({
                                  description: exp.description, amount: exp.amount || '', category: exp.category,
                                  paymentStatus: dueVal > 0 && paidVal > 0 ? 'Partial' : dueVal > 0 ? 'Unpaid' : 'Paid',
                                  paidNow: paidVal, itemName: exp.itemName || '', quantity: exp.quantity || '',
                                  unitCost: exp.unitCost || '', supplierName: exp.supplierName || '', supplierPhone: exp.supplierPhone || '',
                                  invoiceNo: exp.invoiceNo || '', paymentMethod: exp.paymentMethod || 'Cash', notes: exp.notes || '', date: exp.date
                                });
                              }} className="p-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl">
                                <Pencil size={14}/>
                              </button>
                              <button onClick={() => deleteExpense(exp.id)} className="p-1 bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 rounded-xl">
                                <Trash2 size={14}/>
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
          </div>
        )}

        {/* BACKUP & RESTORE TAB */}
        {activeTab === 'backup' && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
            <div>
              <p className={`text-sm uppercase tracking-[0.2em] font-black ${t.textMuted}`}>Data Security</p>
              <h2 className={`text-2xl font-black ${t.textMain}`}>Backup & Restore Shop Data</h2>
            </div>
            <div className={`${t.cardBg} border ${t.border} p-8 rounded-3xl shadow-xl space-y-6 text-center`}>
              <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
                <Download size={32} />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${t.textMain}`}>Download JSON Backup</h3>
                <p className={`text-sm ${t.textMuted} mt-1`}>Save all repairs, customers, inventory, devices and expenses to your device.</p>
              </div>
              <button onClick={exportData} className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition shadow-lg shadow-blue-600/35">
                Download Backup File
              </button>
            </div>

            <div className={`${t.cardBg} border ${t.border} p-8 rounded-3xl shadow-xl space-y-6 text-center`}>
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <Upload size={32} />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${t.textMain}`}>Restore from Backup File</h3>
                <p className={`text-sm ${t.textMuted} mt-1`}>Upload a previously downloaded JSON backup file to restore shop records.</p>
              </div>
              <label className="inline-block px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold cursor-pointer transition shadow-lg shadow-emerald-600/35">
                Select Backup File to Restore
                <input type="file" accept=".json" onChange={importData} className="hidden" />
              </label>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
            <div>
              <p className={`text-sm uppercase tracking-[0.2em] font-black ${t.textMuted}`}>Configuration</p>
              <h2 className={`text-2xl font-black ${t.textMain}`}>Shop Settings & Preferences</h2>
            </div>

            <div className={`${t.cardBg} border ${t.border} p-6 rounded-3xl shadow-xl space-y-5`}>
              <h3 className={`text-lg font-bold ${t.textMain}`}>Shop Profile & Invoice Header</h3>
              <div className="space-y-4">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider ${t.textMuted} mb-1 block`}>Shop Name</label>
                  <input type="text" value={shopInfo.name} onChange={e => setShopInfo({...shopInfo, name: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                </div>
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider ${t.textMuted} mb-1 block`}>Tagline</label>
                  <input type="text" value={shopInfo.tagline} onChange={e => setShopInfo({...shopInfo, tagline: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                </div>
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider ${t.textMuted} mb-1 block`}>Address / Location</label>
                  <input type="text" value={shopInfo.address} onChange={e => setShopInfo({...shopInfo, address: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-xs font-bold uppercase tracking-wider ${t.textMuted} mb-1 block`}>Phone Number</label>
                    <input type="text" value={shopInfo.phone} onChange={e => setShopInfo({...shopInfo, phone: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                  </div>
                  <div>
                    <label className={`text-xs font-bold uppercase tracking-wider ${t.textMuted} mb-1 block`}>PAN No.</label>
                    <input type="text" value={shopInfo.panNo} onChange={e => setShopInfo({...shopInfo, panNo: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                  </div>
                </div>
              </div>
            </div>

            <div className={`${t.cardBg} border ${t.border} p-6 rounded-3xl shadow-xl space-y-4`}>
              <h3 className={`text-lg font-bold ${t.textMain}`}>Theme Appearance</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  ['dim', 'Dark Dim', Moon],
                  ['dark', 'Pitch Black', Monitor],
                  ['light', 'Clean Light', Sun]
                ].map(([id, label, Icon]) => (
                  <button key={id} onClick={() => setTheme(id)} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition ${theme === id ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : `${t.cardSecondary} ${t.border} ${t.textMuted} hover:text-white`}`}>
                    <Icon size={20} />
                    <span className="text-xs font-bold">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* INVOICE PREVIEW MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className={`${t.cardBg} border ${t.border} rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-700/50">
              <div>
                <h3 className={`text-xl font-black ${t.textMain}`}>Invoice Preview #{selectedInvoice.id}</h3>
                <p className={`text-sm ${t.textMuted}`}>{selectedInvoice.dateTime}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-full">
                <X size={18}/>
              </button>
            </div>

            <div className={`${t.cardSecondary} border ${t.border} p-5 rounded-2xl space-y-4`}>
              <div className="flex justify-between">
                <div>
                  <p className={`text-xs uppercase font-bold text-slate-400`}>Customer Name</p>
                  <p className={`text-base font-bold ${t.textMain}`}>{selectedInvoice.customerName}</p>
                  <p className={`text-sm text-slate-400`}>Phone: {selectedInvoice.phone}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs uppercase font-bold text-slate-400`}>Warranty</p>
                  <p className={`text-sm font-bold text-amber-400`}>{selectedInvoice.warrantyMonths || '—'}</p>
                </div>
              </div>

              <div className="border-t pt-3 border-slate-700/50">
                <p className={`text-xs uppercase font-bold text-slate-400 mb-2`}>Items / Services</p>
                {(selectedInvoice.items || [{ name: selectedInvoice.model || selectedInvoice.issue, price: selectedInvoice.totalCost, qty: 1 }]).map((it, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-1">
                    <span className={t.textMain}>{it.name} (x{it.qty || 1})</span>
                    <span className="font-bold text-blue-400">NPR {(it.price || 0) * (it.qty || 1)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 border-slate-700/50 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Cost:</span>
                  <span className={`font-bold ${t.textMain}`}>NPR {selectedInvoice.totalCost}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Amount Paid:</span>
                  <span className="font-bold text-emerald-400">NPR {selectedInvoice.paidAmount}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-1 border-slate-700/50">
                  <span className="font-bold text-slate-300">Balance Due:</span>
                  <span className={`font-bold ${Number(selectedInvoice.dueAmount) > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    NPR {selectedInvoice.dueAmount}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => printInvoice(selectedInvoice)} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg">
                <Printer size={16}/> Print / PDF
              </button>
              <button onClick={() => downloadInvoiceImage(selectedInvoice)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                <Download size={16}/> Download Image
              </button>
              <button onClick={() => sendToWhatsApp(selectedInvoice)} className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                <MessageSquare size={16}/> WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAY DUE EXPENSE MODAL */}
      {payingExpense && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${t.cardBg} border ${t.border} rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-700/50">
              <h3 className={`text-lg font-bold ${t.textMain}`}>Pay Due (Udhaaro)</h3>
              <button onClick={() => setPayingExpense(null)} className="p-1 text-slate-400 hover:text-white">
                <X size={18}/>
              </button>
            </div>
            <div>
              <p className={`text-sm ${t.textMuted}`}>{payingExpense.description}</p>
              <p className="text-lg font-black text-amber-400 mt-1">Remaining Due: NPR {payingExpense.dueAmount}</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider ${t.textMuted} mb-1 block`}>Payment Amount (NPR)</label>
                <input
                  type="number"
                  placeholder="Enter amount to pay"
                  value={payForm.amount}
                  onChange={e => setPayForm({...payForm, amount: e.target.value})}
                  className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => addExpensePayment(payingExpense.id, payForm.amount, payForm.date)} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition">
                Record Payment
              </button>
              <button onClick={() => setPayingExpense(null)} className="px-5 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
