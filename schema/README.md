# OEI Schemas

This directory contains JSON Schema (draft-07) definitions for all data structures in the Open Exercise Intelligence dataset.

## Files

| File | Description |
|---|---|
| `exercise.schema.json` | Full exercise record including execution, muscles, equipment, variants, and training parameters |
| `muscle.schema.json` | Muscle taxonomy entries (groups and individual muscles) |
| `equipment.schema.json` | Equipment definitions |
| `media-asset.schema.json` | Media asset records with provenance and licensing metadata |

## Usage

Validate an exercise file:

```bash
# Using ajv-cli (npm install -g ajv-cli)
ajv validate -s schema/exercise.schema.json -d data/exercises/barbell-bench-press.json

# Using the project's built-in validation script
node scripts/validate.js
```

## Schema versioning

Schemas are versioned alongside the dataset. Breaking changes to a schema require a major version bump. See [docs/architecture.md](../docs/architecture.md) for the schema evolution policy.

## Enums

Enum values are defined in the schema files and in the corresponding reference data files in `data/`.

| Schema field | Reference data |
|---|---|
| `category` | `data/categories/categories.json` |
| `movement_pattern` | `data/movement-patterns/movement-patterns.json` |
| `muscles[].muscle_id` | `data/muscles/muscles.json` |
| `equipment_required[]` | `data/equipment/equipment.json` |
