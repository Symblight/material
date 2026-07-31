/** @import { ReactiveController, ReactiveControllerHost } from "lit" */

/** @implements {ReactiveController} */
export class HTMLForController {
  /** @type {string | null | undefined} */
  htmlFor;

  /** @type {ReactiveControllerHost} */
  host;

  /** @type {HTMLElement | null | undefined} */
  control;

  /** @type {HTMLElement | null | undefined} */
  currentControl;

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
      const target = /** @type {HTMLElement} */ (
        /** @type {unknown} */ (this.host)
      )
        .getRootNode()
        .getElementById(forAttribute);
      this.setCurrentControl(target);
    } else {
      const target = this.host.getRootNode();
      this.setCurrentControl(target);
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
