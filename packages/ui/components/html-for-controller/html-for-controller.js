/** @import { ReactiveController, ReactiveControllerHost } from "lit" */

/** @implements {ReactiveController} */
export class HTMLForController {
  /** @type {string | null | undefined} */
  htmlFor;

  /** @type {ReactiveControllerHost} */
  host;

  /** @type {HTMLElement | null | undefined} */
  control;

  /** @type {HTMLElement | null} */
  currentControl = null;

  /**
   * @param {ReactiveControllerHost} host
   * @param {(prev: HTMLElement | null, next: HTMLElement | null) => void} onControlChange
   */
  constructor(host, onControlChange) {
    this.onControlChange = onControlChange;
    (this.host = host).addController(this);
  }

  hostConnected() {
    const forAttribute = /** @type {HTMLElement} */ (
      /** @type {unknown} */ (this.host)
    ).getAttribute("for");
    if (forAttribute) {
      const root = /** @type {Document | ShadowRoot} */ (
        /** @type {HTMLElement} */ (
          /** @type {unknown} */ (this.host)
        ).getRootNode()
      );
      this.setCurrentControl(root.getElementById(forAttribute));
    } else {
      const target = /** @type {HTMLElement} */ (
        /** @type {unknown} */ (this.host)
      ).getRootNode();
      this.setCurrentControl(/** @type {HTMLElement} */ (target));
    }
  }

  hostDisconnected() {
    this.setCurrentControl(null);
    // Clean up
  }

  /** @param {HTMLElement | null} control */
  setCurrentControl(control) {
    this.onControlChange(this.currentControl, control);
    this.currentControl = control;
  }
}
