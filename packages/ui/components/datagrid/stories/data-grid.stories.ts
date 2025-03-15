import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";

import "../data-grid.ts";

import type DataGrid from "../data-grid.ts";

function Template() {
  return html`
        <md-data-grid></md-data-gridc>`;
}

const meta = {
  title: "DataGrid",
  component: "md-data-grid",
  tags: ["autodocs"],
  render: Template,
  argTypes: {},
} satisfies Meta<DataGrid>;
export default meta;

type Story = StoryObj<DataGrid>;

export const Regular: Story = {
  args: {},
  render: () => html`
    <md-data-grid
      .columns="${[
        {
          field: "name",
          header: "Username",
        },
        {
          field: "email",
          header: "Email",
        },
        {
          field: "status",
          header: "User status",
        },
      ]}"
      .data="${[
        { name: "John", email: "my-email@gmail.com", status: "dev" },
        {
          name: "Jane",
          email: "test@ttest.dev",
          status: "none",
        },
      ]}"
    >
    </md-data-grid>
  `,
};
