package io.oei.sdk;

import java.util.List;
import java.util.Map;

/**
 * Immutable representation of a single OEI exercise.
 *
 * <p>License: MIT | Data: CC0 1.0</p>
 */
public final class Exercise {

    public final String exerciseId;
    public final String slug;
    public final String name;
    public final List<String> alternativeNames;
    public final String description;
    public final String category;
    public final String exerciseType;
    public final String difficultyLevel;
    public final String movementPattern;
    public final String forceType;
    public final String mechanicsType;
    public final String laterality;
    public final String exerciseFamily;
    public final String status;
    public final Muscles muscles;
    public final List<String> equipmentRequired;
    public final List<String> equipmentOptional;
    public final Execution execution;
    public final TrainingParameters trainingParameters;
    public final ExerciseMetadata metadata;
    /** Original raw map, in case you need fields not promoted above. */
    public final Map<String, Object> raw;

    Exercise(Builder b) {
        this.exerciseId = b.exerciseId;
        this.slug = b.slug;
        this.name = b.name;
        this.alternativeNames = b.alternativeNames;
        this.description = b.description;
        this.category = b.category;
        this.exerciseType = b.exerciseType;
        this.difficultyLevel = b.difficultyLevel;
        this.movementPattern = b.movementPattern;
        this.forceType = b.forceType;
        this.mechanicsType = b.mechanicsType;
        this.laterality = b.laterality;
        this.exerciseFamily = b.exerciseFamily;
        this.status = b.status;
        this.muscles = b.muscles;
        this.equipmentRequired = b.equipmentRequired;
        this.equipmentOptional = b.equipmentOptional;
        this.execution = b.execution;
        this.trainingParameters = b.trainingParameters;
        this.metadata = b.metadata;
        this.raw = b.raw;
    }

    @Override
    public String toString() {
        return "Exercise{slug='" + slug + "', name='" + name + "', category='" + category + "'}";
    }

    // -----------------------------------------------------------------------
    // Nested value types
    // -----------------------------------------------------------------------

    public static final class MuscleRef {
        public final String muscleId;
        public final String muscleSlug;

        public MuscleRef(String muscleId, String muscleSlug) {
            this.muscleId = muscleId;
            this.muscleSlug = muscleSlug;
        }
    }

    public static final class Muscles {
        public final List<MuscleRef> primary;
        public final List<MuscleRef> secondary;
        public final List<MuscleRef> stabilizers;

        public Muscles(List<MuscleRef> primary, List<MuscleRef> secondary, List<MuscleRef> stabilizers) {
            this.primary = primary;
            this.secondary = secondary;
            this.stabilizers = stabilizers;
        }
    }

    public static final class Execution {
        public final String startingPosition;
        public final String setupInstructions;
        public final List<String> steps;
        public final String breathingInstructions;
        public final List<String> commonMistakes;
        public final List<String> safetyConsiderations;
        public final String rangeOfMotionGuidance;
        public final String tempoRecommendations;
        public final List<String> coachingCues;

        public Execution(String startingPosition, String setupInstructions, List<String> steps,
                         String breathingInstructions, List<String> commonMistakes,
                         List<String> safetyConsiderations, String rangeOfMotionGuidance,
                         String tempoRecommendations, List<String> coachingCues) {
            this.startingPosition = startingPosition;
            this.setupInstructions = setupInstructions;
            this.steps = steps;
            this.breathingInstructions = breathingInstructions;
            this.commonMistakes = commonMistakes;
            this.safetyConsiderations = safetyConsiderations;
            this.rangeOfMotionGuidance = rangeOfMotionGuidance;
            this.tempoRecommendations = tempoRecommendations;
            this.coachingCues = coachingCues;
        }
    }

    public static final class TrainingParameters {
        public final List<String> trainingGoals;
        public final Map<String, Object> restPeriods;

        public TrainingParameters(List<String> trainingGoals, Map<String, Object> restPeriods) {
            this.trainingGoals = trainingGoals;
            this.restPeriods = restPeriods;
        }
    }

    public static final class ExerciseMetadata {
        public final String createdAt;
        public final String updatedAt;
        public final String version;
        public final List<String> tags;

        public ExerciseMetadata(String createdAt, String updatedAt, String version, List<String> tags) {
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
            this.version = version;
            this.tags = tags;
        }
    }

    // -----------------------------------------------------------------------
    // Builder
    // -----------------------------------------------------------------------

    static final class Builder {
        String exerciseId = "";
        String slug = "";
        String name = "";
        List<String> alternativeNames = List.of();
        String description = "";
        String category = "";
        String exerciseType = "";
        String difficultyLevel = "";
        String movementPattern = "";
        String forceType = "";
        String mechanicsType = "";
        String laterality = "";
        String exerciseFamily = "";
        String status = "active";
        Muscles muscles = new Muscles(List.of(), List.of(), List.of());
        List<String> equipmentRequired = List.of();
        List<String> equipmentOptional = List.of();
        Execution execution = new Execution("", "", List.of(), "", List.of(), List.of(), "", "", List.of());
        TrainingParameters trainingParameters = new TrainingParameters(List.of(), Map.of());
        ExerciseMetadata metadata = new ExerciseMetadata("", "", "1.0.0", List.of());
        Map<String, Object> raw = Map.of();

        Exercise build() {
            return new Exercise(this);
        }
    }
}
