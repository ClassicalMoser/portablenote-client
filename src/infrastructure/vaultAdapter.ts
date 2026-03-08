/**
 * Infrastructure: Tauri vault bridge. Implements domain VaultPort.
 */
import type { VaultPort } from "@domain";
import * as vault from "./vault";

export const tauriVaultPort: VaultPort = {
  initVault: vault.initVault,
  openVault: vault.openVault,
  addBlock: vault.addBlock,
  listBlocks: vault.listBlocks,
};
