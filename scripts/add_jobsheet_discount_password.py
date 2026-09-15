from pathlib import Path

APP = Path('src/App.jsx')
text = APP.read_text(encoding='utf-8')

# Repair the exact duplicate block left by the previous Job Sheet patch attempt.
# This is intentionally narrow: it only removes the repeated statements that
# make the object literal invalid JSX/JavaScript. No customer data is touched.
duplicate = '''    const repairItem = {\n    e.preventDefault();\n    const { subtotal, discount, total, paidAmount, dueAmount } = calculateJobSheetTotals(\n      newRepair.totalCost,\n      newRepair.discountType,\n      newRepair.discountValue,\n      newRepair.paidAmount\n    );\n      ...newRepair,'''
clean = '''    const repairItem = {\n      ...newRepair,'''
if duplicate in text:
    text = text.replace(duplicate, clean, 1)
    APP.write_text(text, encoding='utf-8')

required_markers = [
    'calculateJobSheetTotals',
    'Device Passcode / Pattern (Optional)',
    'devicePasscode: newRepair.devicePasscode || newRepair.password ||',
]
missing = [marker for marker in required_markers if marker not in text]
if missing:
    raise SystemExit(f"Job Sheet patch is incomplete; missing: {', '.join(missing)}")

print('Job Sheet handler verified; duplicate patch block repaired safely.')
