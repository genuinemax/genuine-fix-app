/* Genuine Fix PRO — history actions bridge */
(function () {
  const STORE = { repairs: 'gf_repairs', devices: 'gf_devices_stock' };
  const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
  const esc = (v) => String(v ?? '').replace(/[&<>\"]/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;' }[c]));
  const money = (v) => Number(v || 0).toLocaleString('en-IN');

  function injectStyles() {
    if (document.getElementById('gf-history-pro-style')) return;
    const s = document.createElement('style');
    s.id = 'gf-history-pro-style';
    s.textContent = `
      .gf-history-inline-actions{display:inline-flex!important;align-items:center!important;justify-content:flex-end!important;gap:6px!important;flex-wrap:wrap!important;margin-right:6px!important;vertical-align:middle!important}
      .gf-history-inline-action{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;border:1px solid rgba(100,116,139,.38)!important;background:rgba(30,41,59,.58)!important;color:#cbd5e1!important;border-radius:10px!important;padding:7px 10px!important;font-size:11px!important;font-weight:800!important;line-height:1!important;cursor:pointer!important;min-height:34px!important;white-space:nowrap!important;transition:filter .15s ease,background .15s ease!important}
      .gf-history-inline-action:hover{filter:brightness(1.18)!important}
      .gf-history-inline-view{color:#93c5fd!important;border-color:rgba(59,130,246,.35)!important;background:rgba(30,64,175,.14)!important}
      .gf-history-inline-edit{color:#fcd34d!important;border-color:rgba(245,158,11,.35)!important;background:rgba(146,64,14,.12)!important}
      .gf-history-inline-print{color:#c4b5fd!important;border-color:rgba(139,92,246,.35)!important;background:rgba(91,33,182,.12)!important}
      #gf-history-view-modal{position:fixed;inset:0;z-index:10000;background:rgba(2,6,23,.78);backdrop-filter:blur(7px);display:none;overflow:auto;padding:14px}
      #gf-history-view-modal .gf-hv-box{width:min(700px,100%);margin:4vh auto;background:#0f172a;color:#e2e8f0;border:1px solid #334155;border-radius:22px;padding:18px;box-shadow:0 30px 90px rgba(0,0,0,.55)}
      .gf-hv-head{display:flex;justify-content:space-between;align-items:center;gap:10px}
      .gf-hv-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:14px}
      .gf-hv-item{padding:10px 12px;border-radius:12px;background:#111827;border:1px solid #263244}
      .gf-hv-label{display:block;font-size:10px;color:#94a3b8;font-weight:800;text-transform:uppercase}
      .gf-hv-value{display:block;margin-top:3px;font-size:13px;font-weight:800;overflow-wrap:anywhere}
      .gf-hv-full{grid-column:1/-1}
      .gf-hv-issues{white-space:pre-wrap;line-height:1.6;font-weight:700}
      @media(max-width:900px){.gf-history-inline-actions{gap:5px;margin-right:4px}.gf-history-inline-action{padding:6px 8px;min-height:32px}}
      @media(max-width:640px){.gf-history-inline-actions{width:100%;margin:0 0 8px;justify-content:flex-end}.gf-hv-grid{grid-template-columns:1fr}.gf-hv-full{grid-column:auto}}
    `;
    document.head.appendChild(s);
  }

  function ensureModal() {
    if (document.getElementById('gf-history-view-modal')) return document.getElementById('gf-history-view-modal');
    const m = document.createElement('div');
    m.id = 'gf-history-view-modal';
    m.innerHTML = '<div class="gf-hv-box"><div class="gf-hv-head"><div><b style="font-size:18px">Job Sheet Details</b><div data-hv-sub style="font-size:11px;color:#94a3b8;margin-top:2px"></div></div><button type="button" data-hv-close style="border:1px solid #475569;background:#1e293b;color:#e2e8f0;border-radius:10px;padding:7px 10px;font-weight:800;cursor:pointer">Close</button></div><div data-hv-grid class="gf-hv-grid"></div></div>';
    document.body.appendChild(m);
    m.querySelector('[data-hv-close]').onclick = () => { m.style.display = 'none'; };
    m.addEventListener('click', (e) => { if (e.target === m) m.style.display = 'none'; });
    return m;
  }

  function locate(id) {
    for (const type of ['repairs','devices']) {
      const arr = read(STORE[type]);
      const index = arr.findIndex(r => String(r.id || '') === String(id));
      if (index >= 0) return { type, index, record: arr[index] };
    }
    return null;
  }

  function issueLines(r) {
    const issues = Array.isArray(r.issues) && r.issues.length
      ? r.issues
      : (Array.isArray(r.items) ? r.items.filter(i => String(i.name || '').trim() && String(i.name).trim() !== 'Discount') : []);
    return issues.map((i, n) => `${n + 1}. ${i.name || 'Service'} — NPR ${money(i.amount != null ? i.amount : i.price)}`).join('\n') || (r.issue || '—');
  }

  function showView(info) {
    if (!info) return;
    const m = ensureModal(), r = info.record;
    const subtotal = r.subtotal != null ? r.subtotal : r.totalCost;
    const discount = r.discountAmount != null ? r.discountAmount : 0;
    const grand = r.grandTotal != null ? r.grandTotal : r.totalCost;
    const fields = [
      ['Job ID', r.id], ['Customer', r.customerName || '—'], ['Phone', r.phone || '—'], ['Device / Model', r.model || r.deviceType || '—'],
      ['Status', r.status || '—'], ['Subtotal', `NPR ${money(subtotal)}`],
      ['Discount', discount > 0 ? `NPR ${money(discount)}${r.discountType === 'percent' ? ` (${money(r.discountValue)}%)` : ''}` : 'NPR 0'],
      ['Grand Total', `NPR ${money(grand)}`], ['Paid', `NPR ${money(r.paidAmount)}`], ['Due', `NPR ${money(r.dueAmount)}`],
      ['Warranty', r.warrantyMonths || '—'], ['Date', r.dateTime || r.date || '—'], ['Issue / Service Breakdown', issueLines(r)]
    ];
    m.querySelector('[data-hv-sub]').textContent = 'Repair / Job Sheet record';
    m.querySelector('[data-hv-grid]').innerHTML = fields.map(([a,b]) => `<div class="gf-hv-item ${a === 'Issue / Service Breakdown' ? 'gf-hv-full' : ''}"><span class="gf-hv-label">${esc(a)}</span><span class="gf-hv-value ${a === 'Issue / Service Breakdown' ? 'gf-hv-issues' : ''}">${esc(b)}</span></div>`).join('');
    m.style.display = 'block';
  }

  function edit(info) {
    if (!info) return;
    if (info.type === 'repairs' && typeof window.GenuineFixEditRecord === 'function') {
      window.GenuineFixEditRecord('repairs', info.record.id);
      return;
    }
    alert('Open the record in its main list to edit it.');
  }

  function printRecord(info) {
    if (!info) return;
    const r = info.record;
    const w = window.open('', '_blank', 'noopener,noreferrer,width=760,height=700');
    if (!w) { alert('Please allow pop-ups to print the record.'); return; }
    const title = esc(r.id || 'Genuine Fix Record');
    const subtotal = r.subtotal != null ? r.subtotal : r.totalCost;
    const discount = r.discountAmount != null ? r.discountAmount : 0;
    const grand = r.grandTotal != null ? r.grandTotal : r.totalCost;
    w.document.write(`<!doctype html><html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;padding:28px;color:#111}h1{margin:0 0 4px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.item{border:1px solid #ddd;padding:10px;border-radius:8px}.label{font-size:11px;color:#666}.value{font-weight:700;margin-top:3px;white-space:pre-wrap;line-height:1.5}.full{grid-column:1/-1}</style></head><body><h1>Genuine Fix — Job Sheet</h1><p>Record: ${title}</p><div class="grid">${[['Customer',r.customerName],['Phone',r.phone],['Device / Model',r.model||r.deviceType],['Status',r.status],['Subtotal','NPR '+money(subtotal)],['Discount','NPR '+money(discount)],['Grand Total','NPR '+money(grand)],['Paid','NPR '+money(r.paidAmount)],['Due','NPR '+money(r.dueAmount)],['Warranty',r.warrantyMonths],['Date',r.dateTime||r.date],['Issue / Service Breakdown',issueLines(r)]].map(([a,b])=>`<div class="item ${a==='Issue / Service Breakdown'?'full':''}"><div class="label">${esc(a)}</div><div class="value">${esc(b||'—')}</div></div>`).join('')}</div><script>setTimeout(()=>window.print(),250)</script></body></html>`);
    w.document.close();
  }

  window.GenuineFixViewRecord = (type, id) => {
    const info = locate(id);
    if (info) showView(info);
  };

  window.GenuineFixPrintRecord = (type, id) => {
    const info = locate(id);
    if (info) printRecord(info);
  };

  window.GenuineFixEditHistoryRecord = (type, id) => {
    const info = locate(id);
    if (info) edit(info);
  };

  function makeButton(label, cls, fn) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `gf-history-inline-action ${cls || ''}`;
    b.textContent = label;
    b.onclick = (e) => { e.preventDefault(); e.stopPropagation(); fn(); };
    return b;
  }

  function addTableButtons() {
    const tables = [...document.querySelectorAll('table')];
    tables.forEach(table => {
      const headers = [...table.querySelectorAll('thead th')].map(th => (th.innerText || '').trim().toLowerCase());
      if (!headers.some(h => h.includes('job id'))) return;
      table.querySelectorAll('tbody tr').forEach(row => {
        const text = (row.innerText || '').replace(/\s+/g, ' ');
        const match = text.match(/\bGF-[A-Za-z0-9-]+/);
        if (!match) return;
        const info = locate(match[0]);
        if (!info) return;
        const cell = row.lastElementChild;
        if (!cell) return;
        if (cell.querySelector('[data-gf-history-inline="1"]')) return;

        const deleteButton = [...cell.querySelectorAll('button')].find(btn => /delete/i.test(btn.textContent || ''));
        if (!deleteButton) return;

        const wrap = document.createElement('span');
        wrap.dataset.gfHistoryInline = '1';
        wrap.className = 'gf-history-inline-actions';
        wrap.appendChild(makeButton('View', 'gf-history-inline-view', () => showView(locate(info.record.id) || info)));
        wrap.appendChild(makeButton('Edit', 'gf-history-inline-edit', () => edit(locate(info.record.id) || info)));
        wrap.appendChild(makeButton('Print', 'gf-history-inline-print', () => printRecord(locate(info.record.id) || info)));
        cell.insertBefore(wrap, deleteButton);
      });
    });
  }

  function add() {
    injectStyles();
    addTableButtons();
  }

  const observer = new MutationObserver(() => { add(); });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(add, 200);
  setTimeout(add, 700);
  setTimeout(add, 1500);
  setInterval(add, 2500);
})();
