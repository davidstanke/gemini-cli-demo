---
name: dependency-audit
description: Audits project dependencies for outdated packages using npm outdated and provides analysis on breaking changes vs security fixes.
---

# Dependency Audit Skill

Use this skill to identify and analyze outdated dependencies in a Node.js project.

## Workflow

1. **Run Audit**: Execute the bundled script `scripts/audit_dependencies.sh` to get a JSON report of outdated packages.
2. **Analyze Output**: Parse the JSON results. For each package:
    - **Breaking Changes**: If the `latest` version has a different major version than the `current` version (e.g., 1.x.x to 2.x.x), classify it as a potential "breaking change".
    - **Security Fixes**: Use your general knowledge of the libraries and common security advisory patterns. If a package is several minor/patch versions behind, it often contains security patches. Specifically, check if the `wanted` or `latest` versions are known to address CVEs.
3. **Report**: Present a summarized report to the user, grouping packages by their classification.

## Tool Usage

Run the script from the project root:
`bash dependency-audit/scripts/audit_dependencies.sh`

## Example Analysis Logic

- `current: 4.17.1`, `latest: 4.17.21` -> Likely security/bug fixes (Patch/Minor updates).
- `current: 16.8.0`, `latest: 18.2.0` -> Major update, likely contains breaking changes.
