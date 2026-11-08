#!/usr/bin/env node
/**
 * OEI Dataset Builder
 * Generates versioned dataset artifacts from individual exercise JSON files.
 *
 * Output files (in data/generated/):
 *   oei-dataset-all.json      — All exercises, versioned wrapper
 *   oei-dataset-approved.json — APPROVED-only, versioned wrapper
 *   oei-index-all.json        — Lightweight index of all exercises
 *   oei-index-approved.json   — Lightweight index of approved-only exercises
 *
 * Usage: node scripts/generation/build-dataset.js [--dry-run]
 */

'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..', '..');
const EXERCISES_DIR = path.join(ROOT, 'data', 'exercises');
const VERSION_FILE = path.join(ROOT, 'data', 'dataset-version.json');
const OUTPUT_DIR = path.join(ROOT, 'data', 'generated');
const DRY_RUN = process.argv.includes('--dry-run');

function loadJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function findExerciseFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findExerciseFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.json')) results.push(full);
  }
  return results;
}

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function writeOutput(filePath, content) {
  if (DRY_RUN) {
    console.log(`[dry-run] Would write ${path.relative(ROOT, filePath)} (${content.length} bytes)`);
    return;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Wrote ${path.relative(ROOT, filePath)} (${content.length} bytes, sha256: ${sha256(content).slice(0, 16)}...)`);
}

function main() {
  const versionInfo = loadJSON(VERSION_FILE);
  const generatedAt = new Date().toISOString();

  // Load exercises
  const files = findExerciseFiles(EXERCISES_DIR);
  const exercises = [];
  const errors = [];

  for (const f of files) {
    try {
      const ex = JSON.parse(fs.readFileSync(f, 'utf8'));
      exercises.push(ex);
    } catch (e) {
      errors.push(`${path.relative(ROOT, f)}: ${e.message}`);
    }
  }

  if (errors.length > 0) {
    console.error(`\nERROR: ${errors.length} files failed to parse:`);
    errors.forEach(e => console.error(`  ${e}`));
    console.error('Fix parse errors before generating the dataset.');
    process.exit(1);
  }

  const approvedExercises = exercises.filter(e => e.metadata?.review_status === 'APPROVED');

  console.log(`Loaded ${exercises.length} exercises (${approvedExercises.length} APPROVED)`);

  // Build wrapper
  function buildWrapper(exList, reviewPolicy) {
    return {
      dataset: 'Open Exercise Intelligence',
      version: versionInfo.version || '0.9.0-beta',
      schema_version: versionInfo.schema_version || '1.1.0',
      generated_at: generatedAt,
      review_policy: reviewPolicy,
      exercise_count: exList.length,
      exercises: exList,
    };
  }

  function buildIndex(exList, reviewPolicy) {
    return {
      dataset: 'Open Exercise Intelligence',
      version: versionInfo.version || '0.9.0-beta',
      schema_version: versionInfo.schema_version || '1.1.0',
      generated_at: generatedAt,
      review_policy: reviewPolicy,
      exercise_count: exList.length,
      exercises: exList.map(e => ({
        exercise_id: e.exercise_id,
        slug: e.slug,
        name: e.name,
        category: e.category,
        difficulty_level: e.difficulty_level,
        movement_pattern: e.movement_pattern,
        laterality: e.laterality,
        review_status: e.metadata?.review_status || null,
      })),
    };
  }
  //to rerun actions

  const allWrapper = buildWrapper(exercises, 'all');
  const approvedWrapper = buildWrapper(approvedExercises, 'approved-only');
  const allIndex = buildIndex(exercises, 'all');
  const approvedIndex = buildIndex(approvedExercises, 'approved-only');

  writeOutput(path.join(OUTPUT_DIR, 'oei-dataset-all.json'), JSON.stringify(allWrapper, null, 2));
  writeOutput(path.join(OUTPUT_DIR, 'oei-dataset-approved.json'), JSON.stringify(approvedWrapper, null, 2));
  writeOutput(path.join(OUTPUT_DIR, 'oei-index-all.json'), JSON.stringify(allIndex, null, 2));
  writeOutput(path.join(OUTPUT_DIR, 'oei-index-approved.json'), JSON.stringify(approvedIndex, null, 2));

  if (!DRY_RUN) {
    // Write checksums
    const checksumLines = [
      `oei-dataset-all.json: ${sha256(JSON.stringify(allWrapper, null, 2))}`,
      `oei-dataset-approved.json: ${sha256(JSON.stringify(approvedWrapper, null, 2))}`,
      `oei-index-all.json: ${sha256(JSON.stringify(allIndex, null, 2))}`,
      `oei-index-approved.json: ${sha256(JSON.stringify(approvedIndex, null, 2))}`,
    ].join('\n');
    writeOutput(path.join(OUTPUT_DIR, 'checksums.sha256'), checksumLines);
    console.log('\nDataset generation complete.');
    if (approvedExercises.length === 0) {
      console.log('NOTE: oei-dataset-approved.json contains 0 exercises. No exercises are APPROVED yet.');
    }
  }
}

main();
