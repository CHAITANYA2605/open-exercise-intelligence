# OEI Quick Start — Run It on Your Laptop

Everything runs with **Docker only**. No Node, Java, or Maven needed.

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

That's it.

---

## Step 1 — Clone the repo

```bash
git clone https://github.com/CHAITANYA2605/open-exercise-intelligence.git
cd open-exercise-intelligence
```

---

## Step 2 — Build the dataset

This reads all 866 exercise JSON files and generates the `data/generated/` files the API and portal need.

```bash
docker run --rm -v "$(pwd)":/app -w /app node:20-alpine node scripts/generation/build-dataset.js
```

You should see output like:
```
✓ Built oei-dataset-all.json      (866 exercises)
✓ Built oei-dataset-approved.json (0 exercises)
✓ Built oei-index-all.json
✓ Built oei-index-approved.json
```

---

## Step 3 — Start the REST API

```bash
docker compose up --build
```

Wait ~30 seconds for the Spring Boot API to start. When you see:
```
Started OeiApiApplication in X.XXX seconds
```

Test it:
```bash
curl http://localhost:8080/actuator/health
# → {"status":"UP"}

curl "http://localhost:8080/v1/exercises?q=bench+press&per_page=3"
curl "http://localhost:8080/v1/exercises/barbell-bench-press"
```

---

## Step 4 — Run the portal (optional)

Open a new terminal:

```bash
docker run --rm -it \
  -v "$(pwd)/portal":/app \
  -v "$(pwd)/data":/app/public/data \
  -w /app \
  -p 5173:5173 \
  node:20-alpine \
  sh -c "npm install && npm run dev -- --host"
```

Open http://localhost:5173 in your browser.

> **Note:** The portal loads the dataset directly from `data/generated/oei-dataset-all.json` via the browser — no API call needed for browsing.

---

## Useful commands

```bash
# Validate all exercises (schema check)
docker run --rm -v "$(pwd)":/app -w /app node:20-alpine node scripts/validate.js

# Run all tests
docker run --rm -v "$(pwd)":/app -w /app node:20-alpine sh -c "
  node tests/search.test.js &&
  node tests/taxonomy.test.js &&
  node tests/contract/dataset-format.test.js
"

# Release check (finds P0 errors before a release)
docker run --rm -v "$(pwd)":/app -w /app node:20-alpine node scripts/release-check.js

# Analytics summary
docker run --rm -v "$(pwd)":/app -w /app node:20-alpine node scripts/analytics/dataset-report.js

# Stop the API
docker compose down
```

---

## API endpoints reference

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/v1/exercises` | List/search exercises |
| GET | `/v1/exercises?q=bench+press` | Full-text search |
| GET | `/v1/exercises?category=strength` | Filter by category |
| GET | `/v1/exercises?review_status=APPROVED` | Filter by review status |
| GET | `/v1/exercises/{slug}` | Single exercise by slug |
| GET | `/v1/exercises/{slug}/related` | Related exercises |
| GET | `/v1/muscles` | All muscles |
| GET | `/v1/equipment` | All equipment |
| GET | `/v1/facets` | Counts by category/difficulty/etc |
| GET | `/v1/dataset/versions` | Dataset version info |
| GET | `/actuator/health` | Health check |

Query params for `/v1/exercises`: `q`, `category`, `difficulty`, `muscle`, `equipment`, `movement_pattern`, `exercise_type`, `review_status`, `page`, `per_page` (max 100).

---

## Approving an exercise

See the Admin panel at http://localhost:5173/admin or follow [docs/data/human-review-report.md](docs/data/human-review-report.md).
