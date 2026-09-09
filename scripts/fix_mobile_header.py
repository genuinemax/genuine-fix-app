from pathlib import Path

path = Path('src/App.jsx')
text = path.read_text(encoding='utf-8')

text = text.replace(
    "const [mobileNavOpen, setMobileNavOpen] = useState(false);\n  const [openNavGroup, setOpenNavGroup] = useState('MAIN');",
    "const [mobileNavOpen, setMobileNavOpen] = useState(false);\n  const [openNavGroup, setOpenNavGroup] = useState('');",
)

old = '''<nav className={`border-b ${t.border} ${t.navBg} backdrop-blur-xl sticky top-0 z-30 shadow-2xl`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
          <div className="flex items-center gap-4 min-h-[58px]">'''
new = '''<nav className={`border-b ${t.border} ${t.navBg} backdrop-blur-xl sticky top-0 z-30 shadow-2xl`}>
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 sm:py-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 min-h-[58px]">'''
if old in text:
    text = text.replace(old, new, 1)

text = text.replace(
    '<div className="flex items-center gap-3 shrink-0 w-[270px] min-w-[270px]">',
    '<div className="flex items-center gap-2.5 shrink-0 w-full sm:w-[270px] sm:min-w-[270px]">',
    1,
)
text = text.replace(
    '<div className="w-10 h-10 shrink-0 rounded-xl',
    '<div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl',
    1,
)
text = text.replace(
    'font-extrabold text-lg ${t.textMain}',
    'font-extrabold text-base sm:text-lg ${t.textMain}',
    1,
)
text = text.replace(
    'className="text-xs text-blue-400 font-bold uppercase tracking-widest truncate"',
    'className="text-[10px] sm:text-xs text-blue-400 font-bold uppercase tracking-widest truncate"',
    1,
)
text = text.replace(
    '<div className={`relative flex-1 ${t.cardSecondary} p-1 rounded-2xl border ${t.border} shadow-inner`}>',
    '<div className={`relative w-full min-w-0 ${t.cardSecondary} p-1 rounded-2xl border ${t.border} shadow-inner`}>',
    1,
)
text = text.replace(
    '<div className="grid grid-cols-2 lg:grid-cols-4 gap-1">',
    '<div className="grid grid-cols-2 sm:grid-cols-4 gap-1">',
    1,
)
text = text.replace(
    'className={`w-full h-10 flex items-center justify-between gap-2 px-3 rounded-xl text-left transition-all',
    'className={`w-full h-9 sm:h-10 flex items-center justify-between gap-1.5 sm:gap-2 px-2.5 sm:px-3 rounded-xl text-left transition-all',
    1,
)
text = text.replace(
    'className="text-xs sm:text-sm font-black tracking-wide truncate"',
    'className="text-[10px] sm:text-sm font-black tracking-wide truncate"',
    1,
)
text = text.replace(
    'className={`absolute left-0 right-0 top-[calc(100%+8px)] z-50',
    'className={`absolute left-0 right-0 top-[calc(100%+6px)] z-50',
    1,
)
text = text.replace(
    'className="flex flex-wrap gap-1.5"',
    'className="flex flex-col sm:flex-row sm:flex-wrap gap-1.5"',
    1,
)
text = text.replace(
    'className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${',
    'className={`w-full sm:w-auto flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${',
    1,
)

path.write_text(text, encoding='utf-8')
print('Mobile header navigation patched.')
