from pathlib import Path

APP = Path('src/App.jsx')
text = APP.read_text(encoding='utf-8')

# Keep one canonical React handler for Job Sheet deletion.
handler_anchor = "  const handleAddRepair = (e) => {"
handler = '''  const deleteJobSheet = (id) => {
    const job = repairs.find(r => r.id === id);
    if (!job) return;
    if (!window.confirm(`Delete Job Sheet ${job.id}? This action cannot be undone.`)) return;
    setRepairs(prev => prev.filter(r => r.id !== id));
    if (selectedInvoice?.id === id) setSelectedInvoice(null);
  };

'''
if 'const deleteJobSheet = (id) =>' not in text and handler_anchor in text:
    text = text.replace(handler_anchor, handler + handler_anchor, 1)

# Replace only the canonical Job Sheet History Action cell. This is intentionally
# inside App.jsx so the UI has a single React owner and no DOM injector is needed.
map_anchor = "{repairs.filter(r => (r.billType || 'Repair') === 'Repair').map(job => ("
start = text.find(map_anchor)
if start >= 0:
    cell_start = text.find('<td className="p-4 text-right">', start)
    if cell_start >= 0:
        cell_end = text.find('</td>', cell_start)
        if cell_end >= 0:
            replacement = '''<td className="p-4 text-right">
                          <div className="flex flex-wrap justify-end items-center gap-1.5">
                            <button type="button" onClick={() => setSelectedInvoice(job)} className="px-3 py-1.5 bg-blue-600/15 text-blue-400 hover:bg-blue-600/25 rounded-xl font-bold inline-flex items-center gap-1.5">
                              <Eye size={14}/> View
                            </button>
                            <button type="button" onClick={() => window.GenuineFixEditRecord?.('repairs', job.id)} className="px-3 py-1.5 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 rounded-xl font-bold inline-flex items-center gap-1.5">
                              <Pencil size={14}/> Edit
                            </button>
                            <button type="button" onClick={() => printInvoice(job)} className="px-3 py-1.5 bg-violet-500/15 text-violet-400 hover:bg-violet-500/25 rounded-xl font-bold inline-flex items-center gap-1.5">
                              <Printer size={14}/> Print
                            </button>
                            <button type="button" onClick={() => deleteJobSheet(job.id)} className="px-3 py-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl font-bold inline-flex items-center gap-1.5">
                              <Trash2 size={14}/> Delete
                            </button>
                          </div>
                        </td>'''
            text = text[:cell_start] + replacement + text[cell_end + len('</td>'):]

APP.write_text(text, encoding='utf-8')
print('Canonical React Job Sheet History actions applied.')
