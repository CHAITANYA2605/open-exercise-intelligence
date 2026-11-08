package io.oei.sdk;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.*;

/**
 * OEIClient — main entry point for the OEI Java SDK.
 *
 * <p>Zero external dependencies. JSON parsing uses a minimal hand-written
 * parser sufficient for the OEI dataset structure.</p>
 *
 * <pre>{@code
 * OEIClient client = new OEIClient(Paths.get("data/exercises"));
 * client.init();
 *
 * SearchResult results = client.search(
 *     SearchParams.builder().q("squat").difficultyLevel("beginner").build()
 * );
 * System.out.println(results.total);
 * }</pre>
 *
 * <p>License: MIT | Data: CC0 1.0</p>
 */
public final class OEIClient {

    private static final Map<String, Integer> DIFFICULTY_ORDER = Map.of(
        "beginner", 0, "intermediate", 1, "advanced", 2
    );
    private static final Pattern NON_ALPHA = Pattern.compile("[^a-z0-9 \\-]");

    private final Path dataDir;
    private List<IndexEntry> index = List.of();

    public OEIClient(Path dataDir) {
        this.dataDir = dataDir;
    }

    // -----------------------------------------------------------------------
    // Init
    // -----------------------------------------------------------------------

    /** Load all exercises from the configured data directory. */
    public OEIClient init() throws IOException {
        List<Exercise> exercises = new ArrayList<>();
        loadDir(dataDir, exercises);
        buildIndex(exercises);
        return this;
    }

    /** Load exercises from a provided list (useful for testing). */
    public OEIClient loadFromList(List<Exercise> exercises) {
        buildIndex(exercises);
        return this;
    }

    public int size() { return index.size(); }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /** Get a single exercise by UUID or slug. Returns empty if not found. */
    public Optional<Exercise> get(String idOrSlug) {
        return index.stream()
            .map(e -> e.exercise)
            .filter(ex -> ex.exerciseId.equals(idOrSlug) || ex.slug.equals(idOrSlug))
            .findFirst();
    }

    /** Search exercises with text and filters. */
    public SearchResult search(SearchParams params) {
        List<String> tokens = tokenize(params.q);
        int perPage = Math.min(Math.max(1, params.perPage), 100);
        int page = Math.max(1, params.page);

        List<ScoredEntry> scored = index.stream()
            .filter(e -> matchesFilter(e.exercise, params))
            .map(e -> new ScoredEntry(e.exercise, score(e.searchText, e.exercise.name, tokens)))
            .filter(s -> s.score > 0)
            .collect(Collectors.toList());

        // Sort
        boolean reverse = "desc".equals(params.sortOrder);
        Comparator<ScoredEntry> cmp;
        switch (params.sortBy) {
            case "name":
                cmp = Comparator.comparing(s -> s.exercise.name);
                break;
            case "difficulty":
                cmp = Comparator.comparingInt(s -> DIFFICULTY_ORDER.getOrDefault(s.exercise.difficultyLevel, 0));
                break;
            default:
                cmp = Comparator.comparingDouble((ScoredEntry s) -> s.score).reversed();
                reverse = false;
                break;
        }
        if (reverse) cmp = cmp.reversed();
        scored.sort(cmp);

        int total = scored.size();
        int offset = (page - 1) * perPage;
        List<Exercise> page_results = scored.subList(
            Math.min(offset, total), Math.min(offset + perPage, total)
        ).stream().map(s -> s.exercise).collect(Collectors.toList());

        return new SearchResult(page_results, total, page, perPage, (int) Math.ceil((double) total / perPage));
    }

    /** Get related exercises ranked by muscle overlap. */
    public List<Exercise> related(String idOrSlug, int limit) {
        return get(idOrSlug).map(target -> {
            Set<String> primarySlugs = target.muscles.primary.stream()
                .map(m -> m.muscleSlug).collect(Collectors.toSet());

            return index.stream()
                .map(e -> e.exercise)
                .filter(ex -> !ex.exerciseId.equals(target.exerciseId))
                .map(ex -> {
                    long overlap = ex.muscles.primary.stream()
                        .filter(m -> primarySlugs.contains(m.muscleSlug)).count();
                    int bonus = (ex.category.equals(target.category) ? 2 : 0)
                              + (ex.exerciseFamily.equals(target.exerciseFamily) ? 3 : 0);
                    return new ScoredEntry(ex, overlap * 5 + bonus);
                })
                .filter(s -> s.score > 0)
                .sorted(Comparator.comparingDouble((ScoredEntry s) -> s.score).reversed())
                .limit(limit)
                .map(s -> s.exercise)
                .collect(Collectors.toList());
        }).orElse(List.of());
    }

    public List<Exercise> related(String idOrSlug) { return related(idOrSlug, 5); }

    /** Get facet counts for all exercises. */
    public Map<String, List<Map.Entry<String, Long>>> facets() {
        Map<String, List<Map.Entry<String, Long>>> out = new LinkedHashMap<>();
        for (String field : List.of("category","difficulty_level","movement_pattern","exercise_type","laterality","force_type")) {
            Map<String, Long> counts = index.stream().map(e -> {
                switch (field) {
                    case "category": return e.exercise.category;
                    case "difficulty_level": return e.exercise.difficultyLevel;
                    case "movement_pattern": return e.exercise.movementPattern;
                    case "exercise_type": return e.exercise.exerciseType;
                    case "laterality": return e.exercise.laterality;
                    case "force_type": return e.exercise.forceType;
                    default: return "";
                }
            }).filter(v -> !v.isEmpty()).collect(Collectors.groupingBy(v -> v, Collectors.counting()));
            out.put(field, counts.entrySet().stream()
                .sorted(Map.Entry.<String,Long>comparingByValue().reversed())
                .collect(Collectors.toList()));
        }
        return out;
    }

    // -----------------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------------

    private void loadDir(Path dir, List<Exercise> out) throws IOException {
        try (DirectoryStream<Path> ds = Files.newDirectoryStream(dir)) {
            for (Path entry : ds) {
                if (Files.isDirectory(entry)) {
                    loadDir(entry, out);
                } else if (entry.toString().endsWith(".json")) {
                    try {
                        String json = Files.readString(entry, StandardCharsets.UTF_8);
                        out.add(JsonParser.parseExercise(json));
                    } catch (Exception ignored) {}
                }
            }
        }
    }

    private void buildIndex(List<Exercise> exercises) {
        index = exercises.stream()
            .map(ex -> new IndexEntry(ex, buildSearchText(ex)))
            .collect(Collectors.toList());
    }

    private String buildSearchText(Exercise ex) {
        String raw = String.join(" ",
            ex.name,
            String.join(" ", ex.alternativeNames),
            ex.description,
            ex.category,
            ex.exerciseFamily,
            ex.movementPattern,
            String.join(" ", ex.metadata.tags),
            ex.muscles.primary.stream().map(m -> m.muscleSlug).collect(Collectors.joining(" ")),
            ex.muscles.secondary.stream().map(m -> m.muscleSlug).collect(Collectors.joining(" ")),
            ex.muscles.stabilizers.stream().map(m -> m.muscleSlug).collect(Collectors.joining(" "))
        ).toLowerCase();
        return NON_ALPHA.matcher(raw).replaceAll(" ");
    }

    private static List<String> tokenize(String q) {
        if (q == null || q.isBlank()) return List.of();
        String normalized = NON_ALPHA.matcher(q.toLowerCase()).replaceAll(" ");
        return Arrays.stream(normalized.split("\\s+"))
            .filter(t -> !t.isEmpty()).collect(Collectors.toList());
    }

    private static double score(String searchText, String name, List<String> tokens) {
        if (tokens.isEmpty()) return 1.0;
        double s = 0;
        String nameLower = name.toLowerCase();
        for (String t : tokens) {
            if (!searchText.contains(t)) return 0;
            s += nameLower.contains(t) ? 10 : 1;
        }
        return s;
    }

    private static boolean matchesFilter(Exercise ex, SearchParams p) {
        if (p.category != null && !p.category.equals(ex.category)) return false;
        if (p.difficultyLevel != null && !p.difficultyLevel.equals(ex.difficultyLevel)) return false;
        if (p.movementPattern != null && !p.movementPattern.equals(ex.movementPattern)) return false;
        if (p.exerciseType != null && !p.exerciseType.equals(ex.exerciseType)) return false;
        if (p.laterality != null && !p.laterality.equals(ex.laterality)) return false;
        if (p.forceType != null && !p.forceType.equals(ex.forceType)) return false;
        if (p.status != null && !p.status.equals(ex.status)) return false;

        if (p.muscleSlug != null) {
            Set<String> all = new HashSet<>();
            ex.muscles.primary.forEach(m -> all.add(m.muscleSlug));
            ex.muscles.secondary.forEach(m -> all.add(m.muscleSlug));
            ex.muscles.stabilizers.forEach(m -> all.add(m.muscleSlug));
            if (!all.contains(p.muscleSlug)) return false;
        }
        if (p.primaryMuscleSlug != null) {
            Set<String> s = ex.muscles.primary.stream().map(m -> m.muscleSlug).collect(Collectors.toSet());
            if (!s.contains(p.primaryMuscleSlug)) return false;
        }
        if (p.equipmentId != null) {
            Set<String> ids = new HashSet<>(ex.equipmentRequired);
            ids.addAll(ex.equipmentOptional);
            if (!ids.contains(p.equipmentId)) return false;
        }
        if (p.trainingGoal != null && !ex.trainingParameters.trainingGoals.contains(p.trainingGoal)) return false;
        if (p.tags != null) {
            Set<String> exTags = new HashSet<>(ex.metadata.tags);
            if (!exTags.containsAll(p.tags)) return false;
        }
        return true;
    }

    // -----------------------------------------------------------------------
    // Inner types
    // -----------------------------------------------------------------------

    private static final class IndexEntry {
        final Exercise exercise;
        final String searchText;
        IndexEntry(Exercise e, String st) { this.exercise = e; this.searchText = st; }
    }

    private static final class ScoredEntry {
        final Exercise exercise;
        final double score;
        ScoredEntry(Exercise e, double s) { this.exercise = e; this.score = s; }
    }
}
