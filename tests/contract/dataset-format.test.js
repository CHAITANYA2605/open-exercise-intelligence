#!/usr/bin/env node
/**
 * Dataset format contract test.
 * Run: node tests/contract/dataset-format.test.js
 *
 * Verifies that generated dataset files conform to the documented wrapper format.
 * Does not modify any files.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const GENERATED_DIR = path.resolve(__dirname, '../../data/generated');
const REQUIRED_WRAPPER_KEYS = ['dataset', 'version', 'schema_version', 'generated_at', 'review_policy', 'exercise_count', 'exercises'];
const REQUIRED_EXERCISE_KEYS = ['exercise_id', 'slug', 'name', 'category', 'difficulty_level'];

let passed = 0;
let failed = 0;

function pass(msg) {
  console.log(`  PASS  ${msg}`);
  passed++;
}

function fail(msg) {
  console.log(`  FAIL  ${msg}`);
  failed++;
}

function assert(condition, passMsg, failMsg) {
  if (condition) pass(passMsg);
  else fail(failMsg);
}

function testBundle(filename, expectedReviewPolicy) {
  const filePath = path.join(GENERATED_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`\n  SKIP  ${filename} not found (run: node scripts/generation/build-dataset.js)`);
    return;
  }

  console.log(`\n--- ${filename} ---`);
  const raw = fs.readFileSync(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    fail(`${filename}: invalid JSON — ${e.message}`);
    return;
  }

  // Wrapper keys
  for (const key of REQUIRED_WRAPPER_KEYS) {
    assert(key in data, `has wrapper key: ${key}`, `missing wrapper key: ${key}`);
  }

  // exercise_count matches array length
  if (Array.isArray(data.exercises)) {
    assert(
      data.exercise_count === data.exercises.length,
      `exercise_count (${data.exercise_count}) matches exercises.length (${data.exercises.length})`,
      `exercise_count (${data.exercise_count}) does NOT match exercises.length (${data.exercises.length})`
    );
  }

  // review_policy
  if (expectedReviewPolicy) {
    assert(
      data.review_policy === expectedReviewPolicy,
      `review_policy is "${expectedReviewPolicy}"`,
      `review_policy is "${data.review_policy}", expected "${expectedReviewPolicy}"`
    );
  }

  // Sample 5 exercises for required fields
  if (Array.isArray(data.exercises) && data.exercises.length > 0) {
    const sample = data.exercises.slice(0, Math.min(5, data.exercises.length));
    for (const ex of sample) {
      for (const key of REQUIRED_EXERCISE_KEYS) {
        assert(ex[key] !== undefined, `exercise[${ex.slug || '?'}] has field: ${key}`, `exercise[${ex.slug || '?'}] missing field: ${key}`);
      }
    }
  }

  // Approved dataset must only contain APPROVED
  if (expectedReviewPolicy === 'approved-only' && Array.isArray(data.exercises)) {
    const nonApproved = data.exercises.filter(ex => {
      const status = (ex.metadata && ex.metadata.review_status) || ex.review_status;
      return status !== 'APPROVED';
    });
    assert(
      nonApproved.length === 0,
      `approved dataset contains only APPROVED exercises (${data.exercises.length} total)`,
      `approved dataset contains ${nonApproved.length} non-APPROVED exercises`
    );
  }
}

console.log('OEI Dataset Format Contract Test\n');
testBundle('oei-dataset-all.json', 'all');
testBundle('oei-dataset-approved.json', 'approved-only');
testBundle('oei-index-all.json', null);
testBundle('oei-index-approved.json', null);

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
