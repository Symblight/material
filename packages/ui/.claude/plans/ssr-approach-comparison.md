# SSR for @symblight/wc-material — approach comparison

## Context

This library ships Lit `md-*` custom elements. Consumers increasingly render pages server-side
(Next.js, Astro, Enhance, plain Node/Express) and need component markup present in the initial
HTML response, not just after client JS boots. Right now all markup is produced inside each
`LitElement.render()`, so nothing can be rendered in Node without a browser.

Two real strategies exist. This file compares them before committing to a rollout plan.

## Approach A — Fred-style pure-function split

Pattern from https://github.com/mdn/fred/tree/main/components/button: extract each component's
markup into a plain function (`x.pure.js`) taking plain props and returning a `lit-html`
`TemplateResult`. The client `x.js` (`LitElement`) and a new `x.server.js` both call it. The server
wrapper never instantiates the real component class — it just calls the pure function and (our
refinement, since Fred itself renders bare HTML with no shadow DOM) wraps the result in
Declarative Shadow DOM (`<md-button><template shadowrootmode="open">...`) so the real custom
element tag is present pre-hydration and Lit's `@lit-labs/ssr-client` hydration support can reuse
that shadow root on the client.

**Pros**

- Zero risk from `@lit-labs/ssr`'s Node DOM shim: `MutationController` (`@lit-labs/observers`),
  `HTMLForController` (`components/html-for-controller/html-for-controller.js`), and `@lit/context`
  (used by `select.js`) never run server-side at all, because the server wrapper only calls a pure
  function — it never instantiates the real class, so `connectedCallback`/`hostConnected` never
  fire in Node.
- Full control over server output shape and exactly which CSS/markup ships.
- Doesn't require pulling in `@lit-labs/ssr`'s heavier customElements-recognizing renderer at all
  for the server path — just plain `lit-html` string rendering.

**Cons**

- Real re-authoring cost: every component's render logic must be extracted and kept in sync
  between the class instance and the pure function's props (two things to update if behavior
  changes, even though both call the same underlying function).
- Nested custom elements inside a component's shadow root (e.g. `md-button` renders `<md-shadow>`
  and `<md-ripple>` internally) aren't server-rendered by this approach at all — only the parent's
  own DSD is hand-authored; the children still render blank until client JS upgrades them.
- Three files per component instead of one (`x.pure.js` + existing `x.js` + new `x.server.js`),
  plus a hand-rolled DSD-wrapping helper — more long-term surface area across ~25 components.
- We're maintaining bespoke "server rendering" infrastructure ourselves rather than relying on an
  upstream-maintained package's semantics for the actual render step.

## Approach B — Standard `@lit-labs/ssr` (render the real component)

`@lit-labs/ssr`'s `render()`/`renderModule` recognizes custom-element tags inside a `lit-html`
template, looks them up in a shimmed `customElements` registry (`@lit-labs/ssr-dom-shim`), and
actually instantiates the real class — constructor, `connectedCallback` (so every
`ReactiveController`'s `hostConnected` fires), real `render()` — producing Declarative Shadow DOM
for the _whole tree_, including nested custom elements, automatically. On the client,
`@lit-labs/ssr-client/lit-element-hydrate-support.js` patches Lit to reuse that DSD instead of
re-rendering. This is the officially documented Lit SSR story
(https://lit.dev/docs/ssr/overview/) and what integrations like Astro's Lit renderer or
`@lit-labs/nextjs` expect to work against.

**Pros**

- No re-authoring: the exact same component module used in the browser is what gets server
  rendered. One file per component, not three.
- Nested custom elements (`md-shadow`, `md-ripple` inside `md-button`) are server-rendered
  recursively for free — more complete hydration coverage than Approach A gives out of the box.
- Adding a new component gets SSR "for free" — no separate server module to author per component,
  so the pattern scales without growing per-component maintenance work.
- Matches what any consuming framework's existing Lit-SSR integration already assumes, so it
  composes with tooling the ecosystem already has rather than requiring consumers to learn a
  library-specific server API.

**Cons**

- Every `ReactiveController` and any browser API touched during construction/connect/first-render
  must survive Node's DOM shim, and none of that is proven yet:
  - `HTMLForController.hostConnected()` (`components/html-for-controller/html-for-controller.js:26`)
    calls `getRootNode()` then `getElementById()` on it, and wires `addEventListener` — needs
    verification against `@lit-labs/ssr-dom-shim`'s minimal `getRootNode`/event support.
  - `MutationController` from `@lit-labs/observers` sets up a real `MutationObserver` in
    `hostConnected` — Node has no native one; relies on the shim providing a working stub.
  - `@lit/context` (`components/select/select.js`) dispatches a bubbling `context-request` custom
    event — needs the shim's event dispatch/bubbling to behave correctly across shadow roots.
  - This is a _shared-primitive_ risk, not a per-component one — a single bad interaction in
    `ripple.js` or `html-for-controller.js` breaks every component that uses it (`button`, `chips`,
    `switch`, `checkbox`, `radio-button`, etc.).
- The DOM shim is intentionally minimal, not a full jsdom — anything reaching for
  `ResizeObserver`, `Animation`/`element.animate()` (used in `ripple.js`'s `createRipple`, though
  only on click, so likely safe at initial render), or real `getBoundingClientRect` needs an
  `isServer` guard. Requires auditing the _whole_ library up front rather than only the components
  being migrated first, since any component can pull in a shared primitive.
- `@lit-labs/*` packages are still labs-prefixed / less API-stable than core Lit.

## What the existing `isServer` guards tell us

`base-button.js`, `checkbox.js`, `switch.js`, and `radio-button.js` already guard
`connectedCallback`/`disconnectedCallback` event-listener wiring with `isServer` from `lit`. That
guard is _only useful under Approach B_ (it's dead code under Approach A, since the server wrapper
never calls `connectedCallback` at all). This suggests whoever added those guards was already
leaning toward Approach B before this investigation — worth confirming with whoever wrote that
(possibly an earlier session) before picking A and effectively discarding that work.

## Recommendation

Run a narrow, time-boxed **spike for Approach B first**, since its cons are risk that a spike
directly resolves, while Approach A's cons (re-authoring cost, no free nested-component SSR) are
certain costs known up front:

1. Add `@lit-labs/ssr` + `@lit-labs/ssr-client` as dependencies.
2. Write a throwaway Node script that imports `components/badge/badge.js` (simplest, no
   controllers) and server-renders `<md-badge>` through `@lit-labs/ssr`'s real render path.
   Confirm clean DSD output.
3. Repeat with `<md-button>` — this is the real test, since it recursively exercises
   `md-shadow`, `md-ripple`, and `HTMLForController` under the DOM shim. If this throws or
   produces wrong output, that's a concrete, early signal Approach B's shared-primitive risk is
   real for this codebase, not hypothetical.
4. Repeat with `<md-select>` to specifically probe `@lit/context`'s event dispatch under the shim.

If all three render cleanly and hydrate without console warnings on the client: adopt **Approach
B**, since it eliminates ~2/3 of the long-term file/maintenance surface and gets nested-component
SSR for free.

If any of them breaks in a way that isn't a small, contained fix (e.g. `@lit/context` fundamentally
doesn't work under the shim): fall back to **Approach A** for the affected components only —
these two approaches aren't mutually exclusive per-library; a component whose dependency tree
survives the shim can use Approach B with zero extra files, while one that doesn't can still ship
with a hand-authored `x.pure.js` + `x.server.js`. That's a legitimate final architecture, not just
a fallback: pick per-component based on what the spike shows, rather than committing the whole
library to one pattern up front.

## Next step

Waiting on a decision: run the Approach-B spike (steps 1-4 above) before writing the full rollout
plan, or commit to Approach A now and skip straight to the rollout plan (pure.js extraction ordered
by component risk, shared DSD-wrapping helper, new `components/server/` infra, build/export
changes, Node-based SSR tests).

## Addendum — target consumers are HTMX and Astro

Checked Astro's own Lit story: **`@astrojs/lit` was deprecated in Astro 5.0.** Astro's current
recommended pattern for any custom element (including Lit ones) is no longer "the framework
server-renders your component" — it's just: emit the tag as plain markup, add a
`<script type="module">` that imports/registers the element, let the browser upgrade it once
connected. That's architecturally the same model HTMX already uses (server returns an HTML
fragment containing `<md-button>`, HTMX swaps it into the connected DOM, the browser
auto-upgrades any tag that's already `customElements.define`'d — no shadow-DOM hydration, no
`@lit-labs/ssr`, no DSD required for either target).

This changes what's worth doing _now_, before committing to Approach A or B:

1. **Audit attribute coverage.** Everything a consumer needs to set from server-rendered markup
   must work as a plain HTML attribute, not only a JS property, since neither HTMX nor
   plain-Astro markup can set JS properties before upgrade. Check each component's
   `static properties`/`attribute:` mappings for gaps (e.g. anything with `attribute: false` or a
   non-primitive type that a server-rendered page would need to configure).
2. **Add a pre-upgrade fallback style.** Right now there's no `:not(:defined)` CSS anywhere in the
   library (checked — none found). Before JS loads/upgrades, an un-upgraded `<md-button>` renders
   as an inline unstyled element with visible light-DOM text — worth a small shared stylesheet rule
   per component (or one shared one, e.g. hiding content or applying baseline layout until
   `:defined`) so HTMX-swapped fragments and Astro's static output don't flash unstyled content
   for the gap between DOM insertion and hydration.
3. **Verify components tolerate "attributes only, no JS ever touched them" as the entire initial
   state.** This is implicitly true today (constructors set defaults, attributes override) but
   hasn't been explicitly tested — worth a quick check per component rather than assumed.
4. **Try an HTMX fragment-swap smoke test now** — no SSR library needed. Any small Node/Express
   route returning a plain HTML string containing `<md-button variant="filled">Save</md-button>`,
   swapped into a page that already loaded `components/index.js`, proves the auto-upgrade path
   works end-to-end. This is cheap and validates items 1–3 immediately, independent of the
   Approach A/B decision above.
5. The Approach-B spike (`@lit-labs/ssr` + DSD) is still worth doing, but reframe its purpose:
   it's no longer "what Astro needs" (Astro dropped that), it's "what we'd need to hand-build
   ourselves if we ever want zero-flash/crawlable first paint" — a genuinely optional, lower-priority
   stretch goal now, not a prerequisite for either HTMX or Astro support.

Net effect: items 1–4 are the actual near-term SSR prep for the two stated targets, are cheap,
and don't require picking Approach A or B first. The heavier work only matters if a future
requirement shows up that neither HTMX's fragment-swap model nor Astro's current plain-markup
model satisfies (e.g. needing correct visual output for crawlers/no-JS clients).

## Component-by-component SSR risk audit (read-only, no code changed)

Swept every file under `components/` for browser-only globals (`window.`, `document.`,
`navigator.`, `localStorage`, `matchMedia`), observers (`ResizeObserver`, `IntersectionObserver`,
`MutationObserver`/`MutationController`), layout/animation APIs (`getBoundingClientRect`,
`getComputedStyle`, `.animate()`), `ElementInternals`/`attachInternals`, and `@lit/context` usage.
Findings split by which SSR scenario they actually matter for.

### Tier 1 — will break the moment the real component class executes in Node (only matters if `@lit-labs/ssr` / Approach B is ever adopted; irrelevant to plain-markup HTMX/Astro)

- **`md-avatar`** (`components/avatar/avatar.js:37`) — `render()` calls the bare global
  `getComputedStyle(this)` unconditionally, on every render including the first. This is a
  `window` global with no Node equivalent; nothing in the library guards it with `isServer`.
  Highest-confidence break in the whole audit — real SSR execution throws here immediately.
  Even a permissive shim wouldn't save it: `getComputedStyle(...).getPropertyValue(...)` would
  resolve to `""`, then `Number("".replace("px",""))` → `NaN`, which flows straight into the SVG's
  `cx`/`cy`/`r` attributes — broken output either way, not just a crash.
- **`md-radio`** (`components/radio-button/radio-selection.js:32`) —
  `RadioSelectionController.hostConnected()` unconditionally does `new MutationObserver(...)` and
  `.observe()`, with **no `isServer` guard**. Notably inconsistent with its sibling
  `radio-button.js`, which _does_ guard its own click-listener wiring with `isServer` — this is
  the one spot in the codebase where that pattern was started but not finished.

### Tier 2 — depends on `ElementInternals` shim completeness in `@lit-labs/ssr-dom-shim` (unverified; only matters for Approach B)

`md-checkbox`, `md-switch`, `md-radio` (`components/radio-button/form-associate.js`), and
`md-select` all call `this.attachInternals()` unconditionally in their constructors, none guarded
by `isServer`. `md-select` goes further and calls `this[internals].setFormValue(value)` and reads
`this[internals].form` (`components/select/select.js:116,165`) — these specific methods, not just
the base `attachInternals()` call, need to exist in the shim. Whether this throws or silently
no-ops is unverified — flagged as "needs a spike," not confirmed broken.

### Tier 3 — nested-custom-element depth risk (only matters for Approach B, where the whole tree is driven recursively)

- **`md-button`** renders `<md-shadow>` and `<md-ripple>` internally; `md-ripple` depends on
  `HTMLForController` (`components/html-for-controller/html-for-controller.js:26`), whose
  `hostConnected()` calls `getRootNode()` and then treats the result as if `getElementById` is
  always available on it — unverified against the DOM shim's shadow-root implementation.
- **`md-select`** renders `<md-text-field>` internally and reaches into it imperatively in its own
  `firstUpdated()` (`this.textField.value = " "`, `select.js:146-148`) — assumes the child custom
  element has already fully upgraded and rendered by the time the parent's `firstUpdated` runs;
  that ordering guarantee is untested under the DOM shim.
- **`md-tabs`/`md-tab`** — `getIndicatorClientRect()` / `.animate()` / `.getAnimations()`
  (`components/tabs/tab.js:73-95`) only run in response to a `tab-activate` event fired from a real
  click (`components/tabs/tabs.js:72,99`), never during initial render/connect — **not a
  server-execution risk in practice**. Noted only because _if_ something did trigger it server-side,
  `getBoundingClientRect()` returns a zero-rect with no layout engine behind it, silently producing
  a degenerate animation rather than throwing.

### Tier 4 — real bug relevant to the actual near-term target (plain server-rendered attribute markup + client upgrade), independent of Approach A/B entirely

- **`md-dialog`** (`components/dialog/dialog.js:52-70`): `open` is a hand-written accessor (not a
  plain reactive property) that calls `this.show()`/`this.close()` as a side effect of being set.
  If a server renders `<md-dialog open>...</md-dialog>` (exactly the kind of server-driven initial
  state SSR/HTMX would want to express), Lit's attribute→property reflection invokes this setter
  during element upgrade — **before** the shadow DOM has rendered for the first time. At that
  point `this.dialog` (`renderRoot?.querySelector("dialog")`) is `undefined`, so `show()` no-ops
  (`isOpening = false`, early return) and `dialog.showModal()` is never called. Net effect: a
  dialog meant to start open, driven by a server-rendered `open` attribute, silently fails to
  invoke native modal semantics (no top-layer promotion, no `::backdrop`, no focus trap) once
  hydrated. This doesn't need Approach B, `@lit-labs/ssr`, or any real SSR library at all to
  surface — it happens with the plain "server emits attributes, browser upgrades" model that's
  the actual near-term plan.

## `md-dialog` — critique of the quick fix, and a proposed architecture redesign

### Critique of the `hasUpdated`/`updateComplete.then()` patch proposed earlier

That patch (guard `show()`/`close()` with `if (!this.hasUpdated) { this.updateComplete.then(() => this.show()); return; }`) does stop the immediate crash/no-op, but it's a band-aid with real problems:

1. **Doesn't guard `isConnected`.** Lit performs its first update on a microtask regardless of whether the element is actually connected to the document (`createRenderRoot`/first render aren't gated on `connectedCallback`). If the element is upgraded but never inserted (or removed before the deferred callback fires), the deferred `show()` still runs and calls `dialog.showModal()` on a disconnected `<dialog>`, which throws `InvalidStateError` ("not in a Document"). The patch as written doesn't catch this.
2. **Rapid toggling before first render races itself.** If `open` is set true then false (or vice versa) before the first update flushes, both calls schedule their own `.then()` deferral. Both fire after the same microtask, back to back, and neither re-checks "is this still the current desired state" — `show()`'s deferred body doesn't know a `close()` was queued after it. Net result: a spurious open→close flicker with `open`/`opened`/`closed` events firing out of order. Unlikely in practice (a boolean attribute is set once at parse time) but a real correctness gap for anyone toggling `open` imperatively right after construction.
3. **Treats the symptom, not the cause.** The actual problem is architectural: `open`'s custom accessor mixes three concerns that don't belong in the same place — (a) reactive property state, (b) manual attribute reflection (`setAttribute`/`removeAttribute`, duplicating what Lit's own `reflect: true` already does for free when there's no custom accessor overriding it), and (c) imperative native-API side effects (`showModal()`/`close()`) invoked at property-assignment time rather than at "DOM is guaranteed to exist" time. The patch papers over consequence (3)'s timing bug without removing the coupling that caused it.
4. **Four overlapping notions of "is it open."** The class already tracks `open` (public), `isOpen` (internal mirror, always kept 1:1 with `open` via the accessor), `isOpening` (transitional flag to prevent re-entrant `show()`), and the native `dialog.open`. That's three JS-side booleans doing the job that one property plus the native element's own state can do, and it's exactly the kind of state duplication that produces ordering bugs like this one.

### Proposed redesign

Move all native-`<dialog>` side effects into `updated()`, which Lit guarantees only runs after `render()` has populated `renderRoot` — for every update, including the first. This makes the fix structural instead of a timing patch: there's no "before first render" case to special-case, because the code that touches `this.dialog` literally cannot run before it exists.

```js
static properties = {
  open: { type: Boolean, reflect: true },
  type: {},
};

constructor() {
  super();
  this.open = false;
  this.type = undefined;
}

get dialog() {
  return this.renderRoot?.querySelector("dialog") ?? undefined;
}

updated(changedProperties) {
  super.updated(changedProperties);
  if (!changedProperties.has("open")) return;

  const dialog = this.dialog;
  if (!dialog) return;

  if (this.open) {
    if (dialog.open) return; // already visually open — nothing to do
    const preventOpen = !this.dispatchEvent(
      new Event("open", { cancelable: true }),
    );
    if (preventOpen) {
      this.open = false; // revert; re-enters `updated()` but dialog.open is still false, so it's a no-op
      return;
    }
    try {
      dialog.showModal();
    } catch {
      this.open = false; // e.g. disconnected before this ran — don't leave state claiming "open"
      return;
    }
    this.querySelector("[autofocus]")?.focus();
    this.dispatchEvent(new Event("opened"));
  } else if (dialog.open) {
    dialog.close();
    this.dispatchEvent(new Event("closed"));
  }
}

async show() {
  this.open = true;
  await this.updateComplete;
}

async close() {
  this.open = false;
  await this.updateComplete;
}

render() {
  return html`<dialog modal-mode="mega" class="dialog" @close=${() => {
    if (this.open) this.open = false; // synced from native ESC / form[method=dialog] close
  }}>
    <header class="dialog__header"><slot name="headline"></slot></header>
    <div class="dialog__body"><slot></slot></div>
    <footer class="dialog__footer"><slot name="footer"></slot></footer>
  </dialog>`;
}
```

What this changes and why it's still safe:

- **Collapses `open`/`isOpen`/`isOpening` into just `open`.** Confirmed via repo-wide grep that nothing outside `dialog.js` references `isOpen`/`isOpening`, so this is safe to remove. `dialog.open` (the native element) becomes the single ground-truth check for "is it currently really showing," replacing the old `isOpening` re-entrancy flag.
- **Drops the manual `setAttribute`/`removeAttribute("open")` calls** — `open: { reflect: true }` with no custom accessor makes Lit do this automatically, and correctly (it only reflects when `hasChanged` says the value actually changed, which is also what gives back the "setting the same value twice doesn't re-trigger" behavior for free, verified against `components/dialog/__tests__/dialog.spec.js`'s existing test of that name — Lit's generated setter never calls `requestUpdate` for a no-op assignment, so `updated()` never re-runs).
- **Drops the `?open=${this.isOpen}` binding on the inner `<dialog>`.** Currently both Lit (declaratively) and the browser (via `showModal()`/`close()`, which auto-manage the native `open` attribute) write to the same attribute — a two-writer conflict. Removing the binding leaves the browser as sole owner of that specific attribute. **Trade-off worth flagging for later:** if a future SSR path wants the dialog to render already-visible before hydration (`<md-dialog open>` server-rendered with DSD), the server-rendering code will need to explicitly emit `<dialog open>` in the inner markup itself, since this client-side binding no longer does it.
- **`show()`/`close()` become thin property-setting wrappers** instead of duplicating the open/close logic — the cancelable `open` event, the `showModal()` call, and the `opened`/`closed` events all live in exactly one place (`updated()`), reached whether `open` was set via `.show()`, direct property assignment, or (the original bug) attribute reflection during element upgrade from server-rendered markup. That unification is what actually fixes the bug: there's no longer a "declarative path" and a separate "imperative path" that could get out of sync.
- Verified against every test in `components/dialog/__tests__/dialog.spec.js` (rendering, `open` prop reflection/idempotency, `show()`'s cancelable-event and modal-opening behavior, `close()`'s idempotent no-op-when-already-closed behavior, slot projection) — all pass under this design by inspection; none of them assert on `isOpen`/`isOpening` directly, only on `el.open`, `dialog.open`, and dispatched events, so the internal simplification doesn't touch anything they pin.
- Still doesn't fully solve the disconnected-before-first-update edge case beyond catching the exception — if that scenario matters, an explicit `if (!this.isConnected) return;` guard at the top of the `updated()` block would be the next small addition, but it's a pre-existing gap in the original code too (not something this redesign introduces).

Not applied — this is the investigation/design the user asked for. Say the word and it can be written to `components/dialog/dialog.js`.

### Does the redesign work through Declarative Shadow DOM?

Two separate questions here — one applies to every component, one is dialog-specific.

**1. Universal prerequisite (not dialog-specific).** For _any_ Lit component to hydrate from
server-rendered DSD without crashing, `@lit-labs/ssr-client/lit-element-hydrate-support.js` must
be imported before the component registers. Without it, `LitElement`'s default
`createRenderRoot()` calls `this.attachShadow(...)` on an element that — per the DSD spec —
already has a shadow root attached from parsing the `<template shadowrootmode>`, and `attachShadow()`
throws `NotSupportedError` ("Shadow root cannot be created on a host which already hosts a shadow
tree"). This isn't wired up anywhere in this project yet (no `@lit-labs/ssr-client` dependency)
— it's a hard blocker for DSD specifically, independent of Approach A/B or of `md-dialog`.

**2. Dialog-specific: the inner `<dialog>` must never be pre-rendered with the `open` attribute,
even when the host's `open` property is `true`.** Per the HTML spec, `HTMLDialogElement.showModal()`
throws `InvalidStateError` if the dialog **already has** an `open` attribute — regardless of
whether it's actually modal. So if a future SSR wrapper tried to make the dialog "look already
open" pre-hydration by emitting `<dialog open>` inside the DSD `<template>`, the first `updated()`
call after hydration would hit `if (dialog.open) return;` and skip `showModal()` entirely (correctly
avoiding the throw) — but the dialog would then be permanently stuck in "has the `open` attribute
but was never actually promoted to a real modal" (no top-layer, no `::backdrop`, no focus trap, no
Escape-to-close, since only `:modal` dialogs get that). Calling `close()` first and then
`showModal()` to "fix" it would just cause a visible flash.

The redesign already avoids this by construction: dropping the `?open=${this.isOpen}` binding on
the inner `<dialog>` (part of the redesign above) means `render()`'s template has no binding that
could ever emit `open` on the inner tag — so whatever future SSR code reuses this same `render()`
output (Approach A's pure function, or Approach B's real-component render) will never produce
`<dialog open>` server-side, since that markup literally isn't in the template anymore. Hydration
will therefore always see `dialog.open === false` initially and correctly call `showModal()` once,
the first time the host's `open` property is `true`.

**Net conclusion:** yes, the redesign works through DSD — but the practical implication is that
`md-dialog`'s open/modal state is inherently a client-side-only concept: a dialog cannot be made
to visually appear already-open in the initial (pre-hydration) HTML, only right after hydration
runs `showModal()` for the first time. That's a limitation of the native `<dialog>` API itself
(the spec's `showModal()` precondition), not something this redesign — or any redesign — can work
around. Worth documenting explicitly as a rule for whoever eventually writes `dialog.server.js`:
never hand-add `open` to the inner `<dialog>` tag.

### Can it still _look_ open before hydration, if the server sets `open`?

Revisited this — the answer is a qualified yes, and this component's own CSS
(`components/dialog/dialog.css`) makes it nearly free:

- `.dialog` is `position: fixed; inset: 0; margin: auto;` **unconditionally** — not gated on
  `:modal` at all. Only `.dialog:not([open]) { opacity: 0; pointer-events: none; }` hides it, and
  `.dialog[open]` triggers the existing entrance animation. None of the actual box positioning,
  sizing, or entrance animation depends on the dialog being a _true_ modal.
- The only things a non-modal `<dialog open>` is actually missing, visually and behaviorally,
  compared to a real `showModal()`'d one: the `::backdrop` scrim (that pseudo-element only exists
  for `:modal` dialogs), guaranteed top-layer stacking, native focus trap, and Escape-to-close.

So a server-rendered `<dialog open>` would already render as a correctly-positioned, correctly-
animated dialog card — just without the dimmed backdrop behind it — for the brief window before
JS loads. That's a real, worthwhile improvement over "invisible until hydrated," _if_ it can then
be promoted to a genuine modal without a visible flash once JS runs.

**The technique:** native `showModal()` throws if `open` is already present — but `close()` then
`showModal()`, called back-to-back with no `await`/microtask in between, produces no visible flash,
because the browser only paints after the script yields; two synchronous DOM mutations in the same
task never get an intermediate frame rendered between them. So on the first `updated()` pass,
distinguish "already a real modal" from "just has the attribute from server markup" via the
`:modal` CSS pseudo-class (`dialog.matches(":modal")`, well-supported in evergreen browsers):

```js
if (this.open) {
  if (dialog.open) {
    if (!dialog.matches(":modal")) {
      // came pre-opened from server-rendered markup — promote synchronously, no paint in between
      this.#promoting = true;
      dialog.close();
      dialog.showModal();
      this.#promoting = false;
    }
    return;
  }
  // ...existing cancelable-`open`-event + showModal() path for the normal "wasn't open yet" case
}
```

**One real gotcha this introduces:** `dialog.close()` fires a native `close` event, which the
redesign's own template listens for (`@close=${() => { if (this.open) this.open = false; }}`) to
sync back native-triggered closes (Escape key, `<form method=dialog>`). Without a guard, that
handler would fire mid-promotion and reset `this.open` to `false` right before `showModal()` runs,
leaving the host's `open` property saying `false` while the native dialog is actually open — a real
state inconsistency. The `#promoting` private flag above exists specifically to suppress that one
self-triggered `close` event; the native-close handler needs to check it too:
`@close=${() => { if (this.#promoting) return; if (this.open) this.open = false; }}`.

**Assessment:** this works, and the CSS already does most of the heavy lifting — but it's a
noticeably more delicate piece of code than the base redesign (leans on "no repaint between two
synchronous calls," needs a private re-entrancy flag, needs `:modal` support). Given dialogs are
inherently JS-only interactive surfaces anyway (there's no way to open one without JS or a
`<form method=dialog>` submission in the first place) and the pre-hydration window is typically a
couple hundred milliseconds, this is worth treating as an **optional polish layer on top of the
base redesign**, not something to bundle into the first pass — the base redesign already fixes the
actual bug (silent no-op) and is safe/simple; this promotion trick is a "nice to have" for the
specific case of a dialog that's meant to start open, server-rendered as such.

### No findings

No `window.`/`document.`/`navigator.`/`localStorage`/`matchMedia`/`ResizeObserver`/
`IntersectionObserver`/`requestAnimationFrame` usage anywhere in `components/`. `md-badge`,
`md-icon`, `md-progress-circular`, `md-progress-linear`, `md-card`, `md-fab`, `md-icon-button`,
the `md-chips` family, `md-list`/`md-list-item`, and `md-text-field` turned up nothing in this
sweep — consistent with them being the safest starting point for either SSR approach.
