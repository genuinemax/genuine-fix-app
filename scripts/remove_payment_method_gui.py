from pathlib import Path
import re

p = Path('src/App.jsx')
s = p.read_text()
original = s

# Remove the reusable Payment Method GUI component only.
s = re.sub(
    r"\nfunction PaymentMethodPicker\(\{ value, onChange, label = 'Payment Method', t \}\) \{.*?\n\}\n\nexport default function App",
    "\nexport default function App",
    s,
    count=1,
    flags=re.S,
)

# Remove every Payment Method picker instance, without touching the surrounding
# payment status, due calculation, or stored payment data.
s = re.sub(r"\n\s*<PaymentMethodPicker\b[^>]*/>\s*", "\n", s)

if s == original:
    raise SystemExit('Payment Method GUI removal made no changes')

p.write_text(s)
print('Payment Method GUI removed. Payment data/logic preserved.')
