#!/usr/bin/env node
/**
 * OEI Admin — review-submission.js
 *
 * Usage:
 *   node scripts/admin/review-submission.js <submission-file>
 *   node scripts/admin/review-submission.js <submission-file> --approve
 *   node scripts/admin/review-submission.js <submission-file> --reject --reason "Reason text"
 *
 * Zero external dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
Usage:
  node scripts/admin/review-submission.js <submission-file> [--approve|--reject] [--reason "..."]

Modes:
  (no flag)   Print a detailed review report
  --approve   Copy submission to data/exercises/<category>/, update dataset-version.json
  --reject    Log rejection to community/reviews/<slug>-rejected.json

Examples:
  node scripts/admin/review-submission.js community/submissions/my-exercise.json
  node scripts/admin/review-submission.js community/submissions/my-exercise.json --approve
  node scripts/admin/review-submission.js community/submissions/my-exercise.json --reject --reason "Missing required muscles"
`);
  process.exit(0);
}

const submissionFile = args[0];
const approve = args.includes('--approve');
const reject = args.includes('--reject');
const reasonIdx = args.indexOf('--reason');
const reason = reasonIdx !== -1 ? args[reasonIdx + 1] : null;

if (approve && reject) {
  console.error('Error: Cannot use --approve and --reject together.');
  process.exit(1);
}
if (reject && !reason) {
  console.error('Error: --reject requires --reason "..."');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'data');
const EXERCISES_DIR = path.join(DATA_DIR, 'exercises');
const MUSCLES_FILE = path.join(DATA_DIR, 'muscles', 'muscles.json');
const EQUIPMENT_FILE = path.join(DATA_DIR, 'equipment', 'equipment.json');
const DATASET_VERSION_FILE = path.join(DATA_DIR, 'dataset-version.json');
const COMMUNITY_REVIEWS_DIR = path.join(ROOT, 'community', 'reviews');

// ---------------------------------------------------------------------------
// Load reference data
// ---------------------------------------------------------------------------
function loadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`Failed to parse ${filePath}: ${e.message}`);
    return null;
  }
}

function collectSlugs(dir, ext) {
  const slugs = new Set();
  if (!fs.existsSync(dir)) return slugs;
  function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith(ext)) {
        try {
          const obj = JSON.parse(fs.readFileSync(full, 'utf8'));
          if (obj.slug) slugs.add(obj.slug);
        } catch (_) {}
      }
    }
  }
  walk(dir);
  return slugs;
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const VALID_CATEGORIES = ['strength', 'cardio', 'flexibility', 'balance', 'plyometric', 'sport', 'rehabilitation'];
const VALID_EXERCISE_TYPES = ['compound', 'isolation', 'cardio', 'stretching', 'plyometric', 'calisthenics'];
const VALID_DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'elite'];
const VALID_MOVEMENT_PATTERNS = ['push', 'pull', 'hinge', 'squat', 'carry', 'rotation', 'gait', 'isometric', 'other'];
const VALID_LATERALITIES = ['bilateral', 'unilateral_left', 'unilateral_right', 'unilateral_alternating', 'unilateral_either'];
const VALID_ACTIVATION_LEVELS = ['very_high', 'high', 'moderate', 'low'];

function validate(submission, muscleSet, equipmentSet, existingSlugs) {
  const issues = [];
  const warnings = [];

  function check(condition, msg, isWarning = false) {
    if (!condition) {
      if (isWarning) warnings.push(msg);
      else issues.push(msg);
    }
  }

  // Required fields
  check(submission.exercise_id && UUID_RE.test(submission.exercise_id), `exercise_id must be a valid UUID v4; got: ${submission.exercise_id}`);
  check(submission.slug && SLUG_RE.test(submission.slug), `slug must match ^[a-z0-9]+(-[a-z0-9]+)*$; got: ${submission.slug}`);
  check(submission.name && typeof submission.name === 'string' && submission.name.length >= 2, 'name is required (min 2 chars)');
  check(submission.description && submission.description.length >= 50, `description must be at least 50 chars; got ${(submission.description || '').length}`);
  check(VALID_CATEGORIES.includes(submission.category), `category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  check(VALID_EXERCISE_TYPES.includes(submission.exercise_type), `exercise_type must be one of: ${VALID_EXERCISE_TYPES.join(', ')}`);
  check(VALID_DIFFICULTIES.includes(submission.difficulty_level), `difficulty_level must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
  check(VALID_MOVEMENT_PATTERNS.includes(submission.movement_pattern), `movement_pattern must be one of: ${VALID_MOVEMENT_PATTERNS.join(', ')}`);
  check(VALID_LATERALITIES.includes(submission.laterality), `laterality must be one of: ${VALID_LATERALITIES.join(', ')}`);
  check(submission.status === 'active', `status must be 'active' for new submissions`);

  // Muscles
  if (!submission.muscles || !Array.isArray(submission.muscles.primary) || submission.muscles.primary.length === 0) {
    issues.push('muscles.primary must be a non-empty array');
  } else {
    submission.muscles.primary.forEach((m, i) => {
      check(m.muscle_slug && muscleSet.has(m.muscle_slug), `muscles.primary[${i}].muscle_slug '${m.muscle_slug}' not found in data/muscles/muscles.json`);
      check(VALID_ACTIVATION_LEVELS.includes(m.activation_level), `muscles.primary[${i}].activation_level must be one of: ${VALID_ACTIVATION_LEVELS.join(', ')}`);
    });
  }

  // Execution
  if (!submission.execution) {
    issues.push('execution is required');
  } else {
    check(submission.execution.setup && submission.execution.setup.length > 10, 'execution.setup is required');
    check(Array.isArray(submission.execution.steps) && submission.execution.steps.length >= 2, 'execution.steps must have at least 2 steps');
  }

  // Metadata
  if (!submission.metadata) {
    issues.push('metadata is required');
  } else {
    check(submission.metadata.license === 'CC0-1.0', `metadata.license must be 'CC0-1.0'; got: ${submission.metadata.license}`);
    check(submission.metadata.source === 'community_submission', `metadata.source must be 'community_submission'`);
    check(submission.metadata.contributor && submission.metadata.contributor.length > 0, 'metadata.contributor is required');
  }

  // Duplicate slug check
  if (submission.slug && existingSlugs.has(submission.slug)) {
    issues.push(`slug '${submission.slug}' already exists in the dataset`);
  }

  // Equipment check
  if (submission.equipment && submission.equipment.required) {
    submission.equipment.required.forEach((eq, i) => {
      if (typeof eq === 'string') {
        check(equipmentSet.has(eq), `equipment.required[${i}] '${eq}' not found in data/equipment/equipment.json`, true);
      }
    });
  }

  // Warnings for optional but recommended fields
  if (!submission.execution || !submission.execution.coaching_cues || submission.execution.coaching_cues.length === 0) {
    warnings.push('execution.coaching_cues is empty — consider adding at least one coaching cue');
  }
  if (!submission.safety || !submission.safety.contraindications || submission.safety.contraindications.length === 0) {
    warnings.push('safety.contraindications is empty — consider documenting any contraindications');
  }
  if (!submission.tags || submission.tags.length === 0) {
    warnings.push('tags is empty — tags improve searchability');
  }

  return { issues, warnings };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  const submissionPath = path.resolve(submissionFile);
  if (!fs.existsSync(submissionPath)) {
    console.error(`Error: File not found: ${submissionPath}`);
    process.exit(1);
  }

  let submission;
  try {
    submission = JSON.parse(fs.readFileSync(submissionPath, 'utf8'));
  } catch (e) {
    console.error(`Error: Invalid JSON in ${submissionPath}: ${e.message}`);
    process.exit(1);
  }

  // Load reference data
  const musclesData = loadJson(MUSCLES_FILE);
  const muscleSet = new Set();
  if (musclesData && Array.isArray(musclesData.muscles)) {
    musclesData.muscles.forEach(m => { if (m.slug) muscleSet.add(m.slug); });
  }

  const equipmentData = loadJson(EQUIPMENT_FILE);
  const equipmentSet = new Set();
  if (equipmentData && Array.isArray(equipmentData.equipment)) {
    equipmentData.equipment.forEach(e => { if (e.slug) equipmentSet.add(e.slug); });
  }

  const existingSlugs = collectSlugs(EXERCISES_DIR, '.json');

  const { issues, warnings } = validate(submission, muscleSet, equipmentSet, existingSlugs);

  // ---------------------------------------------------------------------------
  // Review mode (no flag)
  // ---------------------------------------------------------------------------
  if (!approve && !reject) {
    console.log('\n' + '='.repeat(70));
    console.log('OEI Submission Review Report');
    console.log('='.repeat(70));
    console.log(`File:       ${submissionPath}`);
    console.log(`Slug:       ${submission.slug || '(missing)'}`);
    console.log(`Name:       ${submission.name || '(missing)'}`);
    console.log(`Category:   ${submission.category || '(missing)'}`);
    console.log(`Difficulty: ${submission.difficulty_level || '(missing)'}`);
    console.log(`Contributor:${submission.metadata ? submission.metadata.contributor : '(missing)'}`);
    console.log(`License:    ${submission.metadata ? submission.metadata.license : '(missing)'}`);
    console.log('');

    // Field summary
    console.log('Fields present:');
    const topKeys = Object.keys(submission).filter(k => !k.startsWith('_'));
    topKeys.forEach(k => console.log(`  [x] ${k}`));
    console.log('');

    // Muscles
    if (submission.muscles && submission.muscles.primary) {
      console.log('Primary muscles:');
      submission.muscles.primary.forEach(m => {
        const known = muscleSet.has(m.muscle_slug);
        console.log(`  [${known ? 'OK' : '!!'}] ${m.muscle_slug} (${m.activation_level}) ${known ? '' : '<< NOT FOUND IN REGISTRY'}`);
      });
    }
    if (submission.muscles && submission.muscles.secondary && submission.muscles.secondary.length > 0) {
      console.log('Secondary muscles:');
      submission.muscles.secondary.forEach(m => {
        const known = muscleSet.has(m.muscle_slug);
        console.log(`  [${known ? 'OK' : '!!'}] ${m.muscle_slug} (${m.activation_level}) ${known ? '' : '<< NOT FOUND IN REGISTRY'}`);
      });
    }
    console.log('');

    // Equipment
    if (submission.equipment && submission.equipment.required && submission.equipment.required.length > 0) {
      console.log('Required equipment:');
      submission.equipment.required.forEach(eq => {
        const known = equipmentSet.has(eq);
        console.log(`  [${known ? 'OK' : '!!'}] ${eq} ${known ? '' : '<< NOT FOUND IN REGISTRY'}`);
      });
      console.log('');
    }

    // Validation results
    if (issues.length === 0 && warnings.length === 0) {
      console.log('Validation: PASSED — no issues found.');
    } else {
      if (issues.length > 0) {
        console.log(`Errors (${issues.length}) — must be fixed before approval:`);
        issues.forEach(i => console.log(`  [ERROR] ${i}`));
        console.log('');
      }
      if (warnings.length > 0) {
        console.log(`Warnings (${warnings.length}) — recommended to address:`);
        warnings.forEach(w => console.log(`  [WARN]  ${w}`));
      }
    }

    console.log('');
    console.log('Duplicate slug check:', existingSlugs.has(submission.slug) ? 'CONFLICT — slug exists' : 'OK — slug is unique');
    console.log('');
    if (issues.length === 0) {
      console.log('Ready for approval? YES  — run with --approve to merge');
    } else {
      console.log('Ready for approval? NO   — fix errors above, then re-run');
    }
    console.log('='.repeat(70));
    return;
  }

  // ---------------------------------------------------------------------------
  // Approve mode
  // ---------------------------------------------------------------------------
  if (approve) {
    if (issues.length > 0) {
      console.error('\nCannot approve — submission has validation errors:');
      issues.forEach(i => console.error(`  [ERROR] ${i}`));
      console.error('\nFix errors and try again.');
      process.exit(1);
    }

    const category = submission.category;
    const categoryDir = path.join(EXERCISES_DIR, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    const destFile = path.join(categoryDir, `${submission.slug}.json`);
    if (fs.existsSync(destFile)) {
      console.error(`Error: ${destFile} already exists. Use a correction instead.`);
      process.exit(1);
    }

    // Strip _instructions/_comment helper keys
    const clean = JSON.parse(JSON.stringify(submission));
    function stripHelperKeys(obj) {
      if (typeof obj !== 'object' || obj === null) return obj;
      if (Array.isArray(obj)) return obj.map(stripHelperKeys);
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([k]) => !k.startsWith('_'))
          .map(([k, v]) => [k, stripHelperKeys(v)])
      );
    }
    const stripped = stripHelperKeys(clean);

    fs.writeFileSync(destFile, JSON.stringify(stripped, null, 2) + '\n');
    console.log(`Approved: wrote ${destFile}`);

    // Update dataset-version.json
    const versionData = loadJson(DATASET_VERSION_FILE);
    if (versionData) {
      versionData.exercise_count = (versionData.exercise_count || 0) + 1;
      versionData.updated_at = new Date().toISOString();
      fs.writeFileSync(DATASET_VERSION_FILE, JSON.stringify(versionData, null, 2) + '\n');
      console.log(`Updated dataset-version.json: exercise_count=${versionData.exercise_count}`);
    }

    if (warnings.length > 0) {
      console.log('\nWarnings (non-blocking):');
      warnings.forEach(w => console.log(`  [WARN] ${w}`));
    }

    console.log('\nApproval complete. Run node scripts/admin/export-release.js to regenerate the flat bundle.');
    return;
  }

  // ---------------------------------------------------------------------------
  // Reject mode
  // ---------------------------------------------------------------------------
  if (reject) {
    if (!fs.existsSync(COMMUNITY_REVIEWS_DIR)) {
      fs.mkdirSync(COMMUNITY_REVIEWS_DIR, { recursive: true });
    }

    const slug = submission.slug || path.basename(submissionFile, '.json');
    const rejectionRecord = {
      submission_file: path.basename(submissionFile),
      slug,
      name: submission.name || null,
      rejected_at: new Date().toISOString(),
      reason,
      validation_errors: issues,
      warnings,
    };

    const outFile = path.join(COMMUNITY_REVIEWS_DIR, `${slug}-rejected.json`);
    fs.writeFileSync(outFile, JSON.stringify(rejectionRecord, null, 2) + '\n');

    console.log(`Rejected: ${slug}`);
    console.log(`Reason:   ${reason}`);
    console.log(`Log:      ${outFile}`);
  }
}

main();
