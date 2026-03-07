/**
 * Vault use cases. Orchestrate infrastructure; UI calls these, not infrastructure directly.
 * Path-requiring use cases use the injected FolderPickerPort when no path is provided.
 */
import type { Block } from "@domain";
import {
  addBlock as addBlockInfra,
  initVault as initVaultInfra,
  listBlocks as listBlocksInfra,
  openVault as openVaultInfra,
} from "@infrastructure";
import type { FolderPickerPort } from "@domain";

let folderPicker: FolderPickerPort | null = null;

export function setFolderPicker(port: FolderPickerPort): void {
  folderPicker = port;
}

export function initVault(path: string): Promise<void> {
  return initVaultInfra(path);
}

export function openVault(path: string): Promise<void> {
  return openVaultInfra(path);
}

export async function initVaultWithPicker(): Promise<string | null> {
  const path = await folderPicker?.pickFolder() ?? null;
  if (path == null) return null;
  await initVaultInfra(path);
  return path;
}

export async function openVaultWithPicker(): Promise<string | null> {
  const path = await folderPicker?.pickFolder() ?? null;
  if (path == null) return null;
  await openVaultInfra(path);
  return path;
}

export function addBlock(name: string, content: string): Promise<void> {
  return addBlockInfra(name, content);
}

export function listBlocks(): Promise<Block[]> {
  return listBlocksInfra();
}
