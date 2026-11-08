package io.oei.api.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.oei.api.model.MediaAsset;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Loads data/media/registry.json on startup and provides query methods
 * for the media endpoints.
 */
@Service
public class MediaService {

    private static final Logger log = LoggerFactory.getLogger(MediaService.class);

    @Value("${oei.media.registry.path:data/media/registry.json}")
    private String registryPath;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private List<MediaAsset> allAssets = Collections.emptyList();
    private List<MediaAsset> approvedAssets = Collections.emptyList();

    @PostConstruct
    public void load() {
        try {
            RegistryWrapper wrapper = null;
            File file = new File(registryPath);
            if (file.exists()) {
                log.info("Loading media registry from file: {}", file.getAbsolutePath());
                wrapper = objectMapper.readValue(file, RegistryWrapper.class);
            } else {
                log.info("Loading media registry from classpath: {}", registryPath);
                try (InputStream is = getClass().getClassLoader().getResourceAsStream(registryPath)) {
                    if (is != null) {
                        wrapper = objectMapper.readValue(is, RegistryWrapper.class);
                    }
                }
            }

            if (wrapper != null && wrapper.getAssets() != null) {
                allAssets = Collections.unmodifiableList(wrapper.getAssets());
                approvedAssets = allAssets.stream()
                        .filter(a -> "approved".equals(a.getStatus()))
                        .collect(Collectors.toUnmodifiableList());
                log.info("Loaded {} media asset(s) ({} approved)", allAssets.size(), approvedAssets.size());
            } else {
                log.warn("Media registry not found or empty at {}; media endpoints will return empty results", registryPath);
            }
        } catch (Exception e) {
            log.error("Failed to load media registry", e);
        }
    }

    // ── public query methods ───────────────────────────────────────────────────

    /**
     * Returns a paginated list of all approved assets.
     *
     * @param page    1-based page number
     * @param perPage items per page (1–100)
     * @return sub-list of approved assets
     */
    public List<MediaAsset> listAll(int page, int perPage) {
        int from = (page - 1) * perPage;
        int to = Math.min(from + perPage, approvedAssets.size());
        if (from >= approvedAssets.size()) return Collections.emptyList();
        return approvedAssets.subList(from, to);
    }

    /** Total count of approved assets, for pagination metadata. */
    public int countApproved() {
        return approvedAssets.size();
    }

    /**
     * Finds a single asset by its UUID (looks across all statuses so that
     * maintainers can retrieve pending/rejected entries via the API if needed).
     */
    public Optional<MediaAsset> findById(String assetId) {
        return allAssets.stream()
                .filter(a -> assetId.equals(a.getAssetId()))
                .findFirst();
    }

    /**
     * Returns all APPROVED assets associated with an exercise slug.
     */
    public List<MediaAsset> findByExerciseSlug(String slug) {
        return approvedAssets.stream()
                .filter(a -> slug.equals(a.getExerciseSlug()))
                .collect(Collectors.toList());
    }

    /**
     * Aggregates counts for the /v1/media/stats endpoint.
     */
    public MediaStats getStats() {
        Map<String, Long> byType = allAssets.stream()
                .filter(a -> a.getAssetType() != null)
                .collect(Collectors.groupingBy(MediaAsset::getAssetType, Collectors.counting()));

        Map<String, Long> byLicense = allAssets.stream()
                .filter(a -> a.getLicense() != null && a.getLicense().getSpdx() != null)
                .collect(Collectors.groupingBy(a -> a.getLicense().getSpdx(), Collectors.counting()));

        Map<String, Long> byStatus = allAssets.stream()
                .filter(a -> a.getStatus() != null)
                .collect(Collectors.groupingBy(MediaAsset::getStatus, Collectors.counting()));

        return new MediaStats(allAssets.size(), approvedAssets.size(), byType, byLicense, byStatus);
    }

    // ── inner wrappers ─────────────────────────────────────────────────────────

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class RegistryWrapper {

        @JsonProperty("schema_version")
        private String schemaVersion;

        @JsonProperty("last_updated")
        private String lastUpdated;

        @JsonProperty("total_assets")
        private int totalAssets;

        private List<MediaAsset> assets;

        public String getSchemaVersion() { return schemaVersion; }
        public void setSchemaVersion(String schemaVersion) { this.schemaVersion = schemaVersion; }

        public String getLastUpdated() { return lastUpdated; }
        public void setLastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; }

        public int getTotalAssets() { return totalAssets; }
        public void setTotalAssets(int totalAssets) { this.totalAssets = totalAssets; }

        public List<MediaAsset> getAssets() { return assets; }
        public void setAssets(List<MediaAsset> assets) { this.assets = assets; }
    }

    // ── stats DTO ──────────────────────────────────────────────────────────────

    public static class MediaStats {
        private final int totalAssets;
        private final int approvedAssets;
        private final Map<String, Long> byType;
        private final Map<String, Long> byLicense;
        private final Map<String, Long> byStatus;

        public MediaStats(int totalAssets, int approvedAssets,
                          Map<String, Long> byType,
                          Map<String, Long> byLicense,
                          Map<String, Long> byStatus) {
            this.totalAssets = totalAssets;
            this.approvedAssets = approvedAssets;
            this.byType = byType;
            this.byLicense = byLicense;
            this.byStatus = byStatus;
        }

        @JsonProperty("total_assets")
        public int getTotalAssets() { return totalAssets; }

        @JsonProperty("approved_assets")
        public int getApprovedAssets() { return approvedAssets; }

        @JsonProperty("by_type")
        public Map<String, Long> getByType() { return byType; }

        @JsonProperty("by_license")
        public Map<String, Long> getByLicense() { return byLicense; }

        @JsonProperty("by_status")
        public Map<String, Long> getByStatus() { return byStatus; }
    }
}
