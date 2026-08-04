/**
 * Composition root: wires infrastructure adapters into the ports registry
 * (one adapter per port). The web build will detect its environment here
 * and wire HTTP adapters instead of Tauri ones.
 */
import {
  remarkContentCodec,
  tauriAppSettings,
  tauriFolderPicker,
  tauriVaultPort,
} from '@infrastructure';
import {
  setAppSettings,
  setContentCodec,
  setFolderPicker,
  setVaultPort,
} from '@ports';

const wireTauriInfrastructureToPorts = (): void => {
  setAppSettings(tauriAppSettings);
  setContentCodec(remarkContentCodec);
  setFolderPicker(tauriFolderPicker);
  setVaultPort(tauriVaultPort);
};

/* In the future, we will have a separate DI structure for the web build.
They will implement the exact same ports, so interface and application
code will be exactly the same. */

export { wireTauriInfrastructureToPorts };
