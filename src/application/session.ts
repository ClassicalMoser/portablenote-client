/**
 * Session lifecycle: remember the active vault across launches and restore
 * it at startup. Settings are best-effort — a failed preference write never
 * fails a vault operation.
 */
import { getAppSettings, getVaultPort } from '@ports';

/** Best-effort persist of the active vault path (null clears it). */
export async function rememberVault(path: string | null): Promise<void> {
  const settings = getAppSettings();
  if (settings === null) {
    return;
  }
  try {
    await settings.setLastVaultPath(path);
  } catch {
    // Preference persistence must never break a vault operation.
  }
}

/**
 * Try to reopen the last vault. Returns its path on success; returns null
 * (and clears the stale setting) when there is no saved vault or it no
 * longer opens. Never auto-inits: a missing vault is the user's call.
 */
export async function restoreSession(): Promise<string | null> {
  const settings = getAppSettings();
  const vault = getVaultPort();
  if (settings === null || vault === null) {
    return null;
  }
  let path: string | null = null;
  try {
    path = await settings.getLastVaultPath();
  } catch {
    return null;
  }
  if (path === null) {
    return null;
  }
  try {
    await vault.openVault(path);
  } catch {
    await rememberVault(null);
    return null;
  }
  return path;
}
