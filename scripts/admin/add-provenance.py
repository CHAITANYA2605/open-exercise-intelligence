#!/usr/bin/env python3
"""
add-provenance.py — Add missing provenance metadata to exercise files.

Rules:
  - Sets metadata.license = "CC0-1.0" if missing
  - Sets metadata.review_status = "UNREVIEWED" if missing (NOT "APPROVED" — AI-generated content)
  - Sets metadata.contributor_attestation = "ai-generated-unreviewed" if missing
  - Does NOT overwrite fields that already exist
  - Does NOT modify exercise_id, slug, name, or any content fields

Run with --dry-run to preview changes without writing files.
"""

import json
import os
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
EXERCISES_DIR = os.path.join(REPO_ROOT, 'data', 'exercises')

PROVENANCE_DEFAULTS = {
    'license': 'CC0-1.0',
    'review_status': 'UNREVIEWED',
    'contributor_attestation': 'ai-generated-unreviewed',
}

def process(dry_run=False):
    total = 0
    modified = 0
    field_added = {k: 0 for k in PROVENANCE_DEFAULTS}

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

            total += 1
            m = ex.setdefault('metadata', {})
            changed = False

            for field, default_value in PROVENANCE_DEFAULTS.items():
                if not m.get(field):
                    m[field] = default_value
                    field_added[field] += 1
                    changed = True

            if changed:
                modified += 1
                if not dry_run:
                    with open(path, 'w') as out:
                        json.dump(ex, out, indent=2)
                        out.write('\n')

    print(f"Total exercises: {total}")
    print(f"Modified: {modified}")
    for field, count in field_added.items():
        print(f"  Added {field}: {count}")
    if dry_run:
        print("\nDRY RUN — no files written")

if __name__ == '__main__':
    dry_run = '--dry-run' in sys.argv
    process(dry_run=dry_run)
