class Equipment {
  final String equipmentId;
  final String slug;
  final String name;
  final String? description;
  final String? category;
  final String? subcategory;
  final String? spaceRequired;
  final String? costTier;
  final String? portability;
  final List<String> commonAlternatives;

  const Equipment({
    required this.equipmentId,
    required this.slug,
    required this.name,
    this.description,
    this.category,
    this.subcategory,
    this.spaceRequired,
    this.costTier,
    this.portability,
    this.commonAlternatives = const [],
  });

  factory Equipment.fromJson(Map<String, dynamic> json) {
    return Equipment(
      equipmentId: json['equipment_id'] as String,
      slug: json['slug'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      category: json['category'] as String?,
      subcategory: json['subcategory'] as String?,
      spaceRequired: json['space_required'] as String?,
      costTier: json['cost_tier'] as String?,
      portability: json['portability'] as String?,
      commonAlternatives: (json['common_alternatives'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() => {
        'equipment_id': equipmentId,
        'slug': slug,
        'name': name,
        if (description != null) 'description': description,
        if (category != null) 'category': category,
        if (subcategory != null) 'subcategory': subcategory,
        if (spaceRequired != null) 'space_required': spaceRequired,
        if (costTier != null) 'cost_tier': costTier,
        if (portability != null) 'portability': portability,
        'common_alternatives': commonAlternatives,
      };
}
