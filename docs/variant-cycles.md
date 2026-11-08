# Variant Relationships Requiring Human Review

These three exercise pairs were detected as circular variant references during the automated audit. Each pair needs a human fitness expert to determine the correct relationship and document their reasoning.

## How to resolve a cycle

1. Determine the correct relationship direction (A is harder than B, or A is an alternative to B)
2. Update both exercise files
3. Run `node scripts/validate.js --verbose` to confirm the cycle is resolved
4. Add a comment in `metadata.sources` explaining the rationale
5. Check the box below and link the commit

---

## Cycle 1: clap-push-up ↔ single-arm-push-up

**Current state:** Each exercise lists the other as a harder variant.

**Decision needed:** Which is harder? Or should this be an `equipment_alternatives` / unrelated pairing?

**Considerations:**
- Clap push-up requires explosive power and coordination
- Single-arm push-up requires unilateral strength and stability
- Difficulty depends on the athlete: a gymnast may find single-arm easier; a powerlifter may find clap push-up harder

**Resolution:** [ ] Filed as issue #XX | [ ] Resolved in commit XXXXXXX

---

## Cycle 2: ring-dips ↔ weighted-dips

**Current state:** Each exercise lists the other as a harder variant.

**Decision needed:** Are ring dips harder (instability), or weighted dips (load)?

**Considerations:**
- Ring dips add proprioceptive challenge and scapular stability demand
- Weighted dips add measurable load; easier to progress quantitatively

**Resolution:** [ ] Filed as issue #XX | [ ] Resolved in commit XXXXXXX

---

## Cycle 3: prone-t-raise ↔ prone-y-raise

**Current state:** Each exercise lists the other as a harder variant.

**Decision needed:** Which demands more from the posterior chain?

**Considerations:**
- Y-raise generally demands more lower trapezius activation (arms overhead)
- T-raise is more middle trapezius / rear deltoid focused
- These may be better classified as alternatives rather than progressions

**Resolution:** [ ] Filed as issue #XX | [ ] Resolved in commit XXXXXXX
