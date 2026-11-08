#!/usr/bin/env node
/**
 * OEI Export: Flat JSON
 * Exports all exercises as a single flat JSON array.
 * Usage: node scripts/export-flat-json.js [--output path/to/output.json] [--pretty]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXERCISES_DIR = path.join(ROOT, 'data', 'exercises');

const PRETTY = process.argv.includes('--pretty');
const outputArg = (() => {
  const idx = process.argv.indexOf('--output');
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

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

function main() {
  const files = findExerciseFiles(EXERCISES_DIR);
  const exercises = [];

  for (const filePath of files) {
    try {
      const exercise = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      exercises.push(exercise);
    } catch (e) {
      console.error(`WARN: Skipping ${filePath}: ${e.message}`);
    }
  }

  exercises.sort((a, b) => (a.slug || '').localeCompare(b.slug || ''));

  const output = {
    generated_at: new Date().toISOString(),
    exercise_count: exercises.length,
    exercises,
  };

  const json = PRETTY ? JSON.stringify(output, null, 2) : JSON.stringify(output);

  if (outputArg) {
    fs.writeFileSync(path.resolve(outputArg), json, 'utf8');
    console.log(`Exported ${exercises.length} exercises to ${outputArg}`);
  } else {
    process.stdout.write(json);
    process.stderr.write(`\nExported ${exercises.length} exercises\n`);
  }
}

main();
