#!/usr/bin/env python3
"""Inline src/*.js and src/style.css into src/template.html -> index.html (single self-contained file)."""
import os
d = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src')
t = open(os.path.join(d, 'template.html')).read()
for key, f in [('CSS', 'style.css'), ('ENGINE', 'engine.js'), ('BG', 'backgrounds.js'), ('SND', 'sound.js'), ('UI', 'ui.js')]:
    t = t.replace('/*%s*/' % key, open(os.path.join(d, f)).read(), 1)
open(os.path.join(os.path.dirname(d), 'index.html'), 'w').write(t)
print('built index.html', len(t), 'bytes')
