package io.oei.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Exercise {

    @JsonProperty("exercise_id")
    private String exerciseId;

    private String slug;
    private String name;

    @JsonProperty("alternative_names")
    private List<String> alternativeNames;

    private String description;
    private String category;

    @JsonProperty("exercise_type")
    private String exerciseType;

    @JsonProperty("difficulty_level")
    private String difficultyLevel;

    @JsonProperty("movement_pattern")
    private String movementPattern;

    @JsonProperty("force_type")
    private String forceType;

    @JsonProperty("mechanics_type")
    private String mechanicsType;

    private String laterality;

    @JsonProperty("exercise_family")
    private String exerciseFamily;

    private String status;

    private Muscles muscles;

    @JsonProperty("equipment_required")
    private List<String> equipmentRequired;

    @JsonProperty("equipment_optional")
    private List<String> equipmentOptional;

    private Map<String, Object> execution;
    private Map<String, Object> variants;

    @JsonProperty("training_parameters")
    private Map<String, Object> trainingParameters;

    private Map<String, Object> media;
    private Map<String, Object> metadata;

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Muscles {
        private List<MuscleRef> primary;
        private List<MuscleRef> secondary;
        private List<MuscleRef> stabilizers;

        public List<MuscleRef> getPrimary() { return primary; }
        public void setPrimary(List<MuscleRef> primary) { this.primary = primary; }

        public List<MuscleRef> getSecondary() { return secondary; }
        public void setSecondary(List<MuscleRef> secondary) { this.secondary = secondary; }

        public List<MuscleRef> getStabilizers() { return stabilizers; }
        public void setStabilizers(List<MuscleRef> stabilizers) { this.stabilizers = stabilizers; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MuscleRef {
        @JsonProperty("muscle_id")
        private String muscleId;

        @JsonProperty("muscle_slug")
        private String muscleSlug;

        public String getMuscleId() { return muscleId; }
        public void setMuscleId(String muscleId) { this.muscleId = muscleId; }

        public String getMuscleSlug() { return muscleSlug; }
        public void setMuscleSlug(String muscleSlug) { this.muscleSlug = muscleSlug; }
    }

    public String getExerciseId() { return exerciseId; }
    public void setExerciseId(String exerciseId) { this.exerciseId = exerciseId; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<String> getAlternativeNames() { return alternativeNames; }
    public void setAlternativeNames(List<String> alternativeNames) { this.alternativeNames = alternativeNames; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getExerciseType() { return exerciseType; }
    public void setExerciseType(String exerciseType) { this.exerciseType = exerciseType; }

    public String getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(String difficultyLevel) { this.difficultyLevel = difficultyLevel; }

    public String getMovementPattern() { return movementPattern; }
    public void setMovementPattern(String movementPattern) { this.movementPattern = movementPattern; }

    public String getForceType() { return forceType; }
    public void setForceType(String forceType) { this.forceType = forceType; }

    public String getMechanicsType() { return mechanicsType; }
    public void setMechanicsType(String mechanicsType) { this.mechanicsType = mechanicsType; }

    public String getLaterality() { return laterality; }
    public void setLaterality(String laterality) { this.laterality = laterality; }

    public String getExerciseFamily() { return exerciseFamily; }
    public void setExerciseFamily(String exerciseFamily) { this.exerciseFamily = exerciseFamily; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Muscles getMuscles() { return muscles; }
    public void setMuscles(Muscles muscles) { this.muscles = muscles; }

    public List<String> getEquipmentRequired() { return equipmentRequired; }
    public void setEquipmentRequired(List<String> equipmentRequired) { this.equipmentRequired = equipmentRequired; }

    public List<String> getEquipmentOptional() { return equipmentOptional; }
    public void setEquipmentOptional(List<String> equipmentOptional) { this.equipmentOptional = equipmentOptional; }

    public Map<String, Object> getExecution() { return execution; }
    public void setExecution(Map<String, Object> execution) { this.execution = execution; }

    public Map<String, Object> getVariants() { return variants; }
    public void setVariants(Map<String, Object> variants) { this.variants = variants; }

    public Map<String, Object> getTrainingParameters() { return trainingParameters; }
    public void setTrainingParameters(Map<String, Object> trainingParameters) { this.trainingParameters = trainingParameters; }

    public Map<String, Object> getMedia() { return media; }
    public void setMedia(Map<String, Object> media) { this.media = media; }

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
}
