---
name: md-menu / md-menu-item component proposal
description: Acceptance criteria produced for proposed md-menu and md-menu-item components (2026-08-09), not yet implemented
metadata:
  type: project
---

On 2026-08-09 an Acceptance Criteria document was produced (research/planning only, no code
written) for new `md-menu` + `md-menu-item` components, based on the M3 "Menus" spec (page
unreachable, see below), two user-provided screenshots (dropdown/select-style menu with a pill
selected row + checkmark; vertical/expressive menu with icons, a `⌘C` shortcut, a divider variant,
and a submenu chevron), and repo convention research. Saved to
`/private/tmp/.../scratchpad/md-menu-acceptance-criteria.md` (scratchpad path, ephemeral — handed
to the user directly, not committed). Handed off for another engineer to implement.

Key findings that should inform any future implementation:

- **`m3.material.io/components/menus/specs` is unreachable via WebFetch**, same as the
  split-button/button-groups spec pages documented in [[project_split_button_component]] — confirms
  (a third time now) that the entire m3.material.io site returns only the page `<title>` via
  WebFetch, with no body content at all, regardless of which component page is targeted. Stop
  attempting WebFetch on this domain in future work; go straight to screenshots/Figma/secondary
  sources (e.g. framework doc sites that mirror the spec, like MWC or Compose Material3 API docs).
- **`md-select` (`components/select/select.js`) renders a real native `<select>`/`<option>`
  internally — it has no custom popover/menu overlay today.** Its value/validity logic lives in
  `FormAssociateMixin`. This means any "select-style" visual built with the new `md-menu` (e.g. to
  match a design screenshot showing a rounded pill-highlighted selected row) must be documented as
  a **separate, non-form-associated composition pattern**, not a reimplementation or wrapper of
  `md-select`. Do not let a future implementer conflate the two or attempt to swap `md-select`'s
  native `<select>` for `md-menu` without treating that as its own explicitly-scoped epic (loses
  native multi-select/keyboard semantics for free).
- **Confirmed again: no floating-ui or Popover API usage exists anywhere in this repo**
  (`grep -r "floating-ui" package.json` and `grep -rE "popover|showPopover" components` both empty).
  `md-menu` will be the first component here to use both `@floating-ui/dom` (not yet a dependency —
  needs adding to `package.json`) and the native `popover="auto"` attribute.
- **Declarative `popovertarget` won't work through this repo's shadow-DOM button wrappers.**
  Trigger components like `md-icon-button` wrap a real `<button>` inside shadow DOM; a
  `popovertarget` attribute placed on the _host_ custom element does not forward to that internal
  button. `md-menu` must drive `showPopover()`/`hidePopover()` **imperatively** off a click/hover/
  contextmenu listener (attached via `HTMLForController`, the same `for`-attribute-resolves-an-
  element-by-id controller `md-ripple` already uses), while still setting `popover="auto"` on the
  menu surface itself purely to get top-layer stacking + native light-dismiss for free.
- **Nested-popover ancestor-stacking behavior is unverified for this imperative-open pattern.**
  Native browsers do form a "popover stack" so a submenu doesn't light-dismiss its own parent, but
  that relies on the browser detecting a DOM/invoker relationship (normally via `popovertarget`).
  Since this design drives `showPopover()` imperatively rather than declaratively, the AC explicitly
  flags that cross-browser nested-stacking behavior must be tested before relying on it, with a
  manual-close-descendants fallback plan if it doesn't hold.
- `components/list/list-item.js` (`leading`/`trailing` named slots, slot-presence-driven visibility
  via `@slotchange`, `--md-list-item-*` CSS custom properties) and `components/list/list.js`
  (roving-tabindex ArrowUp/Down/Home/End controller) are strong prior art the AC recommended
  `md-menu-item`/`md-menu` reuse/mirror rather than reinvent — including reusing the exact
  `leading`/`trailing` slot _names_ for cross-component consistency.
- The AC recommended reusing `md-card` (elevated, non-interactive) as the menu's visual surface
  purely for its `--md-elevation-level`/`--md-card-shape` tokens and built-in `<md-shadow>`, rather
  than inventing new shape/elevation CSS.
- The AC recommended reusing the existing `md-hr` component (already used inside `md-select`, see
  `components/select/hr.js`) as the menu's group-divider element (matching the "vertical menu with
  divider" screenshot variant) instead of inventing a new `md-menu-divider`, unless visual inset
  requirements diverge enough to justify one.
- Confirmed (again, as in the card memory) that components in this repo are actually authored as
  `.js` files with JSDoc `@type` annotations, not literal `.ts`, despite the root `CLAUDE.md`
  describing `<name>.ts` — worth double-checking this hasn't changed before assuming either way in
  future component work.
- `package.json` `exports` map has historically missed entries for new components (confirmed
  earlier for `segmented-button`) — flagged again here as something to explicitly check/add for
  `menu` if/when it ships.

**Why:** Captures non-obvious research findings (spec page unreachable a third time now, no
menu/popover primitive exists, native popovertarget doesn't cross shadow-DOM boundaries, nested
popover stacking is unverified) so the next agent picking up `md-menu` implementation doesn't
re-discover them from scratch, and doesn't accidentally conflate this with `md-select`.

**How to apply:** Before starting `md-menu` implementation, re-check whether `components/menu/` has
been added since this memory was written, re-verify the imperative-popover / nested-stacking
behavior claims by testing in real browsers rather than trusting the AC, and treat any exact
dp/spacing/motion values in the AC as placeholders pending Figma/design confirmation.
