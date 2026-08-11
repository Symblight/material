import { html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ref } from "lit/directives/ref.js";

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
    positioning: {
      control: { type: "select" },
      options: ["popover", "fixed", "absolute", "document"],
      description:
        'How the surface is rendered/positioned. "popover" (default) uses the native Popover API for top-layer rendering, falling back to "fixed" if the browser doesn\'t support it. "fixed" is viewport-relative with no popover attribute. "absolute" is relative to the nearest positioned ancestor. "document" is like absolute but the menu is hoisted to be a direct child of <body> on connect, so clipping/positioned ancestors in between never matter.',
    },
    animation: {
      control: { type: "select" },
      options: ["true", "false"],
      description:
        'Set to "false" to disable the open/close motion entirely (instant show/hide) — independent of prefers-reduced-motion.',
    },
    xOffset: {
      control: { type: "number" },
      description:
        "Additional pixel nudge along the cross axis (perpendicular to `offset`), on top of the anchor-relative placement. Default 0.",
    },
    yOffset: {
      control: { type: "number" },
      description:
        "Additional pixel nudge along the main axis, added on top of `offset` (e.g. offset=4 + yOffset=4 opens 8px from the anchor). Default 0.",
    },
  },
  args: {
    placement: "bottom-start",
    offset: 4,
    flip: true,
    variant: "standard",
    trigger: "click",
    positioning: "popover",
    animation: "true",
    xOffset: 0,
    yOffset: 0,
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
  render: ({
    placement,
    offset,
    flip,
    variant,
    trigger,
    positioning,
    animation,
    xOffset,
    yOffset,
  }) => html`
    <div
      style="width: 500px; height: 500px; display: flex; justify-content: center; align-items: center;"
    >
      <md-icon-button
        id="more-actions-trigger"
        variant="standard"
        aria-label="More actions"
      >
        <md-icon>${unsafeSVG(moreVert)}</md-icon>
      </md-icon-button>
    </div>
    <md-menu
      for="more-actions-trigger"
      placement=${placement}
      offset=${offset}
      ?flip=${flip}
      variant=${variant}
      trigger=${trigger}
      positioning=${positioning}
      animation=${animation}
      x-offset=${xOffset}
      y-offset=${yOffset}
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

// ── 2. Vertical / expressive menu ───────────────────────────────────────────

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
 * last item — shown two ways, side by side, for how to separate item
 * groups:
 *
 * - **Gap** (left) — wrapping each set of related items in its own
 *   `md-item-group` splits the surface into independently-rounded `md-card`
 *   segments with real spacing between them. Gaps are more expressive than
 *   dividers and make the relationship between items in the same group
 *   clear at a glance (MD3 "vertical menu with gap" pattern).
 * - **Divider** (right) — the same groups instead separated by an `md-hr`
 *   divider (reuses `components/select/hr.js`) within a single flat
 *   segment/card, no group wrapping needed.
 */
/** @type {Story} */
export const VerticalMenuGapVsDivider = {
  render: ({ variant }) => html`
    <div style="display: flex; gap: 2rem;">
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <p
          style="font: var(--md-sys-typescale-label-medium-font, inherit); margin: 0;"
        >
          md-item-group (gap)
        </p>
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
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <p
          style="font: var(--md-sys-typescale-label-medium-font, inherit); margin: 0;"
        >
          md-hr (divider)
        </p>
        <md-icon-button
          id="vertical-menu-trigger-divider"
          aria-label="Open menu"
        >
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
      </div>
    </div>
  `,
};

// ── 3. Nested submenus ───────────────────────────────────────────────────────

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

// ── 4. Context menu ──────────────────────────────────────────────────────────

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

// ── 5. positioning: escaping a clipping ancestor ────────────────────────────

/**
 * Renders one trigger + menu pair inside a small `overflow: hidden;
 * position: relative;` card (the classic "dropdown gets cropped by its
 * scroll/clip container" setup) with a given `positioning` value, plus a
 * caption explaining the outcome.
 * @param {string} id
 * @param {"popover" | "fixed" | "absolute" | "document"} positioning
 * @param {string} caption
 */
function clippingDemo(id, positioning, caption) {
  return html`
    <div
      style="display: flex; flex-direction: column; gap: 0.5rem; inline-size: 176px;"
    >
      <p
        style="font: var(--md-sys-typescale-label-medium-font, inherit); margin: 0; color: var(--md-sys-color-on-surface-variant, #49454f);"
      >
        ${caption}
      </p>
      <div
        style="position: relative; overflow: hidden; block-size: 96px; padding: 1rem; border: 1px dashed var(--md-sys-color-outline, #79747e); border-radius: var(--md-sys-shape-corner-medium, 0.75rem);"
      >
        <md-icon-button id=${id} aria-label="Open menu">
          <md-icon>${unsafeSVG(moreVert)}</md-icon>
        </md-icon-button>

        <md-menu for=${id} positioning=${positioning} placement="bottom-start">
          <md-menu-item value="a">Option A</md-menu-item>
          <md-menu-item value="b">Option B</md-menu-item>
          <md-menu-item value="c">Option C</md-menu-item>
        </md-menu>
      </div>
    </div>
  `;
}

/**
 * `positioning` controls how the menu surface is rendered relative to the
 * page. Each dashed box below is a stand-in for a real clipping container
 * (a card, a scroll region, anything with `overflow: hidden` +
 * `position: relative`) — open each menu to see the practical effect:
 *
 * - **`popover`** (default) — rendered in the top layer via the native
 *   Popover API, so DOM placement/ancestor `overflow` never clips it
 *   (falls back to `fixed` if the browser doesn't support `showPopover`).
 * - **`fixed`** — plain `position: fixed`, positioned relative to the
 *   viewport. Also escapes this box's `overflow: hidden` (a bare
 *   `overflow: hidden; position: relative` container doesn't establish a
 *   new containing block for fixed-position descendants), but note it's
 *   only `--md-menu-z-index` (default `1000`) above regular content — it
 *   cannot out-stack genuinely top-layer content like an open `md-dialog`.
 * - **`absolute`** — positioned relative to the nearest positioned
 *   ancestor, which here *is* the clipping box itself, so the surface gets
 *   visually cropped by its `overflow: hidden` exactly like a plain CSS
 *   dropdown would. This is the mode to reach for when you *want* the menu
 *   to scroll/clip along with its container.
 * - **`document`** — same math as `absolute`, but the menu is hoisted to
 *   be a direct child of `<body>` on connect, so there's no longer a
 *   closer positioned ancestor for it to clip against — it escapes
 *   regardless of how deeply nested the trigger is.
 */
/** @type {Story} */
export const PositioningModes = {
  render: () => html`
    <div style="display: flex; gap: 2rem; flex-wrap: wrap; align-items: start;">
      ${clippingDemo(
        "positioning-popover-trigger",
        "popover",
        "popover (default) — top-layer, escapes the clip",
      )}
      ${clippingDemo(
        "positioning-fixed-trigger",
        "fixed",
        "fixed — viewport-relative, escapes the clip",
      )}
      ${clippingDemo(
        "positioning-absolute-trigger",
        "absolute",
        "absolute — relative to the box itself, gets clipped",
      )}
      ${clippingDemo(
        "positioning-document-trigger",
        "document",
        "document — hoisted to <body>, escapes the clip",
      )}
    </div>
  `,
};

// ── 6. animation="false": instant show/hide ─────────────────────────────────

/**
 * `animation="false"` disables the open/close motion entirely, independent
 * of `prefers-reduced-motion` — the surface appears/disappears instantly
 * instead of fading + scaling in over menu.css's transition. Compare the
 * two triggers below side by side.
 */
/** @type {Story} */
export const AnimationToggle = {
  render: () => html`
    <div style="display: flex; gap: 2rem;">
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <p
          style="font: var(--md-sys-typescale-label-medium-font, inherit); margin: 0;"
        >
          animation="true" (default)
        </p>
        <md-icon-button id="animation-on-trigger" aria-label="Open menu">
          <md-icon>${unsafeSVG(moreVert)}</md-icon>
        </md-icon-button>
        <md-menu
          for="animation-on-trigger"
          animation="true"
          placement="bottom-start"
        >
          <md-menu-item value="a">Option A</md-menu-item>
          <md-menu-item value="b">Option B</md-menu-item>
          <md-menu-item value="c">Option C</md-menu-item>
        </md-menu>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <p
          style="font: var(--md-sys-typescale-label-medium-font, inherit); margin: 0;"
        >
          animation="false"
        </p>
        <md-icon-button id="animation-off-trigger" aria-label="Open menu">
          <md-icon>${unsafeSVG(moreVert)}</md-icon>
        </md-icon-button>
        <md-menu
          for="animation-off-trigger"
          animation="false"
          placement="bottom-start"
        >
          <md-menu-item value="a">Option A</md-menu-item>
          <md-menu-item value="b">Option B</md-menu-item>
          <md-menu-item value="c">Option C</md-menu-item>
        </md-menu>
      </div>
    </div>
  `,
};

// ── 7. Lifecycle events ─────────────────────────────────────────────────────

/**
 * `md-menu` dispatches four plain (non-`CustomEvent`, no `detail`)
 * lifecycle events: `opening`/`closing` fire synchronously the instant an
 * open/close starts, while `opened`/`closed` fire later, once the
 * open/close CSS transition has actually finished (or immediately if
 * animation is off / `prefers-reduced-motion` is set). Open and close the
 * menu below to watch `opening`/`opened` and `closing`/`closed` land in the
 * log — note the gap between each pair.
 */
/** @type {Story} */
export const LifecycleEvents = {
  render: () => {
    /** @type {HTMLElement | undefined} */
    let log;

    /** @param {string} message */
    function append(message) {
      if (!log) return;
      const line = document.createElement("div");
      const time = new Date().toLocaleTimeString([], {
        hour12: false,
        minute: "2-digit",
        second: "2-digit",
      });
      line.textContent = `${time}.${new Date()
        .getMilliseconds()
        .toString()
        .padStart(3, "0")} — ${message}`;
      log.prepend(line);
    }

    return html`
      <md-icon-button id="lifecycle-events-trigger" aria-label="Open menu">
        <md-icon>${unsafeSVG(moreVert)}</md-icon>
      </md-icon-button>

      <md-menu
        for="lifecycle-events-trigger"
        placement="bottom-start"
        @opening=${() =>
          append("opening — fires synchronously as the open starts")}
        @opened=${() =>
          append("opened — fires once the open transition finishes")}
        @closing=${() =>
          append("closing — fires synchronously as the close starts")}
        @closed=${() =>
          append("closed — fires once the close transition finishes")}
      >
        <md-menu-item value="edit">
          <md-icon slot="leading">${unsafeSVG(edit)}</md-icon>
          Edit
        </md-menu-item>
        <md-menu-item value="duplicate">
          <md-icon slot="leading">${unsafeSVG(contentCopy)}</md-icon>
          Duplicate
        </md-menu-item>
        <md-menu-item value="delete">
          <md-icon slot="leading">${unsafeSVG(deleteIcon)}</md-icon>
          Delete
        </md-menu-item>
      </md-menu>

      <div
        ${ref((el) => (log = /** @type {HTMLElement | undefined} */ (el)))}
        style="margin-block-start: 1rem; min-inline-size: 320px; max-block-size: 180px; overflow-y: auto; display: flex; flex-direction: column-reverse; gap: 2px; font-family: monospace; font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 4px; padding: 0.5rem;"
      ></div>
    `;
  },
};

// ── 8. md-menu-item href: navigation vs. action items ───────────────────────

/**
 * Setting `href` on an `md-menu-item` renders its interactive element as
 * `<a href>` instead of `<button>` — a navigation item rather than an
 * action item (no `select` event; the browser navigates). `disabled` still
 * works on href items even though `<a>` has no native `disabled` attribute
 * — it's implemented as `aria-disabled` + a blocked `click` handler
 * instead, so the last item below is inert without actually leaving the
 * page.
 */
/** @type {Story} */
export const HrefMenuItem = {
  render: () => html`
    <md-icon-button id="href-menu-item-trigger" aria-label="Open menu">
      <md-icon>${unsafeSVG(moreVert)}</md-icon>
    </md-icon-button>

    <md-menu for="href-menu-item-trigger" placement="bottom-start">
      <md-menu-item value="edit">
        <md-icon slot="leading">${unsafeSVG(edit)}</md-icon>
        Edit
      </md-menu-item>

      <md-menu-item href="https://m3.material.io/components/menus" value="docs">
        <md-icon slot="leading">${unsafeSVG(link)}</md-icon>
        View documentation
      </md-menu-item>

      <md-menu-item
        href="https://m3.material.io/components/menus"
        value="docs-disabled"
        disabled
      >
        <md-icon slot="leading">${unsafeSVG(link)}</md-icon>
        Unavailable page
      </md-menu-item>
    </md-menu>
  `,
};
