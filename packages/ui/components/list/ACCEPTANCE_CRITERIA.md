# Acceptance Criteria: `md-list` + `md-list-item`

## Components

### `md-list`

- Renders as `<ul role="list">`
- Accepts `md-list-item` children via default slot
- Manages arrow-key keyboard navigation using roving tabindex across interactive children
- No selection state ownership

### `md-list-item`

- Renders as `<li>`
- Non-interactive by default (static layout element)
- `button` boolean attribute → wraps content in `<button>`, gets ripple + focus ring
- `href` attribute → wraps content in `<a href="...">`, gets ripple + focus ring
- Emits native `click` only — no synthetic events

---

## Slots — `md-list-item`

| Slot | Position | Description |
|---|---|---|
| *(default)* | Text zone | Headline / label text |
| `overline` | Text zone, above label | Small metadata text |
| `supporting-text` | Text zone, below label | Secondary description |
| `leading` | Leading zone | Any content: icon, avatar, image, checkbox, radio, switch |
| `trailing` | Trailing zone | Any content: icon, text, checkbox, radio, switch |

All slots are optional. Empty slots collapse — they do not reserve space.

---

## CSS Layout

Three horizontal zones: `[leading] [text] [trailing]`

- Text zone stacks vertically: overline → label → supporting-text
- Height driven by content: ~56dp (label only) → ~72dp (+ supporting) → ~88dp (+ overline + supporting)
- No explicit `lines` attribute — layout responds to populated slots

---

## Accessibility

- `md-list` → `<ul>`, no extra role
- `md-list-item` → `<li>`, no extra role
- Interactive `<button>` or `<a>` inside `<li>` carries focus and keyboard semantics
- Slotted controls (`md-checkbox`, `md-radio`, `md-switch` etc.) own their own `aria-checked` / `aria-selected` — `md-list-item` does not mirror or manage selection state

---

## HTML Usage Examples

```html
<!-- Non-interactive, single line with icon and trailing text -->
<md-list>
  <md-list-item>
    <md-icon slot="leading"><svg>…</svg></md-icon>
    Inbox
    <span slot="trailing">24</span>
  </md-list-item>
</md-list>

<!-- Non-interactive, two-line with overline -->
<md-list>
  <md-list-item>
    <span slot="overline">Folder</span>
    Inbox
    <span slot="supporting-text">3 unread messages</span>
    <span slot="trailing">Jan 6</span>
  </md-list-item>
</md-list>

<!-- Interactive button with avatar and trailing checkbox -->
<md-list>
  <md-list-item button>
    <img slot="leading" src="avatar.jpg" alt="Jane" />
    Jane Doe
    <span slot="supporting-text">jane@example.com</span>
    <md-checkbox slot="trailing"></md-checkbox>
  </md-list-item>
</md-list>

<!-- Interactive link with leading icon and trailing chevron -->
<md-list>
  <md-list-item href="/settings">
    <md-icon slot="leading"><svg>…</svg></md-icon>
    Settings
    <md-icon slot="trailing"><svg>…</svg></md-icon>
  </md-list-item>
</md-list>

<!-- Leading checkbox (selection on left) -->
<md-list>
  <md-list-item button>
    <md-checkbox slot="leading"></md-checkbox>
    Select all items
  </md-list-item>
</md-list>
```
