# md-list + md-list-item

Material Design 3 list components. `md-list` is a container that renders a semantic `<ul>` and manages keyboard navigation across its interactive children. `md-list-item` is the individual row — non-interactive by default, upgraded to a button or link by setting `button` or `href`.

## Installation

```bash
npm install @symblight/wc-material
```

## Import

```js
import '@symblight/wc-material'; // registers all components
// or individually:
import '@symblight/wc-material/components/list/list.js';
import '@symblight/wc-material/components/list/list-item.js';
```

## Basic Usage

```html
<md-list>
  <md-list-item>
    <md-icon slot="leading"><!-- svg --></md-icon>
    Inbox
    <span slot="trailing">24</span>
  </md-list-item>
  <md-list-item>
    <md-icon slot="leading"><!-- svg --></md-icon>
    Sent
    <span slot="trailing">5</span>
  </md-list-item>
</md-list>
```

## Examples

### 1. Non-interactive list with leading icon and trailing text

All slots are optional. Empty slots collapse — they do not reserve space.

```html
<md-list>
  <md-list-item>
    <md-icon slot="leading"><!-- inbox svg --></md-icon>
    Inbox
    <span slot="trailing">24</span>
  </md-list-item>
  <md-list-item>
    <md-icon slot="leading"><!-- send svg --></md-icon>
    Sent
    <span slot="trailing">5</span>
  </md-list-item>
  <md-list-item>
    <md-icon slot="leading"><!-- drafts svg --></md-icon>
    Drafts
    <span slot="trailing">2</span>
  </md-list-item>
  <md-list-item>
    <md-icon slot="leading"><!-- delete svg --></md-icon>
    Trash
    <span slot="trailing">0</span>
  </md-list-item>
</md-list>
```

### 2. Two-line list with overline and supporting-text

Item height grows automatically to fit all three text rows (overline → label → supporting-text).

```html
<md-list>
  <md-list-item>
    <span slot="overline">Work</span>
    Project Alpha
    <span slot="supporting-text">Due in 3 days</span>
    <span slot="trailing">Jan 6</span>
  </md-list-item>
  <md-list-item>
    <span slot="overline">Personal</span>
    Dentist Appointment
    <span slot="supporting-text">Confirmed — 2:30 PM</span>
    <span slot="trailing">Jan 9</span>
  </md-list-item>
  <md-list-item>
    <span slot="overline">Work</span>
    Team Retrospective
    <span slot="supporting-text">Zoom link in calendar</span>
    <span slot="trailing">Jan 12</span>
  </md-list-item>
</md-list>
```

### 3. Interactive button list with avatar and trailing checkbox

Set `button` to wrap item content in a `<button>` that receives ripple and focus-ring. Arrow-key navigation is managed by `md-list` automatically.

```html
<md-list>
  <md-list-item button>
    <img slot="leading" src="https://i.pravatar.cc/40?img=1" alt="Alice" />
    Alice Johnson
    <span slot="supporting-text">alice@example.com</span>
    <md-checkbox slot="trailing"></md-checkbox>
  </md-list-item>
  <md-list-item button>
    <img slot="leading" src="https://i.pravatar.cc/40?img=2" alt="Bob" />
    Bob Smith
    <span slot="supporting-text">bob@example.com</span>
    <md-checkbox slot="trailing"></md-checkbox>
  </md-list-item>
  <md-list-item button>
    <img slot="leading" src="https://i.pravatar.cc/40?img=3" alt="Carol" />
    Carol Williams
    <span slot="supporting-text">carol@example.com</span>
    <md-checkbox slot="trailing"></md-checkbox>
  </md-list-item>
</md-list>
```

Note: clicking the trailing `md-checkbox` fires the checkbox's own `change` event. The item's native `click` event fires when the button surface itself is activated. Selection state is owned entirely by the slotted control — `md-list-item` does not mirror or manage it.

### 4. Interactive link list with leading icon and trailing chevron

Set `href` to render an `<a>` element with ripple and focus-ring. `href` takes precedence over `button` when both are present.

```html
<md-list>
  <md-list-item href="/settings">
    <md-icon slot="leading"><!-- settings svg --></md-icon>
    Settings
    <span slot="supporting-text">Manage your preferences</span>
    <md-icon slot="trailing"><!-- chevron_right svg --></md-icon>
  </md-list-item>
  <md-list-item href="/profile">
    <md-icon slot="leading"><!-- person svg --></md-icon>
    Profile
    <span slot="supporting-text">Edit your personal details</span>
    <md-icon slot="trailing"><!-- chevron_right svg --></md-icon>
  </md-list-item>
  <md-list-item href="/notifications">
    <md-icon slot="leading"><!-- notifications svg --></md-icon>
    Notifications
    <span slot="supporting-text">Configure alerts and reminders</span>
    <md-icon slot="trailing"><!-- chevron_right svg --></md-icon>
  </md-list-item>
</md-list>
```

### 5. Leading selection (checkbox on left)

Place a selection control in the `leading` slot to position it before the text zone.

```html
<md-list>
  <md-list-item button>
    <md-checkbox slot="leading"></md-checkbox>
    Select all items
  </md-list-item>
  <md-list-item button>
    <md-checkbox slot="leading"></md-checkbox>
    Inbox
    <span slot="supporting-text">24 messages</span>
  </md-list-item>
  <md-list-item button>
    <md-checkbox slot="leading"></md-checkbox>
    Sent
    <span slot="supporting-text">5 messages</span>
  </md-list-item>
</md-list>
```

### CSS custom property overrides

```html
<md-list style="--md-list-container-color: #f3f3f3;">
  <md-list-item
    style="
      --md-list-item-label-text-color: #1a1a1a;
      --md-list-item-focus-ring-color: #6750a4;
    "
  >
    Custom styled item
  </md-list-item>
</md-list>
```

---

## API — md-list

`md-list` has no publicly settable properties. It exposes a single default slot for `md-list-item` children and manages roving-tabindex keyboard navigation automatically.

### Slots — md-list

| Slot | Description |
| ---- | ----------- |
| *(default)* | `md-list-item` children |

### CSS Custom Properties — md-list

| Property | Default | Description |
| -------- | ------- | ----------- |
| `--md-list-container-color` | `var(--md-sys-color-surface)` | List background color |
| `--md-list-divider-color` | `var(--md-sys-color-outline-variant)` | Color token available for custom dividers; not applied by the component itself |

---

## API — md-list-item

### Properties — md-list-item

| Property | Attribute | Type | Default | Description |
| -------- | --------- | ---- | ------- | ----------- |
| `button` | `button` | `boolean` | `false` | Renders an inner `<button>` with ripple and focus ring. Reflects as an attribute. |
| `href` | `href` | `string \| undefined` | `undefined` | Renders an inner `<a href="...">` with ripple and focus ring. Takes precedence over `button` when both are set. Reflects as an attribute. |

### Slots — md-list-item

| Slot | Position | Description |
| ---- | -------- | ----------- |
| *(default)* | Text zone | Headline / label text |
| `overline` | Text zone, above label | Small metadata text; styled with label-small typescale, uppercase |
| `supporting-text` | Text zone, below label | Secondary description; styled with body-medium typescale |
| `leading` | Leading zone | Any leading content: icon, avatar, image, checkbox, radio, switch |
| `trailing` | Trailing zone | Any trailing content: icon, text, checkbox, radio, switch |

All slots are optional. A slot's wrapper element is hidden (`display: none`) when the slot is empty, so unused slots do not reserve space or affect layout.

### Events — md-list-item

| Event | Detail | Description |
| ----- | ------ | ----------- |
| `click` | — | Native click event fired by the inner `<button>` or `<a>` when the item is interactive. No synthetic events are dispatched. |

### CSS Parts — md-list-item

| Part | Element | Description |
| ---- | ------- | ----------- |
| `interactive` | `<button>` or `<a>` | The interactive inner element; exposed for external focus-ring or layout overrides |

### CSS Custom Properties — md-list-item

#### Colors

| Property | Default | Description |
| -------- | ------- | ----------- |
| `--md-list-item-container-color` | `var(--md-sys-color-surface)` | Item background |
| `--md-list-item-label-text-color` | `var(--md-sys-color-on-surface)` | Headline text color |
| `--md-list-item-overline-color` | `var(--md-sys-color-on-surface-variant)` | Overline text color |
| `--md-list-item-supporting-text-color` | `var(--md-sys-color-on-surface-variant)` | Supporting text color |
| `--md-list-item-trailing-text-color` | `var(--md-sys-color-on-surface-variant)` | Trailing text color |
| `--md-list-item-leading-icon-color` | `var(--md-sys-color-on-surface-variant)` | Leading icon color |
| `--md-list-item-trailing-icon-color` | `var(--md-sys-color-on-surface-variant)` | Trailing icon color |

#### Typography

| Property | Default | Description |
| -------- | ------- | ----------- |
| `--md-list-item-label-text-size` | `var(--md-sys-typescale-body-large-size, 1rem)` | Headline font size |
| `--md-list-item-label-text-line-height` | `var(--md-sys-typescale-body-large-line-height, 1.5rem)` | Headline line height |
| `--md-list-item-label-text-weight` | `var(--md-sys-typescale-body-large-weight, 400)` | Headline font weight |
| `--md-list-item-overline-text-size` | `var(--md-sys-typescale-label-small-size, 0.6875rem)` | Overline font size |
| `--md-list-item-supporting-text-size` | `var(--md-sys-typescale-body-medium-size, 0.875rem)` | Supporting text font size |
| `--md-list-item-trailing-text-size` | `var(--md-sys-typescale-label-small-size, 0.6875rem)` | Trailing text font size |

#### State layers and focus

| Property | Default | Description |
| -------- | ------- | ----------- |
| `--md-list-item-hover-state-layer-color` | `var(--md-sys-color-on-surface)` | Hover state layer color |
| `--md-list-item-hover-state-layer-opacity` | `var(--md-sys-state-hover-state-layer-opacity, 0.08)` | Hover state layer opacity |
| `--md-list-item-pressed-state-layer-color` | `var(--md-sys-color-on-surface)` | Pressed state layer color |
| `--md-list-item-pressed-state-layer-opacity` | `var(--md-sys-state-pressed-state-layer-opacity, 0.12)` | Pressed state layer opacity |
| `--md-list-item-focus-ring-color` | `var(--md-sys-color-primary)` | Focus ring color |

#### Sizing

| Property | Default | Description |
| -------- | ------- | ----------- |
| `--md-list-item-leading-avatar-size` | `2.5rem` (40dp) | Width and height of the leading avatar container |
| `--md-list-item-leading-icon-size` | `1.5rem` (24dp) | Width and height of the leading icon container |
| `--md-list-item-leading-media-width` | `4.5rem` (72dp) | Width of the leading media container |
| `--md-list-item-leading-media-height` | `3.5rem` (56dp) | Height of the leading media container |

---

## Accessibility

### md-list

| Aspect | Detail |
| ------ | ------ |
| Shadow DOM element | `<ul role="list">` |
| Host role | None (no `role` attribute on the host) |
| Keyboard navigation | Arrow Down / Arrow Up move focus between interactive items; wraps at each end. Home jumps to the first interactive item. End jumps to the last. All four keys call `preventDefault()` to block native scroll. |
| Non-interactive items | Static items are excluded from the roving-tabindex set and are not reachable by arrow keys. |
| Tab key | Not intercepted. Tab moves focus in the normal document order. |

### md-list-item

| Mode | Shadow DOM element | Keyboard | Tab stop |
| ---- | ------------------ | -------- | -------- |
| Static (default) | `<li>` only | — | No |
| `button` | `<li>` + inner `<button type="button">` | Enter, Space | Yes (managed by `md-list` roving tabindex) |
| `href` | `<li>` + inner `<a href="...">` | Enter | Yes (managed by `md-list` roving tabindex) |

Additional notes:

- The host element carries no explicit `role` attribute. Semantics are provided by the native `<li>` inside the shadow root.
- When `md-list-item` is used with `button` or `href`, the interactive inner element has `part="interactive"` and an initial `tabindex="0"`. When `md-list` is present, it reassigns tabindex values using a roving-tabindex pattern (one item at `0`, others at `-1`).
- Focus-visible state produces a `3px solid` outline using `--md-list-item-focus-ring-color`, inset by `3px` via `outline-offset: -3px`.
- Slotted selection controls (`md-checkbox`, `md-radio`, `md-switch`) own their own `aria-checked` / `aria-selected` state. `md-list-item` does not mirror, toggle, or manage selection state.
- Slotted `<img>` elements must include a descriptive `alt` attribute.
- `prefers-reduced-motion` is respected: interactive transition is set to `none` when the user preference is active.

---

## Related Components

- [`md-checkbox`](../checkbox/README.md) — suitable for `leading` and `trailing` selection slots
- [`md-icon`](../icon/README.md) — suitable for `leading` and `trailing` icon slots
- [`md-ripple`](../ripple/README.md) — used internally by `md-list-item`; not directly consumed by callers
- [`md-divider`](../divider/README.md) — can be placed between items inside `md-list` for visual separation
