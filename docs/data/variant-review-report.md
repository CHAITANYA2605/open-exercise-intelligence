# Variant Relationship Decision Report

**Generated:** 2026-11-08  
**Status:** Awaiting human decisions on 3 cycles

---

## Summary

Three bidirectional variant relationships were detected that form progression cycles. These cannot be automatically resolved because the exercises differ across **different difficulty dimensions** — a valid difficulty ordering on one dimension conflicts with the reverse ordering on another.

---

## Cycle 1: clap-push-up ↔ single-arm-push-up

**GitHub Issue:** Create using `.github/ISSUE_TEMPLATE/variant-cycle.md`

**Current state:** Each exercise lists the other as a harder variant.

**Problem:** These exercises are hard in different ways:
- `clap-push-up`: high **power demand**, high **coordination demand**, moderate **strength demand**
- `single-arm-push-up`: high **strength demand**, high **balance demand**, low **power demand**

**Options for human decision:**
1. **Remove the relationship** — these are parallel variants, not a progression
2. **Keep one direction only** — declare clap push-up harder on power, single-arm harder on strength
3. **Use VARIATION type** — neither is a progression of the other; they're variations within advanced push-up family

**Recommended resolution:** Use `VARIATION` relationship in both directions. Neither is a prerequisite of the other.

**Action required:** Maintainer decision. Update both exercise files using typed `relationships` array.

---

## Cycle 2: ring-dips ↔ weighted-dips

**GitHub Issue:** Create using `.github/ISSUE_TEMPLATE/variant-cycle.md`

**Current state:** Each lists the other as harder.

**Problem:**
- `ring-dips`: harder on **coordination** and **balance demand** (unstable surface)
- `weighted-dips`: harder on **strength demand** (added load)

**Options:**
1. `ring-dips` → `ALTERNATIVE` for `weighted-dips` (different equipment)
2. Use EQUIPMENT_SUBSTITUTION relationship
3. Use VARIATION (both are advanced dip variations)

**Recommended resolution:** `EQUIPMENT_SUBSTITUTION` in both directions. Neither is strictly harder — they test different physical qualities.

**Action required:** Maintainer decision. Update both exercise files.

---

## Cycle 3: prone-t-raise ↔ prone-y-raise

**GitHub Issue:** Create using `.github/ISSUE_TEMPLATE/variant-cycle.md`

**Current state:** Each lists the other as harder.

**Problem:** These are exercises targeting similar rotator cuff and scapular stabilizers but with different arm angles:
- T-raise: arms at 90° (greater leverage → potentially harder for some individuals)
- Y-raise: arms at ~135° (longer lever arm in Y position → potentially harder on lower traps)

**Options:**
1. `prone-y-raise` → PROGRESSION of `prone-t-raise` (longer lever = harder for lower trap)
2. VARIATION (both are scapular stability exercises at the same difficulty level)
3. RELATED (loosely related, not a true progression)

**Recommended resolution:** `VARIATION` — difficulty depends on individual weakness patterns.

**Action required:** Maintainer decision (ideally a certified strength coach or physiotherapist).

---

## How to Resolve

After human decision, update each exercise file's `relationships` array:

```json
{
  "relationships": [
    {
      "target_slug": "other-exercise-slug",
      "relationship_type": "VARIATION",
      "rationale": "Maintainer decision 2026-11-XX: Both are advanced push-up variations targeting different physical qualities",
      "review_status": "APPROVED",
      "approved_by": "maintainer-github-handle",
      "reviewed_at": "2026-11-XX T00:00:00Z"
    }
  ]
}
```

Then remove the cycle-creating entries from the `variants.easier` and `variants.harder` arrays.

---

## Validation

After resolving cycles, run:

```bash
node scripts/release-check.js
```

The report will confirm zero progression cycles remain.
