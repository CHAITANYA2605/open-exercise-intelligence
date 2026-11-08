# OEI Canonical Taxonomy

> Single source of truth for all exercise classification enum values.  
> Schema version: 1.1.0 · Last updated: 2026-11-08

This document is authoritative. All implementations — JSON Schema, validator, OpenAPI spec, SDKs, search engine, and developer portal — must derive their enum values from these definitions.

---

## Category

What broad domain does the exercise belong to?

| Value | Description |
|---|---|
| `strength` | Resistance training exercises focused on building maximal force production |
| `cardio` | Exercises primarily targeting cardiovascular conditioning and aerobic capacity |
| `flexibility` | Exercises emphasising range of motion and static/dynamic elongation |
| `functional` | Multi-planar, real-world movement patterns used in daily activities or sport |
| `plyometric` | Explosive, high-velocity movements using the stretch-shortening cycle |
| `power` | Exercises developing rate of force development (speed-strength) |
| `mobility` | Active joint control exercises improving dynamic range of motion |
| `rehabilitation` | Exercises used in injury prevention or recovery, often clinical in origin |
| `stretching` | Passive or active flexibility work without resistance |

**Allowed values:** `strength`, `cardio`, `flexibility`, `functional`, `plyometric`, `power`, `mobility`, `rehabilitation`, `stretching`

---

## Exercise Type

What is the structural nature of the exercise?

| Value | Description |
|---|---|
| `compound` | Multi-joint movement recruiting multiple muscle groups simultaneously |
| `isolation` | Single-joint movement targeting one muscle or small muscle group |
| `cardio` | Primarily cardiovascular; resistance is not the focus |
| `stretching` | Flexibility-focused; not resistance-based |
| `plyometric` | Explosive jump/bound movement using the stretch-shortening cycle |
| `calisthenics` | Bodyweight exercise; no external resistance equipment required |

**Allowed values:** `compound`, `isolation`, `cardio`, `stretching`, `plyometric`, `calisthenics`

### Classification guidance

- An exercise can be in the `rehabilitation` category with exercise_type `isolation` (e.g., side-lying external rotation)
- Use `compound` when two or more joints are involved with meaningful load on multiple muscles (e.g., dead-bug, deadlift)
- Use `isolation` for single-joint rehab exercises targeting a specific muscle (e.g., clamshell, terminal knee extension)
- Use `calisthenics` for bodyweight proprioception/balance work where the exercise_type is not clearly compound or isolation (e.g., single-leg balance)
- Do not use `strength` as an exercise_type — strength is captured in the `category` field

---

## Movement Pattern

What fundamental biomechanical movement mechanics does the exercise involve?

| Value | Description | Examples |
|---|---|---|
| `push` | Force directed away from the body (horizontal or vertical plane) | bench press, push-up, overhead press |
| `pull` | Force directed toward the body | row, pull-up, face pull |
| `hinge` | Hip-dominant posterior chain load; spine relatively neutral | deadlift, good morning, Romanian deadlift |
| `squat` | Knee-dominant bilateral lower body movement | back squat, goblet squat, leg press |
| `lunge` | Unilateral step or split-stance lower body pattern | walking lunge, Bulgarian split squat |
| `carry` | Loaded locomotion or positional hold under load | farmer's carry, suitcase carry |
| `rotation` | Spinal or hip rotation as primary movement driver | cable woodchop, Russian twist, clamshell |
| `anti-rotation` | Resisting rotational force to maintain spinal stability | Pallof press, dead bug |
| `gait` | Walking, running, or bounding locomotion patterns | treadmill run, sled push |
| `overhead` | Vertical pressing or stabilisation above the head | overhead press, Turkish get-up |
| `bridge` | Hip extension in supine or prone position | glute bridge, hip thrust |
| `plank` | Static or dynamic anterior/posterior chain bracing | plank, bear crawl |
| `balance` | Proprioceptive stability with reduced base of support | single-leg balance, single-leg reach |
| `plyometric` | Explosive jump or bound using the stretch-shortening cycle | box jump, broad jump, single-leg box jump |

**Allowed values:** `anti-rotation`, `balance`, `bridge`, `carry`, `gait`, `hinge`, `lunge`, `overhead`, `plank`, `plyometric`, `pull`, `push`, `rotation`, `squat`

### Disambiguation notes

- Use `hinge` not `hip-hinge` — `hinge` is the canonical form
- Use `balance` for exercises where maintaining stability over a reduced base of support is the primary demand
- Use `plyometric` for movement patterns whose primary mechanism is the stretch-shortening cycle (explosive jump/land)
- Use `rotation` when active spinal or hip rotation is the primary movement driver (not just the direction of load)
- Use `anti-rotation` when the goal is to resist rotation (e.g., Pallof press core bracing)

---

## Difficulty Level

| Value | General guideline |
|---|---|
| `beginner` | Minimal technical skill, low load, appropriate for general population |
| `intermediate` | Requires foundational movement competency and some training history |
| `advanced` | High technical demand or high load; requires specific prerequisites |
| `expert` | Elite-level skill, maximal load, or high injury risk without proper training |

---

## Laterality

| Value | Description |
|---|---|
| `bilateral` | Both limbs move simultaneously |
| `unilateral` | One limb works at a time |
| `alternating` | Limbs alternate within the same set |

---

## Review Status

| Value | Description |
|---|---|
| `UNREVIEWED` | AI-generated or unvalidated; not for production use |
| `IN_REVIEW` | Assigned to a human reviewer |
| `NEEDS_REVISION` | Reviewer flagged issues; awaiting correction |
| `APPROVED` | Human expert has verified content and metadata |
| `REJECTED` | Does not meet OEI quality standards; will not be published |
