#!/usr/bin/env node
/**
 * OEI Import: CSV Preview
 * Reads a CSV exported by export-csv.js and shows new vs existing exercises.
 * Does NOT auto-write any files — preview only.
 * Usage: node scripts/import-csv.js --input path/to/exercises.csv [--verbose]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXERCISES_DIR = path.join(ROOT, 'data', 'exercises');

const VERBOSE = process.argv.includes('--verbose');
const inputArg = (() => {
  const idx = process.argv.indexOf('--input');
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

if (!inputArg) {
  console.error('Usage: node scripts/import-csv.js --input path/to/exercises.csv [--verbose]');
  process.exit(1);
}

function findExistingSlugs(dir) {
  const slugs = new Set();
  if (!fs.existsSync(dir)) return slugs;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      for (const s of findExistingSlugs(full)) slugs.add(s);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      slugs.add(path.basename(entry.name, '.json'));
    }
  }
  return slugs;
}

function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',');

  function parseLine(line) {
    const cells = [];
    let inQuote = false;
    let cell = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cell += '"'; i++; }
        else inQuote = !inQuote;
      } else if (ch === ',' && !inQuote) {
        cells.push(cell);
        cell = '';
      } else {
        cell += ch;
      }
    }
    cells.push(cell);
    return cells;
  }

  return lines.slice(1).map(line => {
    const cells = parseLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h.trim()] = (cells[i] || '').trim(); });
    return obj;
  });
}

function main() {
  const csvText = fs.readFileSync(path.resolve(inputArg), 'utf8');
  const rows = parseCSV(csvText);
  const existingSlugs = findExistingSlugs(EXERCISES_DIR);

  const newExercises = [];
  const existingExercises = [];
  const malformed = [];

  for (const row of rows) {
    if (!row.slug) { malformed.push(row); continue; }
    if (existingSlugs.has(row.slug)) existingExercises.push(row);
    else newExercises.push(row);
  }

  console.log('\n' + '='.repeat(60));
  console.log('OEI CSV Import Preview (READ-ONLY — no files written)');
  console.log('='.repeat(60));
  console.log(`Input file:         ${inputArg}`);
  console.log(`Total rows in CSV:  ${rows.length}`);
  console.log(`New exercises:      ${newExercises.length}`);
  console.log(`Already exist:      ${existingExercises.length}`);
  console.log(`Malformed rows:     ${malformed.length}`);

  if (newExercises.length > 0) {
    console.log('\nNew exercises (would be imported):');
    for (const ex of newExercises) {
      console.log(`  + ${ex.slug} (${ex.category}, ${ex.difficulty_level})`);
      if (VERBOSE) console.log(`    name: ${ex.name}`);
    }
  }

  if (VERBOSE && existingExercises.length > 0) {
    console.log('\nAlready existing (would be skipped):');
    for (const ex of existingExercises) {
      console.log(`  = ${ex.slug}`);
    }
  }

  if (malformed.length > 0) {
    console.log('\nMalformed rows (missing slug):');
    for (const row of malformed) {
      console.log(`  ! ${JSON.stringify(row).substring(0, 80)}`);
    }
  }

  console.log('\nThis is a dry run. No files have been written.');
  console.log('To create exercise files, write them manually using the exercise JSON schema.');
}

main();
