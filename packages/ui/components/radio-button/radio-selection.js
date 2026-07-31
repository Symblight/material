/** @import { ReactiveController, ReactiveControllerHost } from "lit" */
/** @import RadioButton from "./radio-button.js" */

/** @implements {ReactiveController} */
export class RadioSelectionController {
  /** @type {ReactiveControllerHost} */
  host;

  /** @type {MutationObserver | undefined} */
  #groupObserver;

  /** @type {HTMLFieldSetElement | HTMLFormElement | undefined} */
  #group;

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
          if (mutation.attributeName === "disabled") {
            this.controls.forEach((radio) => {
              radio.disabled = /** @type {HTMLElement} */ (
                mutation.target
              ).hasAttribute("disabled");
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
    }
  }

  hostDisconnected() {
    this.#groupObserver?.disconnect();
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
    }

    return currentFormHTMLElement;
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
}
