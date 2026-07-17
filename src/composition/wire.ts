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

setAppSettings(tauriAppSettings);
setContentCodec(remarkContentCodec);
setFolderPicker(tauriFolderPicker);
setVaultPort(tauriVaultPort);
