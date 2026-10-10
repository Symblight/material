import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import styles from "./progress-linear.css?inline";

/**
 * @tag md-progress-linear
 * @summary Material Design 3 linear progress indicator
 */
@customElement("md-progress-linear")
export default class MdProgressLinear extends LitElement {
  static properties = {
    /** Determinate progress value between 0 and 1. Omit for indeterminate. */
    value: { type: Number, reflect: true },
  };

  /** @returns {import("lit").CSSResultGroup} */
  static get styles() {
    return [styles];
  }

  constructor() {
    super();

    /** @type {number | undefined} */
    this.value = undefined;
  }

  #internals = this.attachInternals();

  /** Clamped value, or `null` when indeterminate (unset or not a finite number). */
  get #progress() {
    const value = Number(this.value ?? NaN);
    return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.#internals.role = "progressbar";
  }

  /** @param {import("lit").PropertyValues} changes */
  willUpdate(changes) {
    super.willUpdate(changes);

    const progress = this.#progress;
    const indeterminate = progress === null;
    this.#internals.ariaValueMin = indeterminate ? null : "0";
    this.#internals.ariaValueMax = indeterminate ? null : "1";
    this.#internals.ariaValueNow = indeterminate ? null : String(progress);
  }

  render() {
    const progress = this.#progress;

    if (progress === null) {
      return html`
        <div class="progress-linear">
          <div part="track" class="progress-linear__track"></div>
          <div
            part="bar"
            class="progress-linear__bar progress-linear__bar_secondary"
          ></div>
          <div
            part="bar"
            class="progress-linear__bar progress-linear__bar_primary"
          ></div>
        </div>
      `;
    }

    return html`
      <div class="progress-linear" style="--_progress-linear-value:${progress}">
        <div part="track" class="progress-linear__track"></div>
        <div
          part="stop-indicator"
          class="progress-linear__stop-indicator"
        ></div>
        <div
          part="active-indicator"
          class="progress-linear__active-indicator"
        ></div>
      </div>
    `;
  }
}
