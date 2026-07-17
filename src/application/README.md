# @application

Use cases, application state, and the editor engine. Imports `@domain` and `@ports` only — never `@infrastructure` (adapters are reached through the ports registry) and never `@interface`.

## Layout (target)

- `vault.ts` — use cases, one per spec command. Shape: resolve port → call → (once stores exist) update store → return domain result. Thin today; they grow store updates, not business logic (vault semantics live in the Rust core).
- `blockContent.ts` — raw markdown save (`parse` → `serialize` → mutate) and preview (`parse` → `toHtml`). Standing raw-MD editor path until the AST transaction engine lands.
- `session.ts` — `restoreSession` (reopen last vault at startup; clears stale path, never auto-inits) and `rememberVault` (best-effort persist after successful open/init).
- `state/` (planned) — Solid stores: `vaultStore` (session status, blocks/edges/documents indexes), `editorStore` (open drafts, dirty set, selection). **All application-state signals live here.**
- `editor/` (planned) — the AST transaction engine. See `editor/EDITOR.md` before touching. Raw MD editing does not live here.

## Rules

1. `solid-js` reactive primitives are allowed; **JSX is not**. Components live in `@interface`.
2. Stores are written **only** by use cases and the editor engine. Interface reads via exported accessors and calls exported actions.
3. Never call `invoke` or import an adapter. If a capability is missing, add it to a port first.
4. Errors: normalize to the domain error shape at the use-case boundary; components receive typed failures, not raw strings.
5. Persistence policy (alpha): pessimistic — await the port, then update the store. Single-writer; no optimistic concurrency until spec §5 commit model lands.
