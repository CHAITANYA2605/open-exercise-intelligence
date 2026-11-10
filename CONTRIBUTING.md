# Contributing to Open Exercise Intelligence

Thanks for your interest! OEI is a community-driven exercise knowledge base. All exercise data is released under **CC0 1.0** (public domain) — no attribution required, forever free.

---

## Ways to contribute

| Type | Effort | Impact |
|------|--------|--------|
| Fix a data error (wrong muscle, bad description) | 5 min | High |
| Add a new exercise | 20–30 min | High |
| Review an existing exercise | 10 min | High |
| Add an illustration / GIF | varies | Medium |
| Improve docs or translations | varies | Medium |

---

## Before you start

1. **Fork** the repo on GitHub
2. **Clone** your fork locally
3. **Set up** your environment (see [QUICKSTART.md](QUICKSTART.md))

```bash
git clone https://github.com/YOUR_USERNAME/open-exercise-intelligence.git
cd open-exercise-intelligence
git checkout -b my-contribution
```

---

## Fixing a data error

1. Find the exercise file in `data/exercises/<category>/<slug>.json`
2. Make your change
3. Validate:
   ```bash
   docker run --rm -v "$(pwd)":/app -w /app node:20-alpine node scripts/validate.js
   ```
4. Open a PR with a clear title like `fix: barbell-squat movement_pattern hinge→squat`

---

## Adding a new exercise

### File location

```
data/exercises/<category>/<slug>.json
```

Categories: `strength`, `cardio`, `flexibility`, `mobility`, `plyometric`, `power`, `rehabilitation`, `functional`, `stretching`

Slug format: `lowercase-hyphenated`, e.g. `single-arm-dumbbell-row`

### Minimal required fields

```json
{
  "exercise_id": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
  "slug": "your-exercise-slug",
  "name": "Your Exercise Name",
  "description": "2–4 sentence description of what the exercise is and how it's performed.",
  "category": "strength",
  "exercise_type": "compound",
  "difficulty_level": "intermediate",
  "movement_pattern": "hinge",
  "laterality": "bilateral",
  "force_type": "push",
  "muscles": {
    "primary": [{ "muscle_id": "...", "muscle_slug": "gluteus-maximus" }],
    "secondary": [],
    "stabilizers": []
  },
  "equipment_required": ["barbell"],
  "execution": {
    "steps": [
      "Step 1: ...",
      "Step 2: ..."
    ],
    "cues": ["Keep back flat", "Drive through heels"],
    "common_errors": ["Rounding lower back"],
    "breathing": "Inhale before descent, exhale on the way up"
  },
  "metadata": {
    "created_at": "2026-11-10T00:00:00Z",
    "updated_at": "2026-11-10T00:00:00Z",
    "created_by": "your-github-username",
    "version": "1.0.0",
    "sources": ["https://source-url-if-any"],
    "tags": [],
    "license": "CC0-1.0",
    "review_status": "UNREVIEWED",
    "contributor_attestation": "human-authored"
  }
}
```

### Generate a UUID

```bash
# Mac / Linux
python3 -c "import uuid; print(uuid.uuid4())"

# Docker (no Python needed)
docker run --rm python:3-alpine python3 -c "import uuid; print(uuid.uuid4())"
```

### Valid enum values

| Field | Valid values |
|-------|-------------|
| `category` | `strength` `cardio` `flexibility` `mobility` `plyometric` `power` `rehabilitation` `functional` `stretching` |
| `exercise_type` | `compound` `isolation` `cardio` `stretching` `plyometric` `calisthenics` |
| `difficulty_level` | `beginner` `intermediate` `advanced` `expert` |
| `movement_pattern` | `anti-rotation` `balance` `bridge` `carry` `gait` `hinge` `lunge` `overhead` `plank` `plyometric` `pull` `push` `rotation` `squat` |
| `laterality` | `bilateral` `unilateral` `alternating` |
| `force_type` | `push` `pull` `static` `carry` `hinge` `rotation` |

### Validate before submitting

```bash
docker run --rm -v "$(pwd)":/app -w /app node:20-alpine node scripts/validate.js
```

Zero errors required. Fix any that appear before opening a PR.

---

## Reviewing an exercise

You can help by reviewing existing UNREVIEWED exercises for accuracy.

1. Go to http://localhost:5173/admin (or run the portal locally — see QUICKSTART.md)
2. Click **Review Exercises** tab
3. Filter by `UNREVIEWED`
4. Select an exercise, check its data, and use the action buttons:
   - **Approve** — data is correct
   - **Needs Revision** — something needs fixing (add a note)
   - **In Review** — you're actively looking into it

Each button copies a terminal command. Paste it in your terminal to write the change.

5. Rebuild: `docker run --rm -v "$(pwd)":/app -w /app node:20-alpine node scripts/generation/build-dataset.js`
6. Commit and PR

---

## Submitting a PR

```bash
git add data/exercises/category/your-exercise.json
git commit -m "feat: add single-arm-dumbbell-row exercise"
git push origin my-contribution
```

Then open a pull request at https://github.com/CHAITANYA2605/open-exercise-intelligence/pulls

**PR checklist:**
- [ ] `node scripts/validate.js` passes with 0 errors
- [ ] Exercise slug is unique (check `data/exercises/` — no other file with the same name)
- [ ] UUID is a valid v4 UUID
- [ ] `contributor_attestation` is set (`human-authored` or `ai-generated-unreviewed`)
- [ ] CC0 — you agree to release your contribution under CC0 1.0

---

## Questions?

Open an issue on GitHub: https://github.com/CHAITANYA2605/open-exercise-intelligence/issues
