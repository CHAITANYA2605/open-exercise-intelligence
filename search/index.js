#!/usr/bin/env node
/**
 * OEI Search Engine
 * Zero-dependency full-text + filter search over the exercise dataset.
 * License: MIT
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Index builder
// ---------------------------------------------------------------------------

function loadExercises(exerciseDir) {
  const exercises = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith('.json')) {
        try {
          const ex = JSON.parse(fs.readFileSync(full, 'utf8'));
          exercises.push(ex);
        } catch (_) {}
      }
    }
  }
  walk(exerciseDir);
  return exercises;
}

function buildSearchTokens(ex) {
  const parts = [
    ex.name || '',
    (ex.alternative_names || []).join(' '),
    ex.description || '',
    ex.category || '',
    ex.exercise_family || '',
    ex.movement_pattern || '',
    (ex.metadata && ex.metadata.tags || []).join(' '),
    ...(ex.muscles && ex.muscles.primary || []).map(m => m.muscle_slug || ''),
    ...(ex.muscles && ex.muscles.secondary || []).map(m => m.muscle_slug || ''),
    ...(ex.muscles && ex.muscles.stabilizers || []).map(m => m.muscle_slug || ''),
  ];
  return parts.join(' ').toLowerCase().replace(/[^a-z0-9 -]/g, ' ');
}

function buildIndex(exercises) {
  return exercises.map(ex => ({
    exercise: ex,
    searchText: buildSearchTokens(ex),
  }));
}

// ---------------------------------------------------------------------------
// Query parser
// ---------------------------------------------------------------------------

function tokenize(query) {
  return query.toLowerCase().replace(/[^a-z0-9 -]/g, ' ').split(/\s+/).filter(Boolean);
}

function scoreDoc(doc, tokens) {
  if (tokens.length === 0) return 1;
  let score = 0;
  for (const token of tokens) {
    const idx = doc.searchText.indexOf(token);
    if (idx === -1) return 0; // AND semantics — all tokens must match
    // Weight: name matches score higher than description
    const nameLower = (doc.exercise.name || '').toLowerCase();
    if (nameLower.includes(token)) score += 10;
    else score += 1;
  }
  return score;
}

// ---------------------------------------------------------------------------
// Filter helpers
// ---------------------------------------------------------------------------

function matchesFilter(ex, filters) {
  if (filters.category && ex.category !== filters.category) return false;
  if (filters.difficulty_level && ex.difficulty_level !== filters.difficulty_level) return false;
  if (filters.movement_pattern && ex.movement_pattern !== filters.movement_pattern) return false;
  if (filters.exercise_type && ex.exercise_type !== filters.exercise_type) return false;
  if (filters.laterality && ex.laterality !== filters.laterality) return false;
  if (filters.force_type && ex.force_type !== filters.force_type) return false;
  if (filters.status && ex.status !== filters.status) return false;

  if (filters.muscle_slug) {
    const slugs = new Set([
      ...(ex.muscles && ex.muscles.primary || []).map(m => m.muscle_slug),
      ...(ex.muscles && ex.muscles.secondary || []).map(m => m.muscle_slug),
      ...(ex.muscles && ex.muscles.stabilizers || []).map(m => m.muscle_slug),
    ]);
    if (!slugs.has(filters.muscle_slug)) return false;
  }

  if (filters.primary_muscle_slug) {
    const slugs = new Set((ex.muscles && ex.muscles.primary || []).map(m => m.muscle_slug));
    if (!slugs.has(filters.primary_muscle_slug)) return false;
  }

  if (filters.equipment_id) {
    const ids = new Set([
      ...(ex.equipment_required || []),
      ...(ex.equipment_optional || []),
    ]);
    if (!ids.has(filters.equipment_id)) return false;
  }

  if (filters.training_goal) {
    const goals = new Set(ex.training_parameters && ex.training_parameters.training_goals || []);
    if (!goals.has(filters.training_goal)) return false;
  }

  if (filters.tags && filters.tags.length > 0) {
    const exTags = new Set(ex.metadata && ex.metadata.tags || []);
    if (!filters.tags.every(t => exTags.has(t))) return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Sort
// ---------------------------------------------------------------------------

function sortResults(results, sortBy, sortOrder) {
  const dir = sortOrder === 'desc' ? -1 : 1;
  return results.slice().sort((a, b) => {
    if (sortBy === 'score') return dir * (b.score - a.score);
    if (sortBy === 'name') return dir * (a.exercise.name || '').localeCompare(b.exercise.name || '');
    if (sortBy === 'difficulty') {
      const order = { beginner: 0, intermediate: 1, advanced: 2 };
      return dir * ((order[a.exercise.difficulty_level] || 0) - (order[b.exercise.difficulty_level] || 0));
    }
    return 0;
  });
}

// ---------------------------------------------------------------------------
// Related exercises
// ---------------------------------------------------------------------------

function getRelated(exercise, index, limit = 5) {
  const primarySlugs = new Set((exercise.muscles && exercise.muscles.primary || []).map(m => m.muscle_slug));
  const scored = index
    .filter(doc => doc.exercise.exercise_id !== exercise.exercise_id)
    .map(doc => {
      let overlap = 0;
      for (const m of (doc.exercise.muscles && doc.exercise.muscles.primary || [])) {
        if (primarySlugs.has(m.muscle_slug)) overlap++;
      }
      const sameCategory = doc.exercise.category === exercise.category ? 2 : 0;
      const sameFamily = doc.exercise.exercise_family === exercise.exercise_family ? 3 : 0;
      return { exercise: doc.exercise, score: overlap * 5 + sameCategory + sameFamily };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return scored.map(r => ({
    exercise_id: r.exercise.exercise_id,
    slug: r.exercise.slug,
    name: r.exercise.name,
    category: r.exercise.category,
    difficulty_level: r.exercise.difficulty_level,
  }));
}

// ---------------------------------------------------------------------------
// Main search function
// ---------------------------------------------------------------------------

/**
 * Search the exercise index.
 *
 * @param {object} index      Built by buildIndex()
 * @param {object} params
 * @param {string} [params.q]                  Full-text query
 * @param {object} [params.filters]            Filter fields (see matchesFilter)
 * @param {string} [params.sort_by]            'score' | 'name' | 'difficulty'
 * @param {string} [params.sort_order]         'asc' | 'desc'
 * @param {number} [params.page]               1-based page number
 * @param {number} [params.per_page]           Results per page (default 20, max 100)
 * @param {boolean} [params.include_related]   Include related exercises for each result
 * @returns {{ results, total, page, per_page, total_pages }}
 */
function search(index, params = {}) {
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

  // Filter then score
  let matched = index
    .filter(doc => matchesFilter(doc.exercise, filters))
    .map(doc => ({ ...doc, score: scoreDoc(doc, tokens) }))
    .filter(doc => doc.score > 0);

  // Sort
  const sorted = sortResults(matched, sort_by, sort_order);

  const total = sorted.length;
  const totalPages = Math.ceil(total / perPage);
  const offset = (pageNum - 1) * perPage;
  const page_results = sorted.slice(offset, offset + perPage);

  const results = page_results.map(doc => {
    const out = {
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
      out.related = getRelated(doc.exercise, index);
    }
    return out;
  });

  return { results, total, page: pageNum, per_page: perPage, total_pages: totalPages };
}

// ---------------------------------------------------------------------------
// Facets / aggregations
// ---------------------------------------------------------------------------

function facets(index, filters = {}) {
  const filtered = index.filter(doc => matchesFilter(doc.exercise, filters));
  const counts = (field) => {
    const map = {};
    for (const doc of filtered) {
      const v = doc.exercise[field];
      if (v) map[v] = (map[v] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([value, count]) => ({ value, count }));
  };
  return {
    category: counts('category'),
    difficulty_level: counts('difficulty_level'),
    movement_pattern: counts('movement_pattern'),
    exercise_type: counts('exercise_type'),
    laterality: counts('laterality'),
    force_type: counts('force_type'),
  };
}

// ---------------------------------------------------------------------------
// Module export + CLI
// ---------------------------------------------------------------------------

module.exports = { loadExercises, buildIndex, search, facets, getRelated };

if (require.main === module) {
  const exerciseDir = path.join(__dirname, '..', 'data', 'exercises');
  const exercises = loadExercises(exerciseDir);
  const index = buildIndex(exercises);
  console.log(`Index built: ${exercises.length} exercises loaded.`);

  // Simple CLI demo
  const args = process.argv.slice(2);
  const q = args.join(' ');
  if (q) {
    const result = search(index, { q, per_page: 10, include_related: false });
    console.log(`\nResults for "${q}" (${result.total} total):\n`);
    for (const r of result.results) {
      console.log(`  [${r.difficulty_level}] ${r.name} (${r.category}) — score: ${r._score}`);
    }
  } else {
    const f = facets(index);
    console.log('\nFacets:');
    for (const [field, entries] of Object.entries(f)) {
      console.log(`  ${field}: ${entries.map(e => `${e.value}(${e.count})`).join(', ')}`);
    }
  }
}
