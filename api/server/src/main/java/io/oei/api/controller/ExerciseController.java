package io.oei.api.controller;

import io.oei.api.dto.PagedResponse;
import io.oei.api.dto.SearchParams;
import io.oei.api.model.Exercise;
import io.oei.api.model.MediaAsset;
import io.oei.api.service.ExerciseService;
import io.oei.api.service.MediaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;
    private final MediaService mediaService;

    public ExerciseController(ExerciseService exerciseService, MediaService mediaService) {
        this.exerciseService = exerciseService;
        this.mediaService = mediaService;
    }

    @GetMapping
    public PagedResponse<Exercise> listExercises(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String muscle,
            @RequestParam(required = false) String equipment,
            @RequestParam(name = "movement_pattern", required = false) String movementPattern,
            @RequestParam(name = "exercise_type", required = false) String exerciseType,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(name = "per_page", defaultValue = "20") int perPage) {

        if (page < 1) {
            throw new IllegalArgumentException("page must be >= 1");
        }
        if (perPage < 1 || perPage > 100) {
            throw new IllegalArgumentException("per_page must be between 1 and 100");
        }

        SearchParams params = new SearchParams();
        params.setQ(q);
        params.setCategory(category);
        params.setDifficulty(difficulty);
        params.setMuscle(muscle);
        params.setEquipment(equipment);
        params.setMovementPattern(movementPattern);
        params.setExerciseType(exerciseType);
        params.setPage(page);
        params.setPerPage(perPage);

        return exerciseService.search(params);
    }

    @GetMapping("/{idOrSlug}")
    public ResponseEntity<Exercise> getExercise(@PathVariable String idOrSlug) {
        return exerciseService.findByIdOrSlug(idOrSlug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{idOrSlug}/related")
    public ResponseEntity<List<Exercise>> getRelated(@PathVariable String idOrSlug) {
        return exerciseService.findByIdOrSlug(idOrSlug)
                .map(exercise -> ResponseEntity.ok(exerciseService.findRelated(exercise, 10)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /v1/exercises/{idOrSlug}/media
     *
     * Returns all approved media assets associated with this exercise.
     * Resolves by slug; if an exercise ID is supplied, the slug is looked up
     * first so the media lookup works correctly.
     */
    @GetMapping("/{idOrSlug}/media")
    public ResponseEntity<List<MediaAsset>> getExerciseMedia(@PathVariable String idOrSlug) {
        // Resolve slug — the media registry is indexed by slug
        String slug = exerciseService.findByIdOrSlug(idOrSlug)
                .map(Exercise::getSlug)
                .orElse(idOrSlug); // fall back to raw value (may be a slug already)

        List<MediaAsset> assets = mediaService.findByExerciseSlug(slug);
        return ResponseEntity.ok(assets);
    }
}
