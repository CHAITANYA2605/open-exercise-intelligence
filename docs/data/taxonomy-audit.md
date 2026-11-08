# Taxonomy Audit — OEI

**Date:** 2026-11-08  
**Trigger:** 17 validation errors found across 866 exercises  
**Status:** Resolved ✅

---

## Problem Statement

Dataset validation found 17 exercises with invalid taxonomy values:

| Error type | Count |
|---|---|
| `exercise_type = "strength"` (not in schema enum) | 14 |
| `movement_pattern = "hip-hinge"` (not in schema enum) | 1 |
| `movement_pattern = "balance"` (not in schema enum) | 1 |
| `movement_pattern = "plyometric"` (not in schema enum) | 1 |
| **Total** | **17** |

---

## Root Cause Analysis

### exercise_type = "strength"

The 14 rehabilitation exercises were generated with `exercise_type: "strength"` because they build muscular strength. However, `strength` was never a valid `exercise_type` value — it describes a *purpose* (category), not the *structural nature* of the exercise.

The existing `exercise_type` enum is structurally oriented:
- `compound` = multi-joint
- `isolation` = single-joint
- `calisthenics` = bodyweight
- `cardio` = cardiovascular
- `plyometric` = explosive
- `stretching` = flexibility

Rehabilitation exercises that strengthen muscles should be classified as `compound` or `isolation` based on their mechanics, within the `rehabilitation` category.

**Decision:** Reclassify 14 exercises. Do not add `strength` to the exercise_type enum — it would create ambiguity with the `strength` category value.

### movement_pattern = "hip-hinge"

The canonical schema uses `hinge` (not `hip-hinge`). These are identical concepts. `hip-hinge` is a redundant alias.

**Decision:** Rename `hip-hinge` → `hinge` in the one affected exercise. No schema change needed.

### movement_pattern = "balance" and "plyometric"

These are legitimate, distinct movement patterns not covered by any existing value:
- `balance` — proprioceptive stability exercises cannot be classified as push/pull/squat/lunge/etc.
- `plyometric` — explosive jump movements are distinct from all existing patterns

**Decision:** Add `balance` and `plyometric` to the `movement_pattern` enum in the schema. These are unambiguous, well-defined movement categories.

---

## Taxonomy State Before and After

### movement_pattern

| Status | Values |
|---|---|
| **Before** | `push`, `pull`, `hinge`, `squat`, `lunge`, `carry`, `rotation`, `anti-rotation`, `gait`, `overhead`, `bridge`, `plank` |
| **Added** | `balance`, `plyometric` |
| **Removed** | `hip-hinge` (was never in schema; migrated to `hinge`) |
| **After** | `anti-rotation`, `balance`, `bridge`, `carry`, `gait`, `hinge`, `lunge`, `overhead`, `plank`, `plyometric`, `pull`, `push`, `rotation`, `squat` |

### exercise_type

| Status | Values |
|---|---|
| **Before** | `compound`, `isolation`, `cardio`, `stretching`, `plyometric`, `calisthenics` |
| **After** | Unchanged — `strength` was NOT added |

### category

| Status | Values |
|---|---|
| **Before** | `strength`, `cardio`, `flexibility`, `functional`, `plyometric`, `power`, `mobility`, `rehabilitation`, `stretching` |
| **After** | Unchanged |

---

## All 17 Affected Records — Final Classifications

| Slug | Category | Exercise Type (before → after) | Movement Pattern (before → after) |
|---|---|---|---|
| `good-morning-squat-hybrid` | strength | compound (unchanged) | `hip-hinge` → `hinge` |
| `band-clamshell-rehab` | rehabilitation | `strength` → `isolation` | rotation (unchanged) |
| `copenhagen-adduction` | rehabilitation | `strength` → `isolation` | carry (unchanged) |
| `dead-bug-rehab` | rehabilitation | `strength` → `compound` | carry (unchanged) |
| `face-pull-rehab` | rehabilitation | `strength` → `isolation` | pull (unchanged) |
| `glute-med-strengthening` | rehabilitation | `strength` → `isolation` | carry (unchanged) |
| `hip-90-90-rotation` | rehabilitation | `strength` → `isolation` | rotation (unchanged) |
| `nordic-hamstring-eccentric` | rehabilitation | `strength` → `isolation` | hinge (unchanged) |
| `pallof-press-rehab` | rehabilitation | `strength` → `isolation` | carry (unchanged) |
| `prone-y-t-w` | rehabilitation | `strength` → `isolation` | pull (unchanged) |
| `scapular-pushup` | rehabilitation | `strength` → `isolation` | push (unchanged) |
| `side-lying-external-rotation` | rehabilitation | `strength` → `isolation` | rotation (unchanged) |
| `single-leg-balance` | rehabilitation | `strength` → `calisthenics` | carry (unchanged) |
| `terminal-knee-extension` | rehabilitation | `strength` → `isolation` | carry (unchanged) |
| `wall-angel` | rehabilitation | `strength` → `isolation` | pull (unchanged) |
| `single-leg-balance-reach` | rehabilitation | compound (unchanged) | `balance` ✅ (now valid) |
| `single-leg-box-jump` | strength | compound (unchanged) | `plyometric` ✅ (now valid) |

### Rationale for exercise_type decisions

- **isolation** (12 exercises): Single-joint movement targeting a specific muscle or muscle group. The defining characteristic is that one joint is loaded with meaningful resistance.
- **compound** (dead-bug): Requires coordinated contralateral arm+leg movement — two sets of joints working simultaneously.
- **calisthenics** (single-leg-balance): Bodyweight proprioception; not resistance-based compound or isolation in the conventional sense.

### Ambiguous classifications flagged for human review

- **`copenhagen-adduction`**: Currently `carry` movement pattern. This exercise involves hip adduction while in side-lying position on a bench — semantically closer to `rotation` or a new pattern. Movement pattern is valid but may be semantically incorrect. **Flag for reviewer.**
- **`pallof-press-rehab`**: Currently `carry` movement pattern. The Pallof press is canonically `anti-rotation`. **Recommended correction: change to `anti-rotation`** (not done here as it was not one of the 17 schema errors).
- **`single-leg-balance`**: Currently `carry` movement pattern. Balance exercises cannot be `carry`. **Recommended correction: change to `balance`** (not done here — the exercise_type fix was the schema error; movement_pattern=carry is valid but semantically wrong).
- **`terminal-knee-extension`**: Currently `carry` movement pattern. Terminal knee extension is a knee-dominant isolation movement, not a carry. No suitable existing pattern except possibly adding `locomotion` or leaving it as-is until taxonomy expands.
- **`glute-med-strengthening`**: Currently `carry` movement pattern. Glute med strengthening is typically a rotation/abduction pattern. Possibly `rotation`.

These additional semantic mismatches are **not schema errors** but are content quality issues that human reviewers should address.

---

## Systems Updated

| System | Updated |
|---|---|
| `schema/exercise.schema.json` | ✅ Added `balance`, `plyometric` to movement_pattern |
| `scripts/validate.js` | ✅ VALID_MOVEMENT updated |
| `api/openapi.yaml` | ✅ movement_pattern and exercise_type enums updated |
| Exercise files (15 records) | ✅ Values corrected |
| `docs/schema/taxonomy.md` | ✅ Created |

### Still to update (requires SDK builds)

| System | Required change |
|---|---|
| Java SDK models | Add `balance`, `plyometric` to MovementPattern enum |
| TypeScript SDK types | Add `balance \| plyometric` to MovementPattern type |
| Python SDK | Add values to movement_pattern enum constant |
| Dart SDK | Add values to movement_pattern enum |

---

## Verification

After migration:

```
Scanned: 866 exercises
PASS — 0 taxonomy errors
```

All 17 previously invalid records now pass schema validation.
