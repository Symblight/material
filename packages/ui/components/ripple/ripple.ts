import { CSSResultGroup, CSSResultOrNative, LitElement, html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { customElement, query, state } from "lit/decorators.js";

import { HTMLForController } from "../html-for-controller/html-for-controller";

import styles from "./ripple.css?inline";
/**
 * @tag md-ripple
 * @summary Material Ripple web component
 */
@customElement("md-ripple")
export default class MdRipple extends LitElement {
  private myController = new HTMLForController(
    this,
    this.onControlChange.bind(this),
  );

  @state()
  pressed: boolean = false;

  @state()
  accessor hovered: boolean = false;

  @query("div")
  accessor mdSurfaceEl: HTMLDivElement | undefined;

  @state()
  accessor rippleAnimation: Animation | undefined;

  static get styles(): CSSResultGroup {
    return [styles as unknown as CSSResultOrNative];
  }

  private createRipple(event: MouseEvent) {
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
        })}"
      ></div>
    `;
  }

  async handleEvent(event: Event) {
    if (event.type === "pointerdown") {
      this.createRipple(event as MouseEvent);
    }

    if (event.type === "pointerup") {
      this.endRipple();
    }
  }

  private onControlChange(prev: HTMLElement | null, next: HTMLElement | null) {
    // prev?.addEventListener('click', this)
    next?.addEventListener("pointerup", this);
    next?.addEventListener("pointerdown", this);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-ripple": MdRipple;
  }
}
