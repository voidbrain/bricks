# <a id="top"></a>bricks backlog

Current work ledger, reviewed 25 November 2026 against main `15ee8d9`. Generated from [record sources](work/records) and [steps](work/tasks) by `npm run work:build`: edit those, not this file. [Rules](BACKLOG-RULES.md) · [Archive](archive/README.md) · [Reading the records](#how-to-use-this-file).

<!-- totals:start -->
**Remaining effort:** 63 h agent + 0.5 h owner across 29 open steps of 9 features. Generated from the task files.
<!-- totals:end -->

## Work items

Bugs (B-) and features (F-) in one list, in work-queue order. Steps: `effort` = remaining agent time (🟢 up to 1 h · 🟡 4 h · 🔴 8 h · 🟣 more); `h` = agent hours, owner time apart; a step status is not the record's acceptance.

### <a id="f-005"></a>[✨ F-005](#top)

**Semantic versioning and a changelog**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔶 P2 | 🟢 Small | 1 h | — | [F-004-T04](#f-004-t04), [F-004-T06](#f-004-t06) | 🤖 | — | — |

💻 **→** Next: F-005-T01 — CHANGELOG.md and the version-to-changelog check (Implemented; verification pending).

| | |
|---|---|
| **Issue** | Consumers pin a version of `@voidbrain/bricks`, so every release needs a semantic version and a changelog entry saying what changed and what breaks. Before 1.0.0 a minor version may break, and the changelog says so. |
| **Reproduce** | There is no CHANGELOG.md and no rule tying a package version to an entry. |
| **Check** | CHANGELOG.md (Keep a Changelog layout) with 0.1.0; a project check fails CI when `projects/bricks/package.json` changes version without a matching changelog heading; the release procedure (version, changelog, tag `vX.Y.Z`) is written in docs/agents/areas.md. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks |
|---|---|---|---|---|---|---|---|
| 🟢 Small | <a id="f-005-t01"></a>F-005-T01 — CHANGELOG.md and the version-to-changelog check | 3 h | 0 h | 0 h | Implemented; verification pending | — | [F-004-T04](#f-004-t04), [F-005-T02](#f-005-t02) |
| 🟢 Small | <a id="f-005-t02"></a>F-005-T02 — Release procedure: version, changelog, tag | 1 h | 0 h | 1 h | Planned | [F-005-T01](#f-005-t01) | [F-004-T06](#f-004-t06) |
| 🟢 Small | **Total** | 4 h | 0 h (0 of 2 steps recorded) | 1 h | 0 of 2 completed | | |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-005.md)

| Field | Value |
|---|---|
| PR / evidence | [#5](https://github.com/voidbrain/bricks/pull/5) |
| Opened | 2026-11-25 |
| Verification | Pending |
| Reviewed | 2026-11-25 |

</details>

---
### <a id="f-004"></a>[✨ F-004](#top)

**Publish the package on npm with trusted publishing**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔶 P2 | 🔴 Large | 5 h agent + 0.25 h owner | [F-005-T01](#f-005-t01), [F-005-T02](#f-005-t02) | [F-006-T03](#f-006-t03), [F-007-T03](#f-007-t03), [F-008-T02](#f-008-t02), [F-009-T02](#f-009-t02) | 🤖 | — | — |

💻 **→** Next: F-004-T01 — Registry decision: public npm with trusted publishing (Implemented; verification pending).

| | |
|---|---|
| **Issue** | `@voidbrain/bricks` is built (dist/bricks) but not published, so no project can install it. Owner decision 2026-11-25: the public npm registry (not GitHub Packages), with npm trusted publishing (GitHub Actions OIDC, no stored npm token). The owner sets up the npm side; the agent writes the release workflow and checks the first publish. |
| **Reproduce** | `npm view @voidbrain/bricks` finds nothing. |
| **Check** | The owner has an npm account and the npm organisation `voidbrain`; trusted publishing is enabled for voidbrain/bricks and the release workflow; a `v*` tag on main publishes with provenance and no npm token in the repository; 0.1.0 installs in a clean Angular 22 project and its entry points and CSS resolve. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who | PRs |
|---|---|---|---|---|---|---|---|:---:|---|
| 🟢 Small | <a id="f-004-t01"></a>F-004-T01 — Registry decision: public npm with trusted publishing | 0 h | 0 h | 0 h | Implemented; verification pending | — | — | 🤖 | [PR #1](https://github.com/voidbrain/bricks/pull/1) registry decision recorded |
| 🟡 Medium | <a id="f-004-t04"></a>F-004-T04 — Release workflow with npm trusted publishing | 3 h | 0 h | 3 h | Planned | [F-005-T01](#f-005-t01) | [F-004-T05](#f-004-t05) | ⏳ 🤖 | — |
| 🟢 Small | <a id="f-004-t05"></a>F-004-T05 — Owner enables trusted publishing for voidbrain/bricks | 0 h | 0 h | 0 h agent + 0.25 h owner | Planned | [F-004-T04](#f-004-t04) | [F-004-T06](#f-004-t06) | ⏳ 🧑‍🔧 | — |
| 🟡 Medium | <a id="f-004-t06"></a>F-004-T06 — First publish of 0.1.0 and an install check | 2 h | 0 h | 2 h | Planned | [F-004-T05](#f-004-t05), [F-005-T02](#f-005-t02) | [F-006-T03](#f-006-t03), [F-007-T03](#f-007-t03), [F-008-T02](#f-008-t02), [F-009-T02](#f-009-t02) | ⏳ 🤖 | — |
| 🔴 Large | **Total** | 5 h | 0 h (0 of 6 steps recorded) | 5 h agent + 0.25 h owner | 2 of 6 completed | | | | |

<details><summary>Done steps (2)</summary>

| Effort | Step | Estimate | Actual | Status | PRs |
|---|---|---|---|---|---|
| 🟢 Small | <a id="f-004-t02"></a>F-004-T02 — 🧑‍🔧 Owner creates or confirms the npm account | 0 h | 0 h | Verified | — |
| 🟢 Small | <a id="f-004-t03"></a>F-004-T03 — 🧑‍🔧 Owner creates the npm organisation voidbrain | 0 h | 0 h | Verified | — |

</details>

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-004.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-004-T01: [PR #1](https://github.com/voidbrain/bricks/pull/1) registry decision recorded. [#1](https://github.com/voidbrain/bricks/pull/1), [#2](https://github.com/voidbrain/bricks/pull/2) (npm organisation created), [#3](https://github.com/voidbrain/bricks/pull/3) (owner steps marked, status Open) |
| Opened | 2026-11-25 |
| Verification | Pending |
| Reviewed | 2026-11-25 |

</details>

---
### <a id="f-001"></a>[✨ F-001](#top)

**Workspace, harness and repository setup**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🟡 Implemented | 🔶 P2 | 🟢 Small | 0 h | — | — | 🤖 | — | — |

💻 **→** Next: F-001-T01 — Scaffold the workspace and apply harness v10.21.3 (Implemented; verification pending).

| | |
|---|---|
| **Issue** | bricks needs an Angular 22 workspace (library `bricks` with secondary entry points and the `catalogue` app) and the 🦺 project harness (core + angular), adapted to a library, before content lands. Approved by the owner on 2026-11-25, ahead of NERV's F-130, at the owner's request. |
| **Reproduce** | `npm ci && npm run check:fast && npm test && npm run build && npm run test:browser` on a fresh clone. |
| **Check** | The first PR's CI (`check` job) is green: harness checks, lint, format, unit tests with coverage, type check, library and catalogue build, browser suite. Branch protection and auto-merge are set by the owner. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Who | PRs |
|---|---|---|---|---|---|:---:|---|
| 🟢 Small | <a id="f-001-t01"></a>F-001-T01 — Scaffold the workspace and apply harness v10.21.3 | 4 h | 0 h | 0 h | Implemented; verification pending | 🤖 | [PR #1](https://github.com/voidbrain/bricks/pull/1) workspace, harness and first content; [PR #3](https://github.com/voidbrain/bricks/pull/3) patterns entry point, Hobo leftovers removed |
| 🟢 Small | **Total** | 4 h | 0 h (0 of 2 steps recorded) | 0 h | 1 of 2 completed | | |

<details><summary>Done steps (1)</summary>

| Effort | Step | Estimate | Actual | Status | PRs |
|---|---|---|---|---|---|
| — | <a id="f-001-t02"></a>F-001-T02 — Owner sets branch protection and auto-merge | 0 h | 0 h | Completed | — |

</details>

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-001.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-001-T01: [PR #1](https://github.com/voidbrain/bricks/pull/1) workspace, harness and first content; [PR #3](https://github.com/voidbrain/bricks/pull/3) patterns entry point, Hobo leftovers removed. [#1](https://github.com/voidbrain/bricks/pull/1); [#4](https://github.com/voidbrain/bricks/pull/4) |
| Opened | 2026-11-25 |
| Verification | Pending |
| Reviewed | 2026-11-25 |

</details>

---
### <a id="f-002"></a>[✨ F-002](#top)

**First content: tokens, themes and NERV's genUI surfaces**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🟡 Implemented | 🔶 P2 | 🟢 Small | 0 h | — | — | 🤖 | — | — |

💻 **→** Next: F-002-T01 — Tokens, foundations and the base, plain and eva themes (Implemented; verification pending).

| | |
|---|---|
| **Issue** | The first release holds (a) tokens (primitive → semantic → component) and the themes base, plain and eva, taken from NERV's style guide and dashboard palette; (b) NERV's four genUI surface cards (status, notice, checklist, recipe) as Angular components with the same schemas and validation as NERV's `shared/surface.ts`, so NERV can switch later; (c) the catalogue showing them in all three themes, with axe checks in CI. NERV itself is not changed. |
| **Reproduce** | `npm start` shows the catalogue; `npm test` and `npm run test:browser` run the checks. |
| **Check** | Every theme defines every semantic token and passes axe (contrast included); the validator accepts and rejects exactly what NERV's does (ported cases plus hostile payloads); each card renders payload text as text; the checklist keeps keyed rows and emits toggles; `bx-surface` rejects an unregistered payload and emits `rejected`; a visual look at the catalogue in each theme. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | PRs |
|---|---|---|---|---|---|---|
| 🟢 Small | <a id="f-002-t01"></a>F-002-T01 — Tokens, foundations and the base, plain and eva themes | 3 h | 0 h | 0 h | Implemented; verification pending | [PR #1](https://github.com/voidbrain/bricks/pull/1) tokens and themes |
| 🟢 Small | <a id="f-002-t02"></a>F-002-T02 — Port the four genUI surface cards with their schemas and validation | 4 h | 0 h | 0 h | Implemented; verification pending | [PR #1](https://github.com/voidbrain/bricks/pull/1) genUI surfaces |
| 🟢 Small | <a id="f-002-t03"></a>F-002-T03 — Catalogue in all three themes with axe in CI | 2 h | 0 h | 0 h | Implemented; verification pending | [PR #1](https://github.com/voidbrain/bricks/pull/1) catalogue and axe; [PR #3](https://github.com/voidbrain/bricks/pull/3) nested-theme test, review fixes |
| 🟢 Small | **Total** | 9 h | 0 h (0 of 3 steps recorded) | 0 h | 0 of 3 completed | |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-002.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-002-T01: [PR #1](https://github.com/voidbrain/bricks/pull/1) tokens and themes · F-002-T02: [PR #1](https://github.com/voidbrain/bricks/pull/1) genUI surfaces · F-002-T03: [PR #1](https://github.com/voidbrain/bricks/pull/1) catalogue and axe; [PR #3](https://github.com/voidbrain/bricks/pull/3) nested-theme test, review fixes. [#1](https://github.com/voidbrain/bricks/pull/1) |
| Opened | 2026-11-25 |
| Verification | Pending |
| Reviewed | 2026-11-25 |

</details>

---
### <a id="f-006"></a>[✨ F-006](#top)

**NERV adoption: what bricks ships for NERV**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔶 P2 | 🟣 Very large | 9 h | [F-004-T06](#f-004-t06) | — | 🤖 | — | — |

💻 **→** Next: F-006-T01 — Inventory NERV's UI against bricks (Planned).

| | |
|---|---|
| **Issue** | NERV is the first consumer: its genUI surfaces (F-002 ported them) and its Angular dashboard migration (NERV F-130). This record owns only bricks' side: the pieces NERV needs, released with a migration note. The switch itself is NERV's own record. |
| **Reproduce** | NERV renders its own surfaces (web/src/status-card.ts) and dashboard palette. |
| **Check** | An inventory of what NERV uses (tokens, palette combinations, components, surfaces) against bricks; the gaps NERV needs first planned as component steps; NERV's theme variants (light mode, five accents) available if the inventory confirms them; a migration note (token map, `rejected` instead of the global rejection log, fallback text inputs) in a released version. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks |
|---|---|---|---|---|---|---|---|
| 🟡 Medium | <a id="f-006-t01"></a>F-006-T01 — Inventory NERV's UI against bricks | 2 h | 0 h | 2 h | Planned | — | [F-006-T02](#f-006-t02), [F-006-T03](#f-006-t03) |
| 🔴 Large | <a id="f-006-t02"></a>F-006-T02 — Eva light mode and the five accents as theme variants | 5 h | 0 h | 5 h | Planned | [F-006-T01](#f-006-t01) | — |
| 🟡 Medium | <a id="f-006-t03"></a>F-006-T03 — Migration note for NERV and the release that carries it | 2 h | 0 h | 2 h | Planned | [F-006-T01](#f-006-t01), [F-004-T06](#f-004-t06) | — |
| 🟣 Very large | **Total** | 9 h | 0 h (0 of 3 steps recorded) | 9 h | 0 of 3 completed | | |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-006.md)

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-11-25 |
| Verification | Pending |
| Reviewed | 2026-11-25 |

</details>

---
### <a id="f-008"></a>[✨ F-008](#top)

**Grover adoption: what bricks ships for Grover**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟡 Medium | 4 h | [F-004-T06](#f-004-t06) | — | 🤖 | — | — |

💻 **→** Next: F-008-T01 — Inventory Grover's UI against bricks (Planned).

| | |
|---|---|
| **Issue** | Grover (Angular) adopts bricks for its UI. This record owns bricks' side: an inventory of Grover's UI against bricks and a migration note in a released version. |
| **Reproduce** | Grover has its own styles and components. |
| **Check** | An inventory of Grover's tokens and components mapped to bricks; gaps planned in F-003; a migration note in a released version. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks |
|---|---|---|---|---|---|---|---|
| 🟡 Medium | <a id="f-008-t01"></a>F-008-T01 — Inventory Grover's UI against bricks | 2 h | 0 h | 2 h | Planned | — | [F-008-T02](#f-008-t02) |
| 🟡 Medium | <a id="f-008-t02"></a>F-008-T02 — Migration note for Grover and the release that carries it | 2 h | 0 h | 2 h | Planned | [F-008-T01](#f-008-t01), [F-004-T06](#f-004-t06) | — |
| 🟡 Medium | **Total** | 4 h | 0 h (0 of 2 steps recorded) | 4 h | 0 of 2 completed | | |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-008.md)

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-11-25 |
| Verification | Pending |
| Reviewed | 2026-11-25 |

</details>

---
### <a id="f-009"></a>[✨ F-009](#top)

**FPVBuddy adoption: what bricks ships for FPVBuddy**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟡 Medium | 4 h | [F-004-T06](#f-004-t06) | — | 🤖 | — | — |

💻 **→** Next: F-009-T01 — Inventory FPVBuddy's UI against bricks (Planned).

| | |
|---|---|
| **Issue** | FPVBuddy is on Angular 21; bricks' peer range is Angular ^22.3.0, so FPVBuddy installs bricks only after its own Angular 21 → 22 upgrade (FPVBuddy's backlog). bricks does not wait on it: the inventory and the note can be ready first. This record owns bricks' side only. |
| **Reproduce** | FPVBuddy has its own styles and components on Angular 21. |
| **Check** | An inventory of FPVBuddy's UI mapped to bricks; a migration note stating the Angular 22 prerequisite, in a released version. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks |
|---|---|---|---|---|---|---|---|
| 🟡 Medium | <a id="f-009-t01"></a>F-009-T01 — Inventory FPVBuddy's UI against bricks | 2 h | 0 h | 2 h | Planned | — | [F-009-T02](#f-009-t02) |
| 🟡 Medium | <a id="f-009-t02"></a>F-009-T02 — Migration note for FPVBuddy (after its Angular 22 upgrade) and the release that carries it | 2 h | 0 h | 2 h | Planned | [F-009-T01](#f-009-t01), [F-004-T06](#f-004-t06) | — |
| 🟡 Medium | **Total** | 4 h | 0 h (0 of 2 steps recorded) | 4 h | 0 of 2 completed | | |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-009.md)

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-11-25 |
| Verification | Pending |
| Reviewed | 2026-11-25 |

</details>

---
### <a id="f-007"></a>[✨ F-007](#top)

**Hobo adoption: what bricks ships for Hobo**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🔴 Large | 5 h agent + 0.25 h owner | [F-004-T06](#f-004-t06) | — | 🤖 | — | — |

💻 **→** Next: F-007-T01 — Inventory Hobo's UI and map its tokens (Planned).

| | |
|---|---|
| **Issue** | Hobo writes its shared components for bricks (Hobo F-010 tracks its move). This record owns bricks' side: what Hobo needs and a migration note. Hobo's look (warm off-white, teal accent) is either `base` or a new theme, decided with the owner when the inventory is done. |
| **Reproduce** | Hobo has its own tokens in src/styles.scss. |
| **Check** | An inventory of Hobo's tokens and components mapped to bricks; its look as a theme or `base` (owner's call); a migration note in a released version. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who |
|---|---|---|---|---|---|---|---|:---:|
| 🟡 Medium | <a id="f-007-t01"></a>F-007-T01 — Inventory Hobo's UI and map its tokens | 2 h | 0 h | 2 h | Planned | — | [F-007-T02](#f-007-t02) | 🤖 |
| 🟢 Small | <a id="f-007-t02"></a>F-007-T02 — Owner picks Hobo's look: base or a Hobo theme | 0 h | 0 h | 0 h agent + 0.25 h owner | Planned | [F-007-T01](#f-007-t01) | [F-007-T03](#f-007-t03) | ⏳ 🤔 |
| 🟡 Medium | <a id="f-007-t03"></a>F-007-T03 — Migration note for Hobo and the release that carries it | 3 h | 0 h | 3 h | Planned | [F-007-T02](#f-007-t02), [F-004-T06](#f-004-t06) | — | ⏳ 🤖 |
| 🔴 Large | **Total** | 5 h | 0 h (0 of 3 steps recorded) | 5 h agent + 0.25 h owner | 0 of 3 completed | | | |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-007.md)

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-11-25 |
| Verification | Pending |
| Reviewed | 2026-11-25 |

</details>

---
### <a id="f-003"></a>[✨ F-003](#top)

**Components, patterns and the live-view helper, on demand**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟣 Very large | 35 h | — | — | 🤖 | — | — |

💻 **→** Next: F-003-T01 — Primitives: button, input, select, toggle, tag (Planned).

| | |
|---|---|
| **Issue** | The approved structure names primitives (button, input, select, toggle, badge, tag), components (card, form field, list row, tabs, dialog, toast), patterns (status row, approval card, data table, filters, empty state), foundations (layout, icons) and a live-view helper (render once, update only changed values, keyed rows). Badge and card exist (F-002). The rest is added only on real demand: each step starts when a consuming project needs it and names that project. |
| **Reproduce** | Not in the catalogue yet. |
| **Check** | Each added piece: tokens only, inputs and outputs only, unit tests, in the catalogue in every theme with axe passing, a style-guide line, and the consuming record that asked for it named in its step. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks |
|---|---|---|---|---|---|---|---|
| 🔴 Large | <a id="f-003-t01"></a>F-003-T01 — Primitives: button, input, select, toggle, tag | 6 h | 0 h | 6 h | Planned | — | [F-003-T02](#f-003-t02), [F-003-T04](#f-003-t04), [F-003-T05](#f-003-t05) |
| 🟡 Medium | <a id="f-003-t03"></a>F-003-T03 — Live-view helper: render once, update changed values, keyed rows | 4 h | 0 h | 4 h | Planned | — | — |
| 🟡 Medium | <a id="f-003-t07"></a>F-003-T07 — Foundations: layout and icons | 4 h | 0 h | 4 h | Planned | — | — |
| 🔴 Large | <a id="f-003-t02"></a>F-003-T02 — Components: form field, list row, tabs | 5 h | 0 h | 5 h | Planned | [F-003-T01](#f-003-t01) | [F-003-T06](#f-003-t06) |
| 🔴 Large | <a id="f-003-t04"></a>F-003-T04 — Dialog and toast | 5 h | 0 h | 5 h | Planned | [F-003-T01](#f-003-t01) | — |
| 🔴 Large | <a id="f-003-t05"></a>F-003-T05 — Patterns: status row, approval card, empty state | 5 h | 0 h | 5 h | Planned | [F-003-T01](#f-003-t01) | — |
| 🔴 Large | <a id="f-003-t06"></a>F-003-T06 — Patterns: data table and filters | 6 h | 0 h | 6 h | Planned | [F-003-T02](#f-003-t02) | — |
| 🟣 Very large | **Total** | 35 h | 0 h (0 of 7 steps recorded) | 35 h | 0 of 7 completed | | |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-003.md)

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-11-25 |
| Verification | Pending |
| Reviewed | 2026-11-25 |

</details>

---
## Other changes

None yet.

## How to use this file

| Status | Requirements | Next statuses and conditions | Priority cue |
|---|---|---|---|
| **🔴 Open** | Reproducible bug or agreed capability; scope and next action recorded. | - **Investigate** if cause/scope is uncertain<br>- **Implemented** when code is complete<br>- **Blocked** if a named dependency prevents progress<br>- **Closed** if cancelled/superseded, with reason. | Coloured |
| **🟠 Investigate** | Report and unanswered question recorded; next diagnostic identified. | - **Open** when scope/cause is established<br>- **Implemented** when fixed<br>- **Blocked** if evidence/dependency is unavailable<br>- **Closed** if duplicate/not reproducible after documented investigation, with reason. | Coloured |
| **🟡 Implemented** | Code exists; required verification remains pending. | - **Verified** when all acceptance checks pass (automated ones: the merged PR's green CI run)<br>- Open or Investigate if a check fails<br>- **Blocked** if a required check cannot proceed. | Coloured |
| **🟢 Verified** | All acceptance checks passed; date, method and evidence recorded, including human/device checks when required. | - **Closed** when no action remains and resolution is recorded<br>- **Open** or **Investigate** if new evidence invalidates verification. Do not leave completed items here indefinitely. | Coloured |
| **🟣 Blocked** | Specific blocker, affected work/check and resume condition recorded. | - Return to **Open**, **Investigate** or **Implemented** when unblocked<br>- **Verified** only after all checks pass<br>- **Closed** if cancelled/superseded, with reason. | Grey ◻️ |
| **🔵 Closed** | Resolution recorded and item archived. | - **Open** or **Investigate** if reopened by new evidence<br>Retain ID, original Opened date and historical closure record. | Grey ◻️ |

Follow [Backlog rules](BACKLOG-RULES.md) for updating records, reconciling PR/CI evidence, stale-state review, closure/archiving, human dependencies and table validation. Preserve stable IDs and existing user edits.

Each item shows its ID and title, a summary table (status with its colour, priority, effort size; with source-owned records also remaining time, Depends on, Unlocks and Procedures and Decisions, 🧑 where the record or one of its ready steps waits on that kind of human action), the human or next action, and Issue / Reproduce / Check. Expand the closed details for next actions, estimate rationale, PR history, dates and verification. Effort, from the remaining agent hours (owner time apart): 🟢 Small ≤1 h · 🟡 Medium ≤4 h · 🔴 Large ≤8 h · 🟣 Very large more; work still estimated in days: 🟢 Small ≤1 day · 🟡 Medium 2–3 days · 🔴 Large ≥4 days. Status and verification evidence describe progress; effort is an estimate of work still required. A `---` line ends every item.
