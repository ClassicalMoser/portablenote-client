import type { FolderPickerPort } from '@ports';
/**
 * Infrastructure: folder picker using Tauri dialog. Implements FolderPickerPort.
 */
import { open } from '@tauri-apps/plugin-dialog';

export const tauriFolderPicker: FolderPickerPort = {
  async pickFolder(): Promise<string | null> {
    return open({ directory: true, multiple: false });
  },
};
