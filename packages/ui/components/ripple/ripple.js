import { LitElement, html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { customElement } from "lit/decorators.js";

import { HTMLForController } from "../html-for-controller/html-for-controller.js";

import styles from "./ripple.css?inline";

const POINTER_EVENTS = /** @type {const} */ ([
  "pointerdown",
  "pointerup",
  "pointercancel",
  "pointerenter",
  "pointerleave",
]);

/**
 * @tag md-ripple
 * @summary Material Ripple web component
 *
 * Attaches to the element referenced by `for` (resolved in the same root).
 * Without `for`, it attaches to its parent element, or to the shadow host
 * when it sits directly in a shadow root.
 */
@customElement("md-ripple")
export default class MdRipple extends LitElement {
  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  #pressed = false;

  #hovered = false;

  /** @type {Animation | undefined} */
  #rippleAnimation;

  constructor() {
    super();

    new HTMLForController(this, this.#onControlChange, {
      fallback: () => this.#defaultControl(),
    });
  }

  /** @returns {HTMLDivElement | null} */
  get #surface() {
    return this.renderRoot?.querySelector("div") ?? null;
  }

  /** @returns {HTMLElement | null} */
  #defaultControl() {
    if (this.parentElement) return this.parentElement;
    const root = this.getRootNode();
    return root instanceof ShadowRoot
      ? /** @type {HTMLElement} */ (root.host)
      : null;
  }

  /** @param {boolean} value */
  #setPressed(value) {
    if (this.#pressed === value) return;
    this.#pressed = value;
    this.requestUpdate();
  }

  /** @param {boolean} value */
  #setHovered(value) {
    if (this.#hovered === value) return;
    this.#hovered = value;
    this.requestUpdate();
  }

  /** @param {PointerEvent} event */
  #createRipple(event) {
    this.#setPressed(true);
    this.#rippleAnimation?.cancel();
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const INITIAL_ORIGIN_SCALE = 0.2;
    const initialSize = Math.floor(size * INITIAL_ORIGIN_SCALE);
    const hypotenuse = Math.sqrt(rect.width ** 2 + rect.height ** 2);
    const softEdgeSize = Math.max(0.35 * size, 75);
    const maxRadius = hypotenuse + 10;
    const rippleScale = `${(maxRadius + softEdgeSize) / initialSize}`;
    const rippleSize = `${initialSize}px`;
    // Calculate the translation offsets to center the ripple at the click position
    const translateX = event.clientX - rect.left - initialSize / 2;
    const translateY = event.clientY - rect.top - initialSize / 2;

    const endPoint = {
      x: (rect.width - initialSize) / 2,
      y: (rect.height - initialSize) / 2,
    };

    const startPoint = {
      x: translateX,
      y: translateY,
    };
    this.#rippleAnimation = this.#surface?.animate(
      {
        top: [0, 0],
        left: [0, 0],
        height: [rippleSize, rippleSize],
        width: [rippleSize, rippleSize],
        transform: [
          `translate(${startPoint.x}px, ${startPoint.y}px) scale(1)`,
          `translate(${endPoint.x}px, ${endPoint.y}px) scale(${rippleScale})`,
        ],
      },
      {
        pseudoElement: "::after",
        duration: 300,
        easing: "cubic-bezier(0.2, 0, 0, 1)",
        fill: "forwards",
      },
    );
  }

  render() {
    return html`
      <div
        class="surface ${classMap({
          ["surface_pressed"]: this.#pressed,
          ["surface_hovered"]: this.#hovered,
        })}"
      ></div>
    `;
  }

  /** @param {Event} event */
  #handlePointer = (event) => {
    const pointerEvent = /** @type {PointerEvent} */ (event);
    /** @type {HTMLElement & { disabled?: boolean }} */
    const control = /** @type {any} */ (event.currentTarget);
    if (control?.disabled) return;

    switch (pointerEvent.type) {
      case "pointerdown":
        // Only the primary button (left mouse, touch contact, pen tip).
        if (pointerEvent.button !== 0) return;
        this.#createRipple(pointerEvent);
        break;
      case "pointerup":
      case "pointercancel":
        this.#setPressed(false);
        break;
      case "pointerenter":
        this.#setHovered(true);
        break;
      case "pointerleave":
        // Releasing outside the control never fires `pointerup` on it.
        this.#setPressed(false);
        this.#setHovered(false);
        break;
    }
  };

  /**
   * @param {HTMLElement | null} prev
   * @param {HTMLElement | null} next
   */
  #onControlChange = (prev, next) => {
    for (const type of POINTER_EVENTS) {
      prev?.removeEventListener(type, this.#handlePointer);
      next?.addEventListener(type, this.#handlePointer);
    }
    if (!next) {
      this.#setPressed(false);
      this.#setHovered(false);
    }
  };
}
