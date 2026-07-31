import { html } from "lit";

import "../switch.js";
/** @import MdSwitch from "../switch.js" */

/** @type {import("@storybook/web-components").Meta<MdSwitch>} */
const meta = {
  title: "Components/Switch",
  tags: ["autodocs"],
  render: ({ selected, disabled, icons }) => html`
    <md-switch
      ?selected=${selected}
      ?disabled=${disabled}
      ?icons=${icons}
    ></md-switch>
  `,
  argTypes: {
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    icons: { control: "boolean" },
  },
  args: {
    selected: false,
    disabled: false,
    icons: false,
  },
};

export default meta;
/** @typedef {import("@storybook/web-components").StoryObj<MdSwitch>} Story */

/** @type {Story} */
export const Unselected = {
  args: { selected: false },
};

/** @type {Story} */
export const Selected = {
  args: { selected: true },
};

/** @type {Story} */
export const WithIcons = {
  args: { selected: false, icons: true },
  render: () => html`
    <div style="display: flex; gap: 16px; align-items: center;">
      <md-switch icons></md-switch>
      <md-switch icons selected></md-switch>
    </div>
  `,
};

/** @type {Story} */
export const Disabled = {
  render: () => html`
    <div style="display: flex; gap: 16px; align-items: center;">
      <md-switch disabled></md-switch>
      <md-switch disabled selected></md-switch>
    </div>
  `,
};

/** @type {Story} */
export const AllStates = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div style="display: flex; gap: 16px; align-items: center;">
        <md-switch id="switch"></md-switch>
        <label for="switch">Unselected</label>
      </div>
      <div style="display: flex; gap: 16px; align-items: center;">
        <md-switch selected></md-switch>
        <label>Selected</label>
      </div>
      <div style="display: flex; gap: 16px; align-items: center;">
        <md-switch icons></md-switch>
        <label>Unselected with icon</label>
      </div>
      <div style="display: flex; gap: 16px; align-items: center;">
        <md-switch icons selected></md-switch>
        <label>Selected with icon</label>
      </div>
      <div style="display: flex; gap: 16px; align-items: center;">
        <md-switch disabled></md-switch>
        <label>Disabled unselected</label>
      </div>
      <div style="display: flex; gap: 16px; align-items: center;">
        <md-switch disabled selected></md-switch>
        <label>Disabled selected</label>
      </div>
    </div>
  `,
};
