#!/usr/bin/env node
/**
 * OEI Approved Dataset Export
 * Usage:
 *   node scripts/admin/export-approved.js                # export APPROVED exercises only
 *   node scripts/admin/export-approved.js --include-unreviewed  # export ALL exercises (dev use)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../data/exercises');
const RELEASES_DIR = path.resolve(__dirname, '../../data/releases/approved');
const VERSION_FILE = path.resolve(__dirname, '../../data/dataset-version.json');

const includeUnreviewed = process.argv.includes('--include-unreviewed');

function getAllExercises() {
  const exercises = [];
  const entries = fs.readdirSync(DATA_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const catDir = path.join(DATA_DIR, entry.name);
      const files = fs.readdirSync(catDir).filter(f => f.endsWith('.json'));
      for (const f of files) {
        const data = JSON.parse(fs.readFileSync(path.join(catDir, f), 'utf8'));
        exercises.push(data);
      }
    }
  }
  return exercises;
}

function main() {
  console.log('Reading exercises...');
  const all = getAllExercises();

  let filtered;
  let reviewFilter;

  if (includeUnreviewed) {
    filtered = all;
    reviewFilter = 'ALL';
    console.log(`Including all ${all.length} exercises (dev mode).`);
  } else {
    filtered = all.filter(ex => ex.metadata && ex.metadata.review_status === 'APPROVED');
    reviewFilter = 'APPROVED';
    console.log(`Found ${filtered.length} APPROVED exercises out of ${all.length} total.`);
  }

  if (!fs.existsSync(RELEASES_DIR)) {
    fs.mkdirSync(RELEASES_DIR, { recursive: true });
  }

  // Full dataset file
  const datasetPath = path.join(RELEASES_DIR, 'oei-approved-dataset.json');
  fs.writeFileSync(datasetPath, JSON.stringify(filtered, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${datasetPath}`);

  // Index file (lightweight)
  const index = filtered.map(ex => ({
    exercise_id: ex.exercise_id,
    slug: ex.slug,
    name: ex.name,
    category: ex.category,
    difficulty_level: ex.difficulty_level,
    review_status: ex.metadata && ex.metadata.review_status,
  }));
  const indexPath = path.join(RELEASES_DIR, 'oei-approved-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${indexPath}`);

  // Version file
  let versionData = {};
  if (fs.existsSync(VERSION_FILE)) {
    versionData = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'));
  }
  const releaseVersion = {
    version: versionData.version || '0.9.0-beta',
    generated_at: new Date().toISOString(),
    review_filter: reviewFilter,
    exercise_count: filtered.length,
    total_dataset_count: all.length,
    note: includeUnreviewed
      ? 'Development export — includes all exercises regardless of review status.'
      : 'Production export — includes only APPROVED exercises.',
  };
  const versionPath = path.join(RELEASES_DIR, 'dataset-version.json');
  fs.writeFileSync(versionPath, JSON.stringify(releaseVersion, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${versionPath}`);

  console.log('\nExport complete.');
}

main();
