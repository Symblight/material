---
name: pattern_composition_wrapper
description: How to build a component that composes two existing components internally (e.g. md-split-button wrapping md-button + md-icon-button) instead of extending BaseButton
type: project
---

Built `components/split-button/` (`md-split-button`) as the first "composition wrapper" component
in this repo — a plain `LitElement` that renders real `<md-button>` + `<md-icon-button>` in its own
shadow root and forwards props down, rather than extending `BaseButton` and reimplementing
render/ripple/CSS. Three non-obvious findings from that build, relevant to any future component
that composes existing `md-*` elements internally:

**1. `md-button`'s `variant` is NOT a Lit-reactive property — `md-icon-button`'s and `md-fab`'s
are.** `components/button/button.js` defines `get variant()`/`set variant()` directly on the
prototype but never declares `variant` in a `static properties` block, so Lit's attribute-changed
pipeline never calls the setter for `<md-button variant="...">` set via a plain attribute in a
parent's template — only a direct JS/property assignment (`el.variant = "x"` or a lit-html `.variant=`
binding) invokes the accessor. `icon-button.js` and `fab.js` both declare `variant: {}` in
`static properties` _and_ keep a custom accessor, which does correctly wire up attribute→property
sync (Lit detects the pre-existing accessor and reuses it instead of generating one, but still
registers the attribute). This looks like a real gap in `button.js`, not intentional — did not fix
it (out of scope), but **for any wrapper component forwarding `variant` down into a nested
`<md-button>`, use a lit-html property binding (`.variant=${...}`) instead of a plain attribute
binding (`variant=${...}`)** — the plain-attribute form silently no-ops on `md-button` today.
`md-split-button` uses `.variant=` on both nested children for this reason.

**2. `::part(button)` overrides from an ancestor's own stylesheet DO win over the child
component's internal simple-selector rules for the exposed part**, even when the child's internal
rule (e.g. `icon-button.css`'s `.icon-button { border: ... }`) has higher raw CSS specificity than
the `::part()` selector would suggest. This is intentional per the CSS Shadow Parts spec (rules
reaching a part via `::part()` from an outer tree take priority for that element regardless of
normal specificity math against the shadow tree's own rules). Confirmed working live:
`md-icon-button`'s host `border-radius` is hardcoded to `100%` inside its own `:host` block (not
exposed via a custom property — `--md-icon-button-rounded-border-radius` is defined in
`icon-button.css` but unused/dead), so the only way to reshape its corners from outside is via
`md-icon-button::part(button) { border-radius: ... }`, which is exactly the mechanism
`segmented-button`'s shape-join precedent and now `split-button`'s shape-join CSS both rely on.

**3. Calling `.click()` on a wrapper/custom element bypasses inner native `disabled` suppression.**
`BaseButton.handleClick` only calls `event.preventDefault()` when `disabled`, never
`stopPropagation()`. Calling `.click()` on the _outer custom element_ (`mdButtonEl.click()`)
synthesizes a click directly on that element and bubbles it regardless of the inner `<button
disabled>`'s native state — only calling `.click()` on the actual inner native `<button>`
(`mdButtonEl.shadowRoot.querySelector("button").click()`) respects real disabled-suppression
(browsers refuse to dispatch synthetic or real clicks on a genuinely disabled native form control).
Any test asserting "disabled blocks the click" against a `BaseButton`-derived component must click
the inner native element, not the custom element wrapper, or it will get a false failure.

**Why:** These would silently produce broken forwarding (variant), unstyleable seams (part
override doubt), or a flaky/wrong test (disabled+click) if assumed away rather than verified
against the live source before building `md-split-button` (2026-08-09).

**How to apply:** When composing existing `md-*` components inside a new wrapper (rather than
extending `BaseButton`), default to lit-html property bindings (`.prop=`) for anything forwarded
that the child implements via a hand-written accessor rather than a declared reactive property —
grep the child's `static properties` block first to check. Use `::part()` for any shape/border
override needed on a composed child, trusting it to win over the child's own internal styling.
Write disabled+click tests against the composed child's actual inner native element, not the
custom-element wrapper.
