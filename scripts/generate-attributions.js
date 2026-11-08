#!/usr/bin/env node
/**
 * generate-attributions.js — OEI Media Attribution Generator
 *
 * Usage: node scripts/generate-attributions.js
 *
 * Reads data/media/registry.json, filters assets where
 * requires_attribution: true AND status: "approved", and writes
 * data/media/ATTRIBUTIONS.md grouped by license type.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'data', 'media', 'registry.json');
const OUTPUT_PATH = path.join(ROOT, 'data', 'media', 'ATTRIBUTIONS.md');
const INDEX_PATH = path.join(ROOT, 'data', 'oei-index.json');

// ── load data ─────────────────────────────────────────────────────────────────

function die(msg) {
  console.error(`FATAL: ${msg}`);
  process.exit(2);
}

if (!fs.existsSync(REGISTRY_PATH)) die(`Registry not found at ${REGISTRY_PATH}`);

let registry;
try {
  registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
} catch (e) {
  die(`Failed to parse registry.json: ${e.message}`);
}

// Build exercise name lookup
const exerciseNames = {};
if (fs.existsSync(INDEX_PATH)) {
  try {
    const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
    const exercises = Array.isArray(index) ? index : (index.exercises || []);
    for (const ex of exercises) {
      if (ex.slug) exerciseNames[ex.slug] = ex.name || ex.slug;
    }
  } catch (_) {
    // non-fatal
  }
}

// ── filter assets ─────────────────────────────────────────────────────────────

const attributionAssets = (registry.assets || []).filter(
  (a) => a.license && a.license.requires_attribution === true && a.status === 'approved'
);

console.log(`Found ${attributionAssets.length} approved asset(s) requiring attribution.`);

// ── group by SPDX license ─────────────────────────────────────────────────────

const byLicense = {};
for (const asset of attributionAssets) {
  const spdx = (asset.license && asset.license.spdx) || 'Unknown';
  if (!byLicense[spdx]) byLicense[spdx] = [];
  byLicense[spdx].push(asset);
}

// ── generate Markdown ─────────────────────────────────────────────────────────

const lines = [];
lines.push('# Media Attributions');
lines.push('');
lines.push('This file is **auto-generated** by `node scripts/generate-attributions.js`.');
lines.push('Do not edit manually — your changes will be overwritten on the next run.');
lines.push('');
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push('');
lines.push('---');
lines.push('');

if (attributionAssets.length === 0) {
  lines.push('No approved assets currently require attribution.');
  lines.push('');
} else {
  lines.push('The following media assets are used in OEI under licenses that require attribution.');
  lines.push('Each entry includes the asset filename, associated exercise, original author,');
  lines.push('source URL, and license identifier.');
  lines.push('');

  const sortedLicenses = Object.keys(byLicense).sort();

  for (const spdx of sortedLicenses) {
    const assets = byLicense[spdx];
    const humanReadable = assets[0].license.human_readable || spdx;
    lines.push(`## ${spdx} — ${humanReadable}`);
    lines.push('');

    for (const asset of assets) {
      const exerciseName = exerciseNames[asset.exercise_slug] || asset.exercise_slug || '(unknown exercise)';
      const author = (asset.provenance && asset.provenance.original_author) || '(unknown author)';
      const sourceUrl = (asset.provenance && asset.provenance.original_url) || null;
      const licenseSourceUrl = asset.license.source_url || null;
      const attributionText = asset.license.attribution_text || null;

      lines.push(`### ${asset.filename || asset.asset_id}`);
      lines.push('');
      lines.push(`- **Exercise**: ${exerciseName}`);
      lines.push(`- **Asset type**: ${asset.asset_type || 'image'}`);
      lines.push(`- **Original author**: ${author}`);
      if (sourceUrl) {
        lines.push(`- **Original source**: <${sourceUrl}>`);
      }
      if (licenseSourceUrl) {
        lines.push(`- **License URL**: <${licenseSourceUrl}>`);
      }
      lines.push(`- **License**: ${spdx}`);
      if (attributionText) {
        lines.push(`- **Required attribution text**:`);
        lines.push('');
        lines.push(`  > ${attributionText}`);
      }
      if (asset.provenance && asset.provenance.modifications && asset.provenance.modifications.length > 0) {
        lines.push(`- **Modifications**: ${asset.provenance.modifications.join(', ')}`);
      }
      lines.push('');
    }
  }
}

lines.push('---');
lines.push('');
lines.push('*OEI strongly prefers CC0-licensed media (no attribution required).*');
lines.push('*If you are contributing media, please use CC0 assets where possible.*');
lines.push('');

// ── write output ──────────────────────────────────────────────────────────────

fs.writeFileSync(OUTPUT_PATH, lines.join('\n'), 'utf8');
console.log(`Attribution file written to: ${OUTPUT_PATH}`);
