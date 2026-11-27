# Closed backlog — 2026

Closed records, moved from the [active backlog](../BACKLOG.md) with their full history. Dated evidence, not current status.

<!-- archive-recap:start -->
## Weekly closure recaps

Closed records in this archive, grouped by closing date (Monday–Sunday). Links open the first section for that week; current status stays in the active backlog.

| Closing week | Features closed | Bugs closed |
|---|---:|---:|
| [2026-11-23 – 2026-11-29](#archive-week-2026-11-23) | 0 | 1 |
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
