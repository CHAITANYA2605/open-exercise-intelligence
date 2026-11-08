# OEI Implementation Audit

**Date:** 2026-11-08  
**Auditor:** Phase 2 implementation pass  
**Repository:** https://github.com/CHAITANYA2605/open-exercise-intelligence

---

## Audit Scope

Full repository audit performed before Phase 2 implementation began. This document records the state found, issues identified, and changes made.

---

## Subsystem Status

### Schema (`schema/exercise.schema.json`)

**State before Phase 2:**
- Draft-07 JSON Schema with solid core structure
- 4 review statuses (UNREVIEWED/IN_REVIEW/APPROVED/REJECTED) — missing NEEDS_REVISION
- `approved_at`/`approved_by` optional with no conditional enforcement
- No typed relationship model (only untyped `variants` object)
- No `difficulty_dimensions` block
- `breathing_instructions` field existed under `execution` (correct)
- No `review_notes` or `content_version` fields in metadata

**Changes made in Phase 2:**
- Added `NEEDS_REVISION` to `review_status` enum
- Added `if/then` conditional: `review_status = APPROVED` requires `approved_at` + `approved_by`
- Added typed `relationships` array with 8 relationship types
- Added `difficulty_dimensions` object (0-10 per dimension)
- Added `review_notes` and `content_version` to metadata
- Schema version bumped to 1.1.0

---

### Validation (`scripts/validate.js`)

**State before Phase 2:**
- Zero-dependency validator, solid structure
- Checked UUID format, slug format, enums, muscle/equipment refs, execution, training_parameters
- No NEEDS_REVISION in valid statuses
- No enforcement of approved_at/approved_by when status=APPROVED
- No check for NEEDS_REVISION requiring review_notes

**Changes made in Phase 2:**
- Added `VALID_REVIEW_STATUSES` Set (5 values including NEEDS_REVISION)
- Added APPROVED enforcement: approved_at and approved_by required
- Added NEEDS_REVISION enforcement: review_notes required
- Added comment pointing to data/taxonomy/categories.json as authoritative

---

### Dataset (`data/`)

**State before Phase 2:**
- `data/oei-dataset.json` — bare flat array (no versioned wrapper)
- `data/dataset-version.json` — exists, schema_version was 1.0.0
- `data/taxonomy/categories.json` — 9-category canonical taxonomy ✓
- `data/categories/categories.json` — legacy 7-category file (different schema, superseded)
- 866 exercises, all UNREVIEWED, all with CC0 provenance fields

**Changes made in Phase 2:**
- Created `scripts/generation/build-dataset.js` — generates 4 versioned artifact files
- Created `data/generated/` directory for generated artifacts
- Updated `data/dataset-version.json` schema_version to 1.1.0
- Added deprecation README to `data/categories/`

**New artifact files (generated, not committed):**
- `data/generated/oei-dataset-all.json` — versioned wrapper, all exercises
- `data/generated/oei-dataset-approved.json` — versioned wrapper, APPROVED only
- `data/generated/oei-index-all.json` — lightweight index, all exercises
- `data/generated/oei-index-approved.json` — lightweight index, APPROVED only

**Breaking change note:** `data/oei-dataset.json` (bare array) is now a legacy file. All new consumers should use `data/generated/oei-dataset-all.json`.

---

### Release Pipeline (`scripts/`)

**State before Phase 2:**
- `scripts/admin/review-exercise.js` — CLI for approve/reject/list
- `scripts/admin/export-approved.js` — exports APPROVED exercises
- No comprehensive dry-run/release-check command

**Changes made in Phase 2:**
- Created `scripts/release-check.js` — comprehensive dry-run with P0 error detection
- Created `package.json` at root with `npm run release:check` script
- Created `scripts/generation/build-dataset.js` — reproducible dataset generation

---

### Search (`search/index.js`)

**State:** 378 lines. Accent normalization via NFD, muscle slug aliases, tiered relevance scoring, expert difficulty sort. No fuzzy search (no Levenshtein/edit distance). "Benchpress" → 0 results.

**Remaining work (Phase 3):**
- Add fuzzy matching (token edit distance)
- Add synonym dictionaries
- Add typed relationship ranking
- Add equipment/movement substitution queries

---

### API (`api/`)

**State:** Spring Boot 3.3.5, port 8080, OpenAPI 3.1 spec. Controllers exist for exercises, muscles, equipment. Media endpoints added in prior audit.

**Remaining work (Phase 4):**
- Add `/v1/exercises/{slug}/alternatives` endpoint
- Align Java models with schema v1.1.0 (add NEEDS_REVISION, relationships, difficulty_dimensions)
- Add contract tests

---

### SDKs (`sdks/`)

**State:** JS, Python, Java, Dart SDKs exist. No unit tests, no contract tests, no shared fixtures.

**Remaining work (Phase 4):**
- Create `tests/fixtures/` with canonical exercise fixtures
- Add unit tests per SDK
- Align SDK models with schema v1.1.0

---

### Developer Portal (`portal/`)

**State:** React + Vite + Tailwind. 6 pages. GitHub URLs in Navbar.tsx, Home.tsx, Community.tsx, MediaContribution.tsx were using the old `open-exercise-intelligence/oei` URL — fixed in production hardening cycle.

**Remaining work (Phase 5):**
- Fix 4 incorrect GitHub URLs
- Add UNREVIEWED dataset warning on Explore page
- Update Quick Start to reference generated dataset files

---

### CI/CD (`.github/workflows/`)

**State:** validate-dataset.yml, validate-media.yml, release-dataset.yml, build-api.yml, test-search.yml all exist.

**Remaining work (Phase 7):**
- Add release:check step to validate-dataset.yml
- Add contract test workflow

---

## Issues Found and Status

| ID | Issue | Severity | Status |
|---|---|---|---|
| I-01 | NEEDS_REVISION missing from schema enum | P0 | Fixed |
| I-02 | approved_at/approved_by not enforced for APPROVED | P0 | Fixed |
| I-03 | No typed relationship model | P1 | Fixed (schema added, data not yet populated) |
| I-04 | No release dry-run command | P0 | Fixed |
| I-05 | Dataset format is bare array, not versioned wrapper | P0 | Fixed (generator created) |
| I-06 | Duplicate taxonomy files (different schemas) | P1 | Mitigated (deprecated data/categories/) |
| I-07 | Wrong GitHub URLs in 4 portal files | P1 | Pending (Phase 5) |
| I-08 | No fuzzy search | P1 | Pending (Phase 3) |
| I-09 | No SDK tests or shared fixtures | P1 | Pending (Phase 4) |
| I-10 | Missing difficulty_dimensions | P2 | Fixed (schema added) |

---

## Remaining Phases

- **Phase 3:** Fuzzy search, synonym dictionaries, typed relationships in data, substitution engine
- **Phase 4:** API /alternatives endpoint, SDK alignment, shared fixtures, contract tests
- **Phase 5:** Portal GitHub URL fixes, UNREVIEWED warning, documentation updates
- **Phase 6:** Training goals, prerequisites, analytics, AI retrieval layer
- **Phase 7:** Full release readiness validation

---

## Human Actions Required

1. **Variant cycle resolution** — 3 cycles documented in `docs/variant-cycles.md` await human expert decisions
2. **Exercise review** — 866 exercises are UNREVIEWED; ≥500 APPROVED needed for v1.0.0-rc
3. **Package publishing** — npm, PyPI, Maven, Dart registries require manual publishing with credentials
