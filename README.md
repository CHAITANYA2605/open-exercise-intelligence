# Open Exercise Intelligence (OEI)

> A free, open-source, community-driven exercise knowledge base

[![License: MIT](https://img.shields.io/badge/Code-MIT-blue.svg)](LICENSE)
[![Data: CC0](https://img.shields.io/badge/Data-CC0_1.0-green.svg)](LICENSING.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> **v0.9.0-beta** — All 866 exercises are AI-generated and unreviewed. Suitable for development and prototyping. See [RELEASE-GATE-v1.0.0.md](RELEASE-GATE-v1.0.0.md) for the path to a production-ready v1.0.0 release.

---

## Release Status

| Version | Status | Dataset | SDKs |
|---|---|---|---|
| **v0.9.0-beta** | ✅ Current | 866 AI-generated, UNREVIEWED | Local use only |
| v0.9.5-beta | Planned | ≥200 APPROVED exercises | Local use only |
| v1.0.0-rc | Planned | ≥500 APPROVED exercises | npm + PyPI published |
| v1.0.0 | Target | All P0 gates passed | All SDKs verified |

- Release gate checklist: [RELEASE-GATE-v1.0.0.md](RELEASE-GATE-v1.0.0.md)
- Known variant cycle issues: [docs/variant-cycles.md](docs/variant-cycles.md)
- Release notes: [RELEASE-NOTES-0.9.0-beta.md](RELEASE-NOTES-0.9.0-beta.md)

---

## Introduction

**Open Exercise Intelligence (OEI)** is a production-quality, structured exercise knowledge base built for developers. It provides a comprehensive, searchable dataset of 866 exercises — including muscle mappings, equipment requirements, execution instructions, training parameters, and exercise substitutions — that any developer can freely integrate into fitness applications, workout trackers, AI coaches, sports science platforms, and more.

**No account required. No API key. No royalties. No restrictions for commercial use.**

---

## Quick Start

### Run the REST API with Docker

```bash
git clone https://github.com/CHAITANYA2605/open-exercise-intelligence.git
cd oei

# Build and start the Spring Boot API on port 8080
docker compose up

# Test it
curl http://localhost:8080/v1/exercises?category=strength&per_page=5
curl http://localhost:8080/v1/exercises/barbell-bench-press
curl http://localhost:8080/v1/facets
```

### Build and run the API without Docker

```bash
cd api/server
mvn package -DskipTests
java -jar target/oei-api-1.0.0.jar
```

The API will start on `http://localhost:8080`. The dataset is loaded from `data/generated/oei-dataset-all.json` relative to the working directory (run `npm run build:dataset` first if you haven't already).

### Developer Portal

```bash
cd portal
npm install
npm run dev
# Open http://localhost:5173
```

The portal includes:
- **/** — Landing page with stats, features, and quick-start snippets
- **/docs** — Full API reference documentation
- **/explore** — Interactive exercise browser (loads dataset in-browser, no API needed)
- **/playground** — Live API playground to test endpoints

---

## SDK Installation

> **Note:** SDKs are not yet published to package registries. Use local installation until registry publishing is complete (planned for v1.0.0-rc).

### JavaScript / TypeScript

```bash
# Not yet on npm — local install:
npm install ./sdks/js
```

```typescript
import { OEIClient } from '@oei/exercise-sdk';

const client = new OEIClient({ dataPath: './data/generated/oei-dataset-all.json' });
const results = await client.search({ query: 'squat', category: 'strength' });
```

### Python

```bash
# Not yet on PyPI — local install:
pip install ./sdks/python
```

```python
from oei import OEIClient

client = OEIClient(data_path="data/generated/oei-dataset-all.json")
results = client.search(query="deadlift", difficulty="intermediate")
```

### Java (Maven)

```xml
<dependency>
  <groupId>io.oei</groupId>
  <artifactId>oei-sdk</artifactId>
  <version>1.0.0</version>
</dependency>
```

```java
OEIClient client = new OEIClient("data/oei-dataset.json");
SearchResult result = client.search(new SearchParams().query("bench press").category("strength"));
```

### Dart / Flutter

Add to `pubspec.yaml`:

```yaml
dependencies:
  oei:
    git:
      url: https://github.com/CHAITANYA2605/open-exercise-intelligence.git
      path: sdks/dart
```

**Flutter (offline, from bundled asset):**
```dart
import 'package:oei/oei.dart';

// Add assets/oei-dataset.json to your pubspec flutter.assets, then:
final client = await FlutterAssetLoader.load('assets/oei-dataset.json');
final result = await client.search(SearchParams(query: 'bench press', category: 'strength'));
```

**REST API mode:**
```dart
final client = OEIClient.fromUrl('http://localhost:8080');
final result = await client.search(SearchParams(category: 'strength', page: 1));
```

---

## API Reference

Base URL: `http://localhost:8080` (self-hosted) or your deployed instance.

| Endpoint | Description |
|---|---|
| `GET /v1/exercises` | List/search exercises with filters |
| `GET /v1/exercises/{idOrSlug}` | Get a single exercise |
| `GET /v1/exercises/{idOrSlug}/related` | Related exercises by muscle overlap |
| `GET /v1/exercises/{idOrSlug}/alternatives` | Equipment-based substitutions |
| `GET /v1/facets` | Aggregated counts for all filterable fields |
| `GET /v1/muscles` | Full muscle taxonomy |
| `GET /v1/equipment` | Full equipment list |
| `GET /v1/dataset-version` | Dataset version metadata |
| `GET /actuator/health` | Health check |

**Common query params for `/v1/exercises`:** `q`, `category`, `difficulty`, `muscle`, `equipment`, `movement_pattern`, `exercise_type`, `review_status`, `page`, `per_page`

Full OpenAPI spec: [`api/openapi.yaml`](api/openapi.yaml)

---

## Dataset

| Directory | Contents |
|---|---|
| `data/generated/oei-dataset-all.json` | All 866 exercises (versioned wrapper, includes UNREVIEWED) |
| `data/generated/oei-dataset-approved.json` | APPROVED exercises only (empty until human review complete) |
| `data/generated/oei-index-all.json` | Lightweight summary index (all exercises) |
| `data/generated/oei-index-approved.json` | Lightweight summary index (approved only) |
| `data/exercises/` | Source exercise JSON files (by category subdirectory) |
| `data/muscles/muscles.json` | Complete muscle taxonomy |
| `data/equipment/equipment.json` | Equipment definitions |
| `data/taxonomy/categories.json` | Canonical category definitions (single source of truth) |

> **Important:** `oei-dataset-all.json` contains AI-generated, unreviewed content. Use `oei-dataset-approved.json` for production applications — it will only contain human-verified exercises.

### Dataset statistics

- **866** source exercises (all UNREVIEWED as of v0.9.0-beta)
- **9** canonical categories: strength, cardio, stretching, functional, power, mobility, plyometrics, balance, strongman
- **75** individual muscles in taxonomy
- **50** equipment types
- **Schema version:** 1.1.0

### Regenerate datasets

```bash
node scripts/generation/build-dataset.js
# Outputs: data/generated/oei-dataset-all.json, oei-dataset-approved.json, indexes, checksums
```

### Release dry-run

```bash
npm run release:check
# Reports: total, by-status, broken refs, placeholder text, production-eligible count
```

### Dataset analytics

```bash
npm run analytics
# Reports: by-category, by-difficulty, by-review-status, content gaps
```

---

## License

| Component | License |
|---|---|
| **Source code** (API, SDKs, portal, scripts) | [MIT](LICENSE) — use freely in any project, commercial or open source |
| **Exercise data** (`data/exercises/`, `data/oei-dataset.json`, etc.) | [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) — public domain, no attribution required |
| **Documentation** (CONTRIBUTING, GOVERNANCE, architecture docs) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — share with attribution |
| **Third-party assets** | See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) |

**TL;DR:** The exercise data is CC0 — you can use it in any application, sell products built on it, and you don't owe anyone attribution. The code is MIT — same deal with attribution. The documentation is CC BY — please credit OEI if you reproduce it.

See [LICENSING.md](LICENSING.md) for a full explanation.

---

## Roadmap

| Milestone | Status | Description |
|---|---|---|
| M1: Foundation | ✅ Complete | Schema, taxonomy, governance documents |
| M2: Dataset Engine | ✅ Complete | 866 exercise records, validation, import/export |
| M3: Search & SDKs | ✅ Complete | Search engine, JS/Python/Java SDKs |
| M4: API & Portal | ✅ Complete | Spring Boot REST API, developer portal, Dart/Flutter SDK |
| M5: Media System | ✅ Complete | Asset management, license validation, media registry |
| M6: Community Platform | ✅ Complete | Contribution workflow, admin dashboard, CI/CD workflows |

---

## Community

OEI is built by the community. Contributions of all kinds are welcome: new exercises, corrections, original illustrations, SDK improvements, and documentation.

**GitHub:** [https://github.com/CHAITANYA2605/open-exercise-intelligence](https://github.com/CHAITANYA2605/open-exercise-intelligence)

### How to contribute

1. Fork the repository
2. Copy the appropriate template from `community/templates/`
3. Fill in every field (read the `_instructions` values)
4. Run `node scripts/validate.js` to check your work
5. Open a Pull Request — a maintainer will review within 14 days

See [community/README.md](community/README.md) for the full contribution guide and review lifecycle.

---

## Project Structure

```
oei/
├── api/
│   ├── openapi.yaml              # OpenAPI 3.1 specification
│   └── server/                   # Spring Boot REST API (Java 21)
├── community/
│   ├── submissions/              # Drop submission JSON files here before PR
│   ├── reviews/                  # Rejection records from admin scripts
│   └── templates/                # exercise-submission, correction, media templates
├── data/
│   ├── exercises/                # One JSON file per exercise, by category
│   ├── muscles/muscles.json      # Muscle taxonomy (75+ muscles)
│   ├── equipment/equipment.json  # Equipment registry (50+ items)
│   ├── categories/               # Exercise category definitions
│   ├── movement-patterns/        # Movement pattern taxonomy
│   ├── media/registry.json       # Media asset registry
│   ├── oei-dataset.json          # Flat 866-exercise bundle (generated)
│   ├── oei-index.json            # Lightweight index (generated)
│   └── dataset-version.json      # Version metadata
├── docs/
│   └── architecture.md           # Architecture overview
├── portal/                       # React + TypeScript + Vite developer portal
│   └── src/
│       ├── pages/                # Home, Docs, Explore, Playground, Community, Admin
│       └── components/           # Navbar, ExerciseCard, SearchBar, etc.
├── schema/                       # JSON Schema (draft-07) for all data types
├── scripts/
│   ├── validate.js               # Schema validation
│   ├── check-dataset.js          # Dataset health checks
│   ├── export-flat-json.js       # Flat bundle generator
│   ├── export-csv.js             # CSV export
│   ├── validate-media.js         # Media registry validation
│   └── admin/
│       ├── review-submission.js  # Review, approve, reject community submissions
│       ├── export-release.js     # Full release export pipeline
│       └── stats.js              # Comprehensive dataset statistics
├── sdks/
│   ├── js/                       # JavaScript / TypeScript SDK
│   ├── python/                   # Python SDK
│   ├── java/                     # Java SDK (Maven)
│   └── dart/                     # Dart / Flutter SDK
├── .github/
│   └── workflows/
│       ├── validate-dataset.yml  # CI: validate on PRs touching data/
│       ├── validate-media.yml    # CI: validate media on relevant PRs
│       ├── release-dataset.yml   # Manual: cut a dataset release
│       └── build-api.yml         # CI: build Spring Boot API
├── CONTRIBUTING.md
├── GOVERNANCE.md
├── CODE_OF_CONDUCT.md
├── LICENSING.md
└── CHANGELOG.md
```

---

## Scripts Reference

| Script | Usage | Description |
|---|---|---|
| `scripts/validate.js` | `node scripts/validate.js` | Validates all exercise files against JSON Schema |
| `scripts/check-dataset.js` | `node scripts/check-dataset.js` | Dataset integrity checks (slugs, IDs, references) |
| `scripts/export-flat-json.js` | `node scripts/export-flat-json.js` | Regenerates `data/oei-dataset.json` |
| `scripts/export-csv.js` | `node scripts/export-csv.js` | Exports dataset as CSV |
| `scripts/import-csv.js` | `node scripts/import-csv.js` | Imports exercises from CSV |
| `scripts/validate-media.js` | `node scripts/validate-media.js` | Validates `data/media/registry.json` |
| `scripts/check-license-compatibility.js` | `node scripts/check-license-compatibility.js` | Checks license compatibility of all assets |
| `scripts/generate-attributions.js` | `node scripts/generate-attributions.js` | Generates attribution notices |
| `scripts/admin/stats.js` | `node scripts/admin/stats.js` | Prints comprehensive dataset statistics |
| `scripts/admin/export-release.js` | `node scripts/admin/export-release.js [--version x.x.x]` | Full release pipeline: validate, bundle, update version |
| `scripts/admin/review-submission.js` | `node scripts/admin/review-submission.js <file> [--approve\|--reject --reason "..."]` | Review, approve, or reject a community submission |

---

## Contributing

We welcome contributions of new exercise records, corrections, original illustrations, SDK improvements, and documentation. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

---

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

---

## Security

To report a security vulnerability, please follow the process described in [SECURITY.md](SECURITY.md).
