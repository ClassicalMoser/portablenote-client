/** Port for picking a folder path (implemented by infrastructure). */
export interface FolderPickerPort {
  pickFolder(): Promise<string | null>;
}
