# @interface

Components and views: props in, DOM out. Built with zaidan (shadcn for SolidJS). **Dumb layer** — callers and readers only; no application state.

## Rules

1. **Never destructure props.** Use `(props)` and read `props.field` in JSX; `mergeProps`/`splitProps` for defaults. Pass accessors down, not values.
2. Call use cases from `@application` and read stores via accessors. Never call ports, `invoke`, or adapters. Ephemeral UI state only (open/closed, local input before submit).
3. Presentational control flow (`<Show>`, `<For>`) belongs here; domain-shaped derivation does not — put it in `@application`.
4. Zaidan primitives live under `components/ui/` (owned copies). Feature views import those primitives; do not re-implement styling ad hoc when a primitive exists.
5. The `@/` alias resolves to this directory only (Zaidan/shadcn convention). Cross-layer code keeps using `@application` / `@ports` / etc.

## Layout

- `App.tsx` — smoke/root UI; calls application use cases, renders zaidan `Button`.
- `components/ui/` — zaidan primitives (`pnpm dlx shadcn@latest add @zaidan/<name>`).
- `lib/utils.ts` — `cn` only (class merge). No domain logic.
- `styles/` — Tailwind tokens (`globals.css`), Vega component styles (`base.css`), `@tailwindcss/typography` for markdown preview (`prose`).
- `views/` — screens: `WritingSpace` (raw MD + preview + link picker), `BacklinksPanel`, vault chrome in `App.tsx` / `AppMenubar`; document views still blocked on document query ports.

## Adding a component

```bash
pnpm dlx shadcn@latest add @zaidan/<name>
```

Registry config is `components.json` (style `kobalte`, `@zaidan` registry). After add, confirm files landed under `src/interface/` — if the CLI drops CSS outside this tree, move it into `styles/`.
