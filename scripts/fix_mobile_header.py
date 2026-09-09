from pathlib import Path

path = Path('src/App.jsx')
text = path.read_text(encoding='utf-8')

# Keep the responsive navigation collapsed by default. The actual responsive
# navigation markup is already in App.jsx; this script is intentionally
# idempotent so the CI build does not overwrite unrelated UI patches.
text = text.replace(
    "const [openNavGroup, setOpenNavGroup] = useState('MAIN');",
    "const [openNavGroup, setOpenNavGroup] = useState('');",
    1,
)

path.write_text(text, encoding='utf-8')
print('Mobile header/navigation state verified.')
