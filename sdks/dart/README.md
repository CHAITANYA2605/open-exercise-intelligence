# OEI Dart/Flutter SDK

Official Dart and Flutter SDK for the [Open Exercise Intelligence](https://github.com/CHAITANYA2605/open-exercise-intelligence) dataset.

Supports two modes:
- **Offline / Flutter asset** — load the 3 MB dataset from a bundled asset, zero network required
- **REST API** — connect to a running OEI Spring Boot server

---

## Installation

Add to your `pubspec.yaml`:

```yaml
dependencies:
  oei:
    git:
      url: https://github.com/CHAITANYA2605/open-exercise-intelligence.git
      path: sdks/dart
```

---

## Quick Start

### Flutter asset mode (offline)

Bundle the dataset with your app, then load it at runtime:

**pubspec.yaml**
```yaml
flutter:
  assets:
    - assets/oei-dataset.json   # copy from data/generated/oei-dataset-all.json
```

**Dart code**
```dart
import 'package:oei/oei.dart';

// Load once (e.g. in initState)
final client = await FlutterAssetLoader.load('assets/oei-dataset.json');

// Search
final result = await client.search(SearchParams(
  query: 'bench press',
  category: 'strength',
  page: 1,
  perPage: 20,
));

print('${result.meta.total} exercises found');
for (final ex in result.data) {
  print('${ex.name} — ${ex.difficultyLevel}');
}
```

### REST API mode

```dart
import 'package:oei/oei.dart';

final client = OEIClient.fromUrl('http://localhost:8080');

// Search with filters
final result = await client.search(SearchParams(
  category: 'strength',
  difficulty: 'intermediate',
  movementPattern: 'push',
));

// Get a single exercise
final exercise = await client.get('barbell-bench-press');

// Related exercises
final related = await client.related('barbell-bench-press', limit: 5);

// Facet counts
final facets = await client.facets();
print(facets['category']); // {strength: 312, cardio: 45, ...}
```

### In-memory from JSON string

```dart
import 'dart:io';
import 'package:oei/oei.dart';

final jsonString = File('data/generated/oei-dataset-all.json').readAsStringSync();
final client = OEIClient.fromJsonString(jsonString);
```

---

## API Reference

### `OEIClient`

| Constructor/Factory | Description |
|---|---|
| `OEIClient.fromUrl(baseUrl)` | REST API mode |
| `OEIClient.fromList(exercises)` | In-memory from a list of Exercise objects |
| `OEIClient.fromJsonString(json)` | Parse OEI JSON dataset string |

| Method | Returns | Description |
|---|---|---|
| `search(SearchParams)` | `Future<SearchResult>` | Filter and paginate exercises |
| `get(idOrSlug)` | `Future<Exercise?>` | Get one exercise by UUID or slug |
| `related(idOrSlug, {limit})` | `Future<List<Exercise>>` | Exercises sharing muscles |
| `facets()` | `Future<Map<String, Map<String, int>>>` | Counts per filterable field |
| `dispose()` | `void` | Close HTTP client (REST mode only) |

### `SearchParams`

| Field | Type | Default | Description |
|---|---|---|---|
| `query` | `String?` | — | Full-text search (AND semantics) |
| `category` | `String?` | — | Filter by category |
| `difficulty` | `String?` | — | Filter by difficulty level |
| `muscleSlug` | `String?` | — | Filter by muscle slug |
| `equipmentId` | `String?` | — | Filter by equipment ID |
| `movementPattern` | `String?` | — | Filter by movement pattern |
| `exerciseType` | `String?` | — | Filter by exercise type |
| `laterality` | `String?` | — | `bilateral` or `unilateral` |
| `page` | `int` | `1` | Page number |
| `perPage` | `int` | `20` | Results per page (max 100) |

### `FlutterAssetLoader`

```dart
// Load from default Flutter asset bundle
final client = await FlutterAssetLoader.load('assets/oei-dataset.json');

// Load from a custom bundle (e.g. in tests)
final client = await FlutterAssetLoader.loadFromBundle(bundle, 'assets/oei-dataset.json');
```

---

## Flutter Setup

1. Copy `data/generated/oei-dataset-all.json` into your Flutter project's `assets/` folder.
2. Declare the asset in `pubspec.yaml`:
   ```yaml
   flutter:
     assets:
       - assets/oei-dataset.json
   ```
3. Load once at app startup using `FlutterAssetLoader.load(...)`.
4. Store the client in state management (Provider, Riverpod, Bloc, etc.) for reuse.

---

## Example App

See [`example/`](example/) for a minimal Flutter app that:
- Loads the dataset from assets
- Shows a search text field
- Filters by category chips
- Displays results as a scrollable list of exercise cards

```bash
cd example
flutter pub get
# Copy the dataset:
mkdir -p assets
cp ../../../data/generated/oei-dataset-all.json assets/
flutter run
```

---

## License

MIT (code) · CC0 1.0 (dataset)
