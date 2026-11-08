#!/usr/bin/env node
/**
 * OEI Export: CSV
 * Exports all exercises as CSV. Multi-value fields (muscles, equipment) are pipe-separated.
 * Usage: node scripts/export-csv.js [--output path/to/output.csv]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXERCISES_DIR = path.join(ROOT, 'data', 'exercises');

const outputArg = (() => {
  const idx = process.argv.indexOf('--output');
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

const COLUMNS = [
  'exercise_id', 'slug', 'name', 'category', 'exercise_type',
  'difficulty_level', 'movement_pattern', 'force_type', 'mechanics_type',
  'laterality', 'exercise_family', 'status',
  'primary_muscles', 'secondary_muscles', 'stabilizer_muscles',
  'equipment_required', 'equipment_optional',
  'training_goals', 'description',
];

function csvCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
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

function extractRow(exercise) {
  const muscles = exercise.muscles || {};
  const primary = (muscles.primary || []).map(m => m.muscle_slug).join('|');
  const secondary = (muscles.secondary || []).map(m => m.muscle_slug).join('|');
  const stabilizers = (muscles.stabilizers || []).map(m => m.muscle_slug).join('|');

  const tp = exercise.training_parameters || {};
  const goals = (tp.training_goals || []).join('|');

  return [
    exercise.exercise_id,
    exercise.slug,
    exercise.name,
    exercise.category,
    exercise.exercise_type,
    exercise.difficulty_level,
    exercise.movement_pattern,
    exercise.force_type,
    exercise.mechanics_type,
    exercise.laterality,
    exercise.exercise_family,
    exercise.status,
    primary,
    secondary,
    stabilizers,
    (exercise.equipment_required || []).join('|'),
    (exercise.equipment_optional || []).join('|'),
    goals,
    exercise.description,
  ];
}

function main() {
  const files = findExerciseFiles(EXERCISES_DIR);
  const rows = [COLUMNS.join(',')];

  let count = 0;
  for (const filePath of files.sort()) {
    try {
      const exercise = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      rows.push(extractRow(exercise).map(csvCell).join(','));
      count++;
    } catch (e) {
      process.stderr.write(`WARN: Skipping ${filePath}: ${e.message}\n`);
    }
  }

  const csv = rows.join('\n') + '\n';

  if (outputArg) {
    fs.writeFileSync(path.resolve(outputArg), csv, 'utf8');
    console.log(`Exported ${count} exercises to ${outputArg}`);
  } else {
    process.stdout.write(csv);
    process.stderr.write(`Exported ${count} exercises\n`);
  }
}

main();
