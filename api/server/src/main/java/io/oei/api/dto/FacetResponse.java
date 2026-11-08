package io.oei.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

public class FacetResponse {

    private List<FacetEntry> categories;
    private List<FacetEntry> difficulties;

    @JsonProperty("movement_patterns")
    private List<FacetEntry> movementPatterns;

    @JsonProperty("exercise_types")
    private List<FacetEntry> exerciseTypes;

    private List<FacetEntry> muscles;
    private List<FacetEntry> equipment;

    public FacetResponse(
            List<FacetEntry> categories,
            List<FacetEntry> difficulties,
            List<FacetEntry> movementPatterns,
            List<FacetEntry> exerciseTypes,
            List<FacetEntry> muscles,
            List<FacetEntry> equipment) {
        this.categories = categories;
        this.difficulties = difficulties;
        this.movementPatterns = movementPatterns;
        this.exerciseTypes = exerciseTypes;
        this.muscles = muscles;
        this.equipment = equipment;
    }

    public List<FacetEntry> getCategories() { return categories; }
    public List<FacetEntry> getDifficulties() { return difficulties; }
    public List<FacetEntry> getMovementPatterns() { return movementPatterns; }
    public List<FacetEntry> getExerciseTypes() { return exerciseTypes; }
    public List<FacetEntry> getMuscles() { return muscles; }
    public List<FacetEntry> getEquipment() { return equipment; }

    public static class FacetEntry {
        private String value;
        private long count;

        public FacetEntry(String value, long count) {
            this.value = value;
            this.count = count;
        }

        public String getValue() { return value; }
        public long getCount() { return count; }
    }
}
