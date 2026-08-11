import { createContext } from "@lit/context";

/**
 * Provided by `md-select`, consumed by `md-option`/`md-option-group` to
 * compute their own `aria-selected` from the select's current `value`.
 *
 * Kept in its own module rather than `select.js` to avoid a circular
 * `select.js` <-> `option.js` dependency.
 *
 * @typedef {{ value: string }} SelectContextValue
 * @typedef {import("@lit/context").Context<symbol, SelectContextValue>} ContextSelect
 */

/** @type {ContextSelect} */
export const selectContext = createContext(Symbol("select"));
