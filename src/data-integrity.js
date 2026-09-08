// Genuine Fix data-integrity layer: prevent accidental double saves and restore reliable Delete actions.
(function () {
  const STORE = {
    repairs: 'gf_repairs',
    inventory: 'gf_inventory',
    devices: 'gf_devices_stock',
    expenses: 'gf_expenses',
    purchases: 'gf_stock_purchases'
  };
  const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  const css = document.createElement('style');
  css.textContent = `
    .gf-data-actions{display:flex!important;gap:6px!important;align-items:center!important;white-space:nowrap!important}
    .gf-delete-btn{border:1px solid #7f1d1d!important;background:#450a0a!important;color:#fecaca!important;border-radius:8px!important;padding:6px 9px!important;font-size:11px!important;font-weight:800!important;cursor:pointer!important}
    .gf-delete-btn:hover{background:#7f1d1d!important;color:#fff!important}
    .gf-action-cell{white-space:nowrap!important;padding:6px!important}
  `;
  document.head.appendChild(css);

  function tableType(table) {
    const text = (table.innerText || '').toLowerCase();
    const headers = [...table.querySelectorAll('thead th')].map(x => (x.textContent || '').toLowerCase()).join(' ');
    const all = `${headers} ${text.slice(0, 1200)}`;
    if (/invoice|jobsheet|repair|accessories|sale|paid amount|due amount/.test(all)) return 'repairs';
    if (/device buy|device sell|imei|serial|buy price|sell price/.test(all)) return 'devices';
    if (/supplier|purchase|payable|expense|description/.test(all) && !/stock item|selling price/.test(all)) return 'expenses';
    if (/stock item|inventory|selling price|minimum stock|cost price/.test(all)) return 'inventory';
    return null;
  }

  function recordForRow(row) {
    const table = row.closest('table');
    if (!table) return null;
    const type = tableType(table);
    if (!type) return null;
    const arr = read(STORE[type]);
    const text = (row.innerText || row.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) return null;
    const exact = arr.findIndex(r => {
      const id = String(r.id ?? '').trim();
      return id && text.includes(id);
    });
    if (exact >= 0) return { type, index: exact, record: arr[exact] };
    return null;
  }

  function addDeleteButtons() {
    document.querySelectorAll('table tbody tr').forEach(row => {
      if (row.dataset.gfDeleteAdded === '1') return;
      const info = recordForRow(row);
      if (!info) return;

      let cell = row.querySelector('td.gf-action-cell');
      if (!cell) {
        cell = document.createElement('td');
        cell.className = 'gf-action-cell';
        row.appendChild(cell);
      }
      let actions = cell.querySelector('.gf-data-actions');
      if (!actions) { actions = document.createElement('div'); actions.className = 'gf-data-actions'; cell.appendChild(actions); }

      // Move an existing inline Edit button into the action group when present.
      const edit = row.querySelector('.gf-inline-edit-btn');
      if (edit && !actions.contains(edit)) actions.appendChild(edit);

      if (!actions.querySelector('.gf-delete-btn')) {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'gf-delete-btn'; b.textContent = 'Delete';
        b.addEventListener('click', (e) => {
          e.preventDefault(); e.stopPropagation();
          const latest = read(STORE[info.type]);
          const target = latest[info.index];
          if (!target) return;
          const label = target.id || target.name || target.customerName || target.description || 'this record';
          if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
          latest.splice(info.index, 1);
          write(STORE[info.type], latest);
          window.location.reload();
        });
        actions.appendChild(b);
      }
      row.dataset.gfDeleteAdded = '1';
    });
  }

  // Stop fast double-click / double-submit from creating two records.
  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (form.dataset.gfSubmitLock === '1') {
      e.preventDefault(); e.stopImmediatePropagation();
      return;
    }
    form.dataset.gfSubmitLock = '1';
    const buttons = [...form.querySelectorAll('button[type="submit"],button:not([type])')];
    buttons.forEach(b => { b.dataset.gfOriginalDisabled = b.disabled ? '1' : '0'; b.disabled = true; });
    setTimeout(() => {
      form.dataset.gfSubmitLock = '0';
      buttons.forEach(b => { if (b.dataset.gfOriginalDisabled !== '1') b.disabled = false; });
    }, 1800);
  }, true);

  // Same protection for custom/direct-sale buttons that are type="button".
  document.addEventListener('click', (e) => {
    const b = e.target.closest?.('button');
    if (!b) return;
    const label = (b.textContent || '').trim().toLowerCase();
    if (!/complete sale|complete pos bill|save bill|save purchase|save expense|generate bill/.test(label)) return;
    if (b.dataset.gfClickLock === '1') { e.preventDefault(); e.stopImmediatePropagation(); return; }
    b.dataset.gfClickLock = '1';
    b.dataset.gfOriginalText = b.textContent;
    b.disabled = true;
    setTimeout(() => { b.dataset.gfClickLock = '0'; b.disabled = false; b.textContent = b.dataset.gfOriginalText || b.textContent; }, 1800);
  }, true);

  const observer = new MutationObserver(addDeleteButtons);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('load', addDeleteButtons);
  setTimeout(addDeleteButtons, 500);
  setTimeout(addDeleteButtons, 1500);
  setInterval(addDeleteButtons, 2500);
})();
