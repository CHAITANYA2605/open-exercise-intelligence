package io.oei.api.controller;

import io.oei.api.dto.PagedResponse;
import io.oei.api.model.MediaAsset;
import io.oei.api.service.MediaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for the OEI media asset system.
 *
 * <pre>
 * GET /v1/media                        — paginated list of approved assets
 * GET /v1/media/stats                  — counts by type, license, status
 * GET /v1/media/{assetId}              — single asset by UUID
 * GET /v1/exercises/{idOrSlug}/media   — approved assets for an exercise
 * </pre>
 *
 * The exercise-media endpoint is also wired into ExerciseController, but
 * exists here as a convenience alias.
 */
@RestController
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    /**
     * GET /v1/media — paginated list of all approved media assets.
     *
     * Query params:
     *   page     (default 1)
     *   per_page (default 20, max 100)
     */
    @GetMapping("/v1/media")
    public PagedResponse<MediaAsset> listMedia(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(name = "per_page", defaultValue = "20") int perPage) {

        if (page < 1) throw new IllegalArgumentException("page must be >= 1");
        if (perPage < 1 || perPage > 100) throw new IllegalArgumentException("per_page must be between 1 and 100");

        List<MediaAsset> items = mediaService.listAll(page, perPage);
        int total = mediaService.countApproved();
        return new PagedResponse<>(items, total, page, perPage);
    }

    /**
     * GET /v1/media/stats — aggregate counts by type, license, and status.
     *
     * Note: this route must be declared BEFORE /{assetId} so Spring does not
     * attempt to resolve "stats" as an assetId path variable.
     */
    @GetMapping("/v1/media/stats")
    public MediaService.MediaStats getStats() {
        return mediaService.getStats();
    }

    /**
     * GET /v1/media/{assetId} — retrieve a single asset by its UUID.
     * Searches across all statuses so maintainers can inspect any entry.
     */
    @GetMapping("/v1/media/{assetId}")
    public ResponseEntity<MediaAsset> getAsset(@PathVariable String assetId) {
        return mediaService.findById(assetId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}
