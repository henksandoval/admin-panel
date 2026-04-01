# Validation Checklist

Use this checklist before considering a task complete.

## Repository Rules
- Material controls color and typography.
- Tailwind is used for layout and spacing only.
- User-visible strings use $localize with @@ ids.
- Template-only members are protected.
- Tests are black-box and use data-testid.

## Change Quality
- Scope is limited to requested behavior.
- Naming is clear and consistent.
- No unnecessary abstractions introduced.
- No unrelated file churn.

## Validation Gates
1. npm run lint
2. npm test
3. npm run build

## Final Report
- What changed
- Why it changed
- Validation output summary
- Risks and follow-ups
