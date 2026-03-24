---
name: pointer-events-slotted-children
description: pointerenter/pointerleave are non-bubbling; host-level listeners alone cannot catch events originating on slotted (light DOM) children — must also attach directly to each slotted element via slotchange
type: feedback
---

`pointerenter` and `pointerleave` do not bubble. When listeners are registered only on the host element or on an inner shadow element (e.g. `#card-surface`), events fired on slotted light-DOM children are invisible to those listeners.

**Pattern that works:** in `connectedCallback` attach `pointerenter`/`pointerleave` on the host for real-device boundary events, AND listen for `slotchange` on every `<slot>` to attach the same listeners directly on each assigned element (tracked in a `Set` for clean removal).

**Why:** `dispatchEvent` on a child with `bubbles: false` only invokes listeners on that exact target — ancestors in the composed tree receive their own `pointerenter` from the browser only during real pointer movement, not from manual dispatch. Tests use manual dispatch, so both paths must be covered.

**How to apply:** Any component that needs hover/press states driven by pointer events over slotted content must use this dual-listener pattern. Applies to md-card and any future interactive container components.
