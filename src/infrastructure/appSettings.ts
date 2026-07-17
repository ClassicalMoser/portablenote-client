import type { AppSettingsPort } from '@ports';
/**
 * Infrastructure: app settings via Tauri commands (settings.json in the app
 * config dir). Implements AppSettingsPort.
 */
import { invoke } from '@tauri-apps/api/core';

export const tauriAppSettings: AppSettingsPort = {
  getLastVaultPath(): Promise<string | null> {
    return invoke('get_last_vault_path');
  },
  setLastVaultPath(path: string | null): Promise<void> {
    return invoke('set_last_vault_path', { path });
  },
};
