// Genuine Fix PRO Premium GUI — customer CRM, warranty watch, quick actions, responsive polish
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './Login';
import React, { useState, useEffect } from 'react';
import { 
  Wrench, Package, FileText, LayoutDashboard, DollarSign, 
  Trash2, Printer, ShieldCheck, User, CreditCard, Search, Eye, ChevronRight, Download, Upload, ShoppingBag, MessageSquare, Plus, AlertTriangle, ArrowUpRight, ArrowDownRight, X, CheckCircle2, Image as ImageIcon, Pencil, Smartphone, Laptop, Settings, Sun, Moon, Monitor, Users, Bell, PlusCircle, History, Clock3, Filter, ClipboardList
} from 'lucide-react';


































const normalizePartsStockNotes = (value) => {
  const text = String(value || '').replace(/\r\n?/g, '\n');
  const lines = text.split('\n');
  const output = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;

    if (/^[•▪*-]$/.test(line)) {
      let next = i + 1;
      while (next < lines.length && !lines[next].trim()) next += 1;
      if (next < lines.length) {
        output.push(`${line}${lines[next].trim()}`);
        i = next;
      } else {
        output.push(line);
      }
    } else {
      output.push(line);
    }
  }

  return output.join('\n');
};

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


function InventoryAutocomplete({ value, onChange, onSelect, inventory, placeholder, className }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || '');

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const suggestions = inventory
    .filter(item => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return String(item.name || '').toLowerCase().includes(q) ||
        String(item.category || '').toLowerCase().includes(q) ||
        String(item.supplierName || '').toLowerCase().includes(q);
    })
    .slice(0, 12);

  const handleInput = (e) => {
    const next = e.target.value;
    setQuery(next);
    onChange(next);
    setOpen(true);
  };

  const choose = (item) => {
    setQuery(item.name);
    onSelect(item);
    setOpen(false);
  };

  return (
    <div className="relative flex-1 min-w-0">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className={`${className} pl-9`}
          autoComplete="off"
          required
        />
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
          {suggestions.map(item => (
            <button
              key={item.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(item)}
              className="w-full px-4 py-3 text-left hover:bg-blue-600/25 transition border-b border-slate-800 last:border-b-0"
            >
              <div className="text-sm font-bold text-white">{item.name}</div>
              <div className="text-xs text-slate-400 mt-0.5">{item.category || 'Stock'} • Stock: {item.stock} • NPR {item.price}</div>
            </button>
          ))}
        </div>
      )}
      {open && query.trim() && suggestions.length === 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl px-4 py-3 text-sm text-slate-400">
          No matching stock item found.
        </div>
      )}
    </div>
  );
}


export default function App() {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('gf_active_tab_v2') || 'dashboard');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openNavGroup, setOpenNavGroup] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clockTick, setClockTick] = useState(Date.now());
  useEffect(() => { localStorage.setItem('gf_active_tab_v2', activeTab); }, [activeTab]);

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

  const [selectedStockPurchase, setSelectedStockPurchase] = useState(null);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [editingStockPurchaseId, setEditingStockPurchaseId] = useState(null);

  const [stockPurchases, setStockPurchases] = useState(() => {
    const saved = localStorage.getItem('gf_stock_purchases');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('gf_orders');
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
    items: [{ name: '', price: '', qty: 1, nonStock: false }],
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
  const [newPart, setNewPart] = useState({ name: '', stock: '', costPrice: '', markupPercent: '', price: '', minStock: '5', supplierName: '', supplierPhone: '', purchaseDate: getLocalDateKey(), notes: '' });
  const [editingPartId, setEditingPartId] = useState(null);
  const [newStockPurchase, setNewStockPurchase] = useState({ partId: '', partName: '', category: categories[0] || 'Mobile Parts', supplierName: '', supplierPhone: '', qty: '', unitCost: '', date: getLocalDateKey(), invoiceNo: '', notes: '', paymentMethod: 'Cash' });
  
  // Enhanced Expenses States with Payment Status & Autoname suggest
  const [newExpense, setNewExpense] = useState({ 
    description: '', amount: '', category: 'General', paymentStatus: 'Paid', paidNow: '', 
    itemName: '', quantity: '', unitCost: '', supplierName: '', 
    supplierPhone: '', invoiceNo: '', paymentMethod: 'Cash', notes: '', date: getLocalDateKey() 
  });
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [payingExpense, setPayingExpense] = useState(null);
  const [payForm, setPayForm] = useState({ amount: '', date: getLocalDateKey(), paymentMethod: 'Cash' });
  const [inventorySearch, setInventorySearch] = useState('');
  const [stockHistorySearch, setStockHistorySearch] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [newOrder, setNewOrder] = useState({ customerName: '', phone: '', items: [{ name: '', price: '', qty: 1, notes: '', mode: 'stock' }], expectedDate: getLocalDateKey(), notes: '' });
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('All');
  const [expenseStatusFilter, setExpenseStatusFilter] = useState('All');
  const [viewingExpenseDetails, setViewingExpenseDetails] = useState(null);
  const [supplierPeriodFilter, setSupplierPeriodFilter] = useState('month');
  const [supplierMonthFilter, setSupplierMonthFilter] = useState(getLocalDateKey().slice(0, 7));
  const [selectedSupplierLedger, setSelectedSupplierLedger] = useState('');

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
  useEffect(() => { localStorage.setItem('gf_orders', JSON.stringify(orders)); }, [orders]);

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

  const supplierTrackerRange = (() => {
    const now = new Date();
    if (supplierPeriodFilter === 'day') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(start); end.setDate(end.getDate() + 1);
      return { start, end };
    }
    if (supplierPeriodFilter === 'week') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const day = start.getDay();
      start.setDate(start.getDate() + (day === 0 ? -6 : 1 - day));
      const end = new Date(start); end.setDate(end.getDate() + 7);
      return { start, end };
    }
    const ym = supplierMonthFilter || getLocalDateKey().slice(0, 7);
    const start = new Date(`${ym}-01T00:00:00`);
    const end = new Date(start); end.setMonth(end.getMonth() + 1);
    return { start, end };
  })();

  const supplierTrackerTransactions = expenses
    .filter(e => e.supplierName && e.supplierName !== 'N/A' && e.supplierName !== 'Unknown Supplier')
    .filter(e => {
      const d = new Date(`${String(e.date || '').slice(0, 10)}T00:00:00`);
      return !Number.isNaN(d.getTime()) && d >= supplierTrackerRange.start && d < supplierTrackerRange.end;
    });

  const supplierTrackerNames = Array.from(new Set(supplierTrackerTransactions.map(e => e.supplierName.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const activeSupplierLedgerName = selectedSupplierLedger || supplierTrackerNames[0] || '';
  const selectedSupplierTransactions = supplierTrackerTransactions
    .filter(e => !activeSupplierLedgerName || e.supplierName.trim() === activeSupplierLedgerName)
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  const selectedSupplierPurchaseTotal = selectedSupplierTransactions.reduce((sum, e) => sum + Number(e.amount || e.paidAmount || 0), 0);
  const selectedSupplierPaidTotal = selectedSupplierTransactions.reduce((sum, e) => sum + Number(e.paidAmount || 0), 0);
  const selectedSupplierDueTotal = selectedSupplierTransactions.reduce((sum, e) => sum + Number(e.dueAmount || 0), 0);

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
      shopInfo, categories, repairs, inventory, devicesStock, expenses, stockPurchases, orders, exportDate: getCurrentDateTime()
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
          if (parsed.orders) setOrders(parsed.orders);
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

  const resetOrderForm = () => {
    setNewOrder({ customerName: '', phone: '', items: [{ name: '', price: '', qty: 1, notes: '', mode: 'stock' }], expectedDate: getLocalDateKey(), notes: '' });
    setEditingOrderId(null);
  };

  const updateOrderItem = (index, patch) => {
    setNewOrder(prev => ({ ...prev, items: prev.items.map((item, i) => i === index ? { ...item, ...patch } : item) }));
  };

  const addOrderItem = () => {
    setNewOrder(prev => ({ ...prev, items: [...prev.items, { name: '', price: '', qty: 1, notes: '', mode: 'stock' }] }));
  };

  const removeOrderItem = (index) => {
    setNewOrder(prev => ({ ...prev, items: prev.items.length <= 1 ? prev.items : prev.items.filter((_, i) => i !== index) }));
  };

  const handleOrderItemSelect = (index, item) => {
    updateOrderItem(index, { name: item.name, price: item.price });
  };

  const handleAddOrder = (e) => {
    e.preventDefault();
    const validItems = newOrder.items
      .map(item => ({ ...item, mode: item.mode || 'stock', name: String(item.name || '').trim(), price: Number(item.price || 0), qty: Math.max(1, Number(item.qty || 1)) }))
      .filter(item => item.name);
    if (!newOrder.customerName.trim()) { alert('Please enter customer name.'); return; }
    if (!validItems.length) { alert('Please add at least one order item.'); return; }
    const total = validItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    if (editingOrderId) {
      setOrders(orders.map(order => order.id === editingOrderId ? { ...order, customerName: newOrder.customerName.trim(), phone: newOrder.phone.trim(), items: validItems, expectedDate: newOrder.expectedDate, notes: newOrder.notes, total, updatedAt: getCurrentDateTime() } : order));
      alert('Order updated successfully!');
      resetOrderForm();
      return;
    }
    const order = { id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`, customerName: newOrder.customerName.trim(), phone: newOrder.phone.trim() || 'N/A', items: validItems, total, status: 'Pending', createdAt: getCurrentDateTime(), expectedDate: newOrder.expectedDate || '', notes: newOrder.notes || '' };
    setOrders([order, ...orders]);
    alert(`Order saved successfully! Order #${order.id}`);
    resetOrderForm();
  };

  const editOrder = (order) => {
    setNewOrder({ customerName: order.customerName || '', phone: order.phone || '', items: (order.items || []).map(i => ({ name: i.name || '', price: i.price || '', qty: i.qty || 1, notes: i.notes || '', mode: i.mode || 'stock' })), expectedDate: order.expectedDate || '', notes: order.notes || '' });
    setEditingOrderId(order.id);
    setActiveTab('orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateOrderStatus = (id, status) => {
    setOrders(orders.map(order => order.id === id ? { ...order, status, updatedAt: getCurrentDateTime() } : order));
  };

  const deleteOrder = (id) => {
    if (window.confirm('Delete this order record?')) setOrders(orders.filter(order => order.id !== id));
  };

  const filteredOrders = orders
    .slice()
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
    .filter(order => {
      const q = orderSearch.trim().toLowerCase();
      const matchSearch = !q || [order.id, order.customerName, order.phone, order.notes, ...(order.items || []).map(i => i.name)].some(value => String(value || '').toLowerCase().includes(q));
      const matchStatus = orderStatusFilter === 'All' || order.status === orderStatusFilter;
      return matchSearch && matchStatus;
    });

  const deleteJobSheet = (id) => {
    const job = repairs.find(r => r.id === id);
    if (!job) return;
    if (!window.confirm(`Delete Job Sheet ${job.id}? This action cannot be undone.`)) return;
    setRepairs(prev => prev.filter(r => r.id !== id));
    if (selectedInvoice?.id === id) setSelectedInvoice(null);
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
    setPosBill({ customerName: '', phone: '', items: [{ name: '', price: '', qty: 1, nonStock: false }], paidAmount: '', warrantyMonths: '' });
    alert('Accessories Bill saved successfully!');
  };

  const handleAddPart = (e) => {
    e.preventDefault();
    const qty = Number(newPart.stock || 0), cost = Number(newPart.costPrice || 0), markupPercent = Number(newPart.markupPercent || 0);
    const sellingPrice = Math.round((cost * (1 + markupPercent / 100)) * 100) / 100;
    if (editingPartId) {
      setInventory(inventory.map(item => item.id === editingPartId ? { ...item, category: selectedCategory, name: newPart.name || item.name, stock: qty, costPrice: cost, markupPercent, price: sellingPrice, minStock: Number(newPart.minStock || 5), supplierName: newPart.supplierName || '', supplierPhone: newPart.supplierPhone || '', notes: newPart.notes || item.notes || '', lastPurchaseDate: newPart.purchaseDate || todayKey } : item));
      setEditingPartId(null);
      setNewPart({ name: '', stock: '', costPrice: '', markupPercent: '', price: '', minStock: '5', supplierName: '', supplierPhone: '', purchaseDate: todayKey, notes: '' });
      alert('Stock item updated successfully!'); return;
    }
    const id = Date.now();
    const itemName = newPart.name || 'Unnamed Part';
    setInventory([...inventory, { id, category: selectedCategory, name: itemName, stock: qty, costPrice: cost, markupPercent, price: sellingPrice, minStock: Number(newPart.minStock || 5), supplierName: newPart.supplierName || '', supplierPhone: newPart.supplierPhone || '', notes: newPart.notes || '', lastPurchaseDate: newPart.purchaseDate || todayKey }]);
    if (qty > 0 && cost > 0) setStockPurchases([{ id: `SP-${Date.now()}`, partId: id, partName: itemName, supplierName: newPart.supplierName || 'N/A', supplierPhone: newPart.supplierPhone || '', qty, unitCost: cost, total: qty * cost, date: newPart.purchaseDate || todayKey, invoiceNo: '', notes: newPart.notes || 'Initial stock entry' }, ...stockPurchases]);
    setNewPart({ name: '', stock: '', costPrice: '', markupPercent: '', price: '', minStock: '5', supplierName: '', supplierPhone: '', purchaseDate: todayKey, notes: '' });
  };

  const startEditStockPurchase = (purchase) => {
    setEditingStockPurchaseId(purchase.id);
    setNewStockPurchase({
      partId: purchase.partId || '',
      partName: purchase.partName || '',
      category: purchase.category || categories[0] || 'Mobile Parts',
      supplierName: purchase.supplierName || '',
      supplierPhone: purchase.supplierPhone || '',
      qty: purchase.qty ?? '',
      unitCost: purchase.unitCost ?? '',
      date: purchase.date || todayKey,
      invoiceNo: purchase.invoiceNo || '',
      notes: purchase.notes || '',
      paymentMethod: purchase.paymentMethod || 'Cash'
    });
    setSelectedStockPurchase(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteStockPurchase = (purchase) => {
    if (!window.confirm(`Delete stock purchase for ${purchase.partName || 'this item'}? This will also remove the recorded purchase expense, but it will not automatically reverse current stock.`)) return;
    setStockPurchases(stockPurchases.filter(p => p.id !== purchase.id));
    setExpenses(expenses.filter(e => e.linkedStockPurchaseId !== purchase.id));
    if (editingStockPurchaseId === purchase.id) {
      setEditingStockPurchaseId(null);
      setNewStockPurchase({ partId: '', partName: '', category: categories[0] || 'Mobile Parts', supplierName: '', supplierPhone: '', qty: '', unitCost: '', date: todayKey, invoiceNo: '', notes: '', paymentMethod: 'Cash' });
    }
  };

  const handleAddStockPurchase = (e) => {
    e.preventDefault();
    const qty = Number(newStockPurchase.qty || 0), unitCost = Number(newStockPurchase.unitCost || 0);
    if (qty <= 0 || unitCost < 0) { alert('Enter valid quantity and cost.'); return; }

    if (editingStockPurchaseId) {
      const existing = stockPurchases.find(p => p.id === editingStockPurchaseId);
      if (!existing) { alert('Stock purchase record not found.'); return; }
      const purchaseTotal = qty * unitCost;
      const updatedPurchase = {
        ...existing,
        partId: newStockPurchase.partId || existing.partId,
        partName: newStockPurchase.partName || existing.partName,
        category: newStockPurchase.category || existing.category,
        supplierName: newStockPurchase.supplierName || 'N/A',
        supplierPhone: newStockPurchase.supplierPhone || '',
        qty,
        unitCost,
        total: purchaseTotal,
        date: newStockPurchase.date || existing.date,
        invoiceNo: newStockPurchase.invoiceNo || '',
        notes: newStockPurchase.notes || '',
        paymentMethod: newStockPurchase.paymentMethod || existing.paymentMethod || 'Cash'
      };
      setStockPurchases(stockPurchases.map(p => p.id === editingStockPurchaseId ? updatedPurchase : p));
      setExpenses(expenses.map(exp => exp.linkedStockPurchaseId === editingStockPurchaseId ? {
        ...exp,
        description: `Parts Purchase - ${updatedPurchase.partName}`,
        amount: purchaseTotal,
        paidAmount: purchaseTotal,
        dueAmount: 0,
        quantity: qty,
        unitCost,
        itemName: updatedPurchase.partName,
        supplierName: updatedPurchase.supplierName,
        supplierPhone: updatedPurchase.supplierPhone,
        invoiceNo: updatedPurchase.invoiceNo,
        paymentMethod: updatedPurchase.paymentMethod,
        notes: updatedPurchase.notes,
        date: updatedPurchase.date
      } : exp));
      setEditingStockPurchaseId(null);
      setNewStockPurchase({ partId: '', partName: '', category: categories[0] || 'Mobile Parts', supplierName: '', supplierPhone: '', qty: '', unitCost: '', date: todayKey, invoiceNo: '', notes: '', paymentMethod: 'Cash' });
      alert('Stock purchase history updated. Current stock was not changed.');
      return;
    }

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
    setExpenses([{ id: `EXP-${purchaseId}`, description: `Parts Purchase - ${updatedPart.name}`, category: 'Parts Purchase', amount: purchaseTotal, paidAmount: purchaseTotal, dueAmount: 0, payments: [{ amount: purchaseTotal, date: newStockPurchase.date }], quantity: qty, unitCost, itemName: updatedPart.name, supplierName: newStockPurchase.supplierName || 'N/A', supplierPhone: newStockPurchase.supplierPhone || '', invoiceNo: newStockPurchase.invoiceNo || '', paymentMethod: newStockPurchase.paymentMethod || 'Cash', notes: newStockPurchase.notes || '', date: newStockPurchase.date, linkedStockPurchaseId: purchaseId }, ...expenses]);
    setNewStockPurchase({ partId: '', partName: '', category: categories[0] || 'Mobile Parts', supplierName: '', supplierPhone: '', qty: '', unitCost: '', date: todayKey, invoiceNo: '', notes: '', paymentMethod: 'Cash' });
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

  const addExpensePayment = (id, amount, date, paymentMethod = 'Cash') => {
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
      const newPayments = [...(exp.payments || []), { amount: applied, date: date || todayKey, paymentMethod: paymentMethod || 'Cash' }];
      return { ...exp, paidAmount: newPaid, dueAmount: newDue, payments: newPayments };
    }));
    setPayingExpense(null);
    setPayForm({ amount: '', date: todayKey, paymentMethod: 'Cash' });
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

  const filteredInventory = inventory.filter(item => {
    const q = inventorySearch.trim().toLowerCase();
    if (!q) return true;
    return [item.name, item.category, item.supplierName, item.supplierPhone]
      .some(value => String(value || '').toLowerCase().includes(q));
  });

  const filteredStockPurchases = [...stockPurchases]
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    .filter(p => {
      const q = stockHistorySearch.trim().toLowerCase();
      if (!q) return true;
      return [p.partName, p.supplierName, p.invoiceNo, p.notes, p.date]
        .some(value => String(value || '').toLowerCase().includes(q));
    });


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
      {/* Premium Top Navigation — responsive in-flow navigation */}
      <nav className={`border-b ${t.border} ${t.navBg} backdrop-blur-xl sticky top-0 z-30 shadow-2xl`}>
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 sm:py-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 min-h-[58px]">
            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-[270px] sm:min-w-[270px]">
              <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl overflow-hidden border border-slate-700 shadow-md bg-slate-900 flex items-center justify-center">
                <img src="/logo.jpg" alt="Genuine Fix Logo" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className={`font-extrabold text-base sm:text-lg ${t.textMain} leading-tight tracking-tight truncate`}>{shopInfo.name}</h1>
                  <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-blue-600/15 text-blue-400 border border-blue-500/20 text-[9px] font-black tracking-wider">PRO</span>
                </div>
                <p className="text-[10px] sm:text-xs text-blue-400 font-bold uppercase tracking-widest truncate">Laptop & Smartphone Repair</p>
              </div>
            </div>

            <div className={`w-full min-w-0 ${t.cardSecondary} p-1.5 rounded-2xl border ${t.border} shadow-inner`}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { title: 'MAIN', items: [
                    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                    { id: 'customers', icon: Users, label: 'Customers' },
                    { id: 'orders', icon: ClipboardList, label: 'Orders' },
                  ]},
                  { title: 'SALES & SERVICE', items: [
                    { id: 'invoices', icon: FileText, label: 'Invoices' },
                    { id: 'pos', icon: ShoppingBag, label: 'Accessories Bill' },
                    { id: 'repairs', icon: ShieldCheck, label: 'Job Sheets' },
                    { id: 'devices', icon: Smartphone, label: 'Device Buy/Sell' },
                  ]},
                  { title: 'INVENTORY', items: [
                    { id: 'inventory', icon: Package, label: 'Parts Stock' },
                  ]},
                  { title: 'FINANCE & SYSTEM', items: [
                    { id: 'expenses', icon: DollarSign, label: 'Expenses' },
                    { id: 'backup', icon: Download, label: 'Backup' },
                    { id: 'settings', icon: Settings, label: 'Settings' },
                  ]},
                ].map(group => {
                  const isOpen = openNavGroup === group.title;
                  const hasActive = group.items.some(item => item.id === activeTab);
                  return (
                    <button
                      key={group.title}
                      type="button"
                      onClick={() => setOpenNavGroup(isOpen ? '' : group.title)}
                      className={`w-full h-9 sm:h-10 flex items-center justify-between gap-1.5 sm:gap-2 px-2.5 sm:px-3 rounded-xl text-left transition-all ${hasActive ? 'bg-blue-600/10 text-blue-400' : t.textMuted} hover:bg-blue-600/10`}
                    >
                      <span className="text-[10px] sm:text-sm font-black tracking-wide truncate">{group.title}</span>
                      <ChevronRight size={15} className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90 text-blue-400' : ''}`} />
                    </button>
                  );
                })}
              </div>

              {openNavGroup && (() => {
                const group = [
                  { title: 'MAIN', items: [
                    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                    { id: 'customers', icon: Users, label: 'Customers' },
                    { id: 'orders', icon: ClipboardList, label: 'Orders' },
                  ]},
                  { title: 'SALES & SERVICE', items: [
                    { id: 'invoices', icon: FileText, label: 'Invoices' },
                    { id: 'pos', icon: ShoppingBag, label: 'Accessories Bill' },
                    { id: 'repairs', icon: ShieldCheck, label: 'Job Sheets' },
                    { id: 'devices', icon: Smartphone, label: 'Device Buy/Sell' },
                  ]},
                  { title: 'INVENTORY', items: [
                    { id: 'inventory', icon: Package, label: 'Parts Stock' },
                  ]},
                  { title: 'FINANCE & SYSTEM', items: [
                    { id: 'expenses', icon: DollarSign, label: 'Expenses' },
                    { id: 'backup', icon: Download, label: 'Backup' },
                    { id: 'settings', icon: Settings, label: 'Settings' },
                  ]},
                ].find(g => g.title === openNavGroup);
                if (!group) return null;
                return (
                  <div className={`mt-1.5 p-2 rounded-2xl border ${t.border} ${t.cardBg} shadow-inner`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
                      {group.items.map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => { setActiveTab(item.id); setOpenNavGroup(''); }}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === item.id
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                              : `${t.textMuted} hover:text-white hover:bg-blue-600/10`
                          }`}
                        >
                          <item.icon size={15} />
                          <span className="truncate">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-6 shadow-xl`}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className={`text-sm uppercase tracking-[0.18em] font-black ${t.textMuted}`}>Business Analytics</p>
                    <h3 className={`text-lg font-black ${t.textMain}`}>Income vs Expense</h3>
                  </div>
                  <DollarSign size={20} className="text-emerald-400" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`${t.cardSecondary} border ${t.border} rounded-2xl p-4`}>
                    <p className={`text-sm font-bold ${t.textMuted}`}>Income received</p>
                    <p className="text-2xl font-black text-emerald-400 mt-2">NPR {totalIncome}</p>
                    <div className="mt-3 h-3 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, totalIncome > 0 ? (totalIncome / Math.max(totalIncome, totalExpensePaid)) * 100 : 0)}%` }} />
                    </div>
                  </div>
                  <div className={`${t.cardSecondary} border ${t.border} rounded-2xl p-4`}>
                    <p className={`text-sm font-bold ${t.textMuted}`}>Expense paid</p>
                    <p className="text-2xl font-black text-rose-400 mt-2">NPR {totalExpensePaid}</p>
                    <div className="mt-3 h-3 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, totalExpensePaid > 0 ? (totalExpensePaid / Math.max(totalIncome, totalExpensePaid)) * 100 : 0)}%` }} />
                    </div>
                  </div>
                </div>
                <div className={`mt-4 rounded-2xl border ${t.border} ${t.cardSecondary} p-4 flex items-center justify-between`}>
                  <span className={`text-sm font-bold ${t.textMuted}`}>Net cash</span>
                  <span className={`text-xl font-black ${netCash >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>NPR {netCash}</span>
                </div>
              </div>

              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-6 shadow-xl`}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className={`text-sm uppercase tracking-[0.18em] font-black ${t.textMuted}`}>Repair Analytics</p>
                    <h3 className={`text-lg font-black ${t.textMain}`}>Job Status Overview</h3>
                  </div>
                  <ShieldCheck size={20} className="text-blue-400" />
                </div>
                <div className="space-y-4">
                  {['Pending', 'In Progress', 'Ready for Pickup', 'Completed', 'Cancelled'].map(status => {
                    const count = repairs.filter(r => String(r.status || '').toLowerCase() === status.toLowerCase()).length;
                    const maxCount = Math.max(1, ...['Pending', 'In Progress', 'Ready for Pickup', 'Completed', 'Cancelled'].map(s => repairs.filter(r => String(r.status || '').toLowerCase() === s.toLowerCase()).length));
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-sm font-bold ${t.textMuted}`}>{status}</span>
                          <span className={`text-sm font-black ${t.textMain}`}>{count}</span>
                        </div>
                        <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(count / maxCount) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl p-6 shadow-xl`}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className={`text-sm uppercase tracking-[0.18em] font-black ${t.textMuted}`}>Performance Trend</p>
                  <h3 className={`text-lg font-black ${t.textMain}`}>Last 6 Months — Jobs & Income</h3>
                </div>
                <History size={20} className="text-violet-400" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end min-h-[190px]">
                {Array.from({ length: 6 }, (_, index) => {
                  const monthDate = new Date();
                  monthDate.setDate(1);
                  monthDate.setMonth(monthDate.getMonth() - (5 - index));
                  const year = monthDate.getFullYear();
                  const month = monthDate.getMonth();
                  const monthName = monthDate.toLocaleString('en-NP', { month: 'short' });
                  const monthRepairs = repairs.filter(r => {
                    const raw = String(r.dateTime || r.date || '');
                    const d = new Date(raw.replace(' ', 'T'));
                    return !Number.isNaN(d.getTime()) && d.getFullYear() === year && d.getMonth() === month;
                  });
                  const income = monthRepairs.reduce((sum, r) => sum + Number(r.paidAmount || 0), 0);
                  const maxIncome = Math.max(1, ...Array.from({ length: 6 }, (_, i) => {
                    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i));
                    return repairs.filter(r => { const x = new Date(String(r.dateTime || r.date || '').replace(' ', 'T')); return !Number.isNaN(x.getTime()) && x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth(); }).reduce((s, r) => s + Number(r.paidAmount || 0), 0);
                  }));
                  return (
                    <div key={`${year}-${month}`} className="flex flex-col justify-end h-[170px]">
                      <div className="flex-1 flex items-end justify-center">
                        <div className="w-full max-w-[58px] rounded-t-xl bg-violet-500/70 hover:bg-violet-500 transition" style={{ height: `${Math.max(8, (income / maxIncome) * 100)}%` }} title={`NPR ${income}`} />
                      </div>
                      <p className={`text-center text-sm font-black ${t.textMain} mt-2`}>{monthName}</p>
                      <p className={`text-center text-xs ${t.textMuted}`}>{monthRepairs.length} jobs</p>
                    </div>
                  );
                })}
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

        {/* ORDERS / ORDER TAKING TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <p className={`text-sm uppercase tracking-[0.2em] font-black ${t.textMuted}`}>Order Taking</p>
                <h2 className={`text-2xl font-black ${t.textMain}`}>Customer Orders</h2>
                <p className={`text-sm ${t.textMuted} mt-1`}>Pahila order tipne, status track garne, ani ready bhayepachi billing ma lagne.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <div className={`flex items-center gap-2 ${t.inputBg} border ${t.border} rounded-2xl px-3 py-2.5 w-full sm:w-72`}>
                  <Search size={16} className={t.textMuted} />
                  <input value={orderSearch} onChange={e => setOrderSearch(e.target.value)} placeholder="Search order, customer, phone, item..." className="bg-transparent outline-none text-sm w-full" />
                </div>
                <select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)} className={`p-2.5 ${t.inputBg} border ${t.border} rounded-2xl text-sm font-bold outline-none`}>
                  {['All', 'Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'].map(status => <option key={status}>{status}</option>)}
                </select>
              </div>
            </div>

            <form onSubmit={handleAddOrder} className={`${t.cardBg} border ${t.border} rounded-3xl p-5 sm:p-6 shadow-xl space-y-5`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className={`text-lg font-black ${t.textMain}`}>{editingOrderId ? `Edit Order #${editingOrderId}` : 'New Customer Order'}</h3>
                  <p className={`text-sm ${t.textMuted} mt-1`}>Customer ra item ko details ekai thau bata tipnus.</p>
                </div>
                {editingOrderId && <button type="button" onClick={resetOrderForm} className={`px-3 py-2 rounded-xl border ${t.border} ${t.textMuted} text-sm font-bold`}>Cancel Edit</button>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomerAutocomplete
                  value={newOrder.customerName}
                  placeholder="Customer Full Name"
                  customers={uniqueCustomers}
                  onChange={value => setNewOrder(prev => ({ ...prev, customerName: value }))}
                  onSelect={customer => setNewOrder(prev => ({ ...prev, customerName: customer.name, phone: customer.phone || prev.phone }))}
                  className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none focus:border-blue-600`}
                />
                <input type="text" placeholder="Phone Number" value={newOrder.phone} onChange={e => setNewOrder({...newOrder, phone: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none focus:border-blue-600`} />
                <input type="date" value={newOrder.expectedDate} onChange={e => setNewOrder({...newOrder, expectedDate: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                <input type="text" placeholder="Order Notes / Special Instructions" value={newOrder.notes} onChange={e => setNewOrder({...newOrder, notes: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              </div>

              <div className={`${t.cardSecondary} border ${t.border} rounded-2xl p-4 space-y-3`}>
                <div className="flex items-center justify-between gap-3">
                  <h4 className={`font-black ${t.textMain}`}>Order Items</h4>
                  <button type="button" onClick={addOrderItem} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-black inline-flex items-center gap-1"><Plus size={15}/> Add Item</button>
                </div>
                {newOrder.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                    <div className="md:col-span-2 flex gap-2">
                      <button type="button" onClick={() => updateOrderItem(index, { mode: 'stock' })} className={`flex-1 px-2.5 py-2.5 rounded-xl text-xs font-black border transition ${item.mode !== 'manual' ? 'bg-blue-600 text-white border-blue-600' : `${t.inputBg} ${t.border} ${t.textMuted}`}`}>Stock Item</button>
                      <button type="button" onClick={() => updateOrderItem(index, { mode: 'manual' })} className={`flex-1 px-2.5 py-2.5 rounded-xl text-xs font-black border transition ${item.mode === 'manual' ? 'bg-amber-500 text-white border-amber-500' : `${t.inputBg} ${t.border} ${t.textMuted}`}`}>Manual Item</button>
                    </div>
                    <div className="md:col-span-4">
                      {item.mode === 'manual' ? (
                        <input type="text" placeholder="Manual item / service name..." value={item.name} onChange={e => updateOrderItem(index, { name: e.target.value })} className={`w-full p-3 ${t.inputBg} border rounded-xl text-sm focus:outline-none focus:border-blue-600`} />
                      ) : (
                        <InventoryAutocomplete value={item.name} placeholder="Search stock item..." inventory={inventory} onChange={value => updateOrderItem(index, { name: value })} onSelect={selected => handleOrderItemSelect(index, selected)} className={`w-full p-3 ${t.inputBg} border rounded-xl text-sm focus:outline-none focus:border-blue-600`} />
                      )}
                    </div>
                    <input type="number" min="0" step="0.01" placeholder="Price" value={item.price} onChange={e => updateOrderItem(index, { price: e.target.value })} className={`md:col-span-2 p-3 ${t.inputBg} border rounded-xl text-sm focus:outline-none`} />
                    <input type="number" min="1" step="1" placeholder="Qty" value={item.qty} onChange={e => updateOrderItem(index, { qty: e.target.value })} className={`md:col-span-1 p-3 ${t.inputBg} border rounded-xl text-sm focus:outline-none`} />
                    <input type="text" placeholder="Item note" value={item.notes || ''} onChange={e => updateOrderItem(index, { notes: e.target.value })} className={`md:col-span-2 p-3 ${t.inputBg} border rounded-xl text-sm focus:outline-none`} />
                    <button type="button" onClick={() => removeOrderItem(index)} className="md:col-span-1 p-3 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 flex items-center justify-center" title="Remove item"><Trash2 size={17}/></button>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className={`text-sm ${t.textMuted}`}>Order total: <span className={`text-lg font-black ${t.textMain}`}>NPR {newOrder.items.reduce((sum, item) => sum + Number(item.price || 0) * Math.max(1, Number(item.qty || 1)), 0)}</span></div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl px-5 py-3 shadow-lg shadow-blue-600/30 inline-flex items-center gap-2"><CheckCircle2 size={18}/>{editingOrderId ? 'Update Order' : 'Save Order'}</button>
              </div>
            </form>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>
              <div className={`p-4 border-b ${t.border} ${t.cardSecondary} flex items-center justify-between gap-3`}>
                <div><h3 className={`font-black ${t.textMain}`}>Order History</h3><p className={`text-sm ${t.textMuted} mt-1`}>{filteredOrders.length} order(s) shown</p></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={`${t.tableHeader} font-bold uppercase text-sm border-b`}>
                    <tr><th className="p-4 text-left">Order</th><th className="p-4 text-left">Customer</th><th className="p-4 text-left">Items</th><th className="p-4 text-left">Total</th><th className="p-4 text-left">Expected</th><th className="p-4 text-left">Status</th><th className="p-4 text-right">Action</th></tr>
                  </thead>
                  <tbody className={`divide-y ${t.tableDivide}`}>
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-blue-500/5">
                        <td className="p-4 font-mono font-black text-blue-400">{order.id}<div className={`text-xs ${t.textMuted} mt-1`}>{order.createdAt}</div></td>
                        <td className={`p-4 font-bold ${t.textMain}`}>{order.customerName}<div className={`text-xs ${t.textMuted} mt-1`}>{order.phone}</div></td>
                        <td className={`p-4 ${t.textMuted} min-w-[220px]`}>{(order.items || []).map((item, i) => <div key={i}>{item.name} × {item.qty}</div>)}</td>
                        <td className="p-4 font-black text-emerald-400">NPR {order.total}</td>
                        <td className={`p-4 ${t.textMuted}`}>{order.expectedDate || '—'}</td>
                        <td className="p-4"><select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)} className={`px-2.5 py-2 ${t.inputBg} border ${t.border} rounded-xl text-sm font-bold`}>
                          {['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'].map(status => <option key={status}>{status}</option>)}
                        </select></td>
                        <td className="p-4 text-right whitespace-nowrap"><button onClick={() => editOrder(order)} className="px-3 py-2 rounded-xl bg-blue-500/10 text-blue-400 font-bold mr-2"><Pencil size={15} className="inline mr-1"/>Edit</button><button onClick={() => deleteOrder(order.id)} className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-400 font-bold"><Trash2 size={15} className="inline mr-1"/>Delete</button></td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && <tr><td colSpan="7" className={`p-10 text-center ${t.textMuted}`}>No orders found.</td></tr>}
                  </tbody>
                </table>
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

            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>
              <div className={`p-5 border-b ${t.border} ${t.cardSecondary}`}>
                <h3 className={`text-lg font-black ${t.textMain}`}>Job Sheet History</h3>
                <p className={`text-sm ${t.textMuted} mt-1`}>Saved repair jobs can be deleted directly from here.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={`${t.tableHeader} font-bold uppercase text-sm border-b`}>
                    <tr>
                      <th className="p-4 text-left">Job ID</th>
                      <th className="p-4 text-left">Customer</th>
                      <th className="p-4 text-left">Device / Issue</th>
                      <th className="p-4 text-left">Date</th>
                      <th className="p-4 text-left">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.tableDivide}`}>
                    {repairs.filter(r => (r.billType || 'Repair') === 'Repair').map(job => (
                      <tr key={job.id} className="hover:bg-blue-600/5 transition">
                        <td className="p-4 font-mono font-black text-blue-400">{job.id}</td>
                        <td className={`p-4 font-bold ${t.textMain}`}>{job.customerName}<div className={`text-xs ${t.textMuted} mt-1`}>{job.phone}</div></td>
                        <td className={`p-4 ${t.textMuted}`}>{job.model || job.deviceType}<div className="text-xs mt-1">{job.issue || 'Repair / service job'}</div></td>
                        <td className={`p-4 ${t.textMuted}`}>{job.dateTime || '—'}</td>
                        <td className={`p-4 ${t.textMuted}`}>{job.status || 'Pending'}</td>
                        <td className="p-4 text-right">
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
                        </td>
                      </tr>
                    ))}
                    {repairs.filter(r => (r.billType || 'Repair') === 'Repair').length === 0 && (
                      <tr><td colSpan="6" className={`p-8 text-center ${t.textMuted}`}>No Job Sheets found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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
                    <input type="text" placeholder="Citizenship / Nagarikta No. (optional)" value={newDevice.citizenshipNo || ''} onChange={e => setNewDevice({...newDevice, citizenshipNo: e.target.value})} className={`p-3 ${t.inputBg} border rounded-xl text-sm focus:outline-none`} />
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Seller Citizenship Photo (Optional)</label>
                      <input type="file" accept="image/*" onChange={e => handleDeviceImageUpload(e, 'citizenshipPhoto')} className="text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer" />
                      {newDevice.citizenshipPhoto && <span className="text-xs text-emerald-400 mt-1 block font-semibold">✓ Citizenship Photo Attached</span>}
                    </div>
                  </div>
                </div>
              )}

              {newDevice.tradeType === 'buy' ? (
                <>
                  <input type="number" placeholder="Buy Price Per Unit (NPR)" value={newDevice.buyPrice} onChange={e => setNewDevice({...newDevice, buyPrice: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
                  <input type="number" placeholder="Expected Selling Price (NPR)" value={newDevice.sellPrice} onChange={e => setNewDevice({...newDevice, sellPrice: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                </>
              ) : (
                <input type="number" placeholder="Actual Selling Price (NPR)" value={newDevice.sellPrice} onChange={e => setNewDevice({...newDevice, sellPrice: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              )}

              <input type="text" placeholder="Warranty (e.g. 6 Months Store Warranty)" value={newDevice.warrantyMonths} onChange={e => setNewDevice({...newDevice, warrantyMonths: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />

              <div className="md:col-span-3 flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-blue-600/35">
                  {editingDeviceId ? 'Update Record' : newDevice.tradeType === 'buy' ? 'Save Purchase & Stock' : 'Complete Sale & Generate Bill'}
                </button>
                {editingDeviceId && (
                  <button type="button" onClick={() => resetDeviceForm('buy')} className="px-6 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl p-3.5 transition">Cancel</button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ACCESSORIES BILL / POS TAB */}
        {activeTab === 'pos' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className={`text-xl font-bold ${t.textMain}`}>Accessories & Direct Sales Counter (POS)</h2>
            <form onSubmit={handleSavePosBill} className={`${t.cardBg} border ${t.border} p-6 rounded-3xl space-y-4 shadow-xl`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomerAutocomplete
                  value={posBill.customerName}
                  placeholder="Customer Full Name"
                  customers={uniqueCustomers}
                  onChange={value => setPosBill(prev => ({ ...prev, customerName: value }))}
                  onSelect={customer => handleCustomerSelect(customer, 'pos')}
                  className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
                />
                <input type="text" placeholder="Phone Number" value={posBill.phone} onChange={e => setPosBill({...posBill, phone: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${t.textMuted}`}>Bill Items & Parts Selection</h3>
<button type="button" onClick={() => setPosBill({...posBill, items: [...posBill.items, { name: '', price: '', qty: 1, nonStock: false }]})} className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl text-xs font-bold">+ Add Item</button>
                </div>
                {posBill.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    {item.nonStock ? (
    <input
      type="text"
      value={item.name}
      onChange={e => {
        const nextItems = [...posBill.items];
        nextItems[idx].name = e.target.value;
        setPosBill({ ...posBill, items: nextItems });
      }}
      placeholder="Non-stock item / service name"
      className={`flex-1 p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
      required
    />
  ) : (
                    <InventoryAutocomplete
                      value={item.name}
                      inventory={inventory}
                      placeholder="Search stock item or accessory..."
                      onChange={value => {
                        const nextItems = [...posBill.items];
                        nextItems[idx].name = value;
                        setPosBill({ ...posBill, items: nextItems });
                      }}
                      onSelect={invItem => {
                        const nextItems = [...posBill.items];
                        nextItems[idx].name = invItem.name;
                        nextItems[idx].price = invItem.price;
                        setPosBill({ ...posBill, items: nextItems });
                      }}
                      className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
                    />
                  )}
  <button
    type="button"
    onClick={() => {
      const nextItems = [...posBill.items];
      nextItems[idx].nonStock = !nextItems[idx].nonStock;
      if (nextItems[idx].nonStock) {
        nextItems[idx].name = '';
        nextItems[idx].price = '';
      }
      setPosBill({ ...posBill, items: nextItems });
    }}
    className={`px-3 py-2 rounded-xl text-xs font-black border transition ${item.nonStock ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'bg-amber-600/20 text-amber-400 border-amber-500/30'}`}
  >
    {item.nonStock ? 'Stock Item' : 'Non-stock'}
  </button>
                    <input type="number" placeholder="Qty" value={item.qty} onChange={e => {
                      const nextItems = [...posBill.items];
                      nextItems[idx].qty = e.target.value;
                      setPosBill({ ...posBill, items: nextItems });
                    }} className={`w-20 p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
                    <input type="number" placeholder="Price (NPR)" value={item.price} onChange={e => {
                      const nextItems = [...posBill.items];
                      nextItems[idx].price = e.target.value;
                      setPosBill({ ...posBill, items: nextItems });
                    }} className={`w-32 p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
                    {posBill.items.length > 1 && (
                      <button type="button" onClick={() => setPosBill({...posBill, items: posBill.items.filter((_, i) => i !== idx)})} className="p-3 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-2xl"><Trash2 size={16}/></button>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <input type="number" placeholder="Paid Amount (NPR)" value={posBill.paidAmount} onChange={e => setPosBill({...posBill, paidAmount: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                <input type="text" placeholder="Warranty (e.g. 7 Days Replacement)" value={posBill.warrantyMonths} onChange={e => setPosBill({...posBill, warrantyMonths: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-blue-600/35">Complete POS Bill & Deduct Stock</button>
            </form>
          </div>
        )}

        {/* INVOICES TAB */}
        {activeTab === 'invoices' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <p className={`text-sm uppercase tracking-[0.2em] font-black ${t.textMuted}`}>Invoices & Billing</p>
                <h2 className={`text-2xl font-black ${t.textMain}`}>Shop Bills & Job History</h2>
                <p className={`text-sm ${t.textMuted} mt-1`}>Search, preview canvas bills, download PNGs or print directly.</p>
              </div>
              <div className={`flex items-center gap-2 ${t.inputBg} border ${t.border} rounded-2xl px-3 py-2.5 w-full lg:w-80`}>
                <Search size={16} className={t.textMuted} />
                <input value={invoiceSearch} onChange={e => setInvoiceSearch(e.target.value)} placeholder="Search bill ID, name, phone..." className="bg-transparent outline-none text-sm w-full" />
              </div>
            </div>

            <div className={`flex flex-wrap gap-2 ${t.cardSecondary} p-2 rounded-2xl border ${t.border}`}>
              {['All', 'Repair', 'Accessories', 'Devices', 'Due', 'Paid'].map(tab => (
                <button key={tab} onClick={() => setInvoiceFilterTab(tab)} className={`px-4 py-2 rounded-xl text-sm font-bold transition ${invoiceFilterTab === tab ? 'bg-blue-600 text-white' : `${t.textMuted} hover:text-white`}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={`${t.tableHeader} font-bold uppercase text-sm border-b`}>
                    <tr>
                      <th className="p-4 text-left">Bill ID</th>
                      <th className="p-4 text-left">Customer</th>
                      <th className="p-4 text-left">Type / Model</th>
                      <th className="p-4 text-left">Total</th>
                      <th className="p-4 text-left">Due</th>
                      <th className="p-4 text-left">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.tableDivide}`}>
                    {filteredInvoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-blue-600/5 transition">
                        <td className="p-4 font-mono font-bold text-blue-400">{inv.id}</td>
                        <td className={`p-4 font-bold ${t.textMain}`}>{inv.customerName}<br/><span className={`text-xs ${t.textMuted} font-normal`}>{inv.phone}</span></td>
                        <td className={`p-4 ${t.textMuted}`}>{inv.model || inv.deviceType}</td>
                        <td className={`p-4 font-bold ${t.textMain}`}>NPR {inv.totalCost}</td>
                        <td className={`p-4 font-bold ${Number(inv.dueAmount) > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>NPR {inv.dueAmount}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${Number(inv.dueAmount) > 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                            {Number(inv.dueAmount) > 0 ? 'Due Pending' : 'Paid'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => setSelectedInvoice(inv)} className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl font-bold inline-flex items-center gap-1">
                            <Eye size={14}/> View
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

        {/* PARTS STOCK / INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className={`text-xl font-bold ${t.textMain}`}>Parts Stock & Inventory Management</h2>
            <form onSubmit={handleAddPart} className={`${t.cardBg} border ${t.border} p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4 shadow-xl`}>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <input type="text" placeholder="Part Name (e.g. iPhone 13 Screen)" value={newPart.name} onChange={e => setNewPart({...newPart, name: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              <input type="number" placeholder="Stock Qty" value={newPart.stock} onChange={e => setNewPart({...newPart, stock: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              <input type="number" min="0" step="0.01" placeholder="Cost Price (NPR)" value={newPart.costPrice} onChange={e => setNewPart(prev => ({ ...prev, costPrice: e.target.value, price: Number(e.target.value || 0) > 0 ? String(Math.round((Number(e.target.value || 0) * (1 + Number(prev.markupPercent || 0) / 100)) * 100) / 100) : "" }))} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              <input type="number" min="0" step="0.01" placeholder="Profit / Markup %" value={newPart.markupPercent} onChange={e => setNewPart(prev => ({ ...prev, markupPercent: e.target.value, price: Number(prev.costPrice || 0) > 0 ? String(Math.round((Number(prev.costPrice || 0) * (1 + Number(e.target.value || 0) / 100)) * 100) / 100) : '' }))} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              <div className={`p-3 ${t.cardSecondary} border ${t.border} rounded-2xl flex items-center justify-between gap-3`}>
                <div>
                  <div className={`text-xs font-bold uppercase tracking-wide ${t.textMuted}`}>Selling Price (SP)</div>
                  <div className={`text-lg font-black ${t.textMain}`}>NPR {Number(newPart.price || 0).toLocaleString()}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black">Auto</span>
              </div>
              <input type="number" placeholder="Min Stock Warning" value={newPart.minStock} onChange={e => setNewPart({...newPart, minStock: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <textarea
                rows="5"
                placeholder="Notes / Remarks (optional) — paste bullets here; each • bullet will stay with its text on the same line."
                value={newPart.notes}
                onChange={e => setNewPart({...newPart, notes: normalizePartsStockNotes(e.target.value)})}
                onPaste={e => {
                  const pasted = e.clipboardData?.getData('text') || '';
                  if (!pasted) return;
                  e.preventDefault();
                  const el = e.currentTarget;
                  const start = el.selectionStart ?? newPart.notes.length;
                  const end = el.selectionEnd ?? start;
                  const next = `${newPart.notes.slice(0, start)}${pasted}${newPart.notes.slice(end)}`;
                  setNewPart(prev => ({ ...prev, notes: normalizePartsStockNotes(next) }));
                }}
                className={`md:col-span-3 p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none resize-y leading-6`}
              />

              <button type="submit" className="md:col-span-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-blue-600/35">
                {editingPartId ? 'Update Part Details' : 'Add New Part to Stock'}
              </button>
            </form>

            <div className={`${t.cardBg} border ${t.border} rounded-2xl p-4 flex items-center gap-3`}>
              <Search size={18} className={t.textMuted} />
              <input
                type="text"
                value={inventorySearch}
                onChange={e => setInventorySearch(e.target.value)}
                placeholder="Search stock by name, category or supplier..."
                className={`w-full bg-transparent outline-none text-sm ${t.textMain}`}
              />
              <span className={`text-xs font-bold whitespace-nowrap ${t.textMuted}`}>{filteredInventory.length} items</span>
            </div>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={`${t.tableHeader} font-bold uppercase text-sm border-b`}>
                    <tr>
                      <th className="p-4 text-left">Part Name</th>
                      <th className="p-4 text-left">Category</th>
                      <th className="p-4 text-left">Stock Qty</th>
                      <th className="p-4 text-left">Cost</th>
                      <th className="p-4 text-left">Price</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.tableDivide}`}>
                    {filteredInventory.map(item => (
                      <tr key={item.id} className="hover:bg-blue-600/5 transition">
                        <td className={`p-4 font-bold ${t.textMain}`}>{item.name}</td>
                        <td className={`p-4 ${t.textMuted}`}>{item.category}</td>
                        <td className={`p-4 font-bold ${Number(item.stock) <= Number(item.minStock || 5) ? 'text-rose-400' : 'text-emerald-400'}`}>{item.stock} units</td>
                        <td className={`p-4 ${t.textMuted}`}>NPR {item.costPrice}</td>
                        <td className={`p-4 font-bold ${t.textMain}`}>NPR {item.price}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end items-center gap-1.5">
                            <button type="button" onClick={() => { setEditingPartId(item.id); setSelectedCategory(item.category); setNewPart({ name: item.name, stock: item.stock, costPrice: item.costPrice, markupPercent: Number(item.costPrice) > 0 ? Math.round(((Number(item.price || 0) - Number(item.costPrice || 0)) / Number(item.costPrice || 1)) * 10000) / 100 : '', price: item.price, minStock: item.minStock || '5', supplierName: item.supplierName || '', supplierPhone: item.supplierPhone || '', purchaseDate: item.lastPurchaseDate || todayKey, notes: item.notes || '' }); }} className="px-3 py-1.5 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 rounded-xl font-bold inline-flex items-center gap-1.5"><Pencil size={14}/> Edit</button>
                            <button type="button" onClick={() => setInventory(inventory.filter(i => i.id !== item.id))} className="p-2 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 rounded-xl" title="Delete item"><Trash2 size={14}/></button>
                            <button type="button" onClick={() => setSelectedInventoryItem(item)} className="px-3 py-1.5 bg-blue-600/15 text-blue-400 hover:bg-blue-600/25 rounded-xl font-bold inline-flex items-center gap-1.5"><Eye size={14}/> View</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>


            {selectedInventoryItem && (
              <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedInventoryItem(null)}>
                <div className={`${t.cardBg} border ${t.border} rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden`} onClick={e => e.stopPropagation()}>
                  <div className={`p-5 border-b ${t.border} flex items-center justify-between gap-3`}>
                    <div>
                      <p className={`text-xs uppercase tracking-[0.2em] font-black ${t.textMuted}`}>Inventory Item Detail</p>
                      <h3 className={`text-xl font-black ${t.textMain}`}>{selectedInventoryItem.name}</h3>
                    </div>
                    <button type="button" onClick={() => setSelectedInventoryItem(null)} className={`p-2 rounded-xl ${t.cardSecondary} ${t.textMuted} hover:text-white`}><X size={18}/></button>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      ['Category', selectedInventoryItem.category || '—'],
                      ['Stock Qty', `${Number(selectedInventoryItem.stock || 0).toLocaleString()} units`],
                      ['Cost Price', `NPR ${Number(selectedInventoryItem.costPrice || 0).toLocaleString()}`],
                      ['Selling Price', `NPR ${Number(selectedInventoryItem.price || 0).toLocaleString()}`],
                      ['Min Stock Warning', `${Number(selectedInventoryItem.minStock || 5).toLocaleString()} units`],
                      ['Supplier', selectedInventoryItem.supplierName || '—'],
                      ['Supplier Phone', selectedInventoryItem.supplierPhone || '—'],
                      ['Last Purchase Date', selectedInventoryItem.lastPurchaseDate || '—'],
                    ].map(([label, value]) => (
                      <div key={label} className={`${t.cardSecondary} border ${t.border} rounded-2xl p-4`}>
                        <div className={`text-xs uppercase tracking-wide font-black ${t.textMuted}`}>{label}</div>
                        <div className={`text-sm font-bold ${t.textMain} mt-1 break-words`}>{value}</div>
                      </div>
                    ))}
                    <div className={`sm:col-span-2 ${t.cardSecondary} border ${t.border} rounded-2xl p-4`}>
                      <div className={`text-xs uppercase tracking-wide font-black ${t.textMuted}`}>Notes / Remarks</div>
                      <div className={`text-sm ${t.textMain} mt-1 whitespace-pre-wrap break-words leading-6`}>{selectedInventoryItem.notes || 'No notes added.'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>
              <div className="p-5 border-b border-slate-700/50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <h3 className={`text-lg font-black ${t.textMain}`}>Stock Purchase History</h3>
                  <p className={`text-sm ${t.textMuted}`}>Search previous purchases by item, supplier, invoice, notes or date.</p>
                </div>
                <div className={`flex items-center gap-2 ${t.inputBg} border ${t.border} rounded-2xl px-3 py-2.5 w-full lg:w-96`}>
                  <History size={16} className={t.textMuted} />
                  <input
                    value={stockHistorySearch}
                    onChange={e => setStockHistorySearch(e.target.value)}
                    placeholder="Search purchase history..."
                    className="bg-transparent outline-none text-sm w-full"
                  />
                  <span className={`text-xs font-bold ${t.textMuted}`}>{filteredStockPurchases.length}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                {filteredStockPurchases.length === 0 ? (
                  <div className={`p-6 text-sm ${t.textMuted}`}>No stock purchase history found.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className={`${t.tableHeader} font-bold uppercase text-sm border-b`}>
                      <tr>
                        <th className="p-4 text-left">Date</th>
                        <th className="p-4 text-left">Item</th>
                        <th className="p-4 text-left">Supplier</th>
                        <th className="p-4 text-right">Qty</th>
                        <th className="p-4 text-right">Unit Cost</th>
                        <th className="p-4 text-right">Total</th>
                        <th className="p-4 text-left">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${t.tableDivide}`}>
                      {filteredStockPurchases.map(p => (
                        <tr key={p.id} className="hover:bg-blue-600/5 transition">
                          <td className={`p-4 ${t.textMuted}`}>{p.date || '—'}</td>
                          <td className={`p-4 font-bold ${t.textMain}`}>{p.partName || '—'}<div className={`text-xs ${t.textMuted}`}>{p.notes || ''}</div></td>
                          <td className={`p-4 ${t.textMuted}`}>{p.supplierName || '—'}</td>
                          <td className={`p-4 text-right font-bold ${t.textMain}`}>{p.qty || 0}</td>
                          <td className="p-4 text-right">NPR {Number(p.unitCost || 0).toLocaleString()}</td>
                          <td className={`p-4 text-right font-black ${t.textMain}`}>NPR {Number(p.total || 0).toLocaleString()}</td>
                          <td className={`p-4 ${t.textMuted}`}>{p.invoiceNo || '—'}</td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end items-center gap-1.5">
                              <button type="button" onClick={() => startEditStockPurchase(p)} className="px-3 py-1.5 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 rounded-xl font-bold inline-flex items-center gap-1.5">
                                <Pencil size={14}/> Edit
                              </button>
                              <button type="button" onClick={() => deleteStockPurchase(p)} className="p-2 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 rounded-xl" title="Delete purchase">
                                <Trash2 size={14}/>
                              </button>
                              <button type="button" onClick={() => setSelectedStockPurchase(p)} className="px-3 py-1.5 bg-blue-600/15 text-blue-400 hover:bg-blue-600/25 rounded-xl font-bold inline-flex items-center gap-1.5">
                                <Eye size={14}/> View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {selectedStockPurchase && (
              <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedStockPurchase(null)}>
                <div className={`${t.cardBg} border ${t.border} rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden`} onClick={e => e.stopPropagation()}>
                  <div className={`p-5 border-b ${t.border} flex items-center justify-between gap-3`}>
                    <div>
                      <p className={`text-xs uppercase tracking-[0.2em] font-black ${t.textMuted}`}>Stock Purchase Detail</p>
                      <h3 className={`text-xl font-black ${t.textMain}`}>{selectedStockPurchase.partName || 'Stock Item'}</h3>
                    </div>
                    <button type="button" onClick={() => setSelectedStockPurchase(null)} className={`p-2 rounded-xl ${t.cardSecondary} ${t.textMuted} hover:text-white`}><X size={18}/></button>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      ['Date', selectedStockPurchase.date || '—'],
                      ['Supplier', selectedStockPurchase.supplierName || '—'],
                      ['Quantity', String(selectedStockPurchase.qty || 0)],
                      ['Unit Cost', `NPR ${Number(selectedStockPurchase.unitCost || 0).toLocaleString()}`],
                      ['Total', `NPR ${Number(selectedStockPurchase.total || 0).toLocaleString()}`],
                      ['Invoice', selectedStockPurchase.invoiceNo || '—'],
                    ].map(([label, value]) => (
                      <div key={label} className={`${t.cardSecondary} border ${t.border} rounded-2xl p-4`}>
                        <div className={`text-xs uppercase tracking-wide font-black ${t.textMuted}`}>{label}</div>
                        <div className={`text-sm font-bold ${t.textMain} mt-1 break-words`}>{value}</div>
                      </div>
                    ))}
                    <div className={`sm:col-span-2 ${t.cardSecondary} border ${t.border} rounded-2xl p-4`}>
                      <div className={`text-xs uppercase tracking-wide font-black ${t.textMuted}`}>Notes / Remarks</div>
                      <div className={`text-sm ${t.textMain} mt-1 whitespace-pre-wrap break-words leading-6`}>{selectedStockPurchase.notes || 'No notes added.'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* EXPENSES TAB */}
        {activeTab === 'expenses' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className={`text-xl font-bold ${t.textMain}`}>Shop Expenses & Supplier Udhaaro Due</h2>
<form onSubmit={handleAddExpense} className={`${t.cardBg} border ${t.border} p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4 shadow-xl`}>
              <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}>
                <option value="General">General Expense</option>
                <option value="Shop Rent">Shop Rent</option>
                <option value="Electricity / Utilities">Electricity / Utilities</option>
                <option value="Parts Purchase">Parts Purchase</option>
                <option value="Device Purchase">Device Purchase</option>
                <option value="Salary / Staff">Salary / Staff</option>
                <option value="Internet / Phone">Internet / Phone</option>
              </select>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Description / Autoname (e.g. Shop Rent)"
                  value={newExpense.description}
                  onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                  className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
                  list="expense-descriptions"
                  required
                />
                <datalist id="expense-descriptions">
                  {uniqueExpenseDescriptions.map(desc => <option key={desc} value={desc} />)}
                </datalist>
              </div>

              <input type="number" placeholder="Total Amount (NPR)" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required={newExpense.category !== 'Parts Purchase' && newExpense.category !== 'Device Purchase'} />

              <select value={newExpense.paymentStatus} onChange={e => setNewExpense({...newExpense, paymentStatus: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}>
                <option value="Paid">Fully Paid Now</option>
                <option value="Unpaid">Unpaid (Udhaaro Due)</option>
                <option value="Partial">Partial Payment</option>
              </select>

              {newExpense.paymentStatus === 'Partial' && (
                <input type="number" placeholder="Amount Paid Now (NPR)" value={newExpense.paidNow} onChange={e => setNewExpense({...newExpense, paidNow: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              )}

<SupplierAutocomplete
                value={newExpense.supplierName}
                placeholder="Supplier / Party Name (Optional)"
                suppliers={uniqueSuppliers}
                onChange={value => setNewExpense(prev => ({ ...prev, supplierName: value }))}
                onSelect={supplier => handleSupplierSelect(supplier)}
                className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
              />
              <input type="text" placeholder="Supplier Phone (Optional)" value={newExpense.supplierPhone} onChange={e => setNewExpense({...newExpense, supplierPhone: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />

              <button type="submit" className="md:col-span-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-blue-600/35">
                {editingExpenseId ? 'Update Expense' : 'Save Expense Record'}
              </button>
            </form>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={`${t.tableHeader} font-bold uppercase text-sm border-b`}>
                    <tr>
                      <th className="p-4 text-left">Date & Category</th>
                      <th className="p-4 text-left">Description</th>
                      <th className="p-4 text-left">Supplier</th>
                      <th className="p-4 text-left">Total</th>
                      <th className="p-4 text-left">Paid / Due</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.tableDivide}`}>
                    {filteredExpenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-blue-600/5 transition">
                        <td className={`p-4 ${t.textMuted}`}>{exp.date}<br/><span className="font-bold text-blue-400">{exp.category}</span></td>
                        <td className={`p-4 font-bold ${t.textMain}`}>{exp.description}</td>
                        <td className={`p-4 ${t.textMuted}`}>{exp.supplierName || '—'}<br/><span className="text-xs">{exp.supplierPhone}</span></td>
                        <td className={`p-4 font-bold ${t.textMain}`}>NPR {exp.amount || exp.paidAmount}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${Number(exp.dueAmount || 0) > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {Number(exp.dueAmount || 0) > 0 ? `Due: NPR ${exp.dueAmount}` : 'Fully Paid'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {Number(exp.dueAmount || 0) > 0 && (
                            <button onClick={() => setPayingExpense(exp)} className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 rounded-xl font-bold">Pay Due</button>
                          )}
                          <button onClick={() => deleteExpense(exp.id)} className="px-3 py-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-xl font-bold"><Trash2 size={14}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          <div id="particular-supplier-tracker" className={`${t.cardBg} border ${t.border} rounded-3xl p-5 shadow-xl space-y-4`}>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <p className={`text-xs uppercase tracking-[0.2em] font-black ${t.textMuted}`}>Supplier Account Tracker</p>
                <h3 className={`text-lg font-black ${t.textMain}`}>Particular Supplier Ko Pura Hisab</h3>
                <p className={`text-sm ${t.textMuted} mt-1`}>Select one supplier and see every purchase, payment and remaining udhaaro for the selected period.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setSupplierPeriodFilter('day')} className={`px-3 py-2 rounded-xl text-xs font-bold border ${supplierPeriodFilter === 'day' ? 'bg-blue-600 text-white border-blue-500' : `${t.cardSecondary} ${t.textMuted}`}`}>Today</button>
                <button type="button" onClick={() => setSupplierPeriodFilter('week')} className={`px-3 py-2 rounded-xl text-xs font-bold border ${supplierPeriodFilter === 'week' ? 'bg-blue-600 text-white border-blue-500' : `${t.cardSecondary} ${t.textMuted}`}`}>This Week</button>
                <button type="button" onClick={() => setSupplierPeriodFilter('month')} className={`px-3 py-2 rounded-xl text-xs font-bold border ${supplierPeriodFilter === 'month' ? 'bg-blue-600 text-white border-blue-500' : `${t.cardSecondary} ${t.textMuted}`}`}>This Month</button>
                {supplierPeriodFilter === 'month' && <input type="month" value={supplierMonthFilter} onChange={e => setSupplierMonthFilter(e.target.value)} className={`px-3 py-2 ${t.inputBg} border rounded-xl text-xs`} />}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <SupplierAutocomplete value={activeSupplierLedgerName} placeholder="Select particular supplier..." suppliers={uniqueSuppliers} onChange={value => setSelectedSupplierLedger(value)} onSelect={supplier => setSelectedSupplierLedger(supplier.name)} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <select value={activeSupplierLedgerName} onChange={e => setSelectedSupplierLedger(e.target.value)} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}>
                <option value="">Select supplier from period...</option>
                {supplierTrackerNames.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            {activeSupplierLedgerName && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`${t.cardSecondary} border ${t.border} rounded-2xl p-4`}><div className={`text-xs ${t.textMuted}`}>Purchase Total</div><div className="text-xl font-black text-blue-400">NPR {selectedSupplierPurchaseTotal.toLocaleString()}</div></div>
                  <div className={`${t.cardSecondary} border ${t.border} rounded-2xl p-4`}><div className={`text-xs ${t.textMuted}`}>Paid</div><div className="text-xl font-black text-emerald-400">NPR {selectedSupplierPaidTotal.toLocaleString()}</div></div>
                  <div className={`${t.cardSecondary} border ${t.border} rounded-2xl p-4`}><div className={`text-xs ${t.textMuted}`}>Remaining Udhaaro</div><div className="text-xl font-black text-rose-400">NPR {selectedSupplierDueTotal.toLocaleString()}</div></div>
                </div>
                {selectedSupplierTransactions.length === 0 ? (
                  <div className={`p-5 rounded-2xl ${t.cardSecondary} ${t.textMuted} text-sm`}>No transactions for {activeSupplierLedgerName} in this period.</div>
                ) : (
                  <div className="overflow-x-auto"><table className="w-full text-sm"><thead className={`${t.tableHeader} border-b`}><tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Purchase / Description</th><th className="p-3 text-right">Total</th><th className="p-3 text-right">Paid</th><th className="p-3 text-right">Due</th><th className="p-3 text-right">Action</th></tr></thead><tbody className={`divide-y ${t.tableDivide}`}>
                    {selectedSupplierTransactions.map(exp => <tr key={exp.id} className="hover:bg-blue-600/5 transition"><td className={`p-3 ${t.textMuted}`}>{exp.date}</td><td className={`p-3 font-bold ${t.textMain}`}>{exp.description}<div className={`text-xs ${t.textMuted}`}>{exp.itemName || exp.category}{exp.invoiceNo ? ` • Invoice ${exp.invoiceNo}` : ''}</div></td><td className="p-3 text-right font-bold">NPR {Number(exp.amount || exp.paidAmount || 0).toLocaleString()}</td><td className="p-3 text-right text-emerald-400 font-bold">NPR {Number(exp.paidAmount || 0).toLocaleString()}</td><td className="p-3 text-right text-rose-400 font-bold">NPR {Number(exp.dueAmount || 0).toLocaleString()}</td><td className="p-3 text-right">{Number(exp.dueAmount || 0) > 0 ? <button type="button" onClick={() => setPayingExpense(exp)} className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 rounded-xl font-bold text-xs">Pay Due</button> : <span className={`text-xs ${t.textMuted}`}>Paid</span>}</td></tr>)}
                  </tbody></table></div>
                )}
              </>
            )}
          </div>
          </div>
        )}

        {/* BACKUP TAB */}
        {activeTab === 'backup' && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-xl mx-auto">
            <h2 className={`text-xl font-bold ${t.textMain}`}>Backup & Restore Shop Data</h2>
            <div className={`${t.cardBg} border ${t.border} p-6 rounded-3xl space-y-4 shadow-xl`}>
              <p className={`text-sm ${t.textMuted}`}>Download a JSON backup of all your shop repairs, inventory, customers, expenses and settings to keep your records safe.</p>
              <button onClick={exportData} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl p-3.5 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/35">
                <Download size={18}/> Export Backup File (.json)
              </button>
              <hr className={t.border}/>
              <p className={`text-sm ${t.textMuted}`}>Restore your shop data from a previously saved JSON backup file.</p>
              <input type="file" accept=".json" onChange={importData} className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer w-full" />
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
            <h2 className={`text-xl font-bold ${t.textMain}`}>Shop Profile & Settings</h2>
            <div className={`${t.cardBg} border ${t.border} p-6 rounded-3xl space-y-4 shadow-xl`}>
              <div>
                <label className="text-sm font-bold text-slate-400 block mb-1">Theme / GUI Variety</label>
                <div className="flex gap-3">
                  {['dim', 'dark', 'light'].map(thm => (
                    <button key={thm} onClick={() => setTheme(thm)} className={`flex-1 p-3 rounded-2xl font-bold uppercase text-sm border transition ${theme === thm ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30' : `${t.cardSecondary} ${t.textMuted} border-slate-700`}`}>
                      {thm}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-400 block mb-1">Shop Name</label>
                <input type="text" value={shopInfo.name} onChange={e => setShopInfo({...shopInfo, name: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-400 block mb-1">Tagline</label>
                <input type="text" value={shopInfo.tagline} onChange={e => setShopInfo({...shopInfo, tagline: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-400 block mb-1">Address / Location</label>
                <input type="text" value={shopInfo.address} onChange={e => setShopInfo({...shopInfo, address: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-400 block mb-1">Phone Number</label>
                  <input type="text" value={shopInfo.phone} onChange={e => setShopInfo({...shopInfo, phone: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-400 block mb-1">PAN / VAT No.</label>
                  <input type="text" value={shopInfo.panNo} onChange={e => setShopInfo({...shopInfo, panNo: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                </div>
              </div>
              <button onClick={() => alert('Shop settings saved successfully!')} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-blue-600/35">Save Shop Settings</button>
            </div>
          </div>
        )}

      </main>

      {/* INVOICE PREVIEW MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className={`${t.cardBg} border ${t.border} rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative space-y-4 my-8`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-700/50">
              <div>
                <h3 className={`text-lg font-black ${t.textMain}`}>Invoice Preview #{selectedInvoice.id}</h3>
                <p className={`text-xs ${t.textMuted}`}>{selectedInvoice.dateTime}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"><X size={18}/></button>
            </div>

            <div className={`${t.cardSecondary} border ${t.border} p-5 rounded-2xl space-y-3 font-mono text-xs`}>
              <div className="flex justify-between font-bold text-sm text-white">
                <span>{shopInfo.name}</span>
                <span>PAN: {shopInfo.panNo}</span>
              </div>
              <p className="text-slate-400">{shopInfo.address} • Tel: {shopInfo.phone}</p>
              <hr className="border-slate-700"/>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div><span className="text-slate-500">Customer:</span> {selectedInvoice.customerName}</div>
                <div><span className="text-slate-500">Phone:</span> {selectedInvoice.phone}</div>
                <div><span className="text-slate-500">Model:</span> {selectedInvoice.model || selectedInvoice.deviceType}</div>
                <div><span className="text-slate-500">Warranty:</span> {selectedInvoice.warrantyMonths || '—'}</div>
              </div>
              <hr className="border-slate-700"/>
              <div className="space-y-1">
                {(selectedInvoice.items || [{ name: selectedInvoice.model || selectedInvoice.issue, price: selectedInvoice.totalCost, qty: 1 }]).map((it, i) => (
                  <div key={i} className="flex justify-between text-slate-300">
                    <span>{it.qty || 1}x {it.name}</span>
                    <span className="font-bold">NPR {(it.price || 0) * (it.qty || 1)}</span>
                  </div>
                ))}
              </div>
              <hr className="border-slate-700"/>
              <div className="flex justify-between text-white font-bold text-sm">
                <span>Total Amount:</span>
                <span>NPR {selectedInvoice.totalCost}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Paid Amount:</span>
                <span>NPR {selectedInvoice.paidAmount}</span>
              </div>
              <div className="flex justify-between text-rose-400 font-bold">
                <span>Balance Due:</span>
                <span>NPR {selectedInvoice.dueAmount}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button onClick={() => printInvoice(selectedInvoice)} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/30 text-sm">
                <Printer size={16}/> Print Invoice
              </button>
              <button onClick={() => downloadInvoiceImage(selectedInvoice)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition text-sm">
                <Download size={16}/> Download PNG
              </button>
              <button onClick={() => sendToWhatsApp(selectedInvoice)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition text-sm">
                <MessageSquare size={16}/> WhatsApp
              </button>
            </div>
            {Number(selectedInvoice.dueAmount || 0) > 0 && (
              <button onClick={() => { markInvoiceAsPaid(selectedInvoice.id); setSelectedInvoice(null); alert('Marked bill as fully paid!'); }} className="w-full bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 font-bold rounded-xl py-2.5 transition text-sm">
                ✓ Mark as Fully Paid
              </button>
            )}
          </div>
        </div>
      )}

      {/* PAY DUE MODAL FOR EXPENSES */}
      {payingExpense && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`${t.cardBg} border ${t.border} rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-700/50">
              <h3 className={`text-lg font-black ${t.textMain}`}>Pay Supplier Due (Udhaaro)</h3>
              <button onClick={() => setPayingExpense(null)} className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"><X size={18}/></button>
            </div>
            <div className={`${t.cardSecondary} border ${t.border} p-4 rounded-2xl space-y-1 text-sm`}>
              <p className={`font-bold ${t.textMain}`}>{payingExpense.description}</p>
              <p className={`text-sm ${t.textMuted}`}>Supplier: {payingExpense.supplierName || '—'}</p>
              <p className="text-rose-400 font-bold mt-2">Current Due: NPR {payingExpense.dueAmount}</p>
            </div>
            <div className="space-y-3">
              <input type="number" placeholder="Payment Amount (NPR)" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} autoFocus />
              <input type="date" value={payForm.date} onChange={e => setPayForm({...payForm, date: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
            </div>
            <button onClick={() => addExpensePayment(payingExpense.id, payForm.amount, payForm.date, payForm.paymentMethod)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-emerald-600/30">
              Confirm Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
