import type { Block } from '@domain';
/**
 * Bridge to Tauri vault commands. Errors from Rust surface as rejected
 * promises. NOTE: Tauri v2 expects invoke argument keys in camelCase and
 * maps them to the Rust command's snake_case parameters.
 */
import { invoke } from '@tauri-apps/api/core';

/** Open an existing vault at the given path. */
export function openVault(path: string): Promise<void> {
  return invoke('open_vault', { path });
}

/** Initialize a new empty vault at the given path and open it. */
export function initVault(path: string): Promise<void> {
  return invoke('init_vault', { path });
}

/** Add a new block. */
export function addBlock(name: string, content: string): Promise<void> {
  return invoke('add_block', { name, content });
}

/** List all blocks, sorted by name. */
export function listBlocks(): Promise<Block[]> {
  return invoke('list_blocks');
}

/** Rename a block. */
export function renameBlock(blockId: string, newName: string): Promise<void> {
  return invoke('rename_block', { blockId, newName });
}

/** Update a block's content. */
export function mutateContent(blockId: string, content: string): Promise<void> {
  return invoke('mutate_content', { blockId, content });
}

/** Delete a block (cascade = true to remove even with incoming edges). */
export function deleteBlock(blockId: string, cascade: boolean): Promise<void> {
  return invoke('delete_block', { blockId, cascade });
}

/** Add a reference edge between two blocks. */
export function addEdge(source: string, target: string): Promise<void> {
  return invoke('add_edge', { source, target });
}

/** Remove a reference edge. */
export function removeEdge(edgeId: string): Promise<void> {
  return invoke('remove_edge', { edgeId });
}
