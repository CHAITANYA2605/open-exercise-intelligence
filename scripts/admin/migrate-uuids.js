#!/usr/bin/env node
/**
 * OEI UUID v4 Migration Script
 * Fixes malformed exercise_id values by replacing them with deterministic UUID v4s
 * derived from the exercise slug via SHA-256.
 *
 * Usage: node scripts/admin/migrate-uuids.js [--dry-run]
 *
 * Idempotent: exercises with valid UUID v4 are never touched.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..', '..');
const EXERCISES_DIR = path.join(ROOT, 'data', 'exercises');
const MIGRATIONS_DIR = path.join(ROOT, 'data', 'migrations');
const MIGRATION_FILE = path.join(MIGRATIONS_DIR, 'uuid-migration-2026-11-08.json');

const DRY_RUN = process.argv.includes('--dry-run');
const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function slugToUUIDv4(slug) {
  const hash = crypto.createHash('sha256').update('oei-v1:' + slug).digest('hex');
  const h = hash.slice(0, 32);
  return [
    h.slice(0, 8),
    h.slice(8, 12),
    '4' + h.slice(13, 16),          // version 4
    (parseInt(h[16], 16) & 3 | 8).toString(16) + h.slice(17, 20), // variant 10xx
    h.slice(20, 32)
  ].join('-');
}

function findExerciseFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findExerciseFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      results.push(full);
    }
  }
  return results;
}

function main() {
  console.log(`OEI UUID v4 Migration${DRY_RUN ? ' (DRY RUN)' : ''}`);
  console.log('='.repeat(50));

  const files = findExerciseFiles(EXERCISES_DIR);
  console.log(`Found ${files.length} exercise files`);

  const mappings = [];
  let fixedCount = 0;
  let alreadyValidCount = 0;
  let errorCount = 0;

  for (const filePath of files) {
    let exercise;
    try {
      exercise = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error(`ERROR: Cannot parse ${filePath}: ${e.message}`);
      errorCount++;
      continue;
    }

    const oldId = exercise.exercise_id;
    const slug = exercise.slug;

    if (!oldId) {
      console.warn(`WARN: No exercise_id in ${filePath}`);
      errorCount++;
      continue;
    }

    if (UUID_V4_RE.test(oldId)) {
      alreadyValidCount++;
      continue;
    }

    // Malformed UUID — generate deterministic replacement
    if (!slug) {
      console.error(`ERROR: No slug in ${filePath}, cannot generate UUID`);
      errorCount++;
      continue;
    }

    const newId = slugToUUIDv4(slug);

    mappings.push({
      slug,
      old_id: oldId,
      new_id: newId,
      file: path.relative(ROOT, filePath)
    });

    if (!DRY_RUN) {
      exercise.exercise_id = newId;
      fs.writeFileSync(filePath, JSON.stringify(exercise, null, 2) + '\n', 'utf8');
    }

    fixedCount++;
  }

  console.log(`\nResults:`);
  console.log(`  Already valid UUID v4: ${alreadyValidCount}`);
  console.log(`  Fixed (malformed):     ${fixedCount}`);
  console.log(`  Errors:                ${errorCount}`);

  if (!DRY_RUN && mappings.length > 0) {
    if (!fs.existsSync(MIGRATIONS_DIR)) {
      fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
    }

    const migrationData = {
      migration_id: 'uuid-v4-fix-2026-11-08',
      created_at: '2026-11-08T00:00:00Z',
      description: 'Corrected malformed exercise_id values to valid UUID v4. Old IDs were structured sequential values using non-hex characters. New IDs are deterministically derived from slug via SHA-256.',
      algorithm: "sha256('oei-v1:' + slug), formatted as UUID v4",
      dry_run: false,
      summary: {
        total_files: files.length,
        fixed: fixedCount,
        already_valid: alreadyValidCount,
        errors: errorCount
      },
      mappings: mappings.map(({ slug, old_id, new_id }) => ({ slug, old_id, new_id }))
    };

    fs.writeFileSync(MIGRATION_FILE, JSON.stringify(migrationData, null, 2) + '\n', 'utf8');
    console.log(`\nMigration mapping written to: ${path.relative(ROOT, MIGRATION_FILE)}`);
  } else if (DRY_RUN) {
    console.log(`\n(Dry run — no files were modified)`);
    if (mappings.length > 0) {
      console.log('\nSample mappings (first 5):');
      mappings.slice(0, 5).forEach(m => {
        console.log(`  ${m.slug}: ${m.old_id} -> ${m.new_id}`);
      });
    }
  }

  console.log('\nDone.');
}

main();
