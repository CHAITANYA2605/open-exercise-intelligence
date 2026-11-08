class MuscleRef {
  final String muscleId;
  final String muscleSlug;

  const MuscleRef({required this.muscleId, required this.muscleSlug});

  factory MuscleRef.fromJson(Map<String, dynamic> json) => MuscleRef(
        muscleId: json['muscle_id'] as String,
        muscleSlug: json['muscle_slug'] as String,
      );

  Map<String, dynamic> toJson() => {
        'muscle_id': muscleId,
        'muscle_slug': muscleSlug,
      };
}

class ExerciseMuscles {
  final List<MuscleRef> primary;
  final List<MuscleRef> secondary;
  final List<MuscleRef> stabilizers;

  const ExerciseMuscles({
    this.primary = const [],
    this.secondary = const [],
    this.stabilizers = const [],
  });

  factory ExerciseMuscles.fromJson(Map<String, dynamic> json) =>
      ExerciseMuscles(
        primary: (json['primary'] as List<dynamic>?)
                ?.map((e) => MuscleRef.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
        secondary: (json['secondary'] as List<dynamic>?)
                ?.map((e) => MuscleRef.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
        stabilizers: (json['stabilizers'] as List<dynamic>?)
                ?.map((e) => MuscleRef.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
      );

  Map<String, dynamic> toJson() => {
        'primary': primary.map((e) => e.toJson()).toList(),
        'secondary': secondary.map((e) => e.toJson()).toList(),
        'stabilizers': stabilizers.map((e) => e.toJson()).toList(),
      };

  List<String> get allMuscleSlugs => [
        ...primary.map((m) => m.muscleSlug),
        ...secondary.map((m) => m.muscleSlug),
        ...stabilizers.map((m) => m.muscleSlug),
      ];
}

class Exercise {
  final String exerciseId;
  final String slug;
  final String name;
  final List<String> alternativeNames;
  final String? description;
  final String? category;
  final String? exerciseType;
  final String? difficultyLevel;
  final String? movementPattern;
  final String? forceType;
  final String? mechanicsType;
  final String? laterality;
  final String? exerciseFamily;
  final String? status;
  final ExerciseMuscles muscles;
  final List<String> equipmentRequired;
  final List<String> equipmentOptional;
  final Map<String, dynamic>? execution;
  final Map<String, dynamic>? variants;
  final Map<String, dynamic>? trainingParameters;
  final Map<String, dynamic>? media;
  final Map<String, dynamic>? metadata;

  const Exercise({
    required this.exerciseId,
    required this.slug,
    required this.name,
    this.alternativeNames = const [],
    this.description,
    this.category,
    this.exerciseType,
    this.difficultyLevel,
    this.movementPattern,
    this.forceType,
    this.mechanicsType,
    this.laterality,
    this.exerciseFamily,
    this.status,
    this.muscles = const ExerciseMuscles(),
    this.equipmentRequired = const [],
    this.equipmentOptional = const [],
    this.execution,
    this.variants,
    this.trainingParameters,
    this.media,
    this.metadata,
  });

  factory Exercise.fromJson(Map<String, dynamic> json) {
    return Exercise(
      exerciseId: json['exercise_id'] as String,
      slug: json['slug'] as String,
      name: json['name'] as String,
      alternativeNames: (json['alternative_names'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      description: json['description'] as String?,
      category: json['category'] as String?,
      exerciseType: json['exercise_type'] as String?,
      difficultyLevel: json['difficulty_level'] as String?,
      movementPattern: json['movement_pattern'] as String?,
      forceType: json['force_type'] as String?,
      mechanicsType: json['mechanics_type'] as String?,
      laterality: json['laterality'] as String?,
      exerciseFamily: json['exercise_family'] as String?,
      status: json['status'] as String?,
      muscles: json['muscles'] != null
          ? ExerciseMuscles.fromJson(json['muscles'] as Map<String, dynamic>)
          : const ExerciseMuscles(),
      equipmentRequired: (json['equipment_required'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      equipmentOptional: (json['equipment_optional'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      execution: json['execution'] as Map<String, dynamic>?,
      variants: json['variants'] as Map<String, dynamic>?,
      trainingParameters:
          json['training_parameters'] as Map<String, dynamic>?,
      media: json['media'] as Map<String, dynamic>?,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() => {
        'exercise_id': exerciseId,
        'slug': slug,
        'name': name,
        'alternative_names': alternativeNames,
        if (description != null) 'description': description,
        if (category != null) 'category': category,
        if (exerciseType != null) 'exercise_type': exerciseType,
        if (difficultyLevel != null) 'difficulty_level': difficultyLevel,
        if (movementPattern != null) 'movement_pattern': movementPattern,
        if (forceType != null) 'force_type': forceType,
        if (mechanicsType != null) 'mechanics_type': mechanicsType,
        if (laterality != null) 'laterality': laterality,
        if (exerciseFamily != null) 'exercise_family': exerciseFamily,
        if (status != null) 'status': status,
        'muscles': muscles.toJson(),
        'equipment_required': equipmentRequired,
        'equipment_optional': equipmentOptional,
        if (execution != null) 'execution': execution,
        if (variants != null) 'variants': variants,
        if (trainingParameters != null)
          'training_parameters': trainingParameters,
        if (media != null) 'media': media,
        if (metadata != null) 'metadata': metadata,
      };
}
