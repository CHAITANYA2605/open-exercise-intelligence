package io.oei.api.service;

import io.oei.api.dto.FacetResponse;
import io.oei.api.dto.PagedResponse;
import io.oei.api.dto.SearchParams;
import io.oei.api.model.Exercise;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class ExerciseService {

    private final DatasetService datasetService;

    public ExerciseService(DatasetService datasetService) {
        this.datasetService = datasetService;
    }

    public PagedResponse<Exercise> search(SearchParams params) {
        List<Exercise> results = datasetService.getExercises().stream()
                .filter(e -> matchesQuery(e, params.getQ()))
                .filter(e -> matchesCategory(e, params.getCategory()))
                .filter(e -> matchesDifficulty(e, params.getDifficulty()))
                .filter(e -> matchesMuscle(e, params.getMuscle()))
                .filter(e -> matchesEquipment(e, params.getEquipment()))
                .filter(e -> matchesMovementPattern(e, params.getMovementPattern()))
                .filter(e -> matchesExerciseType(e, params.getExerciseType()))
                .collect(Collectors.toList());

        int total = results.size();
        int page = params.getPage();
        int perPage = params.getPerPage();
        int fromIndex = (page - 1) * perPage;
        int toIndex = Math.min(fromIndex + perPage, total);

        List<Exercise> pageData = fromIndex < total
                ? results.subList(fromIndex, toIndex)
                : Collections.emptyList();

        return new PagedResponse<>(pageData, total, page, perPage);
    }

    public Optional<Exercise> findByIdOrSlug(String idOrSlug) {
        return datasetService.getExercises().stream()
                .filter(e -> idOrSlug.equals(e.getExerciseId()) || idOrSlug.equals(e.getSlug()))
                .findFirst();
    }

    public List<Exercise> findRelated(Exercise target, int limit) {
        Set<String> targetMuscleSlugs = getAllMuscleSlugs(target);
        if (targetMuscleSlugs.isEmpty()) {
            return Collections.emptyList();
        }

        return datasetService.getExercises().stream()
                .filter(e -> !e.getExerciseId().equals(target.getExerciseId()))
                .map(e -> {
                    Set<String> overlap = new HashSet<>(getAllMuscleSlugs(e));
                    overlap.retainAll(targetMuscleSlugs);
                    return new AbstractMap.SimpleEntry<>(e, overlap.size());
                })
                .filter(entry -> entry.getValue() > 0)
                .sorted(Map.Entry.<Exercise, Integer>comparingByValue().reversed())
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    public FacetResponse getFacets() {
        List<Exercise> all = datasetService.getExercises();

        List<FacetResponse.FacetEntry> categories = countBy(all, Exercise::getCategory);
        List<FacetResponse.FacetEntry> difficulties = countBy(all, Exercise::getDifficultyLevel);
        List<FacetResponse.FacetEntry> movementPatterns = countBy(all, Exercise::getMovementPattern);
        List<FacetResponse.FacetEntry> exerciseTypes = countBy(all, Exercise::getExerciseType);

        Map<String, Long> muscleCounts = new LinkedHashMap<>();
        for (Exercise e : all) {
            for (String slug : getAllMuscleSlugs(e)) {
                muscleCounts.merge(slug, 1L, Long::sum);
            }
        }
        List<FacetResponse.FacetEntry> muscles = muscleCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(en -> new FacetResponse.FacetEntry(en.getKey(), en.getValue()))
                .collect(Collectors.toList());

        Map<String, Long> equipCounts = new LinkedHashMap<>();
        for (Exercise e : all) {
            if (e.getEquipmentRequired() != null) {
                for (String id : e.getEquipmentRequired()) {
                    equipCounts.merge(id, 1L, Long::sum);
                }
            }
        }
        List<FacetResponse.FacetEntry> equipment = equipCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(en -> new FacetResponse.FacetEntry(en.getKey(), en.getValue()))
                .collect(Collectors.toList());

        return new FacetResponse(categories, difficulties, movementPatterns, exerciseTypes, muscles, equipment);
    }

    private List<FacetResponse.FacetEntry> countBy(List<Exercise> exercises, java.util.function.Function<Exercise, String> extractor) {
        return exercises.stream()
                .map(extractor)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(s -> s, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(en -> new FacetResponse.FacetEntry(en.getKey(), en.getValue()))
                .collect(Collectors.toList());
    }

    private Set<String> getAllMuscleSlugs(Exercise e) {
        if (e.getMuscles() == null) return Collections.emptySet();
        Stream<String> primary = e.getMuscles().getPrimary() != null
                ? e.getMuscles().getPrimary().stream().map(Exercise.MuscleRef::getMuscleSlug)
                : Stream.empty();
        Stream<String> secondary = e.getMuscles().getSecondary() != null
                ? e.getMuscles().getSecondary().stream().map(Exercise.MuscleRef::getMuscleSlug)
                : Stream.empty();
        Stream<String> stabilizers = e.getMuscles().getStabilizers() != null
                ? e.getMuscles().getStabilizers().stream().map(Exercise.MuscleRef::getMuscleSlug)
                : Stream.empty();
        return Stream.of(primary, secondary, stabilizers)
                .flatMap(s -> s)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    private boolean matchesQuery(Exercise e, String q) {
        if (q == null || q.isBlank()) return true;
        String[] tokens = q.trim().toLowerCase().split("\\s+");
        String searchable = buildSearchText(e);
        for (String token : tokens) {
            if (!searchable.contains(token)) return false;
        }
        return true;
    }

    private String buildSearchText(Exercise e) {
        StringBuilder sb = new StringBuilder();
        if (e.getName() != null) sb.append(e.getName().toLowerCase()).append(' ');
        if (e.getDescription() != null) sb.append(e.getDescription().toLowerCase()).append(' ');
        if (e.getAlternativeNames() != null) {
            for (String alt : e.getAlternativeNames()) {
                sb.append(alt.toLowerCase()).append(' ');
            }
        }
        for (String slug : getAllMuscleSlugs(e)) {
            sb.append(slug.toLowerCase()).append(' ');
        }
        return sb.toString();
    }

    private boolean matchesCategory(Exercise e, String category) {
        if (category == null || category.isBlank()) return true;
        return category.equalsIgnoreCase(e.getCategory());
    }

    private boolean matchesDifficulty(Exercise e, String difficulty) {
        if (difficulty == null || difficulty.isBlank()) return true;
        return difficulty.equalsIgnoreCase(e.getDifficultyLevel());
    }

    private boolean matchesMuscle(Exercise e, String muscle) {
        if (muscle == null || muscle.isBlank()) return true;
        return getAllMuscleSlugs(e).contains(muscle.toLowerCase());
    }

    private boolean matchesEquipment(Exercise e, String equipment) {
        if (equipment == null || equipment.isBlank()) return true;
        if (e.getEquipmentRequired() == null) return false;
        return e.getEquipmentRequired().contains(equipment);
    }

    private boolean matchesMovementPattern(Exercise e, String movementPattern) {
        if (movementPattern == null || movementPattern.isBlank()) return true;
        return movementPattern.equalsIgnoreCase(e.getMovementPattern());
    }

    private boolean matchesExerciseType(Exercise e, String exerciseType) {
        if (exerciseType == null || exerciseType.isBlank()) return true;
        return exerciseType.equalsIgnoreCase(e.getExerciseType());
    }
}
