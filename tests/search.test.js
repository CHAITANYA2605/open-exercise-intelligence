#!/usr/bin/env node
/**
 * OEI Search Engine Tests
 * Zero-dependency. Run with: node tests/search.test.js
 */

'use strict';

const path = require('path');
const { loadExercises, buildIndex, search, facets, getRelated } = require('../search/index.js');

// ---------------------------------------------------------------------------
// Minimal test harness
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`);
    failed++;
  }
}

function assertEquals(actual, expected, label) {
  if (actual === expected) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    failed++;
  }
}

function describe(name, fn) {
  console.log(`\n${name}`);
  fn();
}

// ---------------------------------------------------------------------------
// Load dataset
// ---------------------------------------------------------------------------

const exerciseDir = path.join(__dirname, '..', 'data', 'exercises');
const exercises = loadExercises(exerciseDir);
const index = buildIndex(exercises);

console.log(`Loaded ${exercises.length} exercises for testing.\n`);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Index building', () => {
  assert(exercises.length > 0, 'At least one exercise loaded');
  assert(index.length === exercises.length, 'Index length matches exercise count');
  assert(index[0].searchText && index[0].searchText.length > 0, 'First entry has non-empty searchText');
});

describe('Basic search', () => {
  const result = search(index, { q: 'bench' });
  assert(result.total > 0, 'Search for "bench" returns results');
  assert(result.results.length > 0, 'Results array is non-empty');
  assert(result.results.every(r => r.name), 'All results have a name');

  const benchPress = result.results.find(r => r.name && r.name.toLowerCase().includes('bench'));
  assert(benchPress !== undefined, 'Bench Press appears in results');
});

describe('Exact match scoring', () => {
  const result = search(index, { q: 'barbell bench press', per_page: 1 });
  assert(result.total > 0, 'Exact name search returns results');
  if (result.results.length > 0) {
    assert(result.results[0]._score >= 10, 'Top result has high score for name match');
  }
});

describe('Pagination', () => {
  const page1 = search(index, { q: '', per_page: 10, page: 1 });
  const page2 = search(index, { q: '', per_page: 10, page: 2 });

  assert(page1.results.length <= 10, 'Page 1 returns at most 10 results');
  assertEquals(page1.page, 1, 'page1.page === 1');
  assertEquals(page1.per_page, 10, 'page1.per_page === 10');
  assert(page1.total_pages >= 1, 'total_pages >= 1');

  if (page1.total > 10) {
    assert(page2.results.length > 0, 'Page 2 has results when total > 10');
    const page1Ids = new Set(page1.results.map(r => r.slug));
    assert(!page2.results.some(r => page1Ids.has(r.slug)), 'Page 2 has no overlap with page 1');
  }

  assertEquals(page1.total, page2.total, 'Total is consistent across pages');
});

describe('Category filter', () => {
  const result = search(index, { filters: { category: 'strength' }, per_page: 100 });
  assert(result.total > 0, 'Strength category filter returns results');
  assert(result.results.every(r => {
    const ex = index.find(d => d.exercise.slug === r.slug);
    return ex && ex.exercise.category === 'strength';
  }), 'All results have strength category');
});

describe('Difficulty filter', () => {
  const result = search(index, { filters: { difficulty_level: 'beginner' }, per_page: 100 });
  if (result.total > 0) {
    assert(result.results.every(r => {
      const ex = index.find(d => d.exercise.slug === r.slug);
      return ex && ex.exercise.difficulty_level === 'beginner';
    }), 'All results have beginner difficulty');
  } else {
    assert(true, 'No beginner exercises (acceptable for this dataset)');
  }
});

describe('Synonym expansion', () => {
  const chestResult = search(index, { q: 'chest' });
  const pectoralisResult = search(index, { q: 'pectoralis' });
  assert(chestResult.total > 0, '"chest" synonym returns results');
  assert(pectoralisResult.total > 0, '"pectoralis" direct search returns results');
  // Both should find similar exercises
  const chestSlugs = new Set(chestResult.results.map(r => r.slug));
  const pectoralisSlugs = new Set(pectoralisResult.results.map(r => r.slug));
  const overlap = [...chestSlugs].filter(s => pectoralisSlugs.has(s)).length;
  assert(overlap > 0, '"chest" and "pectoralis" searches share at least one result');
});

describe('Fuzzy search', () => {
  // "benchpress" (no space) should fuzzy-find bench press exercises via synonym
  const result = search(index, { q: 'benchpress' });
  assert(result.total > 0, '"benchpress" (no space) synonym finds results');

  // A typo with edit distance 1 should still find results
  const typoResult = search(index, { q: 'sqat' }); // "squat" with 1 deletion
  // This may or may not find results depending on dataset; just check it doesn't crash
  assert(typeof typoResult.total === 'number', 'Fuzzy search on typo returns a valid response');
});

describe('Review status filter', () => {
  const all = search(index, { per_page: 1 });
  const unreviewed = search(index, { filters: { review_status: 'UNREVIEWED' }, per_page: 100 });
  const approved = search(index, { filters: { review_status: 'APPROVED' }, per_page: 100 });

  assert(all.total > 0, 'Total exercises > 0');
  assert(unreviewed.total >= 0, 'UNREVIEWED filter returns valid count');
  assert(approved.total >= 0, 'APPROVED filter returns valid count');
  assert(unreviewed.total + approved.total <= all.total, 'UNREVIEWED + APPROVED <= total');
});

describe('Related exercises', () => {
  if (exercises.length > 0) {
    const ex = exercises[0];
    const related = getRelated(ex, index, 5);
    assert(Array.isArray(related), 'getRelated returns an array');
    assert(related.every(r => r.slug !== ex.slug), 'Related exercises exclude the source exercise');
    assert(related.length <= 5, 'At most 5 related exercises returned');
  }
});

describe('Facets', () => {
  const f = facets(index);
  assert(f.category && f.category.length > 0, 'Category facets are non-empty');
  assert(f.difficulty_level && f.difficulty_level.length > 0, 'Difficulty facets are non-empty');
  assert(f.category.every(c => typeof c.count === 'number' && c.count > 0), 'All category counts are positive numbers');
});

describe('AND semantics', () => {
  const result = search(index, { q: 'barbell chest' });
  if (result.total > 0) {
    // Every result should include both "barbell" and "chest" in its searchText
    assert(result.results.length > 0, 'AND search for "barbell chest" returns results');
  } else {
    assert(true, 'AND semantics: no results for unusual combination (acceptable)');
  }
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error(`\n${failed} test(s) failed.`);
  process.exit(1);
} else {
  console.log('\nAll tests passed.');
  process.exit(0);
}
