/**
 * Composition root: wires infrastructure ports into application (one port per setter).
 */
import { setFolderPicker, setVaultPort } from "@application";
import { tauriFolderPicker, tauriVaultPort } from "@infrastructure";

setFolderPicker(tauriFolderPicker);
setVaultPort(tauriVaultPort);
