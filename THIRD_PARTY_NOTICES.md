# Third-Party Notices

This document lists all third-party assets, libraries, and content used in Open Exercise Intelligence (OEI) that are not covered by the project's primary MIT or CC0 licenses.

Maintainers must update this file whenever a third-party asset is added to the project. Assets without an entry here are not permitted in official releases.

---

## Format

Each entry must include:

```
### [Asset Name or ID]
- **Type**: image | video | font | library | dataset | other
- **Source**: [URL or description of origin]
- **Creator**: [Author or organization]
- **License**: [License name and SPDX identifier]
- **License URL**: [URL to license text]
- **Commercial Use Allowed**: yes | no | with restrictions
- **Redistribution Allowed**: yes | no | with restrictions
- **Modification Allowed**: yes | no | with restrictions
- **Attribution Required**: yes | no
- **Attribution Text**: [Required attribution string, if applicable]
- **Notes**: [Any additional notes]
```

---

## Current Third-Party Assets

*No third-party assets have been added to this project yet.*

This file will be updated as assets are incorporated. All third-party assets must be reviewed and approved by a maintainer before inclusion.

---

## Excluded Assets

The following asset sources are explicitly excluded from OEI due to licensing restrictions or usage terms that prohibit redistribution:

| Source | Reason for Exclusion |
|---|---|
| ExRx.net exercise images | Copyright, all rights reserved |
| ExerciseDB images | Restricted redistribution terms |
| Gym Visual (N-CRFL licensed images) | N-CRFL prohibits use as redistributable library assets |
| Getty Images / Shutterstock / iStock | Standard stock photo license prohibits redistribution |
| Human Kinetics exercise diagrams | Copyright, all rights reserved |

If you believe an asset source should be added or removed from this exclusion list, open an issue for maintainer review.

---

## How to Add a Third-Party Asset

1. Verify the asset's license permits commercial redistribution.
2. Verify the asset's license permits modification (if modification is needed).
3. Document the asset in this file following the format above.
4. Add the asset's metadata to the relevant exercise's `media` section.
5. Set `commercial_usage_allowed`, `redistribution_allowed`, and `modification_allowed` accurately in the asset record.
6. Submit a PR with both the asset documentation and the data file update.

If you are unsure whether an asset's license permits redistribution, do not add it. Open an issue and ask a maintainer.

---

## Acknowledgements

OEI is committed to respecting intellectual property rights. If you believe your work has been included without proper attribution or in violation of its license, please open a GitHub issue or contact the maintainers via the security contact in [SECURITY.md](SECURITY.md). We will respond promptly.
