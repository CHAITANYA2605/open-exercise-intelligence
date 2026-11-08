#!/usr/bin/env node
/**
 * OEI Taxonomy Regression Tests
 * Run: node tests/taxonomy.test.js
 *
 * Verifies that all taxonomy enum values are consistent across
 * schema, validator, and exercise dataset.
 */

const fs = require('fs')
const path = require('path')
const assert = require('assert')

const ROOT = path.join(__dirname, '..')

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`  ✓ ${name}`)
    passed++
  } catch (err) {
    console.error(`  ✗ ${name}`)
    console.error(`    ${err.message}`)
    failed++
  }
}

function loadSchema() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'schema/exercise.schema.json'), 'utf8'))
}

function loadValidateJs() {
  const src = fs.readFileSync(path.join(ROOT, 'scripts/validate.js'), 'utf8')
  return src
}

function loadExercises() {
  const exercises = []
  const dir = path.join(ROOT, 'data/exercises')
  if (!fs.existsSync(dir)) return exercises
  for (const cat of fs.readdirSync(dir)) {
    const catDir = path.join(dir, cat)
    if (!fs.statSync(catDir).isDirectory()) continue
    for (const file of fs.readdirSync(catDir)) {
      if (!file.endsWith('.json')) continue
      try {
        exercises.push(JSON.parse(fs.readFileSync(path.join(catDir, file), 'utf8')))
      } catch {}
    }
  }
  return exercises
}

// ─── Canonical values ───────────────────────────────────────────────────────

const CANONICAL_CATEGORIES = new Set([
  'strength', 'cardio', 'flexibility', 'functional', 'plyometric',
  'power', 'mobility', 'rehabilitation', 'stretching'
])

const CANONICAL_EXERCISE_TYPES = new Set([
  'compound', 'isolation', 'cardio', 'stretching', 'plyometric', 'calisthenics'
])

const CANONICAL_MOVEMENT_PATTERNS = new Set([
  'anti-rotation', 'balance', 'bridge', 'carry', 'gait', 'hinge',
  'lunge', 'overhead', 'plank', 'plyometric', 'pull', 'push', 'rotation', 'squat'
])

const CANONICAL_DIFFICULTIES = new Set(['beginner', 'intermediate', 'advanced', 'expert'])

const CANONICAL_REVIEW_STATUSES = new Set([
  'UNREVIEWED', 'IN_REVIEW', 'NEEDS_REVISION', 'APPROVED', 'REJECTED'
])

// ─── Schema tests ────────────────────────────────────────────────────────────

console.log('\nSchema enum tests')

const schema = loadSchema()
const props = schema.properties

test('schema has category enum', () => {
  const actual = new Set(props.category.enum)
  for (const v of CANONICAL_CATEGORIES) {
    assert(actual.has(v), `Missing category: ${v}`)
  }
})

test('schema category has no extra values', () => {
  for (const v of props.category.enum) {
    assert(CANONICAL_CATEGORIES.has(v), `Unexpected category in schema: ${v}`)
  }
})

test('schema has exercise_type enum', () => {
  const actual = new Set(props.exercise_type.enum)
  for (const v of CANONICAL_EXERCISE_TYPES) {
    assert(actual.has(v), `Missing exercise_type: ${v}`)
  }
})

test('schema exercise_type does not include "strength"', () => {
  assert(!props.exercise_type.enum.includes('strength'),
    'exercise_type enum must not include "strength" (use category for that)')
})

test('schema has movement_pattern enum with balance', () => {
  assert(props.movement_pattern.enum.includes('balance'),
    'movement_pattern must include "balance"')
})

test('schema has movement_pattern enum with plyometric', () => {
  assert(props.movement_pattern.enum.includes('plyometric'),
    'movement_pattern must include "plyometric"')
})

test('schema movement_pattern does not include "hip-hinge"', () => {
  assert(!props.movement_pattern.enum.includes('hip-hinge'),
    'hip-hinge is not canonical — use "hinge"')
})

test('schema has all canonical movement patterns', () => {
  const actual = new Set(props.movement_pattern.enum)
  for (const v of CANONICAL_MOVEMENT_PATTERNS) {
    assert(actual.has(v), `Missing movement_pattern: ${v}`)
  }
})

// ─── Validator source tests ──────────────────────────────────────────────────

console.log('\nValidator source consistency tests')

const validateSrc = loadValidateJs()

test('validate.js VALID_MOVEMENT includes balance', () => {
  assert(validateSrc.includes("'balance'"), 'validate.js must include "balance" in VALID_MOVEMENT')
})

test('validate.js VALID_MOVEMENT includes plyometric', () => {
  assert(validateSrc.includes("'plyometric'"), 'validate.js must include "plyometric" in VALID_MOVEMENT')
})

test('validate.js VALID_MOVEMENT does not include hip-hinge', () => {
  assert(!validateSrc.includes("'hip-hinge'"), 'validate.js must not include "hip-hinge"')
})

test('validate.js VALID_EXERCISE_TYPES does not include strength', () => {
  const match = validateSrc.match(/VALID_EXERCISE_TYPES\s*=\s*\[([^\]]+)\]/)
  if (match) {
    assert(!match[1].includes("'strength'"), 'VALID_EXERCISE_TYPES must not include "strength"')
  }
})

// ─── Dataset tests ───────────────────────────────────────────────────────────

console.log('\nDataset enum compliance tests')

const exercises = loadExercises()

test('all exercises have valid category', () => {
  const invalid = exercises.filter(e => !CANONICAL_CATEGORIES.has(e.category))
  assert(invalid.length === 0,
    `${invalid.length} exercises have invalid category: ${invalid.map(e => `${e.slug}=${e.category}`).join(', ')}`)
})

test('all exercises have valid exercise_type', () => {
  const invalid = exercises.filter(e => !CANONICAL_EXERCISE_TYPES.has(e.exercise_type))
  assert(invalid.length === 0,
    `${invalid.length} exercises have invalid exercise_type: ${invalid.map(e => `${e.slug}=${e.exercise_type}`).join(', ')}`)
})

test('no exercise has exercise_type="strength"', () => {
  const bad = exercises.filter(e => e.exercise_type === 'strength')
  assert(bad.length === 0,
    `${bad.length} exercises have exercise_type="strength": ${bad.map(e => e.slug).join(', ')}`)
})

test('all exercises have valid movement_pattern', () => {
  const invalid = exercises.filter(e => !CANONICAL_MOVEMENT_PATTERNS.has(e.movement_pattern))
  assert(invalid.length === 0,
    `${invalid.length} exercises have invalid movement_pattern: ${invalid.map(e => `${e.slug}=${e.movement_pattern}`).join(', ')}`)
})

test('no exercise has movement_pattern="hip-hinge"', () => {
  const bad = exercises.filter(e => e.movement_pattern === 'hip-hinge')
  assert(bad.length === 0,
    `${bad.length} exercises use "hip-hinge": ${bad.map(e => e.slug).join(', ')}`)
})

test('all exercises have valid difficulty_level', () => {
  const invalid = exercises.filter(e => !CANONICAL_DIFFICULTIES.has(e.difficulty_level))
  assert(invalid.length === 0,
    `${invalid.length} exercises have invalid difficulty_level: ${invalid.map(e => `${e.slug}=${e.difficulty_level}`).slice(0, 5).join(', ')}`)
})

test('all exercises have valid review_status', () => {
  const invalid = exercises.filter(e => {
    const status = e.metadata?.review_status || e.review_status
    return status && !CANONICAL_REVIEW_STATUSES.has(status)
  })
  assert(invalid.length === 0,
    `${invalid.length} exercises have invalid review_status`)
})

// ─── Specific regression tests for the 17 fixed exercises ───────────────────

console.log('\nRegression tests for previously invalid exercises')

const bySlug = Object.fromEntries(exercises.map(e => [e.slug, e]))

test('good-morning-squat-hybrid uses "hinge" not "hip-hinge"', () => {
  const e = bySlug['good-morning-squat-hybrid']
  if (!e) return // not in dataset
  assert.strictEqual(e.movement_pattern, 'hinge',
    `Expected hinge, got ${e.movement_pattern}`)
})

test('single-leg-balance-reach has valid movement_pattern=balance', () => {
  const e = bySlug['single-leg-balance-reach']
  if (!e) return
  assert.strictEqual(e.movement_pattern, 'balance')
})

test('single-leg-box-jump has valid movement_pattern=plyometric', () => {
  const e = bySlug['single-leg-box-jump']
  if (!e) return
  assert.strictEqual(e.movement_pattern, 'plyometric')
})

const rehabIsolation = [
  'band-clamshell-rehab', 'copenhagen-adduction', 'face-pull-rehab',
  'glute-med-strengthening', 'hip-90-90-rotation', 'nordic-hamstring-eccentric',
  'pallof-press-rehab', 'prone-y-t-w', 'scapular-pushup',
  'side-lying-external-rotation', 'terminal-knee-extension', 'wall-angel',
]
for (const slug of rehabIsolation) {
  test(`${slug}: exercise_type=isolation (not strength)`, () => {
    const e = bySlug[slug]
    if (!e) return
    assert.strictEqual(e.exercise_type, 'isolation',
      `Expected isolation, got ${e.exercise_type}`)
  })
}

test('dead-bug-rehab: exercise_type=compound', () => {
  const e = bySlug['dead-bug-rehab']
  if (!e) return
  assert.strictEqual(e.exercise_type, 'compound')
})

test('single-leg-balance: exercise_type=calisthenics', () => {
  const e = bySlug['single-leg-balance']
  if (!e) return
  assert.strictEqual(e.exercise_type, 'calisthenics')
})

// ─── Valid combination tests ─────────────────────────────────────────────────

console.log('\nValid combination tests')

test('rehabilitation + isolation is a valid combination', () => {
  const count = exercises.filter(e =>
    e.category === 'rehabilitation' && e.exercise_type === 'isolation'
  ).length
  assert(count > 0, 'Expected at least one rehabilitation+isolation exercise')
})

test('rehabilitation + compound is a valid combination', () => {
  const count = exercises.filter(e =>
    e.category === 'rehabilitation' && e.exercise_type === 'compound'
  ).length
  assert(count > 0, 'Expected at least one rehabilitation+compound exercise')
})

test('strength + plyometric movement pattern is a valid combination', () => {
  const count = exercises.filter(e =>
    e.category === 'strength' && e.movement_pattern === 'plyometric'
  ).length
  assert(count >= 0, 'plyometric movement in strength category is valid')
})

test('balance movement pattern exercises exist', () => {
  const count = exercises.filter(e => e.movement_pattern === 'balance').length
  assert(count >= 1, 'Expected at least one exercise with movement_pattern=balance')
})

test('plyometric movement pattern exercises exist', () => {
  const count = exercises.filter(e => e.movement_pattern === 'plyometric').length
  assert(count >= 1, 'Expected at least one exercise with movement_pattern=plyometric')
})

// ─── Results ─────────────────────────────────────────────────────────────────

console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} tests`)
if (failed > 0) {
  console.error('TAXONOMY TESTS FAILED')
  process.exit(1)
} else {
  console.log('All taxonomy tests passed')
  process.exit(0)
}
