import 'dart:convert';
import 'package:http/http.dart' as http;

import 'models/exercise.dart';
import 'models/search_params.dart';
import 'models/search_result.dart';
import 'search_engine.dart';

enum _ClientMode { rest, inMemory }

/// OEIClient provides access to the Open Exercise Intelligence dataset
/// either via a REST API or entirely in-memory from a loaded dataset.
class OEIClient {
  final _ClientMode _mode;
  final String? _baseUrl;
  final http.Client? _httpClient;
  final SearchEngine? _engine;

  OEIClient._rest(this._baseUrl, this._httpClient)
      : _mode = _ClientMode.rest,
        _engine = null;

  OEIClient._inMemory(SearchEngine engine)
      : _mode = _ClientMode.inMemory,
        _baseUrl = null,
        _httpClient = null,
        _engine = engine;

  /// Create a client backed by a remote REST API (e.g. the Spring Boot server).
  factory OEIClient.fromUrl(String baseUrl, {http.Client? httpClient}) {
    final url = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    return OEIClient._rest(url, httpClient ?? http.Client());
  }

  /// Create a client backed by an in-memory list of exercises.
  factory OEIClient.fromList(List<Exercise> exercises) {
    return OEIClient._inMemory(SearchEngine(exercises));
  }

  /// Parse the OEI dataset JSON string and create an in-memory client.
  /// Accepts the full dataset envelope `{"exercises":[...]}` or a bare list.
  static OEIClient fromJsonString(String jsonString) {
    final dynamic decoded = jsonDecode(jsonString);
    List<dynamic> rawList;
    if (decoded is Map<String, dynamic>) {
      rawList = decoded['exercises'] as List<dynamic>;
    } else if (decoded is List<dynamic>) {
      rawList = decoded;
    } else {
      throw ArgumentError('Unexpected JSON structure: expected object with "exercises" key or a list.');
    }
    final exercises = rawList
        .map((e) => Exercise.fromJson(e as Map<String, dynamic>))
        .toList();
    return OEIClient.fromList(exercises);
  }

  /// Search exercises. Works in both REST and in-memory mode.
  Future<SearchResult> search(SearchParams params) async {
    if (_mode == _ClientMode.inMemory) {
      return Future.value(_engine!.search(params));
    }
    final uri = Uri.parse('$_baseUrl/v1/exercises')
        .replace(queryParameters: params.toQueryParams());
    final response = await _httpClient!.get(uri);
    _checkStatus(response);
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    return SearchResult.fromJson(json);
  }

  /// Get a single exercise by UUID or slug. Returns null if not found.
  Future<Exercise?> get(String idOrSlug) async {
    if (_mode == _ClientMode.inMemory) {
      return Future.value(_engine!.getByIdOrSlug(idOrSlug));
    }
    final uri = Uri.parse('$_baseUrl/v1/exercises/$idOrSlug');
    final response = await _httpClient!.get(uri);
    if (response.statusCode == 404) return null;
    _checkStatus(response);
    return Exercise.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
  }

  /// Get related exercises for the given ID or slug.
  Future<List<Exercise>> related(String idOrSlug, {int limit = 10}) async {
    if (_mode == _ClientMode.inMemory) {
      return Future.value(_engine!.related(idOrSlug, limit: limit));
    }
    final uri = Uri.parse('$_baseUrl/v1/exercises/$idOrSlug/related');
    final response = await _httpClient!.get(uri);
    if (response.statusCode == 404) return [];
    _checkStatus(response);
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final data = json['data'] as List<dynamic>;
    return data.map((e) => Exercise.fromJson(e as Map<String, dynamic>)).toList();
  }

  /// Get aggregated facet counts for all filterable fields.
  Future<Map<String, Map<String, int>>> facets() async {
    if (_mode == _ClientMode.inMemory) {
      return Future.value(_engine!.facets());
    }
    final uri = Uri.parse('$_baseUrl/v1/facets');
    final response = await _httpClient!.get(uri);
    _checkStatus(response);
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    return json.map((key, value) => MapEntry(
          key,
          (value as Map<String, dynamic>)
              .map((k, v) => MapEntry(k, v as int)),
        ));
  }

  void _checkStatus(http.Response response) {
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw OeiException(response.statusCode, response.body);
    }
  }

  /// Dispose the underlying HTTP client when in REST mode.
  void dispose() {
    if (_mode == _ClientMode.rest) {
      _httpClient?.close();
    }
  }
}

class OeiException implements Exception {
  final int statusCode;
  final String body;

  OeiException(this.statusCode, this.body);

  @override
  String toString() => 'OeiException($statusCode): $body';
}
