# OEI v1.0.0 Release Gate

This document defines the acceptance criteria that must be met before OEI can be released as v1.0.0.

A release gate item is complete only when evidence exists in the repository (a commit, a CI run result, a test output file, or a linked PR).

---

## P0 — Must pass before v1.0.0

### RG-01: Exercise human review
- [ ] At least 500 exercises reviewed and approved by a human fitness expert
- [ ] Review methodology documented in `docs/review-methodology.md`
- [ ] `data/releases/approved/oei-approved-dataset.json` generated and validated
- Acceptance: `node scripts/admin/review-exercise.js --stats` shows ≥500 APPROVED

### RG-02: Variant cycle resolution
- [ ] clap-push-up ↔ single-arm-push-up: relationship type documented and corrected
- [ ] ring-dips ↔ weighted-dips: relationship type documented and corrected
- [ ] prone-t-raise ↔ prone-y-raise: relationship type documented and corrected
- Acceptance: `node scripts/validate.js --verbose` reports 0 variant cycles

### RG-03: Validation CI green
- [ ] `validate-dataset.yml` CI passes on main branch with 0 errors
- [ ] No UNREVIEWED exercises in the approved release dataset
- Acceptance: CI badge green, `node scripts/validate.js` exits 0

### RG-04: npm package published and tested
- [ ] `@oei/exercise-sdk` published to npm with correct version
- [ ] `npm install @oei/exercise-sdk` and documented example runs without error
- [ ] Package ownership secured under the OEI GitHub org or maintainer account
- Acceptance: `npm view @oei/exercise-sdk` returns package metadata

### RG-05: PyPI package published and tested
- [ ] `oei-exercise-sdk` published to PyPI
- [ ] `pip install oei-exercise-sdk` and documented example runs without error
- Acceptance: `pip index versions oei-exercise-sdk` lists ≥1 version

### RG-06: Java/Maven SDK verified
- [ ] Maven coordinates `io.oei:oei-sdk:1.0.0` verified (published or clearly local-only with instructions)
- [ ] Maven Central publishing requirements documented if publishing is planned
- Acceptance: Explicit decision documented in `sdks/java/PUBLISHING.md`

### RG-07: Dart/Flutter SDK verified
- [ ] `oei_sdk` on pub.dev OR clear local-only instructions
- Acceptance: `pub.dev` check documented in `sdks/dart/PUBLISHING.md`

---

## P1 — Should pass before v1.0.0

### RG-08: Spring Boot integration tests
- [ ] At least one integration test per controller
- [ ] `mvn test` passes from clean checkout
- Acceptance: `build-api.yml` CI shows green test report

### RG-09: SHA-256 checksums match
- [ ] `data/checksums.sha256` matches actual files
- [ ] Release CI regenerates checksums before publishing
- Acceptance: `sha256sum -c data/checksums.sha256` exits 0

### RG-10: Docker Compose clean checkout test
- [ ] `docker compose up` starts API successfully from a clean clone
- [ ] `curl localhost:8080/actuator/health` returns `{"status":"UP"}`
- [ ] `curl localhost:8080/v1/exercises?per_page=1` returns a valid exercise
- Acceptance: Test output documented in `docs/docker-test-results.md`

### RG-11: Security and dependency scan
- [ ] `npm audit` on portal and JS SDK shows 0 high/critical
- [ ] Maven dependency check passes
- Acceptance: CI security scan step green

### RG-12: GitHub repository metadata
- [ ] Repository description set
- [ ] Topics set: `exercise`, `fitness`, `open-data`, `cc0`, `rest-api`, `flutter`, `typescript`
- [ ] License file present (MIT)
- [ ] Social preview image set
- Acceptance: GitHub repository page shows correct metadata

---

## P2 — Nice to have for v1.0.0

### RG-13: React Native SDK
- [ ] Stable interface defined
- [ ] Basic implementation with local dataset mode

### RG-14: Exercise biomechanics fields
- [ ] Joint actions added to schema
- [ ] Anatomical planes added to schema
- [ ] At least 50 exercises have biomechanics data

### RG-15: Expert review panel
- [ ] At least 2 fitness professionals credited as reviewers
- [ ] Review credentials documented

---

## How to use this document

For each gate item:
1. Create a GitHub issue titled `[RG-XX] <item title>`
2. Link the PR that closes it
3. Check the box in this file when evidence exists
4. Do not check the box based on code generation alone — run the actual command

## Staged release plan

| Version | Dataset | SDKs | Status |
|---|---|---|---|
| v0.9.0-beta | 866 AI-generated, UNREVIEWED | Local use only | ✅ Current |
| v0.9.5-beta | ≥200 APPROVED exercises | Local use only | Planned |
| v1.0.0-rc | ≥500 APPROVED exercises | npm + PyPI published | Planned |
| v1.0.0 | All P0 gates passed | All SDKs verified | Target |
