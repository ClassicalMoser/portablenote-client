/**
 * Vault use cases. Depend on ports supplied via vaultPorts; no direct infrastructure imports.
 */
import type { Block } from "@domain";
import type { VaultPort } from "./ports";
import { getFolderPicker, getVaultPort } from "./portRegistry";

function getVault(): VaultPort {
  const port = getVaultPort();
  if (port == null)
    throw new Error("VaultPort not set; ensure composition has run.");
  return port;
}

export function initVault(path: string): Promise<void> {
  return getVault().initVault(path);
}

export function openVault(path: string): Promise<void> {
  return getVault().openVault(path);
}

export async function initVaultWithPicker(): Promise<string | null> {
  const picker = getFolderPicker();
  const path = (await picker?.pickFolder()) ?? null;
  if (path == null) return null;
  await getVault().initVault(path);
  return path;
}

export async function openVaultWithPicker(): Promise<string | null> {
  const picker = getFolderPicker();
  const path = (await picker?.pickFolder()) ?? null;
  if (path == null) return null;
  await getVault().openVault(path);
  return path;
}

export function addBlock(name: string, content: string): Promise<void> {
  return getVault().addBlock(name, content);
}

export function listBlocks(): Promise<Block[]> {
  return getVault().listBlocks();
}
