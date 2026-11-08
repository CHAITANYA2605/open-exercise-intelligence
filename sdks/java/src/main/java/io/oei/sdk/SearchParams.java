package io.oei.sdk;

import java.util.List;

/**
 * Parameters for {@link OEIClient#search(SearchParams)}.
 *
 * <p>Use the fluent builder to construct an instance:</p>
 * <pre>{@code
 * SearchParams params = SearchParams.builder()
 *     .q("bench press")
 *     .category("strength")
 *     .difficultyLevel("beginner")
 *     .perPage(10)
 *     .build();
 * }</pre>
 */
public final class SearchParams {

    public final String q;
    public final String category;
    public final String difficultyLevel;
    public final String movementPattern;
    public final String exerciseType;
    public final String laterality;
    public final String forceType;
    public final String status;
    public final String muscleSlug;
    public final String primaryMuscleSlug;
    public final String equipmentId;
    public final String trainingGoal;
    public final List<String> tags;
    public final String sortBy;
    public final String sortOrder;
    public final int page;
    public final int perPage;
    public final boolean includeRelated;

    private SearchParams(Builder b) {
        this.q = b.q;
        this.category = b.category;
        this.difficultyLevel = b.difficultyLevel;
        this.movementPattern = b.movementPattern;
        this.exerciseType = b.exerciseType;
        this.laterality = b.laterality;
        this.forceType = b.forceType;
        this.status = b.status;
        this.muscleSlug = b.muscleSlug;
        this.primaryMuscleSlug = b.primaryMuscleSlug;
        this.equipmentId = b.equipmentId;
        this.trainingGoal = b.trainingGoal;
        this.tags = b.tags;
        this.sortBy = b.sortBy;
        this.sortOrder = b.sortOrder;
        this.page = b.page;
        this.perPage = b.perPage;
        this.includeRelated = b.includeRelated;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private String q = "";
        private String category = null;
        private String difficultyLevel = null;
        private String movementPattern = null;
        private String exerciseType = null;
        private String laterality = null;
        private String forceType = null;
        private String status = null;
        private String muscleSlug = null;
        private String primaryMuscleSlug = null;
        private String equipmentId = null;
        private String trainingGoal = null;
        private List<String> tags = null;
        private String sortBy = "score";
        private String sortOrder = "desc";
        private int page = 1;
        private int perPage = 20;
        private boolean includeRelated = false;

        public Builder q(String q) { this.q = q; return this; }
        public Builder category(String v) { this.category = v; return this; }
        public Builder difficultyLevel(String v) { this.difficultyLevel = v; return this; }
        public Builder movementPattern(String v) { this.movementPattern = v; return this; }
        public Builder exerciseType(String v) { this.exerciseType = v; return this; }
        public Builder laterality(String v) { this.laterality = v; return this; }
        public Builder forceType(String v) { this.forceType = v; return this; }
        public Builder status(String v) { this.status = v; return this; }
        public Builder muscleSlug(String v) { this.muscleSlug = v; return this; }
        public Builder primaryMuscleSlug(String v) { this.primaryMuscleSlug = v; return this; }
        public Builder equipmentId(String v) { this.equipmentId = v; return this; }
        public Builder trainingGoal(String v) { this.trainingGoal = v; return this; }
        public Builder tags(List<String> v) { this.tags = v; return this; }
        public Builder sortBy(String v) { this.sortBy = v; return this; }
        public Builder sortOrder(String v) { this.sortOrder = v; return this; }
        public Builder page(int v) { this.page = v; return this; }
        public Builder perPage(int v) { this.perPage = v; return this; }
        public Builder includeRelated(boolean v) { this.includeRelated = v; return this; }

        public SearchParams build() { return new SearchParams(this); }
    }
}
