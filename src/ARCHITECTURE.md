# Client Architecture

This document describes the **target** layering for the PortableNote client. It states plainly where the repo **does not yet** match that target. Agents: read this before writing any code; per-directory READMEs give layer-local rules.

**The client is a view over the PortableNote spec.** The Rust core (`../portablenote/`) is authoritative for all vault semantics. The normative contract is `../portablenote/spec/portablenote-spec.md`. The client must never reimplement, relax, or bypass a spec rule — if a client feature seems to require that, the spec is amended first.

## Layer map

| Area                 | Role                                                                              |
| -------------------- | --------------------------------------------------------------------------------- |
| `src/domain`         | Pure types mirroring the Rust core + spec. No dependencies whatsoever.            |
| `src/ports`          | Port interfaces + registry. The contract between application and any backend.     |
| `src/application`    | Use cases, Solid stores/signals, editor engine. All application state lives here. |
| `src/infrastructure` | Adapters implementing ports: Tauri IPC today, HTTP later, markdown codec.         |
| `src/interface`      | Components (zaidan/shadcn-solid): props in, DOM out. Dumb.                        |
| `src/composition`    | Startup wiring: one adapter per port, set once. Nothing else.                     |

## Dependency rules (enforced by oxlint via `boundaries.ts`)

| Layer             | May import from                                     |
| ----------------- | --------------------------------------------------- |
| `@domain`         | (nothing)                                           |
| `@ports`          | `@domain`                                           |
| `@application`    | `@domain`, `@ports`                                 |
| `@infrastructure` | `@domain`, `@ports`                                 |
| `@interface`      | `@application`, `@ports`, `@composition`, `@domain` |
| `@composition`    | everything                                          |

Never add an `allowImportsFrom` entry to make an import compile. If a change seems to need one, the code is in the wrong layer.

## Hard rules

1. **Ports are async.** Every port method returns a `Promise`, even when today's adapter is synchronous. Backends are Tauri IPC now and an HTTP server later; no port signature may mention either, and no port may leak a library type (`invoke` results, mdast nodes, `Response`).
2. **State lives in application.** All `createSignal`/`createStore` representing application state goes under `src/application`. Interface components may hold ephemeral UI state only (e.g. "is this popover open"). No JSX in application.
3. **Domain is dependency-free.** No `solid-js`, no `@tauri-apps/*`, no unified/remark, no component libraries. Pure types and pure functions.
4. **Interface is dumb.** Never destructure props. Accessors and callbacks in, DOM out. Components call use cases from `@application`; they never call ports or `invoke` directly.
5. **One spec command = one port method = one use case.** Adding a capability flows: spec command → Tauri command (Rust) → `VaultPort` method → adapter method → use case → UI. Tauri v2 invoke argument keys are **camelCase** (mapped to Rust snake_case params).
6. **Errors are domain errors.** Adapters translate backend failures into the domain error shape before they cross a port. No raw string matching above infrastructure.

## AST policy (the editor)

- **AST-as-truth.** The editor's source of truth is a schema-constrained content AST, not text. `BlockContent` node types will live in `@domain` as a closed union with **no heading variant** — headings are block boundaries (spec §2, invariant 8) and are unrepresentable inside a block by construction.
- Parsing/serialization (remark/GFM) lives behind `ContentCodecPort`, implemented in `infrastructure/codec/`. The codec is subject to the **fixpoint obligation**: `serialize(parse(serialize(x))) === serialize(x)`. Fixpoint property tests are the acceptance gate for any codec change.
- Editor transactions (split/merge/promote) live in `src/application/editor/` — see `editor/EDITOR.md` for the full blueprint.

## Provisional decisions (revisit before beta)

- **Single-writer.** The client does not implement spec §5 commit model/rebase (base + pending diff). Local, one-writer-at-a-time only.
- **Two-tier block identity** (anonymous `title` vs promoted vault-unique `name`) is the working model for the editor but is **not yet in the spec**. Editor code must not assume every block has a `name`.
- **Canonical serialization** is app-level (our codec's deterministic output), not yet spec-normative.
- **Error codes** are coarse (raw Rust strings). Structured error serialization over IPC is a pending task.

## Current status

**Aligned:** ports extracted to `src/ports`; boundaries enforced by oxlint; `VaultPort` covers all nine implemented commands; Tauri invoke keys camelCase; components live in `src/interface`; `ContentCodecPort` + remark/GFM codec with fixpoint tests; `BlockContent` AST in `@domain` (no heading variant).

**Still evolving:** no stores yet (use cases return values directly to components); no AST editor engine (raw MD + HTML preview via rehype); Rust side lacks read commands (`list_edges`, `get_document(s)`, orphan query) which block graph/document views; `App.tsx` is still largely a smoke UI.

When touching features, nudge code toward the target boundaries rather than widening new exceptions.
