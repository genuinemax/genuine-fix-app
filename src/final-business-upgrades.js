// Final Genuine Fix business upgrades
// Adds a real outside-stock/service POS counter, mobile camera IMEI OCR,
// IMEI photo notes, and payment-method tracking without replacing the React app.

const PAYMENT_OPTIONS = ['Cash', 'Online', 'eSewa', 'Khalti', 'Bank Transfer', 'Card', 'Other'];
const money = (v) => Number(v || 0);
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

function inputClass() {
  return 'gf-final-input';
}

function injectStyles() {
  if (document.getElementById('gf-final-upgrade-styles')) return;
  const style = document.createElement('style');
  style.id = 'gf-final-upgrade-styles';
  style.textContent = `
    .gf-final-hidden{display:none!important}
    .gf-final-panel{margin-top:16px;padding:20px;border:1px solid rgba(100,116,139,.45);border-radius:24px;background:rgba(15,23,42,.72);color:#e2e8f0;box-shadow:0 18px 50px rgba(0,0,0,.18)}
    .gf-final-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .gf-final-grid-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
    .gf-final-input{width:100%;box-sizing:border-box;padding:11px 12px;border-radius:13px;border:1px solid rgba(100,116,139,.5);background:#0f172a;color:#f8fafc;outline:none}
    .gf-final-input:focus{border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59,130,246,.15)}
    .gf-final-label{display:block;font-size:12px;font-weight:800;color:#94a3b8;margin:0 0 5px}
    .gf-final-title{font-weight:900;font-size:16px;margin-bottom:4px}
    .gf-final-muted{font-size:12px;color:#94a3b8}
    .gf-final-row{display:grid;grid-template-columns:minmax(0,2fr) 120px 140px 42px;gap:8px;align-items:end;margin-top:9px}
    .gf-final-btn{border:0;border-radius:13px;padding:10px 13px;font-weight:900;cursor:pointer}
    .gf-final-primary{background:#2563eb;color:#fff}.gf-final-secondary{background:rgba(37,99,235,.14);color:#60a5fa}.gf-final-danger{background:rgba(244,63,94,.12);color:#fb7185}
    .gf-final-total{display:flex;justify-content:space-between;gap:12px;padding:12px 14px;border-radius:14px;background:rgba(30,41,59,.75);font-weight:900}
    .gf-final-camera{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:9px}
    .gf-final-badge{display:inline-flex;padding:5px 8px;border-radius:999px;background:rgba(16,185,129,.12);color:#34d399;font-size:11px;font-weight:900}
    @media(max-width:700px){.gf-final-grid,.gf-final-grid-3{grid-template-columns:1fr}.gf-final-row{grid-template-columns:1fr 90px 120px 42px}.gf-final-panel{padding:14px}}
  `;
  document.head.appendChild(style);
}

function getInventory() { try { return JSON.parse(localStorage.getItem('gf_inventory') || '[]'); } catch { return []; } }
function getRepairs() { try { return JSON.parse(localStorage.getItem('gf_repairs') || '[]'); } catch { return []; } }
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

function createPosPanel(originalForm) {
  if (originalForm.dataset.gfFinalPos === '1') return;
  originalForm.dataset.gfFinalPos = '1';
  originalForm.classList.add('gf-final-hidden');

  const panel = document.createElement('section');
  panel.className = 'gf-final-panel';
  panel.id = 'gf-final-pos-panel';
  panel.innerHTML = `
    <div class="gf-final-title">Advanced Direct Sale Counter</div>
    <div class="gf-final-muted">Stock item, outside-stock item or service — all in one bill.</div>
    <div class="gf-final-grid" style="margin-top:14px">
      <div><label class="gf-final-label">Customer Name</label><input class="${inputClass()}" data-gf="customer" placeholder="Customer full name"></div>
      <div><label class="gf-final-label">Phone</label><input class="${inputClass()}" data-gf="phone" placeholder="Phone number" inputmode="tel"></div>
    </div>
    <div style="margin-top:15px"><div class="gf-final-title" style="font-size:13px">Bill Items</div><div data-gf="items"></div>
      <button type="button" class="gf-final-btn gf-final-secondary" data-gf="add">+ Add item</button>
    </div>
    <div class="gf-final-grid-3" style="margin-top:14px">
      <div><label class="gf-final-label">Payment Method</label><select class="${inputClass()}" data-gf="payment">${PAYMENT_OPTIONS.map(x => `<option>${x}</option>`).join('')}</select></div>
      <div><label class="gf-final-label">Paid Amount (NPR)</label><input class="${inputClass()}" data-gf="paid" type="number" min="0" placeholder="Auto = full paid"></div>
      <div><label class="gf-final-label">Warranty</label><input class="${inputClass()}" data-gf="warranty" placeholder="e.g. 7 Days"></div>
    </div>
    <div style="margin-top:10px"><label class="gf-final-label">Notes</label><input class="${inputClass()}" data-gf="notes" placeholder="Optional bill notes"></div>
    <div class="gf-final-total" style="margin-top:12px"><span>Total: NPR <b data-gf="total">0</b></span><span>Due: NPR <b data-gf="due">0</b></span></div>
    <button type="button" class="gf-final-btn gf-final-primary" data-gf="save" style="width:100%;margin-top:12px">Complete Sale & Save Bill</button>
  `;
  originalForm.parentElement.insertBefore(panel, originalForm);

  const itemHost = panel.querySelector('[data-gf="items"]');
  const addItem = (initial = {}) => {
    const row = document.createElement('div');
    row.className = 'gf-final-row';
    row.innerHTML = `
      <div><label class="gf-final-label">Item / Service</label><div class="gf-final-name-wrap"></div></div>
      <div><label class="gf-final-label">Qty</label><input class="${inputClass()}" data-role="qty" type="number" min="1" value="${initial.qty || 1}"></div>
      <div><label class="gf-final-label">Price</label><input class="${inputClass()}" data-role="price" type="number" min="0" value="${initial.price || ''}" placeholder="NPR"></div>
      <button type="button" class="gf-final-btn gf-final-danger" data-role="remove">×</button>
    `;
    const wrap = row.querySelector('.gf-final-name-wrap');
    const mode = document.createElement('select');
    mode.className = inputClass();
    mode.innerHTML = '<option value="stock">Stock item</option><option value="outside">Outside stock</option><option value="service">Service</option>';
    mode.value = initial.source || 'stock';
    const name = document.createElement('input');
    name.className = inputClass(); name.dataset.role = 'name'; name.placeholder = 'Item / service name'; name.style.marginTop = '6px'; name.value = initial.name || '';
    const datalist = document.createElement('datalist'); datalist.id = `gf-stock-${Date.now()}-${Math.random()}`;
    getInventory().forEach(i => { const o = document.createElement('option'); o.value = i.name; o.label = `${i.name} — stock ${i.stock} — NPR ${i.price}`; datalist.appendChild(o); });
    name.setAttribute('list', datalist.id); panel.appendChild(datalist);
    wrap.appendChild(mode); wrap.appendChild(name);
    const price = row.querySelector('[data-role="price"]');
    mode.addEventListener('change', () => { if (mode.value === 'stock') { name.setAttribute('list', datalist.id); } else { name.removeAttribute('list'); } recalc(); });
    name.addEventListener('input', () => { if (mode.value === 'stock') { const inv = getInventory().find(i => String(i.name).toLowerCase() === name.value.trim().toLowerCase()); if (inv && !price.value) price.value = inv.price; } recalc(); });
    row.querySelector('[data-role="qty"]').addEventListener('input', recalc);
    price.addEventListener('input', recalc);
    row.querySelector('[data-role="remove"]').addEventListener('click', () => { if (itemHost.children.length > 1) { row.remove(); recalc(); } });
    itemHost.appendChild(row); recalc();
  };
  const recalc = () => {
    const total = [...itemHost.children].reduce((s, r) => s + money(r.querySelector('[data-role="price"]').value) * Math.max(1, money(r.querySelector('[data-role="qty"]').value)), 0);
    const paidRaw = panel.querySelector('[data-gf="paid"]').value;
    const paid = paidRaw === '' ? total : Math.min(total, Math.max(0, money(paidRaw)));
    panel.querySelector('[data-gf="total"]').textContent = total;
    panel.querySelector('[data-gf="due"]').textContent = Math.max(0, total - paid);
  };
  panel.querySelector('[data-gf="add"]').addEventListener('click', () => addItem());
  panel.querySelector('[data-gf="paid"]').addEventListener('input', recalc);
  panel.querySelector('[data-gf="save"]').addEventListener('click', () => {
    const rows = [...itemHost.children].map(r => ({
      source: r.querySelector('select').value,
      name: r.querySelector('[data-role="name"]').value.trim(),
      qty: Math.max(1, money(r.querySelector('[data-role="qty"]').value)),
      price: money(r.querySelector('[data-role="price"]').value)
    }));
    if (!rows.length || rows.some(x => !x.name || x.price < 0 || x.qty <= 0)) { alert('Please complete every sale item.'); return; }
    const inv = getInventory();
    const stockNeeds = {};
    rows.filter(x => x.source === 'stock').forEach(x => { const k = x.name.toLowerCase(); stockNeeds[k] = (stockNeeds[k] || 0) + x.qty; });
    for (const [k, q] of Object.entries(stockNeeds)) { const item = inv.find(i => String(i.name || '').trim().toLowerCase() === k); if (!item) { alert(`Stock item not found: ${k}`); return; } if (money(item.stock) < q) { alert(`Insufficient stock for ${item.name}. Available: ${item.stock}`); return; } }
    const updatedInv = inv.map(i => { const q = stockNeeds[String(i.name || '').trim().toLowerCase()] || 0; return q ? {...i, stock: money(i.stock) - q} : i; });
    const total = rows.reduce((s, x) => s + x.price * x.qty, 0);
    const paidRaw = panel.querySelector('[data-gf="paid"]').value;
    const paid = paidRaw === '' ? total : Math.min(total, Math.max(0, money(paidRaw)));
    const bill = {
      id: uid('ACC'), customerName: panel.querySelector('[data-gf="customer"]').value.trim() || 'Walk-in Customer',
      phone: panel.querySelector('[data-gf="phone"]').value.trim() || 'N/A', citizenshipNo:'', customerPhoto:'', citizenshipPhoto:'',
      deviceType:'Accessories / Sales', model:rows.map(x => `${x.name} (x${x.qty})`).join(', '), totalCost:total, paidAmount:paid,
      dueAmount:Math.max(0,total-paid), issue:'Direct Store Sale / Custom Bill', warrantyMonths:panel.querySelector('[data-gf="warranty"]').value.trim(),
      status:'Delivered', dateTime:new Date().toISOString().replace('T',' ').slice(0,19), billType:'Accessories',
      paymentMethod:panel.querySelector('[data-gf="payment"]').value, notes:panel.querySelector('[data-gf="notes"]').value.trim(),
      items:rows.map(x => ({name:x.name, price:x.price, qty:x.qty, source:x.source, remarks:x.source === 'stock' ? 'Stock Sale' : x.source === 'service' ? 'Service Sale' : 'Outside Stock Sale'}))
    };
    save('gf_inventory', updatedInv); save('gf_repairs', [bill, ...getRepairs()]);
    alert(`Bill ${bill.id} saved. Payment: ${bill.paymentMethod}`); window.location.reload();
  });
  addItem();
}

function attachPaymentTracking(form, storageKey, matchTypes) {
  if (form.dataset.gfPayment === '1') return;
  const select = document.createElement('select');
  select.className = inputClass(); select.dataset.gfPaymentMethod = '1';
  select.innerHTML = PAYMENT_OPTIONS.map(x => `<option>${x}</option>`).join('');
  const wrap = document.createElement('div'); wrap.className = 'gf-final-camera';
  const label = document.createElement('span'); label.className = 'gf-final-label'; label.textContent = 'Payment Method'; label.style.margin = '0';
  wrap.appendChild(label); wrap.appendChild(select);
  form.appendChild(wrap); form.dataset.gfPayment = '1';
  form.addEventListener('submit', () => {
    const chosen = select.value;
    setTimeout(() => {
      try {
        const arr = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (!arr.length) return;
        const now = arr[0];
        if (!matchTypes || matchTypes.includes(now.billType) || storageKey !== 'gf_repairs') {
          now.paymentMethod = chosen; arr[0] = now; localStorage.setItem(storageKey, JSON.stringify(arr));
        }
      } catch {}
    }, 250);
  }, false);
}

function loadTesseract() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (window.__gfTesseractPromise) return window.__gfTesseractPromise;
  window.__gfTesseractPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'; s.onload = () => resolve(window.Tesseract); s.onerror = reject; document.head.appendChild(s);
  });
  return window.__gfTesseractPromise;
}

function addImeIPhotoTool(deviceForm) {
  if (deviceForm.dataset.gfImeiCamera === '1') return;
  deviceForm.dataset.gfImeiCamera = '1';
  const box = document.createElement('div'); box.className = 'gf-final-camera';
  box.innerHTML = `<span class="gf-final-label" style="margin:0">IMEI / Serial Photo</span><span class="gf-final-muted">Take a photo and the number will be read automatically.</span>`;
  const input = document.createElement('input'); input.type='file'; input.accept='image/*'; input.capture='environment'; input.style.display='none';
  const btn = document.createElement('button'); btn.type='button'; btn.className='gf-final-btn gf-final-secondary'; btn.textContent='📷 Take / Upload IMEI Photo';
  const status = document.createElement('span'); status.className='gf-final-muted';
  box.appendChild(btn); box.appendChild(input); box.appendChild(status); deviceForm.appendChild(box);
  btn.addEventListener('click', () => input.click());
  input.addEventListener('change', async () => {
    const file = input.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = async () => {
      const photo = reader.result; status.textContent = 'Reading IMEI...';
      try {
        const T = await loadTesseract(); const result = await T.recognize(photo, 'eng', { logger: m => { if (m.status === 'recognizing text') status.textContent = `Reading IMEI ${Math.round((m.progress || 0)*100)}%...`; } });
        const text = String(result?.data?.text || '');
        const candidates = text.replace(/[^0-9\n]/g, ' ').split(/\s+/).filter(Boolean).filter(x => /^\d{10,18}$/.test(x));
        const imeis = candidates.filter(x => x.length === 15 || x.length === 14 || x.length === 16);
        const fields = [...deviceForm.querySelectorAll('input')].filter(i => /IMEI|Serial/i.test(i.placeholder || ''));
        if (imeis.length) { fields.forEach((f,i) => { if (imeis[i]) { f.value = imeis[i]; f.dispatchEvent(new Event('input',{bubbles:true})); } }); status.textContent = `✓ Found ${imeis.join(', ')}`; }
        else status.textContent = 'Could not confidently read the number. Please type it manually.';
        const pending = { photo, imeis, savedAt: Date.now() }; localStorage.setItem('gf_pending_imei_photo', JSON.stringify(pending));
      } catch (err) { status.textContent = 'OCR unavailable. Photo saved; please type IMEI manually.'; localStorage.setItem('gf_pending_imei_photo', JSON.stringify({photo,imeis:[],savedAt:Date.now()})); }
    }; reader.readAsDataURL(file);
  });
}

function attachPendingImeiPhoto() {
  const raw = localStorage.getItem('gf_pending_imei_photo'); if (!raw) return;
  try {
    const pending = JSON.parse(raw); if (!pending.photo) return;
    const devices = JSON.parse(localStorage.getItem('gf_devices_stock') || '[]');
    if (!devices.length) return;
    let attached = false;
    const updated = devices.map(d => {
      const imeis = Array.isArray(d.imeis) ? d.imeis : [d.imeiOrSerial];
      const match = !pending.imeis?.length || imeis.some(i => pending.imeis.includes(String(i)));
      if (match && !d.imeiPhoto) { attached = true; return {...d, imeiPhoto: pending.photo, imeiPhotoNote:'IMEI/Serial photo captured from camera', imeiPhotoSavedAt:new Date().toISOString()}; }
      return d;
    });
    if (attached) { localStorage.setItem('gf_devices_stock', JSON.stringify(updated)); localStorage.removeItem('gf_pending_imei_photo'); }
  } catch {}
}

function scan() {
  injectStyles();
  document.querySelectorAll('form').forEach(form => {
    const text = (form.innerText || '').toLowerCase();
    if (text.includes('accessories & direct sales counter')) createPosPanel(form);
    else if (text.includes('device buy / sell') || text.includes('save purchase & stock') || text.includes('complete sale & generate bill')) addImeIPhotoTool(form);
    if (text.includes('job sheet') || text.includes('save expense') || text.includes('save purchase & stock') || text.includes('complete sale & generate bill')) {
      attachPaymentTracking(form, text.includes('expense') ? 'gf_expenses' : text.includes('purchase') ? 'gf_expenses' : 'gf_repairs', ['Repair','Device Sale','Accessories']);
    }
  });
  attachPendingImeiPhoto();
}

const observer = new MutationObserver(() => scan());
observer.observe(document.documentElement, { childList:true, subtree:true });
window.addEventListener('load', scan);
setTimeout(scan, 700); setTimeout(scan, 1800); setInterval(scan, 3000); setInterval(attachPendingImeiPhoto, 1500);
