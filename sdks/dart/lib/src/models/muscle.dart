class Muscle {
  final String muscleId;
  final String slug;
  final String? entryType;
  final String? anatomicalName;
  final String? commonName;
  final String? parentGroupId;
  final String? anatomicalRegion;
  final String? bodySurface;
  final String? laterality;
  final String? description;
  final List<String> relatedMuscleIds;

  const Muscle({
    required this.muscleId,
    required this.slug,
    this.entryType,
    this.anatomicalName,
    this.commonName,
    this.parentGroupId,
    this.anatomicalRegion,
    this.bodySurface,
    this.laterality,
    this.description,
    this.relatedMuscleIds = const [],
  });

  factory Muscle.fromJson(Map<String, dynamic> json) {
    return Muscle(
      muscleId: json['muscle_id'] as String,
      slug: json['slug'] as String,
      entryType: json['entry_type'] as String?,
      anatomicalName: json['anatomical_name'] as String?,
      commonName: json['common_name'] as String?,
      parentGroupId: json['parent_group_id'] as String?,
      anatomicalRegion: json['anatomical_region'] as String?,
      bodySurface: json['body_surface'] as String?,
      laterality: json['laterality'] as String?,
      description: json['description'] as String?,
      relatedMuscleIds: (json['related_muscle_ids'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() => {
        'muscle_id': muscleId,
        'slug': slug,
        if (entryType != null) 'entry_type': entryType,
        if (anatomicalName != null) 'anatomical_name': anatomicalName,
        if (commonName != null) 'common_name': commonName,
        if (parentGroupId != null) 'parent_group_id': parentGroupId,
        if (anatomicalRegion != null) 'anatomical_region': anatomicalRegion,
        if (bodySurface != null) 'body_surface': bodySurface,
        if (laterality != null) 'laterality': laterality,
        if (description != null) 'description': description,
        'related_muscle_ids': relatedMuscleIds,
      };
}
