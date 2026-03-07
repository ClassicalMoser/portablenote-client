/**
 * Composition root: wires infrastructure (folder picker) into application.
 */
import { setFolderPicker } from "@application";
import { tauriFolderPicker } from "@infrastructure";

setFolderPicker(tauriFolderPicker);
