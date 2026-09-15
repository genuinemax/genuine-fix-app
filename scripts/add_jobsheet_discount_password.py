from pathlib import Path

APP = Path('src/App.jsx')
text = APP.read_text(encoding='utf-8')

# 1) Remove the accidental duplicate Device Passcode input.
passcode_input = '''<input type="text" autoComplete="off" placeholder="Device Passcode / Pattern (Optional)" value={newRepair.devicePasscode || newRepair.password || ''} onChange={e => setNewRepair({...newRepair, devicePasscode: e.target.value, password: undefined})} className={`p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />'''
if text.count(passcode_input) > 1:
    text = text.replace(passcode_input + '\n              ' + passcode_input, passcode_input, 1)

# 2) Restore a multi-issue Job Sheet state without changing existing saved records.
state_marker = "  const [posBill, setPosBill] = useState({"
if 'const [jobSheetIssues, setJobSheetIssues]' not in text:
    if state_marker not in text:
        raise SystemExit('Could not find Job Sheet state insertion point.')
    text = text.replace(
        state_marker,
        "  const [jobSheetIssues, setJobSheetIssues] = useState(['']);\n\n" + state_marker,
        1,
    )

# 3) Let the History editor update the live React repairs state immediately.
# This avoids the old localStorage + reload race that could make an edited Job
# Sheet appear unchanged until a later refresh.
repairs_bridge = """  useEffect(() => {\n    window.GenuineFixOnRepairsUpdated = (nextRepairs) => setRepairs(nextRepairs);\n    return () => { delete window.GenuineFixOnRepairsUpdated; };\n  }, []);\n\n"""
bridge_marker = "  const [inventory, setInventory] = useState(() => {"
if 'window.GenuineFixOnRepairsUpdated = (nextRepairs)' not in text:
    if bridge_marker not in text:
        raise SystemExit('Could not find repairs state bridge insertion point.')
    text = text.replace(bridge_marker, repairs_bridge + bridge_marker, 1)

# 4) Make the saved Job Sheet use all entered issues while retaining the legacy issue field.
handler_marker = "    const repairItem = {\n      ...newRepair,"
if handler_marker in text and 'const issueList = jobSheetIssues' not in text:
    text = text.replace(
        handler_marker,
        "    const issueList = jobSheetIssues.map(issue => String(issue || '').trim()).filter(Boolean);\n    const combinedIssues = issueList.join('\\n');\n    const savedIssue = combinedIssues || newRepair.issue || 'General Repair / Unlocking';\n    const repairItem = {\n      ...newRepair,",
        1,
    )
    text = text.replace(
        "      issue: newRepair.issue || 'General Repair / Unlocking',",
        "      issue: savedIssue,\n      issues: issueList,",
        1,
    )
    text = text.replace(
        "    setRepairs([repairItem, ...repairs]);\n    setNewRepair({",
        "    setRepairs([repairItem, ...repairs]);\n    setJobSheetIssues(['']);\n    setNewRepair({",
        1,
    )

# 5) Replace the old single Issue input with a matching multi-issue block + Add Issue button.
old_issue = '''              <input type="text" placeholder="Issue / Details (Optional)" value={newRepair.issue} onChange={e => setNewRepair({...newRepair, issue: e.target.value})} className={`md:col-span-2 p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`} />'''
new_issue = '''              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <label className={`text-sm font-bold ${t.textMain}`}>Repair Issues</label>
                  <button
                    type="button"
                    onClick={() => setJobSheetIssues(prev => [...prev, ''])}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition"
                  >
                    <Plus size={15} /> Add Issue
                  </button>
                </div>
                <div className="space-y-2">
                  {jobSheetIssues.map((issue, index) => (
                    <div key={`job-issue-${index}`} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={index === 0 ? 'Issue / Details' : `Issue ${index + 1}`}
                        value={issue}
                        onChange={e => setJobSheetIssues(prev => prev.map((item, i) => i === index ? e.target.value : item))}
                        className={`flex-1 p-3 ${t.inputBg} border rounded-2xl text-sm focus:outline-none`}
                      />
                      {jobSheetIssues.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setJobSheetIssues(prev => prev.filter((_, i) => i !== index))}
                          className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                          title="Remove issue"
                        >
                          <X size={17} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>'''
if old_issue in text:
    text = text.replace(old_issue, new_issue, 1)

# 6) Do not leave a second passcode field if previous builds inserted it twice.
text = text.replace(passcode_input + '\n              ' + passcode_input, passcode_input, 1)

required_markers = [
    'calculateJobSheetTotals',
    'Device Passcode / Pattern (Optional)',
    'const [jobSheetIssues, setJobSheetIssues]',
    'Add Issue',
    'const issueList = jobSheetIssues',
    'window.GenuineFixOnRepairsUpdated',
]
missing = [marker for marker in required_markers if marker not in text]
if missing:
    raise SystemExit(f'Job Sheet patch is incomplete; missing: {", ".join(missing)}')

APP.write_text(text, encoding='utf-8')
print('Job Sheet UI fixed: duplicate passcode removed, Add Issue restored, and History edit bridge enabled.')
