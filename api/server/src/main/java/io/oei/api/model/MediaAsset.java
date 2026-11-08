package io.oei.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Represents a media asset entry from data/media/registry.json.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class MediaAsset {

    @JsonProperty("asset_id")
    private String assetId;

    @JsonProperty("exercise_slug")
    private String exerciseSlug;

    @JsonProperty("asset_type")
    private String assetType;

    private String filename;

    private String url;

    private Integer width;

    private Integer height;

    @JsonProperty("duration_seconds")
    private Double durationSeconds;

    @JsonProperty("file_size_bytes")
    private Long fileSizeBytes;

    @JsonProperty("mime_type")
    private String mimeType;

    private License license;

    private Provenance provenance;

    private String status;

    @JsonProperty("review_notes")
    private String reviewNotes;

    // ── getters / setters ──────────────────────────────────────────────────────

    public String getAssetId() { return assetId; }
    public void setAssetId(String assetId) { this.assetId = assetId; }

    public String getExerciseSlug() { return exerciseSlug; }
    public void setExerciseSlug(String exerciseSlug) { this.exerciseSlug = exerciseSlug; }

    public String getAssetType() { return assetType; }
    public void setAssetType(String assetType) { this.assetType = assetType; }

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public Integer getWidth() { return width; }
    public void setWidth(Integer width) { this.width = width; }

    public Integer getHeight() { return height; }
    public void setHeight(Integer height) { this.height = height; }

    public Double getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Double durationSeconds) { this.durationSeconds = durationSeconds; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }

    public License getLicense() { return license; }
    public void setLicense(License license) { this.license = license; }

    public Provenance getProvenance() { return provenance; }
    public void setProvenance(Provenance provenance) { this.provenance = provenance; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }

    // ── nested: License ────────────────────────────────────────────────────────

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class License {

        private String spdx;

        @JsonProperty("human_readable")
        private String humanReadable;

        @JsonProperty("allows_commercial_use")
        private Boolean allowsCommercialUse;

        @JsonProperty("requires_attribution")
        private Boolean requiresAttribution;

        @JsonProperty("attribution_text")
        private String attributionText;

        @JsonProperty("source_url")
        private String sourceUrl;

        @JsonProperty("retrieved_at")
        private String retrievedAt;

        @JsonProperty("verified_by")
        private String verifiedBy;

        @JsonProperty("verification_notes")
        private String verificationNotes;

        public String getSpdx() { return spdx; }
        public void setSpdx(String spdx) { this.spdx = spdx; }

        public String getHumanReadable() { return humanReadable; }
        public void setHumanReadable(String humanReadable) { this.humanReadable = humanReadable; }

        public Boolean getAllowsCommercialUse() { return allowsCommercialUse; }
        public void setAllowsCommercialUse(Boolean allowsCommercialUse) { this.allowsCommercialUse = allowsCommercialUse; }

        public Boolean getRequiresAttribution() { return requiresAttribution; }
        public void setRequiresAttribution(Boolean requiresAttribution) { this.requiresAttribution = requiresAttribution; }

        public String getAttributionText() { return attributionText; }
        public void setAttributionText(String attributionText) { this.attributionText = attributionText; }

        public String getSourceUrl() { return sourceUrl; }
        public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

        public String getRetrievedAt() { return retrievedAt; }
        public void setRetrievedAt(String retrievedAt) { this.retrievedAt = retrievedAt; }

        public String getVerifiedBy() { return verifiedBy; }
        public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }

        public String getVerificationNotes() { return verificationNotes; }
        public void setVerificationNotes(String verificationNotes) { this.verificationNotes = verificationNotes; }
    }

    // ── nested: Provenance ─────────────────────────────────────────────────────

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Provenance {

        @JsonProperty("original_source")
        private String originalSource;

        @JsonProperty("original_author")
        private String originalAuthor;

        @JsonProperty("original_url")
        private String originalUrl;

        private List<String> modifications;

        @JsonProperty("contributed_by")
        private String contributedBy;

        @JsonProperty("contributed_at")
        private String contributedAt;

        public String getOriginalSource() { return originalSource; }
        public void setOriginalSource(String originalSource) { this.originalSource = originalSource; }

        public String getOriginalAuthor() { return originalAuthor; }
        public void setOriginalAuthor(String originalAuthor) { this.originalAuthor = originalAuthor; }

        public String getOriginalUrl() { return originalUrl; }
        public void setOriginalUrl(String originalUrl) { this.originalUrl = originalUrl; }

        public List<String> getModifications() { return modifications; }
        public void setModifications(List<String> modifications) { this.modifications = modifications; }

        public String getContributedBy() { return contributedBy; }
        public void setContributedBy(String contributedBy) { this.contributedBy = contributedBy; }

        public String getContributedAt() { return contributedAt; }
        public void setContributedAt(String contributedAt) { this.contributedAt = contributedAt; }
    }
}
