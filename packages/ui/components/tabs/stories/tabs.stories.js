import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import "../tabs.js";
import "../tab.js";
import "../tab-panel.js";

import musicIcon from "@material-design-icons/svg/outlined/music_note.svg?raw";
import movieIcon from "@material-design-icons/svg/outlined/movie.svg?raw";
import bookIcon from "@material-design-icons/svg/outlined/book.svg?raw";
import flightIcon from "@material-design-icons/svg/outlined/flight.svg?raw";
import hotelIcon from "@material-design-icons/svg/outlined/hotel.svg?raw";
import restaurantIcon from "@material-design-icons/svg/outlined/restaurant.svg?raw";

/** @type {import("@storybook/web-components").Meta} */
const meta = {
  title: "Components/Tabs",
  tags: ["autodocs"],
};

export default meta;

/** @typedef {import("@storybook/web-components").StoryObj} Story */

const panelStyle = styleMap({
  padding: "16px",
  fontFamily: "sans-serif",
  fontSize: "0.875rem",
  color: "#444",
});

function wireTabsWithPanels(e) {
  const { value } = e.detail;
  const wrapper = /** @type {HTMLElement} */ (e.target).closest(
    "[data-tabs-demo]",
  );
  wrapper?.querySelectorAll("md-tab-panel").forEach((panel) => {
    /** @type {any} */ (panel).active =
      /** @type {any} */ (panel).value === value;
  });
}

// ── Primary Tabs ──────────────────────────────────────────────────────────────

/** @type {Story} */
export const Primary = {
  render: () => html`
    <div data-tabs-demo>
      <md-tabs value="music" @change=${wireTabsWithPanels}>
        <md-tab value="music">Music</md-tab>
        <md-tab value="movies">Movies</md-tab>
        <md-tab value="books">Books</md-tab>
      </md-tabs>
      <md-tab-panel value="music" active style=${panelStyle}>
        Explore the latest music releases and playlists.
      </md-tab-panel>
      <md-tab-panel value="movies" style=${panelStyle}>
        Browse top-rated films and trailers.
      </md-tab-panel>
      <md-tab-panel value="books" style=${panelStyle}>
        Discover bestsellers and reading lists.
      </md-tab-panel>
    </div>
  `,
};

// ── Secondary Tabs ────────────────────────────────────────────────────────────

/** @type {Story} */
export const Secondary = {
  render: () => html`
    <div data-tabs-demo>
      <md-tabs
        variant="secondary"
        value="flights"
        @change=${wireTabsWithPanels}
      >
        <md-tab value="flights">Flights</md-tab>
        <md-tab value="hotels">Hotels</md-tab>
        <md-tab value="restaurants">Restaurants</md-tab>
      </md-tabs>
      <md-tab-panel value="flights" active style=${panelStyle}>
        Search for available flights.
      </md-tab-panel>
      <md-tab-panel value="hotels" style=${panelStyle}>
        Find hotels near your destination.
      </md-tab-panel>
      <md-tab-panel value="restaurants" style=${panelStyle}>
        Discover local dining options.
      </md-tab-panel>
    </div>
  `,
};

// ── Tabs with Icons and Labels ────────────────────────────────────────────────

/** @type {Story} */
export const IconAndLabel = {
  render: () => html`
    <div data-tabs-demo>
      <md-tabs value="music" @change=${wireTabsWithPanels}>
        <md-tab value="music">
          <span slot="icon">${unsafeSVG(musicIcon)}</span>
          Music
        </md-tab>
        <md-tab value="movies">
          <span slot="icon">${unsafeSVG(movieIcon)}</span>
          Movies
        </md-tab>
        <md-tab value="books">
          <span slot="icon">${unsafeSVG(bookIcon)}</span>
          Books
        </md-tab>
      </md-tabs>
      <md-tab-panel value="music" active style=${panelStyle}>
        Explore the latest music releases and playlists.
      </md-tab-panel>
      <md-tab-panel value="movies" style=${panelStyle}>
        Browse top-rated films and trailers.
      </md-tab-panel>
      <md-tab-panel value="books" style=${panelStyle}>
        Discover bestsellers and reading lists.
      </md-tab-panel>
    </div>
  `,
};

// ── Icon-Only Tabs ────────────────────────────────────────────────────────────

/** @type {Story} */
export const IconOnly = {
  render: () => html`
    <div data-tabs-demo>
      <md-tabs value="music" @change=${wireTabsWithPanels}>
        <md-tab value="music">
          <span slot="icon">${unsafeSVG(musicIcon)}</span>
        </md-tab>
        <md-tab value="movies">
          <span slot="icon">${unsafeSVG(movieIcon)}</span>
        </md-tab>
        <md-tab value="books">
          <span slot="icon">${unsafeSVG(bookIcon)}</span>
        </md-tab>
      </md-tabs>
      <md-tab-panel value="music" active style=${panelStyle}
        >Music content</md-tab-panel
      >
      <md-tab-panel value="movies" style=${panelStyle}
        >Movies content</md-tab-panel
      >
      <md-tab-panel value="books" style=${panelStyle}
        >Books content</md-tab-panel
      >
    </div>
  `,
};

// ── Disabled Tab ──────────────────────────────────────────────────────────────

/** @type {Story} */
export const WithDisabledTab = {
  render: () => html`
    <md-tabs value="music">
      <md-tab value="music">Music</md-tab>
      <md-tab value="movies" disabled>Movies</md-tab>
      <md-tab value="books">Books</md-tab>
    </md-tabs>
  `,
};

// ── Scrollable (many tabs) ────────────────────────────────────────────────────

/** @type {Story} */
export const Scrollable = {
  render: () => html`
    <div
      style="width: 360px; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden;"
    >
      <div data-tabs-demo>
        <md-tabs value="tab1" @change=${wireTabsWithPanels}>
          <md-tab value="tab1">
            <span slot="icon">${unsafeSVG(musicIcon)}</span>
            Music
          </md-tab>
          <md-tab value="tab2">
            <span slot="icon">${unsafeSVG(movieIcon)}</span>
            Movies
          </md-tab>
          <md-tab value="tab3">
            <span slot="icon">${unsafeSVG(bookIcon)}</span>
            Books
          </md-tab>
          <md-tab value="tab4">
            <span slot="icon">${unsafeSVG(flightIcon)}</span>
            Flights
          </md-tab>
          <md-tab value="tab5">
            <span slot="icon">${unsafeSVG(hotelIcon)}</span>
            Hotels
          </md-tab>
          <md-tab value="tab6">
            <span slot="icon">${unsafeSVG(restaurantIcon)}</span>
            Food
          </md-tab>
        </md-tabs>
        <md-tab-panel value="tab1" active style=${panelStyle}
          >Music panel</md-tab-panel
        >
        <md-tab-panel value="tab2" style=${panelStyle}
          >Movies panel</md-tab-panel
        >
        <md-tab-panel value="tab3" style=${panelStyle}
          >Books panel</md-tab-panel
        >
        <md-tab-panel value="tab4" style=${panelStyle}
          >Flights panel</md-tab-panel
        >
        <md-tab-panel value="tab5" style=${panelStyle}
          >Hotels panel</md-tab-panel
        >
        <md-tab-panel value="tab6" style=${panelStyle}>Food panel</md-tab-panel>
      </div>
    </div>
  `,
};

// ── All Variants ──────────────────────────────────────────────────────────────

/** @type {Story} */
export const AllVariants = {
  name: "All Variants",
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 2rem; font-family: sans-serif;"
    >
      <div>
        <p style="font-size: 0.75rem; color: #666; margin: 0 0 0.5rem;">
          Primary — label only
        </p>
        <md-tabs value="a">
          <md-tab value="a">Tab One</md-tab>
          <md-tab value="b">Tab Two</md-tab>
          <md-tab value="c">Tab Three</md-tab>
        </md-tabs>
      </div>

      <div>
        <p style="font-size: 0.75rem; color: #666; margin: 0 0 0.5rem;">
          Primary — icon + label (stacked)
        </p>
        <md-tabs value="a">
          <md-tab value="a">
            <span slot="icon">${unsafeSVG(musicIcon)}</span>
            Music
          </md-tab>
          <md-tab value="b">
            <span slot="icon">${unsafeSVG(movieIcon)}</span>
            Movies
          </md-tab>
          <md-tab value="c">
            <span slot="icon">${unsafeSVG(bookIcon)}</span>
            Books
          </md-tab>
        </md-tabs>
      </div>

      <div>
        <p style="font-size: 0.75rem; color: #666; margin: 0 0 0.5rem;">
          Secondary — label only
        </p>
        <md-tabs variant="secondary" value="a">
          <md-tab value="a">Tab One</md-tab>
          <md-tab value="b">Tab Two</md-tab>
          <md-tab value="c">Tab Three</md-tab>
        </md-tabs>
      </div>

      <div>
        <p style="font-size: 0.75rem; color: #666; margin: 0 0 0.5rem;">
          With disabled tab
        </p>
        <md-tabs value="a">
          <md-tab value="a">Enabled</md-tab>
          <md-tab value="b" disabled>Disabled</md-tab>
          <md-tab value="c">Enabled</md-tab>
        </md-tabs>
      </div>
    </div>
  `,
};
