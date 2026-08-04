# @ports

Port interfaces and the port registry. This is the contract line between application logic and any backend. Depends on `@domain` only.

## Rules

1. **Async-first.** Every method returns a `Promise`, even if today's adapter is sync. Adapters exist for Tauri IPC (now) and HTTP (web build, later); a port must be implementable by both.
2. **Domain types only** in signatures. No Tauri, mdast, fetch, or DOM types may appear in a port.
3. **One spec command per method.** `VaultPort` mirrors spec §5 Commands. Method docs cite the spec section.
4. Ports are **session-stable singletons**: composition sets each port exactly once at startup via `registry.ts`; application reads them via getters. Never swap a port mid-session; never set one outside `@composition`.

## Current ports

- `VaultPort` (`vault.ts`) — vault lifecycle, block/edge commands, and graph queries (`listBlocks`, `listEdges`, `edgesFor`, `backlinks`, `orphans`, `resolveName`).
- `FolderPickerPort` (`picker.ts`) — native folder selection.
- `AppSettingsPort` (`settings.ts`) — app-local preference state (last vault path). Never stored inside a vault; Tauri adapter uses the app config dir, web build will use localStorage.
- `ContentCodecPort` (`codec.ts`) — `parse` / `serialize` / `toHtml` for block bodies. Remark/GFM (+ rehype) adapter in `infrastructure/codec/`. Acceptance gate: **fixpoint property tests**, `block:` ↔ `BlockRef`, heading reject on parse; `toHtml` is a sanitized preview projection (mdast → hast).

## Planned ports

- Document queries (`getDocument` / `listDocuments`) once document views land.
- `VaultEventsPort` (future, server build) — push notifications of external vault changes.
