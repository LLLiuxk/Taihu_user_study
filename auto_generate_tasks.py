"""
auto_generate_tasks.py
Scan models/ directory, group STL files by model name,
generate Block 1 (ranking) and Block 2 (pairwise) tasks,
and update app.js automatically.

Naming convention: model_parameter_vp.stl
  - model:     grouping key (e.g. boulder, moonrock, namaqualand, RockBr)
  - parameter: structure parameter (e.g. 50101030, 25252525)
  - vp:        visual permeability value (e.g. 0.8434)
"""
import os
import re
import random
from itertools import combinations
from collections import defaultdict

MODELS_DIR = "models"
APP_JS = "app.js"
MAX_RANKING_TASKS_PER_GROUP = 10
MAX_PAIRWISE_TASKS_PER_GROUP = 10

# ── Parse filename ────────────────────────────────────────────
def parse_filename(filename):
    """
    Parse 'model_parameter_vp.stl' into (model, parameter, vp_value).
    The VP value is the last underscore-separated segment (before .stl).
    The model name is the first segment (alphabetic prefix).
    Everything in between is the parameter.
    """
    name = filename.replace('.stl', '')
    # VP value is the last segment after the last underscore
    last_underscore = name.rfind('_')
    if last_underscore == -1:
        return name, '', 0.0

    vp_str = name[last_underscore + 1:]
    rest = name[:last_underscore]

    # Try to parse VP as float
    try:
        vp_value = float(vp_str)
    except ValueError:
        vp_value = 0.0

    # Model name is the first segment (before the first underscore)
    first_underscore = rest.find('_')
    if first_underscore == -1:
        model = rest
        parameter = ''
    else:
        model = rest[:first_underscore]
        parameter = rest[first_underscore + 1:]

    return model, parameter, vp_value

# ── Grouping ──────────────────────────────────────────────────
def group_files(filenames):
    """Group files by model name (first segment of filename)."""
    groups = defaultdict(list)
    for f in filenames:
        model, parameter, vp = parse_filename(f)
        groups[model].append({
            'filename': f,
            'model': model,
            'parameter': parameter,
            'vpValue': vp
        })
    # Sort each group by VP value
    for key in groups:
        groups[key].sort(key=lambda x: x['vpValue'])
    return dict(groups)

# ── Task Generation ───────────────────────────────────────────
def make_structure(entry):
    sid = entry['filename'].replace('.stl', '')
    return {
        'id': sid,
        'vpValue': entry['vpValue'],
        'stl': f"models/{entry['filename']}"
    }

def generate_block1(groups):
    random.seed(42)
    tasks, tid = [], 1
    for model_name, entries in sorted(groups.items()):
        if len(entries) < 3:
            continue
        combos = list(combinations(entries, 3))
        if len(combos) > MAX_RANKING_TASKS_PER_GROUP:
            combos = random.sample(combos, MAX_RANKING_TASKS_PER_GROUP)
        for combo in combos:
            tasks.append({
                'id': f'B1_G{tid}',
                'structures': [make_structure(e) for e in combo]
            })
            tid += 1
    return tasks

def generate_block2(groups):
    random.seed(42)
    tasks, tid = [], 1
    for model_name, entries in sorted(groups.items()):
        if len(entries) < 2:
            continue
        pairs = list(combinations(entries, 2))
        if len(pairs) > MAX_PAIRWISE_TASKS_PER_GROUP:
            pairs = random.sample(pairs, MAX_PAIRWISE_TASKS_PER_GROUP)
        for a, b in pairs:
            tasks.append({
                'id': f'B2_P{tid}',
                'structureA': make_structure(a),
                'structureB': make_structure(b)
            })
            tid += 1
    return tasks

# ── JS Code Generation ────────────────────────────────────────
def fmt_struct(s):
    return f"{{ id: '{s['id']}', vpValue: {s['vpValue']}, stl: '{s['stl']}' }}"

def format_block1_js(tasks):
    lines = ['const BLOCK1_TASKS_RAW = [']
    for t in tasks:
        lines.append('    {')
        lines.append(f"        id: '{t['id']}',")
        lines.append('        structures: [')
        for s in t['structures']:
            lines.append(f'            {fmt_struct(s)},')
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
        lines.append(f'        structureA: {fmt_struct(a)},')
        lines.append(f'        structureB: {fmt_struct(b)}')
        lines.append('    },')
    lines.append('];')
    return '\n'.join(lines)

# ── Update app.js ─────────────────────────────────────────────
def update_app_js(b1_js, b2_js):
    with open(APP_JS, 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(
        r'const BLOCK1_TASKS_RAW = \[.*?\];',
        b1_js, content, flags=re.DOTALL
    )
    content = re.sub(
        r'const BLOCK2_TASKS_RAW = \[.*?\];',
        b2_js, content, flags=re.DOTALL
    )
    with open(APP_JS, 'w', encoding='utf-8') as f:
        f.write(content)

# ── Main ──────────────────────────────────────────────────────
if __name__ == '__main__':
    stl_files = sorted([
        f for f in os.listdir(MODELS_DIR)
        if f.lower().endswith('.stl')
    ])
    print(f"Found {len(stl_files)} STL files in {MODELS_DIR}/\n")

    groups = group_files(stl_files)

    print("=" * 64)
    print("  AUTO-DETECTED GROUPS  (by model name)")
    print("=" * 64)
    for model_name, entries in sorted(groups.items()):
        print(f"\n  [{model_name}] ({len(entries)} models):")
        for e in entries:
            sz = os.path.getsize(os.path.join(MODELS_DIR, e['filename'])) / (1024*1024)
            print(f"    - {e['filename']}  (VP={e['vpValue']:.4f}, {sz:.1f} MB)")

    b1 = generate_block1(groups)
    b2 = generate_block2(groups)

    print(f"\n{'=' * 64}")
    print(f"  GENERATED TASKS")
    print(f"{'=' * 64}")
    for model_name, entries in sorted(groups.items()):
        n = len(entries)
        r_count = min(len(list(combinations(range(n), 3))), MAX_RANKING_TASKS_PER_GROUP) if n >= 3 else 0
        p_count = min(len(list(combinations(range(n), 2))), MAX_PAIRWISE_TASKS_PER_GROUP) if n >= 2 else 0
        print(f"  [{model_name}]: {r_count} ranking + {p_count} pairwise")
    print(f"  ----------------------------------------")
    print(f"  Total:  Block 1 = {len(b1)} tasks,  Block 2 = {len(b2)} tasks")

    print(f"\n{'=' * 64}")
    resp = input("  Update app.js with these tasks? [Y/n]: ").strip().lower()
    if resp in ('', 'y', 'yes'):
        update_app_js(format_block1_js(b1), format_block2_js(b2))
        print("\n  [OK] app.js updated successfully!")
    else:
        print("\n  [SKIP] Cancelled. app.js was not modified.")
