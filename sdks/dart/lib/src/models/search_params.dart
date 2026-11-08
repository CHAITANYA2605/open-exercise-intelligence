class SearchParams {
  final String? query;
  final String? category;
  final String? difficulty;
  final String? muscleSlug;
  final String? equipmentId;
  final String? movementPattern;
  final String? exerciseType;
  final String? laterality;
  final int page;
  final int perPage;

  const SearchParams({
    this.query,
    this.category,
    this.difficulty,
    this.muscleSlug,
    this.equipmentId,
    this.movementPattern,
    this.exerciseType,
    this.laterality,
    this.page = 1,
    this.perPage = 20,
  });

  Map<String, String> toQueryParams() {
    final params = <String, String>{};
    if (query != null && query!.isNotEmpty) params['q'] = query!;
    if (category != null) params['category'] = category!;
    if (difficulty != null) params['difficulty'] = difficulty!;
    if (muscleSlug != null) params['muscle'] = muscleSlug!;
    if (equipmentId != null) params['equipment'] = equipmentId!;
    if (movementPattern != null) params['movement_pattern'] = movementPattern!;
    if (exerciseType != null) params['exercise_type'] = exerciseType!;
    if (laterality != null) params['laterality'] = laterality!;
    params['page'] = page.toString();
    params['per_page'] = perPage.toString();
    return params;
  }

  SearchParams copyWith({
    String? query,
    String? category,
    String? difficulty,
    String? muscleSlug,
    String? equipmentId,
    String? movementPattern,
    String? exerciseType,
    String? laterality,
    int? page,
    int? perPage,
  }) {
    return SearchParams(
      query: query ?? this.query,
      category: category ?? this.category,
      difficulty: difficulty ?? this.difficulty,
      muscleSlug: muscleSlug ?? this.muscleSlug,
      equipmentId: equipmentId ?? this.equipmentId,
      movementPattern: movementPattern ?? this.movementPattern,
      exerciseType: exerciseType ?? this.exerciseType,
      laterality: laterality ?? this.laterality,
      page: page ?? this.page,
      perPage: perPage ?? this.perPage,
    );
  }
}
