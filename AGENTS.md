## Project conventions (bricks)

The project is **bricks** 🧱, the shared Angular UI library for the voidbrain projects (NERV, Grover, FPVBuddy, Hobo): design tokens, themes, foundations, components, patterns and genUI surfaces, published as `@voidbrain/bricks`. The repository is `https://github.com/voidbrain/bricks` (public); the default branch is `main`. It is an Angular 22 workspace (standalone components, signals, OnPush, strict TypeScript and templates) with two projects: the library `bricks` (`projects/bricks/`) and the `catalogue` app (`projects/catalogue/`), a demo page showing every component in every theme, used for visual and axe accessibility checks. Nothing is deployed; the package is not published yet (F-004: public npm, trusted publishing). It is a component of the coordinator solution (`voidbrain/coordinator`).

### Architecture

- Secondary entry points, one folder each under `projects/bricks/`, listed in its `package.json` `exports`: `tokens` (primitive → semantic → component CSS custom properties), `themes` (base, plain, eva), `foundations` (type, spacing, layout, icons, focus, motion), `components` (primitives and components), `patterns`, `surfaces` (the genUI catalogue with its schemas). CSS lives in `projects/bricks/styles/` and ships as `@voidbrain/bricks/styles/*`. An entry point imports another only by its package name (`@voidbrain/bricks/components`), never by a relative path across folders.
- `tokens/`, `themes/`, `foundations/` and `surfaces/surface.ts` are plain TypeScript with no framework imports (enforced by ESLint `no-restricted-imports` and `npm run check:conventions`): the surface contract stays testable and portable.
- **Components use semantic and component tokens only, never a literal colour.** A literal colour lives only in `styles/themes/*.css`.
- **Projects restyle by theme, not by overriding components.** A look a project needs becomes a theme (or a token), never a `::ng-deep` or a selector into a bricks component.
- **Bricks is UI only**: no domain logic, maps, routing, HTTP or storage. Data comes in through inputs; changes go out through outputs. Shared domain logic goes to 🧊 blocks (`voidbrain/blocks`, one package per domain), created only when a package is really shared.
- **Components are added only on real demand**: a consuming project's record (or a surface) needs it now. Name that demand in the record that adds it.
- The genUI surface contract (`surfaces/surface.ts`) keeps NERV's component ids, schemas and validation (version 1). A change to it is a contract change: a new version, never an edit of version 1.

### Style guide

- Before any UI change (templates, styles, user-facing text) read [docs/STYLE-GUIDE.md](docs/STYLE-GUIDE.md): its voice, tokens, type and spacing; `var(--…)` tokens, never a new literal colour. A new token or shared component updates it in the same change.

### Adding things

- **A token**: primitive or component token in `projects/bricks/styles/tokens.css`; a semantic token in every theme file and in `SEMANTIC_TOKENS` (`tokens/tokens.ts`); the style guide's token table in the same change.
- **A theme**: `projects/bricks/styles/themes/<name>.css` defining every semantic token, its name in `THEMES`, an import in `styles/bricks.css`; the catalogue then shows it and the browser suite runs axe on it.
- **A component**: its folder's file and spec first, exported from the entry point's `public-api.ts`, shown in the catalogue in every theme, and a line in the style guide; name the demand that asked for it.
- **A surface**: a new component id in the contract with its schema and validation tests first, then the card, then the `bx-surface` case and a catalogue sample.

### Checks before you finish

Branch protection on `main` (owner setting, F-001-T02): a PR is required and the `check` job of the `CI` workflow must pass.
Before you open, update or merge a PR, read [pull requests](docs/agents/pull-requests.md).

<!-- safety:start -->
**What the agent does on its own, and what it asks first.** These rules load with this file in every session; the procedures below are read when they apply, never in place of these rules.
- On its own: branch from `main` in a separate `git worktree` (every task, single or parallel: the primary checkout stays on `main` with no edits of its own, because a running service, another session or the owner may rely on it; put worktrees in a sibling directory or under `.claude/worktrees/`; a project names what relies on its primary checkout with a project line), commit, push its branches, open PRs against `main` (then name the PR by its number in the records it touches, and push that before the checks finish), resolve conflicts on its own PRs, land its own PR through the landing queue once every check on it has passed and GitHub can merge it: one lander merges ready PRs one at a time, with at most two in CI ([parallel work](docs/agents/parallel-work.md), "Landing queue"; `node tools/merge-when-green.mjs <PR>…` waits for the checks and stops on any failing check or conflict), delete merged branches and their worktrees, reconcile and close backlog records.
- Asks first: material changes to an adopted upfront feature plan (BACKLOG-RULES, "Optional upfront feature plans"); a decision or check a record marks 🧑; repository settings (branch protection, required checks, secrets) and dismissing a code-scanning alert; rewriting published history or force-pushing; deleting what it did not create; a harness change it cannot place as project or template ("Changing a harness file").
- Never: merge with a failing or pending check, or bypass the branch protection. A project narrows this list with a project line.
- Optional push guard: `node tools/guard.mjs install` makes git refuse a push to `main`, a force-push and an archive rewrite, citing these rules (APPLY.md, "Push guard"; a Claude Code adapter does the same before the command runs). A refused operation the owner approves runs once with `HARNESS_GUARD_ALLOW=<rule>`; never set it without that approval.
- Never remove a safeguard (an ownership, evidence, privacy or safety rule) because it is old or rarely triggered, and never rewrite governing rules unattended: consolidating rules keeps every requirement ([rule review](docs/agents/rule-review.md), "Periodic rule consolidation").
<!-- safety:end -->

```bash
npm run check:freshness   # first, at session start: backlog behind main, merged branches, audit age
npm run lint              # ESLint: TypeScript, Angular templates and accessibility, the framework-free layer
npm test                  # Vitest unit tests (library and catalogue)
npm run build             # the library package, then the catalogue
npm run test:browser      # Playwright on the built catalogue: axe in every theme, tokens, keyboard, 320 px
npm run typecheck
npm run check:fast        # pre-push bundle: format, lint, typecheck, backlog, work items, rules
npm run check:backlog     # active record layout and lifecycle cues
npm run check:conventions # stack conventions (docs/agents/<stack>.md) and unused exports (when the stack has one)
npm run format:check      # formatter (or the script `tooling.format` names); `npm run format` fixes it
npm run check:tooling     # a formatter check and a linter exist and run in CI (required for every stack)
npm run code:map -- <path> # exports with line ranges: read those lines, not the whole file
```

- Format and lint in CI too (`check:tooling`; a project with no source code records `tooling.exempt` with its reason).
- A failing test is evidence until shown otherwise: change its expectation only when the requirement deliberately changed, and say which; otherwise fix the code.
- A bug fix starts with a committed test that fails without the fix; the fix never edits that test to pass (BACKLOG-RULES, "A bug fix starts with a failing test").
- Replacing a feature removes its state, helpers and tests too: no dead code.
- Change what the task needs: no reformatting, refactoring or "improvements" of code the task does not touch; record an unrelated problem instead of fixing it.
- Write the least code the agreed outcome needs: no unrequested features, options or configuration, no abstraction with one use, no handling for cases that cannot occur.
- A refactor keeps behaviour: the same tests, unchanged, pass before and after. New input validation comes with tests for the invalid input.

### Changing a harness file

Before editing a file listed in `.harness.json` (`copied`, `forked`, `adapted`, or `.harness.json` itself), decide: this project only, or every project. The edit is the trigger, whatever the request's words: an "allow X" that changes how work is done is a rule.
- **This project only**: content or a setting stays here; a project line in a template section ends with `<!-- project -->`; a changed harness rule is an override (APPLY.md, "Project overrides").
- **Every project**: the template first, then reconcile here (APPLY.md, "Changing the harness from a project").
- **Unsure**: ask the user before editing. Never decide silently. (`check:freshness` lists the harness files a branch changes.)

### Procedures: read before the task

Each procedure is binding when its trigger applies: read it before the task; a short index never defers a requirement. All of them: [procedure index](docs/agents/procedures.md). `npm run check:rules` fails when a never or ask-first rule lives only in a procedure.

| Before you | Read |
|---|---|
| start a session | [session start](docs/agents/session-start.md) |
| open, update or merge a PR | [pull requests](docs/agents/pull-requests.md) |
| change Angular code (`src/`) | [Angular rules](docs/agents/angular.md) |
| update or close a backlog record | [backlog rules](docs/BACKLOG-RULES.md) (it names the one file a change needs) |
| write or change documentation | [documentation](docs/backlog/documentation.md) |
| change something an output is derived from (generated pages and data, recordings, translations, guides, a value used in two places) | [change impact](docs/agents/change-impact.md); do each row `check:freshness` lists, or record why not |
| change tests or coverage | [coverage guide](docs/agents/coverage-guide.md) |
| switch tasks or hand off context | [task context](docs/agents/task-context.md) |
| work in parallel: claimed tasks, branches, model assignments | [parallel work](docs/agents/parallel-work.md) (claims inside) |
| reassess architecture or decisions | [architecture review](docs/agents/architecture-review.md) |
| set up the project or change its stack or workflow (capability assessment) | [MCP guidance](docs/agents/mcp.md), "In short" |
| add, configure or rely on an MCP connection, or edit MCP selections | [MCP guidance](docs/agents/mcp.md) (commands inside) |
| work across repositories of a solution | [solution profile](docs/agents/solution-profile.md) (refresh inside) |
| add or use a shared skill | [skills](docs/agents/skills.md) |
| adopt or reconcile the harness, or review maintenance evidence | [maintenance](docs/agents/maintenance.md) |
| change AGENTS.md, CLAUDE.md, BACKLOG-RULES or `docs/backlog/`; measure friction; consolidate rules | [rule review](docs/agents/rule-review.md) |
| run the agent-behaviour checks or measure a rule change, when a runner is set | [behaviour checks](docs/agents/behaviour-checks.md) |
| run an audit, or record its findings or an improvement proposal | [audit](docs/agents/audit.md) ([findings](docs/agents/audit-findings.md)) |

### Testing the joins

- A change that touches how two parts meet gets a test across both, not one per side. Unit tests on each part did not catch the bugs that reached users.

### Known pitfalls

- Angular 22's generated `tsconfig.json` has no `"strict": true`; bricks sets it with `strictTemplates`. Keep both.
- Angular 22 builds the library with `@angular/build:library` from `projects/bricks/package.json` `exports`: an entry point not listed there is not built. Non-TypeScript exports (`./styles/*`) are copied by the `assets` option in `angular.json`.
- The catalogue imports bricks from source through `tsconfig.json` `paths`; a consuming project imports the built package. A path that works in the catalogue can still be missing from `exports`: `npm run build` catches it.

## Area notes

Before changing an area, read its section in [docs/agents/areas.md](docs/agents/areas.md): the rules and lessons there are as binding as this file.

| Area | Covers |
|---|---|
| Tokens and themes | `styles/`, `tokens/`, `themes/`, `foundations/`: the three token layers, base, plain and eva |
| Components and patterns | `components/`, `patterns/`: primitives, components, patterns, the live-view helper |
| genUI surfaces | `surfaces/`: the contract (schemas, validation) and the cards |
| Catalogue and accessibility | `projects/catalogue/`, `e2e/`: every component in every theme, axe |
| Consumers and releases | the package, versions, the changelog, adoption by NERV, Hobo, Grover and FPVBuddy |

## Privacy

- Never commit secrets, tokens or personal data. Test data is neutral and invented.
- Catalogue samples and test payloads are invented; never copy a consuming project's real data (NERV lists, recipes, devices) into bricks.
- Publishing uses npm trusted publishing (GitHub Actions OIDC): no npm token is ever stored in the repository or its secrets (F-004).

## Work tracking

**At the start of every session, before other work, run `npm run check:freshness`** and do what it lists, as [session start](docs/agents/session-start.md) says.

- This backlog owns only this repository's work: reject foreign next actions and closure conditions; a master never waits on what derives from it (BACKLOG-RULES, "One repository, one backlog").
- Keep a confirmed bug, a candidate fix, an unimplemented feature and a completed check distinct: a merge is not verification, a unit test is not a visual, pointer or device check, a green CI run proves only the checks it ran. Archives and audits are dated evidence, not current status.
- A plan or promise given to the user (steps, a table to build, a later fix) becomes backlog records in the same change, and the reply names them. Nothing promised lives only in the conversation.
- When a request reads two ways that change the result, name both and ask before working; when the choice is cheap to undo, state the assumption in the record and the PR and go on. Never pick silently.
