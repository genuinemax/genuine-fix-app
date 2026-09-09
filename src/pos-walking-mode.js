// Genuine Fix — POS Walking Customer / Non-Stock mode
(() => {
  const STYLE_ID = 'gf-pos-walking-mode-style';
  const UI_ID = 'gf-pos-walking-mode-ui';

  function styles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
      .gf-walk-mode-box{margin:14px 0 12px;padding:14px 16px;border:1px solid rgba(59,130,246,.28);border-radius:16px;background:linear-gradient(135deg,rgba(30,41,59,.92),rgba(15,23,42,.92));}
      .gf-walk-mode-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}
      .gf-walk-mode-title{font-size:13px;font-weight:900;color:#f8fafc}.gf-walk-mode-sub{font-size:11px;color:#94a3b8;margin-top:3px}
      .gf-walk-mode-select{width:100%;padding:11px 12px;border-radius:12px;border:1px solid rgba(100,116,139,.55);background:#0f172a;color:#f8fafc;font-weight:800;outline:none}
      .gf-walk-mode-select.walk{border-color:rgba(245,158,11,.55);background:rgba(120,53,15,.24);color:#fbbf24}
      .gf-walk-mode-note{display:none;margin-top:8px;padding:8px 10px;border-radius:10px;background:rgba(245,158,11,.10);color:#fbbf24;font-size:11px;font-weight:700}
      .gf-walk-mode-note.show{display:block}
    `;
    document.head.appendChild(s);
  }

  function setup(panel) {
    if (!panel || document.getElementById(UI_ID)) return;
    const items = panel.querySelector('[data-gf="items"]');
    if (!items) return;

    const box = document.createElement('div');
    box.id = UI_ID;
    box.className = 'gf-walk-mode-box';
    box.innerHTML = `
      <div class="gf-walk-mode-head">
        <div><div class="gf-walk-mode-title">Bill Type</div><div class="gf-walk-mode-sub">Choose whether this bill should use shop stock.</div></div>
      </div>
      <select class="gf-walk-mode-select" data-gf-walk-mode>
        <option value="stock">📦 Stock Sale — deduct from inventory</option>
        <option value="walking">🧾 Walking Customer / Non-Stock — do not deduct stock</option>
      </select>
      <div class="gf-walk-mode-note" data-gf-walk-note>Walking Customer / Non-Stock is active. Items on this bill will not reduce inventory.</div>
    `;
    items.parentElement?.before(box);

    const select = box.querySelector('[data-gf-walk-mode]');
    const note = box.querySelector('[data-gf-walk-note]');

    const apply = () => {
      const walking = select.value === 'walking';
      select.classList.toggle('walk', walking);
      note.classList.toggle('show', walking);
      items.querySelectorAll('.gf-final-name-wrap select').forEach(mode => {
        mode.value = walking ? 'outside' : 'stock';
        mode.dispatchEvent(new Event('change', { bubbles: true }));
      });
      items.querySelectorAll('.gf-final-name-wrap select').forEach(mode => {
        [...mode.options].forEach(o => {
          if (o.value === 'outside') o.textContent = 'Walking Customer / Non-Stock';
        });
      });
    };

    select.addEventListener('change', apply);
    items.addEventListener('DOMNodeInserted', () => setTimeout(apply, 0));
    apply();
  }

  function scan() {
    styles();
    const panel = document.getElementById('gf-final-pos-panel');
    if (panel) setup(panel);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan, { once: true });
  else scan();
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  setInterval(scan, 1000);
})();
