// Genuine Fix — Parts Purchase Bill Type (isolated enhancement)
(() => {
  const OPTIONS = ['Cash Bill', 'Credit / Udhaaro', 'Tax Invoice', 'Other'];
  const STYLE_ID = 'gf-parts-bill-type-style';
  const DATA_KEY = 'gfPartsBillType';

  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `.gf-parts-bill-type-wrap{display:flex;flex-direction:column;gap:5px}.gf-parts-bill-type-label{font-size:11px;font-weight:800;color:#94a3b8}.gf-parts-bill-type-select{width:100%;box-sizing:border-box;padding:.75rem;border-radius:1rem;border:1px solid rgba(100,116,139,.7);background:#0f172a;color:#f8fafc;font-size:.875rem;outline:none}.gf-parts-bill-type-select:focus{border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59,130,246,.12)}`;
    document.head.appendChild(style);
  }

  function isPartsPurchaseForm(form) {
    const text = (form.innerText || '').replace(/\s+/g, ' ').trim().toLowerCase();
    return text.includes('stock purchase') && (text.includes('unit cost') || text.includes('supplier') || text.includes('part name'));
  }

  function patchSavedRecords(selectedType) {
    try {
      const purchases = JSON.parse(localStorage.getItem('gf_stock_purchases') || '[]');
      const expenses = JSON.parse(localStorage.getItem('gf_expenses') || '[]');
      if (!purchases.length) return;

      // React prepends a newly saved purchase, so the newest record is index 0.
      const purchase = purchases[0];
      if (!purchase || !String(purchase.id || '').startsWith('SP-')) return;
      purchase.billType = selectedType;
      localStorage.setItem('gf_stock_purchases', JSON.stringify(purchases));

      const linkedExpense = expenses.find(e => e.linkedStockPurchaseId === purchase.id);
      if (linkedExpense) {
        linkedExpense.billType = selectedType;
        linkedExpense.purchaseBillType = selectedType;
        localStorage.setItem('gf_expenses', JSON.stringify(expenses));
      }
    } catch {}
  }

  function enhance() {
    addStyles();
    document.querySelectorAll('form').forEach(form => {
      if (!isPartsPurchaseForm(form) || form.dataset.gfPartsBillType === '1') return;
      form.dataset.gfPartsBillType = '1';

      const wrap = document.createElement('div');
      wrap.className = 'gf-parts-bill-type-wrap';
      const label = document.createElement('label');
      label.className = 'gf-parts-bill-type-label';
      label.textContent = 'Bill Type';
      const select = document.createElement('select');
      select.className = 'gf-parts-bill-type-select';
      select.dataset.gfPartsBillType = '1';
      OPTIONS.forEach(option => {
        const el = document.createElement('option');
        el.value = option;
        el.textContent = option;
        select.appendChild(el);
      });
      select.value = 'Cash Bill';
      wrap.append(label, select);

      const anchor = [...form.querySelectorAll('input, select, textarea')].find(el => /invoice no|supplier|part name/i.test(el.placeholder || ''));
      if (anchor?.parentElement) anchor.parentElement.after(wrap);
      else {
        const submit = form.querySelector('button[type="submit"]');
        if (submit) submit.parentElement?.before(wrap);
        else form.appendChild(wrap);
      }

      form.addEventListener('submit', () => {
        const chosen = select.value;
        setTimeout(() => patchSavedRecords(chosen), 350);
      }, false);

      // Restore the latest saved purchase type when editing an existing purchase.
      try {
        const editing = JSON.parse(localStorage.getItem('gf_stock_purchases') || '[]');
        const latest = editing[0];
        if (latest?.billType) select.value = latest.billType;
      } catch {}
    });
  }

  const observer = new MutationObserver(enhance);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('load', enhance);
  setTimeout(enhance, 500);
  setTimeout(enhance, 1400);
  setInterval(enhance, 2500);
})();
