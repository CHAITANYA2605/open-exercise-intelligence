/// Open Exercise Intelligence (OEI) Dart/Flutter SDK.
///
/// Provides offline in-memory search and optional REST API access to the
/// OEI exercise dataset.
///
/// ## Quick start (Flutter asset mode)
/// ```dart
/// import 'package:oei/oei.dart';
///
/// // In initState or FutureBuilder:
/// final client = await FlutterAssetLoader.load('assets/oei-dataset.json');
/// final result = await client.search(SearchParams(query: 'bench press'));
/// ```
///
/// ## Quick start (REST API mode)
/// ```dart
/// import 'package:oei/oei.dart';
///
/// final client = OEIClient.fromUrl('http://localhost:8080');
/// final result = await client.search(SearchParams(category: 'strength', page: 1));
/// ```
library oei;

export 'src/client.dart';
export 'src/flutter_asset_loader.dart';
export 'src/models/equipment.dart';
export 'src/models/exercise.dart';
export 'src/models/muscle.dart';
export 'src/models/search_params.dart';
export 'src/models/search_result.dart';
export 'src/search_engine.dart';
