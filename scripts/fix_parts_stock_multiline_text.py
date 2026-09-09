from pathlib import Path
import re

p = Path('src/App.jsx')
s = p.read_text(encoding='utf-8')
original = s

# Remove any previously injected malformed helper, including literal \\n escapes.
start = s.find(r'\nconst normalizePartsStockNotes = (value) => {')
if start >= 0:
    end = s.find(r'\nconst getLocalDateKey = () => {', start)
    if end >= 0:
        s = s[:start] + s[end + 1:]

# Also remove a real-newline helper if one was partially written by an older script.
real_start = s.find('\nconst normalizePartsStockNotes = (value) => {')
if real_start >= 0:
    real_end = s.find('\nconst getLocalDateKey = () => {', real_start)
    if real_end >= 0:
        s = s[:real_start] + s[real_end + 1:]

helper = r'''
const normalizePartsStockNotes = (value) => {
  const text = String(value || '').replace(/\r\n?/g, '\n');
  const lines = text.split('\n');
  const output = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;

    if (/^[•▪*-]$/.test(line)) {
      let next = i + 1;
      while (next < lines.length && !lines[next].trim()) next += 1;
      if (next < lines.length) {
        output.push(`${line}${lines[next].trim()}`);
        i = next;
      } else {
        output.push(line);
      }
    } else {
      output.push(line);
    }
  }

  return output.join('\n');
};
'''

if 'const normalizePartsStockNotes = ' not in s:
    marker = 'const getLocalDateKey = () => {'
    if marker not in s:
        raise SystemExit('Could not find App.jsx insertion point.')
    s = s.replace(marker, helper + '\n' + marker, 1)

# Preserve multiline note display in the stock detail modals.
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
                placeholder="Notes / Remarks (optional) — paste bullets here; each bullet stays with its text on the same line."
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
if old in s:
    s = s.replace(old, new, 1)

if s == original:
    raise SystemExit('No Parts Stock formatting target found; refusing a no-op patch.')

p.write_text(s, encoding='utf-8')
print('Parts Stock paste formatting repaired.')
