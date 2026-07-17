# @infrastructure

Adapters implementing `@ports` interfaces. Imports `@ports` and `@domain` only — never `@application` (a port type needed here means the type belongs in `@ports` or `@domain`). No `solid-js`: adapters must be framework-free.

## Rules

1. One adapter implements one port, exactly — no extra surface, no business logic. Vault semantics live in the Rust core.
2. Translate backend failures into the domain error shape before they cross the port (pending `VaultError`; today errors pass as strings — do not add string matching above this layer).
3. **Tauri invoke argument keys are camelCase.** Tauri v2 maps them to the Rust command's snake_case parameters (`blockId` → `block_id`). Passing snake_case keys fails at runtime with "missing required key".

## Layout

- `vault.ts` + `vaultAdapter.ts` — Tauri IPC bridge implementing `VaultPort`. Target: fold into `tauri/` when a second backend lands.
- `folderPicker.ts` — Tauri dialog implementing `FolderPickerPort`.
- `codec/` — remark/GFM adapter for `ContentCodecPort` (`contentCodec.test.ts` ships fixpoint fixtures + fast-check). Stringify options are documented in `remarkContentCodec.ts`; re-audit escaping before changing them.
- `http/` (future) — server adapters for the web build, implementing the same ports.
