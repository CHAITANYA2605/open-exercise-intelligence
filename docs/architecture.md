# OEI Architecture

**Open Exercise Intelligence** is designed as a local-first, embeddable exercise knowledge base. This document describes the system architecture, component breakdown, technology choices, data flow, and milestone roadmap.

---

## Design Philosophy

### Local-first

The dataset is the primary artifact. Any developer can clone the repository, copy the `data/` directory, and immediately have a fully functional exercise library without depending on any external service. The REST API is optional and reference-only.

### License-clean by design

Every data record carries full provenance metadata. CI blocks any release where an asset lacks documented licensing. The dataset is never more valuable than its legal cleanliness.

### Schema-driven

All data files are validated against JSON Schema (draft-07) definitions. Invalid data cannot be merged. Schema changes follow a formal deprecation process.

### Separation of concerns

```
Dataset (data/)          — the portable, embeddable knowledge base
Schemas (schema/)        — contracts that define valid data shape
Scripts (scripts/)       — tooling for validation, import, export
SDKs (sdks/)             — language-specific wrappers (Milestone 3)
API (api/)               — optional Spring Boot reference server (Milestone 4)
Portal (portal/)         — developer documentation site (Milestone 4)
```

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   Open Exercise Intelligence                     │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Dataset    │  │   Schemas    │  │  Validation Scripts   │   │
│  │  (JSON/CSV)  │  │  (JSON Sch.) │  │  (Node.js, CI/CD)    │   │
│  └──────┬───────┘  └──────────────┘  └──────────────────────┘   │
│         │                                                        │
│  ┌──────▼───────────────────────────────────────────────────┐   │
│  │                   Developer Integration                   │   │
│  │                                                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │   │
│  │  │  JS/TS SDK   │  │  Python SDK  │  │   Java SDK     │  │   │
│  │  └──────────────┘  └──────────────┘  └────────────────┘  │   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │          Optional: Spring Boot REST API           │    │   │
│  │  │  (PostgreSQL + Full-text search + OpenAPI docs)   │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  └───────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Dataset Layer (`data/`)

The dataset is the core deliverable. It is organized as:

```
data/
├── exercises/              One JSON file per exercise
├── muscles/                Muscle taxonomy (single file)
├── equipment/              Equipment definitions (single file)
├── categories/             Exercise categories (single file)
└── movement-patterns/      Movement pattern taxonomy (single file)
```

**Format**: JSON is the primary format. CSV exports are generated for bulk analysis. YAML is used for human-readable configuration files.

**Versioning**: The dataset is versioned independently using semantic versioning. A `version` field in each exercise record tracks which dataset version introduced or last modified it.

**Index**: An `index.json` file in `data/exercises/` lists all exercise slugs and IDs for fast lookup without loading all exercise files.

### 2. Schema Layer (`schema/`)

JSON Schema (draft-07) definitions serve as the authoritative contract for all data files.

- `exercise.schema.json` — the full exercise record schema
- `muscle.schema.json` — muscle taxonomy entries
- `equipment.schema.json` — equipment definitions
- `media-asset.schema.json` — media asset provenance records

Schema changes go through a formal review process. Breaking changes require a major version bump and a migration guide.

### 3. Validation Layer (`scripts/`)

A Node.js validation script provides:
- Schema conformance checks
- Referential integrity (muscle IDs, equipment IDs exist)
- Duplicate detection (UUID, slug)
- License completeness checks for media assets
- Broken variant relationship detection

The validation script has zero external dependencies and runs in any Node.js 18+ environment.

CI runs validation on every pull request. Merges are blocked if validation fails.

### 4. Search Engine (Milestone 3)

Two search implementations:

**Local search (embedded in SDKs)**:
- Pure in-memory search using the dataset loaded from disk
- Supports filtering, text search, sorting, pagination
- No server or database required
- Implemented in each SDK language natively

**Hosted search (optional, via API)**:
- PostgreSQL full-text search using `tsvector` / `tsquery`
- GIN indexes on exercise name, description, and alternative names
- Used only by the reference REST API

### 5. SDK Layer (Milestone 3)

Three SDK targets:

| SDK | Package Manager | Minimum Runtime |
|---|---|---|
| JavaScript/TypeScript | npm | Node.js 18 |
| Python | PyPI | Python 3.9 |
| Java | Maven Central | Java 21 |

SDKs bundle the dataset at build time and expose a consistent API surface:
- `searchExercises(query, filters)` → exercises[]
- `getExercise(id)` → exercise
- `getMuscles()` → muscles[]
- `getEquipment()` → equipment[]
- `getSubstitutions(exerciseId, availableEquipment)` → alternatives[]

### 6. REST API (Milestone 4)

**Technology**: Java 21, Spring Boot 3, Spring Data JPA, PostgreSQL.

The API is an optional reference implementation. Developers who want a hosted API can deploy it. Those who want local access use the SDKs directly.

**Key design decisions**:
- OpenAPI 3.1 spec generated from code annotations
- Consistent error response envelope: `{ error: { code, message, details } }`
- Pagination via `page` + `limit` query parameters, with `Link` header
- Sorting via `sort` parameter with field:direction syntax
- No authentication required for read endpoints
- Dataset updates do not require API restart (reload endpoint for admins)

### 7. Media System (Milestone 5)

Media is stored separately from the dataset JSON. Exercise JSON files reference media by `asset_id`. Media asset records (in `media-asset.schema.json`) contain full provenance including license and attribution.

**Media types**:
- Thumbnail images (JPEG/WebP)
- Execution sequence images (JPEG/WebP)
- Animated GIFs
- MP4/WebM demonstration videos
- Anatomical illustrations (SVG/PNG)
- Muscle activation overlays

**License enforcement**: CI blocks any release where an asset record has `approval_status !== "approved"` or missing license fields.

**Fallback**: All exercises are fully usable without media. Media is supplementary.

---

## Data Flow

### Exercise lookup (local SDK)

```
Application
    │
    ▼
SDK.getExercise("barbell-bench-press")
    │
    ▼
Load exercise file: data/exercises/barbell-bench-press.json
    │
    ▼
Resolve muscle references → data/muscles/muscles.json
Resolve equipment references → data/equipment/equipment.json
    │
    ▼
Return enriched exercise object
```

### Exercise search (local SDK)

```
Application
    │
    ▼
SDK.searchExercises({ muscles: ["quadriceps"], equipment: ["barbell"] })
    │
    ▼
Load data/exercises/index.json
    │
    ▼
Filter exercises by muscle group and equipment
    │
    ▼
Load matching exercise files
    │
    ▼
Return filtered, paginated results
```

### Contribution pipeline

```
Contributor opens PR
    │
    ▼
CI: node scripts/validate.js
    │
    ├── FAIL → PR blocked, error report posted as comment
    │
    └── PASS
         │
         ▼
    Maintainer review
         │
         ├── REQUEST CHANGES → contributor revises
         │
         └── APPROVE → merge
              │
              ▼
         Dataset release (versioned GitHub release)
```

---

## Technology Choices

| Choice | Rationale |
|---|---|
| JSON for dataset | Maximum portability. Any language can read JSON without a library. No binary format lock-in. |
| JSON Schema draft-07 | Widely supported across languages. Sufficient expressiveness for data validation. |
| Node.js for scripts | Zero install on most developer machines. No external dependencies in scripts. |
| Java 21 + Spring Boot | Strong ecosystem for backend APIs. Long-term support. Good PostgreSQL integration. |
| PostgreSQL | Full-text search built in. Mature, widely deployed. No additional search infrastructure needed for hosted API. |
| React + TypeScript + Vite | Standard, maintainable frontend stack. Good tooling. |
| Semantic versioning for dataset | Clear signals to downstream developers about breaking changes. |
| CC0 for data | Maximum freedom for downstream use. Removes copyright uncertainty from fitness app development. |

---

## Milestone Roadmap

| Milestone | Deliverables |
|---|---|
| **M1: Foundation** | Schema definitions, muscle taxonomy, equipment taxonomy, governance, validation scripts |
| **M2: Dataset Engine** | 500+ exercise records, import/export tooling, full validation, dataset versioning |
| **M3: Search & SDKs** | Local search engine, JS/Python/Java SDKs, npm/PyPI/Maven packages |
| **M4: API & Portal** | Spring Boot REST API, OpenAPI documentation, developer documentation website |
| **M5: Media System** | Asset management, license validation workflow, original anatomical illustrations |
| **M6: Community Platform** | GitHub contribution automation, admin dashboard, CI/CD release pipeline |

---

## Schema Evolution

Schema changes follow a strict process:

1. **Non-breaking additions** (new optional fields): Minor schema version bump. Existing data remains valid.
2. **Breaking changes** (required field added, enum value removed, field renamed): Major schema version bump. Migration guide required. Old schema version supported for one major dataset release.
3. **Field deprecation**: Deprecated fields are marked in the schema with a `deprecated: true` annotation and a migration note. Removal follows two major releases after deprecation.

---

## Security Considerations

- The validation script uses only Node.js built-in modules. No `npm install` required, eliminating supply chain risk in the CI pipeline.
- Exercise data files are read-only by design. The API serves data; it does not write to dataset files at runtime.
- Media assets must have documented provenance before serving. Unknown-license assets are rejected.
- The admin interface (Milestone 6) requires authentication. The read-only public API does not.
