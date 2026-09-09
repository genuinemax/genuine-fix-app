from pathlib import Path

APP = Path('src/App.jsx')
text = APP.read_text(encoding='utf-8')

# Add a dedicated delete handler for repair/job-sheet records.
handler_anchor = "  const handleAddRepair = (e) => {"
handler = '''  const deleteJobSheet = (id) => {
    const job = repairs.find(r => r.id === id);
    if (!job) return;
    if (!window.confirm(`Delete Job Sheet ${job.id}? This action cannot be undone.`)) return;
    setRepairs(prev => prev.filter(r => r.id !== id));
    if (selectedInvoice?.id === id) setSelectedInvoice(null);
  };

'''
if 'const deleteJobSheet = (id) =>' not in text:
    if handler_anchor not in text:
        raise SystemExit('handleAddRepair anchor not found')
    text = text.replace(handler_anchor, handler + handler_anchor, 1)

# Add Job Sheet history with a real Delete button inside the Job Sheets tab.
marker = '''              <button type="submit" className="md:col-span-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-blue-600/35">Save Job Sheet</button>
            </form>
          </div>
        )}

        {/* DEVICES TAB */}'''
replacement = '''              <button type="submit" className="md:col-span-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl p-3.5 transition shadow-lg shadow-blue-600/35">Save Job Sheet</button>
            </form>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl overflow-hidden shadow-xl`}>
              <div className={`p-5 border-b ${t.border} ${t.cardSecondary}`}>
                <h3 className={`text-lg font-black ${t.textMain}`}>Job Sheet History</h3>
                <p className={`text-sm ${t.textMuted} mt-1`}>Saved repair jobs can be deleted directly from here.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={`${t.tableHeader} font-bold uppercase text-sm border-b`}>
                    <tr>
                      <th className="p-4 text-left">Job ID</th>
                      <th className="p-4 text-left">Customer</th>
                      <th className="p-4 text-left">Device / Issue</th>
                      <th className="p-4 text-left">Date</th>
                      <th className="p-4 text-left">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.tableDivide}`}>
                    {repairs.filter(r => (r.billType || 'Repair') === 'Repair').map(job => (
                      <tr key={job.id} className="hover:bg-blue-600/5 transition">
                        <td className="p-4 font-mono font-black text-blue-400">{job.id}</td>
                        <td className={`p-4 font-bold ${t.textMain}`}>{job.customerName}<div className={`text-xs ${t.textMuted} mt-1`}>{job.phone}</div></td>
                        <td className={`p-4 ${t.textMuted}`}>{job.model || job.deviceType}<div className="text-xs mt-1">{job.issue || 'Repair / service job'}</div></td>
                        <td className={`p-4 ${t.textMuted}`}>{job.dateTime || '—'}</td>
                        <td className={`p-4 ${t.textMuted}`}>{job.status || 'Pending'}</td>
                        <td className="p-4 text-right">
                          <button type="button" onClick={() => deleteJobSheet(job.id)} className="px-3 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl font-bold inline-flex items-center gap-1">
                            <Trash2 size={15}/> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {repairs.filter(r => (r.billType || 'Repair') === 'Repair').length === 0 && (
                      <tr><td colSpan="6" className={`p-8 text-center ${t.textMuted}`}>No Job Sheets found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DEVICES TAB */}'''
if 'Job Sheet History' not in text:
    if marker not in text:
        raise SystemExit('Job Sheets insertion marker not found')
    text = text.replace(marker, replacement, 1)

APP.write_text(text, encoding='utf-8')
print('Job Sheet delete fix applied.')
