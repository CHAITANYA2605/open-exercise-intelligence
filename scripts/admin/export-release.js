#!/usr/bin/env node
/**
 * OEI Admin — export-release.js
 *
 * Usage:
 *   node scripts/admin/export-release.js [--version 1.x.x]
 *
 * - Runs full dataset validation
 * - Regenerates data/generated/oei-dataset-all.json (flat JSON array of all exercises)
 * - Regenerates data/generated/oei-index-all.json (lightweight index)
 * - Updates data/dataset-version.json with count + timestamp
 * - Prints release summary
 *
 * Zero external dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'data');
const EXERCISES_DIR = path.join(DATA_DIR, 'exercises');
const MUSCLES_FILE = path.join(DATA_DIR, 'muscles', 'muscles.json');
const EQUIPMENT_FILE = path.join(DATA_DIR, 'equipment', 'equipment.json');
const DATASET_FILE = path.join(DATA_DIR, 'generated', 'oei-dataset-all.json');
const INDEX_FILE = path.join(DATA_DIR, 'generated', 'oei-index-all.json');
const VERSION_FILE = path.join(DATA_DIR, 'dataset-version.json');

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const versionIdx = args.indexOf('--version');
const versionArg = versionIdx !== -1 ? args[versionIdx + 1] : null;

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage:
  node scripts/admin/export-release.js [--version 1.x.x]

Options:
  --version 1.x.x   Set the new version string in dataset-version.json
  --help             Show this help
`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function loadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function collectExerciseFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'README.md') {
        files.push(full);
      }
    }
  }
  walk(dir);
  return files;
}

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

// ---------------------------------------------------------------------------
// Minimal inline validation
// ---------------------------------------------------------------------------
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REQUIRED_FIELDS = ['exercise_id', 'slug', 'name', 'description', 'category', 'exercise_type', 'difficulty_level', 'movement_pattern', 'laterality', 'status', 'muscles', 'execution', 'metadata'];

function validateExercise(exercise, filePath) {
  const errors = [];
  REQUIRED_FIELDS.forEach(f => {
    if (!(f in exercise)) errors.push(`Missing required field: ${f}`);
  });
  if (exercise.slug && !SLUG_RE.test(exercise.slug)) errors.push(`Invalid slug: ${exercise.slug}`);
  if (exercise.exercise_id && !UUID_RE.test(exercise.exercise_id)) errors.push(`Invalid UUID: ${exercise.exercise_id}`);
  if (exercise.description && exercise.description.length < 50) errors.push(`Description too short: ${exercise.description.length} chars`);
  if (exercise.muscles && (!Array.isArray(exercise.muscles.primary) || exercise.muscles.primary.length === 0)) {
    errors.push('muscles.primary must be a non-empty array');
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  console.log('\nOEI Export Release');
  console.log('='.repeat(60));

  // 1. Collect exercise files
  console.log(`\n[1/5] Scanning ${EXERCISES_DIR}...`);
  const files = collectExerciseFiles(EXERCISES_DIR);
  console.log(`      Found ${files.length} exercise files`);

  // 2. Load and validate all exercises
  console.log('\n[2/5] Loading and validating exercises...');
  const exercises = [];
  const errors = [];
  const slugsSeen = new Set();
  const idsSeen = new Set();

  for (const filePath of files) {
    let ex;
    try {
      ex = loadJson(filePath);
    } catch (e) {
      errors.push(`${filePath}: Invalid JSON — ${e.message}`);
      continue;
    }

    const fileErrors = validateExercise(ex, filePath);
    if (fileErrors.length > 0) {
      fileErrors.forEach(e => errors.push(`${path.relative(ROOT, filePath)}: ${e}`));
      continue;
    }

    if (slugsSeen.has(ex.slug)) {
      errors.push(`Duplicate slug: ${ex.slug} in ${path.relative(ROOT, filePath)}`);
    } else {
      slugsSeen.add(ex.slug);
    }

    if (idsSeen.has(ex.exercise_id)) {
      errors.push(`Duplicate exercise_id: ${ex.exercise_id} in ${path.relative(ROOT, filePath)}`);
    } else {
      idsSeen.add(ex.exercise_id);
    }

    exercises.push(ex);
  }

  if (errors.length > 0) {
    console.error(`\nValidation FAILED — ${errors.length} error(s):\n`);
    errors.forEach(e => console.error(`  [ERROR] ${e}`));
    console.error('\nFix all errors before releasing.');
    process.exit(1);
  }

  console.log(`      All ${exercises.length} exercises valid.`);

  // Sort by slug for deterministic output
  exercises.sort((a, b) => a.slug.localeCompare(b.slug));

  // 3. Write oei-dataset.json
  console.log('\n[3/5] Writing data/generated/oei-dataset-all.json...');
  const datasetJson = JSON.stringify(exercises, null, 2) + '\n';
  fs.writeFileSync(DATASET_FILE, datasetJson);
  const datasetSize = Buffer.byteLength(datasetJson, 'utf8');
  const datasetChecksum = sha256(datasetJson);
  console.log(`      Wrote ${exercises.length} exercises (${(datasetSize / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`      SHA-256: ${datasetChecksum}`);

  // 4. Write oei-index.json
  console.log('\n[4/5] Writing data/generated/oei-index-all.json...');
  const index = exercises.map(ex => ({
    slug: ex.slug,
    name: ex.name,
    category: ex.category,
    difficulty: ex.difficulty_level,
    primary_muscle: ex.muscles && ex.muscles.primary && ex.muscles.primary[0]
      ? ex.muscles.primary[0].muscle_slug
      : null,
  }));
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2) + '\n');
  console.log(`      Wrote ${index.length} index entries`);

  // 5. Update dataset-version.json
  console.log('\n[5/5] Updating data/dataset-version.json...');
  const existing = loadJson(VERSION_FILE) || {};
  const now = new Date().toISOString();

  // Category breakdown for changelog field
  const catCounts = {};
  exercises.forEach(ex => {
    catCounts[ex.category] = (catCounts[ex.category] || 0) + 1;
  });
  const catSummary = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => `${cat} (${count})`)
    .join(', ');

  const newVersion = {
    ...existing,
    version: versionArg || existing.version || '1.0.0',
    released_at: now,
    exercise_count: exercises.length,
    schema_version: existing.schema_version || '1.0.0',
    checksum_algorithm: 'sha256',
    dataset_checksum: datasetChecksum,
    changelog: `Released ${exercises.length} exercises across ${Object.keys(catCounts).length} categories: ${catSummary}.`,
    notes: existing.notes || 'All exercises are original works released under CC0 1.0.',
  };
  fs.writeFileSync(VERSION_FILE, JSON.stringify(newVersion, null, 2) + '\n');
  console.log(`      Version: ${newVersion.version}`);
  console.log(`      Released: ${now}`);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Release Summary');
  console.log('='.repeat(60));
  console.log(`Version:         ${newVersion.version}`);
  console.log(`Exercise count:  ${exercises.length}`);
  console.log(`Categories:      ${Object.keys(catCounts).length}`);
  Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => console.log(`  ${cat.padEnd(20)} ${count}`));
  console.log(`Dataset file:    data/generated/oei-dataset-all.json (${(datasetSize / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`Index file:      data/generated/oei-index-all.json`);
  console.log(`SHA-256:         ${datasetChecksum}`);
  console.log('='.repeat(60));
  console.log('\nRelease export complete.');
}

main();
