import { ReactiveController, ReactiveControllerHost } from "lit";

import RadioButton from "./radio-button";

export class RadioSelectionController implements ReactiveController {
  host: ReactiveControllerHost;

  #groupObserver?: MutationObserver;
  #group?: HTMLFieldSetElement | HTMLFormElement;

  currentControl: HTMLElement | null | undefined;
  selectedValue?: string;
  controls: RadioButton[] = [];

  constructor(host: ReactiveControllerHost) {
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
              radio.disabled = (mutation.target as HTMLElement).hasAttribute(
                "disabled",
              );
            });
          }
          if (mutation.attributeName === "checked") {
            this.selectedValue = mutation.target.value;
          }
        });
      });

      this.#groupObserver.observe(this.group as Node, {
        attributes: true,
        subtree: true,
      });
    }
  }

  hostDisconnected() {
    // Clean up
  }

  getGroupElement(tagName: "fieldset" | "form") {
    const target = this.host as RadioButton;
    const parentHTML = target.getRootNode();
    const groupHTMLElements = (parentHTML as HTMLElement)?.querySelectorAll(
      tagName,
    );

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
    const { value, name } = this.host as RadioButton;
    if (!this.group) return;

    this.controls.forEach((radio) => {
      if (radio.value !== value && radio.name === name) {
        radio.checked = false;
      }
    });
  }
}
