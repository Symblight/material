# md-menu

Material Design 3 menu. Anchors a `popover="auto"` surface to a trigger element resolved via the `for` attribute (or to arbitrary viewport coordinates via `openAtPoint()` for a context menu). Supports submenus, item groups, roving-tabindex keyboard navigation, and typeahead.

## Installation

```bash
npm install @symblight/wc-material
```

## Import

```js
import "@symblight/wc-material"; // registers all components
// or individually:
import "@symblight/wc-material/menu";
```

## Basic Usage

```html
<md-button id="trigger">Open menu</md-button>
<md-menu for="trigger">
  <md-menu-item value="profile">Profile</md-menu-item>
  <md-menu-item value="settings">Settings</md-menu-item>
  <md-menu-item value="logout">Log out</md-menu-item>
</md-menu>

<script type="module">
  document.querySelector("md-menu").addEventListener("select", (event) => {
    console.log(event.detail.value, event.detail.item);
  });
</script>
```

`md-menu` finds its trigger the same way `md-ripple`/`md-tooltip` do — via `for="<id>"` resolved against the host's root node (`HTMLForController`). By default it opens on `click`, dispatches `select` when an item is activated, and closes itself.

## Examples

### 1. Menu items with leading icon, supporting text, and a trailing shortcut

```html
<md-button id="trigger-1">Actions</md-button>
<md-menu for="trigger-1">
  <md-menu-item value="copy">
    <md-icon slot="leading"><!-- copy svg --></md-icon>
    Copy
    <span slot="supporting-text">Duplicate this item</span>
    <span slot="trailing">⌘C</span>
  </md-menu-item>
  <md-menu-item value="share">
    <md-icon slot="leading"><!-- share svg --></md-icon>
    Share
    <span slot="trailing-badge">New</span>
  </md-menu-item>
  <md-menu-item value="delete" disabled>
    <md-icon slot="leading"><!-- delete svg --></md-icon>
    Delete
  </md-menu-item>
</md-menu>
```

### 2. Grouped items with a label header

`md-menu-group` mirrors `md-option-group` (`components/select/group.js`) — an optional "Label text" header above a set of items, purely visual/semantic. Keyboard navigation and typeahead flatten through it automatically.

```html
<md-button id="trigger-2">Sort by</md-button>
<md-menu for="trigger-2">
  <md-menu-group label="Date">
    <md-menu-item value="newest">Newest first</md-menu-item>
    <md-menu-item value="oldest">Oldest first</md-menu-item>
  </md-menu-group>
  <md-menu-group label="Name">
    <md-menu-item value="az">A → Z</md-menu-item>
    <md-menu-item value="za">Z → A</md-menu-item>
  </md-menu-group>
</md-menu>
```

### 3. Visually separated segments

`md-item-group` renders each top-level group as its own card segment with real spacing between segments — the MD3 "vertical menu with gap" pattern. Use it instead of (or alongside) `md-hr` when the relationship between groups should read as separate surfaces rather than a divider line.

```html
<md-button id="trigger-3">More</md-button>
<md-menu for="trigger-3">
  <md-item-group>
    <md-menu-item value="edit">Edit</md-menu-item>
    <md-menu-item value="duplicate">Duplicate</md-menu-item>
  </md-item-group>
  <md-item-group>
    <md-menu-item value="archive">Archive</md-menu-item>
    <md-menu-item value="delete">Delete</md-menu-item>
  </md-item-group>
</md-menu>
```

### 4. Submenu

Slot a nested `md-menu` into a `md-menu-item`'s `submenu` slot. A trailing chevron renders automatically. Opens on click or `ArrowRight`; closes on `ArrowLeft`, `Escape`, or pointing away.

```html
<md-button id="trigger-4">File</md-button>
<md-menu for="trigger-4">
  <md-menu-item value="new">New</md-menu-item>
  <md-menu-item value="open">Open</md-menu-item>
  <md-menu-item>
    Export as
    <md-menu slot="submenu">
      <md-menu-item value="pdf">PDF</md-menu-item>
      <md-menu-item value="png">PNG</md-menu-item>
      <md-menu-item value="svg">SVG</md-menu-item>
    </md-menu>
  </md-menu-item>
</md-menu>
```

### 5. Context menu

Set `trigger="contextmenu"` and let `md-menu` handle it, or drive it imperatively via `openAtPoint(x, y)` — e.g. to anchor on right-click anywhere within a custom hit area.

```html
<div id="canvas" style="block-size: 20rem;">Right-click me</div>
<md-menu id="ctx-menu" trigger="contextmenu" for="canvas">
  <md-menu-item value="cut">Cut</md-menu-item>
  <md-menu-item value="copy">Copy</md-menu-item>
  <md-menu-item value="paste">Paste</md-menu-item>
</md-menu>
```

```js
// Imperative alternative — no `for`/`trigger` needed:
const menu = document.querySelector("#ctx-menu");
document.querySelector("#canvas").addEventListener("contextmenu", (event) => {
  event.preventDefault();
  menu.openAtPoint(event.clientX, event.clientY);
});
```

### 6. Listbox mode (used internally by `md-select`)

`menu-role="listbox"` (`role="listbox"` instead of `role="menu"`) plus `focus-on-open="selected"` (focuses the currently-selected item when the menu reopens) is what `md-select` sets up internally when in its default menu mode — see `components/select/select.js`.

This mode isn't meant to be hand-authored directly with `md-menu-item`: `role="option"`/`aria-selected` on items now comes from `md-option` (`components/select/option.js`, via `ListboxItemMixin` shared with `md-menu-item`), which only renders that way as a child of `md-select` — it reads the current mode/value from `md-select`'s own context. `md-menu-item` itself always renders `role="menuitem"`, with no `aria-selected`, regardless of `menu-role`. See [`../select/README.md`](../select/README.md).

### 7. Hover trigger and vibrant variant

```html
<md-button id="trigger-7">Hover me</md-button>
<md-menu for="trigger-7" trigger="hover" variant="vibrant">
  <md-menu-item value="a">Option A</md-menu-item>
  <md-menu-item value="b">Option B</md-menu-item>
</md-menu>
```

### 8. Imperative open/close

```js
const menu = document.querySelector("md-menu");
await menu.show(); // opens and focuses the first item
await menu.close(); // closes and returns focus to the trigger
```

### CSS custom property overrides

```html
<md-menu
  for="trigger"
  style="
    --md-menu-surface-color: #fff;
    --md-menu-shape: 0.75rem;
  "
>
  <md-menu-item value="a" style="--md-menu-item-label-text-color: #1a1a1a;">
    Option A
  </md-menu-item>
</md-menu>
```

---

## API — md-menu

### Properties

| Property           | Attribute            | Type                                               | Default                                         | Description                                                                                                        |
| ------------------ | -------------------- | -------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `open`             | `open`               | `boolean`                                          | `false`                                         | Whether the menu is open. Reflects as an attribute.                                                                |
| `placement`        | `placement`          | `Placement` (floating-ui, e.g. `"bottom-start"`)   | `"bottom-start"` (`"right-start"` for submenus) | Preferred position relative to the anchor.                                                                         |
| `offset`           | `offset`             | `number`                                           | `4`                                             | Main-axis distance (px) between the anchor and the surface.                                                        |
| `xOffset`          | `x-offset`           | `number`                                           | `0`                                             | Extra cross-axis nudge, additive with `offset`.                                                                    |
| `yOffset`          | `y-offset`           | `number`                                           | `0`                                             | Extra main-axis nudge, additive with `offset`.                                                                     |
| `positioning`      | `positioning`        | `"absolute" \| "fixed" \| "document" \| "popover"` | `"popover"`                                     | Positioning strategy. `"popover"` uses the native Popover API and falls back to `"fixed"` on unsupported browsers. |
| `flip`             | `flip`               | `boolean`                                          | `true`                                          | Whether floating-ui may flip `placement` to stay in the viewport.                                                  |
| `variant`          | `variant`            | `"standard" \| "vibrant"`                          | `"standard"`                                    | Surface color scheme.                                                                                              |
| `trigger`          | `trigger`            | `"click" \| "hover" \| "contextmenu"`              | `"click"`                                       | How the `for`-resolved anchor opens the menu.                                                                      |
| `animation`        | `animation`          | `"true" \| "false"`                                | `"true"`                                        | Set to `"false"` to disable the open/close transition.                                                             |
| `matchAnchorWidth` | `match-anchor-width` | `boolean`                                          | `false`                                         | Constrains the surface's inline size to match the anchor's.                                                        |
| `menuRole`         | `menu-role`          | `"menu" \| "listbox"`                              | `"menu"`                                        | ARIA role of the surface. `"listbox"` for `md-select`-style usage — see the listbox mode example above.            |
| `focusOnOpen`      | `focus-on-open`      | `"first" \| "selected"`                            | `"first"`                                       | Which item receives focus when the menu opens.                                                                     |
| `anchorElement`    | —                    | `HTMLElement \| undefined`                         | `undefined`                                     | Explicit anchor override, bypassing `for` resolution. Used internally for submenus (anchored to the parent item).  |

### Methods

| Method                | Returns         | Description                                                                                                   |
| --------------------- | --------------- | ------------------------------------------------------------------------------------------------------------- |
| `show()`              | `Promise<void>` | Opens the menu and awaits the full open sequence (positioning + roving tabindex init).                        |
| `close(options?)`     | `Promise<void>` | Closes the menu. `options.returnFocus` (default `true`) controls whether focus returns to the trigger/anchor. |
| `openAtPoint(x, y)`   | `void`          | Opens the menu anchored to viewport coordinates `(x, y)` — the context-menu variant.                          |
| `focusFirstItem()`    | `void`          | Sets roving tabindex to and focuses the first item (including disabled items).                                |
| `focusLastItem()`     | `void`          | Sets roving tabindex to and focuses the last item (including disabled items).                                 |
| `focusSelectedItem()` | `void`          | Focuses the item with `selected` set, falling back to the first item.                                         |

### Slots

| Slot        | Description                                                            |
| ----------- | ---------------------------------------------------------------------- |
| _(default)_ | `md-menu-item`, `md-menu-group`, `md-item-group`, and `md-hr` children |

### Events

| Event     | Detail                                | Description                                                                      |
| --------- | ------------------------------------- | -------------------------------------------------------------------------------- |
| `select`  | `{ value: string, item: MdMenuItem }` | Re-dispatched (bubbles, composed) from a descendant `md-menu-item`'s activation. |
| `opening` | —                                     | Fired synchronously when the open sequence starts, before positioning/animation. |
| `opened`  | —                                     | Fired once the menu is open and any open animation has finished.                 |
| `closing` | —                                     | Fired synchronously when the close sequence starts, before the close animation.  |
| `closed`  | —                                     | Fired once the menu is closed and any close animation has finished.              |

### CSS Custom Properties

| Property                                     | Default                                      | Description                                                   |
| -------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------- |
| `--md-menu-min-width`                        | `12rem`                                      | Minimum inline size of the surface.                           |
| `--md-menu-max-width`                        | `22.5rem`                                    | Maximum inline size of the surface.                           |
| `--md-menu-max-height`                       | `min(70vh, 32rem)`                           | Maximum block size of each scrollable segment.                |
| `--md-menu-shape`                            | `var(--md-sys-shape-corner-large, 1rem)`     | Corner radius of the outer edges of the surface.              |
| `--md-menu-shape-inner`                      | `0.5rem`                                     | Corner radius between adjacent segments.                      |
| `--md-menu-surface-color`                    | `var(--md-sys-color-surface-container-low)`  | Surface background — `standard` variant.                      |
| `--md-menu-vibrant-surface-color`            | `var(--md-sys-color-tertiary-container)`     | Surface background — `vibrant` variant.                       |
| `--md-menu-selected-container-color`         | `var(--md-sys-color-secondary-container)`    | Selected item background — `standard` variant.                |
| `--md-menu-selected-label-color`             | `var(--md-sys-color-on-secondary-container)` | Selected item label color — `standard` variant.               |
| `--md-menu-vibrant-selected-container-color` | `var(--md-sys-color-primary-container)`      | Selected item background — `vibrant` variant.                 |
| `--md-menu-vibrant-selected-label-color`     | `var(--md-sys-color-on-primary-container)`   | Selected item label color — `vibrant` variant.                |
| `--md-menu-divider-color`                    | `var(--md-sys-color-outline-variant)`        | Color of a slotted `md-hr`.                                   |
| `--md-menu-z-index`                          | `1000`                                       | Stacking order for `fixed`/`absolute`/`document` positioning. |

---

## API — md-menu-item

### Properties

| Property   | Attribute   | Type                  | Default     | Description                                                                                                                                                                        |
| ---------- | ----------- | --------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`    | `value`     | `string`              | `""`        | Value dispatched in the `select` event detail.                                                                                                                                     |
| `href`     | `href`      | `string \| undefined` | `undefined` | Renders an inner `<a href>` instead of `<button>` — a navigation item.                                                                                                             |
| `disabled` | `disabled`  | `boolean`             | `false`     | Focusable but not activatable, per APG. Reflects as an attribute.                                                                                                                  |
| `selected` | `selected`  | `boolean`             | `false`     | Applies the selected-pill styling. Reflects as an attribute. `md-menu-item` never emits `aria-selected` — see `md-option` for listbox-style `role="option"`/`aria-selected` usage. |
| `keepOpen` | `keep-open` | `boolean`             | `false`     | Prevents the parent `md-menu` from closing after this item is selected. Reflects as an attribute.                                                                                  |

### Methods

| Method            | Returns   | Description                                                    |
| ----------------- | --------- | -------------------------------------------------------------- |
| `expandSubmenu()` | `boolean` | Opens this item's submenu (if any) and focuses its first item. |

### Slots

| Slot              | Description                                                                        |
| ----------------- | ---------------------------------------------------------------------------------- |
| _(default)_       | Item label text                                                                    |
| `leading`         | Leading icon or checkmark                                                          |
| `supporting-text` | Optional secondary line under the label                                            |
| `trailing-badge`  | Optional small pill (e.g. "New")                                                   |
| `trailing`        | Optional plain text, e.g. a keyboard shortcut (`⌘C`)                               |
| `submenu`         | A nested `<md-menu>`; presence of assigned content auto-renders a trailing chevron |

All slots are optional. A slot's wrapper is hidden (`display: none`) when empty, so unused slots do not reserve space.

### Events

| Event    | Detail                                | Description                                                                                            |
| -------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `select` | `{ value: string, item: MdMenuItem }` | Dispatched (bubbles, composed) on click / Enter / Space, unless `disabled` or the item owns a submenu. |

### CSS Parts

| Part              | Element             | Description                       |
| ----------------- | ------------------- | --------------------------------- |
| `interactive`     | `<button>` or `<a>` | The interactive inner element     |
| `leading`         | `<span>`            | Leading-zone wrapper              |
| `label`           | `<span>`            | The label text wrapper            |
| `supporting-text` | `<span>`            | The supporting-text wrapper       |
| `trailing-badge`  | `<span>`            | The trailing-badge wrapper        |
| `trailing`        | `<span>`            | The trailing-text wrapper         |
| `icon`            | `<md-icon>`         | The auto-rendered submenu chevron |

### CSS Custom Properties

| Property                                     | Default                                                      | Description                          |
| -------------------------------------------- | ------------------------------------------------------------ | ------------------------------------ |
| `--md-menu-item-container-color`             | `transparent`                                                | Item background                      |
| `--md-menu-item-label-text-color`            | `var(--md-sys-color-on-surface)`                             | Label text color                     |
| `--md-menu-item-supporting-text-color`       | `var(--md-sys-color-on-surface-variant)`                     | Supporting text color                |
| `--md-menu-item-trailing-text-color`         | `var(--md-sys-color-on-surface-variant)`                     | Trailing text color                  |
| `--md-menu-item-leading-icon-color`          | `var(--md-sys-color-on-surface-variant)`                     | Leading icon color                   |
| `--md-menu-item-trailing-icon-color`         | `var(--md-sys-color-on-surface-variant)`                     | Trailing icon / chevron color        |
| `--md-menu-item-badge-color`                 | `var(--md-sys-color-on-primary)`                             | Trailing-badge text color            |
| `--md-menu-item-badge-container-color`       | `var(--md-sys-color-primary)`                                | Trailing-badge background            |
| `--md-menu-item-label-text-size`             | `var(--md-sys-typescale-label-large-size, 0.875rem)`         | Label font size                      |
| `--md-menu-item-label-text-line-height`      | `var(--md-sys-typescale-label-large-line-height, 1.25rem)`   | Label line height                    |
| `--md-menu-item-label-text-weight`           | `var(--md-sys-typescale-label-large-weight, 500)`            | Label font weight                    |
| `--md-menu-item-supporting-text-size`        | `var(--md-sys-typescale-body-medium-size, 0.875rem)`         | Supporting text font size            |
| `--md-menu-item-supporting-text-line-height` | `var(--md-sys-typescale-body-medium-line-height, 1.25rem)`   | Supporting text line height          |
| `--md-menu-item-trailing-text-size`          | `var(--md-sys-typescale-label-small-size, 0.6875rem)`        | Trailing text font size              |
| `--md-menu-item-trailing-text-line-height`   | `var(--md-sys-typescale-label-small-line-height, 1rem)`      | Trailing text line height            |
| `--md-menu-item-hover-state-layer-color`     | `var(--md-sys-color-on-surface)`                             | Hover state layer color              |
| `--md-menu-item-hover-state-layer-opacity`   | `var(--md-sys-state-hover-state-layer-opacity, 0.08)`        | Hover state layer opacity            |
| `--md-menu-item-pressed-state-layer-color`   | `var(--md-sys-color-on-surface)`                             | Pressed state layer color            |
| `--md-menu-item-pressed-state-layer-opacity` | `var(--md-sys-state-pressed-state-layer-opacity, 0.12)`      | Pressed state layer opacity          |
| `--md-menu-item-focus-ring-color`            | `var(--md-sys-color-primary)`                                | Focus ring color                     |
| `--md-menu-item-selected-container-color`    | `var(--md-sys-color-secondary-container)` (via `md-menu`)    | Selected-pill background             |
| `--md-menu-item-selected-label-text-color`   | `var(--md-sys-color-on-secondary-container)` (via `md-menu`) | Selected-pill label color            |
| `--md-menu-item-leading-icon-size`           | `1.125rem` (18dp)                                            | Width/height of the leading zone     |
| `--md-menu-item-trailing-icon-size`          | `1.125rem` (18dp)                                            | Width/height of the trailing chevron |
| `--md-menu-item-min-block-size`              | `3rem` (48dp)                                                | Minimum block size of the row        |
| `--md-menu-item-padding-inline`              | `0.75rem`                                                    | Inline padding of the row            |
| `--md-menu-item-padding-block`               | `0.5rem`                                                     | Block padding of the row             |

`--md-menu-item-selected-*` are set by the parent `md-menu` (from its own `--md-menu-selected-*`/`--md-menu-vibrant-selected-*` tokens) but can be overridden per item.

---

## API — md-menu-group

Wraps a set of `md-menu-item` elements under an optional "Label text" header. Mirrored by `md-option-group` (`components/select/group.js`, which extends this class). Purely visual/semantic — `md-menu`'s keyboard navigation and typeahead flatten through it automatically.

### Properties

| Property | Attribute | Type     | Default | Description                                 |
| -------- | --------- | -------- | ------- | ------------------------------------------- |
| `label`  | `label`   | `string` | `""`    | Optional header text shown above the group. |

### Slots

| Slot        | Description             |
| ----------- | ----------------------- |
| _(default)_ | `md-menu-item` children |

### CSS Custom Properties

| Property                            | Default                                                    | Description           |
| ----------------------------------- | ---------------------------------------------------------- | --------------------- |
| `--md-menu-group-label-color`       | `var(--md-sys-color-on-surface-variant)`                   | Header text color     |
| `--md-menu-group-label-size`        | `var(--md-sys-typescale-label-small-size, 0.6875rem)`      | Header font size      |
| `--md-menu-group-label-weight`      | `var(--md-sys-typescale-label-small-weight, 500)`          | Header font weight    |
| `--md-menu-group-label-line-height` | `var(--md-sys-typescale-label-small-line-height, 1rem)`    | Header line height    |
| `--md-menu-group-label-tracking`    | `var(--md-sys-typescale-label-small-tracking, 0.03125rem)` | Header letter spacing |

---

## API — md-item-group

Wraps a set of `md-menu-item` elements into a visually distinct card segment (MD3 "vertical menu with gap" pattern), rather than a labeled section. Has no properties, slots beyond the default, or settable CSS custom properties of its own — it renders `display: contents` and lets `md-menu` do the segment layout.

### Slots

| Slot        | Description             |
| ----------- | ----------------------- |
| _(default)_ | `md-menu-item` children |

---

## Accessibility

| Aspect                  | Detail                                                                                                                                                                                                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Host role               | `role="menu"` (default) or `role="listbox"` when `menu-role="listbox"`                                                                                                                                                                                                                             |
| Accessible name         | `aria-labelledby` set on the host, pointing at the `for`-resolved trigger's `id`                                                                                                                                                                                                                   |
| Trigger ARIA            | `aria-haspopup="menu"` and `aria-expanded` kept in sync on the trigger element                                                                                                                                                                                                                     |
| Keyboard — open menu    | `ArrowDown`/`ArrowUp` move focus and wrap; `Home`/`End` jump to first/last; `ArrowRight`/`Enter`/`Space` open a submenu on an item that has one; `ArrowLeft`/`Escape` closes (submenu returns focus to its parent item); `Tab` lets focus leave naturally (native popover light-dismiss closes it) |
| Typeahead               | Printable-character keys jump to the next item whose label starts with the typed prefix; repeating the same character cycles through matches                                                                                                                                                       |
| Disabled items          | Focusable and part of the roving-tabindex sequence, but not activatable (APG)                                                                                                                                                                                                                      |
| Submenu ARIA            | Parent `md-menu-item` gets `aria-haspopup="menu"` and `aria-expanded`, synced to the submenu's open state                                                                                                                                                                                          |
| `md-menu-item` (`href`) | `aria-disabled` + `tabindex="-1"` + `pointer-events: none` in place of native `disabled` (`<a>` has no native disabled state)                                                                                                                                                                      |
| Reduced motion          | `prefers-reduced-motion: reduce` disables the open/close transition; same effect as `animation="false"`                                                                                                                                                                                            |

---

## Related Components

- [`md-select`](../select/README.md) — built on `md-menu` in `menu-role="listbox"` mode
- [`md-card`](../card/README.md) — used internally to render each menu segment surface
- [`md-icon`](../icon/README.md) — suitable for the `leading`/`trailing` slots
- [`md-ripple`](../ripple/README.md) — used internally by `md-menu-item`
- [`md-list`](../list/README.md) — for non-popover, static item lists
