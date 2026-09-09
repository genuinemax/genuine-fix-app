from pathlib import Path

p = Path('src/App.jsx')
s = p.read_text(encoding='utf-8')
original = s

helper = '''
const normalizePartsStockNotes = (value) => {
  const text = String(value || '').replace(/\r\n?/g, '\n');
  const lines = text.split('\n').map(line => line.trimEnd());
  const output = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Some clipboard sources put the bullet on one line and its text on the next.
    if (trimmed === '•' || trimmed === '-' || trimmed === '*' || trimmed === '▪') {
      output.push(trimmed);
      return;
    }

    const previous = output[output.length - 1];
    if (previous === '•' || previous === '-' || previous === '*' || previous === '▪') {
      output[output.length - 1] = `${previous}${trimmed}`;
    } else {
      output.push(line);
    }
  });

  return output.join('\n');
};
'''

if 'const normalizePartsStockNotes = ' not in s:
    marker = "const getLocalDateKey = () => {"
    if marker not in s:
        raise SystemExit('Could not find App.jsx insertion point.')
    s = s.replace(marker, helper + '\n' + marker, 1)

s = s.replace(
    'className={`text-sm ${t.textMain} mt-1 whitespace-pre-wrap break-words`}',
    'className={`text-sm ${t.textMain} mt-1 whitespace-pre-wrap break-words leading-6`}',
    1,
)
s = s.replace(
    '<div className="text-sm text-slate-300 mt-1">{p.notes || \'—\'}</div>',
    '<div className="text-sm text-slate-300 mt-1 whitespace-pre-wrap break-words leading-6">{p.notes || \'—\'}</div>',
    1,
)
s = s.replace(
    '<div className={`text-sm ${t.textMain}`}>{p.notes || \'—\'}</div>',
    '<div className={`text-sm ${t.textMain} whitespace-pre-wrap break-words leading-6`}>{p.notes || \'—\'}</div>',
    1,
)

old = '''              <textarea
                rows="3"
                placeholder="Notes / Remarks (optional) — e.g. quality, supplier detail, location, warranty..."
                value={newPart.notes}
                onChange={e => setNewPart({...newPart, notes: e.target.value})}
                className={`md:col-span-3 p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none resize-y`}
              />'''
new = '''              <textarea
                rows="5"
                placeholder="Notes / Remarks (optional) — paste bullets here; each • bullet will stay with its text on the same line."
                value={newPart.notes}
                onChange={e => setNewPart({...newPart, notes: normalizePartsStockNotes(e.target.value)})}
                onPaste={e => {
                  const pasted = e.clipboardData?.getData('text') || '';
                  if (!pasted) return;
                  e.preventDefault();
                  const el = e.currentTarget;
                  const start = el.selectionStart ?? newPart.notes.length;
                  const end = el.selectionEnd ?? start;
                  const next = `${newPart.notes.slice(0, start)}${pasted}${newPart.notes.slice(end)}`;
                  setNewPart(prev => ({ ...prev, notes: normalizePartsStockNotes(next) }));
                }}
                className={`md:col-span-3 p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none resize-y leading-6`}
              />'''
if old not in s:
    raise SystemExit('Parts Stock notes textarea target not found; refusing a no-op patch.')
s = s.replace(old, new, 1)

if s == original:
    raise SystemExit('No Parts Stock multiline formatting target found; refusing a no-op patch.')

p.write_text(s, encoding='utf-8')
print('Parts Stock paste normalization patch applied.')
