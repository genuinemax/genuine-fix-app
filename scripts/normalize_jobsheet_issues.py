from pathlib import Path
import re

APP = Path('src/App.jsx')
text = APP.read_text(encoding='utf-8')

issue_block = '''const GF_JOB_ISSUE_PRESETS = [
  'Screen not working / Display issue',
  'Battery draining / Not charging',
  'Charging not working / Slow charging',
  'Keyboard not working / Some keys dead',
  'SSD / HDD not detected',
  'Windows / OS problem',
  'Software / Driver problem',
  'Overheating / Fan noise',
  'Data loss / Data recovery needed',
  'Water / Liquid damage',
  'Motherboard not powering on',
  'iCloud / Network unlock',
  'FRP / Google account lock',
  'Password / Pattern lock',
  'Camera / Speaker / Mic not working',
  'Wi-Fi / Bluetooth not working',
  'Touch / Touchscreen not working',
  'No power / Dead device',
  'Restarting / Boot loop',
  'Slow performance / Hanging',
  'General repair / Inspection'
];'''

pattern = r"const GF_JOB_ISSUE_PRESETS = \[[\s\S]*?\n\];"
text, count = re.subn(pattern, issue_block, text, count=1)
if count:
    APP.write_text(text, encoding='utf-8')
    print('Job Sheet issue dropdown normalized to repair-problem options only.')
else:
    raise SystemExit('GF_JOB_ISSUE_PRESETS block not found')
