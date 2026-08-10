import { html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import moreVert from "@material-design-icons/svg/outlined/more_vert.svg?raw";
import edit from "@material-design-icons/svg/outlined/edit.svg?raw";
import contentCopy from "@material-design-icons/svg/outlined/content_copy.svg?raw";
import deleteIcon from "@material-design-icons/svg/outlined/delete.svg?raw";
import visibility from "@material-design-icons/svg/outlined/visibility.svg?raw";
import cloud from "@material-design-icons/svg/outlined/cloud.svg?raw";
import share from "@material-design-icons/svg/outlined/share.svg?raw";
import link from "@material-design-icons/svg/outlined/link.svg?raw";

import "../index.js";
import "../../icon-button/icon-button.js";
import "../../icon/icon.js";
import "../../select/select.js";
import "../../card/card.js";

/** @import { MdMenu } from "../menu.js" */

/** @type {import("@storybook/web-components").Meta<MdMenu>} */
const meta = {
  title: "Components/Menu",
  component: "md-menu",
  tags: ["autodocs"],
  argTypes: {
    placement: {
      control: { type: "select" },
      options: [
        "top",
        "top-start",
        "top-end",
        "bottom",
        "bottom-start",
        "bottom-end",
        "right-start",
        "left-start",
      ],
      description: "Preferred floating-ui placement relative to the anchor.",
    },
    offset: {
      control: { type: "number" },
      description: "Pixel gap between the anchor and the menu surface.",
    },
    flip: {
      control: { type: "boolean" },
      description:
        "Repositions the menu to the opposite side when it would overflow the viewport.",
    },
    variant: {
      control: { type: "select" },
      options: ["standard", "vibrant"],
      description:
        "standard = surface-container tokens (matches md-card elevated). vibrant = brighter tonal/accent color style for expressive vertical menus.",
    },
    trigger: {
      control: { type: "select" },
      options: ["click", "hover", "contextmenu"],
      description:
        "How the menu opens relative to its `for` anchor. hover is typically used for submenus, contextmenu for the context-menu variant.",
    },
  },
  args: {
    placement: "bottom-start",
    offset: 4,
    flip: true,
    variant: "standard",
    trigger: "click",
  },
};
export default meta;

/** @typedef {import("@storybook/web-components").StoryObj<MdMenu>} Story */

// ── 1. Icon-button trigger dropdown ─────────────────────────────────────────

/**
 * A simple dropdown opened from an `md-icon-button` trigger. The trigger
 * supplies its own `aria-label` since the icon button has no visible text —
 * `md-menu` only manages `aria-haspopup`/`aria-expanded` on the trigger, not
 * its accessible name.
 */
/** @type {Story} */
export const IconButtonTrigger = {
  render: ({ placement, offset, flip, variant, trigger }) => html`
    <md-icon-button
      id="more-actions-trigger"
      variant="standard"
      aria-label="More actions"
    >
      <md-icon>${unsafeSVG(moreVert)}</md-icon>
    </md-icon-button>

    <md-menu
      for="more-actions-trigger"
      placement=${placement}
      offset=${offset}
      ?flip=${flip}
      variant=${variant}
      trigger=${trigger}
      @select=${(/** @type {CustomEvent} */ e) =>
        console.log("selected:", e.detail.value)}
    >
      <md-menu-item value="edit">
        <md-icon slot="leading">${unsafeSVG(edit)}</md-icon>
        Edit
      </md-menu-item>
      <md-menu-item value="duplicate">
        <md-icon slot="leading">${unsafeSVG(contentCopy)}</md-icon>
        Duplicate
      </md-menu-item>
      <md-menu-item value="delete" disabled>
        <md-icon slot="leading">${unsafeSVG(deleteIcon)}</md-icon>
        Delete
      </md-menu-item>
    </md-menu>
  `,
};

// ── 2. md-select: two approaches ────────────────────────────────────────────

/**
 * `md-select` accepts two different child types, side by side here for
 * comparison — both are real, form-associated controls (same `md-select`,
 * same `FormAssociateMixin`/`ElementInternals` value handling), the only
 * difference is what opens when you click it:
 *
 * - **`md-option`** (left) — native mode, unchanged from before `md-menu`
 *   existed. The browser's own OS/platform dropdown opens; plain text only,
 *   no icons.
 * - **`md-menu-item`** (right) — as soon as any child is an `md-menu-item`,
 *   `md-select` switches into **menu mode**: the visible, interactive
 *   control becomes an `md-menu` popover instead, so richer content (here,
 *   a leading icon per option) actually renders, and the selected row gets
 *   an automatic checkmark. A native `<select>` still exists underneath,
 *   visually hidden — kept in sync as the form's `validationTarget`/value
 *   mirror, but it's no longer what the user opens/clicks. See
 *   `components/select/select.js`.
 */
/** @type {Story} */
export const SelectApproaches = {
  render: () => html`
    <div style="display: flex; gap: 2rem; flex-wrap: wrap; align-items: start;">
      <div>
        <p
          style="font: var(--md-sys-typescale-label-medium-font, inherit); margin: 0 0 0.5rem;"
        >
          md-option (native dropdown)
        </p>
        <md-select label="Sort by" name="sort-native">
          <md-option value="name" selected>Name</md-option>
          <md-option value="date">Date modified</md-option>
          <md-option value="size">Size</md-option>
        </md-select>
      </div>

      <div>
        <p
          style="font: var(--md-sys-typescale-label-medium-font, inherit); margin: 0 0 0.5rem;"
        >
          md-menu-item (md-menu popover, menu mode)
        </p>
        <md-select label="Sort by" name="sort-menu" style="width: 204px;">
          <md-menu-item value="name" selected>
            <md-icon slot="leading">${unsafeSVG(edit)}</md-icon>
            Name
          </md-menu-item>
          <md-menu-item value="date">
            <md-icon slot="leading">${unsafeSVG(cloud)}</md-icon>
            Date modified
          </md-menu-item>
          <md-menu-item value="size">
            <md-icon slot="leading">${unsafeSVG(share)}</md-icon>
            Size
          </md-menu-item>
        </md-select>
      </div>
    </div>
  `,
};

// ── 3. Vertical / expressive menu ───────────────────────────────────────────

function firstThreeItems() {
  return html`
    <md-menu-item value="view">
      <md-icon slot="leading">${unsafeSVG(visibility)}</md-icon>
      Item 1
    </md-menu-item>

    <md-menu-item value="copy">
      <md-icon slot="leading">${unsafeSVG(contentCopy)}</md-icon>
      Item 2
      <span slot="trailing">⌘C</span>
    </md-menu-item>

    <md-menu-item value="edit" selected>
      <md-icon slot="leading">${unsafeSVG(edit)}</md-icon>
      Item 3
    </md-menu-item>
  `;
}

function fourthItemWithSubmenu() {
  return html`
    <md-menu-item value="share">
      <md-icon slot="leading">${unsafeSVG(cloud)}</md-icon>
      Item 4
      <md-menu slot="submenu" placement="right-start">
        <md-menu-item value="share-link">
          <md-icon slot="leading">${unsafeSVG(link)}</md-icon>
          Copy link
        </md-menu-item>
        <md-menu-item value="share-email">
          <md-icon slot="leading">${unsafeSVG(share)}</md-icon>
          Share via email
        </md-menu-item>
      </md-menu>
    </md-menu-item>
    <md-menu-item value="download">
      <md-icon slot="leading">${unsafeSVG(link)}</md-icon>
      Item 5
    </md-menu-item>
  `;
}

/**
 * Expressive vertical menu: leading icons, a trailing keyboard-shortcut
 * (`⌘C`), a `selected` pill item, and a `submenu`-slotted nested menu on the
 * last item. Wrapping each set of related items in its own `md-item-group`
 * splits the surface into independently-rounded `md-card` segments with
 * real spacing between them — gaps are more expressive than dividers and
 * make the relationship between items in the same group clear at a glance
 * (MD3 "vertical menu with gap" pattern).
 */
/** @type {Story} */
export const VerticalMenuWithGap = {
  render: ({ variant }) => html`
    <md-icon-button id="vertical-menu-trigger-gap" aria-label="Open menu">
      <md-icon>${unsafeSVG(moreVert)}</md-icon>
    </md-icon-button>

    <md-menu
      for="vertical-menu-trigger-gap"
      variant=${variant}
      placement="bottom-start"
    >
      <md-item-group>${firstThreeItems()}</md-item-group>
      <md-item-group>${fourthItemWithSubmenu()}</md-item-group>
    </md-menu>
  `,
};

/**
 * Same expressive vertical menu, but item groups are separated by an
 * `md-hr` divider instead of an `md-item-group` gap (reuses
 * `components/select/hr.js`) — a single flat segment/card, no group
 * wrapping needed.
 */
/** @type {Story} */
export const VerticalMenuWithDivider = {
  render: ({ variant }) => html`
    <md-icon-button id="vertical-menu-trigger-divider" aria-label="Open menu">
      <md-icon>${unsafeSVG(moreVert)}</md-icon>
    </md-icon-button>

    <md-menu
      for="vertical-menu-trigger-divider"
      variant=${variant}
      placement="bottom-start"
    >
      ${firstThreeItems()}
      <md-hr></md-hr>
      ${fourthItemWithSubmenu()}
    </md-menu>
  `,
};

// ── 4. Nested submenus ───────────────────────────────────────────────────────

/**
 * A `md-menu-item` opens a nested `md-menu` via its `submenu` slot — nested
 * two levels deep here to exercise the full chain. Open a submenu by
 * clicking its parent item or pressing `ArrowRight` while it's focused
 * (which also moves focus into the submenu's first item) — hovering alone
 * does not open it. `ArrowLeft` closes back to the parent item, `Escape`
 * closes the innermost open submenu first, and an outside click closes the
 * whole chain. Submenus default to `placement="right-start"` with `flip`
 * falling back to `left-start` when they'd overflow the viewport.
 */
/** @type {Story} */
export const NestedSubmenu = {
  render: () => html`
    <md-icon-button id="nested-submenu-trigger" aria-label="Open menu">
      <md-icon>${unsafeSVG(moreVert)}</md-icon>
    </md-icon-button>

    <md-menu for="nested-submenu-trigger" placement="bottom-start">
      <md-menu-item value="edit">
        <md-icon slot="leading">${unsafeSVG(edit)}</md-icon>
        Edit
      </md-menu-item>

      <md-menu-item value="share">
        <md-icon slot="leading">${unsafeSVG(share)}</md-icon>
        Share
        <md-menu slot="submenu">
          <md-menu-item value="share-link">
            <md-icon slot="leading">${unsafeSVG(link)}</md-icon>
            Copy link
          </md-menu-item>
          <md-menu-item value="share-cloud">
            <md-icon slot="leading">${unsafeSVG(cloud)}</md-icon>
            Share to cloud
            <md-menu slot="submenu">
              <md-menu-item value="cloud-drive">Drive</md-menu-item>
              <md-menu-item value="cloud-dropbox">Dropbox</md-menu-item>
            </md-menu>
          </md-menu-item>
        </md-menu>
      </md-menu-item>

      <md-menu-item value="delete" disabled>
        <md-icon slot="leading">${unsafeSVG(deleteIcon)}</md-icon>
        Delete
      </md-menu-item>
    </md-menu>
  `,
};

// ── 5. Context menu ──────────────────────────────────────────────────────────

/**
 * Opens on secondary click (`contextmenu`) via `openAtPoint`, anchored to
 * the pointer instead of a fixed trigger element. `event.preventDefault()`
 * suppresses the native OS/browser context menu.
 */
/** @type {Story} */
export const ContextMenu = {
  render: () => html`
    <img
      id="preview-image"
      alt="Preview"
      width="240"
      height="160"
      style="display:block; border-radius: var(--md-sys-shape-corner-medium, 1rem); background: var(--md-sys-color-surface-variant, #e7e0ec);"
      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='160'%3E%3Crect width='240' height='160' fill='%23cac4d0'/%3E%3C/svg%3E"
      @contextmenu=${(/** @type {MouseEvent} */ event) => {
        event.preventDefault();
        const menu = /** @type {MdMenu} */ (
          document.getElementById("image-context-menu")
        );
        menu.openAtPoint(event.clientX, event.clientY);
      }}
    />
    <p style="color: var(--md-sys-color-on-surface-variant, #49454f);">
      Right-click (secondary click) the image to open a context menu.
    </p>

    <md-menu id="image-context-menu" trigger="contextmenu">
      <md-menu-item value="view-full">View full size</md-menu-item>
      <md-menu-item value="copy-image">Copy image</md-menu-item>
      <md-menu-item value="save-as">Save image as…</md-menu-item>
    </md-menu>
  `,
};
