---
name: pattern_group_child_coordination
description: How parent/child selection + keyboard nav is coordinated across group components (tabs, list, radio, select) in this repo
type: project
---

This repo has no single reusable "roving tabindex controller" or group-context primitive yet —
each group component reimplements the pattern locally, but they all converge on the same idioms:

1. **Slot-querying getter, not @lit/context, for parent→child enumeration.** Parent components
   (`md-tabs`, `md-list`) expose a getter like `get _tabs()` / `get _listItems()` that does
   `this.renderRoot.querySelector("slot:not([name])").assignedElements()` filtered by tag name.
   `@lit/context` (`selectContext` in `components/select/select.js`) is reserved for deeper
   compound-component trees (select > option/optgroup) where children need to _reach up_ to
   register themselves — not used for simple flat button/tab/item groups.

2. **Child→parent selection events bubble as CustomEvents; parent re-dispatches a public `change`.**
   Pattern from `components/tabs/tab.js` + `tabs.js`: child dispatches an internal, undocumented
   event (`tab-activate`, `{bubbles: true, composed: true, detail: {tab: this}}`), parent listens
   via a template-bound `@tab-activate=` handler on its root element, updates all children's
   `active`/`selected` state directly (`for (const tab of this._tabs) tab.active = tab === newTab`),
   then dispatches the _public_ API event (`new CustomEvent("change", {detail: {value, index}, bubbles, composed})`)
   only if the value actually changed.

3. **Roving tabindex lives in the parent, driven off a `keydown` listener on the host itself**
   (`components/list/list.js`): `connectedCallback` adds `this.addEventListener("keydown", ...)`;
   the handler finds the currently-focused item via `items.find(item => item.matches(":focus-within"))`,
   computes next/prev index with wraparound, then calls a per-item method (`item.setTabIndex(i)`,
   `item.focusInteractive()`) — children expose these as public methods, not properties, so the
   parent can imperatively move focus. Tabindex is only synced initially on `slotchange`
   (`_onSlotChange`), not on every render.

4. **`radio-button`'s `RadioSelectionController` (components/radio-button/radio-selection.js)**
   is a different, more decoupled pattern: a `ReactiveController` attached to each _child_ radio
   that walks up via `getRootNode()` to find an ancestor `<fieldset>`/`<form>`, queries sibling
   `md-radio` elements directly (no parent group element needed at all), and unchecks others on
   `select()`. This is the pattern to reach for when there is no dedicated group wrapper element
   between items and the form.

**Why:** Learned while planning `md-segmented-button-group` — needed to know whether to reach for
`@lit/context` or the simpler slot-query + event-bubbling idiom used elsewhere.

**How to apply:** For any new flat group component (segmented buttons, chip groups, toggle
groups) default to pattern #1+#2+#3 (slot-query getter + bubbling activate event + host-level
roving-tabindex keydown handler), matching `md-tabs`/`md-list`. Only reach for `@lit/context`
when children need to register into a nested/dynamic tree shape like `md-select`'s
option/optgroup/hr children. Verify these files still exist and match before citing them again,
in case the pattern gets extracted into a shared controller later.

**Validated (2026-08-08):** Built `components/segmented-button/` (`md-segmented-button` +
`md-segmented-button-group`) using exactly this pattern — `segment-activate` bubbling event,
`getTabIndex`/`setTabIndex`/`focusInteractive` public methods on the child (mirroring
`list-item.js`), host `keydown` listener on the group. Confirmed working via 41 passing tests.

**Gotcha in the roving-tabindex init step (`_onSlotChange` / `_focusItem`'s sibling):**
`list-item.js`'s interactive elements default to a _static_ `tabindex="0"` in their own template
(not driven by the parent), same as I did for `md-segmented-button`'s inner `<button>`. That means
on first slot population _every_ child already has `tabindex="0"` independently, so `list.js`'s
own guard (`hasTabStop = items.some(item => item.getTabIndex() === 0)`) is trivially true from the
start and never normalizes down to one tabstop — `list.js`'s test suite only asserts the _first_
item is 0 and never asserts siblings are -1, so this latent multi-tabstop bug is untested there
too. Fixed it for the new component by checking `tabStops.length !== 1` instead of `!hasTabStop`
(only skip normalizing when exactly one legitimate tabstop already exists — signals a later
runtime slot-change, not the initial all-default-to-0 state). Apply the same `length !== 1` check
if reusing this idiom again; don't copy `list.js`'s `.some()` version verbatim.

**Validated (2026-08-09) — retrofitting keyboard nav/roving-tabindex onto `RadioSelectionController`
(no parent group element at all).** Fixed 5 bugs in `md-radio`/`components/radio-button/`
(required-group validity not proactive, validity not synced across siblings, no arrow-key nav, no
roving tabindex, grouping silently required a fieldset/form wrapper). Since there's no group
_element_ to own a host-level `keydown` listener (pattern #3 above assumes one), the listener has
to live on `this.group` (the resolved fieldset/form/document/shadowRoot) instead, attached from
each radio's own `RadioSelectionController.hostConnected()`. That means N radios' controllers all
try to attach to the _same_ group element — naively doing so runs the handler N times per keypress.
Fix: a module-level `WeakMap<EventTarget, {handler, refCount}>` keyed by the group element,
ref-counted in `hostConnected`/`hostDisconnected`, so only one real listener is ever attached per
group regardless of group size. Found the focused radio via `radio.matches(":focus-within")`
(scanning `group.querySelectorAll("md-radio")`) rather than `event.target` — matches the
`:focus-within` idiom `list.js`/`segmented-button-group.js` already use, and sidesteps relying on
shadow-DOM event-retargeting specifics across the group-element boundary.

**Gotcha — pre-existing bug this surfaced:** `RadioSelectionController`'s `MutationObserver`
(`attributes: true, subtree: true` on the group) had a `disabled`-cascade branch that reacted to
_any_ attribute mutation named `disabled` anywhere in the subtree and blasted that mutation's
`hasAttribute("disabled")` value onto _every_ control in the group — so a single
`<md-radio disabled>` in a group silently disabled all its siblings too (regardless of `name`).
Confirmed via `git stash` that this bug pre-dates this session's changes. It's masked in normal
use but breaks "skip disabled radios during arrow-nav" as soon as you write a test for it, because
Lit's initial attribute-reflection for a `reflect: true` boolean property produces a real
`MutationRecord` even when the property came _from_ that same attribute (constructor sets the
default, then `attributeChangedCallback` overwrites it, and by the time Lit's `update()` reflects
the final value the same-round-trip guard doesn't survive the microtask gap) — so this fires for
every disabled radio's _own_ initial render, not just runtime toggles. Fixed narrowly by gating the
cascade on `mutation.target === this.group` (i.e. only an ancestor `<fieldset disabled>`/`<form>`
mutating, not an individual radio) — `md-radio` is form-associated and already gets
`formDisabledCallback` natively from a disabled fieldset ancestor, so this cascade branch was
largely redundant anyway. **How to apply:** if a group/list component's `MutationObserver` cascades
a state attribute from "any subtree mutation" without checking `mutation.target` is the container
itself, treat it as suspect — write a disabled-sibling test before trusting it.

**Fix-5-style "make it work without a wrapper" via root-node fallback:** for `RadioSelectionController.group`,
added a third tier after fieldset/form: fall back to `target.getRootNode()` (the `Document` or
enclosing `ShadowRoot`) when neither ancestor exists. This matches the HTML spec's own radio-group
scoping (form owner, else the whole tree) and made `group` a getter that's _never_ falsy anymore,
which let several `if (!this.selectionController.group) return` early-outs elsewhere in the
codebase collapse away naturally. Before assuming a "requires a wrapper" limitation is unfixable,
check whether `getRootNode()` fallback is viable — it was here because `MutationObserver.observe`
and `querySelectorAll` both work identically on `Document`/`ShadowRoot` as on a real element.
