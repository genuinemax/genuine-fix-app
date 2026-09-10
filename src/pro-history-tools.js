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
    s.textContent = `.gf-history-actions{display:flex!important;flex-wrap:wrap!important;gap:7px!important;margin-top:12px!important;padding-top:10px!important;border-top:1px solid rgba(100,116,139,.22)!important}.gf-history-action{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;border:1px solid rgba(100,116,139,.45)!important;background:rgba(30,41,59,.72)!important;color:#e2e8f0!important;border-radius:10px!important;padding:7px 10px!important;font-size:11px!important;font-weight:900!important;cursor:pointer!important;min-height:36px!important;white-space:nowrap!important}.gf-history-action:hover{filter:brightness(1.18)!important}.gf-history-danger{color:#fda4af!important;border-color:rgba(244,63,94,.4)!important;background:rgba(127,29,29,.25)!important}.gf-history-print{color:#93c5fd!important}#gf-history-view-modal{position:fixed;inset:0;z-index:10000;background:rgba(2,6,23,.78);backdrop-filter:blur(7px);display:none;overflow:auto;padding:14px}#gf-history-view-modal .gf-hv-box{width:min(620px,100%);margin:4vh auto;background:#0f172a;color:#e2e8f0;border:1px solid #334155;border-radius:22px;padding:18px;box-shadow:0 30px 90px rgba(0,0,0,.55)}.gf-hv-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.gf-hv-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:14px}.gf-hv-item{padding:10px 12px;border-radius:12px;background:#111827;border:1px solid #263244}.gf-hv-label{display:block;font-size:10px;color:#94a3b8;font-weight:800;text-transform:uppercase}.gf-hv-value{display:block;margin-top:3px;font-size:13px;font-weight:800;overflow-wrap:anywhere}.gf-hv-full{grid-column:1/-1}@media(max-width:560px){.gf-history-action{flex:1 1 calc(50% - 7px)}.gf-hv-grid{grid-template-columns:1fr}.gf-hv-full{grid-column:auto}}`;
    document.head.appendChild(s);
  }
  function ensureModal() {
    if (document.getElementById('gf-history-view-modal')) return document.getElementById('gf-history-view-modal');
    const m = document.createElement('div'); m.id='gf-history-view-modal';
    m.innerHTML='<div class="gf-hv-box"><div class="gf-hv-head"><div><b style="font-size:18px">Record Details</b><div data-hv-sub style="font-size:11px;color:#94a3b8;margin-top:2px"></div></div><button type="button" data-hv-close class="gf-history-action">Close</button></div><div data-hv-grid class="gf-hv-grid"></div></div>';
    document.body.appendChild(m); m.querySelector('[data-hv-close]').onclick=()=>m.style.display='none'; m.addEventListener('click',(e)=>{if(e.target===m)m.style.display='none'}); return m;
  }
  function locate(id) { for (const type of ['repairs','devices']) { const arr=read(STORE[type]); const index=arr.findIndex(r=>String(r.id||'')===String(id)); if(index>=0)return {type,index,record:arr[index]}; } return null; }
  function showView(info) {
    const m=ensureModal(), r=info.record;
    const fields=[['ID',r.id],['Customer / Party',r.customerName||r.partyName||'—'],['Phone',r.phone||r.partyPhone||'—'],['Device / Model',r.model||r.brandModel||r.deviceType||'—'],['Status',r.status||'—'],['Total',r.totalCost!=null?`NPR ${money(r.totalCost)}`:r.sellPrice!=null?`NPR ${money(r.sellPrice)}`:'—'],['Paid',r.paidAmount!=null?`NPR ${money(r.paidAmount)}`:'—'],['Due',r.dueAmount!=null?`NPR ${money(r.dueAmount)}`:'—'],['Warranty',r.warrantyMonths||'—'],['Date',r.dateTime||r.date||'—'],['Issue / Details',r.issue||r.condition||r.notes||'—']];
    m.querySelector('[data-hv-sub]').textContent=info.type==='repairs'?'Repair / Invoice record':'Device trade record'; m.querySelector('[data-hv-grid]').innerHTML=fields.map(([a,b])=>`<div class="gf-hv-item ${a==='Issue / Details'?'gf-hv-full':''}"><span class="gf-hv-label">${esc(a)}</span><span class="gf-hv-value">${esc(b)}</span></div>`).join(''); m.style.display='block';
  }
  function edit(info) {
    if (info.type === 'repairs' && typeof window.GenuineFixEditRecord === 'function') { window.GenuineFixEditRecord('repairs', info.record.id); return; }
    const rows=[...document.querySelectorAll('table tbody tr')]; const row=rows.find(x=>(x.innerText||'').includes(String(info.record.id||''))); const btn=row?.querySelector('.gf-inline-edit-btn'); if(btn){btn.click();return;} alert('Open the record in its main list to edit it.');
  }
  function remove(info, button) {
    if (button?.dataset.gfDeleteBusy === '1') return; if (button) button.dataset.gfDeleteBusy = '1';
    const r=info.record, label=r.id||r.customerName||r.partyName||r.model||'this record';
    if(!window.confirm(`Delete ${label}?\n\nThis will permanently remove the history record from this device/browser.`)){if(button)button.dataset.gfDeleteBusy='0';return;}
    const latest=read(STORE[info.type]); const idx=latest.findIndex(x=>String(x.id||'')===String(r.id||'')); if(idx<0){alert('Record is already removed or changed.');if(button)button.dataset.gfDeleteBusy='0';return;}
    latest.splice(idx,1); write(STORE[info.type],latest);
    if (info.type === 'repairs') localStorage.setItem('gf_pending_repairs_edit', JSON.stringify(latest));
    const card=button?.closest('div.rounded-2xl'); if(card){card.style.transition='opacity .15s ease, transform .15s ease';card.style.opacity='0';card.style.transform='scale(.98)';setTimeout(()=>card.remove(),160);}
  }
  function printRecord(info) {
    const r=info.record; const w=window.open('', '_blank', 'noopener,noreferrer,width=760,height=700'); if(!w){alert('Please allow pop-ups to print the record.');return;}
    const title=esc(r.id||'Genuine Fix Record'); w.document.write(`<!doctype html><html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;padding:28px;color:#111}h1{margin:0 0 4px}p{color:#555}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.item{border:1px solid #ddd;padding:10px;border-radius:8px}.label{font-size:11px;color:#666}.value{font-weight:700;margin-top:3px}@media print{button{display:none}}</style></head><body><h1>Genuine Fix</h1><p>Record: ${title}</p><div class="grid">${[['Customer / Party',r.customerName||r.partyName],['Phone',r.phone||r.partyPhone],['Device / Model',r.model||r.brandModel||r.deviceType],['Status',r.status],['Total',r.totalCost!=null?'NPR '+money(r.totalCost):r.sellPrice!=null?'NPR '+money(r.sellPrice):'—'],['Paid',r.paidAmount!=null?'NPR '+money(r.paidAmount):'—'],['Due',r.dueAmount!=null?'NPR '+money(r.dueAmount):'—'],['Date',r.dateTime||r.date],['Warranty',r.warrantyMonths],['Details',r.issue||r.condition||r.notes]].map(([a,b])=>`<div class="item"><div class="label">${esc(a)}</div><div class="value">${esc(b||'—')}</div></div>`).join('')}</div><script>setTimeout(()=>window.print(),250)</script></body></html>`); w.document.close();
  }
  function add() {
    injectStyles();
    const cards=[...document.querySelectorAll('div.rounded-2xl')].filter(el=>{if(el.dataset.gfHistoryPro==='1')return false;const text=(el.innerText||'').trim();return text&&/\b(?:GF|ACC|SALE|DVB)-[A-Za-z0-9-]+/.test(text)&&el.querySelector('span');});
    cards.forEach(card=>{const text=(card.innerText||'').replace(/\s+/g,' ');const match=text.match(/\b(?:GF|ACC|SALE|DVB)-[A-Za-z0-9-]+/);if(!match)return;const info=locate(match[0]);if(!info)return;const actions=document.createElement('div');actions.className='gf-history-actions';
      const make=(label,cls,fn)=>{const b=document.createElement('button');b.type='button';b.className=`gf-history-action ${cls||''}`;b.textContent=label;b.onclick=(e)=>{e.preventDefault();e.stopPropagation();fn(b)};actions.appendChild(b)};
      make('View','',()=>showView(info)); make('Edit','',()=>edit(info)); make('Print','gf-history-print',()=>printRecord(info)); make('Delete','gf-history-danger',(b)=>remove(info,b)); card.appendChild(actions);card.dataset.gfHistoryPro='1';
    });
  }
  const observer=new MutationObserver(add);observer.observe(document.documentElement,{childList:true,subtree:true});setTimeout(add,500);setTimeout(add,1500);setInterval(add,2500);
})();