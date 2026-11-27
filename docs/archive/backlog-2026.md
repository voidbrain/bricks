# Closed backlog — 2026

Closed records, moved from the [active backlog](../BACKLOG.md) with their full history. Dated evidence, not current status.

<!-- archive-recap:start -->
## Weekly closure recaps

Closed records in this archive, grouped by closing date (Monday–Sunday). Links open the first section for that week; current status stays in the active backlog.

| Closing week | Features closed | Bugs closed |
|---|---:|---:|
| [2026-11-23 – 2026-11-29](#archive-week-2026-11-23) | 1 | 1 |
<!-- archive-recap:end -->

<a id="archive-week-2026-11-23"></a>
## Closed 2026-11-27

### B-001

**The contrast check reads a translucent colour as opaque**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P3 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-27: #23 merged at d9e95f6, CI 45799175183 green (catalogue browser suite passed).

| | |
|---|---|
| **Issue** | The in-page contrast helper of the browser suite (`e2e/catalogue.spec.ts`, `contrastFailures`) kept only red, green and blue of a computed colour, so a translucent token was measured as opaque: black at 10 % on white passed at 21:1 instead of about 1.2:1. Found by the coordinator's dormant-checks sweep, 2026-11-26 (C4, proposal 14). |
| **Reproduce** | On `main` `d94b3fc`: a section with `--bx-surface: #ffffff` and `--bx-text: rgba(0, 0, 0, 0.1)` gives no `--bx-text on --bx-surface` failure. |
| **Check** | The regression test "the contrast check composites a translucent colour over its background instead of reading it as opaque" (committed failing first) passes; foregrounds are composited over their background, a translucent background over the theme surface, a translucent surface over the white page; every theme and the 20 combinations still pass. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Closed 2026-11-27: #23 merged at d9e95f6, CI 45799175183 green (catalogue browser suite passed). 2026-11-26: owner accepted every fix of the dormant-checks sweep in chat ("Accept all fixes"). B-001-T01 implemented: test committed failing first, then the fix; the full browser suite passes locally (32 tests), so no shipped token was hiding a failure. Closes when the PR merges on green CI.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | [#23](https://github.com/voidbrain/bricks/pull/23) |
| Opened | 2026-11-26 |
| Verification | Browser/accessibility · 2026-11-27 · Test: e2e/catalogue.spec.ts passed in #23 CI 45799175183 |
| Reviewed | 2026-11-27 |

</details>

---

### F-014

**Chart components: line, bar, stacked bar and donut**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P3 | Closed | 🔴 Large |

💻 **→ Human action required: No**<br />Closed 2026-11-27: released in v0.5.0.

| | |
|---|---|
| **Issue** | Owner request 2026-11-26 (late evening): plan chart components in bricks. Consumers, each owning its adoption record: 🪴 grover:F-029 (probe readings over time, feeds and doses, plant report; it has a hand-made `apps/client/src/app/plant/plant-chart.ts` today), 🚁 fpvbuddy:F-025 (battery cycles and internal resistance, flights; after fpvbuddy:F-008 adopts bricks) and 🚦 the coordinator through NERV's live index card 𖣂 nerv:F-149 (records per status, steps per repo, PR throughput; the card itself is nerv:F-147). Bricks has no chart today and no runtime dependency besides Angular. |
| **Reproduce** | `projects/bricks/components/public-api.ts` exports no chart; Grover draws its plant chart by hand in SVG. |
| **Check** | A recorded decision on how charts are drawn (small library or plain SVG), how they are accessible (text alternative and data table, keyboard, no colour-only meaning) and themed (tokens only, light and dark) (F-014-T01, T02); line, bar, stacked bar and donut components, each with unit and browser tests, axe-clean in every theme, and a catalogue entry (T03 to T06); a release consumers can pin (T07). |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Closed 2026-11-27: npm view @voidbrain/bricks@0.5.0 version prints 0.5.0 (2026-11-27); release run 45967712772 (owner approved the npm environment 2026-11-27); PRs #29 to #34 merged, CI green; released in v0.5.0. 2026-11-27: F-014-T07: release 0.5.0 prepared (changelog, versions); the tag `v0.5.0` follows on the merged main commit once main CI is green, and the publish job waits for the owner's approval in the `npm` environment, as for 0.4.0. Consumers told the version: fpvbuddy:F-025 by a PR there; grover:F-029 and nerv:F-149 by a note to the owner (those repositories are in other agents' hands today). The record closes once 0.5.0 is on npm. Earlier, F-014-T04, T05 and T06 implemented on the T03 base: `bx-bar-chart` (`bar-chart.ts`, vertical and horizontal, value labels), `bx-stacked-bar-chart` (`stacked-bar-chart.ts`, a separate component as [charts.md](../work/decisions/charts.md) decides, totals, series told apart by a fill pattern as well as colour, legend included) and `bx-donut-chart` (`donut-chart.ts`, labels and percentages, centre total, `maxSlices` with an Other slice), shared `bandScale`, `formatChartShare`, `seriesPattern` and `ChartRoving` in `chart-base.ts`; unit tests in `chart.spec.ts`, a browser test (keyboard, patterns, data tables in every theme; axe in all 20 theme · mode · accent combinations through the preview), catalogue samples, style guide and changelog. Next: F-014-T07 (release 0.5.0). Earlier, F-014-T03 implemented: shared chart base (`projects/bricks/components/chart-base.ts`: `BxChartFrame`, scales, ticks, formatters, roving keyboard step, non-colour series dashes/shapes, `<bx-disclosure>` data-table fallback) and `bx-line-chart` (`projects/bricks/components/line-chart.ts`: number or UTC-time axis, target bands, event markers, `<title>`/`<desc>`, roving keyboard focus on points), `--bx-chart-*` component tokens, style-guide and catalogue entries, unit and Playwright axe/keyboard tests. Next: F-014-T04, F-014-T05 and F-014-T06. 2026-11-27 ~00:10 CET, owner decision (F-014-T02), "ok" to the recommendation: **plain SVG, no chart library**: no new dependency, theme tokens and light/dark exact, accessibility under our control, matches Grover's hand-made SVG chart; decided before T01's comparison page, so T01 is a short decision note ([docs/decisions/charts.md](../work/decisions/charts.md)). 2026-11-26: opened from the owner's request, planning only: no code changed. Consumer adoption lives in grover:F-029, fpvbuddy:F-025 and nerv:F-149; this record does not wait on them.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | Plan: [#29](https://github.com/voidbrain/bricks/pull/29) (green CI). Decision T01, T02: [#30](https://github.com/voidbrain/bricks/pull/30) (CI 45909118496 green). Review: 2026-11-27 fresh-context research subagent on F-014-T03 (STYLE-GUIDE.md adapted file): fixed non-finite/single-point guards, focus/blur/hover separation, `description` `<desc>` override + marker summary, and dropped unused `--bx-chart-height`. Review: 2026-11-27 fresh Claude Opus 5.5 session that did not write the commit (Gemini's a12f6d9, finished by Claude): read the diff against the record and [charts.md](../work/decisions/charts.md); plain SVG, tokens only, title/desc, data table, keyboard and axe in all 20 theme · mode · accent combinations confirmed; fixed: the hover readout duplicated each focused point's name through `aria-live`, now plain text. Review of T04–T06: 2026-11-27 design-reviewer (Opus, fresh context): one should-fix, fixed (4 fill patterns for 6 default tones let series 0/4 and 1/5 differ by colour alone; now 6 patterns, tested), negative bars now tested both ways, the Other slice's `sliceSelect` documented; no blockers. Known limit: time-axis labels are UTC (`formatChartTime`); a consumer that needs local time asks in its adoption record; [#32](https://github.com/voidbrain/bricks/pull/32); [#33](https://github.com/voidbrain/bricks/pull/33); [#34](https://github.com/voidbrain/bricks/pull/34) |
| Opened | 2026-11-26 |
| Verification | Release verified on npm 2026-11-27: npm view @voidbrain/bricks@0.5.0 version prints 0.5.0 |
| Reviewed | 2026-11-27 |

</details>

---
