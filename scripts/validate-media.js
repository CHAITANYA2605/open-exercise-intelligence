#!/usr/bin/env node
/**
 * validate-media.js — OEI Media Registry Validator
 *
 * Usage: node scripts/validate-media.js [--verbose]
 *
 * Validates data/media/registry.json against required fields, allowed SPDX
 * identifiers, and known exercise slugs from data/generated/oei-index-all.json.
 * Exits with code 1 if any errors are found.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const VERBOSE = process.argv.includes('--verbose');

// Paths (relative to repo root; script can be run from any directory)
const ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'data', 'media', 'registry.json');
const INDEX_PATH = path.join(ROOT, 'data', 'oei-index.json');

const ALLOWED_SPDX = new Set([
  'CC0-1.0',
  'CC-BY-4.0',
  'CC-BY-SA-4.0',
  'CC-BY-2.0',
  'CC-BY-2.5',
  'CC-BY-3.0',
  'MIT',
  'Apache-2.0',
  'Unlicense',
]);

const ALLOWED_ASSET_TYPES = new Set([
  'image',
  'video',
  'gif',
  'anatomical_illustration',
  'thumbnail',
]);

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'video/mp4',
  'image/webp',
  'image/svg+xml',
]);

const ALLOWED_STATUSES = new Set(['pending', 'approved', 'rejected']);

// ── helpers ──────────────────────────────────────────────────────────────────

function log(msg) {
  if (VERBOSE) console.log(msg);
}

function die(msg) {
  console.error(`\nFATAL: ${msg}`);
  process.exit(2);
}

// ── load data ─────────────────────────────────────────────────────────────────

if (!fs.existsSync(REGISTRY_PATH)) {
  die(`Registry not found at ${REGISTRY_PATH}`);
}
if (!fs.existsSync(INDEX_PATH)) {
  die(`Exercise index not found at ${INDEX_PATH}`);
}

let registry, index;
try {
  registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
} catch (e) {
  die(`Failed to parse registry.json: ${e.message}`);
}
try {
  index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
} catch (e) {
  die(`Failed to parse oei-index.json: ${e.message}`);
}

// Build set of valid exercise slugs from the index
const validSlugs = new Set();
const exercises = Array.isArray(index) ? index : (index.exercises || []);
for (const ex of exercises) {
  if (ex.slug) validSlugs.add(ex.slug);
}
log(`Loaded ${validSlugs.size} exercise slugs from index`);

// ── validate registry structure ───────────────────────────────────────────────

const errors = [];
const warnings = [];

function err(assetId, field, msg) {
  errors.push({ assetId, field, msg });
}

function warn(assetId, field, msg) {
  warnings.push({ assetId, field, msg });
}

if (!registry || typeof registry !== 'object') {
  die('registry.json root must be a JSON object');
}
if (!Array.isArray(registry.assets)) {
  die('registry.json must have an "assets" array');
}

log(`Validating ${registry.assets.length} asset(s)...`);

const seenIds = new Map(); // asset_id -> index

registry.assets.forEach((asset, idx) => {
  const id = asset.asset_id || `(index ${idx})`;
  log(`\n  [${idx}] ${id}`);

  // ── required top-level fields ──
  const requiredFields = ['asset_id', 'exercise_slug', 'asset_type', 'filename', 'mime_type', 'license', 'provenance', 'status'];
  for (const field of requiredFields) {
    if (asset[field] === undefined || asset[field] === null) {
      err(id, field, `Required field "${field}" is missing or null`);
    }
  }

  // ── duplicate asset_id ──
  if (asset.asset_id) {
    if (seenIds.has(asset.asset_id)) {
      err(id, 'asset_id', `Duplicate asset_id "${asset.asset_id}" (also at index ${seenIds.get(asset.asset_id)})`);
    } else {
      seenIds.set(asset.asset_id, idx);
    }
  }

  // ── asset_type ──
  if (asset.asset_type && !ALLOWED_ASSET_TYPES.has(asset.asset_type)) {
    err(id, 'asset_type', `Unknown asset_type "${asset.asset_type}". Allowed: ${[...ALLOWED_ASSET_TYPES].join(', ')}`);
  }

  // ── mime_type ──
  if (asset.mime_type && !ALLOWED_MIME_TYPES.has(asset.mime_type)) {
    err(id, 'mime_type', `Unknown mime_type "${asset.mime_type}". Allowed: ${[...ALLOWED_MIME_TYPES].join(', ')}`);
  }

  // ── status ──
  if (asset.status && !ALLOWED_STATUSES.has(asset.status)) {
    err(id, 'status', `Unknown status "${asset.status}". Allowed: pending, approved, rejected`);
  }

  // ── exercise_slug ──
  if (asset.exercise_slug && validSlugs.size > 0 && !validSlugs.has(asset.exercise_slug)) {
    err(id, 'exercise_slug', `exercise_slug "${asset.exercise_slug}" does not exist in oei-index.json`);
  }

  // ── license object ──
  const lic = asset.license;
  if (lic && typeof lic === 'object') {
    // SPDX identifier
    if (!lic.spdx) {
      err(id, 'license.spdx', 'license.spdx is required');
    } else if (!ALLOWED_SPDX.has(lic.spdx)) {
      err(id, 'license.spdx', `SPDX identifier "${lic.spdx}" is not in the allowed list: ${[...ALLOWED_SPDX].join(', ')}`);
    }

    // allows_commercial_use must be true
    if (lic.allows_commercial_use === false) {
      err(id, 'license.allows_commercial_use', `OEI only accepts licenses that allow commercial use. This asset is flagged as non-commercial.`);
    }

    // requires_attribution: true but attribution_text is null
    if (lic.requires_attribution === true && !lic.attribution_text) {
      err(id, 'license.attribution_text', `license.requires_attribution is true but attribution_text is null or empty`);
    }
  } else if (lic !== undefined) {
    err(id, 'license', 'license must be a JSON object');
  }

  // ── provenance object ──
  const prov = asset.provenance;
  if (prov && typeof prov === 'object') {
    if (!prov.contributed_by) {
      warn(id, 'provenance.contributed_by', 'provenance.contributed_by is empty');
    }
    if (!prov.contributed_at) {
      warn(id, 'provenance.contributed_at', 'provenance.contributed_at is empty');
    }
  } else if (prov !== undefined) {
    err(id, 'provenance', 'provenance must be a JSON object');
  }

  // ── video-specific: duration_seconds ──
  if (asset.asset_type === 'video' && asset.duration_seconds === null) {
    warn(id, 'duration_seconds', 'Video asset has no duration_seconds set');
  }
});

// ── print report ──────────────────────────────────────────────────────────────

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  OEI Media Registry Validation Report');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log(`  Registry : ${REGISTRY_PATH}`);
console.log(`  Assets   : ${registry.assets.length}`);
console.log(`  Exercises: ${validSlugs.size} slugs loaded`);
console.log('');

if (errors.length === 0 && warnings.length === 0) {
  console.log('  ✅ All assets passed validation.\n');
} else {
  if (errors.length > 0) {
    console.log(`  ❌ ERRORS (${errors.length}):\n`);
    for (const e of errors) {
      console.log(`    [${e.assetId}] ${e.field}`);
      console.log(`      → ${e.msg}`);
    }
    console.log('');
  }
  if (warnings.length > 0) {
    console.log(`  ⚠️  WARNINGS (${warnings.length}):\n`);
    for (const w of warnings) {
      console.log(`    [${w.assetId}] ${w.field}`);
      console.log(`      → ${w.msg}`);
    }
    console.log('');
  }
}

console.log(`  Summary: ${errors.length} error(s), ${warnings.length} warning(s)`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (errors.length > 0) {
  process.exit(1);
}
