from pathlib import Path

path = Path('src/App.jsx')
text = path.read_text(encoding='utf-8')
start_marker = "            <div className={`${t.cardBg} border ${t.border} rounded-3xl p-6 shadow-xl`}>\n              <div className=\"flex items-center justify-between mb-6\">\n                <h2 className={`text-lg font-bold ${t.textMain}`}>Recent Bills & Job Sheets</h2>"
start = text.find(start_marker)
if start < 0:
    raise SystemExit('Dashboard Recent Bills & Job Sheets block not found')
end_marker = "\n            <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">"
end = text.find(end_marker, start)
if end < 0:
    raise SystemExit('Dashboard income summary block not found')
replacement = r'''            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-6 shadow-xl`}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className={`text-sm uppercase tracking-[0.18em] font-black ${t.textMuted}`}>Business Analytics</p>
                    <h3 className={`text-lg font-black ${t.textMain}`}>Income vs Expense</h3>
                  </div>
                  <DollarSign size={20} className="text-emerald-400" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`${t.cardSecondary} border ${t.border} rounded-2xl p-4`}>
                    <p className={`text-sm font-bold ${t.textMuted}`}>Income received</p>
                    <p className="text-2xl font-black text-emerald-400 mt-2">NPR {totalIncome}</p>
                    <div className="mt-3 h-3 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, totalIncome > 0 ? (totalIncome / Math.max(totalIncome, totalExpensePaid)) * 100 : 0)}%` }} />
                    </div>
                  </div>
                  <div className={`${t.cardSecondary} border ${t.border} rounded-2xl p-4`}>
                    <p className={`text-sm font-bold ${t.textMuted}`}>Expense paid</p>
                    <p className="text-2xl font-black text-rose-400 mt-2">NPR {totalExpensePaid}</p>
                    <div className="mt-3 h-3 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, totalExpensePaid > 0 ? (totalExpensePaid / Math.max(totalIncome, totalExpensePaid)) * 100 : 0)}%` }} />
                    </div>
                  </div>
                </div>
                <div className={`mt-4 rounded-2xl border ${t.border} ${t.cardSecondary} p-4 flex items-center justify-between`}>
                  <span className={`text-sm font-bold ${t.textMuted}`}>Net cash</span>
                  <span className={`text-xl font-black ${netCash >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>NPR {netCash}</span>
                </div>
              </div>

              <div className={`${t.cardBg} border ${t.border} rounded-3xl p-6 shadow-xl`}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className={`text-sm uppercase tracking-[0.18em] font-black ${t.textMuted}`}>Repair Analytics</p>
                    <h3 className={`text-lg font-black ${t.textMain}`}>Job Status Overview</h3>
                  </div>
                  <ShieldCheck size={20} className="text-blue-400" />
                </div>
                <div className="space-y-4">
                  {['Pending', 'In Progress', 'Ready for Pickup', 'Completed', 'Cancelled'].map(status => {
                    const count = repairs.filter(r => String(r.status || '').toLowerCase() === status.toLowerCase()).length;
                    const maxCount = Math.max(1, ...['Pending', 'In Progress', 'Ready for Pickup', 'Completed', 'Cancelled'].map(s => repairs.filter(r => String(r.status || '').toLowerCase() === s.toLowerCase()).length));
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-sm font-bold ${t.textMuted}`}>{status}</span>
                          <span className={`text-sm font-black ${t.textMain}`}>{count}</span>
                        </div>
                        <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(count / maxCount) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={`${t.cardBg} border ${t.border} rounded-3xl p-6 shadow-xl`}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className={`text-sm uppercase tracking-[0.18em] font-black ${t.textMuted}`}>Performance Trend</p>
                  <h3 className={`text-lg font-black ${t.textMain}`}>Last 6 Months — Jobs & Income</h3>
                </div>
                <History size={20} className="text-violet-400" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end min-h-[190px]">
                {Array.from({ length: 6 }, (_, index) => {
                  const monthDate = new Date();
                  monthDate.setDate(1);
                  monthDate.setMonth(monthDate.getMonth() - (5 - index));
                  const year = monthDate.getFullYear();
                  const month = monthDate.getMonth();
                  const monthName = monthDate.toLocaleString('en-NP', { month: 'short' });
                  const monthRepairs = repairs.filter(r => {
                    const raw = String(r.dateTime || r.date || '');
                    const d = new Date(raw.replace(' ', 'T'));
                    return !Number.isNaN(d.getTime()) && d.getFullYear() === year && d.getMonth() === month;
                  });
                  const income = monthRepairs.reduce((sum, r) => sum + Number(r.paidAmount || 0), 0);
                  const maxIncome = Math.max(1, ...Array.from({ length: 6 }, (_, i) => {
                    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i));
                    return repairs.filter(r => { const x = new Date(String(r.dateTime || r.date || '').replace(' ', 'T')); return !Number.isNaN(x.getTime()) && x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth(); }).reduce((s, r) => s + Number(r.paidAmount || 0), 0);
                  }));
                  return (
                    <div key={`${year}-${month}`} className="flex flex-col justify-end h-[170px]">
                      <div className="flex-1 flex items-end justify-center">
                        <div className="w-full max-w-[58px] rounded-t-xl bg-violet-500/70 hover:bg-violet-500 transition" style={{ height: `${Math.max(8, (income / maxIncome) * 100)}%` }} title={`NPR ${income}`} />
                      </div>
                      <p className={`text-center text-sm font-black ${t.textMain} mt-2`}>{monthName}</p>
                      <p className={`text-center text-xs ${t.textMuted}`}>{monthRepairs.length} jobs</p>
                    </div>
                  );
                })}
              </div>
            </div>
'''
path.write_text(text[:start] + replacement + text[end:], encoding='utf-8')
print('Dashboard graphs applied')
