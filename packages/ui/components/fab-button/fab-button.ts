import {
  CSSResultGroup,
  CSSResultOrNative,
  LitElement,
  html,
  isServer,
} from "lit";
import { MutationController } from "@lit-labs/observers/mutation-controller.js";
import { customElement, property, query, state } from "lit/decorators.js";

import "../button/button.ts";

import styles from "./fab-button.css?inline";
import buttonStyles from "../button/button.css?inline";
import Button from "../button/button.ts";

/**
 * @tag md-fab-button
 * @summary Material FAB Button web component
 */
@customElement("md-fab-button")
export default class FABButton extends Button {
  static get styles(): CSSResultGroup {
    return [styles, buttonStyles] as unknown as CSSResultOrNative[];
  }

  // console.log(this)
  // override render() {

  //   return html`
  //       <slot></slot>
  //   `;
  // }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-fab-button": FABButton;
  }
}
