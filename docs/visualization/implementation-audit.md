# Visualization Implementation Audit

Scope: inventory of the OEI dataset and taxonomies before building the 3D exercise visualization engine. No exercise records were modified.

Source files inspected:
- `data/generated/oei-dataset-all.json` (866 exercises)
- `data/exercises/**` (source records)
- `data/muscles/muscles.json` (75 muscle taxonomy entries)
- `data/equipment/equipment.json` (50 equipment entries)

## 1. Reusable fields

| Field | Status | Use in visualization |
|---|---|---|
| `exercise_id`, `slug` | Present on all 866 | Output folder keys and manifest IDs |
| `name`, `description` | Present on all 866 | Pose-template selection and review UI |
| `execution.steps`, `execution.setup`, `execution.starting_position` | Present; steps non-empty on all 866 | Source text for start/end pose authoring |
| `movement_pattern` | Present; 14 values (push 279, pull 223, hinge 72, rotation 60, squat 60, anti-rotation 34, lunge 31, overhead 30, carry 28, plank 24, gait 13, bridge 9, balance 2, plyometric 1) | Selects a base pose template |
| `exercise_type` | Present; 6 values | Secondary template selector (e.g. calisthenics, stretching) |
| `laterality` | Present | Decides whether to render one or both limbs |
| `muscles.primary / secondary / stabilizers` | Present | Highlight source (see section 4) |
| `equipment_required`, `equipment_optional` | Present; 47 distinct IDs, all resolve to `equipment.json` | Equipment placement |
| `media.anatomical_illustrations` | Field exists on all 866, currently an empty list | Correct slot for generated images |
| `media.thumbnail / images / videos` | Exist, empty | Not used by this task |
| `metadata.review_status` | All 866 are `UNREVIEWED` | Exercise content approval, separate from visualization approval |

## 2. Missing fields

- No visualization metadata (`visualization.status`, `pose_status`, `camera`, `pose_file`). Must be added with a migration, per spec section 12.
- No per-exercise camera preset.
- No start/end distinction in the instructions. `steps` are a single ordered list, so the start and end poses must be authored from step content rather than read from a field.
- No equipment geometry (dimensions, grip points, pivot). `equipment.json` has names and categories only.
- No mapping from OEI muscle slugs to anatomical mesh regions.

## 3. Exercises that have enough information for pose generation

All 866 have steps, a movement pattern, and muscles, so a candidate pose can be generated from a template for every exercise. Confidence varies:

- **Template-ready (rough estimate, not yet counted):** strength compound and isolation lifts with a clear pattern (push, pull, squat, hinge, lunge, plank, bridge). A template plus equipment placement should cover these.
- **Needs per-exercise review:** rotation, anti-rotation, carry, and gait patterns, where the start/end meaning depends on the specific movement.
- **Needs manual pose authoring:** rehabilitation (82 exercises), stretching (24), mobility (2), balance (2), and plyometric (1). These often have non-standard start/end positions, and some describe holds rather than reps.

## 4. Exercises that need manual pose authoring

- Static holds (plank variants, wall sits, stretches): start and end are the same hold. The spec allows this, but each needs a documented decision.
- Exercises with ambiguous starting positions, such as a deadlift starting from the floor versus from a rack pull setup.
- Olympic lifts and multi-phase movements (clean, snatch, muscle-up, kipping): the canonical start/end pair is a convention choice that must be made per exercise.
- Exercises whose `starting_position` is generic text (for example "Set up for X in the appropriate position"). Several records use this template wording, so their poses cannot be derived from the record and must be authored by hand.

## 5. Ambiguous execution instructions

Exercise steps are mostly well written, but a review pass should cover:
- Steps that describe a hold in a rep-style voice.
- Records whose `starting_position` repeats the exercise name without describing a pose.
- Equipment mentioned in the name that is absent from `equipment_required` (checked by name, not yet counted; needs a script).

## 6. Muscle mapping gaps

Muscle taxonomy and exercise references do not match cleanly:

- **11 slugs used by exercises are not in `data/muscles/muscles.json`:** `anterior-deltoid`, `biceps-brachii`, `biceps-femoris`, `lower-trapezius`, `medial-deltoid`, `middle-trapezius`, `pectoralis-major`, `posterior-deltoid`, `rhomboids`, `serratus-anterior`, `triceps-brachii`. These are sub-regions or aliases of taxonomy groups (e.g. `chest`, `shoulders`, `back`), so they need an explicit alias table before highlighting.
- The taxonomy is group-level (`chest`, `back`, `shoulders`), while the spec's mapping example uses fine-grained regions (`pec_left`, `lat_right`). A mesh-region mapping needs fine-grained names, and the taxonomy does not provide them.

Muscles that cannot be confidently mapped to anatomical regions should be flagged, not highlighted. Candidates: deep stabilizers (e.g. `transverse-abdominis`, `serratus-anterior`, `rhomboids`) and small hip rotators, which are hard to isolate on a generic mesh.

## 7. Tooling and asset status

- **Blender:** not installed on this machine (`blender` not found, no app in `/Applications`).
- **Anatomical model:** none in the repository. No `.glb`, `.fbx`, `.blend`, or `.obj` assets exist outside `node_modules`.
- **Licence evidence:** `THIRD_PARTY_NOTICES.md` exists but lists no 3D assets.
- **Python:** `python3` is available. Node is not on the shell PATH.

## 8. Blockers before rendering

1. A licensed rigged anatomical model must be chosen and its licence documented. Selecting and verifying a licence is a decision for the maintainer, not something to automate.
2. Blender must be installed locally.
3. The muscle alias table (section 6) must be written and reviewed.
4. Visualization metadata and migration strategy must be agreed before adding fields to the dataset (spec section 12).

## 9. Recommended next steps

1. Maintainer chooses the anatomical model and licence.
2. Install Blender and confirm `blender --background --version` runs.
3. Write `visualization-engine/mappings/muscle-mapping.json`, starting with the 11 unmapped slugs above.
4. Pilot the 10 exercises in spec section 16 before any batch work.
