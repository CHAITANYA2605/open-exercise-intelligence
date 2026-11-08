import 'package:flutter/services.dart';

import 'client.dart';

/// Loads the OEI dataset from a Flutter asset bundle and returns an
/// in-memory [OEIClient] ready for offline use.
///
/// Usage:
/// ```dart
/// final client = await FlutterAssetLoader.load('assets/oei-dataset.json');
/// ```
///
/// Add to your pubspec.yaml:
/// ```yaml
/// flutter:
///   assets:
///     - assets/oei-dataset.json
/// ```
class FlutterAssetLoader {
  FlutterAssetLoader._();

  /// Loads [assetPath] from the Flutter asset bundle and returns an [OEIClient].
  static Future<OEIClient> load(String assetPath) async {
    final jsonString = await rootBundle.loadString(assetPath);
    return OEIClient.fromJsonString(jsonString);
  }

  /// Loads from a custom [AssetBundle] (useful in tests).
  static Future<OEIClient> loadFromBundle(
      AssetBundle bundle, String assetPath) async {
    final jsonString = await bundle.loadString(assetPath);
    return OEIClient.fromJsonString(jsonString);
  }
}
