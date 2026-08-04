export { previewBlockContent, saveBlockContent } from './blockContent';
export {
  filterLinkTargets,
  insertBlockLink,
  listBacklinkBlocks,
  parseBlockRefTargetId,
  resolveBacklinkBlocks,
} from './blockLink';
export type { BlockLinkTarget, InsertBlockLinkResult } from './blockLink';
export { rememberVault, restoreSession } from './session';
export {
  addBlock,
  addEdge,
  backlinks,
  deleteBlock,
  edgesFor,
  initVault,
  initVaultWithPicker,
  listBlocks,
  listEdges,
  mutateContent,
  openVault,
  openVaultWithPicker,
  orphans,
  removeEdge,
  renameBlock,
  resolveName,
} from './vault';
