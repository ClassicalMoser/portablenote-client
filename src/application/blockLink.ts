/**
 * Block-reference linking helpers and queries for the raw-MD editor path.
 * Format: `[display text](block:uuid)` (spec §2). Edge creation is core’s
 * job on MutateBlockContent — this module only shapes content and reads.
 */
import type { Block } from '@domain';
import type { VaultPort } from '@ports';
import { getVaultPort } from '@ports';

const BLOCK_SCHEME = 'block:';

function getVault(): VaultPort {
  const port = getVaultPort();
  if (port === null) {
    throw new Error('VaultPort not set; ensure composition has run.');
  }
  return port;
}

export interface BlockLinkTarget {
  id: string;
  name: string;
}

export interface InsertBlockLinkResult {
  markdown: string;
  selectionStart: number;
  selectionEnd: number;
}

/**
 * Wrap the current selection (or insert at the caret) as a block-reference
 * link. Empty selection uses the target’s vault-unique name as display text.
 */
export function insertBlockLink(
  markdown: string,
  selectionStart: number,
  selectionEnd: number,
  target: BlockLinkTarget,
): InsertBlockLinkResult {
  const start = Math.max(0, Math.min(selectionStart, markdown.length));
  const end = Math.max(start, Math.min(selectionEnd, markdown.length));
  const selected = markdown.slice(start, end);
  const displayText = selected.length > 0 ? selected : target.name;
  const link = `[${displayText}](${BLOCK_SCHEME}${target.id})`;
  const next = markdown.slice(0, start) + link + markdown.slice(end);
  const cursor = start + link.length;
  return {
    markdown: next,
    selectionStart: cursor,
    selectionEnd: cursor,
  };
}

/** Filter linkable blocks by name substring; excludes the source block. */
export function filterLinkTargets(
  blocks: readonly Block[],
  query: string,
  excludeId: string | null,
): Block[] {
  const needle = query.trim().toLowerCase();
  return blocks.filter((block) => {
    if (excludeId !== null && block.id === excludeId) {
      return false;
    }
    if (needle.length === 0) {
      return true;
    }
    return block.name.toLowerCase().includes(needle);
  });
}

/** Extract target UUID from a `block:` href, or null if not a block ref. */
export function parseBlockRefTargetId(href: string): string | null {
  if (!href.startsWith(BLOCK_SCHEME)) {
    return null;
  }
  const targetId = href.slice(BLOCK_SCHEME.length).trim();
  return targetId.length > 0 ? targetId : null;
}

/**
 * Map backlink source IDs onto known blocks (order preserved; unknown IDs
 * dropped — e.g. race after delete).
 */
export function resolveBacklinkBlocks(
  backlinkIds: readonly string[],
  blocks: readonly Block[],
): Block[] {
  const byId = new Map(blocks.map((block) => [block.id, block]));
  const resolved: Block[] = [];
  for (const id of backlinkIds) {
    const block = byId.get(id);
    if (block !== undefined) {
      resolved.push(block);
    }
  }
  return resolved;
}

/** Incoming edges for a block, resolved to Block records (core `backlinks`). */
export async function listBacklinkBlocks(
  blockId: string,
  blocks: readonly Block[],
): Promise<Block[]> {
  const ids = await getVault().backlinks(blockId);
  return resolveBacklinkBlocks(ids, blocks);
}
