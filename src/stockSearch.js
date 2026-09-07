// Genuine Fix — Parts Stock search enhancement
// Adds a lightweight client-side search box to the Parts & Accessories Inventory table
// without changing the existing inventory state or add/edit/delete logic.

const SEARCH_MARKER = 'data-gf-stock-search';

function setupStockSearch() {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4'));
  const heading = headings.find(el =>
    el.textContent?.trim().toLowerCase() === 'parts & accessories inventory'
  );

  if (!heading) return;

  const card = heading.closest('div.space-y-6') || heading.parentElement?.parentElement;
  if (!card) return;

  const table = card.querySelector('table');
  if (!table) return;

  const tableWrap = table.closest('div.overflow-hidden') || table.parentElement;
  if (!tableWrap || tableWrap.querySelector(`[${SEARCH_MARKER}]`)) return;

  const toolbar = document.createElement('div');
  toolbar.setAttribute(SEARCH_MARKER, 'true');
  toolbar.style.cssText = [
    'display:flex',
    'flex-wrap:wrap',
    'align-items:center',
    'justify-content:space-between',
    'gap:12px',
    'padding:14px 16px',
    'border-bottom:1px solid rgba(148,163,184,.16)'
  ].join(';');

  const inputWrap = document.createElement('div');
  inputWrap.style.cssText = 'position:relative;flex:1;min-width:220px;max-width:560px;';

  const icon = document.createElement('span');
  icon.textContent = '🔍';
  icon.style.cssText = 'position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;opacity:.75;pointer-events:none;';

  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = 'Search parts or category...';
  input.autocomplete = 'off';
  input.setAttribute('aria-label', 'Search parts or category');
  input.style.cssText = [
    'width:100%',
    'box-sizing:border-box',
    'padding:11px 40px 11px 38px',
    'border-radius:14px',
    'border:1px solid rgba(148,163,184,.28)',
    'background:rgba(15,23,42,.55)',
    'color:inherit',
    'font-size:14px',
    'outline:none'
  ].join(';');

  const clear = document.createElement('button');
  clear.type = 'button';
  clear.textContent = '×';
  clear.title = 'Clear search';
  clear.setAttribute('aria-label', 'Clear stock search');
  clear.style.cssText = 'position:absolute;right:9px;top:50%;transform:translateY(-50%);border:0;background:transparent;color:inherit;font-size:20px;line-height:1;opacity:.65;cursor:pointer;display:none;';

  const count = document.createElement('span');
  count.style.cssText = 'font-size:13px;opacity:.7;white-space:nowrap;';

  inputWrap.appendChild(icon);
  inputWrap.appendChild(input);
  inputWrap.appendChild(clear);
  toolbar.appendChild(inputWrap);
  toolbar.appendChild(count);
  tableWrap.insertBefore(toolbar, table);

  const rows = () => Array.from(table.querySelectorAll('tbody tr'));

  const applyFilter = () => {
    const query = input.value.trim().toLowerCase();
    let visible = 0;
    const allRows = rows();

    allRows.forEach(row => {
      // Ignore a possible React empty-state row when filtering.
      const text = row.textContent?.toLowerCase() || '';
      const matches = !query || text.includes(query);
      row.style.display = matches ? '' : 'none';
      if (matches) visible += 1;
    });

    count.textContent = query
      ? `Showing ${visible} matching item${visible === 1 ? '' : 's'} of ${allRows.length}`
      : `Showing ${allRows.length} item${allRows.length === 1 ? '' : 's'}`;
    clear.style.display = query ? 'block' : 'none';
  };

  input.addEventListener('input', applyFilter);
  clear.addEventListener('click', () => {
    input.value = '';
    input.focus();
    applyFilter();
  });

  applyFilter();
}

const observer = new MutationObserver(() => setupStockSearch());

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setupStockSearch();
    observer.observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
  }, { once: true });
} else {
  setupStockSearch();
  observer.observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
}
