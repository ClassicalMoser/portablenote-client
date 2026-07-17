/**
 * Infrastructure: Tauri vault bridge. Implements the VaultPort contract.
 */
import type { VaultPort } from '@ports';
import {
  addBlock,
  addEdge,
  deleteBlock,
  initVault,
  listBlocks,
  mutateContent,
  openVault,
  removeEdge,
  renameBlock,
} from './vault';

export const tauriVaultPort: VaultPort = {
  initVault,
  openVault,
  addBlock,
  listBlocks,
  renameBlock,
  mutateContent,
  deleteBlock,
  addEdge,
  removeEdge,
};
