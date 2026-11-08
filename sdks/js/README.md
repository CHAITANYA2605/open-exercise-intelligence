# @oei/exercise-sdk

Official JavaScript / TypeScript SDK for the [Open Exercise Intelligence](https://github.com/CHAITANYA2605/open-exercise-intelligence) dataset.

**License:** MIT  
**Data:** CC0 1.0

## Installation

```bash
npm install @oei/exercise-sdk
```

## Quick Start (Node.js)

```js
const { OEIClient } = require('@oei/exercise-sdk');

const client = new OEIClient({ dataDir: './data/exercises' });
await client.init();

// Full-text search
const results = client.search({ q: 'bench press' });
console.log(results.total); // number of matches

// Filter by category and difficulty
const beginner = client.search({
  filters: { category: 'strength', difficulty_level: 'beginner' },
  sort_by: 'name',
  sort_order: 'asc',
});

// Get one exercise by slug or UUID
const ex = client.get('barbell-bench-press');

// Related exercises
const related = client.related('barbell-bench-press', 5);

// Facet counts
const facets = client.facets();
// { category: [{value:'strength', count:200}, ...], difficulty_level: [...], ... }
```

## Quick Start (Browser)

```js
import { OEIClient } from '@oei/exercise-sdk';

// Fetch the pre-built flat JSON
const exercises = await fetch('/oei-exercises.json').then(r => r.json());

const client = new OEIClient();
client.loadFromArray(exercises);

const results = client.search({ q: 'squat', per_page: 10 });
```

## API

### `new OEIClient(opts?)`

| Option | Type | Description |
|--------|------|-------------|
| `dataDir` | `string` | Path to the `data/exercises` directory (Node.js only) |

### `client.init()` → `Promise<void>`

Loads exercises from `dataDir`. Node.js only.

### `client.loadFromArray(exercises)` → `void`

Loads exercises from an array. Use in the browser.

### `client.search(params?)` → `SearchResult`

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `q` | `string` | `''` | Full-text query (AND semantics) |
| `filters` | `SearchFilters` | `{}` | Structured filters |
| `sort_by` | `'score'\|'name'\|'difficulty'` | `'score'` | Sort field |
| `sort_order` | `'asc'\|'desc'` | `'desc'` | Sort direction |
| `page` | `number` | `1` | Page number (1-based) |
| `per_page` | `number` | `20` | Results per page (max 100) |
| `include_related` | `boolean` | `false` | Include related exercises |

**SearchFilters:**

```ts
{
  category?: string;             // 'strength' | 'cardio' | 'rehabilitation' | ...
  difficulty_level?: string;     // 'beginner' | 'intermediate' | 'advanced'
  movement_pattern?: string;     // 'push' | 'pull' | 'squat' | 'hinge' | ...
  exercise_type?: string;        // 'compound' | 'isolation'
  laterality?: string;           // 'bilateral' | 'unilateral'
  force_type?: string;           // 'push' | 'pull' | 'static'
  muscle_slug?: string;          // any muscle slug (primary, secondary, or stabilizer)
  primary_muscle_slug?: string;  // primary muscle only
  equipment_id?: string;         // equipment UUID
  training_goal?: string;        // 'strength' | 'hypertrophy' | 'endurance' | ...
  tags?: string[];               // all tags must be present
}
```

### `client.get(idOrSlug)` → `Exercise | undefined`

Get a single exercise by UUID or slug.

### `client.related(idOrSlug, limit?)` → `ExerciseSummary[]`

Get related exercises sorted by muscle overlap and category similarity.

### `client.facets(filters?)` → `Facets`

Get value-count facets for the given filter context.

### `client.list(page?, per_page?)` → `SearchResult`

List all exercises paginated.

### `client.size` → `number`

Number of exercises loaded.
