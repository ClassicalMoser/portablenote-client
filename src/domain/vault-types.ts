/** Block returned from list_blocks; matches Rust portablenote_core::domain::types::Block */
export interface Block {
  id: string;
  name: string;
  content: string;
  created: string;
  modified: string;
}

/** Directed reference edge; matches Rust portablenote_core::domain::types::Edge */
export interface Edge {
  id: string;
  source: string;
  target: string;
}

/** Split of edges touching one block (core `queries::edges_for`). */
export interface EdgesForBlock {
  outgoing: Edge[];
  incoming: Edge[];
}
