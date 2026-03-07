/**
 * Infrastructure: folder picker using Tauri dialog. Implements application FolderPickerPort.
 */
import { open } from "@tauri-apps/plugin-dialog";
import type { FolderPickerPort } from "@domain";

export const tauriFolderPicker: FolderPickerPort = {
  async pickFolder(): Promise<string | null> {
    return open({ directory: true, multiple: false });
  },
};
