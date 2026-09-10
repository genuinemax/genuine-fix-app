// Genuine Fix Job Sheet — multi-issue pricing enhancement.
// Keeps the existing React form/state intact, while adding issue rows and
// persisting the richer issue breakdown into the same gf_repairs records.

const ISSUE_PRESETS = [
  { name: 'Screen / Display Problem', amount: 0 },
  { name: 'Battery Problem', amount: 0 },
  { name: 'Keyboard Problem', amount: 0 },
  { name: 'Charging Problem', amount: 0 },
  { name: 'Power / No Power', amount: 0 },
  { name: 'Software / Windows Install', amount: 0 },
  { name: 'Virus / Malware Removal', amount: 0 },
  { name: 'Data Recovery / Backup', amount: 0 },
  { name: 'SSD / HDD Replacement', amount: 0 },
  { name: 'RAM Upgrade / Repair', amount: 0 },
  { name: 'Motherboard Repair', amount: 0 },
  { name: 'IC / Chip Level Repair', amount: 0 },
  { name: 'Camera Problem', amount: 0 },
  { name: 'Speaker / Mic Problem', amount: 0 },
  { name: 'Network / Signal Problem', amount: 0 },
  { name: 'iCloud / Network Unlock', amount: 0 },
  { name: 'Water / Liquid Damage', amount: 0 },
  { name: 'General Servicing / Cleaning', amount: 0 },
];

const money = value => Math.max(0, Number(value || 0));

function setReactInputValue(input, value) {
  if (!input) return;
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  if (setter) setter.call(input, String(value ?? ''));
  else input.value = String(value ?? '');
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function findJobForm() {
  const heading = [...document.querySelectorAll('h2')].find(el => /Create Repair \/ Unlocking Job Sheet/i.test(el.textContent || ''));
  return heading?.parentElement?.querySelector('form');
}

function issueSummary(issues) {
  return issues.filter(i => String(i.name || '').trim()).map(i => String(i.name).trim()).join(', ');
}

function installJobSheetEnhancer() {
  const form = findJobForm();
  if (!form || form.dataset.gfIssueBuilder === '1') return;
  form.dataset.gfIssueBuilder = '1';

  const card = document.createElement('div');
  card.className = 'md:col-span-3 rounded-2xl border border-slate-700 bg-slate-900/40 p-4 space-y-4';
  card.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <div class="text-sm font-black text-white">Issue List & Pricing</div>
        <div class="text-xs text-slate-400 mt-1">Add multiple issues for one device. Each issue can have its own amount.</div>
      </div>
      <button type="button" data-gf-add-issue class="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black">+ Add Issue</button>
    </div>
    <div data-gf-issues class="space-y-2"></div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-700/70">
      <div class="rounded-xl border border-slate-700 bg-slate-950/40 p-3">
        <div class="text-[11px] uppercase tracking-wide font-black text-slate-500">Subtotal</div>
        <div data-gf-subtotal class="text-lg font-black text-white mt-1">NPR 0</div>
      </div>
      <div class="rounded-xl border border-slate-700 bg-slate-950/40 p-3">
        <div class="flex items-center justify-between gap-2">
          <div class="text-[11px] uppercase tracking-wide font-black text-slate-500">Discount</div>
          <select data-gf-discount-type class="bg-transparent border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-slate-200 outline-none">
            <option value="amount">NPR</option>
            <option value="percent">%</option>
          </select>
        </div>
        <input data-gf-discount-value type="number" min="0" step="0.01" value="0" placeholder="Discount" class="w-full mt-2 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm outline-none" />
      </div>
      <div class="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3">
        <div class="text-[11px] uppercase tracking-wide font-black text-blue-300">Grand Total</div>
        <div data-gf-grand-total class="text-xl font-black text-blue-300 mt-1">NPR 0</div>
      </div>
    </div>
  `;

  // Insert before the photo section, if present; otherwise before submit.
  const photoBlock = [...form.children].find(el => (el.textContent || '').includes('Customer Photo (Optional)'));
  const submit = form.querySelector('button[type="submit"]');
  if (photoBlock) form.insertBefore(card, photoBlock);
  else if (submit) form.insertBefore(card, submit);
  else form.appendChild(card);

  const issueHost = card.querySelector('[data-gf-issues]');
  const subtotalEl = card.querySelector('[data-gf-subtotal]');
  const grandEl = card.querySelector('[data-gf-grand-total]');
  const discountType = card.querySelector('[data-gf-discount-type]');
  const discountValue = card.querySelector('[data-gf-discount-value]');
  const addButton = card.querySelector('[data-gf-add-issue]');
  const state = { issues: [{ name: '', amount: '' }] };

  const render = () => {
    issueHost.innerHTML = '';
    state.issues.forEach((issue, index) => {
      const row = document.createElement('div');
      row.className = 'grid grid-cols-1 md:grid-cols-12 gap-2 items-center';
      row.innerHTML = `
        <select data-issue-preset class="md:col-span-5 p-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white outline-none">
          <option value="">Select issue from list...</option>
          ${ISSUE_PRESETS.map(p => `<option value="${p.name.replace(/"/g, '&quot;')}">${p.name}</option>`).join('')}
          <option value="__manual__">✎ Manual Issue</option>
        </select>
        <input data-issue-name type="text" placeholder="Manual issue / service name" value="${String(issue.name || '').replace(/"/g, '&quot;')}" class="md:col-span-4 p-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white outline-none" />
        <input data-issue-amount type="number" min="0" step="0.01" placeholder="Amount (NPR)" value="${issue.amount ?? ''}" class="md:col-span-2 p-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white outline-none" />
        <button type="button" data-remove-issue class="md:col-span-1 p-3 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 flex items-center justify-center" title="Remove issue">×</button>
      `;
      const preset = row.querySelector('[data-issue-preset]');
      const name = row.querySelector('[data-issue-name]');
      const amount = row.querySelector('[data-issue-amount]');
      preset.value = ISSUE_PRESETS.some(p => p.name === issue.name) ? issue.name : (issue.name ? '__manual__' : '');
      name.value = issue.name || '';
      name.style.display = preset.value === '__manual__' || !preset.value ? '' : 'none';
      preset.addEventListener('change', () => {
        if (preset.value === '__manual__' || !preset.value) {
          name.style.display = '';
          if (preset.value === '__manual__') name.focus();
        } else {
          name.style.display = 'none';
          state.issues[index].name = preset.value;
          if (!state.issues[index].amount) {
            state.issues[index].amount = '';
            amount.value = '';
          }
        }
        calculate();
      });
      name.addEventListener('input', () => { state.issues[index].name = name.value; calculate(); });
      amount.addEventListener('input', () => { state.issues[index].amount = amount.value; calculate(); });
      row.querySelector('[data-remove-issue]').addEventListener('click', () => {
        if (state.issues.length === 1) state.issues[0] = { name: '', amount: '' };
        else state.issues.splice(index, 1);
        render();
        calculate();
      });
      issueHost.appendChild(row);
    });
  };

  const calculate = () => {
    const subtotal = state.issues.reduce((sum, issue) => sum + money(issue.amount), 0);
    const rawDiscount = money(discountValue.value);
    const discountAmount = discountType.value === 'percent'
      ? Math.min(subtotal, subtotal * Math.min(100, rawDiscount) / 100)
      : Math.min(subtotal, rawDiscount);
    const grandTotal = Math.max(0, subtotal - discountAmount);
    subtotalEl.textContent = `NPR ${subtotal.toLocaleString()}`;
    grandEl.textContent = `NPR ${grandTotal.toLocaleString()}`;

    // Keep the existing React-controlled fields synchronized.
    const inputs = [...form.querySelectorAll('input')];
    const totalInput = inputs.find(i => i.placeholder === 'Total Cost (NPR)');
    const issueInput = inputs.find(i => i.placeholder === 'Issue / Details (Optional)');
    if (totalInput) setReactInputValue(totalInput, grandTotal);
    if (issueInput) setReactInputValue(issueInput, issueSummary(state.issues) || '');
  };

  addButton.addEventListener('click', () => {
    state.issues.push({ name: '', amount: '' });
    render();
    calculate();
    const rows = issueHost.querySelectorAll('[data-issue-name]');
    rows[rows.length - 1]?.focus();
  });
  discountValue.addEventListener('input', calculate);
  discountType.addEventListener('change', calculate);

  form.addEventListener('submit', () => {
    calculate();
    // Let React's existing submit handler create the record, then enrich the
    // newly saved record with the issue breakdown and discount metadata.
    setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem('gf_repairs') || '[]');
        if (!Array.isArray(saved) || !saved.length) return;
        const validIssues = state.issues
          .map(i => ({ name: String(i.name || '').trim(), amount: money(i.amount), qty: 1 }))
          .filter(i => i.name);
        const subtotal = validIssues.reduce((sum, i) => sum + i.amount, 0);
        const rawDiscount = money(discountValue.value);
        const discountAmount = discountType.value === 'percent'
          ? Math.min(subtotal, subtotal * Math.min(100, rawDiscount) / 100)
          : Math.min(subtotal, rawDiscount);
        const grandTotal = Math.max(0, subtotal - discountAmount);
        const paidInput = [...form.querySelectorAll('input')].find(i => i.placeholder === 'Paid Amount (NPR)');
        const paid = money(paidInput?.value);
        const target = saved.find(r => r.billType === 'Repair' && String(r.dateTime || '').startsWith(new Date().toISOString().slice(0,10))) || saved[0];
        if (!target) return;
        target.subtotal = subtotal;
        target.discountType = discountType.value;
        target.discountValue = rawDiscount;
        target.discountAmount = discountAmount;
        target.grandTotal = grandTotal;
        target.totalCost = grandTotal;
        target.paidAmount = Math.min(paid, grandTotal);
        target.dueAmount = Math.max(0, grandTotal - target.paidAmount);
        target.issues = validIssues;
        target.items = validIssues.map(i => ({ name: i.name, price: i.amount, qty: 1, remarks: 'Job Sheet Issue' }));
        localStorage.setItem('gf_repairs', JSON.stringify(saved));
        window.location.reload();
      } catch (error) {
        console.warn('Genuine Fix issue pricing save failed:', error);
      }
    }, 250);
  }, true);

  render();
  calculate();
}

function boot() {
  installJobSheetEnhancer();
  const observer = new MutationObserver(() => installJobSheetEnhancer());
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 15000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
