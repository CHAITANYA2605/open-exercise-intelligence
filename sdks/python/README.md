# oei-exercise-sdk (Python)

Official Python SDK for the [Open Exercise Intelligence](https://github.com/CHAITANYA2605/open-exercise-intelligence) dataset.

**License:** MIT  
**Data:** CC0 1.0

## Installation

```bash
pip install oei-exercise-sdk
```

## Quick Start

```python
from oei import OEIClient, SearchParams, SearchFilters

# Initialize from the local dataset
client = OEIClient(data_dir="./data/exercises")
client.init()

print(f"Loaded {client.size} exercises")

# Full-text search
results = client.search(SearchParams(q="bench press"))
print(results.total)

# Filter by category and difficulty
results = client.search(SearchParams(
    filters=SearchFilters(category="strength", difficulty_level="beginner"),
    sort_by="name",
    sort_order="asc",
    per_page=10,
))

for ex in results.results:
    print(ex.name, ex.difficulty_level)

# Get one exercise by slug or UUID
ex = client.get("barbell-bench-press")
if ex:
    print(ex.execution.steps)

# Related exercises
related = client.related("barbell-bench-press", limit=5)

# Facet counts
facets = client.facets()
for entry in facets.category:
    print(entry.value, entry.count)
```

## API

### `OEIClient(data_dir=None)`

| Param | Type | Description |
|-------|------|-------------|
| `data_dir` | `str` | Path to the `data/exercises` directory |

### `client.init()` → `OEIClient`

Load exercises from `data_dir`. Chainable.

### `client.load_from_list(exercises)` → `OEIClient`

Load from a list of `Exercise` objects.

### `client.load_from_dicts(raw)` → `OEIClient`

Load from a list of raw dicts (parsed JSON).

### `client.search(params=None)` → `SearchResult`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `q` | `str` | `""` | Full-text query (AND semantics) |
| `filters` | `SearchFilters` | — | Structured filters |
| `sort_by` | `str` | `"score"` | `"score"` \| `"name"` \| `"difficulty"` |
| `sort_order` | `str` | `"desc"` | `"asc"` \| `"desc"` |
| `page` | `int` | `1` | Page number (1-based) |
| `per_page` | `int` | `20` | Max 100 |
| `include_related` | `bool` | `False` | Attach related exercises |

### `client.get(id_or_slug)` → `Optional[Exercise]`

Get a single exercise by UUID or slug.

### `client.related(id_or_slug, limit=5)` → `List[ExerciseSummary]`

Get related exercises by muscle overlap + category.

### `client.facets(filters=None)` → `Facets`

Counts per distinct value for each facet field.

### `client.list(page, per_page)` → `SearchResult`

List all exercises paginated.

## SearchFilters

```python
SearchFilters(
    category=None,              # str: 'strength' | 'cardio' | 'rehabilitation' | ...
    difficulty_level=None,      # str: 'beginner' | 'intermediate' | 'advanced'
    movement_pattern=None,      # str: 'push' | 'pull' | 'squat' | 'hinge' | ...
    exercise_type=None,         # str: 'compound' | 'isolation'
    laterality=None,            # str: 'bilateral' | 'unilateral'
    force_type=None,            # str: 'push' | 'pull' | 'static'
    muscle_slug=None,           # str: any muscle slug
    primary_muscle_slug=None,   # str: primary muscles only
    equipment_id=None,          # str: equipment UUID
    training_goal=None,         # str: 'strength' | 'hypertrophy' | 'endurance' | ...
    tags=None,                  # List[str]: all tags must match
)
```
