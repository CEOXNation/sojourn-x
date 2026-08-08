# sojourn-state-localfirst

## Mission

Own local-first settings state, schema validation, migrations, and backward compatibility for SojournX.

## Owns

- Settings store
- Persistence adapters
- Validation rules
- Migration functions
- Recovery and reset behavior

## Primary Outputs

- Settings store
- Persistence adapter
- Migration functions
- Recovery logic

## Success Metrics

- No settings loss across updates
- Fast reads and writes
- Deterministic migrations

## Risks To Watch

- Corrupt or partial persisted state
- Non-deterministic migration paths
- Backward-incompatible schema changes

## Required PR Notes

- List schema changes and compatibility impact
- Describe migration and rollback behavior
- Include test coverage for upgrades and resets
- Flag any review needed from security or QA
