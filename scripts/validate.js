#!/usr/bin/env node
/**
 * OEI Dataset Validator
 * Zero external dependencies. Validates all exercise JSON files.
 * Usage: node scripts/validate.js [--verbose] [--file path/to/exercise.json]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXERCISES_DIR = path.join(ROOT, 'data', 'exercises');
const MUSCLES_FILE = path.join(ROOT, 'data', 'muscles', 'muscles.json');
const EQUIPMENT_FILE = path.join(ROOT, 'data', 'equipment', 'equipment.json');

const VERBOSE = process.argv.includes('--verbose');
const fileArg = (() => {
  const idx = process.argv.indexOf('--file');
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

// data/taxonomy/categories.json is the authoritative category source of truth
const VALID_CATEGORIES = ['strength','cardio','flexibility','functional','plyometric','power','mobility','rehabilitation','stretching'];
const VALID_EXERCISE_TYPES = ['compound','isolation','cardio','stretching','plyometric','calisthenics'];
const VALID_DIFFICULTY = ['beginner','intermediate','advanced','expert'];
const VALID_MOVEMENT = ['anti-rotation','balance','bridge','carry','gait','hinge','lunge','overhead','plank','plyometric','pull','push','rotation','squat'];
const VALID_FORCE = ['push','pull','static'];
const VALID_MECHANICS = ['compound','isolation'];
const VALID_LATERALITY = ['bilateral','unilateral','alternating'];
const VALID_STATUS = ['draft','active','deprecated'];
const VALID_REVIEW_STATUSES = new Set(['UNREVIEWED','IN_REVIEW','APPROVED','REJECTED','NEEDS_REVISION']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9-]+$/;

function loadJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`ERROR: Cannot parse JSON in ${filePath}: ${e.message}`);
    process.exit(1);
  }
}

function findExerciseFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findExerciseFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'README.md') {
      results.push(full);
    }
  }
  return results;
}

function validateExercise(filePath, exercise, muscleIds, equipmentIds, errors) {
  const rel = path.relative(ROOT, filePath);
  const filename = path.basename(filePath, '.json');

  function err(msg) {
    errors.push({ file: rel, message: msg });
    if (VERBOSE) console.log(`  ✗ ${msg}`);
  }

  // exercise_id
  if (!exercise.exercise_id) {
    err('Missing exercise_id');
  } else if (!UUID_RE.test(exercise.exercise_id)) {
    err(`Invalid UUID format for exercise_id: ${exercise.exercise_id}`);
  }

  // slug
  if (!exercise.slug) {
    err('Missing slug');
  } else {
    if (!SLUG_RE.test(exercise.slug)) err(`Slug contains invalid characters: ${exercise.slug}`);
    if (exercise.slug !== filename) err(`Slug "${exercise.slug}" does not match filename "${filename}"`);
  }

  // name
  if (!exercise.name || exercise.name.trim().length === 0) err('Missing or empty name');

  // description
  if (!exercise.description) {
    err('Missing description');
  } else if (exercise.description.length < 80) {
    err(`Description too short (${exercise.description.length} chars, min 80)`);
  }

  // enum fields
  if (!VALID_CATEGORIES.includes(exercise.category)) err(`Invalid category: ${exercise.category}`);
  if (!VALID_EXERCISE_TYPES.includes(exercise.exercise_type)) err(`Invalid exercise_type: ${exercise.exercise_type}`);
  if (!VALID_DIFFICULTY.includes(exercise.difficulty_level)) err(`Invalid difficulty_level: ${exercise.difficulty_level}`);
  if (!VALID_MOVEMENT.includes(exercise.movement_pattern)) err(`Invalid movement_pattern: ${exercise.movement_pattern}`);
  if (!VALID_FORCE.includes(exercise.force_type)) err(`Invalid force_type: ${exercise.force_type}`);
  if (!VALID_MECHANICS.includes(exercise.mechanics_type)) err(`Invalid mechanics_type: ${exercise.mechanics_type}`);
  if (!VALID_LATERALITY.includes(exercise.laterality)) err(`Invalid laterality: ${exercise.laterality}`);
  if (!VALID_STATUS.includes(exercise.status)) err(`Invalid status: ${exercise.status}`);

  // muscles
  if (!exercise.muscles || typeof exercise.muscles !== 'object') {
    err('Missing muscles object');
  } else {
    const { primary = [], secondary = [], stabilizers = [] } = exercise.muscles;
    if (!Array.isArray(primary) || primary.length === 0) err('No primary muscles defined');
    for (const m of [...primary, ...secondary, ...stabilizers]) {
      if (!m.muscle_id) { err('Muscle entry missing muscle_id'); continue; }
      if (!muscleIds.has(m.muscle_id)) err(`Unknown muscle_id: ${m.muscle_id}`);
    }
  }

  // equipment
  if (!Array.isArray(exercise.equipment_required)) {
    err('Missing equipment_required array');
  } else {
    for (const eqId of exercise.equipment_required) {
      if (!equipmentIds.has(eqId)) err(`Unknown equipment_id: ${eqId}`);
    }
  }

  // execution
  if (!exercise.execution || typeof exercise.execution !== 'object') {
    err('Missing execution object');
  } else {
    const ex = exercise.execution;
    if (!ex.starting_position) err('Missing execution.starting_position');
    if (!Array.isArray(ex.steps) || ex.steps.length < 2) err('execution.steps must have at least 2 steps');
  }

  // training_parameters
  if (!exercise.training_parameters || !Array.isArray(exercise.training_parameters.training_goals) || exercise.training_parameters.training_goals.length === 0) {
    err('Missing or empty training_parameters.training_goals');
  }

  // review_status enforcement
  if (exercise.metadata) {
    const { review_status, approved_at, approved_by, review_notes } = exercise.metadata;
    if (review_status && !VALID_REVIEW_STATUSES.has(review_status)) {
      err(`Invalid review_status: ${review_status}`);
    }
    if (review_status === 'APPROVED') {
      if (!approved_at || typeof approved_at !== 'string' || approved_at.trim() === '') {
        err('APPROVED exercise must have metadata.approved_at');
      }
      if (!approved_by || typeof approved_by !== 'string' || approved_by.trim() === '') {
        err('APPROVED exercise must have metadata.approved_by');
      }
    }
    if (review_status === 'NEEDS_REVISION') {
      if (!review_notes || typeof review_notes !== 'string' || review_notes.trim() === '') {
        err('NEEDS_REVISION exercise must have metadata.review_notes explaining required changes');
      }
    }
  }
}

function main() {
  const muscles = loadJSON(MUSCLES_FILE);
  const equipment = loadJSON(EQUIPMENT_FILE);

  const muscleIds = new Set(muscles.map(m => m.muscle_id));
  const equipmentIds = new Set(equipment.map(e => e.equipment_id));

  let filePaths;
  if (fileArg) {
    filePaths = [path.resolve(fileArg)];
  } else {
    filePaths = findExerciseFiles(EXERCISES_DIR).filter(f => !f.endsWith('README.md'));
  }

  const seenIds = new Map();
  const seenSlugs = new Map();
  const allErrors = [];
  let validCount = 0;

  for (const filePath of filePaths) {
    const rel = path.relative(ROOT, filePath);
    if (VERBOSE) console.log(`\nValidating: ${rel}`);

    let exercise;
    try {
      exercise = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      allErrors.push({ file: rel, message: `JSON parse error: ${e.message}` });
      continue;
    }

    const fileErrors = [];
    validateExercise(filePath, exercise, muscleIds, equipmentIds, fileErrors);

    // duplicate checks
    if (exercise.exercise_id) {
      if (seenIds.has(exercise.exercise_id)) {
        fileErrors.push({ file: rel, message: `Duplicate exercise_id: ${exercise.exercise_id} (also in ${seenIds.get(exercise.exercise_id)})` });
      } else {
        seenIds.set(exercise.exercise_id, rel);
      }
    }
    if (exercise.slug) {
      if (seenSlugs.has(exercise.slug)) {
        fileErrors.push({ file: rel, message: `Duplicate slug: ${exercise.slug} (also in ${seenSlugs.get(exercise.slug)})` });
      } else {
        seenSlugs.set(exercise.slug, rel);
      }
    }

    allErrors.push(...fileErrors);
    if (fileErrors.length === 0) validCount++;
  }

  console.log('\n' + '='.repeat(60));
  console.log('OEI Dataset Validation Report');
  console.log('='.repeat(60));
  console.log(`Total exercises scanned: ${filePaths.length}`);
  console.log(`Valid:                   ${validCount}`);
  console.log(`With errors:             ${filePaths.length - validCount}`);
  console.log(`Total errors:            ${allErrors.length}`);

  if (allErrors.length > 0) {
    console.log('\nErrors:');
    for (const e of allErrors) {
      console.log(`  [${e.file}] ${e.message}`);
    }
    process.exit(1);
  } else {
    console.log('\n✓ All exercises passed validation.');
    process.exit(0);
  }
}

main();
