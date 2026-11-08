# Scripts

This directory contains tooling for dataset validation, import, and export.

## validate.js

Validates exercise JSON files in `data/exercises/` against:
- Schema rules (required fields, enum values, UUID format, slug format)
- Referential integrity (muscle IDs exist in `muscles.json`, equipment IDs exist in `equipment.json`)
- Duplicate detection (exercise_id and slug)

**Requirements**: Node.js 18+. No external dependencies.

```bash
# Validate all exercises
node scripts/validate.js

# Validate with verbose output
node scripts/validate.js --verbose

# Validate a single file
node scripts/validate.js --file data/exercises/barbell-bench-press.json
```

**Exit codes**:
- `0` — All validations passed
- `1` — One or more errors found

The CI pipeline runs this script on every pull request. PRs that fail validation will not be merged.

## Planned scripts (Milestone 2+)

| Script | Description |
|---|---|
| `import-csv.js` | Import exercises from CSV format |
| `import-yaml.js` | Import exercises from YAML format |
| `export-csv.js` | Export dataset to CSV |
| `export-index.js` | Regenerate `data/exercises/index.json` |
| `check-licenses.js` | Verify all media assets have approved license records |
| `generate-stats.js` | Generate dataset statistics report |
