/** @import { ReactiveController, ReactiveControllerHost } from "lit" */
/** @import RadioButton from "./radio-button.js" */

/**
 * Arrow keys that move roving focus/selection within a radio group, mirroring
 * native `<input type="radio">` group behavior.
 * @type {Set<string>}
 */
const ARROW_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

/**
 * Tracks a single shared `keydown` listener per group element. Every radio
 * in the same group has its own `RadioSelectionController` instance, but
 * they all resolve to the same `group` element (fieldset/form/root), so
 * listener attachment is reference-counted here to avoid attaching (and
 * therefore running the handler) once per radio.
 * @type {WeakMap<EventTarget, { handler: EventListener, refCount: number }>}
 */
const groupKeydownRegistry = new WeakMap();

/** @implements {ReactiveController} */
export class RadioSelectionController {
  /** @type {ReactiveControllerHost} */
  host;

  /** @type {MutationObserver | undefined} */
  #groupObserver;

  /** @type {HTMLFieldSetElement | HTMLFormElement | Document | ShadowRoot | undefined} */
  #group;

  /**
   * The group element this controller last attached its keydown listener
   * to. Cached separately from `#group` because `hostDisconnected` needs to
   * detach from the exact element it attached to.
   * @type {EventTarget | undefined}
   */
  #keydownGroup;

  /** @type {string | undefined} */
  selectedValue;

  /** @type {RadioButton[]} */
  controls = [];

  /** @param {ReactiveControllerHost} host */
  constructor(host) {
    (this.host = host).addController(this);
  }

  hostConnected() {
    if (this.group) {
      const radioButtons = this.group?.querySelectorAll("md-radio");
      this.controls = Array.from(radioButtons);

      // attach observer
      this.#groupObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          // Only cascade `disabled` down from the group container itself
          // (e.g. a native `<fieldset disabled>`) — not from an individual
          // `md-radio` toggling its own `disabled` attribute, which must
          // stay scoped to that one radio. `md-radio` is already
          // form-associated and receives `formDisabledCallback` natively
          // when an ancestor fieldset is disabled, so this only needs to
          // handle the case where `this.group` itself is the mutation
          // target (kept for defense-in-depth / non-fieldset containers).
          if (
            mutation.attributeName === "disabled" &&
            mutation.target === this.group
          ) {
            const disabled = /** @type {HTMLElement} */ (
              mutation.target
            ).hasAttribute("disabled");
            this.controls.forEach((radio) => {
              radio.disabled = disabled;
            });
          }
          if (mutation.attributeName === "checked") {
            this.selectedValue = /** @type {RadioButton} */ (
              mutation.target
            ).value;
          }
        });
      });

      this.#groupObserver.observe(/** @type {Node} */ (this.group), {
        attributes: true,
        subtree: true,
      });

      this.#attachGroupKeydown();
      this.syncTabIndex();
    }
  }

  hostDisconnected() {
    this.#groupObserver?.disconnect();
    this.#detachGroupKeydown();
  }

  /** @param {"fieldset" | "form"} tagName */
  getGroupElement(tagName) {
    const target = /** @type {RadioButton} */ (this.host);
    const parentHTML = target.getRootNode();
    const groupHTMLElements = /** @type {HTMLElement} */ (
      parentHTML
    )?.querySelectorAll(tagName);

    const currentGroupHTMLElement = Array.from(groupHTMLElements).find(
      (groupHTMLElement) => groupHTMLElement.contains(target),
    );

    if (!currentGroupHTMLElement) return null;

    return currentGroupHTMLElement;
  }

  /**
   * Resolves the group scope this radio belongs to. Prefers the nearest
   * `<fieldset>`/`<form>` ancestor. When neither exists, falls back to the
   * radio's root node (its `Document` or `ShadowRoot`) so that two `md-radio`
   * elements sharing a `name` still group/exclude each other without
   * requiring a wrapper — matching native `<input type="radio">` semantics,
   * where a radio button group with no form owner is scoped to the whole
   * tree it lives in.
   * @returns {HTMLFieldSetElement | HTMLFormElement | Document | ShadowRoot | undefined}
   */
  get group() {
    if (this.#group) return this.#group;

    const currentFieldsetHTMLElement = this.getGroupElement("fieldset");

    if (currentFieldsetHTMLElement) {
      this.#group = currentFieldsetHTMLElement;
      return currentFieldsetHTMLElement;
    }

    const currentFormHTMLElement = this.getGroupElement("form");
    if (currentFormHTMLElement) {
      this.#group = currentFormHTMLElement;
      return currentFormHTMLElement;
    }

    const target = /** @type {RadioButton} */ (this.host);
    const root = /** @type {Document | ShadowRoot} */ (target.getRootNode());
    this.#group = root;
    return root;
  }

  select() {
    const { value, name } = /** @type {RadioButton} */ (this.host);
    if (!this.group) return;

    this.controls.forEach((radio) => {
      if (radio.value !== value && radio.name === name) {
        radio.checked = false;
      }
    });
  }

  /**
   * Recomputes `ElementInternals` validity for every radio sharing this
   * radio's `name` within the group, not just the radio that changed.
   * Native radio groups validate as a unit: selecting any radio in a
   * `required` group clears the missing-value validity error for all of
   * them, and an unselected `required` group reports as invalid even if the
   * radio that triggered the recompute isn't itself `required`.
   */
  updateGroupValidity() {
    const host = /** @type {RadioButton} */ (this.host);
    const sameName = this.controls.filter((radio) => radio.name === host.name);
    const targets = sameName.length ? sameName : [host];
    targets.forEach((radio) => radio.updateValidity());
  }

  /**
   * Normalizes roving tabindex across radios sharing this radio's `name`:
   * the checked radio (or the first enabled radio if none is checked) gets
   * `tabindex="0"` on its inner input, every other radio in that named
   * sub-group gets `tabindex="-1"`. Mirrors the roving-tabindex pattern used
   * by `md-list` / `md-segmented-button-group`, adapted here since
   * `md-radio` has no dedicated parent group element to own the logic.
   */
  syncTabIndex() {
    const host = /** @type {RadioButton} */ (this.host);
    if (!this.group) return;

    const sameName = this.controls.filter((radio) => radio.name === host.name);
    if (!sameName.length) return;

    const checked = sameName.find((radio) => radio.checked);
    const enabled = sameName.filter((radio) => !radio.disabled);
    // An enabled+checked radio wins the tab stop; if the checked radio is
    // disabled, it must not win instead — disabled controls are never
    // focusable regardless of tabindex, which would make the whole group
    // unreachable via Tab. Fall back to the first enabled radio, and only
    // land on a disabled radio if literally every radio in the group is
    // disabled (in which case nothing is focusable anyway).
    const tabStop =
      enabled.find((radio) => radio.checked) ??
      enabled[0] ??
      checked ??
      sameName[0];

    sameName.forEach((radio) => {
      radio.setTabIndex(radio === tabStop ? 0 : -1);
    });
  }

  /**
   * Attaches (or, via ref-counting, re-uses) a single `keydown` listener on
   * the group element. Every radio's controller calls this on
   * `hostConnected`, but the listener itself is only ever added once per
   * group element — otherwise a group of N radios would run the arrow-key
   * handling logic N times per keypress.
   */
  #attachGroupKeydown() {
    const group = this.group;
    if (!group) return;

    let entry = groupKeydownRegistry.get(group);
    if (!entry) {
      const handler = /** @type {EventListener} */ (
        (/** @type {Event} */ event) =>
          this.#handleGroupKeydown(/** @type {KeyboardEvent} */ (event))
      );
      entry = { handler, refCount: 0 };
      group.addEventListener("keydown", handler);
      groupKeydownRegistry.set(group, entry);
    }
    entry.refCount += 1;
    this.#keydownGroup = group;
  }

  #detachGroupKeydown() {
    const group = this.#keydownGroup;
    if (!group) return;

    const entry = groupKeydownRegistry.get(group);
    this.#keydownGroup = undefined;
    if (!entry) return;

    entry.refCount -= 1;
    if (entry.refCount <= 0) {
      group.removeEventListener("keydown", entry.handler);
      groupKeydownRegistry.delete(group);
    }
  }

  /**
   * Handles ArrowUp/ArrowDown/ArrowLeft/ArrowRight within the group: moves
   * focus and selection to the next/previous enabled radio sharing the
   * focused radio's `name`, wrapping at the ends and skipping disabled
   * radios — matching native radio group behavior. Each `md-radio`'s
   * interactive input lives in its own shadow root, so the browser can't
   * fall back to its native "one tab stop per name" behavior itself; this
   * listener (attached to the shared group element) is what makes arrow-key
   * navigation and roving tabindex work across radios in separate shadow
   * roots. The focused radio is found via `:focus-within` (mirroring
   * `md-list` / `md-segmented-button-group`) rather than `event.target`, so
   * this doesn't depend on shadow-DOM event-retargeting details.
   * @param {KeyboardEvent} event
   */
  #handleGroupKeydown(event) {
    if (!ARROW_KEYS.has(event.key)) return;

    const group = this.group;
    if (!group) return;

    const allRadios = /** @type {RadioButton[]} */ (
      Array.from(group.querySelectorAll("md-radio"))
    );
    const focused = allRadios.find((radio) => radio.matches(":focus-within"));
    if (!focused) return;

    const sameName = allRadios.filter((radio) => radio.name === focused.name);
    const enabled = sameName.filter((radio) => !radio.disabled);
    if (!enabled.length) return;

    const currentIndex = enabled.indexOf(focused);
    if (currentIndex === -1) return;

    event.preventDefault();

    const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
    const nextIndex = forward
      ? (currentIndex + 1) % enabled.length
      : (currentIndex - 1 + enabled.length) % enabled.length;
    const next = enabled[nextIndex];

    sameName.forEach((radio) => {
      radio.setTabIndex(radio === next ? 0 : -1);
    });

    if (!next.checked) {
      next.checked = true;
      next.selectionController.select();
      next.selectionController.updateGroupValidity();
      next.dispatchEvent(
        new Event("change", { bubbles: true, composed: true }),
      );
    }

    next.focusInteractive();
  }
}
