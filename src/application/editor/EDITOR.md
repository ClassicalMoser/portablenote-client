# Editor Engine Blueprint

The single hardest component in the client. Read fully before implementing anything here. Normative context: spec §2 (blocks, name rules, reference links), §5 (commands), §9 (markdown capabilities).

## Model: AST-as-truth

The editor's source of truth is a **schema-constrained AST** (`BlockContent` from `@domain`), not text. Bytes on disk are a deterministic projection of the AST via the `ContentCodecPort`. Illegal states are unrepresentable: `BlockContent` has **no heading node** — typing heading syntax is an editor _event_ (see `splitBlock`), never content.

- Solid fine-grained stores wrap AST nodes; edits are granular store mutations.
- Serialization happens only at persistence boundaries (load block / commit block), never per keystroke.
- **Fixpoint obligation** (codec acceptance gate): `serialize(parse(serialize(x))) === serialize(x)` for all constructible ASTs, property-tested over real-world GFM including tables, code fences, and escaping edge cases.

## Transactions

All mutations go through typed transactions. Each maps to zero or more spec commands at commit time.

| Transaction                                   | Effect                                                                                    | Spec command(s)                                     |
| --------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `insertText` / `deleteRange` / inline toggles | Pure AST edit; marks block dirty                                                          | `MutateBlockContent` on commit                      |
| `splitBlock(blockId, offset, headingText)`    | Triggered by typing `#`–`######` prefix at line start. Ends current block, starts new one | `AddBlock` + `MutateBlockContent` + document update |
| `mergeWithPrevious(blockId)`                  | Appends content into previous block, retires this block                                   | `MutateBlockContent` + `DeleteBlockSafe`            |
| `linkBlock(range, targetId)`                  | Wraps range in a `BlockRef` node                                                          | `AddEdge` (+ `MutateBlockContent`)                  |
| `commitBlock(blockId)`                        | Serialize via codec → persist                                                             | `MutateBlockContent`                                |

## Identity policies (provisional — two-tier model, not yet in spec)

- Blocks carry a required display `title` (the heading text, non-unique) and an **optional** vault-unique `name` (the linking handle). Editor code must not assume `name` exists.
- **Split:** the original (top) block keeps its UUID and name; the new (bottom) block gets a fresh UUID, title from the heading text, anonymous. Rationale: inbound links anchor to the top.
- **Merge:** if the retired block has inbound edges, block the merge (mirror `DeleteBlockSafe`) and surface it — do not silently cascade.
- **Promotion** (assigning a `name`) happens at link time: when the user links to a block, the autocomplete resolves name collisions then. Never auto-name on heading creation.

## Known gap: composite atomicity

The Rust commit protocol (spec §5a) is atomic **per command**. A `splitBlock` emits multiple commands; a crash between them leaves a valid-but-odd vault. Rule: **order commands so every prefix is a valid state** (add new block → mutate original → update document). A composite-command extension to the spec is the eventual fix; do not fake atomicity client-side.

## Two views, one contract

- **Friendly view** (default): WYSIWYG over the AST; enforces by construction.
- **Raw MD view**: a plain-text editor whose saves flow through the same parse → validate path as any external tool (vim, CLI). It needs no bespoke enforcement — heading-in-content is a parse error surfaced to the user. The raw view is the standing proof that the format is tool-agnostic.
