from pathlib import Path

path = Path('src/App.jsx')
text = path.read_text(encoding='utf-8')
old = "onClick={() => { setActiveTab(item.id); setOpenNavGroup(group.title); }}"
new = "onClick={() => { setActiveTab(item.id); setOpenNavGroup(''); }}"
if old in text:
    text = text.replace(old, new)
elif "onClick={() => { setActiveTab(item.id); setOpenNavGroup(''); }}" not in text:
    raise SystemExit('Navigation item click handler not found; refusing to patch.')
path.write_text(text, encoding='utf-8')
print('Navigation now collapses after selecting a tab.')
