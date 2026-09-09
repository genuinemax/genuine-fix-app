// Genuine Fix — business navigation and POS UI polish
(() => {
  const STYLE_ID='gf-business-tools-style-v2';
  function injectStyles(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      #gf-pl-launcher{display:none!important}
      .gf-pos-mode-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:14px;padding:12px 14px;border:1px solid rgba(96,165,250,.22);border-radius:16px;background:rgba(30,41,59,.52)}
      .gf-pos-mode-copy{min-width:0}.gf-pos-mode-title{font-size:12px;font-weight:900;color:#f8fafc}.gf-pos-mode-sub{font-size:11px;color:#94a3b8;margin-top:3px}
      .gf-pos-mode-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.gf-pos-mode-btn{border:1px solid rgba(100,116,139,.5);background:#1e293b;color:#cbd5e1;border-radius:10px;padding:8px 11px;font-size:11px;font-weight:900;cursor:pointer;white-space:nowrap}.gf-pos-mode-btn:hover{filter:brightness(1.12)}.gf-pos-mode-btn.active{background:#2563eb;border-color:#2563eb;color:#fff;box-shadow:0 5px 16px rgba(37,99,235,.22)}.gf-pos-mode-btn.walkin.active{background:#b45309;border-color:#b45309;color:#fff;box-shadow:0 5px 16px rgba(180,83,9,.2)}
      .gf-pos-walkin-note{display:none;margin-top:9px;padding:9px 11px;border-radius:11px;background:rgba(180,83,9,.10);border:1px solid rgba(245,158,11,.2);color:#fbbf24;font-size:11px;font-weight:700}.gf-pos-walkin-note.show{display:block}
      @media(max-width:700px){.gf-pos-mode-bar{align-items:flex-start;flex-direction:column}.gf-pos-mode-actions{width:100%;justify-content:flex-start}.gf-pos-mode-btn{flex:1 1 auto}}
    `;document.head.appendChild(s);
  }
  function hideDuplicateWalkingUI(){
    document.querySelectorAll('body *').forEach(el=>{
      if(el.closest('#gf-final-pos-panel')||el.id==='gf-pl-launcher') return;
      const text=(el.innerText||'').replace(/\s+/g,' ').trim();if(!text||text.length>180)return;
      if(/Walking Customer\s*\/\s*Non-Stock|Create Non-Stock Bill/i.test(text)){
        const parent=el.parentElement;const pt=(parent?.innerText||'').replace(/\s+/g,' ').trim();
        if(parent&&/Walking Customer\s*\/\s*Non-Stock|Create Non-Stock Bill/i.test(pt)&&(parent.children.length<=4||el.tagName==='BUTTON')) el.style.display='none';
      }
    });
    document.querySelectorAll('#gf-accessories-walkin,.gf-biz-modal-backdrop').forEach(el=>el.remove());
  }
  function ensureNav(){
    const nav=[...document.querySelectorAll('nav button')];if(!nav.length)return;const marker=nav.find(b=>/Settings/i.test(b.textContent||''));if(!marker)return;
    if(!document.getElementById('gf-nav-pl')){const b=document.createElement('button');b.id='gf-nav-pl';b.type='button';b.className=marker.className;b.innerHTML='<span>📊 P&L</span>';b.addEventListener('click',()=>{const launcher=document.getElementById('gf-pl-launcher');if(launcher)launcher.click()});marker.parentElement.insertBefore(b,marker)}
  }
  function ensurePosWalkingMode(){
    const panel=document.getElementById('gf-final-pos-panel');if(!panel||panel.dataset.gfWalkingUi==='1')return;panel.dataset.gfWalkingUi='1';
    const bar=document.createElement('div');bar.className='gf-pos-mode-bar';bar.innerHTML='<div class="gf-pos-mode-copy"><div class="gf-pos-mode-title">Sale Mode</div><div class="gf-pos-mode-sub">Choose how this POS bill should handle stock.</div></div><div class="gf-pos-mode-actions"><button type="button" class="gf-pos-mode-btn active" data-mode="stock">📦 Stock Sale</button><button type="button" class="gf-pos-mode-btn walkin" data-mode="walkin">🧾 Walking Customer · Non-Stock</button></div>';
    const note=document.createElement('div');note.className='gf-pos-walkin-note';note.textContent='Walking Customer mode: inventory will NOT be deducted. Use this for outside/non-stock sales.';
    const items=panel.querySelector('[data-gf="items"]');if(items?.parentElement)items.parentElement.before(bar,note);
    const setMode=(mode)=>{const selects=[...panel.querySelectorAll('[data-gf="items"] .gf-final-name-wrap select')];selects.forEach(sel=>{sel.value=mode==='walkin'?'outside':'stock';sel.dispatchEvent(new Event('change',{bubbles:true}))});bar.querySelectorAll('.gf-pos-mode-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));note.classList.toggle('show',mode==='walkin')};
    bar.querySelector('[data-mode="stock"]').addEventListener('click',()=>setMode('stock'));bar.querySelector('[data-mode="walkin"]').addEventListener('click',()=>setMode('walkin'));
    panel.querySelectorAll('select').forEach(sel=>[...sel.options].forEach(opt=>{if(opt.value==='outside')opt.textContent='Walking Customer / Non-Stock'}));
  }
  function init(){injectStyles();ensureNav();hideDuplicateWalkingUI();ensurePosWalkingMode()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  new MutationObserver(init).observe(document.documentElement,{childList:true,subtree:true});setInterval(init,1500);
})();
