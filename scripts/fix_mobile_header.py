from pathlib import Path

path = Path('src/App.jsx')
text = path.read_text(encoding='utf-8')

text = text.replace(
    "const [mobileNavOpen, setMobileNavOpen] = useState(false);\n  const [openNavGroup, setOpenNavGroup] = useState('MAIN');",
    "const [mobileNavOpen, setMobileNavOpen] = useState(false);\n  const [openNavGroup, setOpenNavGroup] = useState('');",
)

# Keep the header stacked on mobile so the brand and all four navigation
# groups always have room. The navigation groups use a deterministic 2x2 grid.
text = text.replace(
    '<div className="grid grid-cols-2 sm:grid-cols-4 gap-1">',
    '<div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">',
    1,
)
text = text.replace(
    'className={`relative w-full min-w-0 ${t.cardSecondary} p-1 rounded-2xl border ${t.border} shadow-inner`}',
    'className={`relative w-full min-w-0 ${t.cardSecondary} p-1.5 rounded-2xl border ${t.border} shadow-inner overflow-visible`}',
    1,
)
# Dropdowns must stay inside the viewport and above page content.
text = text.replace(
    'top-[calc(100%+6px)] z-50',
    'top-full mt-1 z-50',
)
# Never clip a group's expanded items at the navigation wrapper.
text = text.replace('shadow-inner overflow-hidden', 'shadow-inner overflow-visible', 1)

path.write_text(text, encoding='utf-8')
print('Mobile navigation layout stabilized.')
