import 'exercise.dart';

class SearchMeta {
  final int total;
  final int page;
  final int perPage;
  final int totalPages;

  const SearchMeta({
    required this.total,
    required this.page,
    required this.perPage,
    required this.totalPages,
  });

  factory SearchMeta.fromJson(Map<String, dynamic> json) => SearchMeta(
        total: json['total'] as int,
        page: json['page'] as int,
        perPage: json['per_page'] as int,
        totalPages: json['total_pages'] as int,
      );

  Map<String, dynamic> toJson() => {
        'total': total,
        'page': page,
        'per_page': perPage,
        'total_pages': totalPages,
      };
}

class SearchResult {
  final List<Exercise> data;
  final SearchMeta meta;

  const SearchResult({required this.data, required this.meta});

  factory SearchResult.fromJson(Map<String, dynamic> json) => SearchResult(
        data: (json['data'] as List<dynamic>)
            .map((e) => Exercise.fromJson(e as Map<String, dynamic>))
            .toList(),
        meta: SearchMeta.fromJson(json['meta'] as Map<String, dynamic>),
      );

  Map<String, dynamic> toJson() => {
        'data': data.map((e) => e.toJson()).toList(),
        'meta': meta.toJson(),
      };
}
