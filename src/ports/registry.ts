/**
 * Registry for ports. The composition root wires one adapter per port at
 * startup; application use cases read from here. Ports are session-stable
 * singletons — set once, never swapped mid-session.
 */
import type { ContentCodecPort } from './codec';
import type { FolderPickerPort } from './picker';
import type { AppSettingsPort } from './settings';
import type { VaultPort } from './vault';

let appSettings: AppSettingsPort | null = null;
let contentCodec: ContentCodecPort | null = null;
let folderPicker: FolderPickerPort | null = null;
let vaultPort: VaultPort | null = null;

export function setAppSettings(port: AppSettingsPort): void {
  appSettings = port;
}

export function setContentCodec(port: ContentCodecPort): void {
  contentCodec = port;
}

export function setFolderPicker(port: FolderPickerPort): void {
  folderPicker = port;
}

export function setVaultPort(port: VaultPort): void {
  vaultPort = port;
}

export function getAppSettings(): AppSettingsPort | null {
  return appSettings;
}

export function getContentCodec(): ContentCodecPort | null {
  return contentCodec;
}

export function getFolderPicker(): FolderPickerPort | null {
  return folderPicker;
}

export function getVaultPort(): VaultPort | null {
  return vaultPort;
}
