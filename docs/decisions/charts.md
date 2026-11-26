# How charts are drawn (decision)

Owner decision, 2026-11-27 ~00:10 CET, in chat ("ok" to the recommendation): **plain SVG, no chart library.**

## Why

- No new dependency: bricks keeps Angular as its only runtime dependency.
- Theme tokens and light/dark are exact: series colours and axes come from `bx` tokens, never a library's own palette.
- Accessibility stays under our control: a text alternative (role img with a summary), a data table, keyboard focus on points or bars, meaning never by colour alone, reduced motion.
- It matches Grover's hand-made SVG chart (`apps/client/src/app/plant/plant-chart.ts`), which is the reference.

## Approach

- Each chart (line, bar, stacked bar, donut) is a standalone component drawing inline SVG from signals; one shared chart base holds the scales, axis formatters, empty state and height (built in F-014-T03).
- No literal colours; light and dark follow the theme.

Recorded in F-014-T01 (this note) and F-014-T02 (the decision). T03 to T06 follow it.
