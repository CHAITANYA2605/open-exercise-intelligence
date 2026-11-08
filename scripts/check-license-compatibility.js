#!/usr/bin/env node
/**
 * check-license-compatibility.js — OEI License Compatibility Checker
 *
 * Usage: node scripts/check-license-compatibility.js
 *
 * Reads data/media/registry.json and checks each asset's license against
 * OEI's compatibility requirements:
 *   - MUST allow commercial use
 *   - MUST allow redistribution
 *   - MUST allow modifications (or state if not)
 *
 * Prints a compatibility report with ✅ / ❌ indicators.
 * Flags copyleft licenses (CC-BY-SA) separately.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'data', 'media', 'registry.json');

// License compatibility matrix
// Keys are SPDX identifiers known to OEI
const LICENSE_INFO = {
  'CC0-1.0': {
    commercial: true,
    redistribution: true,
    modifications: true,
    copyleft: false,
    compatible: true,
    notes: 'Public domain dedication. No restrictions whatsoever.',
  },
  'Unlicense': {
    commercial: true,
    redistribution: true,
    modifications: true,
    copyleft: false,
    compatible: true,
    notes: 'Public domain-equivalent. No restrictions.',
  },
  'CC-BY-4.0': {
    commercial: true,
    redistribution: true,
    modifications: true,
    copyleft: false,
    compatible: true,
    notes: 'Attribution required.',
  },
  'CC-BY-3.0': {
    commercial: true,
    redistribution: true,
    modifications: true,
    copyleft: false,
    compatible: true,
    notes: 'Attribution required. Older version of CC-BY.',
  },
  'CC-BY-2.5': {
    commercial: true,
    redistribution: true,
    modifications: true,
    copyleft: false,
    compatible: true,
    notes: 'Attribution required. Older version of CC-BY.',
  },
  'CC-BY-2.0': {
    commercial: true,
    redistribution: true,
    modifications: true,
    copyleft: false,
    compatible: true,
    notes: 'Attribution required. Older version of CC-BY.',
  },
  'CC-BY-SA-4.0': {
    commercial: true,
    redistribution: true,
    modifications: true,
    copyleft: true,
    compatible: true,
    notes: 'Share-alike: derivative works must use CC-BY-SA-4.0. Attribution required.',
  },
  'MIT': {
    commercial: true,
    redistribution: true,
    modifications: true,
    copyleft: false,
    compatible: true,
    notes: 'Attribution required (preserve copyright notice). Software license.',
  },
  'Apache-2.0': {
    commercial: true,
    redistribution: true,
    modifications: true,
    copyleft: false,
    compatible: true,
    notes: 'Attribution required. Patent grant included. Software license.',
  },
  // Incompatible licenses (should never appear in registry, but detected here)
  'CC-BY-NC-4.0': {
    commercial: false,
    redistribution: true,
    modifications: true,
    copyleft: false,
    compatible: false,
    notes: 'Non-commercial clause. OEI does NOT accept NC licenses.',
  },
  'CC-BY-NC-SA-4.0': {
    commercial: false,
    redistribution: true,
    modifications: true,
    copyleft: true,
    compatible: false,
    notes: 'Non-commercial clause. OEI does NOT accept NC licenses.',
  },
  'CC-BY-ND-4.0': {
    commercial: true,
    redistribution: true,
    modifications: false,
    copyleft: false,
    compatible: false,
    notes: 'No-derivatives clause. OEI does NOT accept ND licenses.',
  },
  'CC-BY-NC-ND-4.0': {
    commercial: false,
    redistribution: true,
    modifications: false,
    copyleft: false,
    compatible: false,
    notes: 'Non-commercial and no-derivatives. OEI does NOT accept NC or ND licenses.',
  },
  'All Rights Reserved': {
    commercial: false,
    redistribution: false,
    modifications: false,
    copyleft: false,
    compatible: false,
    notes: 'Proprietary. OEI does not accept proprietary media.',
  },
};

// ── load registry ─────────────────────────────────────────────────────────────

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

const assets = registry.assets || [];

// ── analyze ───────────────────────────────────────────────────────────────────

const compatible = [];
const incompatible = [];
const copyleft = [];
const unknown = [];

for (const asset of assets) {
  const spdx = (asset.license && asset.license.spdx) || null;
  const info = spdx ? LICENSE_INFO[spdx] : null;

  const entry = {
    asset_id: asset.asset_id,
    filename: asset.filename || '(no filename)',
    exercise_slug: asset.exercise_slug || '(no slug)',
    spdx: spdx || '(none)',
    allows_commercial_use: asset.license ? asset.license.allows_commercial_use : null,
    info,
  };

  if (!spdx || !info) {
    unknown.push(entry);
  } else if (!info.compatible) {
    incompatible.push(entry);
  } else {
    compatible.push(entry);
    if (info.copyleft) copyleft.push(entry);
  }
}

// ── print report ──────────────────────────────────────────────────────────────

const WIDE = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

console.log('');
console.log(WIDE);
console.log('  OEI Media License Compatibility Report');
console.log(WIDE);
console.log('');
console.log(`  Registry : ${REGISTRY_PATH}`);
console.log(`  Total    : ${assets.length} asset(s)`);
console.log('');

// Compatibility matrix table header
console.log('  License Compatibility Matrix');
console.log('  ─────────────────────────────────────────────────────────────────');
console.log(`  ${'SPDX Identifier'.padEnd(20)} ${'Commercial'.padEnd(12)} ${'Redistrib.'.padEnd(12)} ${'Modify'.padEnd(8)} ${'Status'}`);
console.log('  ─────────────────────────────────────────────────────────────────');

const knownSpdxInRegistry = new Set(assets.map((a) => a.license && a.license.spdx).filter(Boolean));
const toShow = [...knownSpdxInRegistry];

// Also show all OEI-known licenses for reference if registry is empty
if (toShow.length === 0) {
  for (const k of Object.keys(LICENSE_INFO)) toShow.push(k);
}

for (const spdx of toShow) {
  const info = LICENSE_INFO[spdx];
  if (!info) {
    console.log(`  ${'⚠️  ' + spdx.padEnd(17)} ${'?'.padEnd(12)} ${'?'.padEnd(12)} ${'?'.padEnd(8)} Unknown license`);
    continue;
  }
  const commercial = info.commercial ? '✅ Yes' : '❌ No';
  const redistrib = info.redistribution ? '✅ Yes' : '❌ No';
  const modify = info.modifications ? '✅ Yes' : '❌ No';
  const status = info.compatible
    ? (info.copyleft ? '✅ Compatible (copyleft)' : '✅ Compatible')
    : '❌ Incompatible';
  console.log(`  ${spdx.padEnd(20)} ${commercial.padEnd(12)} ${redistrib.padEnd(12)} ${modify.padEnd(8)} ${status}`);
}
console.log('');

// ── compatible assets ──────────────────────────────────────────────────────────

if (compatible.length > 0) {
  console.log(`  ✅ COMPATIBLE ASSETS (${compatible.length})`);
  console.log('');
  for (const e of compatible) {
    const copyleftFlag = e.info && e.info.copyleft ? ' [share-alike]' : '';
    console.log(`    ✅ ${e.filename} [${e.spdx}${copyleftFlag}]`);
    console.log(`       Exercise: ${e.exercise_slug}  |  ID: ${e.asset_id}`);
    if (e.info) console.log(`       ${e.info.notes}`);
    console.log('');
  }
}

// ── incompatible assets ───────────────────────────────────────────────────────

if (incompatible.length > 0) {
  console.log(`  ❌ INCOMPATIBLE ASSETS (${incompatible.length})`);
  console.log('  These assets MUST be removed or relicensed before OEI can use them.');
  console.log('');
  for (const e of incompatible) {
    console.log(`    ❌ ${e.filename} [${e.spdx}]`);
    console.log(`       Exercise: ${e.exercise_slug}  |  ID: ${e.asset_id}`);
    if (e.info) console.log(`       ${e.info.notes}`);
    console.log('');
  }
}

// ── unknown licenses ───────────────────────────────────────────────────────────

if (unknown.length > 0) {
  console.log(`  ⚠️  UNKNOWN LICENSES (${unknown.length})`);
  console.log('  OEI does not recognize these SPDX identifiers. Manual review required.');
  console.log('');
  for (const e of unknown) {
    console.log(`    ⚠️  ${e.filename} [${e.spdx}]`);
    console.log(`       Exercise: ${e.exercise_slug}  |  ID: ${e.asset_id}`);
    console.log('');
  }
}

// ── copyleft notice ───────────────────────────────────────────────────────────

if (copyleft.length > 0) {
  console.log(`  ⚠️  COPYLEFT NOTICE (${copyleft.length} asset(s))`);
  console.log('  These assets are compatible, but carry share-alike requirements.');
  console.log('  Any derivative work incorporating them must use the same license.');
  console.log('');
  for (const e of copyleft) {
    console.log(`    ⚠️  ${e.filename} [${e.spdx}]`);
  }
  console.log('');
}

// ── summary ───────────────────────────────────────────────────────────────────

const hasIssues = incompatible.length > 0 || unknown.length > 0;

console.log('  Summary');
console.log('  ─────────────────────────────────────────────────────────────────');
console.log(`  Total assets      : ${assets.length}`);
console.log(`  Compatible        : ${compatible.length}`);
console.log(`  Incompatible      : ${incompatible.length}`);
console.log(`  Unknown license   : ${unknown.length}`);
console.log(`  Copyleft (compat) : ${copyleft.length}`);
console.log('');

if (assets.length === 0) {
  console.log('  Registry is empty. No assets to check.');
} else if (!hasIssues) {
  console.log('  ✅ All assets have compatible licenses.');
} else {
  console.log('  ❌ License issues found. Review the incompatible/unknown assets above.');
}

console.log('');
console.log(WIDE);
console.log('');

if (hasIssues) {
  process.exit(1);
}
