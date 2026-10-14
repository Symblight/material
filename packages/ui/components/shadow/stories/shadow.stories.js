import { html, nothing } from "lit";

import "../shadow.js";

/** @import MdShadow from "../shadow.js" */

/** @typedef {{ level?: MdShadow["level"], shadowColor?: string }} ShadowArgs */

const surfaceStyle = `
  position: relative;
  display: grid;
  place-items: center;
  inline-size: 8rem;
  block-size: 6rem;
  border-radius: var(--md-sys-shape-corner-medium, 12px);
  background-color: var(--md-sys-color-surface-container-low, #f7f2fa);
  color: var(--md-sys-color-on-surface, #1d1b20);
  font: 500 0.875rem/1.25rem system-ui, sans-serif;
`;

const rowStyle =
  "display:flex;gap:2rem;flex-wrap:wrap;padding:2rem;align-items:center;";

/**
 * @param {ShadowArgs} args
 */
function ShadowStory({ level, shadowColor }) {
  return html`
    <div style="padding:2rem">
      <div
        style="${surfaceStyle}${
          shadowColor ? `--md-shadow-color:${shadowColor};` : ""
        }"
      >
        <md-shadow level=${level ?? nothing}></md-shadow>
        Level ${level ?? "—"}
      </div>
    </div>
  `;
}

/** @type {import("@storybook/web-components").Meta<ShadowArgs>} */
const meta = {
  title: "Components/Shadow",
  component: "md-shadow",
  tags: ["autodocs"],
  render: ShadowStory,
  argTypes: {
    level: {
      control: { type: "inline-radio" },
      options: [0, 1, 2, 3, 4, 5],
      description:
        "MD3 elevation level (0–5). Overrides the inherited `--md-elevation-level`.",
    },
    shadowColor: {
      control: { type: "color" },
      description:
        "Sets `--md-shadow-color` on the container. Defaults to `--md-sys-color-shadow`.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Decorative MD3 elevation shadow. Place it as the first child of a positioned element; it fills the container, follows its `border-radius`, and never intercepts pointer input.",
      },
    },
  },
};

export default meta;

/** @typedef {import("@storybook/web-components").StoryObj<ShadowArgs>} Story */

/** @type {Story} */
export const Playground = {
  args: { level: 2 },
};

/** @type {Story} */
export const AllLevels = {
  render: () => html`
    <div style=${rowStyle}>
      ${[0, 1, 2, 3, 4, 5].map(
        (level) => html`
          <div style=${surfaceStyle}>
            <md-shadow level=${level}></md-shadow>
            Level ${level}
          </div>
        `,
      )}
    </div>
  `,
};

/** @type {Story} */
export const InheritedLevel = {
  name: "Inherited --md-elevation-level",
  render: () => html`
    <div style="${rowStyle}--md-elevation-level:4;">
      <div style=${surfaceStyle}>
        <md-shadow></md-shadow>
        Inherited (4)
      </div>
      <div style=${surfaceStyle}>
        <md-shadow level="1"></md-shadow>
        level="1" wins
      </div>
    </div>
  `,
};

/** @type {Story} */
export const CustomColor = {
  args: { level: 3, shadowColor: "#6750a4" },
};
