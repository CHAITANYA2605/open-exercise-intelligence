# oei-exercise-sdk (Java)

Official Java SDK for the [Open Exercise Intelligence](https://github.com/open-exercise-intelligence/oei) dataset.

**License:** MIT  
**Data:** CC0 1.0  
**Requires:** Java 11+

## Maven

```xml
<dependency>
  <groupId>io.oei</groupId>
  <artifactId>oei-exercise-sdk</artifactId>
  <version>1.0.0</version>
</dependency>
```

## Gradle

```groovy
implementation 'io.oei:oei-exercise-sdk:1.0.0'
```

## Quick Start

```java
import io.oei.sdk.OEIClient;
import io.oei.sdk.SearchParams;
import io.oei.sdk.SearchResult;

// Initialize from the local dataset directory
OEIClient client = new OEIClient("./data/exercises");
client.init();

// Full-text search
SearchParams params = SearchParams.builder()
    .q("bench press")
    .category("strength")
    .perPage(10)
    .build();

SearchResult result = client.search(params);
System.out.println("Total results: " + result.getTotal());
result.getExercises().forEach(ex ->
    System.out.println("[" + ex.getDifficultyLevel() + "] " + ex.getName())
);

// Get by slug
Exercise ex = client.getBySlug("barbell-bench-press");

// Get related exercises
List<Exercise> related = client.related("barbell-bench-press", 5);

// Facet counts
Map<String, List<FacetEntry>> facets = client.facets();
```

## Filter Options

```java
SearchParams params = SearchParams.builder()
    .q("squat")
    .category("strength")           // strength | power | rehabilitation | mobility
    .difficultyLevel("beginner")    // beginner | intermediate | advanced
    .movementPattern("push")        // push | pull | hip-hinge | rotation
    .laterality("bilateral")        // bilateral | unilateral
    .primaryMuscleSlug("quadriceps-rectus-femoris")
    .trainingGoal("hypertrophy")
    .sortBy("name")                 // score | name | difficulty
    .sortOrder("asc")               // asc | desc
    .page(1)
    .perPage(20)
    .build();
```

## Zero-Dependency Design

The Java SDK has **no runtime dependencies**. It ships a minimal JSON parser for reading exercise files, requiring only the Java standard library. This keeps integration friction near zero for any JVM project regardless of dependency management preferences.

## License

Source code: MIT  
Exercise data: CC0 1.0 (public domain dedication)
