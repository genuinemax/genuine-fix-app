/* Genuine Fix — inline editing tools */
(function () {
  const K = { repairs:'gf_repairs', expenses:'gf_expenses', inventory:'gf_inventory', devices:'gf_devices_stock' };

  try {
    const pending = localStorage.getItem('gf_pending_repairs_edit');
    if (pending) {
      localStorage.setItem('gf_repairs', pending);
      localStorage.removeItem('gf_pending_repairs_edit');
    }
    sessionStorage.removeItem('gf_jobsheet_reload_lock');
  } catch {}

  const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } };
  const write = (k,v) => localStorage.setItem(k, JSON.stringify(v));
  const esc = s => String(s ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const css=document.createElement('style');
  css.textContent=`.gf-inline-edit-btn{border:1px solid #475569!important;background:#1e293b!important;color:#e2e8f0!important;border-radius:8px!important;padding:6px 9px!important;font-size:11px!important;font-weight:800!important;cursor:pointer!important;white-space:nowrap!important}.gf-inline-edit-btn:hover{background:#334155!important}#gf-edit-modal{position:fixed;inset:0;z-index:9999;display:none;background:rgba(2,6,23,.78);backdrop-filter:blur(7px);overflow:auto;padding:14px;font-family:system-ui,sans-serif}#gf-edit-modal .box{width:min(680px,100%);margin:3vh auto;background:#0f172a;color:#e2e8f0;border:1px solid #334155;border-radius:20px;padding:18px;box-shadow:0 30px 80px rgba(0,0,0,.5)}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.grid label{font-size:11px;color:#94a3b8;font-weight:700}.grid input,.grid select,.grid textarea{width:100%;box-sizing:border-box;margin-top:5px;padding:10px;border-radius:9px;border:1px solid #475569;background:#0b1220;color:#e2e8f0}.full{grid-column:1/-1}.actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}.btn{border:1px solid #475569;background:#1e293b;color:#e2e8f0;border-radius:9px;padding:9px 13px;font-weight:800;cursor:pointer}.save{background:#2563eb;border-color:#2563eb}@media(max-width:650px){.grid{grid-template-columns:1fr}.full{grid-column:auto}}`;
  document.head.appendChild(css);
  const modal=document.createElement('div'); modal.id='gf-edit-modal';
  modal.innerHTML=`<div class="box"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:14px"><h2 data-title style="margin:0;font-size:19px">Edit record</h2><button class="btn" data-close type="button">Close</button></div><div class="grid" data-form></div><div class="actions"><button class="btn" data-cancel type="button">Cancel</button><button class="btn save" data-save type="button">Save changes</button></div></div>`;
  document.body.appendChild(modal);
  const form=modal.querySelector('[data-form]'); let current=null;
  const field=(label,key,value,type='text',full=false)=>`<label class="${full?'full':''}">${label}<input data-k="${key}" type="${type}" value="${esc(value)}"></label>`;
  const select=(label,key,value,opts)=>`<label><span>${label}</span><select data-k="${key}">${opts.map(o=>`<option ${String(o)===String(value)?'selected':''}>${esc(o)}</option>`).join('')}</select></label>`;
  function openEditor(type,id){
    const arr=read(K[type]); const index=arr.findIndex(r=>String(r.id||'')===String(id)); const r=arr[index]; if(index<0||!r)return;
    current={type,id:String(r.id||id)};
    if(type==='repairs'){
      modal.querySelector('[data-title]').textContent=`Edit Invoice / Jobsheet ${r.id||''}`;
      form.innerHTML=[field('Customer name','customerName',r.customerName),field('Phone','phone',r.phone),field('Device / model','model',r.model),field('Issue / details','issue',r.issue),field('Total amount','totalCost',r.totalCost,'number'),field('Paid amount','paidAmount',r.paidAmount,'number'),select('Status','status',r.status||'In Progress',['Received','In Progress','Ready','Delivered','Cancelled']),field('Warranty (months)','warrantyMonths',r.warrantyMonths),field('Bill type','billType',r.billType||'Repair'),field('Date / time','dateTime',r.dateTime),field('Citizenship no.','citizenshipNo',r.citizenshipNo),field('Device type','deviceType',r.deviceType),field('Remarks / issue','issueText',r.issue||'','text',true)].join('');
      form.querySelector('[data-k="issueText"]').outerHTML=`<label class="full">Remarks / issue<textarea data-k="issueText">${esc(r.issue||'')}</textarea></label>`;
    } else if(type==='expenses'){
      modal.querySelector('[data-title]').textContent='Edit Expense / Purchase'; form.innerHTML=[field('Party / Supplier name','partyName',r.partyName||r.supplierName),field('Party phone','partyPhone',r.partyPhone||r.supplierPhone),field('Description','description',r.description),field('Date','date',r.date,'date'),field('Total amount','amount',r.amount,'number'),field('Paid amount','paidAmount',r.paidAmount,'number'),field('Category','category',r.category||r.paymentType||'Other'),field('Notes','notes',r.notes)].join('');
    } else if(type==='inventory'){
      modal.querySelector('[data-title]').textContent='Edit Stock Item'; form.innerHTML=[field('Item name','name',r.name),field('Category','category',r.category),field('Stock quantity','stock',r.stock,'number'),field('Cost price','costPrice',r.costPrice,'number'),field('Selling price','price',r.price,'number'),field('Minimum stock','minStock',r.minStock,'number'),field('Supplier name','supplierName',r.supplierName),field('Supplier phone','supplierPhone',r.supplierPhone)].join('');
    } else if(type==='devices'){
      modal.querySelector('[data-title]').textContent=`Edit Device ${r.id||''}`; form.innerHTML=[field('Brand / model','brandModel',r.brandModel),field('IMEI / Serial','imeiOrSerial',r.imeiOrSerial),field('Party name','partyName',r.partyName),field('Party phone','partyPhone',r.partyPhone),field('Buy price','buyPrice',r.buyPrice,'number'),field('Sell price','sellPrice',r.sellPrice,'number'),field('Condition','condition',r.condition),select('Status','status',r.status||'In Stock',['In Stock','Sold','Reserved','Returned']),field('Date','date',r.date,'date')].join('');
    }
    modal.style.display='block';
  }
  window.GenuineFixEditRecord = openEditor;
  function close(){modal.style.display='none';current=null;form.innerHTML='';}
  function saveCurrent(){
    if(!current)return;
    const arr=read(K[current.type]); const index=arr.findIndex(r=>String(r.id||'')===String(current.id)); if(index<0){alert('This Jobsheet was changed or removed.');return;}
    const r={...arr[index]}; form.querySelectorAll('[data-k]').forEach(el=>{const k=el.dataset.k;if(!k)return;if(k==='issueText')r.issue=el.value;else r[k]=el.type==='number'?(Number(el.value)||0):el.value;});
    if(current.type==='repairs'){if(Number(r.paidAmount||0)>Number(r.totalCost||0)){alert('Paid amount cannot exceed total amount.');return;}r.dueAmount=Math.max(0,Number(r.totalCost||0)-Number(r.paidAmount||0));}
    if(current.type==='expenses'){if(Number(r.paidAmount||0)>Number(r.amount||0)){alert('Paid amount cannot exceed total amount.');return;}r.totalAmount=Number(r.amount||0);r.dueAmount=Math.max(0,Number(r.amount||0)-Number(r.paidAmount||0));if(r.partyName!==undefined)r.supplierName=r.partyName;if(r.partyPhone!==undefined)r.supplierPhone=r.partyPhone;}
    arr[index]=r; write(K[current.type],arr);
    if(current.type==='repairs') localStorage.setItem('gf_pending_repairs_edit',JSON.stringify(arr));
    close();
    try { if(sessionStorage.getItem('gf_jobsheet_reload_lock')==='1') return; sessionStorage.setItem('gf_jobsheet_reload_lock','1'); } catch {}
    window.location.reload();
  }
  modal.querySelector('[data-close]').onclick=close;modal.querySelector('[data-cancel]').onclick=close;modal.querySelector('[data-save]').onclick=saveCurrent;modal.addEventListener('click',e=>{if(e.target===modal)close();});

  function isJobSheetHistoryTable(table){
    const headers=[...table.querySelectorAll('thead th')].map(th=>(th.innerText||th.textContent||'').replace(/\s+/g,' ').trim().toLowerCase());
    return headers.some(h=>h.includes('job id'));
  }

  // Job Sheet History is React-owned. Keep only its canonical Delete action
  // and strip any legacy/injected duplicate Delete controls.
  function cleanJobSheetHistoryRows(){
    document.querySelectorAll('table').forEach(table=>{
      if(!isJobSheetHistoryTable(table)) return;
      table.querySelectorAll('tbody tr').forEach(row=>{
        row.querySelectorAll('.gf-history-inline-actions').forEach(el=>el.remove());
        row.querySelectorAll('.gf-inline-edit-btn').forEach(btn=>btn.closest('td')?.remove());

        const deleteButtons=[...row.querySelectorAll('button')].filter(btn=>/\bdelete\b/i.test((btn.innerText||btn.textContent||'').trim()) && btn.dataset.gfNativeJobsheetDelete!=='1');
        deleteButtons.forEach(btn=>{
          const cell=btn.closest('td');
          btn.remove();
          if(cell && !cell.textContent.trim() && !cell.querySelector('button,svg,input,select,a')) cell.remove();
        });
      });
    });
  }

  function addButtons(){
    document.querySelectorAll('table').forEach(table=>{
      if(isJobSheetHistoryTable(table)) return;
      table.querySelectorAll('tbody tr').forEach(row=>{
        if(row.dataset.gfEditAdded==='1')return;const info=rowInfo(row);if(!info)return;const cell=document.createElement('td');cell.style.cssText='white-space:nowrap;padding:6px';const b=document.createElement('button');b.type='button';b.className='gf-inline-edit-btn';b.textContent='Edit';b.onclick=()=>openEditor(info.type,info.id);cell.appendChild(b);row.appendChild(cell);row.dataset.gfEditAdded='1';
      });
    });
    cleanJobSheetHistoryRows();
  }

  function rowInfo(row){const text=(row.innerText||row.textContent||'').replace(/\s+/g,' ').trim();for(const type of Object.keys(K)){const arr=read(K[type]);const hit=arr.find(r=>{const id=String(r.id||'');return id&&text.includes(id);});if(hit)return {type,id:String(hit.id)};}return null;}

  const observer=new MutationObserver(addButtons);observer.observe(document.body,{childList:true,subtree:true});window.addEventListener('load',addButtons);setTimeout(addButtons,500);setTimeout(addButtons,1500);setInterval(addButtons,2500);
})();