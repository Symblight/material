---
name: card component status
description: md-card component exists only as a README spec — implementation files not yet created as of 2026-03-24
type: project
---

As of 2026-03-24, `components/card/` contains only `README.md`. No `card.ts`, CSS files, or stories exist yet.

The test file at `components/card/__tests__/card.spec.ts` was written against the README spec and is ready to drive TDD implementation.

**Why:** Tests were requested before the component was built to establish a TDD baseline.

**How to apply:** When the card component is implemented, run `pnpm web-test-runner components/card/__tests__/card.spec.ts --node-resolve` to verify compliance with the spec. All 46 test cases should pass without modification to the spec file.
