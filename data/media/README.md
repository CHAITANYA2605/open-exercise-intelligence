# OEI Media Asset System

This directory contains the media asset registry for the Open Exercise Intelligence (OEI) project.

## Overview

The media system is a **registry-first** approach: `registry.json` is the authoritative index of all media assets associated with exercises. Actual media files are hosted externally (Wikimedia Commons, contributor-provided URLs, or future OEI CDN in Milestone 6). No binary files are stored in this repository.

## Directory Structure

```
data/media/
├── registry.json       # Master registry of all media assets
├── ATTRIBUTIONS.md     # Auto-generated attribution file (CC-BY assets)
└── README.md           # This file
```

## Asset Lifecycle

1. **Pending** — Entry added to `registry.json`, awaiting review.
2. **Approved** — License and provenance verified; asset is live in the API.
3. **Rejected** — Failed license or quality review; entry retained for audit trail.

The API (`GET /v1/media`) only surfaces `approved` assets.

## License Requirements

OEI only accepts media assets with **open, commercially compatible licenses**:

| SPDX Identifier | Name | Commercial Use | Attribution Required | Share-Alike |
|-----------------|------|:-:|:-:|:-:|
| CC0-1.0 | Creative Commons Zero 1.0 | Yes | No | No |
| CC-BY-4.0 | Creative Commons Attribution 4.0 | Yes | Yes | No |
| CC-BY-SA-4.0 | Creative Commons Attribution-ShareAlike 4.0 | Yes | Yes | Yes |
| CC-BY-2.0 | Creative Commons Attribution 2.0 | Yes | Yes | No |
| CC-BY-2.5 | Creative Commons Attribution 2.5 | Yes | Yes | No |
| CC-BY-3.0 | Creative Commons Attribution 3.0 | Yes | Yes | No |
| MIT | MIT License | Yes | Yes | No |
| Apache-2.0 | Apache License 2.0 | Yes | Yes | No |
| Unlicense | The Unlicense | Yes | No | No |

**CC0-1.0 and Unlicense are strongly preferred** because they require no attribution and have no share-alike requirements, simplifying downstream use.

**CC-BY-SA-4.0** assets are accepted but flagged as copyleft — any derivative work must be released under the same license.

### Not Accepted

- Proprietary images (Getty, Shutterstock, iStock without explicit CC license)
- Gym Visual diagrams or derivatives
- ExRx.net diagrams (copyright retained by ExRx)
- ExerciseDB images (license unclear / proprietary)
- Screenshots from other fitness apps
- Any image with a watermark from a commercial provider
- "Free for personal use" images (not commercially compatible)
- Creative Commons Non-Commercial variants (CC-BY-NC-*, CC-BY-NC-SA-*)
- Creative Commons No-Derivatives variants (CC-BY-ND-*, CC-BY-NC-ND-*)

## Finding CC0-Licensed Exercise Images

### Wikimedia Commons (Preferred)
- <https://commons.wikimedia.org/> — search for exercise names, muscle names, or anatomical illustrations
- Filter by license: CC0 or Public Domain
- Many high-quality anatomical SVGs are available

### Other Sources
- **Unsplash** (<https://unsplash.com/>) — photos are CC0-equivalent (Unsplash License allows commercial use)
- **Pixabay** (<https://pixabay.com/>) — CC0-licensed images
- **Public domain archives** — US government publications (NIH, NCI) are public domain

## Provenance Fields

The `provenance` object documents the chain of custody for each asset:

| Field | Purpose |
|-------|---------|
| `original_source` | Human-readable name of the originating platform (e.g., "Wikimedia Commons") |
| `original_author` | Creator's name or username |
| `original_url` | Permanent URL to the original asset page |
| `modifications` | List of changes made from the original (e.g., "cropped", "recolored") |
| `contributed_by` | GitHub username or team name of the OEI contributor |
| `contributed_at` | ISO 8601 timestamp of when it was added to OEI |

Accurate provenance is required for license verification. Assets with missing or unverifiable provenance will be rejected.

## Registry JSON Format

Each entry in `registry.json`'s `assets` array follows this structure:

```json
{
  "asset_id": "<UUID v4>",
  "exercise_slug": "<slug from oei-index.json>",
  "asset_type": "image|video|gif|anatomical_illustration|thumbnail",
  "filename": "exercise-slug-front.jpg",
  "url": "https://upload.wikimedia.org/...",
  "width": 800,
  "height": 600,
  "duration_seconds": null,
  "file_size_bytes": 123456,
  "mime_type": "image/jpeg",
  "license": {
    "spdx": "CC0-1.0",
    "human_readable": "Creative Commons Zero 1.0",
    "allows_commercial_use": true,
    "requires_attribution": false,
    "attribution_text": null,
    "source_url": null,
    "retrieved_at": "2026-11-08T00:00:00Z",
    "verified_by": "oei-maintainers",
    "verification_notes": null
  },
  "provenance": {
    "original_source": "Wikimedia Commons",
    "original_author": "ExampleAuthor",
    "original_url": "https://commons.wikimedia.org/wiki/File:example.jpg",
    "modifications": [],
    "contributed_by": "github-username",
    "contributed_at": "2026-11-08T00:00:00Z"
  },
  "status": "pending",
  "review_notes": null
}
```

## Scripts

| Script | Purpose |
|--------|---------|
| `node scripts/validate-media.js [--verbose]` | Validate registry entries against schema and exercise slugs |
| `node scripts/generate-attributions.js` | Generate `data/media/ATTRIBUTIONS.md` for CC-BY assets |
| `node scripts/check-license-compatibility.js` | Check all licenses against OEI compatibility requirements |

## Contributing Media

See [CONTRIBUTING.md](../../CONTRIBUTING.md#contributing-media-assets) for the full contribution workflow.

The short version:
1. Find a CC0-licensed asset on Wikimedia Commons or similar.
2. Add an entry to `registry.json` with all required fields.
3. Run `node scripts/validate-media.js` — fix any errors.
4. Open a pull request.
