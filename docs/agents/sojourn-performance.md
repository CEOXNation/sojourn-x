# sojourn-performance

## Mission

Keep customization and core flows fast, responsive, and battery-friendly across supported SojournX targets.

## Owns

- Profiling and bottleneck identification
- Memoization and render optimization strategy
- Performance budgets for critical interactions
- Prevention of unnecessary re-render cascades

## Primary Outputs

- Profiling reports
- Memoization strategy
- Render optimization pull requests
- Performance budgets

## Success Metrics

- Low interaction latency
- Stable frame times
- No heavy re-render cascades

## Risks To Watch

- Expensive animated state updates
- Customizer controls triggering repeated whole-screen renders
- Performance regressions hidden behind feature flags

## Required PR Notes

- Describe the measured bottleneck
- Include before/after performance evidence
- Call out any tradeoffs affecting UX or accessibility
- Note monitoring or follow-up thresholds
