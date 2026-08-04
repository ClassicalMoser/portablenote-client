import type { Block, Edge, EdgesForBlock } from '@domain';

/**
 * Port for vault operations. One method per spec mutation/query command
 * (spec §5 Commands). Async-first: the Tauri IPC adapter implements this
 * today; an HTTP adapter will implement it for the web build. No method
 * may leak backend types.
 */
export interface VaultPort {
  /** InitVault (spec §5 Vault lifecycle). Creates and opens a vault. */
  initVault: (path: string) => Promise<void>;
  /** Open an existing vault; runs recovery + mutation gate (spec §5a). */
  openVault: (path: string) => Promise<void>;
  /** AddBlock (spec §5 Block Commands). */
  addBlock: (name: string, content: string) => Promise<void>;
  /** Query: all blocks, sorted by name. */
  listBlocks: () => Promise<Block[]>;
  /** Query: all graph edges (spec §3). */
  listEdges: () => Promise<Edge[]>;
  /** Query: outgoing + incoming edges for a block (core `queries::edges_for`). */
  edgesFor: (blockId: string) => Promise<EdgesForBlock>;
  /** Query: source block IDs with an edge to this block (core `queries::backlinks`). */
  backlinks: (blockId: string) => Promise<string[]>;
  /** Query: block IDs with no edges (spec §4 Orphaned Blocks; core `queries::orphans`). */
  orphans: () => Promise<string[]>;
  /** Query: resolve vault-unique name → block UUID (core `queries::resolve_name`). */
  resolveName: (name: string) => Promise<string | null>;
  /** RenameBlock. Propagates to inline refs vault-wide (spec §2). */
  renameBlock: (blockId: string, newName: string) => Promise<void>;
  /** MutateBlockContent. Content must not contain headings (spec §2). */
  mutateContent: (blockId: string, content: string) => Promise<void>;
  /** DeleteBlockSafe (cascade=false) or DeleteBlockCascade (cascade=true). */
  deleteBlock: (blockId: string, cascade: boolean) => Promise<void>;
  /** AddEdge (spec §3). Source and target must exist in the heap. */
  addEdge: (source: string, target: string) => Promise<void>;
  /** RemoveEdge by edge UUID. */
  removeEdge: (edgeId: string) => Promise<void>;
}
