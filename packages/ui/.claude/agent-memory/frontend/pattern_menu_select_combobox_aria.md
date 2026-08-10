---
name: pattern_menu_select_combobox_aria
description: md-select's menu-mode combobox/listbox ARIA + keyboard-open pattern built against md-menu, and a Lit async-lifecycle gotcha found while building it
metadata:
  type: project
---

Built (2026-08-10) a deep focus/keyboard/ARIA pass on `md-select`'s "menu mode"
(when `<md-select>` has `<md-menu-item>` children, `<md-menu>` becomes the
visible control instead of the native `<select>`), benchmarked against
Google's Material Web `select.ts`/`menu.ts`/`menuItemController.ts`
(`material-components/material-web` on GitHub — raw.githubusercontent.com
URLs fetch cleanly, blob URLs don't).

**What Google actually does** (for future comparisons — don't re-derive):
their field renders `role="combobox"` + `aria-haspopup="listbox"` +
`aria-expanded` + `aria-controls="listbox"` directly on the _focusable_
field element; their `<md-menu id="listbox">` gets an explicit
`role="listbox"` attribute that overrides the component's own
`ElementInternals`-set default role="menu" (attribute always wins over
`internals.role`); `SelectOption.type = 'option'` drives
`menuItemController.role` to return `"option"` instead of `"menuitem"`.
Keyboard: a `handleKeydown` on the field itself opens on
Space/ArrowDown/ArrowUp/End/Home/Enter when closed (and runs typeahead
directly via the menu's `typeaheadController` even while closed, selecting
without opening) — real DOM focus then moves into the listbox onto the
_selected_ item (not aria-activedescendant).

**What we built, generically opt-in on `md-menu`/`md-menu-item`** (mirrors
the constraint that new capabilities must not special-case select):

- `md-menu-item.type: "menuitem" | "option"` (default `"menuitem"`) — controls
  `role` and `aria-selected` on the interactive button. Exact naming/shape
  copied from Google's own `type` property.
- `md-menu.menuRole: "menu" | "listbox"` (attr `menu-role`, default `"menu"`)
  — controls the inner `.md-menu__list` div's `role`.
- `md-menu.focusOnOpen: "first" | "selected"` (attr `focus-on-open`, default
  `"first"`) — `_focusOnOpen()` routes `_onTriggerClick`/`_onTriggerContextMenu`
  through `focusFirstItem()` or the new `focusSelectedItem()`;
  `_initRovingTabindex()` also respects it for the baseline roving tabindex.
- New public `md-menu` methods: `focusSelectedItem()` (selected item,
  fallback first), `focusLastItem()` (symmetry with `focusFirstItem()`).
- `md-select` sets `menu-role="listbox"` + `focus-on-open="selected"` on its
  `<md-menu>`, `type="option"` on generated `<md-menu-item>`s, and manages
  `role="combobox"` / `aria-haspopup="listbox"` / `aria-controls` /
  `aria-expanded` **directly on the trigger `<button>`** rather than relying
  on `md-menu`'s automatic `_attachTriggerListeners()` ARIA wiring — because
  `<md-menu for="select-field">` anchors to the wrapping `<md-text-field>`
  (for positioning reasons predating this work — anchoring to the button
  excludes the field's padding/leading-icon area), not the button, so
  `_attachTriggerListeners()` stamps aria-haspopup/aria-expanded onto a
  non-focusable wrapper instead of the actual interactive element. Decided
  NOT to touch `_attachTriggerListeners()`'s hardcoded `aria-haspopup="menu"`
  to "fix" this — it's inert noise on a non-widget wrapper, and changing it
  risks regressing other `md-menu` consumers for no real accessibility gain.
- `md-select._onTriggerKeydown` adds ArrowUp/ArrowDown/Home/End handling on
  the trigger button when the menu is closed (native `<select>` opens on
  these without a prior click; `md-menu`'s own keydown listener is on the
  menu itself, a _sibling_ of the button in `md-select`'s shadow root, not
  an ancestor, so it never sees keydown while the button has focus).
  Deliberately did NOT implement Google's "typeahead-while-closed selects
  without opening" behavior — judged low value / real implementation risk
  vs. just opening the menu (typeahead already works fine once open).
  Also deliberately diverged from Google's own quirk where ArrowUp maps to
  FIRST_ITEM (same as Home) — used selected-item-or-first for both
  ArrowUp/ArrowDown instead, matching actual native `<select>` behavior,
  which is more intuitive than Google's own choice here.

**Lit async-lifecycle gotcha found and fixed**: `md-menu.show()` originally
only did `this.open = true; await this.updateComplete;` — but `updated()`
calls `_handleOpen()` (which does the actual popover positioning +
`_initRovingTabindex()`) _without awaiting it_, so `updateComplete` resolves
before `_handleOpen()` finishes. This was harmless as long as every caller
after `show()`/`open=true` computed the _same_ focus target as
`_initRovingTabindex()`'s own default — but once `_initRovingTabindex()`
started respecting `focusOnOpen`, an explicit override call
(`focusFirstItem()`/`focusLastItem()` for Home/End) could race and lose to
`_initRovingTabindex()` clobbering tabindex back to the selected item.
Fixed by having `updated()` store `this._openPromise = this._handleOpen()`
and `show()` do `await this.updateComplete; await this._openPromise;` — now
`show()` is genuinely awaitable end-to-end. General lesson for this
codebase: a Lit `updated()` that fires an async side-effect without storing
its promise makes any public method built on `updateComplete` alone
non-deterministic w.r.t. that side-effect's completion — check for this
before chaining `.then()` off a property-setter method.

See also [[pattern_popover_position_controller]] for the underlying
positioning primitive these both sit on top of.
