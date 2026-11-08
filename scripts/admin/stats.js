#!/usr/bin/env node
/**
 * OEI Admin — stats.js
 *
 * Usage:
 *   node scripts/admin/stats.js
 *
 * Prints comprehensive dataset statistics. Zero external dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'data');
const EXERCISES_DIR = path.join(DATA_DIR, 'exercises');
const DATASET_FILE = path.join(DATA_DIR, 'oei-dataset.json');
const VERSION_FILE = path.join(DATA_DIR, 'dataset-version.json');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function loadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`Failed to parse ${filePath}: ${e.message}`);
    return null;
  }
}

function collectExercises() {
  // Prefer the flat dataset if present; otherwise walk exercises dir
  if (fs.existsSync(DATASET_FILE)) {
    const data = loadJson(DATASET_FILE);
    if (Array.isArray(data)) return data;
  }

  const exercises = [];
  if (!fs.existsSync(EXERCISES_DIR)) return exercises;

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.json')) {
        const ex = loadJson(full);
        if (ex && ex.slug) exercises.push(ex);
      }
    }
  }
  walk(EXERCISES_DIR);
  return exercises;
}

function countBy(exercises, keyFn) {
  const counts = {};
  for (const ex of exercises) {
    const key = keyFn(ex);
    if (key !== null && key !== undefined) {
      counts[key] = (counts[key] || 0) + 1;
    }
  }
  return counts;
}

function topN(obj, n) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

function avg(nums) {
  if (nums.length === 0) return 0;
  return nums.reduce((s, v) => s + v, 0) / nums.length;
}

function bar(value, max, width) {
  const filled = Math.round((value / max) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function pct(value, total) {
  return total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  const exercises = collectExercises();
  const total = exercises.length;

  if (total === 0) {
    console.log('No exercises found. Run node scripts/admin/export-release.js first, or check data/exercises/.');
    process.exit(0);
  }

  const versionData = loadJson(VERSION_FILE);
  const version = versionData ? versionData.version : 'unknown';

  console.log('\n' + '='.repeat(68));
  console.log('OEI Dataset Statistics');
  console.log('='.repeat(68));
  console.log(`Version:    ${version}`);
  console.log(`Generated:  ${new Date().toISOString()}`);
  console.log(`Total exercises: ${total}`);
  console.log('');

  // ---------------------------------------------------------------------------
  // By Category
  // ---------------------------------------------------------------------------
  const byCategory = countBy(exercises, ex => ex.category);
  console.log('By Category:');
  const maxCat = Math.max(...Object.values(byCategory));
  Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`  ${cat.padEnd(22)} ${String(count).padStart(4)}  ${bar(count, maxCat, 24)}  ${pct(count, total)}%`);
    });
  console.log('');

  // ---------------------------------------------------------------------------
  // By Difficulty
  // ---------------------------------------------------------------------------
  const byDifficulty = countBy(exercises, ex => ex.difficulty_level);
  console.log('By Difficulty Level:');
  const diffOrder = ['beginner', 'intermediate', 'advanced', 'elite'];
  diffOrder.forEach(level => {
    const count = byDifficulty[level] || 0;
    console.log(`  ${level.padEnd(16)} ${String(count).padStart(4)}  ${bar(count, total, 24)}  ${pct(count, total)}%`);
  });
  console.log('');

  // ---------------------------------------------------------------------------
  // By Movement Pattern
  // ---------------------------------------------------------------------------
  const byMovement = countBy(exercises, ex => ex.movement_pattern);
  console.log('By Movement Pattern:');
  const maxMov = Math.max(...Object.values(byMovement));
  Object.entries(byMovement)
    .sort((a, b) => b[1] - a[1])
    .forEach(([pat, count]) => {
      console.log(`  ${pat.padEnd(22)} ${String(count).padStart(4)}  ${bar(count, maxMov, 24)}  ${pct(count, total)}%`);
    });
  console.log('');

  // ---------------------------------------------------------------------------
  // By Exercise Type
  // ---------------------------------------------------------------------------
  const byType = countBy(exercises, ex => ex.exercise_type);
  console.log('By Exercise Type:');
  Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${type.padEnd(22)} ${String(count).padStart(4)}  ${pct(count, total)}%`);
    });
  console.log('');

  // ---------------------------------------------------------------------------
  // Top 10 Most-Targeted Muscles (primary)
  // ---------------------------------------------------------------------------
  const muscleCounts = {};
  for (const ex of exercises) {
    if (ex.muscles && Array.isArray(ex.muscles.primary)) {
      ex.muscles.primary.forEach(m => {
        if (m.muscle_slug) {
          muscleCounts[m.muscle_slug] = (muscleCounts[m.muscle_slug] || 0) + 1;
        }
      });
    }
  }
  const topMuscles = topN(muscleCounts, 10);
  console.log('Top 10 Most-Targeted Muscles (by primary muscle count):');
  if (topMuscles.length > 0) {
    const maxMuscle = topMuscles[0][1];
    topMuscles.forEach(([muscle, count], i) => {
      console.log(`  ${String(i + 1).padStart(2)}. ${muscle.padEnd(30)} ${String(count).padStart(4)}  ${bar(count, maxMuscle, 20)}`);
    });
  } else {
    console.log('  (no muscle data found)');
  }
  console.log('');

  // ---------------------------------------------------------------------------
  // Equipment Usage Frequency
  // ---------------------------------------------------------------------------
  const equipCounts = {};
  for (const ex of exercises) {
    if (ex.equipment && Array.isArray(ex.equipment.required)) {
      ex.equipment.required.forEach(eq => {
        if (typeof eq === 'string') {
          equipCounts[eq] = (equipCounts[eq] || 0) + 1;
        }
      });
    }
  }
  const noEquipmentCount = exercises.filter(ex =>
    !ex.equipment || (!ex.equipment.required || ex.equipment.required.length === 0)
  ).length;
  const topEquip = topN(equipCounts, 10);
  console.log('Equipment Usage (top 10, required):');
  if (topEquip.length > 0) {
    const maxEquip = topEquip[0][1];
    topEquip.forEach(([eq, count], i) => {
      console.log(`  ${String(i + 1).padStart(2)}. ${eq.padEnd(30)} ${String(count).padStart(4)}  ${bar(count, maxEquip, 20)}`);
    });
  } else {
    console.log('  (no equipment data found)');
  }
  console.log(`  ${'(bodyweight/no equipment)'.padEnd(32)} ${String(noEquipmentCount).padStart(4)}`);
  console.log('');

  // ---------------------------------------------------------------------------
  // Execution Complexity
  // ---------------------------------------------------------------------------
  const stepCounts = exercises.map(ex =>
    ex.execution && Array.isArray(ex.execution.steps) ? ex.execution.steps.length : 0
  ).filter(n => n > 0);
  const cueCounts = exercises.map(ex =>
    ex.execution && Array.isArray(ex.execution.coaching_cues) ? ex.execution.coaching_cues.length : 0
  );

  console.log('Execution Complexity:');
  console.log(`  Average steps per exercise:          ${avg(stepCounts).toFixed(1)}`);
  console.log(`  Average coaching cues per exercise:  ${avg(cueCounts).toFixed(1)}`);
  console.log(`  Exercises with 0 coaching cues:      ${cueCounts.filter(n => n === 0).length} (${pct(cueCounts.filter(n => n === 0).length, total)}%)`);
  console.log('');

  // ---------------------------------------------------------------------------
  // Optional Field Coverage
  // ---------------------------------------------------------------------------
  console.log('Optional Field Coverage (exercises missing these fields):');
  const optionalFields = [
    ['coaching_cues',              ex => !ex.execution || !ex.execution.coaching_cues || ex.execution.coaching_cues.length === 0],
    ['common_mistakes',            ex => !ex.execution || !ex.execution.common_mistakes || ex.execution.common_mistakes.length === 0],
    ['range_of_motion_guidance',   ex => !ex.execution || !ex.execution.range_of_motion_guidance],
    ['breathing_pattern',          ex => !ex.execution || !ex.execution.breathing_pattern],
    ['safety.contraindications',   ex => !ex.safety || !ex.safety.contraindications || ex.safety.contraindications.length === 0],
    ['variants',                   ex => !ex.variants || (!ex.variants.progressions && !ex.variants.regressions && !ex.variants.substitutions)],
    ['tags',                       ex => !ex.tags || ex.tags.length === 0],
    ['alternative_names',          ex => !ex.alternative_names || ex.alternative_names.length === 0],
    ['training_parameters',        ex => !ex.training_parameters],
  ];

  optionalFields.forEach(([label, missingFn]) => {
    const missingCount = exercises.filter(missingFn).length;
    const covered = total - missingCount;
    console.log(`  ${label.padEnd(30)} covered: ${String(covered).padStart(4)} / ${total}  (${pct(covered, total)}%)`);
  });
  console.log('');

  // ---------------------------------------------------------------------------
  // Laterality breakdown
  // ---------------------------------------------------------------------------
  const byLaterality = countBy(exercises, ex => ex.laterality);
  console.log('By Laterality:');
  Object.entries(byLaterality)
    .sort((a, b) => b[1] - a[1])
    .forEach(([lat, count]) => {
      console.log(`  ${lat.padEnd(28)} ${String(count).padStart(4)}  ${pct(count, total)}%`);
    });
  console.log('');

  console.log('='.repeat(68));
  console.log('Stats complete.');
}

main();
