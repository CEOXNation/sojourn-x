# SojournX Agent Operating System

This repository defines eight specialized working agents for SojournX product, design, and release work. Each agent owns a clear surface area, opens pull requests instead of pushing to `main`, and hands work off through documented contracts.

## Shared Governance

- No direct pushes to `main`; all changes ship through pull requests.
- Every pull request must include: goal, scope, risks, and test plan.
- Every pull request must pass the repository checks and include accessibility and performance smoke evidence for affected flows.
- `sojourn-ux-systems` is the source of truth for tokens, theme primitives, spacing, and visual rules consumed by all other agents.
- `sojourn-state-localfirst` is the source of truth for settings persistence, schema changes, migrations, and rollback behavior.
- `sojourn-security-privacy` must review any work that touches vault state, profile data, passcodes, persistence, or privacy claims.
- `sojourn-qa-release` owns release readiness, regression sign-off, and changelog completeness before merge.

## Pull Request Contract

Every agent PR should use this structure:

1. Goal
2. Scope
3. Risks
4. Test Plan
5. Accessibility Smoke
6. Performance Smoke
7. Follow-ups

## Handoff Protocol

1. Open with the owning agent for the primary concern.
2. Reference dependent agents in the PR description before implementation starts.
3. If a change introduces new tokens, themes, or UI primitives, hand off to `sojourn-ux-systems` first.
4. If a change affects transitions, motion feedback, or animation timing, hand off to `sojourn-motion`.
5. If a change affects saved preferences or upgrade safety, hand off to `sojourn-state-localfirst`.
6. If a change affects focus, contrast, labels, or input flows, hand off to `sojourn-a11y`.
7. If a change affects responsiveness, render cost, or battery impact, hand off to `sojourn-performance`.
8. If a change affects vault boundaries, passcodes, profiles, or data exposure, hand off to `sojourn-security-privacy`.
9. Before release, hand off to `sojourn-qa-release` for regression coverage and release notes.
10. For user-facing copy, onboarding, mood naming, or empty states, hand off to `sojourn-product-narrative`.

## Execution Order For The Next Two Sprints

This sequence reflects the current planning snapshot and should be reviewed and updated at the start of each sprint cycle.

### Sprint 1 — Foundations

1. `sojourn-ux-systems`
2. `sojourn-state-localfirst`
3. `sojourn-a11y`
4. `sojourn-security-privacy`

### Sprint 2 — Experience And Release Hardening

1. `sojourn-motion`
2. `sojourn-performance`
3. `sojourn-product-narrative`
4. `sojourn-qa-release`

## Agent Specs

- [sojourn-ux-systems](docs/agents/sojourn-ux-systems.md)
- [sojourn-motion](docs/agents/sojourn-motion.md)
- [sojourn-state-localfirst](docs/agents/sojourn-state-localfirst.md)
- [sojourn-a11y](docs/agents/sojourn-a11y.md)
- [sojourn-performance](docs/agents/sojourn-performance.md)
- [sojourn-security-privacy](docs/agents/sojourn-security-privacy.md)
- [sojourn-qa-release](docs/agents/sojourn-qa-release.md)
- [sojourn-product-narrative](docs/agents/sojourn-product-narrative.md)
