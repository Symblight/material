import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

import "../select";
import "../../button/button.ts";

import SelectProps from "../select.ts";

function Select({ variant, disabled }: SelectProps) {
  const handleChange = (event) => {
    console.log(event.target.value);
  };
  return html`
    <md-select ?disabled=${disabled} variant=${variant} @change=${handleChange}>
      <md-option value="">--Please choose an option--</md-option>
      <md-option value="tutor"> Tutor </md-option>
      <md-option value="student" selected> Student </md-option>
      <md-option value="classroom"> Classroom </md-option>
    </md-select>
  `;
}

const meta = {
  title: "Select",
  component: "md-select",
  tags: ["autodocs"],
  render: Select,
  argTypes: {
    variant: {
      options: ["filled", "outlined"],
      control: { type: "select" },
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
} satisfies Meta<SelectProps>;
export default meta;

type Story = StoryObj<SelectProps>;

export const Regular: Story = {
  args: {},
};

export const Form: Story = {
  args: {},
  render: ({}) => {
    function handleSubmit(e: Event) {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      console.log(formData);
    }

    function handleReset() {
      document.querySelector("form")?.reset();
    }

    async function handleLoad() {
      const fetcher = () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(["Mirro", "Quizlet", "Google meet"]), 300),
        );

      const result = await fetcher();

      const selectEl = document.querySelector("#select");
      result.forEach((el) => {
        const optionEl = document.createElement("md-option");
        optionEl.setAttribute("value", el);
        optionEl.innerText = el;
        selectEl.appendChild(optionEl);
      });
    }

    return html`<form @submit=${handleSubmit}>
        <md-select id="select" name="my-select"> </md-select>
        <md-button type="submit">Submit</md-button>
        <md-button type="button" @click=${handleReset}>Reset</md-button>
      </form>

      <md-button @click=${handleLoad}>Load more</md-button> `;
  },
};

export const Group: Story = {
  args: {},
  render: () => {
    return html`
      <md-select name="my-select">
        <md-option value="">--Please choose an option--</md-option>
        <md-option value="test"><div>TEST NESTED DIV</div></md-option>
        <md-optgroup label="person">
          <md-option value="tutor"> Tutor </md-option>
          <md-option value="student"> Student </md-option>
        </md-optgroup>
        <md-hr></md-hr>
        <md-optgroup label="place">
          <md-option value="classroom"> Classroom </md-option>
          <md-option value="online"> Online </md-option>
        </md-optgroup>
      </md-select>
    `;
  },
};
