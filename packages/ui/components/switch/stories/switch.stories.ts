import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components";

import "../switch.ts";
import type MdSwitch from "../switch.ts";

const meta: Meta<MdSwitch> = {
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
type Story = StoryObj<MdSwitch>;

export const Unselected: Story = {
  args: { selected: false },
};

export const Selected: Story = {
  args: { selected: true },
};

export const WithIcons: Story = {
  args: { selected: false, icons: true },
  render: () => html`
    <div style="display: flex; gap: 16px; align-items: center;">
      <md-switch icons></md-switch>
      <md-switch icons selected></md-switch>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div style="display: flex; gap: 16px; align-items: center;">
      <md-switch disabled></md-switch>
      <md-switch disabled selected></md-switch>
    </div>
  `,
};

export const AllStates: Story = {
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
