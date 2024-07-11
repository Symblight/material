import { ReactiveController, ReactiveControllerHost } from "lit";

import RadioButton from "./radio-button";

export class RadioSelectionController implements ReactiveController {
  host: ReactiveControllerHost;

  #groupObserver?: MutationObserver;

  currentControl: HTMLElement | null | undefined;
  selectedValues: Set<string> = new Set();

  constructor(host: ReactiveControllerHost) {
    (this.host = host).addController(this);
  }

  hostConnected() {
    this.#groupObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes") {
          const radioButtons = this.group?.querySelectorAll("md-radio") || [];
          Array.from(radioButtons).forEach((radio) => {
            radio.disabled = (mutation.target as HTMLElement).hasAttribute(
              "disabled"
            );
          });
        }
      });
    });

    this.#groupObserver.observe(this.group as Node, {
      attributes: true,
    });
  }

  hostDisconnected() {
    // Clean up
  }

  getGroupElement(tagName: "fieldset" | "form") {
    const target = this.host as RadioButton;
    const parentHTML = target.getRootNode();
    const groupHTMLElements = (parentHTML as HTMLElement)?.querySelectorAll(
      tagName
    );

    const currentGroupHTMLElement = Array.from(groupHTMLElements).find(
      (groupHTMLElement) => groupHTMLElement.contains(target)
    );

    if (!currentGroupHTMLElement) return null;

    return currentGroupHTMLElement;
  }

  get group() {
    const currentFieldsetHTMLElement = this.getGroupElement("fieldset");

    if (currentFieldsetHTMLElement) {
      return currentFieldsetHTMLElement;
    }

    const currentFormHTMLElement = this.getGroupElement("form");

    return currentFormHTMLElement;
  }

  select() {
    const { value, name } = this.host as RadioButton;
    if (!this.group) return;

    const radioButtons = this.group?.querySelectorAll("md-radio");

    Array.from(radioButtons).forEach((radio) => {
      if (radio.value !== value && radio.name === name) {
        radio.checked = false;
      }
    });
  }
}
