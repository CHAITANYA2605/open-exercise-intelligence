# Changelog

All notable changes to Open Exercise Intelligence are documented in this file.

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.
Dataset versioning follows [Semantic Versioning](https://semver.org/).

---

## [0.9.0-beta] - 2026-11-08
### Added
- 866 CC0 exercise records (AI-generated, unreviewed) across 9 categories
- Muscle taxonomy (75 muscles), equipment registry (50 items)
- Full-text search engine with partial match, muscle aliases, relevance scoring
- JavaScript/TypeScript, Python, Java, Dart/Flutter SDKs
- Spring Boot REST API (Java 21) with 11 endpoints
- React developer portal (Vite + Tailwind)
- GitHub Actions CI (validate-dataset, validate-media, build-api, test-search)
- Exercise review workflow infrastructure
- 4-dimension dataset health scoring
- UUID v4 migration (414 exercises corrected)
- Category taxonomy unification (9 canonical categories)

### Known limitations
- All exercises are UNREVIEWED — requires human expert review for v1.0.0
- JS and Python SDKs not yet published to npm/PyPI
- 3 variant cycle relationships need human resolution

---

## [1.0.0] — 2026-11-08

### Added
- M1: Project foundation — JSON schemas (exercise, muscle, equipment, media-asset), muscle taxonomy (75+ muscles), equipment registry (50+ items), exercise categories, movement patterns, governance documents (CONTRIBUTING, GOVERNANCE, CODE_OF_CONDUCT, SECURITY, LICENSING, THIRD_PARTY_NOTICES)
- M2: 866 CC0 exercise files across 15 categories (chest, legs, arms, back, shoulders, rehabilitation, core, glutes, stretching, plyometric, functional, olympic, strongman, cardio, neck); `scripts/validate.js`, `scripts/check-dataset.js`, `scripts/export-flat-json.js`, `scripts/export-csv.js`, `scripts/import-csv.js`
- M3: Full-text search engine (`search/index.js`), JavaScript/TypeScript SDK (`sdks/js/`), Python SDK (`sdks/python/`), Java SDK (`sdks/java/`)
- M4: Spring Boot REST API (`api/server/`) with OpenAPI 3.1 spec, React + TypeScript + Vite + Tailwind developer portal (`portal/`) with Home, Docs, Explore, Playground, MediaContribution pages, Dart/Flutter SDK (`sdks/dart/`), Docker Compose setup
- M5: Media asset registry (`data/media/registry.json`), provenance tracking, `scripts/validate-media.js`, `scripts/check-license-compatibility.js`, `scripts/generate-attributions.js`
- M6: Community platform — `community/` directory with submission templates (exercise, correction, media) and contribution README; admin CLI scripts (`scripts/admin/review-submission.js`, `scripts/admin/export-release.js`, `scripts/admin/stats.js`); GitHub Actions CI workflows (validate-dataset, validate-media, release-dataset, build-api); portal Community page (`/community`) and Admin Dashboard (`/admin`); root README updated with Community section, Project Structure, Scripts Reference, and License section

---

## [0.1.0] — Milestone 1: Project Foundation

### Added
- Project governance documents (README, LICENSE, LICENSING, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, GOVERNANCE)
- Split licensing model: MIT for code, CC0 1.0 for original exercise data, CC BY 4.0 for documentation
- THIRD_PARTY_NOTICES.md with asset provenance registry template and exclusion list
- JSON Schema (draft-07) for exercise records (`schema/exercise.schema.json`)
- JSON Schema for muscle taxonomy entries (`schema/muscle.schema.json`)
- JSON Schema for equipment entries (`schema/equipment.schema.json`)
- JSON Schema for media assets (`schema/media-asset.schema.json`)
- Complete muscle taxonomy with 60+ individual muscles across 17 major muscle groups (`data/muscles/muscles.json`)
- Complete equipment list with 35+ items across all major categories (`data/equipment/equipment.json`)
- Exercise categories reference data (`data/categories/categories.json`)
- Movement patterns reference data (`data/movement-patterns/movement-patterns.json`)
- Node.js dataset validation script (`scripts/validate.js`)
- Architecture document (`docs/architecture.md`)

### Notes
- No exercise records are included in this release. Exercise data will be added in Milestone 2.
- The validation script is fully functional and ready for Milestone 2 exercise submission.

---

[1.0.0]: https://github.com/CHAITANYA2605/open-exercise-intelligence/releases/tag/v1.0.0
[0.1.0]: https://github.com/CHAITANYA2605/open-exercise-intelligence/releases/tag/v0.1.0
