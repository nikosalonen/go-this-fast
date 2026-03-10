# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Running pace calculator ("Go This Fast") built with Astro + React + TypeScript + Tailwind CSS. Converts between pace formats (min/km, min/mile) and speed metrics (km/h, mph), with estimated finish times for standard running distances. Deployed to GitHub Pages.

## Commands

- `npm run dev` — Start dev server (localhost:4321)
- `npm run build` — Production build to /dist
- `npm run preview` — Preview production build

No test or lint commands are configured.

## Architecture

- **Astro** serves as the static site framework; React components are hydrated client-side via `client:load`
- **ConvertView.tsx** — Main component: handles bidirectional pace/speed conversion and orchestrates state for all input fields
- **RunEstimates.tsx** — Displays estimated finish times for 8 standard distances (100m to Marathon), receives pace from ConvertView
- **DistanceTimeBox.tsx** — Individual time input box for each distance; supports editing time to recalculate pace
- **Layout.astro** — Base layout with nav/footer; index.astro is the single page entry point
- `src/utils/conversion.ts` exists but is currently empty; conversion logic lives in components

State is managed via React hooks. localStorage is used to persist visibility preferences for distance time boxes.

## Conventions

- TypeScript with strict mode
- Functional React components with typed props (interfaces)
- Tailwind CSS utility classes for all styling
- Conventional commits (feat:, docs:, fix:)
- Node v20 (see .nvmrc)
