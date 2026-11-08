#!/usr/bin/env python3
"""
fix-broken-refs.py — Audit and fix broken muscle/equipment references in exercise files.

Findings (2026-11-08):
  Broken muscle refs: 9 exercises referencing muscle_id 33333333-0005-4000-a000-000000000003
    (slug: infraspinatus) which does not exist in muscles.json.
  Correct muscle_id for infraspinatus: 22222222-0007-4000-a000-000000000002

  Broken equipment refs: 0

  Unfixable refs: 0

What was fixed:
  All 9 exercises had their muscle_id for infraspinatus updated from
  33333333-0005-4000-a000-000000000003 → 22222222-0007-4000-a000-000000000002.
  The muscle_slug field was left unchanged (already correct: "infraspinatus").
"""

import json
import os
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MUSCLES_FILE = os.path.join(REPO_ROOT, 'data', 'muscles', 'muscles.json')
EQUIPMENT_FILE = os.path.join(REPO_ROOT, 'data', 'equipment', 'equipment.json')
EXERCISES_DIR = os.path.join(REPO_ROOT, 'data', 'exercises')

def load_references():
    muscles = {m['muscle_id']: m['slug'] for m in json.load(open(MUSCLES_FILE))}
    equipment = {e['equipment_id']: e['name'] for e in json.load(open(EQUIPMENT_FILE))}
    return muscles, equipment

def build_slug_to_id(muscles_file):
    """Build a slug -> muscle_id map for correction lookups."""
    return {m['slug']: m['muscle_id'] for m in json.load(open(muscles_file))}

def audit_and_fix(dry_run=False):
    muscles, equipment = load_references()
    slug_to_id = build_slug_to_id(MUSCLES_FILE)

    broken_muscle = []
    broken_equip = []
    fixed_muscle = []
    unfixable_muscle = []

    for root, dirs, files in os.walk(EXERCISES_DIR):
        for f in sorted(files):
            if not f.endswith('.json'):
                continue
            path = os.path.join(root, f)
            try:
                ex = json.load(open(path))
            except Exception as e:
                print(f"ERROR reading {path}: {e}", file=sys.stderr)
                continue

            slug = ex.get('slug', f)
            changed = False

            for role in ['primary', 'secondary', 'stabilizers']:
                for entry in ex.get('muscles', {}).get(role, []):
                    mid = entry.get('muscle_id')
                    if mid and mid not in muscles:
                        muscle_slug = entry.get('muscle_slug', '')
                        broken_muscle.append((slug, role, mid, muscle_slug))
                        # Try to fix by slug lookup
                        if muscle_slug and muscle_slug in slug_to_id:
                            correct_id = slug_to_id[muscle_slug]
                            print(f"FIX: {slug} [{role}] {mid} -> {correct_id} (slug={muscle_slug})")
                            if not dry_run:
                                entry['muscle_id'] = correct_id
                                changed = True
                            fixed_muscle.append((slug, role, mid, correct_id, muscle_slug))
                        else:
                            print(f"UNFIXABLE: {slug} [{role}] {mid} (slug={muscle_slug!r} not found)")
                            unfixable_muscle.append((slug, role, mid, muscle_slug))

            for eid in ex.get('equipment_required', []):
                if eid and eid not in equipment:
                    broken_equip.append((slug, 'required', eid))
                    print(f"FLAG: {slug} [required] equipment {eid} not in equipment.json")

            for eid in ex.get('equipment_optional', []):
                if eid and eid not in equipment:
                    broken_equip.append((slug, 'optional', eid))
                    print(f"FLAG: {slug} [optional] equipment {eid} not in equipment.json")

            if changed:
                with open(path, 'w') as out:
                    json.dump(ex, out, indent=2)
                    out.write('\n')

    print(f"\n--- Summary ---")
    print(f"Broken muscle refs found: {len(broken_muscle)}")
    print(f"  Fixed: {len(fixed_muscle)}")
    print(f"  Unfixable (flagged): {len(unfixable_muscle)}")
    print(f"Broken equipment refs found: {len(broken_equip)}")
    return broken_muscle, broken_equip, fixed_muscle, unfixable_muscle

if __name__ == '__main__':
    dry_run = '--dry-run' in sys.argv
    if dry_run:
        print("DRY RUN — no files will be modified\n")
    audit_and_fix(dry_run=dry_run)
