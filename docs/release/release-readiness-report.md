# Release Readiness Report — OEI

**Generated:** 2026-11-08  
**Current version:** 0.9.0-beta  
**Target version:** 1.0.0  
**Report author:** Production hardening cycle (automated)

---

## Executive Summary

OEI v0.9.0-beta is a solid foundation for a production exercise knowledge platform. The release pipeline, schema, validation, and search infrastructure are now hardened. The critical blocker for v1.0.0 is human expert review of the 866 AI-generated exercises — no automated process can substitute.

---

## P0 Gate Status

| Gate | Status | Notes |
|---|---|---|
| RG-01: ≥500 APPROVED exercises | ❌ OPEN | 0/866 approved. Human review required. |
| RG-02: 3 variant cycles resolved | ❌ OPEN | Documented in `docs/data/variant-review-report.md`. Awaiting maintainer decision. |
| RG-03: CI green on clean main | ⚠️ PARTIAL | Workflow files exist. Needs clean run on GitHub. |
| RG-04: npm package published | ❌ OPEN | `@oei/exercise-sdk` not yet published to registry. |
| RG-05: PyPI package published | ❌ OPEN | `oei-exercise-sdk` not yet published. |
| RG-06: Java/Maven SDK verified | ❌ OPEN | Requires Maven Central namespace verification. |
| RG-07: Dart/Flutter SDK verified | ❌ OPEN | Requires pub.dev verification. |

---

## Infrastructure Changes Completed (This Cycle)

### Schema (v1.1.0)
- ✅ NEEDS_REVISION state added (5-state review lifecycle)
- ✅ Conditional required: `approved_at`/`approved_by` enforced for APPROVED exercises
- ✅ Typed `relationships` array (8 relationship types)
- ✅ `difficulty_dimensions` object (7 dimensions, 0–10 scale)
- ✅ `breathing` field in execution block
- ✅ `review_notes` and `content_version` fields

### Validation
- ✅ NEEDS_REVISION enforcement (review_notes required)
- ✅ APPROVED enforcement (approved_at + approved_by required)
- ✅ Uses data/taxonomy/categories.json as single source of truth

### Dataset Generation
- ✅ Versioned wrapper format: `{dataset, version, schema_version, generated_at, review_policy, exercise_count, exercises}`
- ✅ Two artifacts: `oei-dataset-all.json` (all), `oei-dataset-approved.json` (approved-only)
- ✅ Two index files: `oei-index-all.json`, `oei-index-approved.json`
- ✅ SHA-256 checksums generated alongside artifacts
- ✅ `scripts/generation/build-dataset.js` — reproducible generation

### Release Safety
- ✅ `scripts/release-check.js` — dry-run with P0 error detection
- ✅ Exit code 1 on P0 errors (blocked from release)
- ✅ Generic placeholder text detection
- ✅ Broken reference detection

### Search
- ✅ Fuzzy matching (Levenshtein, zero dependencies)
- ✅ Synonym expansion (16 term mappings)
- ✅ `review_status` filter param
- ✅ Pagination (`page`, `per_page`) with `total_pages` in response

### Portal
- ✅ GitHub URLs corrected in 4 files (Navbar, Home, Community, MediaContribution)

### Documentation
- ✅ `docs/architecture/architecture-decisions.md` — 8 ADRs
- ✅ `docs/architecture/implementation-audit.md`
- ✅ `docs/data/human-review-report.md`
- ✅ `docs/data/variant-review-report.md`

### Testing
- ✅ `tests/fixtures/` — 5 canonical test fixtures
- ✅ `tests/search.test.js` — search engine tests
- ✅ `tests/contract/dataset-format.test.js`
- ✅ `tests/contract/api-contract.test.js`

---

## Dataset Quality Summary

| Dimension | Score | Notes |
|---|---|---|
| Structural validity | 100% | All 866 pass UUID, schema, reference checks |
| Content completeness | ~40% | Missing breathing, coaching cues variable |
| Human review coverage | 0% | All UNREVIEWED |
| Provenance coverage | 100% | All have CC0-1.0 license, ai-generated-unreviewed |
| Production eligibility | 0% | No APPROVED exercises |

---

## Remaining Work for v1.0.0

### Blockers (cannot ship without these)
1. **Human expert review** — 500+ exercises need APPROVED status
2. **Variant cycle resolution** — 3 cycles need maintainer decision
3. **Registry publishing** — npm, PyPI, Maven Central, pub.dev

### Recommended pre-review improvements
1. Run `node scripts/release-check.js` to find any placeholder text to fix first
2. Improve exercises with generic descriptions before sending to reviewers
3. Add breathing guidance to exercises (currently 0% coverage)

### Not blocking v1.0.0 but high value
- Spring Boot API: add `/alternatives` endpoint
- SDK contract tests with live API
- Portal: add UNREVIEWED warning banner on Explore page
- Analytics dashboard for review progress
- Advanced difficulty dimensions data (requires exercise science input)

---

## Package Registry Status

| Package | Registry | Status | Canonical Name |
|---|---|---|---|
| JavaScript SDK | npm | Not published | `@oei/exercise-sdk` |
| Python SDK | PyPI | Not published | `oei-exercise-sdk` |
| Java SDK | Maven Central | Not published | `io.oei:exercise-sdk` |
| Dart SDK | pub.dev | Not published | `oei` |

Publishing requires:
- npm: Create `@oei` organization or user scope
- PyPI: `twine upload` with valid PyPI account
- Maven Central: Namespace verification for `io.oei`, GPG signing, Sonatype OSSRH
- pub.dev: `dart pub publish` with verified publisher

---

## Security and Licensing

- Source code: MIT ✅
- Exercise data: CC0 1.0 ✅ (original text, no proprietary content)
- Documentation: CC BY 4.0 ✅
- No proprietary third-party assets in dataset ✅
- No GPLv2/AGPL dependencies introduced ✅
- Security scanning: Not yet run (RG-13 gate)

---

## Recommended Next Steps

1. `git add . && git commit -m "feat: OEI production hardening — schema v1.1.0, fuzzy search, typed relationships, release dry-run"` then push
2. File 3 GitHub issues for variant cycles
3. Begin human expert review process (target: 50 exercises/week)
4. Set up GitHub repository metadata (description, topics, social preview)
5. Run `node scripts/generation/build-dataset.js` to generate v0.9.0-beta artifacts
6. Create GitHub Release v0.9.0-beta with dataset artifacts and checksums
