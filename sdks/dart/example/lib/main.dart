import 'package:flutter/material.dart';
import 'package:oei/oei.dart';

void main() {
  runApp(const OeiExampleApp());
}

class OeiExampleApp extends StatelessWidget {
  const OeiExampleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'OEI Exercise Browser',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const ExerciseBrowserPage(),
    );
  }
}

class ExerciseBrowserPage extends StatefulWidget {
  const ExerciseBrowserPage({super.key});

  @override
  State<ExerciseBrowserPage> createState() => _ExerciseBrowserPageState();
}

class _ExerciseBrowserPageState extends State<ExerciseBrowserPage> {
  OEIClient? _client;
  bool _loading = true;
  String? _error;

  List<Exercise> _results = [];
  int _total = 0;
  final _searchController = TextEditingController();
  String _query = '';
  String? _selectedCategory;

  static const _categories = [
    'strength',
    'cardio',
    'flexibility',
    'mobility',
    'plyometric',
    'power',
    'rehabilitation',
    'functional',
    'stretching',
  ];

  @override
  void initState() {
    super.initState();
    _loadDataset();
    _searchController.addListener(() {
      final q = _searchController.text;
      if (q != _query) {
        setState(() => _query = q);
        _search();
      }
    });
  }

  Future<void> _loadDataset() async {
    try {
      final client = await FlutterAssetLoader.load('assets/oei-dataset.json');
      setState(() {
        _client = client;
        _loading = false;
      });
      await _search();
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _search() async {
    if (_client == null) return;
    final result = await _client!.search(SearchParams(
      query: _query.isEmpty ? null : _query,
      category: _selectedCategory,
      perPage: 50,
    ));
    if (mounted) {
      setState(() {
        _results = result.data;
        _total = result.meta.total;
      });
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('OEI Exercise Browser'),
        backgroundColor: const Color(0xFF1E1B4B),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Text(
                      'Error loading dataset:\n$_error',
                      style: const TextStyle(color: Colors.red),
                      textAlign: TextAlign.center,
                    ),
                  ),
                )
              : Column(
                  children: [
                    _buildSearchBar(),
                    _buildFilterRow(),
                    _buildResultCount(),
                    Expanded(child: _buildResultList()),
                  ],
                ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: TextField(
        controller: _searchController,
        decoration: InputDecoration(
          hintText: 'Search exercises...',
          prefixIcon: const Icon(Icons.search),
          suffixIcon: _query.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    _searchController.clear();
                    setState(() => _query = '');
                    _search();
                  },
                )
              : null,
          filled: true,
          fillColor: const Color(0xFF1E293B),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
        ),
      ),
    );
  }

  Widget _buildFilterRow() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Row(
        children: [
          FilterChip(
            label: const Text('All'),
            selected: _selectedCategory == null,
            onSelected: (_) {
              setState(() => _selectedCategory = null);
              _search();
            },
          ),
          const SizedBox(width: 8),
          ..._categories.map((cat) => Padding(
                padding: const EdgeInsets.only(right: 8),
                child: FilterChip(
                  label: Text(cat[0].toUpperCase() + cat.substring(1)),
                  selected: _selectedCategory == cat,
                  onSelected: (_) {
                    setState(() =>
                        _selectedCategory = _selectedCategory == cat ? null : cat);
                    _search();
                  },
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildResultCount() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Text(
          '$_total exercise${_total == 1 ? '' : 's'} found',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.white54,
              ),
        ),
      ),
    );
  }

  Widget _buildResultList() {
    if (_results.isEmpty) {
      return const Center(
        child: Text('No exercises found', style: TextStyle(color: Colors.white54)),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: _results.length,
      itemBuilder: (context, index) => _ExerciseCard(exercise: _results[index]),
    );
  }
}

class _ExerciseCard extends StatelessWidget {
  final Exercise exercise;

  const _ExerciseCard({required this.exercise});

  static const _categoryColors = {
    'strength': Color(0xFF4F46E5),
    'cardio': Color(0xFFDC2626),
    'flexibility': Color(0xFF059669),
    'mobility': Color(0xFF0891B2),
    'plyometric': Color(0xFFD97706),
    'power': Color(0xFF7C3AED),
    'rehabilitation': Color(0xFF0D9488),
    'functional': Color(0xFF2563EB),
    'stretching': Color(0xFF10B981),
  };

  static const _difficultyColors = {
    'beginner': Color(0xFF10B981),
    'intermediate': Color(0xFFF59E0B),
    'advanced': Color(0xFFEF4444),
    'expert': Color(0xFF8B5CF6),
  };

  @override
  Widget build(BuildContext context) {
    final catColor =
        _categoryColors[exercise.category] ?? const Color(0xFF6366F1);
    final diffColor =
        _difficultyColors[exercise.difficultyLevel] ?? const Color(0xFF94A3B8);
    final primaryMuscles = exercise.muscles.primary
        .map((m) => m.muscleSlug.replaceAll('-', ' '))
        .take(3)
        .join(', ');

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      color: const Color(0xFF1E293B),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    exercise.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                if (exercise.category != null)
                  _Badge(exercise.category!, catColor),
                const SizedBox(width: 6),
                if (exercise.difficultyLevel != null)
                  _Badge(exercise.difficultyLevel!, diffColor),
              ],
            ),
            if (primaryMuscles.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(
                'Primary: $primaryMuscles',
                style: const TextStyle(fontSize: 12, color: Colors.white54),
              ),
            ],
            if (exercise.description != null) ...[
              const SizedBox(height: 6),
              Text(
                exercise.description!,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 12, color: Colors.white70),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  final String label;
  final Color color;

  const _Badge(this.label, this.color);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w500),
      ),
    );
  }
}
