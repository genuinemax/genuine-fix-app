from pathlib import Path

APP = Path('src/App.jsx')
text = APP.read_text(encoding='utf-8')

# The POS totals UI uses posBillPreview. Keep its calculation declaration
# immediately before handleSavePosBill so it is always in component scope,
# regardless of the older build-time patch state.
if 'const posBillPreview = calculateAccessoriesBillTotals(' not in text:
    anchor = '  const handleSavePosBill = (e) => {'
    if anchor not in text:
        raise SystemExit('Could not find handleSavePosBill anchor in src/App.jsx')
    declaration = """  const posBillSubtotal = posBill.items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 1)), 0);\n  const posBillPreview = calculateAccessoriesBillTotals(posBillSubtotal, posBill.discountType, posBill.discountValue, posBill.paidAmount);\n\n"""
    text = text.replace(anchor, declaration + anchor, 1)
elif 'const posBillSubtotal = posBill.items.reduce(' not in text:
    anchor = '  const handleSavePosBill = (e) => {'
    if anchor not in text:
        raise SystemExit('Could not find handleSavePosBill anchor in src/App.jsx')
    declaration = """  const posBillSubtotal = posBill.items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 1)), 0);\n\n"""
    text = text.replace(anchor, declaration + anchor, 1)

APP.write_text(text, encoding='utf-8')
