/* Genuine Fix — inline editing tools
 * No floating Pro/Tools icons. Adds Edit buttons directly to data rows.
 * Updates the existing localStorage records and reloads the app so React
 * re-reads the edited data safely.
 */
(function () {
  const K = {
    repairs: 'gf_repairs',
    expenses: 'gf_expenses',
    inventory: 'gf_inventory',
    devices: 'gf_devices_stock',
    purchases: 'gf_stock_purchases'
  };
  const read = (k, d=[]) => { try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(d)); } catch { return d; } };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const esc = s => String(s ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));

  const style = document.createElement('style');
  style.textContent = `
    .gf-inline-edit-btn{border:1px solid #475569!important;background:#1e293b!important;color:#e2e8f0!important;border-radius:8px!important;padding:6px 9px!important;font-size:11px!important;font-weight:800!important;cursor:pointer!important;white-space:nowrap!important}
    .gf-inline-edit-btn:hover{background:#334155!important}
    #gf-edit-modal{position:fixed;inset:0;z-index:9999;display:none;background:rgba(2,6,23,.78);backdrop-filter:blur(7px);overflow:auto;padding:14px;font-family:system-ui,sans-serif}
    #gf-edit-modal .gf-edit-box{width:min(680px,100%);margin:3vh auto;background:#0f172a;color:#e2e8f0;border:1px solid #334155;border-radius:20px;padding:18px;box-shadow:0 30px 80px rgba(0,0,0,.5)}
    #gf-edit-modal .gf-edit-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:14px}
    #gf-edit-modal h2{margin:0;font-size:19px}
    .gf-edit-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .gf-edit-grid label{font-size:11px;color:#94a3b8;font-weight:700}
    .gf-edit-grid input,.gf-edit-grid select,.gf-edit-grid textarea{width:100%;box-sizing:border-box;margin-top:5px;padding:10px;border-radius:9px;border:1px solid #475569;background:#0b1220;color:#e2e8f0}
    .gf-edit-grid textarea{min-height:72px;resize:vertical}.gf-edit-full{grid-column:1/-1}
    .gf-edit-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}.gf-edit-btn{border:1px solid #475569;background:#1e293b;color:#e2e8f0;border-radius:9px;padding:9px 13px;font-weight:800;cursor:pointer}.gf-edit-save{background:#2563eb;border-color:#2563eb}
    @media(max-width:650px){.gf-edit-grid{grid-template-columns:1fr}.gf-edit-full{grid-column:auto}}
  `;
  document.head.appendChild(style);

  const modal = document.createElement('div');
  modal.id = 'gf-edit-modal';
  modal.innerHTML = `<div class="gf-edit-box"><div class="gf-edit-head"><h2 data-title>Edit record</h2><button class="gf-edit-btn" data-close type="button">Close</button></div><div class="gf-edit-grid" data-form></div><div class="gf-edit-actions"><button class="gf-edit-btn" data-cancel type="button">Cancel</button><button class="gf-edit-btn gf-edit-save" data-save type="button">Save changes</button></div></div>`;
  document.body.appendChild(modal);
  const form = modal.querySelector('[data-form]');
  let current = null;

  const field = (label, key, value, type='text', full=false) => `<label class="${full?'gf-edit-full':''}">${label}<input data-k="${key}" type="${type}" value="${esc(value)}"></label>`;
  const select = (label,key,value,opts) => `<label>${label}<select data-k="${key}">${opts.map(o=>`<option ${String(o)===String(value)?'selected':''}>${esc(o)}</option>`).join('')}</select></label>`;

  function openEditor(type, index) {
    let arr = read(K[type], []);
    const r = arr[index];
    if (!r) return;
    current = {type,index};
    if (type === 'repairs') {
      modal.querySelector('[data-title]').textContent = `Edit Invoice / Jobsheet ${r.id || ''}`;
      form.innerHTML = [
        field('Customer name','customerName',r.customerName), field('Phone','phone',r.phone),
        field('Device / model','model',r.model), field('Issue / details','issue',r.issue),
        field('Total amount','totalCost',r.totalCost,'number'), field('Paid amount','paidAmount',r.paidAmount,'number'),
        select('Status','status',r.status || 'In Progress',['Received','In Progress','Ready','Delivered','Cancelled']),
        field('Warranty (months)','warrantyMonths',r.warrantyMonths),
        field('Bill type','billType',r.billType || 'Repair'), field('Date / time','dateTime',r.dateTime),
        field('Citizenship no.','citizenshipNo',r.citizenshipNo), field('Device type','deviceType',r.deviceType),
        `<label class="gf-edit-full">Remarks / issue<textarea data-k="issue">${esc(r.issue || '')}</textarea></label>`
      ].join('');
    } else if (type === 'expenses') {
      modal.querySelector('[data-title]').textContent = 'Edit Expense / Purchase';
      form.innerHTML = [field('Party / Supplier name','partyName',r.partyName || r.supplierName),field('Party phone','partyPhone',r.partyPhone || r.supplierPhone),field('Description','description',r.description),field('Date','date',r.date,'date'),field('Total amount','amount',r.amount,'number'),field('Paid amount','paidAmount',r.paidAmount,'number'),field('Category','category',r.category || r.paymentType || 'Other'),field('Notes','notes',r.notes)].join('');
    } else if (type === 'inventory') {
      modal.querySelector('[data-title]').textContent = 'Edit Stock Item';
      form.innerHTML = [field('Item name','name',r.name),field('Category','category',r.category),field('Stock quantity','stock',r.stock,'number'),field('Cost price','costPrice',r.costPrice,'number'),field('Selling price','price',r.price,'number'),field('Minimum stock','minStock',r.minStock,'number'),field('Supplier name','supplierName',r.supplierName),field('Supplier phone','supplierPhone',r.supplierPhone)].join('');
    } else if (type === 'devices') {
      modal.querySelector('[data-title]').textContent = `Edit Device ${r.id || ''}`;
      form.innerHTML = [field('Brand / model','brandModel',r.brandModel),field('IMEI / Serial','imeiOrSerial',r.imeiOrSerial),field('Party name','partyName',r.partyName),field('Party phone','partyPhone',r.partyPhone),field('Buy price','buyPrice',r.buyPrice,'number'),field('Sell price','sellPrice',r.sellPrice,'number'),field('Condition','condition',r.condition),select('Status','status',r.status || 'In Stock',['In Stock','Sold','Reserved','Returned']),field('Date','date',r.date,'date')].join('');
    }
    modal.style.display='block';
  }

  function close(){modal.style.display='none';current=null;form.innerHTML='';}
  function saveCurrent(){
    if(!current) return;
    const arr=read(K[current.type],[]), r={...arr[current.index]};
    form.querySelectorAll('[data-k]').forEach(el=>{ const k=el.dataset.k; if(k) r[k]=el.type==='number' ? (Number(el.value)||0) : el.value; });
    if(current.type==='repairs'){
      r.dueAmount=Math.max(0,Number(r.totalCost||0)-Number(r.paidAmount||0));
      if(Number(r.paidAmount||0)>Number(r.totalCost||0)){alert('Paid amount cannot exceed total amount.');return;}
    }
    if(current.type==='expenses'){
      r.totalAmount=Number(r.amount||0);r.dueAmount=Math.max(0,Number(r.amount||0)-Number(r.paidAmount||0));
      if(r.partyName!==undefined){r.supplierName=r.partyName;} if(r.partyPhone!==undefined){r.supplierPhone=r.partyPhone;}
      if(Number(r.paidAmount||0)>Number(r.amount||0)){alert('Paid amount cannot exceed total amount.');return;}
    }
    arr[current.index]=r;save(K[current.type],arr);close();location.reload();
  }

  modal.querySelector('[data-close]').onclick=close;modal.querySelector('[data-cancel]').onclick=close;modal.querySelector('[data-save]').onclick=saveCurrent;modal.addEventListener('click',e=>{if(e.target===modal)close();});

  function textOf(row){return (row.innerText||row.textContent||'').replace(/\s+/g,' ').trim();}
  function findIndex(type,row){
    const text=textOf(row), arr=read(K[type],[]);
    return arr.findIndex(r=>{
      const id=String(r.id||'');
      if(id && text.includes(id)) return true;
      const name=String(r.customerName||r.partyName||r.supplierName||r.name||r.brandModel||'');
      const model=String(r.model||r.brandModel||r.description||'');
      return name && text.includes(name) && (!model || text.includes(model));
    });
  }

  function addButtons(){
    document.querySelectorAll('table tbody tr').forEach(row=>{
      if(row.dataset.gfEditAdded==='1') return;
      const text=textOf(row); if(!text) return;
      let type=null,index=-1;
      const candidates=[['repairs',['GF-','SALE-','Invoice','Repair','Jobsheet']],['inventory',['Stock','Inventory']],['devices',['DEV-','Device']],['expenses',['Expense','Purchase','Payable']]];
      // Prefer an exact ID match because IDs are unique.
      for(const [t,keys] of candidates){const arr=read(K[t],[]);const i=arr.findIndex(r=>{const id=String(r.id||'');return id && text.includes(id);});if(i>=0){type=t;index=i;break;}}
      if(!type){
        // Match common customer/description rows when no ID is displayed.
        for(const t of ['repairs','inventory','devices','expenses']){const i=findIndex(t,row);if(i>=0){type=t;index=i;break;}}
      }
      if(!type || index<0) return;
      const cell=document.createElement('td');cell.style.cssText='white-space:nowrap;padding:6px;';
      const b=document.createElement('button');b.type='button';b.className='gf-inline-edit-btn';b.textContent='Edit';b.onclick=()=>openEditor(type,index);cell.appendChild(b);row.appendChild(cell);row.dataset.gfEditAdded='1';
    });
  }
  const observer=new MutationObserver(()=>addButtons());observer.observe(document.body,{childList:true,subtree:true});
  setTimeout(addButtons,800);setTimeout(addButtons,2000);setInterval(addButtons,2500);
})();
