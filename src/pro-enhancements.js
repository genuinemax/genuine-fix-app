/* Genuine Fix Pro Enhancements
 * Safe, dependency-free UI layer. It reads the app's existing localStorage data
 * and does not modify the existing business logic or Firebase sync.
 */
(function () {
  const STYLE_ID = 'gf-pro-enhancements-style';
  const ROOT_ID = 'gf-pro-enhancements-root';

  const money = (n) => `NPR ${Number(n || 0).toLocaleString('en-IN')}`;
  const read = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const getData = () => ({
    repairs: read('gf_repairs', []),
    inventory: read('gf_inventory', []),
    devices: read('gf_devices_stock', []),
    expenses: read('gf_expenses', []),
    shop: read('gf_shop_info', { name: 'Genuine Fix' })
  });

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    /* Mobile navigation fix: keep the existing navigation usable without changing its logic. */
    @media (max-width: 767px) {
      nav > div { padding-left: .75rem !important; padding-right: .75rem !important; }
      nav > div > div:nth-child(2) {
        width: 100% !important;
        max-width: 100% !important;
        overflow-x: auto !important;
        flex-wrap: nowrap !important;
        justify-content: flex-start !important;
        scrollbar-width: thin;
      }
      nav > div > div:nth-child(2) button { flex: 0 0 auto !important; }
      nav > div > div:nth-child(2) button span { display: none !important; }
      main { padding-left: .75rem !important; padding-right: .75rem !important; }
      table { min-width: 720px; }
    }
    #${ROOT_ID} .gf-pro-fab {
      position: fixed; right: 18px; bottom: 18px; z-index: 70;
      border: 0; border-radius: 999px; padding: 12px 16px;
      background: linear-gradient(135deg,#2563eb,#7c3aed); color: #fff;
      font: 800 13px system-ui,sans-serif; box-shadow: 0 12px 35px rgba(37,99,235,.35);
      cursor: pointer;
    }
    #${ROOT_ID} .gf-pro-overlay {
      position: fixed; inset: 0; z-index: 80; display: none; padding: 16px;
      background: rgba(2,6,23,.78); backdrop-filter: blur(8px); overflow-y: auto;
    }
    #${ROOT_ID} .gf-pro-modal {
      width: min(100%, 980px); margin: 3vh auto; background: #0f172a; color: #e2e8f0;
      border: 1px solid #334155; border-radius: 24px; padding: 20px;
      box-shadow: 0 30px 80px rgba(0,0,0,.45); font-family: system-ui,sans-serif;
    }
    #${ROOT_ID} .gf-pro-head { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:18px; }
    #${ROOT_ID} .gf-pro-title { font-size:20px; font-weight:900; margin:0; }
    #${ROOT_ID} .gf-pro-sub { font-size:11px; color:#94a3b8; margin-top:3px; }
    #${ROOT_ID} .gf-pro-close { border:0; background:#1e293b; color:#cbd5e1; border-radius:10px; padding:8px 11px; cursor:pointer; }
    #${ROOT_ID} .gf-pro-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; }
    #${ROOT_ID} .gf-pro-card { background:#111827; border:1px solid #334155; border-radius:16px; padding:14px; }
    #${ROOT_ID} .gf-pro-label { font-size:10px; color:#94a3b8; text-transform:uppercase; letter-spacing:.08em; font-weight:800; }
    #${ROOT_ID} .gf-pro-value { font-size:22px; font-weight:900; margin-top:5px; }
    #${ROOT_ID} .gf-pro-section { margin-top:14px; background:#111827; border:1px solid #334155; border-radius:16px; padding:14px; }
    #${ROOT_ID} .gf-pro-section h3 { margin:0 0 10px; font-size:13px; }
    #${ROOT_ID} .gf-pro-row { display:flex; justify-content:space-between; gap:12px; padding:8px 0; border-bottom:1px solid #1e293b; font-size:12px; }
    #${ROOT_ID} .gf-pro-row:last-child { border-bottom:0; }
    #${ROOT_ID} .gf-pro-actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; }
    #${ROOT_ID} .gf-pro-action { border:1px solid #475569; background:#1e293b; color:#e2e8f0; border-radius:10px; padding:9px 12px; font-size:11px; font-weight:800; cursor:pointer; }
    #${ROOT_ID} .gf-pro-alert { color:#fbbf24; }
    @media (max-width: 700px) { #${ROOT_ID} .gf-pro-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } #${ROOT_ID} .gf-pro-value { font-size:17px; } }
  `;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = ROOT_ID;
  root.innerHTML = `
    <button class="gf-pro-fab" type="button">⚡ Pro</button>
    <div class="gf-pro-overlay" role="dialog" aria-modal="true">
      <div class="gf-pro-modal">
        <div class="gf-pro-head">
          <div><h2 class="gf-pro-title">Genuine Fix Pro Dashboard</h2><div class="gf-pro-sub">Live summary from your existing app data</div></div>
          <button class="gf-pro-close" type="button">Close</button>
        </div>
        <div class="gf-pro-grid" data-metrics></div>
        <div class="gf-pro-section"><h3>⚠️ Low Stock Alerts</h3><div data-low-stock></div></div>
        <div class="gf-pro-section"><h3>📊 Repair & Sales Status</h3><div data-status></div></div>
        <div class="gf-pro-section"><h3>👥 Top Customers</h3><div data-customers></div></div>
        <div class="gf-pro-actions">
          <button class="gf-pro-action" data-refresh type="button">↻ Refresh</button>
          <button class="gf-pro-action" data-report type="button">🖨 Print Pro Report</button>
          <button class="gf-pro-action" data-backup type="button">⬇ Quick Backup</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(root);

  const overlay = root.querySelector('.gf-pro-overlay');
  const metrics = root.querySelector('[data-metrics]');
  const lowStock = root.querySelector('[data-low-stock]');
  const status = root.querySelector('[data-status]');
  const customers = root.querySelector('[data-customers]');

  function render() {
    const { repairs, inventory, devices, expenses, shop } = getData();
    const revenue = repairs.reduce((s, r) => s + Number(r.totalCost || 0), 0);
    const paid = repairs.reduce((s, r) => s + Number(r.paidAmount || 0), 0);
    const due = repairs.reduce((s, r) => s + Number(r.dueAmount || 0), 0);
    const exp = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const estimatedProfit = paid - exp;
    const low = inventory.filter(i => Number(i.stock || 0) <= Number(i.minStock ?? 5));
    const statusMap = repairs.reduce((m, r) => { const k = r.status || 'Unknown'; m[k] = (m[k] || 0) + 1; return m; }, {});
    const customerMap = repairs.reduce((m, r) => {
      const n = (r.customerName || 'Walk-in Customer').trim();
      if (!m[n]) m[n] = { count: 0, value: 0 };
      m[n].count += 1; m[n].value += Number(r.totalCost || 0); return m;
    }, {});
    const top = Object.entries(customerMap).sort((a,b) => b[1].value-a[1].value).slice(0,5);

    metrics.innerHTML = [
      ['Gross Billing', money(revenue)], ['Collected', money(paid)],
      ['Outstanding', money(due)], ['Est. Cash Profit', money(estimatedProfit)],
      ['Job/Bills', repairs.length], ['Stock Items', inventory.length],
      ['Devices', devices.length], ['Expenses', money(exp)]
    ].map(([l,v]) => `<div class="gf-pro-card"><div class="gf-pro-label">${l}</div><div class="gf-pro-value">${v}</div></div>`).join('');

    lowStock.innerHTML = low.length
      ? low.map(i => `<div class="gf-pro-row"><span>${escapeHtml(i.name)}</span><strong class="gf-pro-alert">${Number(i.stock || 0)} left</strong></div>`).join('')
      : '<div class="gf-pro-row"><span>All stock levels are healthy.</span><strong>✓</strong></div>';

    status.innerHTML = Object.keys(statusMap).length
      ? Object.entries(statusMap).map(([k,v]) => `<div class="gf-pro-row"><span>${escapeHtml(k)}</span><strong>${v}</strong></div>`).join('')
      : '<div class="gf-pro-row"><span>No records yet.</span></div>';

    customers.innerHTML = top.length
      ? top.map(([n,v]) => `<div class="gf-pro-row"><span>${escapeHtml(n)} · ${v.count} record(s)</span><strong>${money(v.value)}</strong></div>`).join('')
      : '<div class="gf-pro-row"><span>No customer records yet.</span></div>';

    root.dataset.shop = shop?.name || 'Genuine Fix';
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  root.querySelector('.gf-pro-fab').addEventListener('click', () => { render(); overlay.style.display = 'block'; });
  root.querySelector('.gf-pro-close').addEventListener('click', () => { overlay.style.display = 'none'; });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.style.display = 'none'; });
  root.querySelector('[data-refresh]').addEventListener('click', render);
  root.querySelector('[data-report]').addEventListener('click', () => window.print());
  root.querySelector('[data-backup]').addEventListener('click', () => {
    const data = getData();
    const payload = JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `GenuineFix_Pro_Backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
      e.preventDefault(); render(); overlay.style.display = 'block';
    }
    if (e.key === 'Escape') overlay.style.display = 'none';
  });
})();
