# @jigoooo/shared-ui

[![Deploy Storybook to GitHub Pages](https://github.com/Jigoooo/shared-ui/actions/workflows/deploy-storybook.yml/badge.svg?branch=master)](https://github.com/Jigoooo/shared-ui/actions/workflows/deploy-storybook.yml)

A React 19 component library and design-system workspace for building typed, theme-aware interfaces—from buttons and form controls to dialogs, bottom sheets, date pickers, and loading states.

**[Explore the live Storybook component gallery](https://jigoooo.github.io/shared-ui/)**

## Why this project

- **One typed UI surface:** the public `@jigoooo/shared-ui` package exports reusable components, theme primitives, hooks, and TypeScript declarations.
- **Interactive component gallery:** Storybook stories provide controls, generated docs, and accessibility inspection for the documented components.
- **Application-level interaction patterns:** modal, dialog, bottom-sheet, loader, and snackbar state are modeled alongside foundational controls.
- **Library-focused output:** Vite emits an ES module and a single CSS asset while React and React DOM remain peer dependencies.

The sections below distinguish the published component surface from the smaller set currently documented in Storybook.

## Component surface

| Area | Published modules |
| --- | --- |
| Foundations | theme, colors, z-index, typography, layout, divider, link |
| Inputs | button, input, textarea, checkbox, switch, radio, select |
| Navigation & overlays | accordion, context menu, tooltip, modal, dialog, bottom sheet |
| Date & time | date picker, date-range picker, mobile date picker, time picker |
| Feedback & utilities | loader, skeleton, progress, no-data state, picker, scrollbar, cursor effects |

Storybook currently documents 14 groups, including Button, Input, Dialog, Modal, BottomSheet, Accordion, and Typography. The source package exposes additional modules that are not yet represented by dedicated stories.

## Stack

| Role | Technology |
| --- | --- |
| UI runtime | React 19, TypeScript |
| Library build | Vite, `vite-plugin-dts`, SVGR, Vite image optimizer |
| Styling & motion | CSS assets, Framer Motion, Polished |
| Positioning & state | Floating UI, Zustand |
| Component workbench | Storybook 9 with React + Vite |
| Quality tooling | ESLint, Prettier, TypeScript project builds, Vitest browser integration, Playwright |
| Workspace | pnpm workspaces |

## Quick start

Prerequisites: Node.js 20 (the version used by the Pages workflow) and Corepack. The repository declares pnpm `10.18.3`.

```bash
git clone https://github.com/Jigoooo/shared-ui.git
cd shared-ui
corepack enable
pnpm install --frozen-lockfile
pnpm storybook
```

Open `http://localhost:4600` for the local component gallery.

Useful workspace commands:

```bash
pnpm build             # build the publishable core library
pnpm build-storybook   # produce packages/core/storybook-static
pnpm type-check        # run the TypeScript project build
pnpm lint              # lint package source
pnpm dev               # run the playground application
pnpm dev:lib           # rebuild the core library in watch mode
```

## Use the package

The published package expects React and React DOM `>=19.1.0` as peer dependencies.

```bash
pnpm add @jigoooo/shared-ui react react-dom
```

```tsx
import { Button, ThemeProvider } from '@jigoooo/shared-ui';
import '@jigoooo/shared-ui/dist/shared-ui.css';

export function App() {
  return (
    <ThemeProvider>
      <Button.Solid>Continue</Button.Solid>
    </ThemeProvider>
  );
}
```

## Architecture

```text
shared-ui
├── packages/core        publishable @jigoooo/shared-ui package
│   ├── src              components, theme, hooks, constants, utilities
│   ├── stories          Storybook stories and generated docs inputs
│   └── .storybook       gallery decorators and quality integrations
└── packages/playground  local Vite application consuming core via workspace:*
```

The root scripts orchestrate both packages. `packages/core` owns the public API, declarations, and build output; `packages/playground` is a private integration sandbox.

## Quality model and current coverage

| Concern | Repository evidence | Current status |
| --- | --- | --- |
| Type safety | `pnpm type-check`; declaration generation via `vite-plugin-dts` | Library build emits declarations; the root project check currently hits TS6310 in the playground reference |
| Linting | `pnpm lint` | Configured; the current tree reports one `consistent-type-imports` error in the playground |
| Accessibility | Storybook a11y addon; preview uses `a11y.test: 'todo'` | Inspectable in Storybook, not a CI-blocking gate |
| Browser/story tests | Storybook Vitest integration configured with headless Playwright Chromium | Configuration present; no package test script or CI test job is currently wired |
| Visual regression | Chromatic Storybook integration is loaded | No repository command, project URL, token, or visual-regression workflow is configured |
| Bundle quality | ES-only output, React externals, declaration generation, image optimization, one CSS asset | Build is available; `size`/`analyze` script names exist but `size-limit` is not installed or configured |
| Documentation deployment | `.github/workflows/deploy-storybook.yml` builds and deploys Storybook | Automated on pushes to `main` or `master` |

The workflow badge above intentionally represents only the Storybook deployment workflow. It does not imply that lint, tests, accessibility, visual regression, or bundle budgets run in CI.

## Project status

The core workspace manifest is currently versioned at `0.2.2`. This repository is an evolving component library: Storybook coverage and automated quality gates are not yet complete, and the table above documents those boundaries rather than overstating them.
