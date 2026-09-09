from pathlib import Path

path = Path('src/App.jsx')
text = path.read_text(encoding='utf-8')

# The navigation organizer previously left the old button-map tail after the new grouped navigation.
# Remove only that exact stale tail; keep the grouped navigation intact.
marker = "            ))\n              <button \n                key={item.id}"
start = text.find(marker)
if start >= 0:
    end_marker = "            ))}\n          </div>\n        </div>\n      </nav>"
    end = text.find(end_marker, start)
    if end < 0:
        raise SystemExit('Stale navigation tail found but closing marker was not found.')
    replacement = "            ))}\n          </div>\n        </div>\n      </nav>"
    text = text[:start] + replacement + text[end + len(end_marker):]
    path.write_text(text, encoding='utf-8')
    print('Fixed stale navigation tail.')
else:
    print('Navigation tail already clean.')
