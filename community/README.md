# OEI Community Contribution System

Welcome to the Open Exercise Intelligence community! This directory contains everything you need to contribute exercises, corrections, and media assets to the dataset.

---

## Table of Contents

1. [How to Submit a New Exercise](#1-how-to-submit-a-new-exercise)
2. [How to Correct an Existing Exercise](#2-how-to-correct-an-existing-exercise)
3. [How to Contribute Media](#3-how-to-contribute-media)
4. [Review Lifecycle](#4-review-lifecycle)
5. [Who Reviews](#5-who-reviews)
6. [SLA and Expectations](#6-sla-and-expectations)
7. [How to Become a Reviewer](#7-how-to-become-a-reviewer)

---

## 1. How to Submit a New Exercise

**Step 1 — Copy the template**

```bash
cp community/templates/exercise-submission.json community/submissions/my-exercise-name.json
```

**Step 2 — Fill in every field**

Open the file and replace every placeholder value. Read `_instructions` and `_comment` fields carefully — they explain what each field expects. Remove all `_instructions` and `_comment` fields before submitting.

Key requirements:
- Generate a fresh UUID v4 for `exercise_id` (`node -e "console.log(crypto.randomUUID())"`)
- Use slugs from `data/muscles/muscles.json` for muscle references
- Use slugs from `data/equipment/equipment.json` for equipment references
- Write an **original** description — do not copy from any external source
- Set `metadata.license` to `"CC0-1.0"` — this is mandatory; by submitting you release your contribution to the public domain
- Set `metadata.source` to `"community_submission"`

**Step 3 — Validate locally**

```bash
node scripts/validate.js
node scripts/check-dataset.js
```

Fix any validation errors before opening your PR.

**Step 4 — Open a Pull Request**

Create a PR with the title `[Exercise] <Exercise Name>`. Include:
- What the exercise is and why it belongs in the dataset
- Your sources (not for copying — for factual reference)
- Confirmation that the content is original and CC0

---

## 2. How to Correct an Existing Exercise

**Step 1 — Copy the correction template**

```bash
cp community/templates/exercise-correction.json community/submissions/correction-<slug>-<field>.json
```

For example: `correction-barbell-bench-press-muscles.json`

**Step 2 — Fill in the template**

Provide:
- `exercise_slug` — the slug of the exercise to correct
- `field_name` — the dot-notation path to the field (e.g. `muscles.primary[0].muscle_slug`)
- `current_value` — the exact current (incorrect) value
- `proposed_value` — your proposed correct value
- `reason` — why the current value is wrong
- `sources` — at least one verifiable source supporting your correction

**Step 3 — Open a Pull Request**

Title: `[Correction] <Exercise Name> — <field>`. Corrections are reviewed within the standard 14-day SLA; critical corrections (incorrect muscle anatomy, dangerous instructions) are prioritized.

---

## 3. How to Contribute Media

OEI welcomes original illustrations, diagrams, anatomical drawings, and exercise demonstrations.

**Accepted licenses:** CC0-1.0 (preferred), CC BY 4.0, CC BY-SA 4.0  
**Accepted formats:** SVG, PNG (min 800px wide), JPG, GIF, MP4, WebM

**Step 1 — Copy the media template**

```bash
cp community/templates/media-submission.json community/submissions/media-<slug>-<type>.json
```

**Step 2 — Fill in the template**

Set `is_original_work: true` if you created the asset. Provide the exact license and attribution text.

**Step 3 — Attach the asset**

Upload the file to the PR (GitHub accepts files up to 25 MB via drag-and-drop in the PR description), then paste the GitHub URL into `source_url`.

**Step 4 — Open a Pull Request**

Title: `[Media] <Exercise Name> — <asset_type>`. Maintainers will verify licensing before merging.

---

## 4. Review Lifecycle

All submissions pass through the following stages:

```
SUBMITTED → VALIDATING → REVIEW_REQUIRED → APPROVED → RELEASED
```

| Stage | Description |
|-------|-------------|
| **SUBMITTED** | PR opened; automated CI validation runs (`node scripts/validate.js`) |
| **VALIDATING** | Automated checks pass; awaiting human review assignment |
| **REVIEW_REQUIRED** | A maintainer is actively reviewing the submission |
| **APPROVED** | Maintainer has approved; submission is merged into the dataset |
| **RELEASED** | Included in the next dataset release (tagged version) |

If your submission is rejected, the reviewer will log a reason in `community/reviews/<slug>-rejected.json` and leave a detailed comment on the PR explaining what needs to change. You are welcome to revise and resubmit.

---

## 5. Who Reviews

Submissions are reviewed by **OEI Maintainers** and **OEI Reviewers** as defined in [GOVERNANCE.md](../GOVERNANCE.md).

Maintainers have merge rights. Reviewers can approve but not merge. At least one Maintainer approval is required to merge any submission.

---

## 6. SLA and Expectations

- **Target review time:** 14 days from PR open date
- **Critical corrections** (dangerous instructions, serious anatomical errors): 72 hours
- **Media submissions:** 21 days (licensing verification takes additional time)

If your submission has not received a response within the SLA, ping `@open-exercise-intelligence/maintainers` in the PR.

**What we look for:**
- Factual accuracy (muscles, equipment, execution)
- Original writing (no copying from copyrighted sources)
- Completeness (all required fields filled)
- Correct licensing (CC0-1.0 for exercises and media where applicable)
- No duplicate slugs

---

## 7. How to Become a Reviewer

Reviewers are community members who consistently contribute high-quality submissions over time.

**To apply:**
1. Have at least 5 merged exercise or correction submissions
2. Open an issue titled `[Reviewer Application] <Your Name>`
3. List your merged PRs
4. A maintainer will review your application within 30 days

Reviewers are listed in [GOVERNANCE.md](../GOVERNANCE.md) and given the `reviewer` label in the GitHub org.

---

## Directory Layout

```
community/
├── submissions/        # Drop your JSON submission files here before opening a PR
├── reviews/            # Rejection records written by admin scripts
└── templates/
    ├── exercise-submission.json    # Template for new exercises
    ├── exercise-correction.json    # Template for corrections
    └── media-submission.json       # Template for media assets
```

---

*By contributing to OEI you agree to the [Code of Conduct](../CODE_OF_CONDUCT.md) and confirm that your contribution meets the licensing requirements in [CONTRIBUTING.md](../CONTRIBUTING.md).*
