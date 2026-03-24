---
name: md-card component design decisions
description: Agreed design decisions and implementation spec for the md-card component, documented in components/card/README.md
type: project
---

The md-card component was specified (not yet implemented) with the following decisions locked:

- Three variants: elevated (default), filled, outlined
- Four named slots: header, media, (default), actions
- Boolean attributes: interactive, disabled (disabled only meaningful when interactive is set)
- href attribute renders an <a> when interactive is also set; ignored otherwise
- Four public CSS tokens: --md-card-container-color, --md-card-outline-color, --md-card-shape, --md-elevation-level
- Ripple only rendered when interactive && !disabled (use Lit `when` directive)
- md-shadow is always rendered (reads --md-elevation-level from :host; set to 0 for filled/outlined)

**Why:** Card was the next MD3 component planned for the library. All design decisions were made upfront before implementation began.

**How to apply:** When implementing card.ts, follow the render structure and CSS file split described in components/card/README.md Implementation Notes section exactly.
