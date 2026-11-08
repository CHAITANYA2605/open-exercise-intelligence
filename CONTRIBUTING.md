# Contributing to Open Exercise Intelligence (OEI)

Thank you for your interest in contributing to OEI. This document explains how to contribute exercises, data corrections, code improvements, and documentation.

---

## Table of Contents

1. [Before You Contribute](#before-you-contribute)
2. [Types of Contributions](#types-of-contributions)
3. [Licensing Requirements](#licensing-requirements)
4. [Data Quality Standards](#data-quality-standards)
5. [Contributing Exercise Data](#contributing-exercise-data)
6. [Contributing Code](#contributing-code)
7. [Contributing Documentation](#contributing-documentation)
8. [Contribution Review Workflow](#contribution-review-workflow)
9. [What We Do Not Accept](#what-we-do-not-accept)
10. [Getting Help](#getting-help)

---

## Before You Contribute

Please read:

- [LICENSING.md](LICENSING.md) — understand what licenses apply to what components.
- [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) — understand which asset sources are excluded.
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) — agree to abide by our community standards.

By submitting a pull request, you agree that:

- **For exercise data and descriptions**: Your contribution is original work that you dedicate to the public domain under CC0 1.0.
- **For source code**: Your contribution is licensed under the MIT License.
- **For third-party assets**: The asset's license permits commercial redistribution and you have documented it in THIRD_PARTY_NOTICES.md.

---

## Types of Contributions

### Exercise data
- New exercise records (JSON files in `data/exercises/`)
- Corrections to existing exercise metadata
- Additional alternative names or coaching cues
- Exercise variant relationships

### Muscle and equipment data
- Corrections to the muscle taxonomy in `data/muscles/muscles.json`
- New equipment entries in `data/equipment/equipment.json`

### Original media
- Original exercise illustrations (CC0 only — must be your own artwork)
- Original muscle diagrams (CC0 only)
- Animated GIFs of exercises (CC0 only — must be your own recordings)

### Code
- Validation script improvements
- SDK features
- API improvements
- Build tooling

### Documentation
- Corrections to existing documentation
- New integration examples
- Translations

---

## Licensing Requirements

### For exercise data and descriptions

All exercise data you contribute must be **original work**. You must be able to truthfully state:

> "I wrote this exercise description from scratch. I did not copy it from ExRx, ExerciseDB, Bodybuilding.com, or any other source. I dedicate this contribution to the public domain under CC0 1.0."

By submitting data, you make that declaration.

### For media assets

All original artwork must be your own work and you must dedicate it to CC0 1.0.

For third-party assets, the license must:
- Permit commercial use.
- Permit redistribution.
- Not require end-user attribution in ways that cannot be reasonably fulfilled in fitness applications.

You must add the asset to [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) before the PR can be merged.

### For code

Your code contribution is submitted under the MIT License.

---

## Data Quality Standards

Exercise records must meet these standards before they will be approved:

1. **Unique slug and ID**: The exercise must have a UUID (version 4) and a slug that does not duplicate an existing exercise.
2. **Original description**: The description must be at least 50 characters and written originally for this project.
3. **Accurate muscle mapping**: Primary and secondary muscles must reference valid muscle IDs from `data/muscles/muscles.json`.
4. **Valid equipment references**: Equipment must reference valid IDs from `data/equipment/equipment.json`.
5. **Complete execution steps**: At least two execution steps must be provided.
6. **Valid enums**: All enum fields (`category`, `difficulty_level`, `movement_pattern`, etc.) must use values defined in the schema.
7. **No fabricated science**: Do not invent specific muscle activation percentages or clinical claims without validated bibliographic sources.

Run the validation script before submitting:

```bash
node scripts/validate.js
```

Your PR will be automatically validated by CI. PRs that fail validation will not be merged.

---

## Contributing Exercise Data

### Step 1: Create the exercise file

Create a new file in `data/exercises/` named after the exercise slug:

```
data/exercises/barbell-bench-press.json
```

The file must conform to the JSON schema in `schema/exercise.schema.json`.

### Step 2: Generate a UUID

You can generate a UUID using:

```bash
# macOS / Linux
uuidgen | tr '[:upper:]' '[:lower:]'

# Node.js
node -e "const c=()=>Math.random().toString(16).slice(2); console.log([c()+c(),c(),('4'+c()).slice(0,4),((Math.random()*4|8).toString(16)+c()).slice(0,4),c()+c()+c()].join('-'))"
```

### Step 3: Validate

```bash
node scripts/validate.js
```

### Step 4: Submit a pull request

- Title: `feat(data): add [exercise name]`
- Description: Include a brief note confirming the content is original and you dedicate it to CC0.

---

## Contributing Code

1. Fork the repository.
2. Create a branch: `git checkout -b feat/your-feature`
3. Make your changes.
4. Run existing tests (see project README for test commands).
5. Submit a pull request.

Code PRs should:
- Include tests for new functionality.
- Not break existing tests.
- Follow the existing code style.

---

## Contributing Documentation

Documentation is licensed under CC BY 4.0. By contributing documentation, you license your contribution under CC BY 4.0.

---

## Contribution Review Workflow

All contributions follow this lifecycle:

```
SUBMITTED → VALIDATING → REVIEW_REQUIRED → APPROVED → RELEASED
```

| Stage | Description |
|---|---|
| **SUBMITTED** | PR opened. Automated checks begin. |
| **VALIDATING** | CI runs schema validation, duplicate checks, licence checks. |
| **REVIEW_REQUIRED** | Automated checks pass. A maintainer reviews the content. |
| **APPROVED** | Maintainer approves and merges the PR. |
| **RELEASED** | Included in the next dataset version release. |

**Rejected contributions** will receive a comment explaining the reason. Common rejection reasons:
- Failed automated validation.
- Suspected copyright infringement.
- Missing or incomplete licence documentation.
- Exercise already exists under a different name.
- Description quality does not meet standards.

---

## What We Do Not Accept

We will not accept contributions that include:

- Exercise descriptions copied from ExRx, ExerciseDB, Bodybuilding.com, or any other source without explicit, documented permission to relicense under CC0.
- Data scraped from websites that prohibit automated access or data extraction in their terms of service.
- AI-generated text that is itself a derivative of restricted copyrighted content.
- Images from stock photo sites under standard stock licenses.
- Gym Visual images under their standard N-CRFL license.
- Any asset where commercial redistribution is not explicitly permitted by the license.
- Exercises that are simply minor name variations of existing exercises without meaningful additional data.
- Any content that makes medically unsubstantiated claims.

If you are unsure whether your contribution qualifies, open an issue before preparing a full PR.

---

## Getting Help

- Open a GitHub issue for questions about data contribution.
- Use GitHub Discussions for general questions.
- For licensing questions, open an issue tagged `licensing`.

---

## Contributing Media Assets

This section explains how to contribute exercise images, anatomical illustrations, and other
visual assets to the OEI Media Registry (`data/media/registry.json`).

### License Requirements

OEI only accepts media assets with **commercially compatible open licenses**.

**Strongly preferred (no attribution required):**
- `CC0-1.0` — Creative Commons Zero 1.0 (public domain dedication)
- `Unlicense` — equivalent public domain-like release

**Accepted (attribution required):**
- `CC-BY-4.0`, `CC-BY-3.0`, `CC-BY-2.5`, `CC-BY-2.0` — Creative Commons Attribution variants
- `CC-BY-SA-4.0` — CC Attribution-ShareAlike (copyleft; accepted but flagged)
- `Apache-2.0`, `MIT` — for software assets (icons, generated SVGs)

**Not Accepted:**
- Proprietary images (Getty, Shutterstock, iStock under standard license)
- Gym Visual diagrams or derivatives (covered by Gym Visual's N-CRFL license)
- ExRx.net diagrams (copyright retained by ExRx)
- ExerciseDB images (license unclear / proprietary)
- Screenshots from other fitness applications
- Images with watermarks from commercial providers
- Creative Commons Non-Commercial variants: `CC-BY-NC-*`
- Creative Commons No-Derivatives variants: `CC-BY-ND-*`
- "Free for personal use" licenses (commercial use not permitted)

### Where to Find CC0-Licensed Exercise Images

1. **Wikimedia Commons** (<https://commons.wikimedia.org/>) — search for exercises, muscles, or
   anatomy; filter by CC0 or Public Domain. This is the preferred source.
2. **Pixabay** (<https://pixabay.com/>) — CC0 images and illustrations.
3. **Unsplash** (<https://unsplash.com/>) — the Unsplash License allows commercial use.
4. **US Government publications** — NIH, NCI, and other US government agencies produce public domain imagery.

### How to Submit

1. **Find an asset** with a verifiable CC0 or CC-BY license. Note the exact license page URL.

2. **Add an entry** to `data/media/registry.json`. Generate a UUID v4 for `asset_id`:
   ```
   node -e "const c=require('crypto');console.log(c.randomUUID())"
   ```
   Set `status: "pending"`. Fill in all provenance fields accurately.

3. **Run validation** from the repo root:
   ```
   node scripts/validate-media.js --verbose
   ```
   Fix all errors before proceeding.

4. **Open a pull request** that includes:
   - Your `registry.json` change
   - A link to the original asset page
   - A screenshot or copy of the license confirmation

### Attribution Requirements

For assets where `license.requires_attribution: true`, you **must** provide:
- `license.attribution_text` — the exact attribution string to include in downstream products
- `license.source_url` — the URL of the license page or asset page

Missing attribution on a CC-BY asset will cause the validation script to fail and the PR to
be rejected. OEI auto-generates `data/media/ATTRIBUTIONS.md` from all approved CC-BY assets.

### Review Process

1. **License verification** — a maintainer visits the original source URL and confirms the license.
2. **Provenance check** — the `original_url` must be reachable and must match the stated author.
3. **Quality check** — the image must be clearly relevant to the exercise and of sufficient resolution.
4. **Merge** — status is updated to `"approved"` and the asset becomes available via the API.

### Scripts Reference

| Script | Purpose |
|--------|---------|
| `node scripts/validate-media.js [--verbose]` | Validate registry entries; exits 1 on errors |
| `node scripts/generate-attributions.js` | Generate `data/media/ATTRIBUTIONS.md` |
| `node scripts/check-license-compatibility.js` | Print license compatibility report |

See `data/media/README.md` for the full media system documentation.
