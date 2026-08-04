/**
 * Vault use cases. Depend on ports supplied via the ports registry; no
 * direct infrastructure imports. One use case per spec command.
 */
import type { Block, Edge, EdgesForBlock } from '@domain';
import type { VaultPort } from '@ports';
import { getFolderPicker, getVaultPort } from '@ports';
import { rememberVault } from './session';

function getVault(): VaultPort {
  const port = getVaultPort();
  if (port === null) {
    throw new Error('VaultPort not set; ensure composition has run.');
  }
  return port;
}

export async function initVault(path: string): Promise<void> {
  await getVault().initVault(path);
  await rememberVault(path);
}

export async function openVault(path: string): Promise<void> {
  await getVault().openVault(path);
  await rememberVault(path);
}

export async function initVaultWithPicker(): Promise<string | null> {
  const picker = getFolderPicker();
  const path = (await picker?.pickFolder()) ?? null;
  if (path === null) {
    return null;
  }
  await initVault(path);
  return path;
}

export async function openVaultWithPicker(): Promise<string | null> {
  const picker = getFolderPicker();
  const path = (await picker?.pickFolder()) ?? null;
  if (path === null) {
    return null;
  }
  await openVault(path);
  return path;
}

export function addBlock(name: string, content: string): Promise<void> {
  return getVault().addBlock(name, content);
}

export function listBlocks(): Promise<Block[]> {
  return getVault().listBlocks();
}

export function listEdges(): Promise<Edge[]> {
  return getVault().listEdges();
}

export function edgesFor(blockId: string): Promise<EdgesForBlock> {
  return getVault().edgesFor(blockId);
}

export function backlinks(blockId: string): Promise<string[]> {
  return getVault().backlinks(blockId);
}

export function orphans(): Promise<string[]> {
  return getVault().orphans();
}

export function resolveName(name: string): Promise<string | null> {
  return getVault().resolveName(name);
}

export function renameBlock(blockId: string, newName: string): Promise<void> {
  return getVault().renameBlock(blockId, newName);
}

export function mutateContent(blockId: string, content: string): Promise<void> {
  return getVault().mutateContent(blockId, content);
}

export function deleteBlock(blockId: string, cascade: boolean): Promise<void> {
  return getVault().deleteBlock(blockId, cascade);
}

export function addEdge(source: string, target: string): Promise<void> {
  return getVault().addEdge(source, target);
}

export function removeEdge(edgeId: string): Promise<void> {
  return getVault().removeEdge(edgeId);
}
