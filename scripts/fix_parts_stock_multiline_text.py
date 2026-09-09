from pathlib import Path

p = Path('src/App.jsx')
s = p.read_text(encoding='utf-8')
original = s

s = s.replace(
    'className={`text-sm ${t.textMain} mt-1 whitespace-pre-wrap break-words`}',
    'className={`text-sm ${t.textMain} mt-1 whitespace-pre-wrap break-words leading-6`}',
    1,
)

needle = '<div className="text-sm text-slate-300 mt-1">{p.notes || \'—\'}</div>'
replacement = '<div className="text-sm text-slate-300 mt-1 whitespace-pre-wrap break-words leading-6">{p.notes || \'—\'}</div>'
if needle in s:
    s = s.replace(needle, replacement, 1)

s = s.replace(
    '<div className={`text-sm ${t.textMain}`}>{p.notes || \'—\'}</div>',
    '<div className={`text-sm ${t.textMain} whitespace-pre-wrap break-words leading-6`}>{p.notes || \'—\'}</div>',
    1,
)

if s == original:
    raise SystemExit('No multiline note rendering target found; refusing to create a no-op patch.')

p.write_text(s, encoding='utf-8')
print('Parts Stock multiline formatting patch applied.')
