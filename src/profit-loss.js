// Genuine Fix Profit & Loss Pro
// Adds Daily / Monthly / Yearly business reporting without changing the core React state logic.

(() => {
  const KEYS = {
    repairs: 'gf_repairs',
    inventory: 'gf_inventory',
    expenses: 'gf_expenses',
    purchases: 'gf_stock_purchases',
    devices: 'gf_devices_stock'
  };

  const money = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  const read = (key) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  };

  const dateKey = (value) => {
    if (!value) return '';
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      const y = value.getFullYear();
      const m = String(value.getMonth() + 1).padStart(2, '0');
      const d = String(value.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    const text = String(value).trim();
    const match = text.match(/(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
    if (match) return `${match[1]}-${String(match[2]).padStart(2, '0')}-${String(match[3]).padStart(2, '0')}`;
    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? '' : dateKey(parsed);
  };

  const today = () => dateKey(new Date());

  const formatMoney = (value) => `NPR ${Math.round(money(value)).toLocaleString('en-IN')}`;

  const getDateOfRepair = (r) => dateKey(r.dateTime || r.date || r.createdAt || r.updatedAt);
  const getDateOfExpense = (e) => dateKey(e.date || e.dateTime || e.createdAt);
  const getDateOfPurchase = (p) => dateKey(p.date || p.purchaseDate || p.createdAt);

  const getRevenue = (repairs, devices, from, to) => {
    let revenue = 0;
    let cogs = 0;
    const inventory = read(KEYS.inventory);
    const costByName = new Map(inventory.map(i => [String(i.name || '').trim().toLowerCase(), money(i.costPrice)]));

    repairs.forEach((r) => {
      const d = getDateOfRepair(r);
      if (d < from || d > to) return;
      revenue += money(r.totalCost ?? r.total ?? r.amount ?? r.sellPrice);
      const items = Array.isArray(r.items) ? r.items : [];
      items.forEach((item) => {
        const name = String(item.name || '').trim().toLowerCase();
        const qty = Math.max(0, money(item.qty || item.quantity || 1));
        const explicitCost = money(item.costPrice ?? item.cost ?? item.purchasePrice);
        cogs += qty * (explicitCost || costByName.get(name) || 0);
      });
    });

    // Device sales are normally recorded as billing/repair records in the app.
    // Avoid counting device inventory rows themselves as revenue because they are stock assets, not sales.
    devices.forEach((d) => {
      const status = String(d.status || '').toLowerCase();
      if (!/(sold|sale|delivered)/.test(status)) return;
      const saleDate = dateKey(d.saleDate || d.soldDate || d.date);
      if (saleDate < from || saleDate > to) return;
      revenue += money(d.salePrice || d.sellPrice || d.sellingPrice);
      cogs += money(d.buyPrice || d.costPrice || d.purchasePrice);
    });

    return { revenue, cogs };
  };

  const getExpenses = (expenses, from, to) => expenses.reduce((sum, e) => {
    const d = getDateOfExpense(e);
    if (d < from || d > to) return sum;
    return sum + money(e.amount ?? e.paidAmount ?? e.paidNow);
  }, 0);

  const getPurchases = (purchases, from, to) => purchases.reduce((sum, p) => {
    const d = getDateOfPurchase(p);
    if (d < from || d > to) return sum;
    const qty = money(p.qty || p.quantity || 1);
    return sum + (money(p.totalCost) || qty * money(p.unitCost || p.costPrice || p.price));
  }, 0);

  const rangeFor = (mode, base = new Date()) => {
    const y = base.getFullYear();
    const m = base.getMonth();
    if (mode === 'day') {
      const d = dateKey(base);
      return [d, d];
    }
    if (mode === 'month') {
      return [dateKey(new Date(y, m, 1)), dateKey(new Date(y, m + 1, 0))];
    }
    return [dateKey(new Date(y, 0, 1)), dateKey(new Date(y, 11, 31))];
  };

  const calculate = (mode) => {
    const repairs = read(KEYS.repairs);
    const devices = read(KEYS.devices);
    const expenses = read(KEYS.expenses);
    const purchases = read(KEYS.purchases);
    const [from, to] = rangeFor(mode);
    const sales = getRevenue(repairs, devices, from, to);
    const expense = getExpenses(expenses, from, to);
    const purchase = getPurchases(purchases, from, to);
    const grossProfit = sales.revenue - sales.cogs;
    const net = grossProfit - expense;
    return { from, to, revenue: sales.revenue, cogs: sales.cogs, grossProfit, expense, net, purchase };
  };

  const monthRange = (year, month) => [dateKey(new Date(year, month, 1)), dateKey(new Date(year, month + 1, 0))];

  const monthlyRows = (year) => Array.from({ length: 12 }, (_, month) => {
    const [from, to] = monthRange(year, month);
    const sales = getRevenue(read(KEYS.repairs), read(KEYS.devices), from, to);
    const expense = getExpenses(read(KEYS.expenses), from, to);
    return {
      name: new Date(year, month, 1).toLocaleString('en-US', { month: 'short' }),
      revenue: sales.revenue,
      cogs: sales.cogs,
      expense,
      net: sales.revenue - sales.cogs - expense
    };
  });

  const escapeHtml = (text) => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const reportCard = (label, value, note = '') => `<div class="gf-pl-card"><div class="gf-pl-label">${escapeHtml(label)}</div><div class="gf-pl-value">${formatMoney(value)}</div>${note ? `<div class="gf-pl-note">${escapeHtml(note)}</div>` : ''}</div>`;

  const render = (mode = 'day') => {
    const data = calculate(mode);
    const positive = data.net >= 0;
    const title = mode === 'day' ? 'Daily Profit & Loss' : mode === 'month' ? 'Monthly Profit & Loss' : 'Yearly Profit & Loss';
    const rows = mode === 'year' ? monthlyRows(new Date().getFullYear()) : [];

    return `<div class="gf-pl-modal-backdrop" id="gf-pl-backdrop">
      <div class="gf-pl-modal" role="dialog" aria-modal="true" aria-label="Profit and Loss report">
        <div class="gf-pl-head">
          <div><div class="gf-pl-kicker">GENUINE FIX • PRO REPORT</div><h2>${title}</h2><div class="gf-pl-range">${data.from} → ${data.to}</div></div>
          <button class="gf-pl-close" id="gf-pl-close" aria-label="Close">×</button>
        </div>
        <div class="gf-pl-tabs">
          <button data-mode="day" class="${mode === 'day' ? 'active' : ''}">Daily</button>
          <button data-mode="month" class="${mode === 'month' ? 'active' : ''}">Monthly</button>
          <button data-mode="year" class="${mode === 'year' ? 'active' : ''}">Yearly</button>
        </div>
        <div class="gf-pl-grid">
          ${reportCard('Total Revenue', data.revenue)}
          ${reportCard('Cost of Goods / Parts', data.cogs)}
          ${reportCard('Gross Profit', data.grossProfit)}
          ${reportCard('Expenses', data.expense)}
          ${reportCard(positive ? 'NET PROFIT' : 'NET LOSS', data.net, positive ? 'Business is profitable for this period' : 'Expenses and costs are higher than revenue')}
          ${reportCard('Stock Purchases (cash out)', data.purchase, 'Shown separately; not deducted twice from profit')}
        </div>
        ${mode === 'year' ? `<div class="gf-pl-section"><h3>${new Date().getFullYear()} Monthly Breakdown</h3><div class="gf-pl-table-wrap"><table><thead><tr><th>Month</th><th>Revenue</th><th>COGS</th><th>Expenses</th><th>Net</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r.name}</td><td>${formatMoney(r.revenue)}</td><td>${formatMoney(r.cogs)}</td><td>${formatMoney(r.expense)}</td><td class="${r.net >= 0 ? 'profit' : 'loss'}">${formatMoney(r.net)}</td></tr>`).join('')}</tbody></table></div></div>` : ''}
        <div class="gf-pl-footer">Profit = Revenue − Parts/Stock Cost (COGS) − Expenses. Existing data is used; no billing or inventory records are changed.</div>
      </div>
    </div>`;
  };

  const open = (mode) => {
    document.getElementById('gf-pl-backdrop')?.remove();
    document.body.insertAdjacentHTML('beforeend', render(mode));
    document.getElementById('gf-pl-close')?.addEventListener('click', () => document.getElementById('gf-pl-backdrop')?.remove());
    document.getElementById('gf-pl-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'gf-pl-backdrop') e.currentTarget.remove();
    });
    document.querySelectorAll('#gf-pl-backdrop [data-mode]').forEach(btn => btn.addEventListener('click', () => open(btn.dataset.mode)));
  };

  const injectStyles = () => {
    if (document.getElementById('gf-pl-styles')) return;
    const style = document.createElement('style');
    style.id = 'gf-pl-styles';
    style.textContent = `
      .gf-pl-modal-backdrop{position:fixed;inset:0;z-index:99999;background:rgba(2,6,23,.78);display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(5px)}
      .gf-pl-modal{width:min(980px,100%);max-height:92vh;overflow:auto;background:#111827;color:#e5e7eb;border:1px solid #334155;border-radius:24px;box-shadow:0 30px 80px rgba(0,0,0,.45);padding:22px}
      .gf-pl-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.gf-pl-kicker{font-size:11px;letter-spacing:.16em;color:#60a5fa;font-weight:800}.gf-pl-head h2{margin:5px 0;font-size:24px}.gf-pl-range{font-size:13px;color:#94a3b8}.gf-pl-close{border:1px solid #475569;background:#1e293b;color:#fff;width:38px;height:38px;border-radius:12px;font-size:24px;cursor:pointer}
      .gf-pl-tabs{display:flex;gap:8px;margin:20px 0;overflow:auto}.gf-pl-tabs button{border:1px solid #334155;background:#0f172a;color:#cbd5e1;padding:10px 16px;border-radius:12px;font-weight:700;cursor:pointer;white-space:nowrap}.gf-pl-tabs button.active{background:#2563eb;border-color:#2563eb;color:#fff}
      .gf-pl-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.gf-pl-card{background:#0f172a;border:1px solid #334155;border-radius:16px;padding:16px}.gf-pl-label{font-size:12px;color:#94a3b8;font-weight:700}.gf-pl-value{font-size:20px;font-weight:900;margin-top:5px}.gf-pl-note{font-size:11px;color:#64748b;margin-top:5px}.gf-pl-section{margin-top:20px}.gf-pl-section h3{font-size:16px;margin:0 0 10px}.gf-pl-table-wrap{overflow:auto;border:1px solid #334155;border-radius:14px}.gf-pl-table-wrap table{width:100%;border-collapse:collapse;min-width:650px}.gf-pl-table-wrap th,.gf-pl-table-wrap td{padding:11px 12px;border-bottom:1px solid #1e293b;text-align:right;white-space:nowrap}.gf-pl-table-wrap th:first-child,.gf-pl-table-wrap td:first-child{text-align:left}.gf-pl-table-wrap th{background:#0f172a;color:#94a3b8;font-size:12px}.gf-pl-table-wrap td{font-size:13px}.gf-pl-table-wrap .profit{font-weight:800}.gf-pl-table-wrap .loss{font-weight:800}.gf-pl-footer{margin-top:16px;color:#94a3b8;font-size:12px;line-height:1.5}
      @media(max-width:700px){.gf-pl-modal{padding:16px;border-radius:18px}.gf-pl-grid{grid-template-columns:1fr 1fr}.gf-pl-head h2{font-size:20px}.gf-pl-value{font-size:17px}}
      @media(max-width:430px){.gf-pl-grid{grid-template-columns:1fr}.gf-pl-modal-backdrop{padding:8px}.gf-pl-modal{max-height:95vh}}
    `;
    document.head.appendChild(style);
  };

  const injectButton = () => {
    if (document.getElementById('gf-pl-launcher')) return;
    const button = document.createElement('button');
    button.id = 'gf-pl-launcher';
    button.type = 'button';
    button.textContent = '📊 Profit & Loss';
    button.setAttribute('aria-label', 'Open Profit and Loss reports');
    Object.assign(button.style, {
      position: 'fixed', right: '16px', bottom: '16px', zIndex: '9998', border: '1px solid #334155',
      borderRadius: '14px', padding: '11px 15px', background: '#2563eb', color: '#fff', fontWeight: '800',
      fontSize: '13px', boxShadow: '0 12px 30px rgba(0,0,0,.25)', cursor: 'pointer'
    });
    button.addEventListener('click', () => open('day'));
    document.body.appendChild(button);
  };

  const init = () => {
    injectStyles();
    injectButton();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
