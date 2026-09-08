// Genuine Fix — show payment method on invoice preview/print-facing bill UI.
(function () {
  const KEY = 'gf_invoice_payment_display_v1';
  const readRepairs = () => { try { return JSON.parse(localStorage.getItem('gf_repairs') || '[]'); } catch { return []; } };
  const addPaymentLine = () => {
    const modal = [...document.querySelectorAll('div.fixed.inset-0')].find(el => (el.innerText || '').includes('Invoice Preview #'));
    if (!modal || modal.dataset.gfPaymentShown === '1') return;
    const text = modal.innerText || '';
    const match = text.match(/Invoice Preview #([^\n]+)/);
    const id = match ? match[1].trim() : '';
    const inv = readRepairs().find(r => String(r.id) === id);
    if (!inv) return;
    const method = inv.paymentMethod || 'Cash';
    const payment = document.createElement('div');
    payment.className = 'flex justify-between text-blue-400 font-bold';
    payment.innerHTML = `<span>Pay By:</span><span>${String(method).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</span>`;
    const due = [...modal.querySelectorAll('span')].find(s => (s.textContent || '').trim() === 'Balance Due:');
    if (due && due.parentElement) due.parentElement.parentElement.insertBefore(payment, due.parentElement);
    else {
      const box = [...modal.querySelectorAll('div')].find(d => (d.innerText || '').includes('Balance Due:'));
      if (box) box.appendChild(payment);
    }
    modal.dataset.gfPaymentShown = '1';
  };
  const observer = new MutationObserver(addPaymentLine);
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(addPaymentLine, 300);
  setInterval(addPaymentLine, 1000);
})();
