/* Genuine Fix — Parts Purchase input enhancement
 * Scoped strictly to the existing Expenses form when category = Parts Purchase.
 * Supports multiple purchased parts in one bill without replacing or submitting its own form.
 */
(function () {
  const META_KEY = 'gf_pending_parts_purchase_meta';
  const BILL_TYPES = ['Cash Bill', 'Credit / Udhaaro', 'Tax Invoice', 'Other'];

  const getExpenses = () => {
    try { return JSON.parse(localStorage.getItem('gf_expenses') || '[]'); } catch { return []; }
  };

  const setReactInputValue = (input, value) => {
    if (!input) return;
    const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (setter) setter.call(input, String(value));
    else input.value = String(value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const findExpenseForm = () => [...document.querySelectorAll('form')].find(form => {
    const text = (form.innerText || '').toLowerCase();
    const category = [...form.querySelectorAll('select')].find(s => [...s.options].some(o => o.value === 'Parts Purchase'));
    return category && text.includes('save expense record');
  });

  const mount = (form) => {
    if (!form || form.dataset.gfPartsPurchaseEnhanced === '1') return;
    const categorySelect = [...form.querySelectorAll('select')].find(s => [...s.options].some(o => o.value === 'Parts Purchase'));
    if (!categorySelect) return;

    const textInputs = [...form.querySelectorAll('input')];
    const descriptionInput = textInputs.find(i => /Description \/ Autoname/i.test(i.placeholder || ''));
    const amountInput = textInputs.find(i => /Total Amount/i.test(i.placeholder || ''));
    if (!descriptionInput || !amountInput) return;

    form.dataset.gfPartsPurchaseEnhanced = '1';

    const panel = document.createElement('div');
    panel.className = 'gf-parts-purchase-panel';
    panel.innerHTML = `
      <div class="gf-pp-head">
        <div>
          <div class="gf-pp-title">Parts Purchase Details</div>
          <div class="gf-pp-subtitle">Add all parts from the same purchase bill.</div>
        </div>
        <button type="button" class="gf-pp-add" data-gf-pp-action="add">+ Add Part</button>
      </div>
      <div class="gf-pp-rows" data-gf-pp="rows"></div>
      <div class="gf-pp-footer">
        <div class="gf-pp-field gf-pp-bill-type">
          <label>Bill Type</label>
          <select data-gf-pp="billType">
            ${BILL_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
          </select>
        </div>
        <div class="gf-pp-total">
          <span>Total Purchase</span>
          <strong>NPR <b data-gf-pp="total">0</b></strong>
        </div>
      </div>
    `;

    form.insertBefore(panel, categorySelect.nextElementSibling || form.firstChild);

    const rowsHost = panel.querySelector('[data-gf-pp="rows"]');
    const billType = panel.querySelector('[data-gf-pp="billType"]');
    const total = panel.querySelector('[data-gf-pp="total"]');
    const addButton = panel.querySelector('[data-gf-pp-action="add"]');

    const createRow = (seed = {}) => {
      const row = document.createElement('div');
      row.className = 'gf-pp-row';
      row.innerHTML = `
        <div class="gf-pp-field gf-pp-name-field">
          <label>Part Name</label>
          <input data-gf-row="name" type="text" placeholder="e.g. iPhone 13 OLED Screen" value="${String(seed.name || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')}">
        </div>
        <div class="gf-pp-field">
          <label>Quantity</label>
          <input data-gf-row="qty" type="number" min="1" step="1" value="${Number(seed.quantity || 1)}" inputmode="numeric">
        </div>
        <div class="gf-pp-field">
          <label>Unit Cost (NPR)</label>
          <input data-gf-row="unit" type="number" min="0" step="0.01" value="${seed.unitCost != null ? Number(seed.unitCost) : ''}" placeholder="0" inputmode="decimal">
        </div>
        <div class="gf-pp-line-total">NPR <b data-gf-row="lineTotal">0</b></div>
        <button type="button" class="gf-pp-remove" data-gf-pp-action="remove" aria-label="Remove part">×</button>
      `;
      rowsHost.appendChild(row);
      return row;
    };

    const rows = () => [...rowsHost.querySelectorAll('.gf-pp-row')];

    const getItems = () => rows().map(row => {
      const name = row.querySelector('[data-gf-row="name"]');
      const qty = row.querySelector('[data-gf-row="qty"]');
      const unit = row.querySelector('[data-gf-row="unit"]');
      const lineTotal = row.querySelector('[data-gf-row="lineTotal"]');
      const item = {
        name: (name?.value || '').trim(),
        quantity: Math.max(1, Number(qty?.value || 0)),
        unitCost: Math.max(0, Number(unit?.value || 0))
      };
      item.total = item.quantity * item.unitCost;
      if (lineTotal) lineTotal.textContent = item.total.toLocaleString();
      return item;
    });

    const sync = () => {
      const items = getItems();
      const purchaseTotal = items.reduce((sum, item) => sum + item.total, 0);
      total.textContent = purchaseTotal.toLocaleString();

      if (categorySelect.value === 'Parts Purchase') {
        const namedItems = items.filter(item => item.name);
        const description = namedItems.map(item => item.name).join(', ');
        if (description) setReactInputValue(descriptionInput, description);
        if (items.some(item => item.unitCost > 0)) setReactInputValue(amountInput, purchaseTotal);
        try {
          localStorage.setItem(META_KEY, JSON.stringify({
            items,
            total: purchaseTotal,
            billType: billType.value,
            savedAt: Date.now()
          }));
        } catch {}
      }
    };

    const removeRow = (button) => {
      const row = button.closest('.gf-pp-row');
      if (!row) return;
      if (rows().length <= 1) {
        row.querySelector('[data-gf-row="name"]').value = '';
        row.querySelector('[data-gf-row="qty"]').value = '1';
        row.querySelector('[data-gf-row="unit"]').value = '';
      } else {
        row.remove();
      }
      sync();
    };

    panel.addEventListener('input', (event) => {
      if (event.target.matches('[data-gf-row]')) sync();
    });
    panel.addEventListener('change', (event) => {
      if (event.target.matches('[data-gf-row], [data-gf-pp="billType"]')) sync();
    });
    panel.addEventListener('click', (event) => {
      const add = event.target.closest('[data-gf-pp-action="add"]');
      const remove = event.target.closest('[data-gf-pp-action="remove"]');
      if (add) {
        createRow();
        sync();
        const newName = rowsHost.lastElementChild?.querySelector('[data-gf-row="name"]');
        newName?.focus();
      }
      if (remove) removeRow(remove);
    });

    form.addEventListener('submit', () => {
      if (categorySelect.value !== 'Parts Purchase') return;

      const items = getItems().filter(item => item.name && item.quantity > 0 && item.unitCost > 0);
      if (!items.length) return;

      const purchaseTotal = items.reduce((sum, item) => sum + item.total, 0);
      const meta = {
        items,
        total: purchaseTotal,
        billType: billType.value,
        submittedAt: Date.now()
      };
      try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch {}

      setTimeout(() => {
        try {
          const arr = getExpenses();
          if (!arr.length) return;
          const newest = arr[0];
          if (String(newest.category || '') !== 'Parts Purchase') return;
          if (Math.abs(Number(newest.amount || 0) - meta.total) > 0.01) return;

          newest.items = meta.items;
          newest.itemName = meta.items.map(item => item.name).join(', ');
          newest.quantity = meta.items.length === 1 ? meta.items[0].quantity : meta.items.reduce((sum, item) => sum + item.quantity, 0);
          newest.unitCost = meta.items.length === 1 ? meta.items[0].unitCost : null;
          newest.amount = meta.total;
          newest.totalAmount = meta.total;
          newest.billType = meta.billType;
          newest.purchaseBillType = meta.billType;
          newest.partsCount = meta.items.length;
          if (!String(newest.description || '').trim()) newest.description = `Parts Purchase - ${newest.itemName}`;

          localStorage.setItem('gf_expenses', JSON.stringify(arr));
          localStorage.removeItem(META_KEY);
        } catch {}
      }, 350);
    });

    createRow();
    toggle();

    function toggle() {
      const active = categorySelect.value === 'Parts Purchase';
      panel.style.display = active ? 'block' : 'none';
      if (active) sync();
    }

    categorySelect.addEventListener('change', toggle);
  };

  const injectStyle = () => {
    if (document.getElementById('gf-parts-purchase-enhancement-style')) return;
    const style = document.createElement('style');
    style.id = 'gf-parts-purchase-enhancement-style';
    style.textContent = `
      .gf-parts-purchase-panel{display:none;grid-column:1/-1;margin:-4px 0 2px;padding:14px 16px;border:1px solid rgba(59,130,246,.28);border-radius:18px;background:rgba(30,41,59,.42)}
      .gf-pp-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px}.gf-pp-title{font-size:12px;font-weight:900;color:#93c5fd;text-transform:uppercase;letter-spacing:.08em}.gf-pp-subtitle{font-size:10px;color:#64748b;margin-top:3px}.gf-pp-add{border:1px solid rgba(59,130,246,.5);background:rgba(37,99,235,.16);color:#bfdbfe;border-radius:10px;padding:8px 11px;font-size:11px;font-weight:900;cursor:pointer}.gf-pp-add:hover{background:rgba(37,99,235,.26)}
      .gf-pp-rows{display:flex;flex-direction:column;gap:10px}.gf-pp-row{display:grid;grid-template-columns:minmax(0,2fr) minmax(90px,.65fr) minmax(120px,.8fr) minmax(110px,.8fr) 34px;gap:10px;align-items:end;padding:10px;border:1px solid rgba(100,116,139,.25);border-radius:14px;background:rgba(15,23,42,.3)}
      .gf-pp-field label{display:block;font-size:11px;font-weight:800;color:#94a3b8;margin-bottom:5px}.gf-pp-field input,.gf-pp-field select{width:100%;box-sizing:border-box;padding:11px 12px;border-radius:12px;border:1px solid rgba(100,116,139,.55);background:#0f172a;color:#f8fafc;outline:none}.gf-pp-field input:focus,.gf-pp-field select:focus{border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59,130,246,.12)}
      .gf-pp-line-total{padding:11px 10px;border-radius:12px;background:rgba(15,23,42,.68);border:1px solid rgba(100,116,139,.35);font-size:12px;font-weight:800;color:#cbd5e1;white-space:nowrap}.gf-pp-line-total b{color:#34d399}.gf-pp-remove{width:34px;height:38px;border:1px solid rgba(239,68,68,.28);background:rgba(127,29,29,.16);color:#fca5a5;border-radius:10px;font-size:20px;line-height:1;cursor:pointer}.gf-pp-remove:hover{background:rgba(127,29,29,.3)}
      .gf-pp-footer{display:grid;grid-template-columns:minmax(180px,.45fr) minmax(0,1.55fr);gap:10px;margin-top:10px}.gf-pp-total{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px 13px;border-radius:12px;background:rgba(15,23,42,.68);border:1px solid rgba(100,116,139,.35);font-size:12px;font-weight:800;color:#cbd5e1}.gf-pp-total strong{font-size:14px;color:#34d399}
      @media(max-width:900px){.gf-pp-row{grid-template-columns:1fr 1fr}.gf-pp-name-field{grid-column:1/-1}.gf-pp-line-total{display:flex;justify-content:space-between}.gf-pp-remove{align-self:stretch}.gf-pp-footer{grid-template-columns:1fr}}
      @media(max-width:520px){.gf-pp-row{grid-template-columns:1fr}.gf-pp-name-field{grid-column:auto}.gf-pp-remove{width:100%}.gf-pp-footer{grid-template-columns:1fr}.gf-pp-head{align-items:center}.gf-pp-add{flex-shrink:0}}
    `;
    document.head.appendChild(style);
  };

  const scan = () => {
    injectStyle();
    const form = findExpenseForm();
    if (form) mount(form);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan, { once: true });
  else scan();
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('load', scan);
  setTimeout(scan, 700);
  setTimeout(scan, 1600);
})();
