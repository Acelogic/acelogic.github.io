#!/usr/bin/env python3
"""Embed shared navigation/footer in the static pages. No third-party dependencies."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
check = '--check' in sys.argv
changed = []
for page in sorted(ROOT.glob('*.html')):
    original = page.read_text()
    updated = original
    for name, source in [('navBar', 'navBar.html'), ('footer', 'footer.html')]:
        fragment = (ROOT / 'htmlComponents' / source).read_text().strip()
        block = f'<!-- shared:{name}:start -->\n{fragment}\n<!-- shared:{name}:end -->'
        pattern = rf'<!-- shared:{name}:start -->.*?<!-- shared:{name}:end -->|<div id="{name}"></div>'
        updated, count = re.subn(pattern, lambda _: block, updated, flags=re.S)
        if count != 1:
            raise SystemExit(f'{page.name}: expected exactly one {name} block; found {count}')
    if updated != original:
        changed.append(page.name)
        if not check:
            page.write_text(updated)
if check and changed:
    raise SystemExit('Outdated shared components: ' + ', '.join(changed))
print('Shared components are current.' if check else 'Built shared components in all static pages.')
