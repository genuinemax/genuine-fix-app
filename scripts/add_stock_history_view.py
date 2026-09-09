from pathlib import Path

path = Path('src/App.jsx')
text = path.read_text(encoding='utf-8')
original = text

# State for the history detail modal.
state_anchor = "  const [stockPurchases, setStockPurchases] = useState(() => {"
state_insert = "  const [selectedStockPurchase, setSelectedStockPurchase] = useState(null);\n\n"
if "const [selectedStockPurchase, setSelectedStockPurchase] = useState(null);" not in text:
    if state_anchor not in text:
        raise SystemExit('stockPurchases state anchor not found; refusing to patch.')
    text = text.replace(state_anchor, state_insert + state_anchor, 1)

# Add View column to stock purchase history.
old_header = '                        <th className="p-4 text-left">Invoice</th>\n'
new_header = old_header + '                        <th className="p-4 text-right">Action</th>\n'
if '<th className="p-4 text-right">Action</th>' not in text:
    if old_header not in text:
        raise SystemExit('Stock history Invoice header not found; refusing to patch.')
    text = text.replace(old_header, new_header, 1)

old_row_end = '''                          <td className={`p-4 ${t.textMuted}`}>{p.invoiceNo || '—'}</td>\n                        </tr>'''
new_row_end = '''                          <td className={`p-4 ${t.textMuted}`}>{p.invoiceNo || '—'}</td>\n                          <td className="p-4 text-right">\n                            <button type="button" onClick={() => setSelectedStockPurchase(p)} className="px-3 py-1.5 bg-blue-600/15 text-blue-400 hover:bg-blue-600/25 rounded-xl font-bold inline-flex items-center gap-1.5">\n                              <Eye size={14}/> View\n                            </button>\n                          </td>\n                        </tr>'''
if 'setSelectedStockPurchase(p)' not in text:
    if old_row_end not in text:
        raise SystemExit('Stock history row anchor not found; refusing to patch.')
    text = text.replace(old_row_end, new_row_end, 1)

# Make the empty-state colspan match the added action column if present.
text = text.replace('colSpan="7" className={`p-10 text-center ${t.textMuted}`}>No stock purchase history found.', 'colSpan="8" className={`p-10 text-center ${t.textMuted}`}>No stock purchase history found.', 1)

# Add a professional detail modal immediately after the stock history card.
modal_anchor = '''            </div>\n          </div>\n        )}\n\n        {/* EXPENSES TAB */}'''
modal = '''            </div>\n\n            {selectedStockPurchase && (\n              <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedStockPurchase(null)}>\n                <div className={`${t.cardBg} border ${t.border} rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden`} onClick={e => e.stopPropagation()}>\n                  <div className={`p-5 border-b ${t.border} flex items-center justify-between gap-3`}>\n                    <div>\n                      <p className={`text-xs uppercase tracking-[0.2em] font-black ${t.textMuted}`}>Stock Purchase Detail</p>\n                      <h3 className={`text-xl font-black ${t.textMain}`}>{selectedStockPurchase.partName || 'Stock Item'}</h3>\n                    </div>\n                    <button type="button" onClick={() => setSelectedStockPurchase(null)} className={`p-2 rounded-xl ${t.cardSecondary} ${t.textMuted} hover:text-white`}><X size={18}/></button>\n                  </div>\n                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">\n                    {[\n                      ['Date', selectedStockPurchase.date || '—'],\n                      ['Supplier', selectedStockPurchase.supplierName || '—'],\n                      ['Quantity', String(selectedStockPurchase.qty || 0)],\n                      ['Unit Cost', `NPR ${Number(selectedStockPurchase.unitCost || 0).toLocaleString()}`],\n                      ['Total', `NPR ${Number(selectedStockPurchase.total || 0).toLocaleString()}`],\n                      ['Invoice', selectedStockPurchase.invoiceNo || '—'],\n                    ].map(([label, value]) => (\n                      <div key={label} className={`${t.cardSecondary} border ${t.border} rounded-2xl p-4`}>\n                        <div className={`text-xs uppercase tracking-wide font-black ${t.textMuted}`}>{label}</div>\n                        <div className={`text-sm font-bold ${t.textMain} mt-1 break-words`}>{value}</div>\n                      </div>\n                    ))}\n                    <div className={`sm:col-span-2 ${t.cardSecondary} border ${t.border} rounded-2xl p-4`}>\n                      <div className={`text-xs uppercase tracking-wide font-black ${t.textMuted}`}>Notes / Remarks</div>\n                      <div className={`text-sm ${t.textMain} mt-1 whitespace-pre-wrap break-words`}>{selectedStockPurchase.notes || 'No notes added.'}</div>\n                    </div>\n                  </div>\n                </div>\n              </div>\n            )}\n          </div>\n        )}\n\n        {/* EXPENSES TAB */}'''
if 'Stock Purchase Detail' not in text:
    if modal_anchor not in text:
        raise SystemExit('Stock history modal insertion anchor not found; refusing to patch.')
    text = text.replace(modal_anchor, modal, 1)

path.write_text(text, encoding='utf-8')
print('Stock history View action patch changed source:', text != original)
