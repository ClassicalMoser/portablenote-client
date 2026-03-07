/** Block returned from list_blocks; matches Rust portablenote_core::domain::types::Block */
export interface Block {
  id: string;
  name: string;
  content: string;
  created: string;
  modified: string;
}
