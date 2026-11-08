#!/usr/bin/env node
/**
 * OEI Exercise Review Tool
 * Usage:
 *   node scripts/admin/review-exercise.js <slug>              # show exercise for review
 *   node scripts/admin/review-exercise.js <slug> --approve    # mark APPROVED
 *   node scripts/admin/review-exercise.js <slug> --reject --reason "..."  # mark REJECTED
 *   node scripts/admin/review-exercise.js --list-unreviewed   # list all UNREVIEWED
 *   node scripts/admin/review-exercise.js --stats             # count by status
 */

'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../data/exercises');

function findExerciseFile(slug) {
  const entries = fs.readdirSync(DATA_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const candidate = path.join(DATA_DIR, entry.name, slug + '.json');
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
}

function readExercise(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeExercise(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function getAllExerciseFiles() {
  const files = [];
  const entries = fs.readdirSync(DATA_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const catDir = path.join(DATA_DIR, entry.name);
      const catFiles = fs.readdirSync(catDir).filter(f => f.endsWith('.json'));
      for (const f of catFiles) {
        files.push({ category: entry.name, filePath: path.join(catDir, f) });
      }
    }
  }
  return files;
}

function showExercise(slug) {
  const filePath = findExerciseFile(slug);
  if (!filePath) {
    console.error(`Exercise not found: ${slug}`);
    process.exit(1);
  }
  const ex = readExercise(filePath);
  console.log('\n=== Exercise Review ===');
  console.log(`Slug:         ${ex.slug}`);
  console.log(`Name:         ${ex.name}`);
  console.log(`Category:     ${ex.category}`);
  console.log(`Difficulty:   ${ex.difficulty_level}`);
  console.log(`Status:       ${ex.status}`);
  console.log(`Review:       ${ex.metadata && ex.metadata.review_status ? ex.metadata.review_status : 'NOT SET'}`);
  console.log(`\nDescription:\n  ${ex.description}`);
  if (ex.muscles) {
    const primary = (ex.muscles.primary || []).map(m => m.muscle_group || m.muscle_id).join(', ');
    console.log(`\nPrimary muscles: ${primary}`);
  }
  if (ex.execution && ex.execution.steps) {
    console.log('\nExecution steps:');
    ex.execution.steps.forEach((step, i) => console.log(`  ${i + 1}. ${step}`));
  }
  if (ex.metadata && ex.metadata.review_status === 'REJECTED' && ex.metadata.rejected_reason) {
    console.log(`\nRejection reason: ${ex.metadata.rejected_reason}`);
  }
  console.log(`\nFile: ${filePath}`);
}

function approveExercise(slug) {
  const filePath = findExerciseFile(slug);
  if (!filePath) {
    console.error(`Exercise not found: ${slug}`);
    process.exit(1);
  }
  const ex = readExercise(filePath);
  if (!ex.metadata) ex.metadata = {};
  ex.metadata.review_status = 'APPROVED';
  ex.metadata.approved_at = new Date().toISOString();
  ex.metadata.approved_by = 'oei-maintainer';
  ex.metadata.updated_at = new Date().toISOString();
  delete ex.metadata.rejected_reason;
  writeExercise(filePath, ex);
  console.log(`APPROVED: ${slug} (${filePath})`);
}

function rejectExercise(slug, reason) {
  if (!reason) {
    console.error('--reason is required when rejecting');
    process.exit(1);
  }
  const filePath = findExerciseFile(slug);
  if (!filePath) {
    console.error(`Exercise not found: ${slug}`);
    process.exit(1);
  }
  const ex = readExercise(filePath);
  if (!ex.metadata) ex.metadata = {};
  ex.metadata.review_status = 'REJECTED';
  ex.metadata.rejected_reason = reason;
  ex.metadata.updated_at = new Date().toISOString();
  delete ex.metadata.approved_at;
  delete ex.metadata.approved_by;
  writeExercise(filePath, ex);
  console.log(`REJECTED: ${slug} — ${reason}`);
}

function listUnreviewed() {
  const allFiles = getAllExerciseFiles();
  const byCategory = {};
  let total = 0;
  for (const { category, filePath } of allFiles) {
    const ex = readExercise(filePath);
    const status = ex.metadata && ex.metadata.review_status;
    if (!status || status === 'UNREVIEWED') {
      if (!byCategory[category]) byCategory[category] = [];
      byCategory[category].push(ex.slug || path.basename(filePath, '.json'));
      total++;
    }
  }
  console.log(`\nUNREVIEWED exercises (${total} total):\n`);
  for (const [cat, slugs] of Object.entries(byCategory).sort()) {
    console.log(`  ${cat} (${slugs.length}):`);
    for (const s of slugs) console.log(`    - ${s}`);
  }
}

function showStats() {
  const allFiles = getAllExerciseFiles();
  const counts = { UNREVIEWED: 0, IN_REVIEW: 0, APPROVED: 0, REJECTED: 0 };
  for (const { filePath } of allFiles) {
    const ex = readExercise(filePath);
    const status = (ex.metadata && ex.metadata.review_status) || 'UNREVIEWED';
    counts[status] = (counts[status] || 0) + 1;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log('\nDataset review status:');
  console.log(`  Total exercises: ${total}`);
  for (const [status, count] of Object.entries(counts)) {
    const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
    console.log(`  ${status.padEnd(12)}: ${String(count).padStart(4)}  (${pct}%)`);
  }
}

function printUsage() {
  console.log(`
OEI Exercise Review Tool

Usage:
  node scripts/admin/review-exercise.js <slug>                        # show exercise for review
  node scripts/admin/review-exercise.js <slug> --approve              # mark APPROVED
  node scripts/admin/review-exercise.js <slug> --reject --reason "..."  # mark REJECTED
  node scripts/admin/review-exercise.js --list-unreviewed             # list all UNREVIEWED
  node scripts/admin/review-exercise.js --stats                       # count by status
`);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  printUsage();
  process.exit(0);
}

if (args[0] === '--list-unreviewed') {
  listUnreviewed();
} else if (args[0] === '--stats') {
  showStats();
} else {
  const slug = args[0];
  if (args.includes('--approve')) {
    approveExercise(slug);
  } else if (args.includes('--reject')) {
    const reasonIdx = args.indexOf('--reason');
    const reason = reasonIdx !== -1 ? args[reasonIdx + 1] : null;
    rejectExercise(slug, reason);
  } else {
    showExercise(slug);
  }
}
