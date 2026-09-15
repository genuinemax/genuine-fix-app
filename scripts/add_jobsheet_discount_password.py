from pathlib import Path

# The Job Sheet discount + customer device passcode changes are already part of
# src/App.jsx. Keep this build hook verification-only so it never rewrites the
# large JSX handler and cannot corrupt the source during Vite prebuild.
APP = Path('src/App.jsx')
text = APP.read_text(encoding='utf-8')

required_markers = [
    'calculateJobSheetTotals',
    'Device Passcode / Pattern (Optional)',
]
missing = [marker for marker in required_markers if marker not in text]
if missing:
    raise SystemExit(f"Job Sheet patch is incomplete; missing: {', '.join(missing)}")

print('Job Sheet discount + device passcode patch verified; source rewrite skipped.')
