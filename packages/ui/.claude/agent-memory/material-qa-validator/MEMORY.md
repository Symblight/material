# Agent Memory Index

## Feedback

- [feedback_test_import_pattern.md](./feedback_test_import_pattern.md) — Test files must import components with `.ts` extension, not `.js`
- [feedback_pointer_events_slotted.md](./feedback_pointer_events_slotted.md) — pointerenter/pointerleave are non-bubbling; must attach directly to slotted elements via slotchange, not only to host
- [feedback_slotchange_timing.md](./feedback_slotchange_timing.md) — `slotchange` fires before child `@query` shadow elements are available; test roving-tabindex via keyboard events, not initial slot-population assertions

## Project

- [project_card_component.md](./project_card_component.md) — `md-card` component implemented and all 4 AC bugs fixed (2026-03-24)
