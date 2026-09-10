/* Genuine Fix — Parts Purchase input enhancement
 * Scoped strictly to the existing Expenses form when category = Parts Purchase.
 * Does not replace or submit its own form and does not touch other expense types.
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
      <div class="gf-pp-title">Parts Purchase Details</div>
      <div class="gf-pp-grid">
        <div class="gf-pp-field gf-pp-full">
          <label>Part Name</label>
          <input data-gf-pp="name" type="text" placeholder="e.g. iPhone 13 OLED Screen">
          <div class="gf-pp-hint">Enter any new part name; it does not need to already exist in stock.</div>
        </div>
        <div class="gf-pp-field">
          <label>Quantity</label>
          <input data-gf-pp="qty" type="number" min="1" step="1" value="1" inputmode="numeric">
        </div>
        <div class="gf-pp-field">
          <label>Unit Cost (NPR)</label>
          <input data-gf-pp="unit" type="number" min="0" step="0.01" placeholder="0" inputmode="decimal">
        </div>
        <div class="gf-pp-field">
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

    const name = panel.querySelector('[data-gf-pp="name"]');
    const qty = panel.querySelector('[data-gf-pp="qty"]');
    const unit = panel.querySelector('[data-gf-pp="unit"]');
    const billType = panel.querySelector('[data-gf-pp="billType"]');
    const total = panel.querySelector('[data-gf-pp="total"]');

    const sync = () => {
      const partName = name.value.trim();
      const quantity = Math.max(1, Number(qty.value || 0));
      const unitCost = Math.max(0, Number(unit.value || 0));
      const purchaseTotal = quantity * unitCost;
      total.textContent = purchaseTotal.toLocaleString();

      if (categorySelect.value === 'Parts Purchase') {
        if (partName) setReactInputValue(descriptionInput, partName);
        if (unit.value !== '' && qty.value !== '') setReactInputValue(amountInput, purchaseTotal);
        try {
          localStorage.setItem(META_KEY, JSON.stringify({
            name: partName,
            quantity,
            unitCost,
            total: purchaseTotal,
            billType: billType.value,
            savedAt: Date.now()
          }));
        } catch {}
      }
    };

    const toggle = () => {
      const active = categorySelect.value === 'Parts Purchase';
      panel.style.display = active ? 'block' : 'none';
      if (active) sync();
    };

    [name, qty, unit, billType].forEach(el => el.addEventListener('input', sync));
    [billType].forEach(el => el.addEventListener('change', sync));
    categorySelect.addEventListener('change', toggle);

    form.addEventListener('submit', () => {
      if (categorySelect.value !== 'Parts Purchase') return;
      const partName = name.value.trim();
      const quantity = Math.max(1, Number(qty.value || 0));
      const unitCost = Math.max(0, Number(unit.value || 0));
      if (!partName || quantity <= 0 || unitCost <= 0) return;

      const meta = { name: partName, quantity, unitCost, total: quantity * unitCost, billType: billType.value, submittedAt: Date.now() };
      try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch {}

      setTimeout(() => {
        try {
          const arr = getExpenses();
          if (!arr.length) return;
          const newest = arr[0];
          if (String(newest.category || '') !== 'Parts Purchase') return;
          if (Math.abs(Number(newest.amount || 0) - meta.total) > 0.01) return;
          newest.itemName = meta.name;
          newest.quantity = meta.quantity;
          newest.unitCost = meta.unitCost;
          newest.amount = meta.total;
          newest.totalAmount = meta.total;
          newest.billType = meta.billType;
          newest.purchaseBillType = meta.billType;
          if (!String(newest.description || '').trim()) newest.description = `Parts Purchase - ${meta.name}`;
          localStorage.setItem('gf_expenses', JSON.stringify(arr));
          localStorage.removeItem(META_KEY);
        } catch {}
      }, 350);
    });

    toggle();
  };

  const injectStyle = () => {
    if (document.getElementById('gf-parts-purchase-enhancement-style')) return;
    const style = document.createElement('style');
    style.id = 'gf-parts-purchase-enhancement-style';
    style.textContent = `
      .gf-parts-purchase-panel{display:none;grid-column:1/-1;margin:-4px 0 2px;padding:14px 16px;border:1px solid rgba(59,130,246,.28);border-radius:18px;background:rgba(30,41,59,.42)}
      .gf-pp-title{font-size:12px;font-weight:900;color:#93c5fd;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px}
      .gf-pp-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
      .gf-pp-field label{display:block;font-size:11px;font-weight:800;color:#94a3b8;margin-bottom:5px}
      .gf-pp-field input,.gf-pp-field select{width:100%;box-sizing:border-box;padding:11px 12px;border-radius:12px;border:1px solid rgba(100,116,139,.55);background:#0f172a;color:#f8fafc;outline:none}
      .gf-pp-field input:focus,.gf-pp-field select:focus{border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59,130,246,.12)}
      .gf-pp-full{grid-column:1/-1}.gf-pp-hint{font-size:10px;color:#64748b;margin-top:4px}
      .gf-pp-total{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px 13px;border-radius:12px;background:rgba(15,23,42,.68);border:1px solid rgba(100,116,139,.35);font-size:12px;font-weight:800;color:#cbd5e1}
      .gf-pp-total strong{font-size:14px;color:#34d399}
      @media(max-width:700px){.gf-pp-grid{grid-template-columns:1fr}.gf-pp-full{grid-column:auto}.gf-pp-total{grid-column:auto}}
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
