from pathlib import Path
import re

p = Path('src/App.jsx')
s = p.read_text(encoding='utf-8')
original = s

# Remove any old/malformed helper by semantic anchors, regardless of whether
# literal "\\n" escapes or real newlines were written into App.jsx.
marker = 'const normalizePartsStockNotes = (value) => {'
start = s.find(marker)
if start >= 0:
    end_marker = 'const getLocalDateKey = () => {'
    end = s.find(end_marker, start)
    if end >= 0:
        line_start = s.rfind('\n', 0, start)
        if line_start < 0:
            line_start = start
        else:
            line_start += 1
        s = s[:line_start] + s[end:]

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

if marker not in s:
    insertion = 'const getLocalDateKey = () => {'
    if insertion not in s:
        raise SystemExit('Could not find App.jsx insertion point.')
    s = s.replace(insertion, helper + '\n' + insertion, 1)

# Keep stock detail notes readable as multiline text.
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

# Normalize actual pasted value in Parts Stock Notes.
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

p.write_text(s, encoding='utf-8')
print('Parts Stock paste formatting repaired.' if s != original else 'No source changes needed; syntax helper is already clean.')
