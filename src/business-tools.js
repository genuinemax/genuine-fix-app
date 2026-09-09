// Genuine Fix Business Tools
// Adds dedicated Profit & Loss, Customer Job History and Walk-in Customer Billing tabs.
// Walk-in bills never change inventory stock.

(() => {
  const read = (key, fallback = []) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
      return Array.isArray(value) ? value : fallback;
    } catch { return fallback; }
  };
  const money = v => Number.isFinite(Number(v)) ? Number(v) : 0;
  const fmt = v => `NPR ${Math.round(money(v)).toLocaleString('en-IN')}`;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dateNow = () => {
    const d = new Date();
    return `${d.toISOString().split('T')[0]} ${d.toTimeString().split(' ')[0]}`;
  };

  const style = () => {
    if (document.getElementById('gf-business-tools-style')) return;
    const s = document.createElement('style');
    s.id = 'gf-business-tools-style';
    s.textContent = `
      .gf-biz-modal-backdrop{position:fixed;inset:0;z-index:100000;background:rgba(2,6,23,.82);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:12px}
      .gf-biz-modal{width:min(1080px,100%);max-height:94vh;overflow:auto;background:#111827;color:#e5e7eb;border:1px solid #334155;border-radius:22px;box-shadow:0 30px 90px rgba(0,0,0,.5);padding:20px}
      .gf-biz-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px}.gf-biz-head h2{margin:2px 0;font-size:22px;font-weight:900}.gf-biz-sub{color:#94a3b8;font-size:12px}.gf-biz-close{border:1px solid #475569;background:#1e293b;color:#fff;border-radius:11px;width:36px;height:36px;font-size:22px;cursor:pointer}
      .gf-biz-tabs{display:flex;gap:7px;overflow:auto;margin-bottom:16px}.gf-biz-tabs button{white-space:nowrap;border:1px solid #334155;background:#0f172a;color:#cbd5e1;padding:9px 13px;border-radius:11px;font-weight:800;cursor:pointer}.gf-biz-tabs button.active{background:#2563eb;border-color:#2563eb;color:#fff}
      .gf-biz-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.gf-biz-card{background:#0f172a;border:1px solid #334155;border-radius:15px;padding:14px}.gf-biz-label{font-size:11px;color:#94a3b8;font-weight:800}.gf-biz-value{font-size:20px;font-weight:900;margin-top:4px}.gf-biz-profit{color:#34d399}.gf-biz-loss{color:#fb7185}
      .gf-biz-search{width:100%;box-sizing:border-box;padding:11px 13px;background:#0b1220;color:#fff;border:1px solid #334155;border-radius:12px;outline:none;margin-bottom:12px}.gf-biz-table-wrap{overflow:auto;border:1px solid #334155;border-radius:14px}.gf-biz-table{width:100%;border-collapse:collapse;min-width:700px}.gf-biz-table th,.gf-biz-table td{padding:10px 12px;border-bottom:1px solid #1e293b;text-align:left;font-size:12px}.gf-biz-table th{background:#0f172a;color:#94a3b8;text-transform:uppercase;font-size:10px}.gf-biz-table td.num,.gf-biz-table th.num{text-align:right}.gf-biz-muted{color:#94a3b8}.gf-biz-empty{padding:28px;text-align:center;color:#94a3b8}
      .gf-biz-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.gf-biz-form input,.gf-biz-form select{width:100%;box-sizing:border-box;padding:11px 12px;border-radius:11px;border:1px solid #334155;background:#0b1220;color:#fff;outline:none}.gf-biz-full{grid-column:1/-1}.gf-biz-items{display:flex;flex-direction:column;gap:8px;margin-top:10px}.gf-biz-item{display:grid;grid-template-columns:1fr 130px 80px 38px;gap:7px}.gf-biz-btn{border:0;border-radius:11px;padding:11px 14px;background:#2563eb;color:#fff;font-weight:800;cursor:pointer}.gf-biz-btn.green{background:#059669}.gf-biz-btn.red{background:#dc2626}.gf-biz-btn.gray{background:#334155}.gf-biz-note{font-size:11px;color:#94a3b8;margin-top:9px;line-height:1.5}.gf-biz-customer{cursor:pointer}.gf-biz-customer:hover{background:#172554}
      @media(max-width:760px){.gf-biz-grid{grid-template-columns:1fr 1fr}.gf-biz-form{grid-template-columns:1fr}.gf-biz-full{grid-column:auto}.gf-biz-item{grid-template-columns:1fr 100px 70px 38px}.gf-biz-modal{padding:14px;border-radius:17px}.gf-biz-head h2{font-size:19px}}
      @media(max-width:430px){.gf-biz-grid{grid-template-columns:1fr}.gf-biz-item{grid-template-columns:1fr 1fr 70px 38px}}
    `;
    document.head.appendChild(s);
  };

  const close = () => document.getElementById('gf-biz-backdrop')?.remove();
  const modal = html => { close(); document.body.insertAdjacentHTML('beforeend', `<div id="gf-biz-backdrop" class="gf-biz-modal-backdrop"><div class="gf-biz-modal">${html}</div></div>`); document.getElementById('gf-biz-backdrop').addEventListener('click', e => { if(e.target.id === 'gf-biz-backdrop') close(); }); document.getElementById('gf-biz-close')?.addEventListener('click', close); };

  const openPL = () => {
    const launcher = document.getElementById('gf-pl-launcher');
    if (launcher) launcher.click();
    else {
      const repairs = read('gf_repairs'), expenses = read('gf_expenses'), inventory = read('gf_inventory');
      const revenue = repairs.reduce((s,r)=>s+money(r.totalCost),0);
      const cogs = repairs.reduce((s,r)=>s+(Array.isArray(r.items)?r.items.reduce((a,i)=>a+money(i.qty||1)*money(i.costPrice),0):0),0);
      const exp = expenses.reduce((s,e)=>s+money(e.amount),0);
      modal(`<div class="gf-biz-head"><div><h2>Profit & Loss</h2><div class="gf-biz-sub">Business financial summary</div></div><button id="gf-biz-close" class="gf-biz-close">×</button></div><div class="gf-biz-grid"><div class="gf-biz-card"><div class="gf-biz-label">Revenue</div><div class="gf-biz-value">${fmt(revenue)}</div></div><div class="gf-biz-card"><div class="gf-biz-label">COGS</div><div class="gf-biz-value">${fmt(cogs)}</div></div><div class="gf-biz-card"><div class="gf-biz-label">Expenses</div><div class="gf-biz-value">${fmt(exp)}</div></div><div class="gf-biz-card"><div class="gf-biz-label">Net</div><div class="gf-biz-value ${(revenue-cogs-exp)>=0?'gf-biz-profit':'gf-biz-loss'}">${fmt(revenue-cogs-exp)}</div></div></div><p class="gf-biz-note">Stock value is kept separate. Inventory is not treated as an expense until it is sold/used.</p>`);
    }
  };

  const customers = () => {
    const repairs = read('gf_repairs');
    const map = new Map();
    repairs.forEach(r => {
      const name = String(r.customerName || 'Walk-in Customer').trim();
      if (!name || name.toLowerCase() === 'walk-in customer') return;
      const key = name.toLowerCase();
      const x = map.get(key) || {name, phone:r.phone || '', jobs:[], total:0, paid:0, due:0};
      x.jobs.push(r); x.total += money(r.totalCost); x.paid += money(r.paidAmount); x.due += money(r.dueAmount); if(!x.phone && r.phone) x.phone=r.phone; map.set(key,x);
    });
    return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name));
  };

  const openCustomers = (selected = null) => {
    const list = customers();
    const rows = list.map(c=>`<tr class="gf-biz-customer" data-customer="${esc(c.name)}"><td><b>${esc(c.name)}</b><div class="gf-biz-muted">${esc(c.phone||'No phone')}</div></td><td class="num">${c.jobs.length}</td><td class="num">${fmt(c.total)}</td><td class="num">${fmt(c.paid)}</td><td class="num">${c.due>0?`<span class="gf-biz-loss">${fmt(c.due)}</span>`:'<span class="gf-biz-profit">Paid</span>'}</td></tr>`).join('');
    const selectedCustomer = selected ? list.find(c=>c.name.toLowerCase()===selected.toLowerCase()) : null;
    const history = selectedCustomer ? `<div class="gf-biz-card" style="margin-top:14px"><div class="gf-biz-label">JOB HISTORY — ${esc(selectedCustomer.name)}</div><div class="gf-biz-table-wrap" style="margin-top:8px"><table class="gf-biz-table"><thead><tr><th>Date</th><th>Bill ID</th><th>Type</th><th>Description</th><th class="num">Total</th><th class="num">Due</th></tr></thead><tbody>${selectedCustomer.jobs.sort((a,b)=>String(b.dateTime).localeCompare(String(a.dateTime))).map(j=>`<tr><td>${esc(j.dateTime||j.date||'')}</td><td>${esc(j.id)}</td><td>${esc(j.billType||'Repair')}</td><td>${esc(j.model||j.issue||'')}</td><td class="num">${fmt(j.totalCost)}</td><td class="num">${fmt(j.dueAmount)}</td></tr>`).join('')}</tbody></table></div></div>` : '<div class="gf-biz-note">Customer माथि click गर्दा उसको पूरा Job History खुल्छ।</div>';
    modal(`<div class="gf-biz-head"><div><h2>Customers & Job History</h2><div class="gf-biz-sub">Customer-wise repair, bill, paid and due history</div></div><button id="gf-biz-close" class="gf-biz-close">×</button></div><input id="gf-customer-search" class="gf-biz-search" placeholder="Search customer name or phone..."/><div class="gf-biz-table-wrap"><table class="gf-biz-table"><thead><tr><th>Customer</th><th class="num">Jobs</th><th class="num">Total</th><th class="num">Paid</th><th class="num">Due</th></tr></thead><tbody id="gf-customer-rows">${rows||'<tr><td colspan="5" class="gf-biz-empty">No saved customers yet.</td></tr>'}</tbody></table></div>${history}`);
    document.querySelectorAll('#gf-customer-rows .gf-biz-customer').forEach(row=>row.addEventListener('click',()=>openCustomers(row.dataset.customer)));
    document.getElementById('gf-customer-search')?.addEventListener('input', e=>{const q=e.target.value.toLowerCase(); document.querySelectorAll('#gf-customer-rows tr').forEach(r=>{r.style.display=r.textContent.toLowerCase().includes(q)?'':'none';});});
  };

  const openWalkIn = () => {
    modal(`<div class="gf-biz-head"><div><h2>Walk-in Customer Bill</h2><div class="gf-biz-sub">Separate cash/quick bill — <b>NO STOCK DEDUCTION</b></div></div><button id="gf-biz-close" class="gf-biz-close">×</button></div><form id="gf-walkin-form"><div class="gf-biz-form"><input id="gf-walk-name" placeholder="Customer Name (optional)"/><input id="gf-walk-phone" placeholder="Phone (optional)"/><div class="gf-biz-full"><div class="gf-biz-items" id="gf-walk-items"><div class="gf-biz-item"><input placeholder="Item / Service"/><input type="number" min="0" placeholder="Price"/><input type="number" min="1" value="1" placeholder="Qty"/><button type="button" class="gf-biz-btn red gf-remove-walk">×</button></div></div><button type="button" id="gf-add-walk" class="gf-biz-btn gray" style="margin-top:8px">+ Add Item</button></div><input id="gf-walk-paid" type="number" min="0" placeholder="Paid Amount"/><input id="gf-walk-note" placeholder="Note / Remarks"/><button class="gf-biz-btn green gf-biz-full" type="submit">Save Walking Bill</button></div></form><div class="gf-biz-note">This bill is stored as <b>Walking Customer</b> and will not reduce Parts Stock or Accessories Stock.</div>`);
    const items = document.getElementById('gf-walk-items');
    const add = () => { const row=document.createElement('div'); row.className='gf-biz-item'; row.innerHTML='<input placeholder="Item / Service"/><input type="number" min="0" placeholder="Price"/><input type="number" min="1" value="1" placeholder="Qty"/><button type="button" class="gf-biz-btn red gf-remove-walk">×</button>'; items.appendChild(row); };
    document.getElementById('gf-add-walk')?.addEventListener('click',add);
    items.addEventListener('click',e=>{if(e.target.closest('.gf-remove-walk') && items.children.length>1)e.target.closest('.gf-biz-item').remove();});
    document.getElementById('gf-walkin-form')?.addEventListener('submit',e=>{
      e.preventDefault();
      const rows=[...items.children];
      const billItems=rows.map(r=>{const x=r.querySelectorAll('input');return {name:x[0].value.trim()||'Walk-in Sale',price:money(x[1].value),qty:Math.max(1,money(x[2].value))};}).filter(x=>x.price>0);
      if(!billItems.length){alert('कम्तीमा एउटा item र price राख्नुहोस्।');return;}
      const total=billItems.reduce((s,x)=>s+x.price*x.qty,0);
      const paid=money(document.getElementById('gf-walk-paid').value || total);
      const bill={id:`WALK-${Date.now().toString().slice(-7)}`,customerName:document.getElementById('gf-walk-name').value.trim()||'Walk-in Customer',phone:document.getElementById('gf-walk-phone').value.trim()||'N/A',citizenshipNo:'',customerPhoto:'',citizenshipPhoto:'',deviceType:'Walk-in Sale',model:billItems.map(x=>`${x.name} (x${x.qty})`).join(', '),totalCost:total,paidAmount:Math.min(paid,total),dueAmount:Math.max(0,total-paid),issue:document.getElementById('gf-walk-note').value.trim()||'Walk-in Customer Sale',warrantyMonths:'N/A',status:'Delivered',dateTime:dateNow(),billType:'Walking Customer',stockDeducted:false,items:billItems.map(x=>({...x,remarks:'Walk-in / Non-stock Bill'}))};
      const repairs=read('gf_repairs'); repairs.unshift(bill); localStorage.setItem('gf_repairs',JSON.stringify(repairs));
      alert(`Walking Bill ${bill.id} save भयो। Stock deduct गरिएको छैन।`); close();
      // React keeps its own state, so reload makes the new local record immediately visible everywhere.
      setTimeout(()=>window.location.reload(),250);
    });
  };

  const injectNav = () => {
    const navButtons = [...document.querySelectorAll('nav button')];
    if (!navButtons.length) return;
    const marker = navButtons.find(b=>b.textContent.includes('Settings'));
    if (!marker) return;
    const add = (id,label,handler) => {
      if(document.getElementById(id)) return;
      const b=document.createElement('button'); b.id=id; b.type='button'; b.className=marker.className; b.innerHTML=`<span>${label}</span>`; b.addEventListener('click',handler); marker.parentElement.insertBefore(b,marker);
    };
    add('gf-nav-pl','📊 P&L',openPL);
    add('gf-nav-customers','👥 Customers',()=>openCustomers());
    add('gf-nav-walkin','🧾 Walking Bill',openWalkIn);
    document.getElementById('gf-pl-launcher')?.remove();
  };

  const init = () => { style(); injectNav(); setInterval(injectNav,1200); };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
