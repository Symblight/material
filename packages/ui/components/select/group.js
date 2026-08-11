import { customElement } from "lit/decorators.js";

import { MdMenuGroup } from "../menu/group.js";

/**
 * @tag md-option-group
 * @summary Material Design 3 select option group.
 *
 * Groups `md-option` elements under an optional label. Extends
 * `md-menu-group` verbatim, purely for a clearer select-specific tag name.
 */
@customElement("md-option-group")
export class MdOptionGroup extends MdMenuGroup {}
