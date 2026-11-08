# Architecture Decisions — OEI

> Decision log for the OEI production hardening cycle (November 2026).

---

## ADR-001: Versioned dataset wrapper format

**Date:** 2026-11-08  
**Status:** Accepted

**Context:** `oei-dataset.json` was a bare JSON array with no version, schema version, or generation timestamp. This made it impossible for consumers to detect dataset changes or validate compatibility.

**Decision:** All generated dataset artifacts use a versioned wrapper:
```json
{
  "dataset": "Open Exercise Intelligence",
  "version": "0.9.0-beta",
  "schema_version": "1.1.0",
  "generated_at": "...",
  "review_policy": "all | approved-only",
  "exercise_count": 866,
  "exercises": []
}
```

**Two distinct artifacts:**
- `oei-dataset-all.json` — all exercises including UNREVIEWED
- `oei-dataset-approved.json` — APPROVED only (production-safe)

**Consequences:** Breaking change for any consumer reading the flat array. Migration: read `data.exercises` instead of the root array. SDKs updated accordingly.

---

## ADR-002: Five-state review lifecycle

**Date:** 2026-11-08  
**Status:** Accepted

**Context:** The original schema had four review states (UNREVIEWED, IN_REVIEW, APPROVED, REJECTED). Content that required editorial work after initial review had no clear state.

**Decision:** Add NEEDS_REVISION as the fifth state between IN_REVIEW and APPROVED:

```
UNREVIEWED → IN_REVIEW → APPROVED
                      ↘ NEEDS_REVISION → IN_REVIEW (re-review)
                      ↘ REJECTED
```

**Consequences:** All validation, scripts, API models, SDKs, and documentation updated to include NEEDS_REVISION.

---

## ADR-003: Conditional required fields for APPROVED exercises

**Date:** 2026-11-08  
**Status:** Accepted

**Context:** `approved_at` and `approved_by` were optional in the JSON Schema even for APPROVED exercises. This allowed exercises to be marked APPROVED without audit trail.

**Decision:** Use JSON Schema `if/then` to require `approved_at` and `approved_by` when `review_status === "APPROVED"`. Both must be non-empty strings.

**Consequences:** Any exercise falsely labeled APPROVED without approval metadata fails validation and cannot enter the approved dataset.

---

## ADR-004: Typed exercise relationships alongside legacy variants

**Date:** 2026-11-08  
**Status:** Accepted

**Context:** Exercise relationships were stored as untyped slug arrays inside a `variants` block (easier, harder, unilateral, bilateral, equipment_alternatives). This prevented representing the reason a relationship exists, its direction, or its review status.

**Decision:** Add a new `relationships` array to the exercise schema with typed relationship objects:
- `relationship_type`: PROGRESSION | REGRESSION | VARIATION | EQUIPMENT_SUBSTITUTION | UNILATERAL_COUNTERPART | BILATERAL_COUNTERPART | ALTERNATIVE | RELATED
- `target_slug`, `rationale`, `difficulty_dimension`, `review_status`, `created_by`, `approved_by`, `reviewed_at`

**Backward compatibility:** The legacy `variants` block is preserved. The new `relationships` array is optional. Existing exercises continue to validate.

**Consequences:** New features (substitution engine, cycle detection) use `relationships`. Existing variant arrays are gradually migrated.

---

## ADR-005: Difficulty dimensions alongside scalar difficulty

**Date:** 2026-11-08  
**Status:** Accepted

**Context:** A single `difficulty` field (beginner/intermediate/advanced/expert) cannot distinguish between exercises that are hard for different reasons (e.g., clap push-up = explosive power; single-arm push-up = unilateral strength).

**Decision:** Add optional `difficulty_dimensions` object with 0–10 scale scores for: strength, power, coordination, balance, mobility, cardiovascular, technical_complexity.

**Constraints:** These are subjective classifications, not EMG measurements. Must not be presented as clinically validated. All exercises with difficulty dimensions must be APPROVED before values are exposed in the production dataset.

---

## ADR-006: Zero-dependency search engine with fuzzy matching

**Date:** 2026-11-08  
**Status:** Accepted

**Context:** `search/index.js` lacked fuzzy matching, so "benchpress" returned 0 results for "bench press". An external search service (Elasticsearch, Typesense) would break offline dataset usage.

**Decision:** Implement Levenshtein distance-based fuzzy matching inside `search/index.js` with no external dependencies. Fuzzy threshold: edit distance ≤ 2 for terms ≥5 chars.

**Consequences:** Offline search remains viable. Performance remains acceptable for dataset sizes under ~5000 exercises.

---

## ADR-007: Generated files in data/generated/, not data/ root

**Date:** 2026-11-08  
**Status:** Accepted

**Context:** Generated artifacts (`oei-dataset.json`, `oei-index.json`) were committed alongside source data, creating confusion about which files are authoritative.

**Decision:** Generated files go in `data/generated/`. Source files remain in `data/exercises/`, `data/muscles/`, `data/equipment/`. The `data/generated/` directory is committed (for direct download), but clearly labeled as a generated output.

---

## ADR-008: No automatic approval of AI-generated content

**Date:** 2026-11-08  
**Status:** Accepted (non-negotiable constraint)

**Context:** All 866 exercises were AI-generated and must not be presented as human-verified.

**Decision:** AI-generated exercises carry `contributor_attestation: "ai-generated-unreviewed"` and `review_status: "UNREVIEWED"`. The production-approved dataset remains empty until human fitness experts review and approve exercises individually. No script, CI job, or automated process may set `review_status` to APPROVED.

**Approval authority:** Only human maintainers using `scripts/admin/review-exercise.js --approve` may approve an exercise, and each approval records `approved_by` and `approved_at`.
