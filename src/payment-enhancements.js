/* Shared payment labels for existing records. */
(function(){
  const keys=['gf_repairs','gf_expenses','gf_devices_stock'];
  try{
    keys.forEach(k=>{const a=JSON.parse(localStorage.getItem(k)||'[]');a.forEach(r=>{if(r.paymentMethod===undefined)r.paymentMethod=r.paidAmount>0?'Cash':'Cash';});localStorage.setItem(k,JSON.stringify(a));});
  }catch{}
})();
