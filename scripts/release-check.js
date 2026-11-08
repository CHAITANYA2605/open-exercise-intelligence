#!/usr/bin/env node
/**
 * OEI Release Dry-Run
 * Reports dataset health and production eligibility without modifying any files.
 * Usage: node scripts/release-check.js [--verbose]
 *
 * Exit 0 = approved dataset is clean (or no approved exercises yet, which is valid for beta)
 * Exit 1 = P0 errors that would block a production release
 */

'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXERCISES_DIR = path.join(ROOT, 'data', 'exercises');
const MUSCLES_FILE = path.join(ROOT, 'data', 'muscles', 'muscles.json');
const EQUIPMENT_FILE = path.join(ROOT, 'data', 'equipment', 'equipment.json');
const VERSION_FILE = path.join(ROOT, 'data', 'dataset-version.json');

const VERBOSE = process.argv.includes('--verbose');
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PLACEHOLDER_PATTERNS = [
  'prepare equipment and body position',
  'position yourself appropriately for this exercise',
  'standard execution applies',
  'perform the movement through full range',
];

const VALID_REVIEW_STATUSES = new Set(['UNREVIEWED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_REVISION']);

function loadJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    console.error(`ERROR: Cannot parse ${file}: ${e.message}`);
    process.exit(2);
  }
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

function hasPlaceholder(exercise) {
  const text = [
    exercise.description || '',
    ...(exercise.execution?.steps || []),
    exercise.execution?.starting_position || '',
  ].join(' ').toLowerCase();
  return PLACEHOLDER_PATTERNS.some(p => text.includes(p));
}

function main() {
  console.log('OEI Release Dry-Run');
  console.log('='.repeat(60));

  // Load reference data
  const muscles = loadJSON(MUSCLES_FILE);
  const equipment = loadJSON(EQUIPMENT_FILE);
  const muscleIds = new Set(muscles.map(m => m.muscle_id));
  const equipmentIds = new Set(equipment.map(e => e.equipment_id));

  let datasetVersion = {};
  if (fs.existsSync(VERSION_FILE)) datasetVersion = loadJSON(VERSION_FILE);

  // Load all exercise files
  const files = findExerciseFiles(EXERCISES_DIR);
  const exercises = [];
  const parseErrors = [];

  for (const f of files) {
    try {
      const ex = JSON.parse(fs.readFileSync(f, 'utf8'));
      ex._file = path.relative(ROOT, f);
      exercises.push(ex);
    } catch (e) {
      parseErrors.push(`${path.relative(ROOT, f)}: ${e.message}`);
    }
  }

  // Build slug set for reference checking
  const slugSet = new Set(exercises.map(e => e.slug).filter(Boolean));

  // Counters and issue buckets
  const statusCounts = {};
  const p0Errors = [];
  const warnings = [];

  const seenIds = new Map();
  const seenSlugs = new Map();

  for (const ex of exercises) {
    const file = ex._file;

    // --- Duplicate ID ---
    if (ex.exercise_id) {
      if (seenIds.has(ex.exercise_id)) {
        p0Errors.push(`Duplicate exercise_id ${ex.exercise_id} in ${file} (also ${seenIds.get(ex.exercise_id)})`);
      } else {
        seenIds.set(ex.exercise_id, file);
      }
      if (!UUID_RE.test(ex.exercise_id)) {
        p0Errors.push(`Invalid UUID exercise_id in ${file}: ${ex.exercise_id}`);
      }
    } else {
      p0Errors.push(`Missing exercise_id in ${file}`);
    }

    // --- Duplicate slug ---
    if (ex.slug) {
      if (seenSlugs.has(ex.slug)) {
        p0Errors.push(`Duplicate slug "${ex.slug}" in ${file} (also ${seenSlugs.get(ex.slug)})`);
      } else {
        seenSlugs.set(ex.slug, file);
      }
    } else {
      p0Errors.push(`Missing slug in ${file}`);
    }

    // --- Review status ---
    const reviewStatus = ex.metadata?.review_status;
    if (reviewStatus) {
      if (!VALID_REVIEW_STATUSES.has(reviewStatus)) {
        p0Errors.push(`Invalid review_status "${reviewStatus}" in ${file}`);
      }
      statusCounts[reviewStatus] = (statusCounts[reviewStatus] || 0) + 1;
    } else {
      statusCounts['MISSING'] = (statusCounts['MISSING'] || 0) + 1;
      warnings.push(`Missing review_status in ${file}`);
    }

    // --- APPROVED metadata enforcement ---
    if (reviewStatus === 'APPROVED') {
      const { approved_at, approved_by } = ex.metadata || {};
      if (!approved_at) p0Errors.push(`APPROVED exercise missing approved_at: ${file}`);
      if (!approved_by) p0Errors.push(`APPROVED exercise missing approved_by: ${file}`);
    }

    // --- Broken muscle references ---
    const allMuscles = [
      ...(ex.muscles?.primary || []),
      ...(ex.muscles?.secondary || []),
      ...(ex.muscles?.stabilizers || []),
    ];
    for (const m of allMuscles) {
      if (m.muscle_id && !muscleIds.has(m.muscle_id)) {
        p0Errors.push(`Unknown muscle_id ${m.muscle_id} in ${file}`);
      }
    }

    // --- Broken equipment references ---
    for (const eqId of [...(ex.equipment_required || []), ...(ex.equipment_optional || [])]) {
      if (!equipmentIds.has(eqId)) {
        p0Errors.push(`Unknown equipment_id ${eqId} in ${file}`);
      }
    }

    // --- Broken variant slug references ---
    const variants = ex.variants || {};
    for (const list of Object.values(variants)) {
      if (!Array.isArray(list)) continue;
      for (const v of list) {
        if (v.slug && !slugSet.has(v.slug)) {
          warnings.push(`Broken variant slug "${v.slug}" in ${file}`);
        }
      }
    }

    // --- Placeholder text ---
    if (hasPlaceholder(ex)) {
      warnings.push(`Generic placeholder text detected in ${file}`);
    }

    // --- Provenance ---
    if (!ex.metadata?.license) {
      warnings.push(`Missing metadata.license in ${file}`);
    }
  }

  // ---- Report ----
  const total = exercises.length;
  const approvedCount = statusCounts['APPROVED'] || 0;
  const unreviewedCount = statusCounts['UNREVIEWED'] || 0;
  const inReviewCount = statusCounts['IN_REVIEW'] || 0;
  const rejectedCount = statusCounts['REJECTED'] || 0;
  const needsRevisionCount = statusCounts['NEEDS_REVISION'] || 0;
  const missingStatusCount = statusCounts['MISSING'] || 0;

  console.log(`\nDataset version:        ${datasetVersion.version || 'unknown'}`);
  console.log(`Schema version:         ${datasetVersion.schema_version || 'unknown'}`);
  console.log('');
  console.log(`Total exercises:        ${total}`);
  console.log(`  APPROVED:             ${approvedCount}`);
  console.log(`  UNREVIEWED:           ${unreviewedCount}`);
  console.log(`  IN_REVIEW:            ${inReviewCount}`);
  console.log(`  NEEDS_REVISION:       ${needsRevisionCount}`);
  console.log(`  REJECTED:             ${rejectedCount}`);
  if (missingStatusCount > 0) console.log(`  MISSING status:       ${missingStatusCount}`);
  console.log(`  Parse errors:         ${parseErrors.length}`);
  console.log('');
  console.log(`P0 errors:              ${p0Errors.length}`);
  console.log(`Warnings:               ${warnings.length}`);
  console.log(`Production-eligible:    ${approvedCount}`);

  if (parseErrors.length > 0) {
    console.log('\nPARSE ERRORS:');
    parseErrors.forEach(e => console.log(`  ✗ ${e}`));
  }

  if (p0Errors.length > 0) {
    const shown = VERBOSE ? p0Errors : p0Errors.slice(0, 20);
    console.log(`\nP0 ERRORS${!VERBOSE && p0Errors.length > 20 ? ` (showing first 20 of ${p0Errors.length})` : ''}:`);
    shown.forEach(e => console.log(`  ✗ ${e}`));
    if (!VERBOSE && p0Errors.length > 20) console.log('  ... run with --verbose for full list');
  }

  if (warnings.length > 0 && VERBOSE) {
    console.log('\nWARNINGS:');
    warnings.forEach(w => console.log(`  ⚠ ${w}`));
  } else if (warnings.length > 0) {
    console.log(`\n(${warnings.length} warnings — run with --verbose to see them)`);
  }

  // ---- Release recommendation ----
  console.log('\n' + '='.repeat(60));
  const reasons = [];
  if (p0Errors.length > 0) reasons.push(`${p0Errors.length} P0 errors`);
  if (parseErrors.length > 0) reasons.push(`${parseErrors.length} unparseable files`);
  if (missingStatusCount > 0) reasons.push(`${missingStatusCount} exercises with missing review_status`);

  if (reasons.length === 0) {
    console.log('RELEASE RECOMMENDATION: PASS');
    console.log(`Approved dataset contains ${approvedCount} exercises ready for production.`);
    if (approvedCount === 0) {
      console.log('NOTE: 0 exercises are approved. Beta release only — not suitable for production.');
    }
    console.log('='.repeat(60));
    process.exit(0);
  } else {
    console.log('RELEASE RECOMMENDATION: FAIL');
    console.log(`Blockers: ${reasons.join('; ')}`);
    console.log('='.repeat(60));
    process.exit(1);
  }
}

main();
