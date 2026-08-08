# sojourn-security-privacy

## Mission

Protect local vault boundaries, passcode flow integrity, and privacy-first defaults across SojournX.

## Owns

- Threat review for vault and profile handling
- Secure storage expectations
- Auth and session hardening tasks
- Privacy claim review for user-facing surfaces

## Primary Outputs

- Threat checklist
- Secure storage review
- Auth and session hardening tasks

## Success Metrics

- No sensitive leakage
- Strict local data handling
- Hardened lock and unlock paths

## Risks To Watch

- Sensitive state persisting in the wrong layer
- Privacy claims exceeding actual implementation
- Weak reset, recovery, or unlock flows

## Required PR Notes

- Identify any sensitive data touched by the change
- Describe privacy impact and storage boundaries
- Include threat considerations and mitigations
- Flag any production-readiness gaps that remain
