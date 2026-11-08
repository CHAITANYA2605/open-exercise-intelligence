# Test Fixtures

Canonical exercise fixtures shared across all OEI test suites. Use these in SDK contract tests, validator tests, and search tests.

| File | Purpose |
|---|---|
| `valid-approved.json` | A complete, valid APPROVED exercise. Must pass schema validation, appear in approved exports, have approved_at and approved_by. |
| `valid-unreviewed.json` | A complete, valid UNREVIEWED exercise. Must pass schema validation but must be excluded from approved exports. |
| `invalid-missing-fields.json` | An exercise missing required fields (name, category, muscles, etc.). Must fail validation. |
| `invalid-broken-refs.json` | An exercise with nonexistent muscle_id and equipment_id references. Must fail referential integrity checks. |

## Usage

```js
const approved = require('./fixtures/valid-approved.json')
const unreviewed = require('./fixtures/valid-unreviewed.json')
const invalidMissing = require('./fixtures/invalid-missing-fields.json')
const invalidRefs = require('./fixtures/invalid-broken-refs.json')
```

These fixtures use IDs that do not conflict with real exercise IDs in `data/exercises/`.
