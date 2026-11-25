<!-- Written by tools/impact-map.mjs from the "impact" rows of .harness.json: change the rows, then run it. -->

# Impact map

What must follow a change, and what must run again after it (docs/agents/change-impact.md). `npm run check:freshness` lists, on every PR, the rows a branch sets off and the order to run them.

**More detail:** [Code coverage](coverage.md) (Library unit coverage per folder, from npm run coverage)

| Id | When these change | Made of (content) | This must follow | Command | Runs again after | Checked by |
|---|---|---|---|---|---|---|
| tokens | `projects/bricks/styles/**`, `projects/bricks/tokens/**`, `projects/bricks/themes/**` |  | Tokens or a theme changed: every theme still defines every semantic token (SEMANTIC_TOKENS), the style guide's token tables match, and axe passes in every theme. | `npm run build && npm run test:browser` | consumers | Browser suite in CI: axe per theme and the semantic-token check |
| surfaces | `projects/bricks/surfaces/surface.ts` |  | The genUI contract changed: version 1 stays identical to NERV's shared/surface.ts; a change is a new version with its tests, a changelog entry and a note in each consumer's adoption record. | `npm test` | consumers | Validator unit tests in CI |
| ui | `projects/**/*.html`, `projects/**/*.css`, `projects/bricks/components/**`, `projects/bricks/surfaces/**`, `projects/catalogue/**` |  | UI changed: read docs/STYLE-GUIDE.md; a new token or component updates it in the same change and appears in the catalogue in every theme. | `npm run lint && npm run build && npm run test:browser` |  | ESLint template accessibility rules, the build and axe in CI |
| consumers | `projects/bricks/package.json` |  | The public package changed (exports, version, peers): a changelog entry under the right semantic version (F-005), and the consumers' adoption records name the version they need. | `npm run build` |  | Library build in CI; changelog by review |
| work-items | `docs/work/**`, `docs/agents/model-profiles.json` |  | Regenerate the source-owned ledger (npm run work:build), then check the queue. | `npm run work:build && npm run check:work` |  | check:work, check:backlog and check:queue in CI |

## Content dependencies

What each output is made of, besides code: change one of these and the output is out of date.

| Output | Made of | Redo with |
|---|---|---|
| (none listed) | | |

## Value couplings

A value that lives in more than one place: change it in one, change it in all. Best kept by one shared source, else by a test.

| Value | Where | Kept equal by |
|---|---|---|
| (none listed) | | |

## Outside the repository

What can change an output with no commit here, and how we would notice.

| What | Affects | Noticed by |
|---|---|---|
| NERV's genUI surface contract (voidbrain/nerv shared/surface.ts) | surfaces/surface.ts version 1: component ids, schemas and validation | By review when NERV changes its contract; NERV adoption (F-006) switches NERV to bricks |
