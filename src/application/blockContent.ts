/**
 * Block body load/save/preview use cases. Raw markdown flows through
 * ContentCodecPort for validation and canonical serialization before
 * MutateBlockContent; preview projects the same validated AST to HTML.
 */
import type { ContentCodecPort, VaultPort } from '@ports';
import { getContentCodec, getVaultPort } from '@ports';

function getVault(): VaultPort {
  const port = getVaultPort();
  if (port === null) {
    throw new Error('VaultPort not set; ensure composition has run.');
  }
  return port;
}

function getCodec(): ContentCodecPort {
  const port = getContentCodec();
  if (port === null) {
    throw new Error('ContentCodecPort not set; ensure composition has run.');
  }
  return port;
}

/**
 * Validate markdown via the content codec, then persist the canonical form
 * (MutateBlockContent, spec §5).
 */
export async function saveBlockContent(
  blockId: string,
  markdown: string,
): Promise<void> {
  const codec = getCodec();
  const ast = await codec.parse(markdown);
  const canonical = await codec.serialize(ast);
  await getVault().mutateContent(blockId, canonical);
}

/**
 * Parse markdown to the domain AST, then project to a sanitized HTML fragment
 * for the raw-editor preview pane. Invalid content (e.g. headings) rejects.
 */
export async function previewBlockContent(markdown: string): Promise<string> {
  const codec = getCodec();
  const ast = await codec.parse(markdown);
  return codec.toHtml(ast);
}
