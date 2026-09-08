// Genuine Fix — isolated mobile presentation layer
// Keeps React state, Firebase sync and localStorage/business logic untouched.

const STYLE_ID = 'gf-mobile-gui-style';
const BAR_ID = 'gf-mobile-bottom-nav';
const MOBILE_QUERY = '(max-width: 767px)';

const MOBILE_CSS = `
@media ${MOBILE_QUERY} {
  html, body, #root { width:100%; max-width:100%; overflow-x:hidden; }
  body.gf-mobile-mode { padding-bottom: calc(76px + env(safe-area-inset-bottom)); }
  body.gf-mobile-mode nav { max-width:100vw; }
  body.gf-mobile-mode nav > div { padding-left:12px !important; padding-right:12px !important; }
  body.gf-mobile-mode nav > div > div:first-child { flex:0 0 auto; }
  body.gf-mobile-mode nav > div > div:first-child p { display:none; }
  body.gf-mobile-mode nav > div > div:first-child h1 { font-size:15px !important; }
  body.gf-mobile-mode nav > div > div:first-child img { width:36px !important; height:36px !important; }
  body.gf-mobile-mode nav > div > div:nth-child(2) { display:none !important; }
  body.gf-mobile-mode main { width:100%; max-width:100% !important; padding:16px 12px 24px !important; }
  body.gf-mobile-mode main .overflow-x-auto { max-width:100%; }
  body.gf-mobile-mode table { min-width:620px; }
  body.gf-mobile-mode input,
  body.gf-mobile-mode select,
  body.gf-mobile-mode textarea { max-width:100%; min-width:0; font-size:16px; }
  body.gf-mobile-mode button { max-width:100%; }
  body.gf-mobile-mode [role="dialog"],
  body.gf-mobile-mode .fixed.inset-0 > div { max-width:calc(100vw - 24px) !important; max-height:calc(100dvh - 24px); overflow-y:auto; }
  body.gf-mobile-mode .grid { min-width:0; }
  body.gf-mobile-mode .grid > * { min-width:0; }
  body.gf-mobile-mode [class*="rounded-3xl"],
  body.gf-mobile-mode [class*="rounded-2xl"] { min-width:0; }
  body.gf-mobile-mode [class*="font-mono"] { overflow-wrap:anywhere; word-break:break-word; }

  #${BAR_ID} {
    position:fixed; left:0; right:0; bottom:0; z-index:9999;
    display:flex; gap:6px; overflow-x:auto; overscroll-behavior-x:contain;
    padding:8px 8px calc(8px + env(safe-area-inset-bottom));
    background:rgba(15,20,32,.96); border-top:1px solid rgba(100,116,139,.35);
    box-shadow:0 -12px 30px rgba(0,0,0,.28); backdrop-filter:blur(18px);
    -webkit-overflow-scrolling:touch;
  }
  #${BAR_ID} .gf-mobile-nav-item {
    flex:1 0 72px; min-width:72px; min-height:54px;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:4px; border:0; border-radius:14px; background:transparent;
    color:#94a3b8; font:700 11px/1.15 system-ui,sans-serif;
    white-space:normal; text-align:center; padding:5px 4px;
  }
  #${BAR_ID} .gf-mobile-nav-item svg { width:18px; height:18px; flex:0 0 auto; }
  #${BAR_ID} .gf-mobile-nav-item.gf-active { background:#2563eb; color:#fff; box-shadow:0 6px 18px rgba(37,99,235,.32); }
  #${BAR_ID} .gf-mobile-nav-item:active { transform:scale(.97); }
}
@media (min-width:768px) {
  #${BAR_ID} { display:none !important; }
}
`;

function isMobile() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function installStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = MOBILE_CSS;
  document.head.appendChild(style);
}

function getSourceButtons() {
  const nav = document.querySelector('nav');
  if (!nav) return [];
  return [...nav.querySelectorAll('button')].filter(button => {
    const label = (button.textContent || '').trim();
    return label && button.offsetParent !== null;
  });
}

function getLabel(button) {
  return (button.textContent || '').replace(/\s+/g, ' ').trim();
}

function syncActive(sourceButtons, mobileButtons) {
  sourceButtons.forEach((source, index) => {
    const target = mobileButtons[index];
    if (!target) return;
    const sourceClass = source.className || '';
    const active = /bg-blue-600(?:\s|$)/.test(sourceClass);
    target.classList.toggle('gf-active', active);
    target.setAttribute('aria-current', active ? 'page' : 'false');
  });
}

function buildBottomNav() {
  if (!isMobile()) return;
  const sourceButtons = getSourceButtons();
  if (!sourceButtons.length) return;

  let bar = document.getElementById(BAR_ID);
  if (!bar) {
    bar = document.createElement('div');
    bar.id = BAR_ID;
    bar.setAttribute('aria-label', 'Mobile navigation');
    document.body.appendChild(bar);
  }

  const labels = sourceButtons.map(getLabel);
  const existingLabels = [...bar.querySelectorAll('button')].map(getLabel);
  if (labels.join('|') !== existingLabels.join('|')) {
    bar.replaceChildren();
    sourceButtons.forEach((source, index) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'gf-mobile-nav-item';
      item.textContent = getLabel(source);
      item.setAttribute('aria-label', getLabel(source));
      item.addEventListener('click', () => source.click());
      bar.appendChild(item);
    });
  }

  syncActive(sourceButtons, [...bar.querySelectorAll('button')]);
}

function setMode() {
  document.body.classList.toggle('gf-mobile-mode', isMobile());
  if (!isMobile()) {
    document.getElementById(BAR_ID)?.remove();
    return;
  }
  buildBottomNav();
}

function start() {
  installStyle();
  setMode();

  const observer = new MutationObserver(() => {
    if (isMobile()) buildBottomNav();
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

  const media = window.matchMedia(MOBILE_QUERY);
  const handleMedia = () => setMode();
  media.addEventListener?.('change', handleMedia);
  window.addEventListener('resize', handleMedia, { passive: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
