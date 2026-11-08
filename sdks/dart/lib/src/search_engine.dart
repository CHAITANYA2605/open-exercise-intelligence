import 'models/exercise.dart';
import 'models/search_params.dart';
import 'models/search_result.dart';

/// In-memory full-text search engine with AND semantics.
class SearchEngine {
  final List<Exercise> _exercises;

  SearchEngine(this._exercises);

  List<Exercise> get exercises => List.unmodifiable(_exercises);

  SearchResult search(SearchParams params) {
    var results = _exercises.where((e) => _matches(e, params)).toList();

    final total = results.length;
    final perPage = params.perPage.clamp(1, 100);
    final page = params.page.clamp(1, (total / perPage).ceil().clamp(1, 999999));
    final totalPages = (total / perPage).ceil();
    final start = (page - 1) * perPage;
    final end = (start + perPage).clamp(0, total);
    final pageData = start < total ? results.sublist(start, end) : <Exercise>[];

    return SearchResult(
      data: pageData,
      meta: SearchMeta(
        total: total,
        page: page,
        perPage: perPage,
        totalPages: totalPages == 0 ? 1 : totalPages,
      ),
    );
  }

  bool _matches(Exercise exercise, SearchParams params) {
    // Full-text search (AND semantics: all words must appear somewhere)
    if (params.query != null && params.query!.isNotEmpty) {
      final words = params.query!.toLowerCase().split(RegExp(r'\s+'));
      final searchable = _buildSearchableText(exercise);
      for (final word in words) {
        if (!searchable.contains(word)) return false;
      }
    }

    // Category filter
    if (params.category != null) {
      if (exercise.category?.toLowerCase() != params.category!.toLowerCase()) {
        return false;
      }
    }

    // Difficulty filter
    if (params.difficulty != null) {
      if (exercise.difficultyLevel?.toLowerCase() !=
          params.difficulty!.toLowerCase()) {
        return false;
      }
    }

    // Muscle slug filter
    if (params.muscleSlug != null) {
      final allSlugs = exercise.muscles.allMuscleSlugs
          .map((s) => s.toLowerCase())
          .toList();
      if (!allSlugs.contains(params.muscleSlug!.toLowerCase())) {
        return false;
      }
    }

    // Equipment ID filter
    if (params.equipmentId != null) {
      if (!exercise.equipmentRequired.contains(params.equipmentId)) {
        return false;
      }
    }

    // Movement pattern filter
    if (params.movementPattern != null) {
      if (exercise.movementPattern?.toLowerCase() !=
          params.movementPattern!.toLowerCase()) {
        return false;
      }
    }

    // Exercise type filter
    if (params.exerciseType != null) {
      if (exercise.exerciseType?.toLowerCase() !=
          params.exerciseType!.toLowerCase()) {
        return false;
      }
    }

    // Laterality filter
    if (params.laterality != null) {
      if (exercise.laterality?.toLowerCase() !=
          params.laterality!.toLowerCase()) {
        return false;
      }
    }

    return true;
  }

  String _buildSearchableText(Exercise exercise) {
    final parts = <String>[
      exercise.name,
      exercise.description ?? '',
      exercise.category ?? '',
      exercise.exerciseType ?? '',
      exercise.movementPattern ?? '',
      ...exercise.alternativeNames,
      ...exercise.muscles.allMuscleSlugs,
    ];
    return parts.join(' ').toLowerCase();
  }

  Exercise? getByIdOrSlug(String idOrSlug) {
    for (final exercise in _exercises) {
      if (exercise.exerciseId == idOrSlug || exercise.slug == idOrSlug) {
        return exercise;
      }
    }
    return null;
  }

  List<Exercise> related(String idOrSlug, {int limit = 10}) {
    final target = getByIdOrSlug(idOrSlug);
    if (target == null) return [];

    final targetSlugs = target.muscles.allMuscleSlugs.toSet();
    if (targetSlugs.isEmpty) return [];

    final scored = <(Exercise, int)>[];
    for (final exercise in _exercises) {
      if (exercise.exerciseId == target.exerciseId) continue;
      final overlap =
          exercise.muscles.allMuscleSlugs.where(targetSlugs.contains).length;
      if (overlap > 0) scored.add((exercise, overlap));
    }

    scored.sort((a, b) => b.$2.compareTo(a.$2));
    return scored.take(limit).map((s) => s.$1).toList();
  }

  Map<String, Map<String, int>> facets() {
    final categories = <String, int>{};
    final difficulties = <String, int>{};
    final movementPatterns = <String, int>{};
    final exerciseTypes = <String, int>{};
    final lateralities = <String, int>{};

    for (final exercise in _exercises) {
      if (exercise.category != null) {
        categories[exercise.category!] =
            (categories[exercise.category!] ?? 0) + 1;
      }
      if (exercise.difficultyLevel != null) {
        difficulties[exercise.difficultyLevel!] =
            (difficulties[exercise.difficultyLevel!] ?? 0) + 1;
      }
      if (exercise.movementPattern != null) {
        movementPatterns[exercise.movementPattern!] =
            (movementPatterns[exercise.movementPattern!] ?? 0) + 1;
      }
      if (exercise.exerciseType != null) {
        exerciseTypes[exercise.exerciseType!] =
            (exerciseTypes[exercise.exerciseType!] ?? 0) + 1;
      }
      if (exercise.laterality != null) {
        lateralities[exercise.laterality!] =
            (lateralities[exercise.laterality!] ?? 0) + 1;
      }
    }

    return {
      'category': categories,
      'difficulty_level': difficulties,
      'movement_pattern': movementPatterns,
      'exercise_type': exerciseTypes,
      'laterality': lateralities,
    };
  }
}
