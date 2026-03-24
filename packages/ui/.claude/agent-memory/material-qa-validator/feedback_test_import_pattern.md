---
name: test import pattern
description: How test files import component modules in this repo (relative .ts extension, not .js)
type: feedback
---

Test spec files import component source with a relative `.ts` extension, matching the badge pattern:

```ts
import "../badge.ts";
import type { MdBadge } from "../badge.ts";
```

This works because `@web/test-runner` uses the `esbuildPlugin` configured in `web-test-runner.config.js` which transpiles TypeScript at serve time. Never use `.js` extensions in test imports.

**Why:** The test runner resolves source files directly — there is no compiled `.js` output to point at during test execution.

**How to apply:** Every new `*.spec.ts` file must import its component with the `.ts` extension, e.g. `import "../card.ts"`.
