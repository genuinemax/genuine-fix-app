// Genuine Fix POS: allow selling items that are not yet in inventory.
const POS_PAYMENT_OPTIONS = ['Cash', 'Online', 'eSewa', 'Khalti', 'Bank Transfer', 'Card', 'Other'];
const posMoney = (v) => Number(v || 0);
const posUid = () => `ACC-${Math.floor(1000 + Math.random() * 9000)}`;

function posSave(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function posGet(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function posEsc(v) {
  return String(v ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
}

function enhancePosForm(form) {
  if (!form || form.dataset.gfCustomPos === '1') return;
  form.dataset.gfCustomPos = '1';

  const heading = [...form.querySelectorAll('h3')].find(el => /bill items|parts selection/i.test(el.textContent || ''));
  if (!heading) return;

  const rowsHost = heading.parentElement?.parentElement || form;
  const getRows = () => [...form.querySelectorAll('select')].filter(s => {
    return [...s.options].some(o => /stock:|select stock item/i.test(o.textContent || ''));
  });

  const addRowControls = () => {
    getRows().forEach((stockSelect) => {
      if (stockSelect.dataset.gfCustomControl === '1') return;
      stockSelect.dataset.gfCustomControl = '1';
      const row = stockSelect.parentElement;
      if (!row) return;

      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;flex-direction:column;gap:6px;min-width:0;flex:2';
      row.insertBefore(wrap, stockSelect);
      wrap.appendChild(stockSelect);

      const mode = document.createElement('select');
      mode.className = stockSelect.className;
      mode.style.marginTop = '2px';
      mode.innerHTML = '<option value="stock">Stock Item</option><option value="outside">Outside Stock</option><option value="service">Service</option>';

      const custom = document.createElement('input');
      custom.type = 'text';
      custom.placeholder = 'Enter item / service name';
      custom.className = stockSelect.className;
      custom.style.display = 'none';
      custom.dataset.gfCustomName = '1';
      custom.required = false;

      wrap.insertBefore(mode, stockSelect);
      wrap.appendChild(custom);

      const toggle = () => {
        const customMode = mode.value !== 'stock';
        stockSelect.style.display = customMode ? 'none' : '';
        stockSelect.required = !customMode;
        custom.style.display = customMode ? '' : 'none';
        custom.required = customMode;
        if (customMode) custom.focus();
      };
      mode.addEventListener('change', toggle);
      toggle();
    });
  };

  const ensureTitle = () => {
    if (form.querySelector('[data-gf-custom-sale-note]')) return;
    const note = document.createElement('div');
    note.dataset.gfCustomSaleNote = '1';
    note.style.cssText = 'margin:0 0 8px;padding:10px 12px;border-radius:12px;background:rgba(37,99,235,.10);color:#60a5fa;font-size:12px;font-weight:800';
    note.textContent = '💡 Not in stock? Select Outside Stock or Service and type the item name manually. Stock will NOT be deducted for those items.';
    rowsHost.insertBefore(note, rowsHost.firstChild);
  };

  const completeCustomSale = (event) => {
    const rows = getRows();
    if (!rows.length) return;
    const parsed = rows.map(stockSelect => {
      const row = stockSelect.parentElement;
      const mode = [...row.querySelectorAll('select')].find(s => s !== stockSelect && /Outside Stock|Service/.test(s.innerText || ''));
      const custom = row.querySelector('[data-gf-custom-name]');
      const qtyInput = [...row.querySelectorAll('input')].find(i => /Qty/i.test(i.placeholder || ''));
      const priceInput = [...row.querySelectorAll('input')].find(i => /Price/i.test(i.placeholder || ''));
      const source = mode?.value || 'stock';
      const name = source === 'stock' ? stockSelect.value.trim() : (custom?.value || '').trim();
      return { source, name, qty: Math.max(1, posMoney(qtyInput?.value || 1)), price: Math.max(0, posMoney(priceInput?.value || 0)) };
    });

    if (!parsed.some(x => x.source !== 'stock')) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();

    if (parsed.some(x => !x.name || x.price < 0 || x.qty <= 0)) {
      alert('Please complete every sale item, including item name, quantity and price.');
      return;
    }

    const inventory = posGet('gf_inventory');
    const needs = {};
    parsed.filter(x => x.source === 'stock').forEach(x => {
      const key = x.name.toLowerCase();
      needs[key] = (needs[key] || 0) + x.qty;
    });
    for (const [key, qty] of Object.entries(needs)) {
      const item = inventory.find(i => String(i.name || '').trim().toLowerCase() === key);
      if (!item) { alert(`Stock item not found: ${key}`); return; }
      if (posMoney(item.stock) < qty) { alert(`Insufficient stock for ${item.name}. Available: ${item.stock}`); return; }
    }

    const updatedInventory = inventory.map(item => {
      const qty = needs[String(item.name || '').trim().toLowerCase()] || 0;
      return qty ? { ...item, stock: posMoney(item.stock) - qty } : item;
    });

    const customer = form.querySelector('input[placeholder="Customer Full Name"]')?.value.trim() || 'Walk-in Customer';
    const phone = form.querySelector('input[placeholder="Phone Number"]')?.value.trim() || 'N/A';
    const paidInput = form.querySelector('input[placeholder="Paid Amount (NPR)"]');
    const warranty = form.querySelector('input[placeholder*="Warranty"]')?.value.trim() || '';
    const paymentSelect = [...form.querySelectorAll('select')].find(s => s.dataset.gfPosPayment === '1');
    const total = parsed.reduce((sum, x) => sum + x.price * x.qty, 0);
    const paid = paidInput?.value === '' || paidInput?.value == null ? total : Math.min(total, Math.max(0, posMoney(paidInput.value)));

    const bill = {
      id: posUid(), customerName: customer, phone, citizenshipNo: '', customerPhoto: '', citizenshipPhoto: '',
      deviceType: 'Accessories / Sales', model: parsed.map(x => `${x.name} (x${x.qty})`).join(', '),
      totalCost: total, paidAmount: paid, dueAmount: Math.max(0, total - paid),
      issue: 'Direct Store Sale / Custom Bill', warrantyMonths: warranty, status: 'Delivered',
      dateTime: new Date().toISOString().replace('T', ' ').slice(0, 19), billType: 'Accessories',
      paymentMethod: paymentSelect?.value || 'Cash',
      items: parsed.map(x => ({ name: x.name, price: x.price, qty: x.qty, source: x.source, remarks: x.source === 'stock' ? 'Stock Sale' : x.source === 'service' ? 'Service Sale' : 'Outside Stock Sale' }))
    };
    posSave('gf_inventory', updatedInventory);
    posSave('gf_repairs', [bill, ...posGet('gf_repairs')]);
    alert(`Bill ${bill.id} saved. ${customer} | NPR ${total} | ${bill.paymentMethod}`);
    window.location.reload();
  };

  const addPayment = () => {
    if (form.querySelector('[data-gf-pos-payment="1"]')) return;
    const paid = form.querySelector('input[placeholder="Paid Amount (NPR)"]');
    if (!paid) return;
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:8px';
    const label = document.createElement('span');
    label.style.cssText = 'font-size:12px;font-weight:800;color:#94a3b8;white-space:nowrap';
    label.textContent = 'Pay By';
    const select = document.createElement('select');
    select.className = paid.className;
    select.dataset.gfPosPayment = '1';
    select.innerHTML = POS_PAYMENT_OPTIONS.map(x => `<option value="${posEsc(x)}">${posEsc(x)}</option>`).join('');
    wrap.append(label, select);
    paid.parentElement?.parentElement?.appendChild(wrap);
  };

  addRowControls();
  ensureTitle();
  addPayment();
  form.addEventListener('submit', completeCustomSale, true);
  const observer = new MutationObserver(() => { addRowControls(); addPayment(); });
  observer.observe(form, { childList: true, subtree: true });
}

function scanPos() {
  document.querySelectorAll('form').forEach(form => {
    const text = (form.innerText || '').toLowerCase();
    if (text.includes('accessories & direct sales counter') || text.includes('complete pos bill & deduct stock')) enhancePosForm(form);
  });
}

const posObserver = new MutationObserver(scanPos);
posObserver.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener('load', scanPos);
setTimeout(scanPos, 300);
setTimeout(scanPos, 1200);
setTimeout(scanPos, 2500);
