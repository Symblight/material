---
name: pattern_popover_position_controller
description: Shared PopoverPositionController primitive (shared/popover-position-controller.js) backing md-menu, reusable for a future md-tooltip; also documents a confirmed native-popover-stacking limitation across separate shadow roots
type: project
---

Built `shared/popover-position-controller.js` — a Lit `ReactiveController` (constructor
`(host, options)`, `host.addController(this)`, matches `HTMLForController`'s shape) that owns
**all** `popover` positioning/show-hide mechanics: anchor resolution (wraps `HTMLForController`
internally), floating-ui `computePosition()` + `offset()`/`flip()`/`shift({padding:8})` middleware,
`autoUpdate()` lifecycle (start on `.show()`, stop on `.hide()`/`hostDisconnected()`), imperative
`showPopover()`/`hidePopover()` (including the `{ source }` invoker option, feature-detected via
try/catch since TS's bundled `lib.dom.d.ts` as of TS 5.9.3 doesn't type it yet — cast via
`/** @type {(options?: {source?: Element}) => void} */`), listening to the surface's native
`toggle` event to report state back via an `onOpenChange(isOpen)` callback, and
`setPointAnchor(x,y)`/`clearPointAnchor()` via a floating-ui virtual element (context-menu case).

**Deliberately excludes** any consumer-specific concept: `md-menu` (`components/menu/menu.js`)
owns its own trigger wiring (click/hover/contextmenu listeners + `aria-haspopup`/`aria-expanded`)
via the controller's `onAnchorChange(next, prev)` hook, plus roving tabindex, typeahead, and
`select` dispatch — none of that lives in the controller. This split was an explicit design
requirement (not my initial approach — I originally wrote all of this directly as private methods
on `MdMenu`; the coordinator interrupted mid-task and required extraction into a shared primitive
specifically because a future `<md-tooltip>` will need the same positioning core with
`popover="manual"` + hover semantics layered on top, without pulling in any menu concepts).

**Why:** Anticipates `md-tooltip` (planned, not yet built) reusing the exact same
anchor/position/show-hide core.

**How to apply:** Any future `popover`-backed component (tooltip, etc.) should construct a
`PopoverPositionController` rather than reimplementing floating-ui wiring inline — pass
`getSurfaceEl`/`getPlacement`/`getOffset`/`getFlip` getter callbacks (so the controller always
reads current values off the host rather than caching stale ones) and an `onOpenChange` callback
that syncs the host's own reflected `open` property. Verify the file still exists at that path and
its constructor signature before reusing, in case it's since evolved.

**Confirmed via a standalone Playwright probe (not just read the spec) — native popover
ancestor-stacking via `showPopover({source})` does NOT reliably keep an ancestor `popover="auto"`
open when a click lands inside its visual bounds but outside a nested popover, IF the two popovers
live in separate/sibling shadow roots connected only through slot assignment (not real DOM
containment).** Tested three scenarios with a raw Playwright script (`chromium.launch()` +
`page.mouse.click()` for real trusted pointer events, not synthetic `dispatchEvent` — light-dismiss
only fires off trusted events):

1. Child as a literal DOM descendant of parent (plain nested `<div popover>`): click inside parent,
   outside child → only child closes, parent stays open. Works with or without `{source}`, because
   plain DOM containment alone establishes the ancestor relationship.
2. Child and parent as DOM **siblings**, `{source}` invoker (a button) also a **sibling** of parent
   (not nested inside it) — mirrors `md-menu`'s real architecture, where each menu instance's
   `popover` div lives in its own separate shadow root and the submenu's invoker (the parent item's
   button) is never a DOM descendant of the parent's shadow-root popover div, only reachable via
   slot assignment: click inside parent's visual bounds, outside child → **both close**, even with
   `{source}` set. The invoker-relationship mechanism apparently requires the `source` element
   itself to be a real DOM/flat-tree descendant of the already-open ancestor popover to register —
   a cross-shadow-root slotted relationship doesn't count.

This directly validates AC's "must-verify" flag for `md-menu`'s nested submenus (§7): the
documented fallback (manually `hidePopover()`/`close()` descendant submenus when a parent closes)
is implemented unconditionally in `MdMenu._closeDescendantSubmenus()`, called from `_handleClose()`
— **not conditionally gated on browser detection**, since it's cheap and correct regardless of
native stacking fidelity. This covers "outside click closes the whole chain" correctly.

**Known remaining gap, not fully solved:** since native light-dismiss for sibling/cross-shadow-root
popovers tears down the _entire_ stack together rather than just the topmost, a click **inside the
parent menu's own surface** (e.g. a different sibling item) while a submenu is open will currently
light-dismiss the whole chain via the browser's own algorithm _before_ any of my JS handlers run —
there's no way to intercept/preventDefault a browser-internal light-dismiss decision after the fact
from application code. Fully fixing this would mean abandoning native `popover="auto"` light-dismiss
for a hand-rolled document-level outside-click algorithm that understands the light-DOM
parent-item/parent-menu relationship (`MdMenu.parentItem`/`parentMenu` getters, already present).
Deferred as a known limitation rather than attempted in the same pass — flag to the user before
shipping if this interaction matters for the target UX.

**Reusable verification technique:** for any future "does native browser API X actually behave as
documented across component boundaries" question, a throwaway Playwright script (`chromium.launch()`

- real `page.mouse.click()`, not `@web/test-runner`'s synthetic `dispatchEvent`-based fixtures) is
  the fast way to get a real, trustworthy answer instead of guessing from spec text — light-dismiss
  and other UA-internal default actions specifically require trusted events. Playwright itself is a
  project devDependency already (no new install needed); locate it via
  `node_modules/.pnpm/playwright@<version>/node_modules/playwright` from the monorepo root, not
  `packages/ui/node_modules/playwright` (not hoisted there).
