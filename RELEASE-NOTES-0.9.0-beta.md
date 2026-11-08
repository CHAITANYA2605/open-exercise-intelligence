# OEI v0.9.0-beta Release Notes

## What this release is

A complete, open-source exercise dataset and developer toolkit intended for fitness application development. This is a beta release.

## What "beta" means for OEI

- All 866 exercise records are AI-generated and have not yet been reviewed by human fitness experts.
- Exercise descriptions, execution steps, and muscle mappings are structurally complete but may contain inaccuracies.
- The dataset is fully usable for development, prototyping, and research.
- Do not present these exercises as human-verified in a production health or fitness application without independent expert review.

## What's included

- 866 CC0 exercise records across 9 categories
- Full muscle taxonomy (75 muscles) and equipment registry (50 items)
- REST API (Spring Boot, Java 21)
- JavaScript/TypeScript, Python, Dart/Flutter SDKs (local use, not yet published to registries)
- Full-text search engine (zero-dependency Node.js)
- Developer portal (React + Vite)
- GitHub Actions CI

## What's needed for v1.0.0

See [RELEASE-GATE-v1.0.0.md](RELEASE-GATE-v1.0.0.md) for the full checklist.

## Licensing

- Exercise data: CC0 1.0 Universal (public domain dedication)
- Source code: MIT License
- Documentation: CC BY 4.0

## SHA-256 checksums

See `data/checksums.sha256`.
