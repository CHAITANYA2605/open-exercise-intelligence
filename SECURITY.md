# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| Latest release | Yes |
| Previous major | Security fixes only |
| Older releases | No |

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

OEI is primarily a data project, but security vulnerabilities may still arise in:

- The validation scripts and build tooling.
- The reference REST API.
- The developer SDKs.
- The admin interface.

### How to report

**For GitHub users**: Use GitHub's private security advisory reporting feature:

1. Navigate to the OEI repository on GitHub.
2. Click the **Security** tab.
3. Click **Report a vulnerability**.
4. Fill in the details of the vulnerability.

This creates a private advisory that only maintainers can see.

**Without a GitHub account**: Send an email describing the vulnerability to the maintainers. Check [GOVERNANCE.md](GOVERNANCE.md) for current maintainer contact information.

### What to include

Please provide as much of the following as possible:

- Description of the vulnerability and its potential impact.
- Steps to reproduce the issue.
- Affected component (validation script, API, SDK, etc.).
- Any suggested mitigations.
- Whether you have already disclosed this publicly.

### Response timeline

- **Acknowledgement**: Within 72 hours of receiving the report.
- **Initial assessment**: Within 7 days.
- **Resolution target**: Dependent on severity; critical issues within 14 days where feasible.

We will credit reporters in our changelog and release notes unless you request anonymity.

---

## Data Security Considerations

OEI is a public dataset project. The exercise data itself does not contain personal information.

If you discover that the dataset inadvertently contains private personal information (for example, in a contribution that was not properly reviewed), please report it using the same process above so we can remove it promptly.

---

## Scope

The following are **in scope** for security reports:

- Remote code execution vulnerabilities in scripts or the API.
- Authentication bypass in the admin interface.
- Data injection vulnerabilities.
- Supply chain vulnerabilities in project dependencies.
- Malicious content submitted as exercise data.

The following are **out of scope**:

- Vulnerabilities in GitHub itself.
- Theoretical vulnerabilities without a proof of concept.
- Issues in archived or deprecated branches.
