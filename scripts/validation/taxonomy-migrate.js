#!/usr/bin/env node
/**
 * OEI Taxonomy Migration Utility
 *
 * Applies explicit taxonomy corrections to exercise files.
 * Safe to run repeatedly (idempotent).
 *
 * Usage:
 *   node scripts/validation/taxonomy-migrate.js          # dry-run (no writes)
 *   node scripts/validation/taxonomy-migrate.js --apply  # apply changes
 *   node scripts/validation/taxonomy-migrate.js --report # write migration report to stdout
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', '..')
const EXERCISES_DIR = path.join(ROOT, 'data', 'exercises')
const DRY_RUN = !process.argv.includes('--apply')
const REPORT_MODE = process.argv.includes('--report')

// ─── Explicit migration maps ──────────────────────────────────────────────────
// Add new entries here when taxonomy changes occur.
// Never remove entries — they serve as a history of migrations.

const MOVEMENT_PATTERN_MIGRATIONS = {
  'hip-hinge': 'hinge',  // 2026-11-08: normalized to canonical form
}

const EXERCISE_TYPE_BY_SLUG = {
  // 2026-11-08: rehabilitation exercises reclassified from 'strength' to structural type
  'band-clamshell-rehab':        'isolation',
  'copenhagen-adduction':        'isolation',
  'dead-bug-rehab':              'compound',
  'face-pull-rehab':             'isolation',
  'glute-med-strengthening':     'isolation',
  'hip-90-90-rotation':          'isolation',
  'nordic-hamstring-eccentric':  'isolation',
  'pallof-press-rehab':          'isolation',
  'prone-y-t-w':                 'isolation',
  'scapular-pushup':             'isolation',
  'side-lying-external-rotation':'isolation',
  'single-leg-balance':          'calisthenics',
  'terminal-knee-extension':     'isolation',
  'wall-angel':                  'isolation',
}

// ─── Load exercises ───────────────────────────────────────────────────────────

function loadAll() {
  const result = []
  for (const cat of fs.readdirSync(EXERCISES_DIR)) {
    const catDir = path.join(EXERCISES_DIR, cat)
    if (!fs.statSync(catDir).isDirectory()) continue
    for (const file of fs.readdirSync(catDir)) {
      if (!file.endsWith('.json')) continue
      const filepath = path.join(catDir, file)
      try {
        result.push({ filepath, data: JSON.parse(fs.readFileSync(filepath, 'utf8')) })
      } catch (e) {
        console.error(`Parse error: ${filepath}: ${e.message}`)
      }
    }
  }
  return result
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const exercises = loadAll()
const migrations = []
let ambiguous = []

for (const { filepath, data } of exercises) {
  const slug = data.slug || path.basename(filepath, '.json')
  const changes = []

  // movement_pattern migration
  const mp = data.movement_pattern
  if (mp && MOVEMENT_PATTERN_MIGRATIONS[mp]) {
    changes.push({
      field: 'movement_pattern',
      old: mp,
      new: MOVEMENT_PATTERN_MIGRATIONS[mp],
      reason: `'${mp}' normalized to canonical form '${MOVEMENT_PATTERN_MIGRATIONS[mp]}'`,
    })
    if (!DRY_RUN) data.movement_pattern = MOVEMENT_PATTERN_MIGRATIONS[mp]
  }

  // exercise_type migration by slug
  if (EXERCISE_TYPE_BY_SLUG[slug]) {
    const current = data.exercise_type
    const target = EXERCISE_TYPE_BY_SLUG[slug]
    if (current !== target) {
      changes.push({
        field: 'exercise_type',
        old: current,
        new: target,
        reason: `Explicit reclassification: '${current}' is not a valid exercise_type enum value`,
      })
      if (!DRY_RUN) data.exercise_type = target
    }
  }

  if (changes.length > 0) {
    migrations.push({ slug, filepath: path.relative(ROOT, filepath), changes })

    if (!DRY_RUN) {
      if (data.metadata) {
        data.metadata.updated_at = new Date().toISOString().replace(/\.\d+Z$/, 'Z')
      }
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n')
    }
  }
}

// ─── Output ───────────────────────────────────────────────────────────────────

if (REPORT_MODE) {
  console.log(JSON.stringify({ migrations, ambiguous }, null, 2))
  process.exit(0)
}

const mode = DRY_RUN ? '[DRY RUN]' : '[APPLIED]'

if (migrations.length === 0) {
  console.log(`${mode} No migrations needed — dataset is up to date`)
  process.exit(0)
}

console.log(`\n${mode} Taxonomy migrations:`)
for (const { slug, changes } of migrations) {
  for (const c of changes) {
    console.log(`  ${slug}: ${c.field} ${c.old} → ${c.new}`)
  }
}

if (ambiguous.length > 0) {
  console.log('\nAmbiguous (requires human review):')
  for (const a of ambiguous) console.log(`  ${a}`)
}

console.log(`\nTotal: ${migrations.length} records${DRY_RUN ? ' (dry run — no files written, pass --apply to apply)' : ' applied'}`)
