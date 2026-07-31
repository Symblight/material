import { MdBadge } from "./badge/badge.js";
import { MdTab } from "./tabs/tab.js";
import { MdTabPanel } from "./tabs/tab-panel.js";
import { MdTabs } from "./tabs/tabs.js";
import { MdCard } from "./card/card.js";
import { MdList } from "./list/list.js";
import { MdListItem } from "./list/list-item.js";
import { TextField } from "./text-field/text-field.js";
import RadioButton from "./radio-button/radio-button.js";
import MdProgressCircular from "./progress-circular/progress-circular.js";
import MdSuggestionChip from "./chips/suggestion-chip.js";
import MdAssistChip from "./chips/assist-chip.js";
import MdFilterChip from "./chips/filter-chip.js";
import MdInputChip from "./chips/input-chip.js";
import MdShadow from "./shadow/shadow.js";
import FAB from "./fab/fab.js";
import MdRipple from "./ripple/ripple.js";
import Checkbox from "./checkbox/checkbox.js";
import MdDialog from "./dialog/dialog.js";
import MdProgressLinear from "./progress-linear/progress-linear.js";
import Button from "./button/button.js";
import Avatar from "./avatar/avatar.js";
import MdSwitch from "./switch/switch.js";
import Select from "./select/select.js";
import IconButton from "./icon-button/icon-button.js";
import Icon from "./icon/icon.js";

declare global {
  interface HTMLElementTagNameMap {
    "md-badge": MdBadge;
    "md-tab": MdTab;
    "md-tab-panel": MdTabPanel;
    "md-tabs": MdTabs;
    "md-radio": RadioButton;
    "md-card": MdCard;
    "md-progress-circular": MdProgressCircular;
    "md-suggestion-chip": MdSuggestionChip;
    "md-assist-chip": MdAssistChip;
    "md-filter-chip": MdFilterChip;
    "md-input-chip": MdInputChip;
    "md-shadow": MdShadow;
    "md-fab": FAB;
    "md-ripple": MdRipple;
    "md-checkbox": Checkbox;
    "md-dialog": MdDialog;
    "md-progress-linear": MdProgressLinear;
    "md-button": Button;
    "md-list": MdList;
    "md-list-item": MdListItem;
    "md-avatar": Avatar;
    "md-switch": MdSwitch;
    "md-text-field": TextField;
    "md-select": Select;
    "md-icon-button": IconButton;
    "md-icon": Icon;
  }
}
