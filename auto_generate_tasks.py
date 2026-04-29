"""
auto_generate_tasks.py
Scan models/ directory, group STL files by name similarity,
generate Block 1 (ranking) and Block 2 (pairwise) tasks,
and update app.js automatically.
"""
import os
import re
from difflib import SequenceMatcher
from itertools import combinations
from collections import defaultdict

MODELS_DIR = "models"
APP_JS = "app.js"
SIMILARITY_THRESHOLD = 0.70
MAX_RANKING_TASKS_PER_GROUP = 6
MAX_PAIRWISE_TASKS_PER_GROUP = 6

# ── Grouping ──────────────────────────────────────────────────
def get_stl_files(directory):
    return sorted([f for f in os.listdir(directory) if f.lower().endswith('.stl')])

def similarity(a, b):
    return SequenceMatcher(None, a, b).ratio()

def group_by_similarity(filenames, threshold):
    names = [f.replace('.stl', '') for f in filenames]
    parent = {n: n for n in names}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(x, y):
        px, py = find(x), find(y)
        if px != py:
            parent[px] = py

    for a, b in combinations(names, 2):
        if similarity(a, b) >= threshold:
            union(a, b)

    groups = defaultdict(list)
    for n in names:
        groups[find(n)].append(n + '.stl')

    return [sorted(g) for g in groups.values() if len(g) >= 2]

# ── Task Generation ───────────────────────────────────────────
def make_structure(fname):
    sid = fname.replace('.stl', '')
    return {'id': sid, 'vpValue': 0.0, 'stl': f'models/{fname}'}

def generate_block1(groups):
    import random; random.seed(42)
    tasks, tid = [], 1
    for group in groups:
        if len(group) < 3:
            continue
        combos = list(combinations(group, 3))
        if len(combos) > MAX_RANKING_TASKS_PER_GROUP:
            combos = random.sample(combos, MAX_RANKING_TASKS_PER_GROUP)
        for combo in combos:
            tasks.append({'id': f'B1_G{tid}', 'structures': [make_structure(f) for f in combo]})
            tid += 1
    return tasks

def generate_block2(groups):
    import random; random.seed(42)
    tasks, tid = [], 1
    for group in groups:
        if len(group) < 2:
            continue
        pairs = list(combinations(group, 2))
        if len(pairs) > MAX_PAIRWISE_TASKS_PER_GROUP:
            pairs = random.sample(pairs, MAX_PAIRWISE_TASKS_PER_GROUP)
        for a, b in pairs:
            tasks.append({'id': f'B2_P{tid}', 'structureA': make_structure(a), 'structureB': make_structure(b)})
            tid += 1
    return tasks

# ── JS Code Generation ────────────────────────────────────────
def fmt_struct(s, indent):
    return f"{indent}{{ id: '{s['id']}', vpValue: {s['vpValue']}, stl: '{s['stl']}' }}"

def format_block1_js(tasks):
    lines = ['const BLOCK1_TASKS_RAW = [']
    for t in tasks:
        lines.append('    {')
        lines.append(f"        id: '{t['id']}',")
        lines.append('        structures: [')
        for s in t['structures']:
            lines.append(fmt_struct(s, '            ') + ',')
        lines.append('        ]')
        lines.append('    },')
    lines.append('];')
    return '\n'.join(lines)

def format_block2_js(tasks):
    lines = ['const BLOCK2_TASKS_RAW = [']
    for t in tasks:
        a, b = t['structureA'], t['structureB']
        lines.append('    {')
        lines.append(f"        id: '{t['id']}',")
        lines.append(f"        structureA: {fmt_struct(a, '')},")
        lines.append(f"        structureB: {fmt_struct(b, '')}")
        lines.append('    },')
    lines.append('];')
    return '\n'.join(lines)

# ── Update app.js ─────────────────────────────────────────────
def update_app_js(b1_js, b2_js):
    with open(APP_JS, 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(r'const BLOCK1_TASKS_RAW = \[.*?\];', b1_js, content, flags=re.DOTALL)
    content = re.sub(r'const BLOCK2_TASKS_RAW = \[.*?\];', b2_js, content, flags=re.DOTALL)
    with open(APP_JS, 'w', encoding='utf-8') as f:
        f.write(content)

# ── Main ──────────────────────────────────────────────────────
if __name__ == '__main__':
    files = get_stl_files(MODELS_DIR)
    print(f"Found {len(files)} STL files in {MODELS_DIR}/\n")

    groups = group_by_similarity(files, SIMILARITY_THRESHOLD)
    ungrouped = [f for f in files if not any(f in g for g in groups)]

    print("=" * 60)
    print("  AUTO-DETECTED GROUPS")
    print("=" * 60)
    for i, g in enumerate(groups, 1):
        print(f"\n  Group {i} ({len(g)} models):")
        for f in g:
            sz = os.path.getsize(os.path.join(MODELS_DIR, f)) / (1024*1024)
            print(f"    - {f}  ({sz:.1f} MB)")
    if ungrouped:
        print(f"\n  Ungrouped ({len(ungrouped)} models, skipped):")
        for f in ungrouped:
            print(f"    - {f}")

    b1 = generate_block1(groups)
    b2 = generate_block2(groups)
    print(f"\n{'=' * 60}")
    print(f"  GENERATED TASKS")
    print(f"{'=' * 60}")
    print(f"  Block 1 (Ranking, 3-way):  {len(b1)} tasks")
    print(f"  Block 2 (Pairwise, 2-way): {len(b2)} tasks")

    print(f"\n{'=' * 60}")
    resp = input("  Update app.js with these tasks? [Y/n]: ").strip().lower()
    if resp in ('', 'y', 'yes'):
        update_app_js(format_block1_js(b1), format_block2_js(b2))
        print("\n  [OK] app.js updated successfully!")
    else:
        print("\n  [SKIP] Cancelled. app.js was not modified.")
