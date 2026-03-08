/**
 * Registry for use-case ports. Composition wires one port at a time;
 * vault use cases read from here.
 */
import type { FolderPickerPort, VaultPort } from "./ports";

let folderPicker: FolderPickerPort | null = null;
let vaultPort: VaultPort | null = null;

export function setFolderPicker(port: FolderPickerPort): void {
  folderPicker = port;
}

export function setVaultPort(port: VaultPort): void {
  vaultPort = port;
}

export function getFolderPicker(): FolderPickerPort | null {
  return folderPicker;
}

export function getVaultPort(): VaultPort | null {
  return vaultPort;
}
