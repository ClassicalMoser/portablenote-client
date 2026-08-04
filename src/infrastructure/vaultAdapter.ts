/**
 * Infrastructure: Tauri vault bridge. Implements the VaultPort contract.
 */
import type { VaultPort } from '@ports';
import {
  addBlock,
  addEdge,
  backlinks,
  deleteBlock,
  edgesFor,
  initVault,
  listBlocks,
  listEdges,
  mutateContent,
  openVault,
  orphans,
  removeEdge,
  renameBlock,
  resolveName,
} from './vault';

export const tauriVaultPort: VaultPort = {
  initVault,
  openVault,
  addBlock,
  listBlocks,
  listEdges,
  edgesFor,
  backlinks,
  orphans,
  resolveName,
  renameBlock,
  mutateContent,
  deleteBlock,
  addEdge,
  removeEdge,
};
