import type { Block } from "@domain";

/** Port for picking a folder path (implemented by infrastructure). */
export interface FolderPickerPort {
  pickFolder: () => Promise<string | null>;
}

/** Port for vault operations (implemented by infrastructure). */
export interface VaultPort {
  initVault: (path: string) => Promise<void>;
  openVault: (path: string) => Promise<void>;
  addBlock: (name: string, content: string) => Promise<void>;
  listBlocks: () => Promise<Block[]>;
}
