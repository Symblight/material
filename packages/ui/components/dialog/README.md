# md-dialog

A Material Design 3 dialog web component built with Lit.

## Usage

```html
<script type="module" src="path/to/wc-material/dist/index.es.js"></script>

<md-dialog id="my-dialog">
  <span slot="headline">Dialog title</span>
  <p slot="content">This is the dialog body content.</p>
  <div slot="actions">
    <md-button variant="text" id="cancel-btn">Cancel</md-button>
    <md-button id="confirm-btn">Confirm</md-button>
  </div>
</md-dialog>

<md-button id="open-btn">Open dialog</md-button>

<script>
  const dialog = document.getElementById('my-dialog');
  document.getElementById('open-btn').addEventListener('click', () => {
    dialog.open = true;
  });
  document.getElementById('cancel-btn').addEventListener('click', () => {
    dialog.open = false;
  });
  document.getElementById('confirm-btn').addEventListener('click', () => {
    dialog.open = false;
  });
</script>
```

## Properties

| Property | Attribute | Type      | Default | Description                         |
|----------|-----------|-----------|---------|-------------------------------------|
| `open`   | `open`    | `boolean` | `false` | Controls whether the dialog is open |

## Slots

| Slot         | Description                                        |
|--------------|----------------------------------------------------|
| `headline`   | Dialog title / headline text                       |
| `content`    | Main body content                                  |
| `actions`    | Action buttons (placed at the bottom of the dialog)|

## CSS Custom Properties

| Variable                                | Default                                     | Description                              |
|-----------------------------------------|---------------------------------------------|------------------------------------------|
| `--md-dialog-container-color`           | `var(--md-sys-color-surface-container-high)` | Dialog background color                 |
| `--md-dialog-container-radius`          | `1.75rem`                                   | Corner radius of the dialog container   |
| `--md-dialog-container-support-text-color` | `var(--md-sys-color-on-surface-variant)` | Color of the body / supporting text     |

> Variables fall back to Material Design system tokens. Include the MD3 theme CSS (`@symblight/wc-material/theme/theme.css`) or define the tokens manually.

## Examples

### Basic dialog

```html
<md-dialog open>
  <span slot="headline">Confirm action</span>
  <p slot="content">Are you sure you want to delete this item?</p>
  <div slot="actions">
    <md-button variant="text">Cancel</md-button>
    <md-button>Delete</md-button>
  </div>
</md-dialog>
```

### Open / close via JavaScript

```js
const dialog = document.querySelector('md-dialog');

// Open
dialog.open = true;

// Close
dialog.open = false;
```

### Custom colors and radius

```html
<md-dialog
  open
  style="
    --md-dialog-container-color: #f4eff4;
    --md-dialog-container-radius: 0.5rem;
    --md-dialog-container-support-text-color: #49454f;
  "
>
  <span slot="headline">Custom styled dialog</span>
  <p slot="content">Dialog with custom background and sharp corners.</p>
  <div slot="actions">
    <md-button variant="text">Close</md-button>
  </div>
</md-dialog>
```

### Via CSS class

```css
.brand-dialog {
  --md-dialog-container-color: oklch(97% 0.01 270);
  --md-dialog-container-radius: 1rem;
  --md-dialog-container-support-text-color: oklch(40% 0.05 270);
}
```

```html
<md-dialog class="brand-dialog">
  <span slot="headline">Branded dialog</span>
  <p slot="content">Content goes here.</p>
</md-dialog>
```
