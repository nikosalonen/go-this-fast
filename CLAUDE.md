# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Running pace calculator ("Go This Fast") built with Astro + React + TypeScript + Material UI. Converts between pace formats (min/km, min/mile) and speed metrics (km/h, mph), with estimated finish times for standard running distances. Deployed to GitHub Pages.

## Commands

- `npm run dev` — Start dev server (localhost:4321)
- `npm run build` — Production build to /dist
- `npm run preview` — Preview production build
- `npm run check` — Type-check via `astro check` (the closest thing to a lint gate)

No test runner is configured.

## Architecture

- **Astro** serves as the static site framework; React components are hydrated client-side via `client:load`
- **ConvertView.tsx** — Main component: handles bidirectional pace/speed conversion and orchestrates state for all input fields
- **RunEstimates.tsx** — Displays estimated finish times for 8 standard distances (100m to Marathon), receives pace from ConvertView
- **DistanceTimeBox.tsx** — Individual time input box for each distance; supports editing time to recalculate pace
- **Layout.astro** — Base layout with nav/footer; index.astro is the single page entry point. Holds a `#theme-toggle-slot` div that App.tsx portals the theme toggle into after mount
- `src/utils/conversion.ts` holds only `milesToKm`; the rest of the conversion math lives in components

State is managed via React hooks. localStorage persists custom distances and the visibility preferences for distance time boxes. Because the site is statically pre-rendered, localStorage must only be read inside `useEffect` — reading it during the first render causes a hydration mismatch.

## Conventions

- TypeScript with strict mode. Pinned to 6.x: `@astrojs/check` peers on `typescript@^5 || ^6`, and TypeScript 7 dropped the classic JS compiler API that `@astrojs/language-server` needs
- Functional React components with typed props (interfaces)
- Material UI components styled via the `sx` prop; plain scoped CSS in `Layout.astro` for the page shell. MUI v9 removed system props, so spacing/colour go inside `sx`, not on the component
- Tab indentation in `src/`
- Conventional commits (feat:, docs:, fix:)
- Node v24 (see .nvmrc)
