# OEI Taxonomy Registry

This directory is the **single source of truth** for all taxonomy values used across the Open Exercise Intelligence dataset.

## Files

| File | Contents |
|------|----------|
| `categories.json` | Exercise categories (strength, cardio, etc.) with descriptions and counts |

## Canonical categories

The canonical category list lives in `categories.json`. All other files must derive from it:

- `schema/exercise.schema.json` — `category` enum
- `scripts/validate.js` — `VALID_CATEGORIES` array
- `api/openapi.yaml` — `category` parameter enum

**Do not add a category to only one of these files.** Add it here first, then propagate.

## How to add a new category

1. Add an entry to `categories.json` with a unique `id`, a human-readable `label`, a `description`, and `exercise_count: 0`.
2. Update the `category` enum in `schema/exercise.schema.json`.
3. Update `VALID_CATEGORIES` in `scripts/validate.js`.
4. Update the `category` enum in `api/openapi.yaml`.
5. Run `node scripts/validate.js data/exercises` to confirm no existing exercises break.
6. Update `last_updated` in `categories.json`.

## How to add a new taxonomy dimension

Create a new `<dimension>.json` file following the same pattern as `categories.json` (schema_version, last_updated, entries array with id/label/description/count). Then wire it into the schema, validator, and API in the same way.

## Naming rules

- `id` values are lowercase, hyphen-separated, and stable. Never rename an id; deprecate and replace instead.
- `exercise_count` values are updated by running the bundle regeneration script (`scripts/admin/regenerate-bundles.py` or the inline Python in the developer docs).
