/* Genuine Fix PRO — reliable history actions */
(function () {
  const STORE = { repairs: 'gf_repairs', devices: 'gf_devices_stock' };
  const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const esc = (v) => String(v ?? '').replace(/[&<>\"]/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;' }[c]));
  const money = (v) => Number(v || 0).toLocaleString('en-IN');

  function injectStyles() {
    if (document.getElementById('gf-history-pro-style')) return;
    const s = document.createElement('style'); s.id = 'gf-history-pro-style';
    s.textContent = `.gf-history-actions{display:flex!important;flex-wrap:wrap!important;gap:7px!important;margin-top:12px!important;padding-top:10px!important;border-top:1px solid rgba(100,116,139,.22)!important}.gf-history-action{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;border:1px solid rgba(100,116,139,.45)!important;background:rgba(30,41,59,.72)!important;color:#e2e8f0!important;border-radius:10px!important;padding:7px 10px!important;font-size:11px!important;font-weight:900!important;cursor:pointer!important;min-height:36px!important;white-space:nowrap!important}.gf-history-action:hover{filter:brightness(1.18)!important}.gf-history-danger{color:#fda4af!important;border-color:rgba(244,63,94,.4)!important;background:rgba(127,29,29,.25)!important}.gf-history-print{color:#93c5fd!important}.gf-history-table-actions{display:flex!important;justify-content:flex-end!important;flex-wrap:wrap!important;gap:6px!important}.gf-history-table-actions .gf-history-action{min-height:32px!important;padding:6px 9px!important}#gf-history-view-modal{position:fixed;inset:0;z-index:10000;background:rgba(2,6,23,.78);backdrop-filter:blur(7px);display:none;overflow:auto;padding:14px}#gf-history-view-modal .gf-hv-box{width:min(700px,100%);margin:4vh auto;background:#0f172a;color:#e2e8f0;border:1px solid #334155;border-radius:22px;padding:18px;box-shadow:0 30px 90px rgba(0,0,0,.55)}.gf-hv-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.gf-hv-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:14px}.gf-hv-item{padding:10px 12px;border-radius:12px;background:#111827;border:1px solid #263244}.gf-hv-label{display:block;font-size:10px;color:#94a3b8;font-weight:800;text-transform:uppercase}.gf-hv-value{display:block;margin-top:3px;font-size:13px;font-weight:800;overflow-wrap:anywhere}.gf-hv-full{grid-column:1/-1}.gf-hv-issues{white-space:pre-wrap;line-height:1.6;font-weight:700}@media(max-width:560px){.gf-history-action{flex:1 1 calc(50% - 7px)}.gf-hv-grid{grid-template-columns:1fr}.gf-hv-full{grid-column:auto}}`;
    document.head.appendChild(s);
  }

  function ensureModal() {
    if (document.getElementById('gf-history-view-modal')) return document.getElementById('gf-history-view-modal');
    const m = document.createElement('div'); m.id='gf-history-view-modal';
    m.innerHTML='<div class="gf-hv-box"><div class="gf-hv-head"><div><b style="font-size:18px">Job Sheet Details</b><div data-hv-sub style="font-size:11px;color:#94a3b8;margin-top:2px"></div></div><button type="button" data-hv-close class="gf-history-action">Close</button></div><div data-hv-grid class="gf-hv-grid"></div></div>';
    document.body.appendChild(m);
    m.querySelector('[data-hv-close]').onclick=()=>m.style.display='none';
    m.addEventListener('click',(e)=>{if(e.target===m)m.style.display='none'});
    return m;
  }

  function locate(id) {
    for (const type of ['repairs','devices']) {
      const arr=read(STORE[type]);
      const index=arr.findIndex(r=>String(r.id||'')===String(id));
      if(index>=0)return {type,index,record:arr[index]};
    }
    return null;
  }

  function issueLines(r) {
    const issues = Array.isArray(r.issues) && r.issues.length ? r.issues : (Array.isArray(r.items) ? r.items.filter(i => String(i.name || '').trim() && String(i.name).trim() !== 'Discount') : []);
    return issues.map((i, n) => `${n + 1}. ${i.name || 'Service'} — NPR ${money(i.amount != null ? i.amount : i.price)}`).join('\n') || (r.issue || '—');
  }

  function showView(info) {
    const m=ensureModal(), r=info.record;
    const subtotal = r.subtotal != null ? r.subtotal : r.totalCost;
    const discount = r.discountAmount != null ? r.discountAmount : 0;
    const grand = r.grandTotal != null ? r.grandTotal : r.totalCost;
    const fields=[
      ['Job ID',r.id],['Customer',r.customerName||'—'],['Phone',r.phone||'—'],['Device / Model',r.model||r.deviceType||'—'],
      ['Status',r.status||'—'],['Subtotal',`NPR ${money(subtotal)}`],['Discount',discount>0?`NPR ${money(discount)}${r.discountType==='percent'?` (${money(r.discountValue)}%)`:''}`:'NPR 0'],
      ['Grand Total',`NPR ${money(grand)}`],['Paid',`NPR ${money(r.paidAmount)}`],['Due',`NPR ${money(r.dueAmount)}`],['Warranty',r.warrantyMonths||'—'],['Date',r.dateTime||r.date||'—'],
      ['Issue / Service Breakdown',issueLines(r)]
    ];
    m.querySelector('[data-hv-sub]').textContent='Repair / Job Sheet record';
    m.querySelector('[data-hv-grid]').innerHTML=fields.map(([a,b])=>`<div class="gf-hv-item ${a==='Issue / Service Breakdown'?'gf-hv-full':''}"><span class="gf-hv-label">${esc(a)}</span><span class="gf-hv-value ${a==='Issue / Service Breakdown'?'gf-hv-issues':''}">${esc(b)}</span></div>`).join('');
    m.style.display='block';
  }

  function edit(info) {
    if (info.type === 'repairs' && typeof window.GenuineFixEditRecord === 'function') { window.GenuineFixEditRecord('repairs', info.record.id); return; }
    alert('Open the record in its main list to edit it.');
  }

  function reloadOnce() {
    try {
      if(sessionStorage.getItem('gf_jobsheet_reload_lock')==='1') return;
      sessionStorage.setItem('gf_jobsheet_reload_lock','1');
    } catch {}
    window.location.reload();
  }

  function remove(info, button) {
    if (button?.dataset.gfDeleteBusy === '1') return;
    if (button) button.dataset.gfDeleteBusy = '1';
    const r=info.record, label=r.id||r.customerName||r.partyName||r.model||'this record';
    if(!window.confirm(`Delete ${label}?\n\nThis will permanently remove the history record from this device/browser.`)){if(button)button.dataset.gfDeleteBusy='0';return;}
    const latest=read(STORE[info.type]);
    const idx=latest.findIndex(x=>String(x.id||'')===String(r.id||''));
    if(idx<0){alert('Record is already removed or changed.');if(button)button.dataset.gfDeleteBusy='0';return;}
    latest.splice(idx,1); write(STORE[info.type],latest);
    if (info.type === 'repairs') localStorage.setItem('gf_pending_repairs_edit', JSON.stringify(latest));
    reloadOnce();
  }

  function printRecord(info) {
    const r=info.record; const w=window.open('', '_blank', 'noopener,noreferrer,width=760,height=700'); if(!w){alert('Please allow pop-ups to print the record.');return;}
    const title=esc(r.id||'Genuine Fix Record');
    const subtotal = r.subtotal != null ? r.subtotal : r.totalCost;
    const discount = r.discountAmount != null ? r.discountAmount : 0;
    const grand = r.grandTotal != null ? r.grandTotal : r.totalCost;
    w.document.write(`<!doctype html><html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;padding:28px;color:#111}h1{margin:0 0 4px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.item{border:1px solid #ddd;padding:10px;border-radius:8px}.label{font-size:11px;color:#666}.value{font-weight:700;margin-top:3px;white-space:pre-wrap;line-height:1.5}.full{grid-column:1/-1}</style></head><body><h1>Genuine Fix — Job Sheet</h1><p>Record: ${title}</p><div class="grid">${[['Customer',r.customerName],['Phone',r.phone],['Device / Model',r.model||r.deviceType],['Status',r.status],['Subtotal','NPR '+money(subtotal)],['Discount','NPR '+money(discount)],['Grand Total','NPR '+money(grand)],['Paid','NPR '+money(r.paidAmount)],['Due','NPR '+money(r.dueAmount)],['Warranty',r.warrantyMonths],['Date',r.dateTime||r.date],['Issue / Service Breakdown',issueLines(r)]].map(([a,b])=>`<div class="item ${a==='Issue / Service Breakdown'?'full':''}"><div class="label">${esc(a)}</div><div class="value">${esc(b||'—')}</div></div>`).join('')}</div><script>setTimeout(()=>window.print(),250)</script></body></html>`); w.document.close();
  }

  function makeButton(label,cls,fn){
    const b=document.createElement('button'); b.type='button'; b.className=`gf-history-action ${cls||''}`; b.textContent=label;
    b.onclick=(e)=>{e.preventDefault();e.stopPropagation();fn(b)}; return b;
  }

  function addTableButtons() {
    const tables=[...document.querySelectorAll('table')];
    tables.forEach(table=>{
      const headers=[...table.querySelectorAll('thead th')].map(th=>(th.innerText||'').trim().toLowerCase());
      if(!headers.some(h=>h.includes('job id'))) return;
      table.querySelectorAll('tbody tr').forEach(row=>{
        if(row.dataset.gfHistoryActions==='1') return;
        const text=(row.innerText||'').replace(/\s+/g,' ');
        const match=text.match(/\bGF-[A-Za-z0-9-]+/);
        if(!match) return;
        const info=locate(match[0]); if(!info) return;
        let cell=row.lastElementChild;
        if(!cell){cell=document.createElement('td');row.appendChild(cell);}
        cell.innerHTML=''; cell.className=(cell.className||'')+' p-4 text-right';
        const wrap=document.createElement('div'); wrap.className='gf-history-table-actions';
        wrap.appendChild(makeButton('View','',()=>showView(info)));
        wrap.appendChild(makeButton('Edit','',()=>edit(info)));
        wrap.appendChild(makeButton('Print','gf-history-print',()=>printRecord(info)));
        wrap.appendChild(makeButton('Delete','gf-history-danger',(b)=>remove(info,b)));
        cell.appendChild(wrap); row.dataset.gfHistoryActions='1';
      });
    });
  }

  function addCardButtons() {
    const cards=[...document.querySelectorAll('div.rounded-2xl, div.rounded-3xl')].filter(el=>{
      if(el.dataset.gfHistoryPro==='1')return false;
      const text=(el.innerText||'').trim();
      return text&&/\bGF-[A-Za-z0-9-]+/.test(text)&&el.querySelector('span');
    });
    cards.forEach(card=>{
      const text=(card.innerText||'').replace(/\s+/g,' '); const match=text.match(/\bGF-[A-Za-z0-9-]+/); if(!match)return;
      const info=locate(match[0]); if(!info)return;
      const actions=document.createElement('div'); actions.className='gf-history-actions';
      actions.appendChild(makeButton('View','',()=>showView(info)));
      actions.appendChild(makeButton('Edit','',()=>edit(info)));
      actions.appendChild(makeButton('Print','gf-history-print',()=>printRecord(info)));
      actions.appendChild(makeButton('Delete','gf-history-danger',(b)=>remove(info,b)));
      card.appendChild(actions); card.dataset.gfHistoryPro='1';
    });
  }

  function add(){ injectStyles(); addTableButtons(); addCardButtons(); }
  const observer=new MutationObserver(add); observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(add,300); setTimeout(add,1000); setTimeout(add,2000); setInterval(add,2500);
})();