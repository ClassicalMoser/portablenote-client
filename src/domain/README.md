# @domain

Pure types and pure functions. **Zero imports** — no `solid-js`, no `@tauri-apps/*`, no unified/remark, no other layers.

## What belongs here

- Types mirroring the Rust core (`portablenote_core::domain::types`) and spec artifacts: `Block`, `Edge`, `EdgesForBlock`, document/manifest shapes, ID types.
- The `BlockContent` AST (`content.ts`): a **closed** union of markdown node types with **no heading variant** — spec §2 forbids headings inside block content, so the type makes that state unrepresentable. `BlockRef` is distinct from `Link` for `[text](block:uuid)` (spec §2). `ContentCodecError` for codec parse/validate failures; `extractBlockRefs` for spec §9.
- Domain error shape (`VaultError` with a code + message) — planned; adapters translate into it.
- Pure helpers over these types (validation predicates, ref extraction over the AST).

## What is banned

- Anything reactive, async orchestration, I/O, JSX, port lookups.
- Types imported from libraries. If remark's mdast shape is needed, we define our own nodes and map at the codec boundary.

## Parity discipline

These types are hand-mirrored from Rust today. When the Rust core or spec changes a type, this layer changes in the same commit. (Pending task: contract-test or generate them.)
