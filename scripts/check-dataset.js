#!/usr/bin/env node
/**
 * OEI Dataset Health Check
 * Comprehensive health report with a scored summary.
 * Usage: node scripts/check-dataset.js [--verbose]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXERCISES_DIR = path.join(ROOT, 'data', 'exercises');
const MUSCLES_FILE = path.join(ROOT, 'data', 'muscles', 'muscles.json');
const EQUIPMENT_FILE = path.join(ROOT, 'data', 'equipment', 'equipment.json');
const CATEGORIES_FILE = path.join(ROOT, 'data', 'categories', 'categories.json');
const VERSION_FILE = path.join(ROOT, 'data', 'dataset-version.json');

const VERBOSE = process.argv.includes('--verbose');

function loadJSON(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch (e) { return null; }
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

function bar(value, max, width = 20) {
  const filled = Math.round((value / max) * width);
  return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + ']';
}

function main() {
  const muscles = loadJSON(MUSCLES_FILE) || [];
  const equipment = loadJSON(EQUIPMENT_FILE) || [];
  const version = loadJSON(VERSION_FILE);

  const muscleIds = new Set(muscles.map(m => m.muscle_id));
  const equipmentIds = new Set(equipment.map(e => e.equipment_id));

  const files = findExerciseFiles(EXERCISES_DIR);
  const exercises = [];
  const parseErrors = [];

  for (const filePath of files) {
    try {
      exercises.push({ filePath, data: JSON.parse(fs.readFileSync(filePath, 'utf8')) });
    } catch (e) {
      parseErrors.push({ filePath, error: e.message });
    }
  }

  // Category distribution
  const byCategory = {};
  const byDifficulty = {};
  const byMovement = {};
  const seenIds = new Map();
  const seenSlugs = new Map();

  let missingDescription = 0;
  let shortDescription = 0;
  let noSecondaryMuscles = 0;
  let noStabilizers = 0;
  let noTags = 0;
  let noCoachingCues = 0;
  let noCommonMistakes = 0;
  let invalidMuscleRefs = 0;
  let invalidEquipmentRefs = 0;
  let duplicateIds = 0;
  let duplicateSlugs = 0;
  let slugMismatch = 0;

  for (const { filePath, data: ex } of exercises) {
    const filename = path.basename(filePath, '.json');

    byCategory[ex.category] = (byCategory[ex.category] || 0) + 1;
    byDifficulty[ex.difficulty_level] = (byDifficulty[ex.difficulty_level] || 0) + 1;
    byMovement[ex.movement_pattern] = (byMovement[ex.movement_pattern] || 0) + 1;

    if (!ex.description) missingDescription++;
    else if (ex.description.length < 80) shortDescription++;

    const muscles_obj = ex.muscles || {};
    if (!muscles_obj.secondary || muscles_obj.secondary.length === 0) noSecondaryMuscles++;
    if (!muscles_obj.stabilizers || muscles_obj.stabilizers.length === 0) noStabilizers++;

    for (const m of [...(muscles_obj.primary || []), ...(muscles_obj.secondary || []), ...(muscles_obj.stabilizers || [])]) {
      if (m.muscle_id && !muscleIds.has(m.muscle_id)) invalidMuscleRefs++;
    }
    for (const eqId of (ex.equipment_required || [])) {
      if (!equipmentIds.has(eqId)) invalidEquipmentRefs++;
    }

    const meta = ex.metadata || {};
    if (!meta.tags || meta.tags.length === 0) noTags++;

    const exec = ex.execution || {};
    if (!exec.coaching_cues || exec.coaching_cues.length === 0) noCoachingCues++;
    if (!exec.common_mistakes || exec.common_mistakes.length === 0) noCommonMistakes++;

    if (ex.exercise_id) {
      if (seenIds.has(ex.exercise_id)) duplicateIds++;
      else seenIds.set(ex.exercise_id, filePath);
    }
    if (ex.slug) {
      if (seenSlugs.has(ex.slug)) duplicateSlugs++;
      else seenSlugs.set(ex.slug, filePath);
      if (ex.slug !== filename) slugMismatch++;
    }
  }

  const total = exercises.length;

  // --- 4-dimension health scoring ---
  let structuralCount = 0;
  let contentCount = 0;
  let scientificCount = 0;
  let provenanceCount = 0;

  for (const { data: ex } of exercises) {
    // Structural: required fields present with correct types
    if (ex.exercise_id && ex.slug && ex.name && ex.category) structuralCount++;

    // Content completeness
    const exec = ex.execution || {};
    if (
      ex.description && ex.description.length > 0 &&
      (exec.steps || []).length >= 3 &&
      exec.coaching_cues && exec.coaching_cues.length > 0 &&
      exec.common_mistakes && exec.common_mistakes.length > 0
    ) contentCount++;

    // Scientific completeness
    const muscles_obj = ex.muscles || {};
    if (
      muscles_obj.primary && muscles_obj.primary.length > 0 &&
      ex.movement_pattern &&
      ex.force_type
    ) scientificCount++;

    // Provenance completeness
    const meta = ex.metadata || {};
    if (meta.license) provenanceCount++;
  }

  const pct = (n) => total > 0 ? `${(n / total * 100).toFixed(1)}%` : 'N/A';
  const dimScore = (n) => total > 0 ? Math.round((n / total) * 25) : 0;
  const overallDimScore = dimScore(structuralCount) + dimScore(contentCount) + dimScore(scientificCount) + dimScore(provenanceCount);

  console.log('\n' + '='.repeat(60));
  console.log('OEI DATASET HEALTH — 4-DIMENSION BREAKDOWN');
  console.log('='.repeat(60));
  console.log(`Structural validity:     ${structuralCount}/${total} (${pct(structuralCount)})`);
  console.log(`Content completeness:    ${contentCount}/${total} (${pct(contentCount)})`);
  console.log(`Scientific completeness: ${scientificCount}/${total} (${pct(scientificCount)})`);
  console.log(`Provenance completeness: ${provenanceCount}/${total} (${pct(provenanceCount)})`);
  console.log(`Overall health score:    ${overallDimScore}/100`);
  console.log('='.repeat(60));

  // Score: start at 100, deduct per issue category
  let score = 100;
  const deductions = [];

  if (parseErrors.length > 0) { const d = Math.min(30, parseErrors.length * 10); score -= d; deductions.push(`-${d} parse errors (${parseErrors.length})`); }
  if (duplicateIds > 0) { const d = Math.min(20, duplicateIds * 5); score -= d; deductions.push(`-${d} duplicate IDs (${duplicateIds})`); }
  if (duplicateSlugs > 0) { const d = Math.min(20, duplicateSlugs * 5); score -= d; deductions.push(`-${d} duplicate slugs (${duplicateSlugs})`); }
  if (slugMismatch > 0) { const d = Math.min(10, slugMismatch * 2); score -= d; deductions.push(`-${d} slug/filename mismatch (${slugMismatch})`); }
  if (invalidMuscleRefs > 0) { const d = Math.min(15, invalidMuscleRefs * 3); score -= d; deductions.push(`-${d} invalid muscle refs (${invalidMuscleRefs})`); }
  if (invalidEquipmentRefs > 0) { const d = Math.min(10, invalidEquipmentRefs * 2); score -= d; deductions.push(`-${d} invalid equipment refs (${invalidEquipmentRefs})`); }
  if (missingDescription > 0) { const d = Math.min(5, missingDescription); score -= d; deductions.push(`-${d} missing descriptions (${missingDescription})`); }
  score = Math.max(0, score);

  const scoreLabel = score >= 90 ? 'EXCELLENT' : score >= 75 ? 'GOOD' : score >= 50 ? 'FAIR' : 'POOR';

  console.log('\n' + '='.repeat(60));
  console.log('OEI Dataset Health Report');
  console.log('='.repeat(60));

  if (version) {
    console.log(`Dataset version:  ${version.version}`);
    console.log(`Released:         ${version.released_at}`);
  }

  console.log(`\nSUMMARY`);
  console.log(`  Total exercises:    ${total}`);
  console.log(`  Parse errors:       ${parseErrors.length}`);
  console.log(`  Duplicate IDs:      ${duplicateIds}`);
  console.log(`  Duplicate slugs:    ${duplicateSlugs}`);
  console.log(`  Slug mismatches:    ${slugMismatch}`);
  console.log(`  Invalid muscle refs:${invalidMuscleRefs}`);
  console.log(`  Invalid equip refs: ${invalidEquipmentRefs}`);

  console.log(`\nCOMPLETENESS`);
  console.log(`  Missing description:    ${missingDescription} / ${total}`);
  console.log(`  Short description:      ${shortDescription} / ${total}`);
  console.log(`  No secondary muscles:   ${noSecondaryMuscles} / ${total}`);
  console.log(`  No stabilizers:         ${noStabilizers} / ${total}`);
  console.log(`  No tags:                ${noTags} / ${total}`);
  console.log(`  No coaching cues:       ${noCoachingCues} / ${total}`);
  console.log(`  No common mistakes:     ${noCommonMistakes} / ${total}`);

  console.log('\nCATEGORY DISTRIBUTION');
  for (const [cat, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat.padEnd(20)} ${bar(count, total)} ${count}`);
  }

  console.log('\nDIFFICULTY DISTRIBUTION');
  for (const [diff, count] of Object.entries(byDifficulty).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${diff.padEnd(20)} ${bar(count, total)} ${count}`);
  }

  if (VERBOSE) {
    console.log('\nMOVEMENT PATTERN DISTRIBUTION');
    for (const [mp, count] of Object.entries(byMovement).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${mp.padEnd(20)} ${bar(count, total)} ${count}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`HEALTH SCORE: ${score}/100 — ${scoreLabel}`);
  if (deductions.length > 0) {
    console.log('Deductions:');
    for (const d of deductions) console.log(`  ${d}`);
  }
  console.log('='.repeat(60));

  process.exit(score < 70 ? 1 : 0);
}

main();
