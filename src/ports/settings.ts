/**
 * App-local preference state (not vault state — never stored inside a
 * vault). Tauri adapter writes the app config dir; the web build will use
 * localStorage.
 */
export interface AppSettingsPort {
  /** Last successfully opened vault path, or null when unset/cleared. */
  getLastVaultPath: () => Promise<string | null>;
  /** Persist the last vault path; pass null to clear (e.g. vault moved). */
  setLastVaultPath: (path: string | null) => Promise<void>;
}
