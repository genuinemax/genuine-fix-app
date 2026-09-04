import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './Login';
import React, { useState, useEffect } from 'react';
import { 
  Wrench, Package, FileText, LayoutDashboard, DollarSign, 
  Trash2, Printer, ShieldCheck, User, CreditCard, Search, Eye, ChevronRight, Download, Upload, ShoppingBag, MessageSquare, Plus, AlertTriangle, ArrowUpRight, ArrowDownRight, X, CheckCircle2, Image as ImageIcon, Pencil, Smartphone, Laptop, Settings, Sun, Moon, Monitor
} from 'lucide-react';

export default function App() {
  // ==========================================
  // १. सबै सबै useState र useEffect हरू सधैं यहाँ माथि राख्ने
  // ==========================================
  const [activeTab, setActiveTab] = useState('invoices');
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
      panNo: '609876543'
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
        warrantyMonths: '30 Days',
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

  // Unique Customers List (Auto-extracted from repairs and devices for autocomplete)
  const uniqueCustomers = Array.from(
    new Map(
      repairs
        .filter(r => r.customerName && r.customerName !== 'Walk-in Customer')
        .map(r => [r.customerName.trim().toLowerCase(), { name: r.customerName, phone: r.phone }])
    ).values()
  );

  // Form & UI States
  const [newRepair, setNewRepair] = useState({ 
    customerName: '', phone: '', citizenshipNo: '', 
    customerPhoto: '', citizenshipPhoto: '', 
    deviceType: 'Mobile (Unlock)', model: '', totalCost: '', paidAmount: '', issue: '', warrantyMonths: '30 Days' 
  });
  
  const [posBill, setPosBill] = useState({
    customerName: '',
    phone: '',
    items: [{ name: '', price: '', qty: 1 }],
    paidAmount: '',
    warrantyMonths: '30 Days'
  });

  const [newDevice, setNewDevice] = useState({
    deviceCategory: 'Second-Hand Phone',
    brandModel: '',
    imeiOrSerial: '',
    condition: 'Good / Fresh',
    partyName: '',
    partyPhone: '',
    buyPrice: '',
    sellPrice: '',
    warrantyMonths: '30 Days'
  });

  const [selectedCategory, setSelectedCategory] = useState(categories[0] || 'Mobile Parts');
  const [newPart, setNewPart] = useState({ name: '', stock: '', costPrice: '', price: '', minStock: '5' });
  const [newExpense, setNewExpense] = useState({ description: '', amount: '' });
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

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px', fontSize: '18px' }}>लोड हुँदैछ...</div>;
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

  const exportData = () => {
    const backupData = {
      shopInfo,
      categories,
      repairs,
      inventory,
      devicesStock,
      expenses,
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
          alert('तपाईको पसलको डाटा सफलतापूर्वक Restore भयो!');
        } else {
          alert('अमान्य ब्याकअप फाइल (Invalid Backup File format)!');
        }
      } catch (err) {
        alert('फाइल पढ्न असफल भयो!');
      }
    };
    reader.readAsText(file);
  };

  const handleCustomerSelect = (name, formType) => {
    const found = uniqueCustomers.find(c => c.name.toLowerCase() === name.toLowerCase());
    const phoneVal = found ? found.phone : '';

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
      warrantyMonths: newRepair.warrantyMonths || '30 Days',
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
    setNewRepair({ customerName: '', phone: '', citizenshipNo: '', customerPhoto: '', citizenshipPhoto: '', deviceType: 'Mobile (Unlock)', model: '', totalCost: '', paidAmount: '', issue: '', warrantyMonths: '30 Days' });
    alert('Job Sheet सफलतापूर्वक Save भयो!');
  };

  const handleAddDevice = (e) => {
    e.preventDefault();
    const sellPriceVal = Number(newDevice.sellPrice || 0);
    const buyPriceVal = Number(newDevice.buyPrice || 0);

    const deviceItem = {
      id: `DEV-${Math.floor(1000 + Math.random() * 9000)}`,
      deviceCategory: newDevice.deviceCategory,
      brandModel: newDevice.brandModel || 'Unknown Device',
      imeiOrSerial: newDevice.imeiOrSerial || 'N/A',
      condition: newDevice.condition,
      partyName: newDevice.partyName || 'Walk-in Party',
      partyPhone: newDevice.partyPhone || 'N/A',
      buyPrice: buyPriceVal,
      sellPrice: sellPriceVal,
      status: 'In Stock',
      date: new Date().toISOString().split('T')[0]
    };

    setDevicesStock([deviceItem, ...devicesStock]);

    const deviceInvoice = {
      id: `DVB-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: newDevice.partyName || 'Walk-in Customer',
      phone: newDevice.partyPhone || 'N/A',
      citizenshipNo: '',
      customerPhoto: '',
      citizenshipPhoto: '',
      deviceType: newDevice.deviceCategory,
      model: `${newDevice.brandModel} (IMEI/S: ${newDevice.imeiOrSerial})`,
      totalCost: sellPriceVal,
      paidAmount: sellPriceVal,
      dueAmount: 0,
      issue: `${newDevice.deviceCategory} Purchase/Stock Entry`,
      warrantyMonths: newDevice.warrantyMonths || '30 Days',
      status: 'Delivered',
      dateTime: getCurrentDateTime(),
      billType: 'Device Sale',
      items: [
        {
          name: `${newDevice.deviceCategory} - ${newDevice.brandModel} [IMEI: ${newDevice.imeiOrSerial}]`,
          price: sellPriceVal,
          qty: 1,
          remarks: `Condition: ${newDevice.condition}`
        }
      ]
    };

    setRepairs([deviceInvoice, ...repairs]);
    setNewDevice({
      deviceCategory: 'Second-Hand Phone',
      brandModel: '',
      imeiOrSerial: '',
      condition: 'Good / Fresh',
      partyName: '',
      partyPhone: '',
      buyPrice: '',
      sellPrice: '',
      warrantyMonths: '30 Days'
    });
    alert('Device सफलतापूर्वक Save भयो!');
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
      warrantyMonths: posBill.warrantyMonths || '30 Days',
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
    setPosBill({ customerName: '', phone: '', items: [{ name: '', price: '', qty: 1 }], paidAmount: '', warrantyMonths: '30 Days' });
    alert('Accessories Bill सफलतापूर्वक Save भयो!');
  };

  const handleAddPart = (e) => {
    e.preventDefault();
    setInventory([...inventory, { 
      id: Date.now(), 
      category: selectedCategory, 
      name: newPart.name || 'Unnamed Part', 
      stock: Number(newPart.stock || 0), 
      costPrice: Number(newPart.costPrice || 0),
      price: Number(newPart.price || 0),
      minStock: Number(newPart.minStock || 5)
    }]);
    setNewPart({ name: '', stock: '', costPrice: '', price: '', minStock: '5' });
  };

  const adjustStock = (id, amount) => {
    setInventory(inventory.map(item => {
      if (item.id === id) {
        const newStock = Math.max(0, Number(item.stock) + amount);
        return { ...item, stock: newStock };
      }
      return item;
    }));
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    setExpenses([...expenses, { 
      description: newExpense.description || 'General Expense', 
      id: Date.now(), 
      amount: Number(newExpense.amount || 0), 
      date: new Date().toISOString().split('T')[0] 
    }]);
    setNewExpense({ description: '', amount: '' });
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
    ctx.fillText(`Warranty: ${inv.warrantyMonths || '30 Days'}`, 420, 238);

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
🛡️ *Warranty:* ${inv.warrantyMonths || '30 Days'}
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
  const deletePart = (id) => setInventory(inventory.filter(i => i.id !== id));
  const deleteDevice = (id) => setDevicesStock(devicesStock.filter(d => d.id !== id));
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

  return (
    <div className={`min-h-screen ${t.appBg} font-sans transition-colors duration-200`}>
      {/* Global Datalist for Customer Name Autocomplete */}
      <datalist id="customer-list">
        {uniqueCustomers.map((c, idx) => (
          <option key={idx} value={c.name} data-phone={c.phone} />
        ))}
      </datalist>

      {/* Top Navigation Bar */}
      <nav className={`border-b ${t.border} ${t.navBg} backdrop-blur-xl sticky top-0 z-30 shadow-lg`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-700 shadow-md bg-slate-900 flex items-center justify-center">
              <img src="/logo.jpg" alt="Genuine Fix Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className={`font-extrabold text-lg ${t.textMain} leading-tight tracking-tight`}>{shopInfo.name}</h1>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Laptop & Smartphone Repair</p>
            </div>
          </div>
          
          <div className={`flex flex-wrap items-center gap-1.5 ${t.cardSecondary} p-1.5 rounded-2xl border ${t.border}`}>
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
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
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : `${t.textMuted} hover:text-white hover:bg-blue-600/10`
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
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`bg-gradient-to-br from-blue-500/10 to-transparent border ${t.border} p-6 rounded-3xl shadow-xl`}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Revenue</p>
                <h3 className="text-3xl font-black text-blue-400">NPR {totalRevenue}</h3>
              </div>
              <div className={`bg-gradient-to-br from-emerald-500/10 to-transparent border ${t.border} p-6 rounded-3xl shadow-xl`}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Balance Due</p>
                <h3 className="text-3xl font-black text-emerald-400">NPR {totalDue}</h3>
              </div>
              <div className={`bg-gradient-to-br from-rose-500/10 to-transparent border ${t.border} p-6 rounded-3xl shadow-xl`}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Shop Expenses</p>
                <h3 className="text-3xl font-black text-rose-400">NPR {totalExp}</h3>
              </div>
            </div>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl p-6 shadow-xl`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-bold ${t.textMain}`}>Recent Bills & Job Sheets</h2>
                <button onClick={() => setActiveTab('invoices')} className="text-blue-400 text-xs font-bold flex items-center gap-1 hover:text-blue-300">
                  View All <ChevronRight size={15}/>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={`${t.tableHeader} font-bold uppercase text-xs border-b`}>
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
                          <span className={`px-3 py-1 rounded-full ${t.cardSecondary} ${t.textMuted} text-xs font-bold border ${t.border}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button onClick={() => setSelectedInvoice(r)} className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl text-xs font-bold inline-flex items-center gap-1">
                            <Eye size={14}/> Preview
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

        {/* REPAIRS / JOB SHEETS TAB */}
        {activeTab === 'repairs' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className={`text-xl font-bold ${t.textMain}`}>Create Repair / Unlocking Job Sheet</h2>
            <form onSubmit={handleAddRepair} className={`${t.cardBg} border ${t.border} p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4 shadow-xl`}>
              <input 
                type="text" 
                list="customer-list"
                autoComplete="on"
                placeholder="Customer Full Name (पुराना नाम सुझाव आउँछ)" 
                value={newRepair.customerName} 
                onChange={e => handleCustomerSelect(e.target.value, 'repair')} 
                className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none focus:border-blue-600`} 
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
                  <label className="text-xs font-bold text-slate-400 block mb-1">Customer Photo (Optional)</label>
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'customerPhoto')} className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer" />
                  {newRepair.customerPhoto && <span className="text-xs text-emerald-400 mt-1 block font-semibold">✓ Customer Photo Attached</span>}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Citizenship Photo (Optional)</label>
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'citizenshipPhoto')} className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer" />
                  {newRepair.citizenshipPhoto && <span className="text-xs text-emerald-400 mt-1 block font-semibold">✓ Citizenship Photo Attached</span>}
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
              <p className={`text-xs ${t.textMuted} mt-0.5`}>Record 2nd-hand phone/laptop buybacks, trade-ins, or new device sales with IMEI & customer details.</p>
            </div>

            <form onSubmit={handleAddDevice} className={`${t.cardBg} border ${t.border} p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4 shadow-xl`}>
              <select value={newDevice.deviceCategory} onChange={e => setNewDevice({...newDevice, deviceCategory: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}>
                <option value="Second-Hand Phone">Second-Hand Phone</option>
                <option value="Second-Hand Laptop">Second-Hand Laptop</option>
                <option value="New Phone">New Phone (Brand New)</option>
                <option value="New Laptop">New Laptop (Brand New)</option>
              </select>

              <input type="text" placeholder="Brand & Model (e.g. iPhone 13 / Dell Inspiron)" value={newDevice.brandModel} onChange={e => setNewDevice({...newDevice, brandModel: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              <input type="text" placeholder="IMEI Number or Serial No." value={newDevice.imeiOrSerial} onChange={e => setNewDevice({...newDevice, imeiOrSerial: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              
              <input type="text" placeholder="Condition / Specs (e.g. Battery 90%, Scratchless)" value={newDevice.condition} onChange={e => setNewDevice({...newDevice, condition: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <input 
                type="text" 
                list="customer-list"
                autoComplete="on"
                placeholder="Customer / Party Name (सुझाव आउँछ)" 
                value={newDevice.partyName} 
                onChange={e => handleCustomerSelect(e.target.value, 'device')} 
                className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} 
              />
              <input type="text" placeholder="Customer Phone Number" value={newDevice.partyPhone} onChange={e => setNewDevice({...newDevice, partyPhone: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />

              <input type="number" placeholder="Buy Price / Cost Price (NPR)" value={newDevice.buyPrice} onChange={e => setNewDevice({...newDevice, buyPrice: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <input type="number" placeholder="Selling Price (NPR)" value={newDevice.sellPrice} onChange={e => setNewDevice({...newDevice, sellPrice: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              <input type="text" placeholder="Warranty (e.g. 3 Months)" value={newDevice.warrantyMonths} onChange={e => setNewDevice({...newDevice, warrantyMonths: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />

              <button type="submit" className="md:col-span-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-emerald-600/30">Save Device & Generate Bill</button>
            </form>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>
              <table className="w-full text-left text-sm">
                <thead className={`${t.tableHeader} text-xs uppercase border-b`}>
                  <tr>
                    <th className="p-4">Device & Category</th>
                    <th className="p-4">IMEI / S.N. & Condition</th>
                    <th className="p-4">Party / Seller</th>
                    <th className="p-4">Buy / Sell Price</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${t.tableDivide}`}>
                  {devicesStock.map(dev => (
                    <tr key={dev.id}>
                      <td className="p-4">
                        <p className={`font-bold ${t.textMain}`}>{dev.brandModel}</p>
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[11px] font-bold">{dev.deviceCategory}</span>
                      </td>
                      <td className="p-4">
                        <p className="font-mono text-xs text-blue-400">{dev.imeiOrSerial}</p>
                        <p className={`text-xs ${t.textMuted}`}>{dev.condition}</p>
                      </td>
                      <td className="p-4">
                        <p className={`font-bold ${t.textMain}`}>{dev.partyName}</p>
                        <p className={`text-xs ${t.textMuted}`}>{dev.partyPhone}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-xs text-rose-400">Buy: NPR {dev.buyPrice}</p>
                        <p className="text-sm font-bold text-emerald-400">Sell: NPR {dev.sellPrice}</p>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => deleteDevice(dev.id)} className="p-2 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20"><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ACCESSORIES / POS BILLING TAB */}
        {activeTab === 'pos' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className={`text-xl font-bold ${t.textMain}`}>Accessories & Parts Direct Billing (POS)</h2>
              <p className={`text-xs ${t.textMuted} mt-0.5`}>Pick from stock or type custom item names and prices freely. Stock will deduct automatically.</p>
            </div>

            <form onSubmit={handleSavePosBill} className={`${t.cardBg} border ${t.border} p-6 rounded-3xl space-y-4 shadow-xl`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  list="customer-list"
                  autoComplete="on"
                  placeholder="Customer Name (सुझाव आउँछ)" 
                  value={posBill.customerName} 
                  onChange={e => handleCustomerSelect(e.target.value, 'pos')} 
                  className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} 
                />
                <input type="text" placeholder="Phone Number (Optional)" value={posBill.phone} onChange={e => setPosBill({...posBill, phone: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-400">Items List</label>
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
                <button type="button" onClick={handleAddPosItem} className={`px-4 py-2 ${t.cardSecondary} hover:opacity-80 ${t.textMain} rounded-xl text-xs font-bold border ${t.border}`}>+ Add Another Item</button>
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
                    <button key={tab} onClick={() => setInvoiceFilterTab(tab)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${invoiceFilterTab === tab ? 'bg-blue-600 text-white' : `${t.textMuted} hover:text-white`}`}>{tab}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>
              <table className="w-full text-left text-sm">
                <thead className={`${t.tableHeader} text-xs uppercase border-b`}>
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
                        <p className={`text-[11px] ${t.textMuted}`}>{inv.dateTime}</p>
                      </td>
                      <td className="p-4">
                        <p className={`font-bold ${t.textMain}`}>{inv.customerName}</p>
                        <p className={`text-xs ${t.textMuted}`}>{inv.phone}</p>
                      </td>
                      <td className={`p-4 ${t.textMuted}`}>{inv.model}</td>
                      <td className="p-4">
                        <p className={`font-bold ${t.textMain}`}>NPR {inv.totalCost}</p>
                        {Number(inv.dueAmount) > 0 ? (
                          <span className="text-xs font-bold text-rose-400">Due: NPR {inv.dueAmount}</span>
                        ) : (
                          <span className="text-xs font-bold text-emerald-400">Paid in Full</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => setSelectedInvoice(inv)} className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl text-xs font-bold">Preview</button>
                        <button onClick={() => setEditingInvoice(inv)} className="px-3 py-1.5 bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 rounded-xl text-xs font-bold inline-flex items-center gap-1">
                          <Pencil size={14}/> Edit
                        </button>
                        <button onClick={() => { if(window.confirm('के तपाईं यो रेकर्ड डिलेट गर्न चाहनुहुन्छ?')) deleteRepair(inv.id); }} className="p-2 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 inline-flex items-center align-middle">
                          <Trash2 size={14}/>
                        </button>
                        {Number(inv.dueAmount) > 0 && (
                          <button onClick={() => markInvoiceAsPaid(inv.id)} className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 rounded-xl text-xs font-bold">Mark Paid</button>
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
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-bold ${t.textMain}`}>Parts & Accessories Inventory</h2>
            </div>

            <form onSubmit={handleAddPart} className={`${t.cardBg} border ${t.border} p-6 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-4 shadow-xl`}>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="text" placeholder="Part Name" value={newPart.name} onChange={e => setNewPart({...newPart, name: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              <input type="number" placeholder="Stock Quantity" value={newPart.stock} onChange={e => setNewPart({...newPart, stock: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              <input type="number" placeholder="Cost Price (NPR)" value={newPart.costPrice} onChange={e => setNewPart({...newPart, costPrice: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              <input type="number" placeholder="Selling Price (NPR)" value={newPart.price} onChange={e => setNewPart({...newPart, price: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              <button type="submit" className="md:col-span-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-blue-600/30">Add New Part to Stock</button>
            </form>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>
              <table className="w-full text-left text-sm">
                <thead className={`${t.tableHeader} text-xs uppercase border-b`}>
                  <tr>
                    <th className="p-4">Part Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Price (Cost / Sell)</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${t.tableDivide}`}>
                  {inventory.map(item => (
                    <tr key={item.id}>
                      <td className={`p-4 font-bold ${t.textMain}`}>{item.name}</td>
                      <td className={`p-4 ${t.textMuted}`}>{item.category}</td>
                      <td className="p-4 font-bold text-blue-400">{item.stock} units</td>
                      <td className={`p-4 ${t.textMuted}`}>NPR {item.costPrice} / <span className="text-emerald-400 font-bold">NPR {item.price}</span></td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => adjustStock(item.id, 1)} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold">+</button>
                        <button onClick={() => adjustStock(item.id, -1)} className="px-2.5 py-1 bg-rose-500/10 text-rose-400 rounded-lg text-xs font-bold">-</button>
                        <button onClick={() => deletePart(item.id)} className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg"><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EXPENSES TAB */}
        {activeTab === 'expenses' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className={`text-xl font-bold ${t.textMain}`}>Shop Expenses Tracker</h2>
            <form onSubmit={handleAddExpense} className={`${t.cardBg} border ${t.border} p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4 shadow-xl`}>
              <input type="text" placeholder="Expense Description (e.g. Rent, Electricity)" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className={`md:col-span-2 p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              <input type="number" placeholder="Amount (NPR)" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              <button type="submit" className="md:col-span-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-rose-600/30">Add Expense Record</button>
            </form>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>
              <table className="w-full text-left text-sm">
                <thead className={`${t.tableHeader} text-xs uppercase border-b`}>
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${t.tableDivide}`}>
                  {expenses.map(exp => (
                    <tr key={exp.id}>
                      <td className={`p-4 ${t.textMuted}`}>{exp.date}</td>
                      <td className={`p-4 font-bold ${t.textMain}`}>{exp.description}</td>
                      <td className="p-4 font-bold text-rose-400">NPR {exp.amount}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => deleteExpense(exp.id)} className="p-2 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20"><Trash2 size={15}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                <p className={`text-xs ${t.textMuted} mt-1`}>Export all your repairs, device trading, inventory, expenses into a secure JSON file.</p>
                <button onClick={exportData} className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition shadow-lg shadow-blue-600/30 inline-flex items-center gap-2">
                  <Download size={18}/> Export Backup Now
                </button>
              </div>

              <hr className={t.border} />

              <div>
                <h3 className={`font-bold ${t.textMain} text-lg`}>Restore from Backup</h3>
                <p className={`text-xs ${t.textMuted} mt-1`}>Upload your previously exported JSON backup file to restore shop data.</p>
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
                    <label className={`text-xs ${t.textMuted} block mb-1`}>Shop Name</label>
                    <input type="text" value={shopInfo.name} onChange={e => setShopInfo({...shopInfo, name: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                  </div>
                  <div>
                    <label className={`text-xs ${t.textMuted} block mb-1`}>PAN / VAT Number</label>
                    <input type="text" value={shopInfo.panNo} onChange={e => setShopInfo({...shopInfo, panNo: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                  </div>
                  <div>
                    <label className={`text-xs ${t.textMuted} block mb-1`}>Phone Number</label>
                    <input type="text" value={shopInfo.phone} onChange={e => setShopInfo({...shopInfo, phone: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
                  </div>
                  <div>
                    <label className={`text-xs ${t.textMuted} block mb-1`}>Address</label>
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
                      className={`p-4 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-2 ${thm.bg} ${
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
                  <p className="text-xs text-sky-400 font-bold uppercase">{shopInfo.tagline}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{shopInfo.address} | Phone: {shopInfo.phone} | PAN: {shopInfo.panNo}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sky-400 font-bold">INVOICE #{selectedInvoice.id}</p>
                  <p className="text-xs text-slate-300">Date: {selectedInvoice.dateTime}</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                    Number(selectedInvoice.dueAmount) <= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {Number(selectedInvoice.dueAmount) <= 0 ? 'PAID IN FULL' : 'DUE PENDING'}
                  </span>
                </div>
              </div>

              {/* Customer Box */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Bill To:</p>
                  <p className="font-bold text-base text-slate-900">{selectedInvoice.customerName}</p>
                  <p className="text-xs text-slate-600">Phone: {selectedInvoice.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600"><strong className="text-slate-400">Type:</strong> {selectedInvoice.deviceType || 'Repair & Sales'}</p>
                  <p className="text-xs text-slate-600"><strong className="text-slate-400">Warranty:</strong> {selectedInvoice.warrantyMonths || '30 Days'}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
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
                <div className="bg-white p-4 rounded-xl border border-slate-200 w-72 space-y-2 text-xs">
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
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs space-y-1">
                <p className="font-bold text-amber-800 uppercase">WARRANTY & TRADING TERMS:</p>
                <p className="text-amber-900">Warranty covers devices/parts as specified. Physical or water damage voids all warranty.</p>
                <p className="text-amber-900 font-medium">Thank you for choosing {shopInfo.name}! Your trusted tech partner.</p>
              </div>

              {/* Signature line */}
              <div className="pt-8 flex justify-end">
                <div className="text-center">
                  <div className="w-48 border-b border-slate-400 mb-1"></div>
                  <p className="text-xs font-bold text-slate-800">Authorized Signature</p>
                </div>
              </div>

            </div>

            {/* Modal Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button 
                onClick={() => downloadInvoiceImage(selectedInvoice)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow transition"
              >
                <Download size={15}/> Download Image
              </button>
              <button 
                onClick={() => printInvoice(selectedInvoice)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow transition"
              >
                <Printer size={15}/> Print Bill
              </button>
              <button 
                onClick={() => sendToWhatsApp(selectedInvoice)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow transition"
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
                <label className={`text-xs ${t.textMuted} block mb-1`}>Customer Name</label>
                <input type="text" value={editingInvoice.customerName} onChange={e => setEditingInvoice({...editingInvoice, customerName: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              </div>
              <div>
                <label className={`text-xs ${t.textMuted} block mb-1`}>Phone Number</label>
                <input type="text" value={editingInvoice.phone} onChange={e => setEditingInvoice({...editingInvoice, phone: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs ${t.textMuted} block mb-1`}>Total Cost (NPR)</label>
                  <input type="number" value={editingInvoice.totalCost} onChange={e => setEditingInvoice({...editingInvoice, totalCost: e.target.value})} className={`w-0.5% w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
                </div>
                <div>
                  <label className={`text-xs ${t.textMuted} block mb-1`}>Paid Amount (NPR)</label>
                  <input type="number" value={editingInvoice.paidAmount} onChange={e => setEditingInvoice({...editingInvoice, paidAmount: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} required />
                </div>
              </div>
              <div>
                <label className={`text-xs ${t.textMuted} block mb-1`}>Status / Notes</label>
                <input type="text" value={editingInvoice.status} onChange={e => setEditingInvoice({...editingInvoice, status: e.target.value})} className={`w-full p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingInvoice(null)} className={`px-4 py-2.5 ${t.cardSecondary} ${t.textMain} rounded-xl text-xs font-bold border ${t.border}`}>Cancel`}</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30">Update Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
