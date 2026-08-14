import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './Login';
import React, { useState, useEffect } from 'react';
import { 
  Wrench, Package, FileText, LayoutDashboard, DollarSign, 
  Trash2, Printer, ShieldCheck, User, CreditCard, Search, Eye, ChevronRight, Download, Upload, ShoppingBag, MessageSquare, Plus, AlertTriangle, ArrowUpRight, ArrowDownRight, X, CheckCircle2, Image as ImageIcon, Pencil, Smartphone, Laptop
} from 'lucide-react';

export default function App() {
  // ==========================================
  // १. सबै useState र useEffect हरू सधैं यहाँ माथि राख्ने
  // ==========================================
  const [activeTab, setActiveTab] = useState('invoices');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic Categories State with LocalStorage
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('gf_categories');
    return saved ? JSON.parse(saved) : [
      'Laptop Parts', 'Mobile Parts', 'Computer/Desktop Parts', 
      'Tablet Parts', 'Unlocking Tools & Credits', 'Accessories'
    ];
  });

  const [newCatInput, setNewCatInput] = useState('');

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
        warrantyDays: '30',
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

  // NEW: Devices Inventory & Buy/Sell (2nd Hand & New Phones/Laptops)
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

  // Form & UI States
  const [newRepair, setNewRepair] = useState({ 
    customerName: '', phone: '', citizenshipNo: '', 
    customerPhoto: '', citizenshipPhoto: '', 
    deviceType: 'Mobile (Unlock)', model: '', totalCost: '', paidAmount: '', issue: '', warrantyDays: '30' 
  });
  
  const [posBill, setPosBill] = useState({
    customerName: '',
    phone: '',
    items: [{ name: '', price: '', qty: 1 }],
    paidAmount: '',
    warrantyDays: '7'
  });

  // NEW: Device Buy/Sell Form State
  const [newDevice, setNewDevice] = useState({
    deviceCategory: 'Second-Hand Phone',
    brandModel: '',
    imeiOrSerial: '',
    condition: 'Good / Fresh',
    partyName: '',
    partyPhone: '',
    buyPrice: '',
    sellPrice: '',
    warrantyDays: '30'
  });

  const [selectedCategory, setSelectedCategory] = useState(categories[0] || 'Mobile Parts');
  const [newPart, setNewPart] = useState({ name: '', stock: '', costPrice: '', price: '', minStock: '5' });
  const [newExpense, setNewExpense] = useState({ description: '', amount: '' });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [inventoryFilter, setInventoryFilter] = useState('All');
  const [inventorySearch, setInventorySearch] = useState('');
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

  useEffect(() => { localStorage.setItem('gf_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('gf_repairs', JSON.stringify(repairs)); }, [repairs]);
  useEffect(() => { localStorage.setItem('gf_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('gf_devices_stock', JSON.stringify(devicesStock)); }, [devicesStock]);
  useEffect(() => { localStorage.setItem('gf_expenses', JSON.stringify(expenses)); }, [expenses]);

  // ==========================================
  // २. सबै हुकहरू सकिएपछि मात्र तल कन्डिसन (Returns) राख्ने
  // ==========================================
  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px', fontSize: '18px' }}>लोड हुँदैछ...</div>;
  }

  if (!user) {
    return <Login onLoginSuccess={(u) => setUser(u)} />;
  }

  // ==========================================
  // ३. Helper Functions & Handlers
  // ==========================================
  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];
    return `${date} ${time}`;
  };

  const totalRevenue = repairs.reduce((acc, curr) => acc + Number(curr.totalCost || 0), 0);
  const totalDue = repairs.reduce((acc, curr) => acc + Number(curr.dueAmount || 0), 0);
  const totalExp = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalStockValue = inventory.reduce((acc, curr) => acc + (Number(curr.stock || 0) * Number(curr.costPrice || 0)), 0);

  const exportData = () => {
    const backupData = {
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
    setNewRepair({ customerName: '', phone: '', citizenshipNo: '', customerPhoto: '', citizenshipPhoto: '', deviceType: 'Mobile (Unlock)', model: '', totalCost: '', paidAmount: '', issue: '', warrantyDays: '30' });
    setSelectedInvoice(repairItem);
  };

  // NEW: Add Device (Buy/Trade-in or New Phone/Laptop Stock)
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

    // Also optionally create a sales/purchase record invoice if needed
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
      warrantyDays: newDevice.warrantyDays,
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
      warrantyDays: '30'
    });
    setSelectedInvoice(deviceInvoice);
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
      warrantyDays: posBill.warrantyDays,
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
    setPosBill({ customerName: '', phone: '', items: [{ name: '', price: '', qty: 1 }], paidAmount: '', warrantyDays: '7' });
    setSelectedInvoice(newBill);
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

  // ==========================================
  // PROFESSIONAL & MODERN INVOICE CANVAS GENERATOR
  // ==========================================
  const downloadInvoiceImage = (inv) => {
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
    ctx.fillText('GENUINE FIX', 50, 55);

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('PROFESSIONAL LAPTOP & MOBILE REPAIR & TRADING CENTER', 50, 80);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px sans-serif';
    ctx.fillText('Taalchowk, Lekhnath, Pokhara  |  Phone: 9765676982', 50, 105);

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
    ctx.fillText(`Warranty: ${inv.warrantyDays || '30'} Days`, 420, 238);

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
    ctx.fillText('Thank you for choosing Genuine Fix! Your trusted tech partner.', 70, footerY + 56);

    ctx.fillStyle = '#0F172A';
    ctx.font = '12px sans-serif';
    ctx.fillText('Authorized Signature', 600, footerY + 130);
    ctx.strokeStyle = '#94A3B8';
    ctx.beginPath();
    ctx.moveTo(560, footerY + 105);
    ctx.lineTo(730, footerY + 105);
    ctx.stroke();

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `Invoice_${inv.id}_${inv.customerName.replace(/\s+/g, '_')}.png`;
    link.click();
  };

  const sendToWhatsApp = (inv) => {
    const text = `*GENUINE FIX - LAPTOP & MOBILE CENTER*
📍 Taalchowk, Pokhara | 📞 9765676982
----------------------------------------
👤 *Customer:* ${inv.customerName}
📞 *Phone:* ${inv.phone}
📅 *Date & Time:* ${inv.dateTime}
----------------------------------------
🛠️ *Service/Device:* ${inv.model}
📝 *Details:* ${inv.issue}
🛡️ *Warranty:* ${inv.warrantyDays || '30'} Days
----------------------------------------
💰 *Total Cost:* NPR ${inv.totalCost}
💵 *Amount Paid:* NPR ${inv.paidAmount}
🔴 *Balance Due:* NPR ${inv.dueAmount}
----------------------------------------
_Thank you for choosing Genuine Fix!_`;

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
    <div className="min-h-screen bg-[#0B0F17] text-slate-200 font-sans">
      {/* Top Navigation Bar */}
      <nav className="border-b border-slate-800 bg-[#0F1420]/85 backdrop-blur-xl sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-700 shadow-md bg-slate-900 flex items-center justify-center">
              <img src="/logo.jpg" alt="Genuine Fix Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-white leading-tight tracking-tight">Genuine Fix</h1>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Repair & Phone/Laptop Trading</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'repairs', icon: ShieldCheck, label: 'Job Sheets' },
              { id: 'devices', icon: Smartphone, label: 'Device Buy/Sell' },
              { id: 'pos', icon: ShoppingBag, label: 'Accessories Bill' },
              { id: 'invoices', icon: FileText, label: 'Invoices' },
              { id: 'inventory', icon: Package, label: 'Parts Stock' },
              { id: 'expenses', icon: DollarSign, label: 'Expenses' },
              { id: 'backup', icon: Download, label: 'Backup' },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
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
              <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-slate-800 p-6 rounded-3xl shadow-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Revenue</p>
                <h3 className="text-3xl font-black text-blue-400">NPR {totalRevenue}</h3>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-slate-800 p-6 rounded-3xl shadow-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Balance Due</p>
                <h3 className="text-3xl font-black text-emerald-400">NPR {totalDue}</h3>
              </div>
              <div className="bg-gradient-to-br from-rose-500/10 to-transparent border border-slate-800 p-6 rounded-3xl shadow-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Shop Expenses</p>
                <h3 className="text-3xl font-black text-rose-400">NPR {totalExp}</h3>
              </div>
            </div>

            <div className="bg-[#0F1420] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Recent Bills & Job Sheets</h2>
                <button onClick={() => setActiveTab('invoices')} className="text-blue-400 text-xs font-bold flex items-center gap-1 hover:text-blue-300">
                  View All <ChevronRight size={15}/>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-slate-400 font-bold uppercase text-xs border-b border-slate-800">
                    <tr>
                      <th className="pb-4 text-left">Bill ID</th>
                      <th className="pb-4 text-left">Customer</th>
                      <th className="pb-4 text-left">Type / Model</th>
                      <th className="pb-4 text-left">Due Amount</th>
                      <th className="pb-4 text-left">Status</th>
                      <th className="pb-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {repairs.slice(0, 5).map(r => (
                      <tr key={r.id}>
                        <td className="py-4 font-mono font-bold text-blue-400">{r.id}</td>
                        <td className="py-4 text-white font-medium">{r.customerName}</td>
                        <td className="py-4 text-slate-300">{r.model}</td>
                        <td className="py-4 font-bold text-rose-400">NPR {r.dueAmount}</td>
                        <td className="py-4">
                          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
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
            <h2 className="text-xl font-bold text-white">Create Repair / Unlocking Job Sheet</h2>
            <form onSubmit={handleAddRepair} className="bg-[#0F1420] border border-slate-800 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4 shadow-xl">
              <input type="text" placeholder="Customer Full Name (Optional)" value={newRepair.customerName} onChange={e => setNewRepair({...newRepair, customerName: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-blue-600" />
              <input type="text" placeholder="Phone Number (e.g. 98xxxxxxxx)" value={newRepair.phone} onChange={e => setNewRepair({...newRepair, phone: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-blue-600" />
              <input type="text" placeholder="Citizenship No. (Optional)" value={newRepair.citizenshipNo} onChange={e => setNewRepair({...newRepair, citizenshipNo: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-blue-600" />

              <select value={newRepair.deviceType} onChange={e => setNewRepair({...newRepair, deviceType: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none">
                <option value="Laptop Repair">Laptop Repair</option>
                <option value="Mobile Repair">Mobile Repair</option>
                <option value="Mobile (Unlock)">Mobile (Unlock)</option>
                <option value="Desktop/Computer">Desktop/Computer</option>
                <option value="Tablet Repair">Tablet Repair</option>
              </select>

              <input type="text" placeholder="Device Model (Optional)" value={newRepair.model} onChange={e => setNewRepair({...newRepair, model: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none" />
              <input type="number" placeholder="Total Cost (NPR)" value={newRepair.totalCost} onChange={e => setNewRepair({...newRepair, totalCost: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none" />
              <input type="number" placeholder="Paid Amount (NPR)" value={newRepair.paidAmount} onChange={e => setNewRepair({...newRepair, paidAmount: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none" />
              <input type="text" placeholder="Warranty Days (e.g. 30 Days)" value={newRepair.warrantyDays} onChange={e => setNewRepair({...newRepair, warrantyDays: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none" />
              <input type="text" placeholder="Issue / Details (Optional)" value={newRepair.issue} onChange={e => setNewRepair({...newRepair, issue: e.target.value})} className="md:col-span-2 p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none" />
              
              <button type="submit" className="md:col-span-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-blue-600/35">Save Job Sheet & Open Professional Invoice</button>
            </form>
          </div>
        )}

        {/* NEW TAB: PHONE & LAPTOP TRADING (BUY / SELL 2ND HAND & NEW) */}
        {activeTab === 'devices' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-white">📱 Second-Hand & New Phone / Laptop Trading</h2>
              <p className="text-xs text-slate-400 mt-0.5">Record 2nd-hand phone/laptop buybacks, trade-ins, or new device sales with IMEI & customer details.</p>
            </div>

            <form onSubmit={handleAddDevice} className="bg-[#0F1420] border border-slate-800 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4 shadow-xl">
              <select value={newDevice.deviceCategory} onChange={e => setNewDevice({...newDevice, deviceCategory: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none">
                <option value="Second-Hand Phone">Second-Hand Phone</option>
                <option value="Second-Hand Laptop">Second-Hand Laptop</option>
                <option value="New Phone">New Phone (Brand New)</option>
                <option value="New Laptop">New Laptop (Brand New)</option>
              </select>

              <input type="text" placeholder="Brand & Model (e.g. iPhone 13 / Dell Inspiron)" value={newDevice.brandModel} onChange={e => setNewDevice({...newDevice, brandModel: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none" required />
              <input type="text" placeholder="IMEI Number or Serial No." value={newDevice.imeiOrSerial} onChange={e => setNewDevice({...newDevice, imeiOrSerial: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none" required />
              
              <input type="text" placeholder="Condition / Specs (e.g. Battery 90%, Scratchless)" value={newDevice.condition} onChange={e => setNewDevice({...newDevice, condition: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none" />
              <input type="text" placeholder="Customer / Party Name" value={newDevice.partyName} onChange={e => setNewDevice({...newDevice, partyName: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none" />
              <input type="text" placeholder="Customer Phone Number" value={newDevice.partyPhone} onChange={e => setNewDevice({...newDevice, partyPhone: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none" />

              <input type="number" placeholder="Buy Price / Cost Price (NPR)" value={newDevice.buyPrice} onChange={e => setNewDevice({...newDevice, buyPrice: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none" />
              <input type="number" placeholder="Selling Price (NPR)" value={newDevice.sellPrice} onChange={e => setNewDevice({...newDevice, sellPrice: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none" required />
              <input type="text" placeholder="Warranty (e.g. 3 Months / 6 Months)" value={newDevice.warrantyDays} onChange={e => setNewDevice({...newDevice, warrantyDays: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none" />

              <button type="submit" className="md:col-span-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-emerald-600/30">Save Device & Generate Bill</button>
            </form>

            <div className="bg-[#0F1420] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-4">Device & Category</th>
                    <th className="p-4">IMEI / S.N. & Condition</th>
                    <th className="p-4">Party / Seller</th>
                    <th className="p-4">Buy / Sell Price</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {devicesStock.map(dev => (
                    <tr key={dev.id}>
                      <td className="p-4">
                        <p className="font-bold text-white">{dev.brandModel}</p>
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[11px] font-bold">{dev.deviceCategory}</span>
                      </td>
                      <td className="p-4">
                        <p className="font-mono text-xs text-slate-300">{dev.imeiOrSerial}</p>
                        <p className="text-xs text-slate-400">{dev.condition}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-white">{dev.partyName}</p>
                        <p className="text-xs text-slate-400">{dev.partyPhone}</p>
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
              <h2 className="text-xl font-bold text-white">Accessories & Parts Direct Billing (POS)</h2>
              <p className="text-xs text-slate-400 mt-0.5">Pick from stock or type custom item names and prices freely. Stock will deduct automatically.</p>
            </div>

            <form onSubmit={handleSavePosBill} className="bg-[#0F1420] border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Customer Name (Optional)" value={posBill.customerName} onChange={e => setPosBill({...posBill, customerName: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none" />
                <input type="text" placeholder="Phone Number (Optional)" value={posBill.phone} onChange={e => setPosBill({...posBill, phone: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none" />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-400">Items List</label>
                {posBill.items.map((item, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <input type="text" placeholder="Item Name" value={item.name} onChange={e => handlePosItemChange(idx, 'name', e.target.value)} className="flex-1 min-w-[200px] p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none" />
                    <input type="number" placeholder="Price" value={item.price} onChange={e => handlePosItemChange(idx, 'price', e.target.value)} className="w-28 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none" />
                    <input type="number" placeholder="Qty" value={item.qty} onChange={e => handlePosItemChange(idx, 'qty', e.target.value)} className="w-20 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none" />
                    {posBill.items.length > 1 && (
                      <button type="button" onClick={() => handleRemovePosItem(idx)} className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20"><Trash2 size={16}/></button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleAddPosItem} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold">+ Add Another Item</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <input type="number" placeholder="Paid Amount" value={posBill.paidAmount} onChange={e => setPosBill({...posBill, paidAmount: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none" />
                <input type="text" placeholder="Warranty Days (e.g. 7 Days)" value={posBill.warrantyDays} onChange={e => setPosBill({...posBill, warrantyDays: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none" />
              </div>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-emerald-600/30">Complete Sale & Print Bill</button>
            </form>
          </div>
        )}

        {/* INVOICES TAB */}
        {activeTab === 'invoices' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-white">Invoices & Records</h2>
              <div className="flex items-center gap-3">
                <input type="text" placeholder="Search by name, ID, phone..." value={invoiceSearch} onChange={e => setInvoiceSearch(e.target.value)} className="p-2.5 bg-[#0F1420] border border-slate-800 rounded-xl text-sm text-white w-64 focus:outline-none" />
                <div className="flex bg-[#0F1420] p-1 rounded-xl border border-slate-800">
                  {['All', 'Repair', 'Devices', 'Accessories', 'Due', 'Paid'].map(tab => (
                    <button key={tab} onClick={() => setInvoiceFilterTab(tab)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${invoiceFilterTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>{tab}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#0F1420] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-4">Invoice ID & Date</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Model / Description</th>
                    <th className="p-4">Total / Due</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredInvoices.map(inv => (
                    <tr key={inv.id}>
                      <td className="p-4 font-mono">
                        <p className="font-bold text-blue-400">{inv.id}</p>
                        <p className="text-[11px] text-slate-500">{inv.dateTime}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-white">{inv.customerName}</p>
                        <p className="text-xs text-slate-400">{inv.phone}</p>
                      </td>
                      <td className="p-4 text-slate-300">{inv.model}</td>
                      <td className="p-4">
                        <p className="font-bold text-white">NPR {inv.totalCost}</p>
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
              <h2 className="text-xl font-bold text-white">Parts & Accessories Inventory</h2>
            </div>

            <form onSubmit={handleAddPart} className="bg-[#0F1420] border border-slate-800 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-4 shadow-xl">
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="text" placeholder="Part Name" value={newPart.name} onChange={e => setNewPart({...newPart, name: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none" required />
              <input type="number" placeholder="Stock Quantity" value={newPart.stock} onChange={e => setNewPart({...newPart, stock: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none" required />
              <input type="number" placeholder="Cost Price (NPR)" value={newPart.costPrice} onChange={e => setNewPart({...newPart, costPrice: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none" />
              <input type="number" placeholder="Selling Price (NPR)" value={newPart.price} onChange={e => setNewPart({...newPart, price: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none" required />
              <button type="submit" className="md:col-span-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-blue-600/30">Add New Part to Stock</button>
            </form>

            <div className="bg-[#0F1420] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-4">Part Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Price (Cost / Sell)</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {inventory.map(item => (
                    <tr key={item.id}>
                      <td className="p-4 font-bold text-white">{item.name}</td>
                      <td className="p-4 text-slate-400">{item.category}</td>
                      <td className="p-4 font-bold text-blue-400">{item.stock} units</td>
                      <td className="p-4 text-slate-300">NPR {item.costPrice} / <span className="text-emerald-400 font-bold">NPR {item.price}</span></td>
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
            <h2 className="text-xl font-bold text-white">Shop Expenses Tracker</h2>
            <form onSubmit={handleAddExpense} className="bg-[#0F1420] border border-slate-800 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4 shadow-xl">
              <input type="text" placeholder="Expense Description (e.g. Rent, Electricity)" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="md:col-span-2 p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none" required />
              <input type="number" placeholder="Amount (NPR)" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none" required />
              <button type="submit" className="md:col-span-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-rose-600/30">Add Expense Record</button>
            </form>

            <div className="bg-[#0F1420] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {expenses.map(exp => (
                    <tr key={exp.id}>
                      <td className="p-4 text-slate-400">{exp.date}</td>
                      <td className="p-4 font-bold text-white">{exp.description}</td>
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
            <h2 className="text-xl font-bold text-white">Data Backup & Restore</h2>
            <div className="bg-[#0F1420] border border-slate-800 p-8 rounded-3xl space-y-6 shadow-xl text-center">
              <div>
                <h3 className="font-bold text-white text-lg">Download Backup File</h3>
                <p className="text-xs text-slate-400 mt-1">Export all your repairs, device trading, inventory, expenses into a secure JSON file.</p>
                <button onClick={exportData} className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition shadow-lg shadow-blue-600/30 inline-flex items-center gap-2">
                  <Download size={18}/> Export Backup Now
                </button>
              </div>

              <hr className="border-slate-800" />

              <div>
                <h3 className="font-bold text-white text-lg">Restore from Backup</h3>
                <p className="text-xs text-slate-400 mt-1">Upload your previously exported JSON backup file to restore shop data.</p>
                <label className="mt-4 inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition shadow-lg shadow-emerald-600/30 cursor-pointer">
                  <Upload size={18} className="inline mr-2"/> Select & Restore Backup File
                  <input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* INVOICE PREVIEW MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0F1420] border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Professional Invoice #{selectedInvoice.id}</h3>
                <p className="text-xs text-slate-400">{selectedInvoice.dateTime}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl"><X size={18}/></button>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Customer Name:</span><span className="font-bold text-white">{selectedInvoice.customerName}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Phone:</span><span className="font-bold text-white">{selectedInvoice.phone}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Service / Items:</span><span className="font-bold text-white">{selectedInvoice.model}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Warranty:</span><span className="text-blue-400 font-bold">{selectedInvoice.warrantyDays || '30'} Days</span></div>
              <hr className="border-slate-800 my-2" />
              <div className="flex justify-between"><span className="text-slate-400">Total Cost:</span><span className="font-bold text-white">NPR {selectedInvoice.totalCost}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Paid Amount:</span><span className="font-bold text-emerald-400">NPR {selectedInvoice.paidAmount}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Balance Due:</span><span className="font-bold text-rose-400">NPR {selectedInvoice.dueAmount}</span></div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => downloadInvoiceImage(selectedInvoice)} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-600/30">
                <Download size={16}/> Download Pro Image Bill
              </button>
              <button onClick={() => sendToWhatsApp(selectedInvoice)} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-600/30">
                <MessageSquare size={16}/> Send WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT INVOICE MODAL */}
      {editingInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0F1420] border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Edit Invoice / Record #{editingInvoice.id}</h3>
              <button onClick={() => setEditingInvoice(null)} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl"><X size={18}/></button>
            </div>

            <form onSubmit={handleUpdateInvoice} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Customer Name</label>
                <input type="text" value={editingInvoice.customerName} onChange={e => setEditingInvoice({...editingInvoice, customerName: e.target.value})} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-blue-600" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Phone Number</label>
                <input type="text" value={editingInvoice.phone} onChange={e => setEditingInvoice({...editingInvoice, phone: e.target.value})} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-blue-600" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Model / Description</label>
                <input type="text" value={editingInvoice.model} onChange={e => setEditingInvoice({...editingInvoice, model: e.target.value})} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-blue-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Total Cost (NPR)</label>
                  <input type="number" value={editingInvoice.totalCost} onChange={e => setEditingInvoice({...editingInvoice, totalCost: e.target.value})} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-blue-600" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Paid Amount (NPR)</label>
                  <input type="number" value={editingInvoice.paidAmount} onChange={e => setEditingInvoice({...editingInvoice, paidAmount: e.target.value})} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-blue-600" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Warranty Days</label>
                <input type="text" value={editingInvoice.warrantyDays} onChange={e => setEditingInvoice({...editingInvoice, warrantyDays: e.target.value})} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-blue-600" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setEditingInvoice(null)} className="px-5 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-sm">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-600/30">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}