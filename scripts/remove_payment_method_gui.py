from pathlib import Path
import re

p = Path('src/App.jsx')
s = p.read_text()
original = s

# Remove the reusable Payment Method GUI component only. Use the top-level
# export as the boundary so the removal is not dependent on exact formatting.
s = re.sub(
    r"\nfunction PaymentMethodPicker\([^\n]*\)\s*\{.*?\n\}\s*\n(?=export default function App)",
    "\n",
    s,
    count=1,
    flags=re.S,
)

# Remove picker JSX instances, including multiline props.
s = re.sub(
    r"\n[ \t]*<PaymentMethodPicker\b[\s\S]*?/>(?:[ \t]*\n)?",
    "\n",
    s,
)

# Remove an empty conditional wrapper left behind when the picker was the
# only content of the condition. Preserve all payment status/data logic.
s = re.sub(
    r"\n[ \t]*\{newExpense\.paymentStatus !== 'Unpaid' && \(\s*\)\}\s*",
    "\n",
    s,
)

# Remove any legacy payment-method select UI while preserving paymentMethod
# state and stored payment history elsewhere in the application.
def remove_payment_selects(src):
    out = []
    pos = 0
    removed = 0
    while True:
        start = src.find('<select', pos)
        if start < 0:
            out.append(src[pos:])
            break
        end = src.find('</select>', start)
        if end < 0:
            out.append(src[pos:])
            break
        end += len('</select>')
        block = src[start:end]
        if 'paymentMethod' in block:
            out.append(src[pos:start])
            removed += 1
        else:
            out.append(src[pos:end])
        pos = end
    return ''.join(out), removed

s, removed_selects = remove_payment_selects(s)

if 'PaymentMethodPicker' in s:
    raise SystemExit('PaymentMethodPicker still present after removal')

if s == original:
    raise SystemExit('Payment Method GUI removal made no changes')

p.write_text(s)
print(f'Payment Method GUI removed. Legacy payment selects removed: {removed_selects}. Payment data/logic preserved.')
