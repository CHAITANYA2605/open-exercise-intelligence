#!/usr/bin/env node
/**
 * API contract test.
 * Run: node tests/contract/api-contract.test.js
 *
 * Tests the Spring Boot API when running on localhost:8080.
 * Skips gracefully if the server is not running.
 */
'use strict';

const http = require('http');

const BASE_URL = 'http://localhost:8080';
let passed = 0;
let failed = 0;
let skipped = 0;

function pass(msg) { console.log(`  PASS  ${msg}`); passed++; }
function fail(msg) { console.log(`  FAIL  ${msg}`); failed++; }
function skip(msg) { console.log(`  SKIP  ${msg}`); skipped++; }

function get(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (_) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.setTimeout(3000, () => { req.destroy(); reject(new Error('timeout')); });
    req.on('error', reject);
  });
}

async function checkServerRunning() {
  try {
    await get(`${BASE_URL}/actuator/health`);
    return true;
  } catch (_) {
    return false;
  }
}

async function run() {
  console.log('OEI API Contract Test\n');

  const running = await checkServerRunning();
  if (!running) {
    console.log('API server not running on localhost:8080 — skipping all API tests');
    console.log('Start server: cd api/server && mvn spring-boot:run');
    process.exit(0);
  }

  console.log('Server is running. Running contract checks...\n');

  // Health check
  try {
    const r = await get(`${BASE_URL}/actuator/health`);
    if (r.status === 200) pass('GET /actuator/health → 200');
    else fail(`GET /actuator/health → ${r.status} (expected 200)`);
  } catch (e) { fail(`GET /actuator/health → error: ${e.message}`); }

  // List exercises
  try {
    const r = await get(`${BASE_URL}/v1/exercises`);
    if (r.status === 200) pass('GET /v1/exercises → 200');
    else fail(`GET /v1/exercises → ${r.status}`);

    if (r.body && typeof r.body === 'object') {
      if ('results' in r.body || 'exercises' in r.body) pass('GET /v1/exercises response has results/exercises key');
      else fail('GET /v1/exercises response missing results/exercises key');
      if ('total' in r.body) pass('GET /v1/exercises response has total key');
      else fail('GET /v1/exercises response missing total key');
    }
  } catch (e) { fail(`GET /v1/exercises → error: ${e.message}`); }

  // Filter by category
  try {
    const r = await get(`${BASE_URL}/v1/exercises?category=strength&per_page=5`);
    if (r.status === 200) pass('GET /v1/exercises?category=strength → 200');
    else fail(`GET /v1/exercises?category=strength → ${r.status}`);
  } catch (e) { fail(`GET /v1/exercises?category=strength → error: ${e.message}`); }

  // Single exercise lookup
  try {
    const r = await get(`${BASE_URL}/v1/exercises/barbell-bench-press`);
    if (r.status === 200) pass('GET /v1/exercises/barbell-bench-press → 200');
    else if (r.status === 404) skip('GET /v1/exercises/barbell-bench-press → 404 (exercise may not be in approved dataset)');
    else fail(`GET /v1/exercises/barbell-bench-press → ${r.status}`);
  } catch (e) { fail(`GET /v1/exercises/barbell-bench-press → error: ${e.message}`); }

  // 404 for nonexistent exercise
  try {
    const r = await get(`${BASE_URL}/v1/exercises/this-exercise-does-not-exist-xyzabc`);
    if (r.status === 404) pass('GET /v1/exercises/{nonexistent} → 404');
    else fail(`GET /v1/exercises/{nonexistent} → ${r.status} (expected 404)`);
  } catch (e) { fail(`GET /v1/exercises/{nonexistent} → error: ${e.message}`); }

  // Dataset version
  try {
    const r = await get(`${BASE_URL}/v1/dataset-version`);
    if (r.status === 200) pass('GET /v1/dataset-version → 200');
    else fail(`GET /v1/dataset-version → ${r.status}`);
  } catch (e) { fail(`GET /v1/dataset-version → error: ${e.message}`); }

  // Muscles
  try {
    const r = await get(`${BASE_URL}/v1/muscles`);
    if (r.status === 200) pass('GET /v1/muscles → 200');
    else fail(`GET /v1/muscles → ${r.status}`);
  } catch (e) { fail(`GET /v1/muscles → error: ${e.message}`); }

  // Equipment
  try {
    const r = await get(`${BASE_URL}/v1/equipment`);
    if (r.status === 200) pass('GET /v1/equipment → 200');
    else fail(`GET /v1/equipment → ${r.status}`);
  } catch (e) { fail(`GET /v1/equipment → error: ${e.message}`); }

  console.log(`\nResults: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });
