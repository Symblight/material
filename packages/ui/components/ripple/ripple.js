import { LitElement, html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { customElement } from "lit/decorators.js";

import { HTMLForController } from "../html-for-controller/html-for-controller.js";

import styles from "./ripple.css?inline";

/**
 * @tag md-ripple
 * @summary Material Ripple web component
 */
@customElement("md-ripple")
export default class MdRipple extends LitElement {
  /** @type {import("lit").PropertyDeclarations} */
  static properties = {
    pressed: { state: true },
    hovered: { state: true },
    rippleAnimation: { state: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    this.myController = new HTMLForController(
      this,
      this.onControlChange.bind(this),
    );

    /** @type {boolean} */
    this.pressed = false;

    /** @type {boolean} */
    this.hovered = false;

    /** @type {Animation | undefined} */
    this.rippleAnimation = undefined;
  }

  /** @returns {HTMLDivElement | undefined} */
  get mdSurfaceEl() {
    return this.renderRoot?.querySelector("div") ?? undefined;
  }

  /**
   * @private
   * @param {MouseEvent} event
   */
  createRipple(event) {
    this.pressed = true;
    this.rippleAnimation?.cancel();
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const INITIAL_ORIGIN_SCALE = 0.2;
    const initialSize = Math.floor(size * INITIAL_ORIGIN_SCALE);
    const hypotenuse = Math.sqrt(rect.width ** 2 + rect.height ** 2);
    const softEdgeSize = Math.max(0.35 * size, 75);
    const maxRadius = hypotenuse + 10;
    const rippleScale = `${(maxRadius + softEdgeSize) / initialSize}`;
    const rippleSize = `${initialSize}px`;
    const rippleSize2 = `${initialSize}px`;
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
    this.rippleAnimation = this.mdSurfaceEl?.animate(
      {
        top: [0, 0],
        left: [0, 0],
        height: [rippleSize, rippleSize2],
        width: [rippleSize, rippleSize2],
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

  endRipple = () => {
    this.pressed = false;
  };

  render() {
    return html`
      <div
        class="surface ${classMap({
          ["surface_pressed"]: this.pressed,
          ["surface_hovered"]: this.hovered,
        })}"
      ></div>
    `;
  }

  /** @param {Event} event */
  async handleEvent(event) {
    if (event.type === "pointerdown") {
      this.createRipple(/** @type {MouseEvent} */ (event));
    }

    if (event.type === "pointerup") {
      this.endRipple();
    }

    if (event.type === "pointerenter") {
      this.hovered = true;
    }

    if (event.type === "pointerleave") {
      this.hovered = false;
    }
  }

  /**
   * @private
   * @param {HTMLElement | null} prev
   * @param {HTMLElement | null} next
   */
  onControlChange(prev, next) {
    if (prev) {
      prev.removeEventListener("pointerup", this);
      prev.removeEventListener("pointerdown", this);
      prev.removeEventListener("pointerenter", this);
      prev.removeEventListener("pointerleave", this);
    }
    next?.addEventListener("pointerup", this);
    next?.addEventListener("pointerdown", this);
    next?.addEventListener("pointerenter", this);
    next?.addEventListener("pointerleave", this);
  }
}
