#!/usr/bin/env node
/**
 * OEI Dataset Analytics Report
 * Usage: node scripts/analytics/dataset-report.js [--json]
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', '..')
const EXERCISES_DIR = path.join(ROOT, 'data', 'exercises')
const MUSCLES_FILE = path.join(ROOT, 'data', 'muscles', 'muscles.json')
const EQUIPMENT_FILE = path.join(ROOT, 'data', 'equipment', 'equipment.json')

function loadExercises() {
  const exercises = []
  const categories = fs.readdirSync(EXERCISES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)

  for (const cat of categories) {
    const catDir = path.join(EXERCISES_DIR, cat)
    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.json'))
    for (const file of files) {
      try {
        const ex = JSON.parse(fs.readFileSync(path.join(catDir, file), 'utf8'))
        exercises.push(ex)
      } catch {}
    }
  }
  return exercises
}

function countBy(arr, fn) {
  const counts = {}
  for (const item of arr) {
    const key = fn(item)
    if (key !== undefined && key !== null) {
      counts[key] = (counts[key] || 0) + 1
    }
  }
  return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1]))
}

function bar(value, max, width = 20) {
  const filled = Math.round((value / max) * width)
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

function pct(n, total) {
  return total === 0 ? '0%' : `${Math.round((n / total) * 100)}%`
}

function main() {
  const jsonMode = process.argv.includes('--json')
  const exercises = loadExercises()
  const total = exercises.length

  // --- By category ---
  const byCategory = countBy(exercises, e => e.category)

  // --- By difficulty ---
  const byDifficulty = countBy(exercises, e => e.difficulty)

  // --- By review_status ---
  const byStatus = countBy(exercises, e =>
    e.metadata?.review_status || e.review_status || 'MISSING'
  )

  // --- By movement_pattern ---
  const byMovement = countBy(exercises, e => e.movement_pattern)

  // --- Primary muscle coverage ---
  const muscleCounts = {}
  for (const ex of exercises) {
    for (const m of (ex.muscles?.primary || [])) {
      const id = typeof m === 'string' ? m : m.muscle_id
      muscleCounts[id] = (muscleCounts[id] || 0) + 1
    }
  }

  // --- Content completeness ---
  let missingInstructions = 0
  let missingPrimaryMuscles = 0
  let missingSecondaryMuscles = 0
  let missingStabilizers = 0
  let missingEquipment = 0
  let missingTags = 0
  let missingProvenance = 0
  let missingBreathing = 0
  let missingCoachingCues = 0
  let missingCommonMistakes = 0
  let shortDescription = 0

  for (const ex of exercises) {
    const steps = ex.execution?.steps || ex.instructions?.steps || []
    if (steps.length < 3) missingInstructions++
    if (!ex.muscles?.primary?.length) missingPrimaryMuscles++
    if (!ex.muscles?.secondary?.length) missingSecondaryMuscles++
    if (!ex.muscles?.stabilizers?.length) missingStabilizers++
    if (!ex.equipment?.required?.length && !ex.equipment?.optional?.length) missingEquipment++
    if (!ex.tags?.length) missingTags++
    if (!ex.metadata?.license) missingProvenance++
    if (!ex.execution?.breathing && !ex.instructions?.breathing) missingBreathing++
    if (!ex.execution?.coaching_cues?.length && !ex.instructions?.coaching_cues?.length) missingCoachingCues++
    if (!ex.execution?.common_mistakes?.length && !ex.instructions?.common_mistakes?.length) missingCommonMistakes++
    const desc = ex.description || ''
    if (desc.length < 50) shortDescription++
  }

  // --- Without alternatives ---
  const noVariants = exercises.filter(e =>
    !Object.values(e.variants || {}).some(v => Array.isArray(v) && v.length > 0) &&
    !(e.relationships?.length)
  ).length

  const report = {
    generated_at: new Date().toISOString(),
    total_exercises: total,
    by_category: byCategory,
    by_difficulty: byDifficulty,
    by_review_status: byStatus,
    by_movement_pattern: byMovement,
    production_eligible: byStatus['APPROVED'] || 0,
    content_gaps: {
      missing_instructions: missingInstructions,
      missing_primary_muscles: missingPrimaryMuscles,
      missing_secondary_muscles: missingSecondaryMuscles,
      missing_stabilizers: missingStabilizers,
      missing_equipment_data: missingEquipment,
      missing_tags: missingTags,
      missing_provenance: missingProvenance,
      missing_breathing_guidance: missingBreathing,
      missing_coaching_cues: missingCoachingCues,
      missing_common_mistakes: missingCommonMistakes,
      short_description_under_50_chars: shortDescription,
      no_alternatives_or_variants: noVariants,
    },
    top_primary_muscles_by_coverage: Object.entries(muscleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, count]) => ({ muscle_id: id, exercise_count: count })),
    underrepresented_categories: Object.entries(byCategory)
      .filter(([, n]) => n < 20)
      .map(([cat, n]) => ({ category: cat, exercise_count: n })),
  }

  if (jsonMode) {
    console.log(JSON.stringify(report, null, 2))
    return
  }

  const sep = '─'.repeat(60)
  console.log('\n' + sep)
  console.log('  OEI Dataset Analytics Report')
  console.log('  Generated: ' + new Date().toISOString().split('T')[0])
  console.log(sep)

  console.log(`\nTotal exercises: ${total}`)
  console.log(`Production-eligible (APPROVED): ${report.production_eligible}`)

  console.log('\n── By Category ' + '─'.repeat(44))
  const maxCat = Math.max(...Object.values(byCategory))
  for (const [cat, n] of Object.entries(byCategory)) {
    console.log(`  ${cat.padEnd(16)} ${bar(n, maxCat)} ${String(n).padStart(4)} (${pct(n, total)})`)
  }

  console.log('\n── By Difficulty ' + '─'.repeat(42))
  const maxDiff = Math.max(...Object.values(byDifficulty))
  for (const [d, n] of Object.entries(byDifficulty)) {
    console.log(`  ${d.padEnd(16)} ${bar(n, maxDiff)} ${String(n).padStart(4)} (${pct(n, total)})`)
  }

  console.log('\n── By Review Status ' + '─'.repeat(39))
  for (const [s, n] of Object.entries(byStatus)) {
    console.log(`  ${s.padEnd(16)} ${String(n).padStart(4)} (${pct(n, total)})`)
  }

  console.log('\n── Content Gaps ' + '─'.repeat(43))
  const gaps = report.content_gaps
  for (const [key, n] of Object.entries(gaps)) {
    const label = key.replace(/_/g, ' ').padEnd(36)
    const flag = n > 0 ? '⚠' : '✓'
    console.log(`  ${flag} ${label} ${String(n).padStart(4)} exercises`)
  }

  if (report.underrepresented_categories.length > 0) {
    console.log('\n── Underrepresented Categories (< 20 exercises) ' + '─'.repeat(10))
    for (const { category, exercise_count } of report.underrepresented_categories) {
      console.log(`  ${category.padEnd(16)} ${exercise_count} exercises`)
    }
  }

  console.log('\n' + sep)
  console.log('  Run with --json for machine-readable output')
  console.log(sep + '\n')
}

main()
