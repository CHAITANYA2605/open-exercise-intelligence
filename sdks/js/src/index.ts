/**
 * @oei/exercise-sdk
 * Open Exercise Intelligence — JavaScript/TypeScript SDK
 *
 * License: MIT
 * Data: CC0 1.0
 *
 * Usage (Node.js with bundled data):
 *   const { OEIClient } = require('@oei/exercise-sdk');
 *   const client = new OEIClient({ dataDir: './data/exercises' });
 *   await client.init();
 *   const results = await client.search({ q: 'bench press', filters: { category: 'strength' } });
 *
 * Usage (browser with pre-fetched data):
 *   const client = new OEIClient();
 *   await client.loadFromArray(exerciseArray);
 *   const results = await client.search({ q: 'squat' });
 */

import type {
  Exercise,
  ExerciseSummary,
  SearchParams,
  SearchResult,
  SearchFilters,
  Facets,
  FacetEntry,
} from './types';

export type { Exercise, ExerciseSummary, SearchParams, SearchResult, SearchFilters, Facets, FacetEntry };

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildSearchTokens(ex: Exercise): string {
  return [
    ex.name,
    ...(ex.alternative_names || []),
    ex.description || '',
    ex.category || '',
    ex.exercise_family || '',
    ex.movement_pattern || '',
    ...(ex.metadata?.tags || []),
    ...(ex.muscles?.primary || []).map(m => m.muscle_slug),
    ...(ex.muscles?.secondary || []).map(m => m.muscle_slug),
    ...(ex.muscles?.stabilizers || []).map(m => m.muscle_slug),
  ]
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, ' ');
}

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function scoreDoc(searchText: string, name: string, tokens: string[]): number {
  if (tokens.length === 0) return 1;
  let score = 0;
  const nameLower = name.toLowerCase();
  for (const token of tokens) {
    if (!searchText.includes(token)) return 0; // AND semantics
    if (nameLower.includes(token)) score += 10;
    else score += 1;
  }
  return score;
}

function matchesFilter(ex: Exercise, filters: SearchFilters): boolean {
  if (filters.category && ex.category !== filters.category) return false;
  if (filters.difficulty_level && ex.difficulty_level !== filters.difficulty_level) return false;
  if (filters.movement_pattern && ex.movement_pattern !== filters.movement_pattern) return false;
  if (filters.exercise_type && ex.exercise_type !== filters.exercise_type) return false;
  if (filters.laterality && ex.laterality !== filters.laterality) return false;
  if (filters.force_type && ex.force_type !== filters.force_type) return false;
  if (filters.status && ex.status !== filters.status) return false;

  if (filters.muscle_slug) {
    const slugs = new Set([
      ...(ex.muscles?.primary || []).map(m => m.muscle_slug),
      ...(ex.muscles?.secondary || []).map(m => m.muscle_slug),
      ...(ex.muscles?.stabilizers || []).map(m => m.muscle_slug),
    ]);
    if (!slugs.has(filters.muscle_slug)) return false;
  }

  if (filters.primary_muscle_slug) {
    const slugs = new Set((ex.muscles?.primary || []).map(m => m.muscle_slug));
    if (!slugs.has(filters.primary_muscle_slug)) return false;
  }

  if (filters.equipment_id) {
    const ids = new Set([...(ex.equipment_required || []), ...(ex.equipment_optional || [])]);
    if (!ids.has(filters.equipment_id)) return false;
  }

  if (filters.training_goal) {
    const goals = new Set(ex.training_parameters?.training_goals || []);
    if (!goals.has(filters.training_goal)) return false;
  }

  if (filters.tags && filters.tags.length > 0) {
    const exTags = new Set(ex.metadata?.tags || []);
    if (!filters.tags.every(t => exTags.has(t))) return false;
  }

  return true;
}

const DIFFICULTY_ORDER: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 };

function sortResults(
  results: Array<{ exercise: Exercise; score: number }>,
  sortBy: string,
  sortOrder: string
): typeof results {
  const dir = sortOrder === 'asc' ? 1 : -1;
  return results.slice().sort((a, b) => {
    if (sortBy === 'name')
      return dir * a.exercise.name.localeCompare(b.exercise.name);
    if (sortBy === 'difficulty')
      return dir * ((DIFFICULTY_ORDER[a.exercise.difficulty_level] ?? 0) - (DIFFICULTY_ORDER[b.exercise.difficulty_level] ?? 0));
    // default: score desc
    return -dir * (a.score - b.score);
  });
}

// ---------------------------------------------------------------------------
// OEIClient
// ---------------------------------------------------------------------------

interface IndexEntry {
  exercise: Exercise;
  searchText: string;
}

export interface OEIClientOptions {
  /** Path to the exercises directory (Node.js only) */
  dataDir?: string;
}

export class OEIClient {
  private index: IndexEntry[] = [];
  private opts: OEIClientOptions;

  constructor(opts: OEIClientOptions = {}) {
    this.opts = opts;
  }

  /** Load exercises from the filesystem (Node.js only). */
  async init(): Promise<void> {
    const { dataDir } = this.opts;
    if (!dataDir) throw new Error('OEIClient: dataDir is required for init()');
    const { loadExercisesFromDir } = await import('./loader');
    const exercises = await loadExercisesFromDir(dataDir);
    this.loadFromArray(exercises);
  }

  /** Load exercises from an array (browser or pre-fetched). */
  loadFromArray(exercises: Exercise[]): void {
    this.index = exercises.map(ex => ({
      exercise: ex,
      searchText: buildSearchTokens(ex),
    }));
  }

  /** Number of exercises in the index. */
  get size(): number {
    return this.index.length;
  }

  /**
   * Search exercises.
   */
  search(params: SearchParams = {}): SearchResult {
    const {
      q = '',
      filters = {},
      sort_by = 'score',
      sort_order = 'desc',
      page = 1,
      per_page = 20,
      include_related = false,
    } = params;

    const tokens = tokenize(q);
    const perPage = Math.min(Math.max(1, per_page), 100);
    const pageNum = Math.max(1, page);

    const matched = this.index
      .filter(doc => matchesFilter(doc.exercise, filters))
      .map(doc => ({ exercise: doc.exercise, score: scoreDoc(doc.searchText, doc.exercise.name, tokens) }))
      .filter(doc => doc.score > 0);

    const sorted = sortResults(matched, sort_by, sort_order);
    const total = sorted.length;
    const offset = (pageNum - 1) * perPage;
    const page_results = sorted.slice(offset, offset + perPage);

    const results: ExerciseSummary[] = page_results.map(doc => {
      const r: ExerciseSummary = {
        exercise_id: doc.exercise.exercise_id,
        slug: doc.exercise.slug,
        name: doc.exercise.name,
        category: doc.exercise.category,
        difficulty_level: doc.exercise.difficulty_level,
        movement_pattern: doc.exercise.movement_pattern,
        exercise_type: doc.exercise.exercise_type,
        laterality: doc.exercise.laterality,
        muscles: doc.exercise.muscles,
        equipment_required: doc.exercise.equipment_required,
        description: doc.exercise.description,
        _score: doc.score,
      };
      if (include_related) {
        r.related = this.related(doc.exercise.exercise_id);
      }
      return r;
    });

    return { results, total, page: pageNum, per_page: perPage, total_pages: Math.ceil(total / perPage) };
  }

  /** Get a single exercise by ID or slug. */
  get(idOrSlug: string): Exercise | undefined {
    const doc = this.index.find(
      d => d.exercise.exercise_id === idOrSlug || d.exercise.slug === idOrSlug
    );
    return doc?.exercise;
  }

  /** Get related exercises for a given exercise ID or slug. */
  related(idOrSlug: string, limit = 5): ExerciseSummary[] {
    const target = this.get(idOrSlug);
    if (!target) return [];
    const primarySlugs = new Set((target.muscles?.primary || []).map(m => m.muscle_slug));

    return this.index
      .filter(doc => doc.exercise.exercise_id !== target.exercise_id)
      .map(doc => {
        let overlap = 0;
        for (const m of doc.exercise.muscles?.primary || []) {
          if (primarySlugs.has(m.muscle_slug)) overlap++;
        }
        const sameCategory = doc.exercise.category === target.category ? 2 : 0;
        const sameFamily = doc.exercise.exercise_family === target.exercise_family ? 3 : 0;
        return { exercise: doc.exercise, score: overlap * 5 + sameCategory + sameFamily };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => ({
        exercise_id: r.exercise.exercise_id,
        slug: r.exercise.slug,
        name: r.exercise.name,
        category: r.exercise.category,
        difficulty_level: r.exercise.difficulty_level,
      }));
  }

  /** Get facet counts for the given (optional) base filters. */
  facets(filters: SearchFilters = {}): Facets {
    const filtered = this.index.filter(doc => matchesFilter(doc.exercise, filters));
    const count = (field: keyof Exercise): FacetEntry[] => {
      const map: Record<string, number> = {};
      for (const doc of filtered) {
        const v = doc.exercise[field] as string;
        if (v) map[v] = (map[v] || 0) + 1;
      }
      return Object.entries(map)
        .sort((a, b) => b[1] - a[1])
        .map(([value, count]) => ({ value, count }));
    };
    return {
      category: count('category'),
      difficulty_level: count('difficulty_level'),
      movement_pattern: count('movement_pattern'),
      exercise_type: count('exercise_type'),
      laterality: count('laterality'),
      force_type: count('force_type'),
    };
  }

  /** List all exercises (paginated). */
  list(page = 1, per_page = 20): SearchResult {
    return this.search({ page, per_page });
  }
}
