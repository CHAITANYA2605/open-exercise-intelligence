# Exercises

This directory contains individual exercise JSON files. Each file is named after the exercise's slug.

## Status

**Milestone 1 (Foundation)**: No exercise files yet. Exercise data will be added in Milestone 2.

## File naming convention

Each exercise file is named after the exercise's slug:

```
barbell-bench-press.json
barbell-squat.json
pull-up.json
dumbbell-romanian-deadlift.json
```

## File format

Each file must conform to `schema/exercise.schema.json`.

A minimal valid example:

```json
{
  "exercise_id": "a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7",
  "slug": "barbell-bench-press",
  "name": "Barbell Bench Press",
  "alternative_names": ["Flat Barbell Press"],
  "description": "A horizontal pushing exercise performed lying on a flat bench...",
  "category": "strength",
  "exercise_type": "compound",
  "difficulty_level": "intermediate",
  "movement_pattern": "push",
  "force_type": "push",
  "mechanics_type": "compound",
  "laterality": "bilateral",
  "exercise_family": "bench press",
  "status": "active",
  "muscles": {
    "primary": [
      { "muscle_id": "11111111-0003-4000-a000-000000000001", "muscle_group": "chest" }
    ],
    "secondary": [
      { "muscle_id": "33333333-0002-4000-a000-000000000003", "muscle_group": "shoulders" },
      { "muscle_id": "77777777-0001-4000-a000-000000000007", "muscle_group": "triceps" }
    ],
    "stabilizers": []
  },
  "equipment_required": ["eq000002-0000-4000-a000-000000000002", "eq000015-0000-4000-a000-000000000015"],
  "equipment_optional": [],
  "execution": {
    "steps": [
      "Lie on the bench with eyes directly under the bar.",
      "Grip the bar slightly wider than shoulder width.",
      "Unrack the bar and position it over the chest.",
      "Lower the bar under control to mid-chest.",
      "Press the bar back to the starting position."
    ]
  },
  "metadata": {
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z",
    "version": "0.2.0"
  }
}
```

## Validation

Before submitting, run:

```bash
node scripts/validate.js
```

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for full submission guidelines.

## Muscle ID reference

All `muscle_id` values must exist in `data/muscles/muscles.json`. See that file for the complete taxonomy.

## Equipment ID reference

All equipment IDs must exist in `data/equipment/equipment.json`.
