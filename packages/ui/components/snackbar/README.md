# md-snackbar

Material Design 3 snackbar. A snackbar shows a short message about a process the app has performed or will perform, optionally with a single action (such as "Undo") and a close icon button.

**`md-snackbar` is purely presentational.** It renders the snackbar surface and nothing else. It has no `open` state, no timers, no queueing, no enter/exit animation, and no screen positioning. Showing, hiding, positioning, auto-dismissing and queueing snackbars is entirely the consumer's responsibility. Even the close icon button never hides the snackbar: it only dispatches a cancelable `close` event, and you decide what to do with it (typically, remove the element).

## Installation

```bash
npm install @symblight/wc-material
```

## Import

```js
import "@symblight/wc-material"; // registers all components
// or individually:
import "@symblight/wc-material/snackbar";
```

The `action` slot is typically filled with `md-button`, so import it too if you register components individually:

```js
import "@symblight/wc-material/button";
```

## Basic Usage

```html
<md-snackbar>Single-line snackbar</md-snackbar>
```

This renders an inline (`display: block`) surface in normal document flow. It is always "visible" while it is in the DOM.

## Examples

### 1. Supporting text only

```html
<md-snackbar>Connection restored</md-snackbar>
```

### 2. With an action

Slot a text button into `action`. Its label color is set to `--md-snackbar-action-color` (inverse primary by default).

```html
<md-snackbar>
  Message archived
  <md-button slot="action" variant="text">Undo</md-button>
</md-snackbar>
```

The action wrapper is hidden (no reserved space) when nothing is slotted into `action`.

### 3. With a close icon

`show-close` renders a close icon button. Clicking it dispatches `close`; it does not hide the snackbar.

```html
<md-snackbar show-close>
  Message archived
  <md-button slot="action" variant="text">Undo</md-button>
</md-snackbar>
```

Localize the button's accessible name with `close-label`:

```html
<md-snackbar show-close close-label="Schließen"
  >Nachricht archiviert</md-snackbar
>
```

### 4. Two-line

`multiline` raises the minimum block size to 68dp for text that wraps onto a second line.

```html
<md-snackbar show-close multiline>
  This is a longer supporting text that wraps onto a second line, so the
  two-line layout is used.
  <md-button slot="action" variant="text">Action</md-button>
</md-snackbar>
```

### 5. Stacked (longer action)

`stacked` moves the action below the supporting text, aligned to the end. Use it when the action label is long. `stacked` implies the two-line minimum height, so `multiline` is not needed in addition.

```html
<md-snackbar show-close stacked>
  This is a longer supporting text that wraps onto a second line, with a longer
  action placed underneath.
  <md-button slot="action" variant="text">Longer action</md-button>
</md-snackbar>
```

### 6. Consumer-managed show, position, auto-dismiss and remove

Because the component has no state of its own, you create it when you want to show it, place it in a container, and remove it when it should go away. The example below uses a fixed bottom container, a timeout for auto-dismiss, and the `close` event (and the action) for manual dismissal.

```html
<!-- Positioning is yours: a fixed container at the bottom of the viewport. -->
<div
  id="snackbar-host"
  style="
    position: fixed;
    inset-inline: 0;
    inset-block-end: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    pointer-events: none;
    z-index: 1000;
  "
></div>

<md-button id="archive">Archive</md-button>

<script type="module">
  import "@symblight/wc-material";

  const host = document.querySelector("#snackbar-host");

  function showSnackbar(
    message,
    { actionLabel, onAction, timeout = 5000 } = {},
  ) {
    const snackbar = document.createElement("md-snackbar");
    snackbar.setAttribute("show-close", "");
    snackbar.style.pointerEvents = "auto"; // host ignores pointer events
    snackbar.textContent = message;

    let timer;
    const dismiss = () => {
      clearTimeout(timer);
      snackbar.remove();
    };

    if (actionLabel) {
      const action = document.createElement("md-button");
      action.slot = "action";
      action.setAttribute("variant", "text");
      action.textContent = actionLabel;
      action.addEventListener("click", () => {
        onAction?.();
        dismiss();
      });
      snackbar.append(action);
    }

    // The component never hides itself: remove it in response to `close`.
    snackbar.addEventListener("close", (event) => {
      // event.preventDefault() here would be the place to veto, if desired.
      dismiss();
    });

    host.append(snackbar);

    // Auto-dismiss is also yours to implement.
    if (timeout > 0) timer = setTimeout(dismiss, timeout);

    return dismiss;
  }

  document.querySelector("#archive").addEventListener("click", () => {
    showSnackbar("Message archived", {
      actionLabel: "Undo",
      onAction: () => console.log("undo"),
    });
  });
</script>
```

Animation (fade/slide in and out), queueing (showing one snackbar at a time) and pausing the timer on hover/focus are likewise left to the consumer. If you animate removal, wait for the animation to finish before calling `remove()`.

### 7. Respecting `cancelable`

`close` is cancelable, so a parent or wrapper can intercept it, for example to confirm before dismissal. The component takes no action either way.

```js
document.addEventListener("close", (event) => {
  if (
    event.target instanceof HTMLElement &&
    event.target.localName === "md-snackbar"
  ) {
    if (!confirmDismiss()) event.preventDefault();
  }
});
```

### CSS custom property overrides

```html
<md-snackbar
  show-close
  style="
    --md-snackbar-container-color: #1b5e20;
    --md-snackbar-supporting-text-color: #ffffff;
    --md-snackbar-action-color: #a5d6a7;
    --md-snackbar-shape: 0.75rem;
    --md-snackbar-max-inline-size: 30rem;
  "
>
  Saved successfully
  <md-button slot="action" variant="text">View</md-button>
</md-snackbar>
```

### Styling parts

```css
md-snackbar::part(surface) {
  border: 1px solid currentColor;
}
md-snackbar::part(text) {
  font-weight: 500;
}
```

---

## API

### Properties

| Property     | Attribute     | Type      | Default   | Description                                                                                                            |
| ------------ | ------------- | --------- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `showClose`  | `show-close`  | `boolean` | `false`   | Renders a close icon button that dispatches `close` when clicked. Reflects as an attribute.                            |
| `multiline`  | `multiline`   | `boolean` | `false`   | Two-line layout: raises the minimum block size to 68dp (4.25rem). Reflects as an attribute.                            |
| `stacked`    | `stacked`     | `boolean` | `false`   | Longer-action layout: the action moves below the supporting text. Implies the multiline height. Reflects as attribute. |
| `closeLabel` | `close-label` | `string`  | `"Close"` | Accessible label (`aria-label`) of the close icon button. Only used when `show-close` is set.                          |

There is deliberately no `open`, `duration`, `position` or similar property. An internal private `#hasAction` field tracks whether the `action` slot has content; it is not public API.

### Slots

| Slot        | Description                                                                     |
| ----------- | ------------------------------------------------------------------------------- |
| _(default)_ | Supporting text                                                                 |
| `action`    | Optional single action, typically `<md-button variant="text">`. Hidden if empty |

### Events

| Event   | Detail | Description                                                                                                                                                                                                  |
| ------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `close` | none   | `CustomEvent` dispatched when the close icon button is clicked. `bubbles: true`, `composed: true`, `cancelable: true`. The component never hides or removes itself in response; the consumer must handle it. |

Only the close icon button dispatches `close`. Clicks on a slotted action are ordinary `click` events on your own element. Note that `close` bubbles and is composed, so a listener on an ancestor will also receive `close` events from other `close`-dispatching descendants (for example `md-dialog`); check `event.target`.

### CSS Parts

| Part      | Element            | Description                                       |
| --------- | ------------------ | ------------------------------------------------- |
| `surface` | `<div>`            | The snackbar container (also `role="status"`)     |
| `text`    | `<div>`            | Wrapper around the default (supporting text) slot |
| `action`  | `<div>`            | Wrapper around the `action` slot                  |
| `close`   | `<md-icon-button>` | The close icon button (only when `show-close`)    |

### CSS Custom Properties

| Property                              | Default                                                    | Description                              |
| ------------------------------------- | ---------------------------------------------------------- | ---------------------------------------- |
| `--md-snackbar-container-color`       | `var(--md-sys-color-inverse-surface)`                      | Container background color               |
| `--md-snackbar-supporting-text-color` | `var(--md-sys-color-inverse-on-surface)`                   | Supporting text color                    |
| `--md-snackbar-action-color`          | `var(--md-sys-color-inverse-primary)`                      | Slotted action label color               |
| `--md-snackbar-icon-color`            | `var(--md-sys-color-inverse-on-surface)`                   | Close icon color                         |
| `--md-snackbar-shape`                 | `var(--md-sys-shape-corner-extra-small, 0.25rem)`          | Container corner radius                  |
| `--md-snackbar-min-inline-size`       | `21.5rem` (344dp)                                          | Minimum width                            |
| `--md-snackbar-max-inline-size`       | `42rem` (672dp)                                            | Maximum width                            |
| `--md-snackbar-text-font`             | `var(--md-sys-typescale-body-medium-font, inherit)`        | Supporting text font family              |
| `--md-snackbar-text-size`             | `var(--md-sys-typescale-body-medium-size, 0.875rem)`       | Supporting text font size                |
| `--md-snackbar-text-line-height`      | `var(--md-sys-typescale-body-medium-line-height, 1.25rem)` | Supporting text line height              |
| `--md-snackbar-text-weight`           | `var(--md-sys-typescale-body-medium-weight, 400)`          | Supporting text font weight              |
| `--md-snackbar-text-tracking`         | `var(--md-sys-typescale-body-medium-tracking, 0.016rem)`   | Supporting text letter spacing           |
| `--md-elevation-level`                | `3`                                                        | Shadow elevation level (via `md-shadow`) |

---

## Accessibility

| Aspect         | Detail                                                                                                                                                                                                                                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Role           | The `surface` part has `role="status"` and `aria-live="polite"`. The host element itself has no role.                                                                                                                                                                                                                                                        |
| Announcement   | Live regions announce changes to content that is already in the accessibility tree. A snackbar inserted into the DOM already populated is not reliably announced by every screen reader. For dependable announcements, keep a persistent host (or live region) and insert the snackbar into it, as in example 6, or update the text of an existing snackbar. |
| Close button   | Rendered as `md-icon-button` with `aria-label` set from `close-label` (default `"Close"`). Localize it for non-English UIs. It is a native-button-backed, tabbable control activated with `Enter`/`Space`.                                                                                                                                                   |
| Action         | Slotted content is your own element (typically `md-button`) and is tabbable and operable like any button. The snackbar adds no keyboard handling.                                                                                                                                                                                                            |
| Keyboard       | The component implements no `Escape` handling and does not manage or move focus. If you want `Escape` to dismiss, implement it in your consumer code.                                                                                                                                                                                                        |
| Timing         | Auto-dismiss is the consumer's job. Do not dismiss too quickly: keep a snackbar with an action visible long enough to read and operate (WCAG 2.2.1 Timing Adjustable), and consider pausing the timer while it is hovered or contains focus. Provide an alternate way to reach the action when it is the only way to perform a task.                         |
| Color contrast | Defaults use the inverse color roles (`inverse-surface` / `inverse-on-surface` / `inverse-primary`), which are designed to meet contrast. Re-check contrast if you override the color properties.                                                                                                                                                            |

## Related Components

- [`md-button`](../button/README.md) — use `variant="text"` for the `action` slot
- [`md-icon-button`](../icon-button/README.md) — used internally for the close button
- `md-shadow` — used internally for the container elevation
- [`md-tooltip`](../tooltip/README.md) — another lightweight transient-feedback surface
