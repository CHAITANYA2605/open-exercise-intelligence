# Governance

This document describes how Open Exercise Intelligence (OEI) is governed, how decisions are made, and how the project evolves over time.

---

## Principles

OEI is governed by these principles:

1. **Openness**: All governance discussions happen publicly on GitHub where possible.
2. **Transparency**: Decision rationale is documented.
3. **Meritocracy**: Influence is earned through sustained, quality contributions.
4. **Data integrity**: The dataset is the primary asset. Its quality, accuracy, and legal cleanliness take precedence over growth metrics.
5. **Stability**: Downstream developers depend on OEI. Breaking changes to the schema or dataset structure require a formal deprecation period.

---

## Roles

### Contributors

Anyone who opens a pull request, files an issue, or participates in discussions is a contributor. Contributors do not have commit access.

### Maintainers

Maintainers have commit access and can merge pull requests. Maintainers are responsible for:

- Reviewing and merging pull requests.
- Running dataset validation before releases.
- Verifying licensing compliance.
- Publishing dataset version releases.
- Enforcing the Code of Conduct.

A contributor may be invited to become a maintainer after demonstrating:
- Sustained, high-quality contributions over at least 3 months.
- Understanding of the project's licensing requirements.
- Commitment to data accuracy and provenance.

Maintainers who are inactive for 12+ months may be moved to emeritus status.

### Lead Maintainer

The lead maintainer has final say on:
- Governance changes.
- Schema breaking changes.
- Licensing decisions.
- Maintainer additions and removals.

The lead maintainer role may be transferred by consensus of active maintainers.

---

## Decision Making

### Routine decisions

Routine decisions — merging PRs, fixing typos, adding exercises — require approval from one maintainer.

### Significant decisions

Significant decisions require a discussion period of at least 7 days and consensus among active maintainers. Significant decisions include:

- Schema changes that affect existing data.
- Changes to the licensing model.
- Adding or removing data sources.
- Major architectural changes.
- Changes to this governance document.

### Conflict resolution

If maintainers disagree on a significant decision:

1. Each position is documented in a GitHub issue.
2. A comment period of 14 days is opened.
3. Active maintainers vote. Simple majority carries.
4. If tied, the lead maintainer casts the deciding vote.

---

## Dataset Releases

The dataset is versioned independently from the software (SDKs, API).

### Dataset versioning

Dataset versions follow semantic versioning:

- **Patch** (x.x.Z): Data corrections, typo fixes, additional coaching cues. No schema changes.
- **Minor** (x.Y.0): New exercises added. No breaking schema changes.
- **Major** (X.0.0): Breaking schema changes, significant taxonomy restructuring, or removal of records.

### Release process

1. A maintainer opens a release PR that updates the CHANGELOG.
2. The release PR runs full automated validation.
3. Validation must pass with zero errors.
4. License compliance check: all assets must have documented provenance.
5. A maintainer reviews and merges the release PR.
6. A GitHub release is published with the dataset as a downloadable asset.
7. The release is tagged with the version number.

Dataset releases are independent of SDK or API releases.

---

## Licensing Governance

The project's licensing model is documented in [LICENSING.md](LICENSING.md). Changes to the licensing model require:

- A discussion period of 30 days.
- Consensus among all active maintainers.
- A clear explanation of the reason for the change.
- An assessment of the impact on downstream users.

**CC0 contributions cannot be retroactively relicensed.** The licensing model for the original dataset can only be made more permissive, not more restrictive.

---

## Contact

For governance questions, open a GitHub issue with the label `governance`.

For Code of Conduct enforcement matters, contact the lead maintainer privately via GitHub.
