// Modern replacement for the browser's native alert() popup.
// Keeps existing business logic untouched while giving Genuine Fix a premium UI.
(() => {
  if (typeof window === 'undefined') return;

  const STYLE_ID = 'gf-modern-alert-style';
  const ROOT_ID = 'gf-modern-alert-root';

  const ensureStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID} {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: rgba(2, 6, 23, .72);
        backdrop-filter: blur(9px);
        -webkit-backdrop-filter: blur(9px);
      }
      #${ROOT_ID}.gf-show { display: flex; }
      .gf-alert-card {
        width: min(430px, calc(100vw - 32px));
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(96, 165, 250, .42);
        border-radius: 26px;
        padding: 30px 30px 26px;
        text-align: center;
        color: #f8fafc;
        background:
          radial-gradient(circle at 50% 0%, rgba(37, 99, 235, .24), transparent 45%),
          linear-gradient(145deg, rgba(15, 23, 42, .98), rgba(7, 18, 38, .98));
        box-shadow: 0 30px 90px rgba(0,0,0,.58), 0 0 55px rgba(37,99,235,.16);
        animation: gfAlertIn .22s cubic-bezier(.2,.8,.2,1);
      }
      .gf-alert-card::before {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        border-radius: inherit;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.09);
      }
      .gf-alert-close {
        position: absolute;
        top: 13px;
        right: 13px;
        width: 34px;
        height: 34px;
        border: 0;
        border-radius: 50%;
        color: #94a3b8;
        background: rgba(148,163,184,.08);
        cursor: pointer;
        font-size: 22px;
        line-height: 1;
        transition: .18s ease;
      }
      .gf-alert-close:hover { color: #fff; background: rgba(148,163,184,.17); transform: rotate(90deg); }
      .gf-alert-icon {
        width: 82px;
        height: 82px;
        margin: 4px auto 20px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        font-size: 39px;
        font-weight: 800;
        color: #fff;
        background: rgba(16,185,129,.15);
        border: 1px solid rgba(52,211,153,.42);
        box-shadow: 0 0 0 11px rgba(16,185,129,.07), 0 0 42px rgba(16,185,129,.22);
      }
      .gf-alert-icon.gf-warning {
        color: #fbbf24;
        background: rgba(245,158,11,.12);
        border-color: rgba(251,191,36,.38);
        box-shadow: 0 0 0 11px rgba(245,158,11,.06), 0 0 42px rgba(245,158,11,.16);
      }
      .gf-alert-title {
        margin: 0;
        font-size: 25px;
        line-height: 1.2;
        font-weight: 800;
        letter-spacing: -.02em;
      }
      .gf-alert-title .gf-success-word { color: #34d399; }
      .gf-alert-message {
        margin: 11px auto 0;
        max-width: 350px;
        color: #94a3b8;
        font-size: 15px;
        line-height: 1.55;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }
      .gf-alert-divider {
        height: 1px;
        margin: 22px 0 17px;
        background: linear-gradient(90deg, transparent, rgba(148,163,184,.18), transparent);
      }
      .gf-alert-ok {
        width: min(240px, 100%);
        min-height: 48px;
        border: 0;
        border-radius: 999px;
        cursor: pointer;
        color: #fff;
        font-size: 15px;
        font-weight: 800;
        letter-spacing: .01em;
        background: linear-gradient(135deg, #10b981, #06b6d4);
        box-shadow: 0 10px 30px rgba(16,185,129,.22);
        transition: transform .18s ease, box-shadow .18s ease;
      }
      .gf-alert-ok:hover { transform: translateY(-2px); box-shadow: 0 14px 35px rgba(16,185,129,.3); }
      .gf-alert-ok:active { transform: translateY(0); }
      @keyframes gfAlertIn {
        from { opacity: 0; transform: translateY(12px) scale(.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @media (max-width: 520px) {
        .gf-alert-card { padding: 27px 20px 22px; border-radius: 22px; }
        .gf-alert-title { font-size: 22px; }
      }
    `;
    document.head.appendChild(style);
  };

  const getRoot = () => {
    let root = document.getElementById(ROOT_ID);
    if (root) return root;
    root = document.createElement('div');
    root.id = ROOT_ID;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    document.body.appendChild(root);
    return root;
  };

  const showModernAlert = (message) => {
    ensureStyles();
    const root = getRoot();
    const text = String(message ?? '');
    const lower = text.toLowerCase();
    const success = /saved|success|updated|restored|completed|created|added|removed successfully|deleted successfully/.test(lower);

    root.innerHTML = `
      <div class="gf-alert-card" tabindex="-1">
        <button class="gf-alert-close" type="button" aria-label="Close">×</button>
        <div class="gf-alert-icon ${success ? '' : 'gf-warning'}">${success ? '✓' : '!'}</div>
        <h2 class="gf-alert-title">${success ? 'Data Saved <span class="gf-success-word">Successfully!</span>' : 'Please Check'}</h2>
        <div class="gf-alert-message"></div>
        <div class="gf-alert-divider"></div>
        <button class="gf-alert-ok" type="button">✓ &nbsp; OK</button>
      </div>
    `;

    root.querySelector('.gf-alert-message').textContent = text;
    root.classList.add('gf-show');
    root.querySelector('.gf-alert-card').focus();

    const close = () => {
      root.classList.remove('gf-show');
      root.innerHTML = '';
    };

    root.querySelector('.gf-alert-ok').addEventListener('click', close);
    root.querySelector('.gf-alert-close').addEventListener('click', close);
    root.addEventListener('click', (event) => {
      if (event.target === root) close();
    }, { once: true });

    const onKey = (event) => {
      if (event.key === 'Escape' || event.key === 'Enter') {
        close();
        document.removeEventListener('keydown', onKey);
      }
    };
    document.addEventListener('keydown', onKey);
  };

  window.alert = showModernAlert;
})();
