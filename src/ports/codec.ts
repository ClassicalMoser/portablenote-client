import type { BlockContent } from '@domain';

/**
 * Parse/serialize block body markdown (spec §9), plus HTML projection for
 * preview. Implemented by a remark/GFM (+ rehype) adapter in infrastructure.
 * No mdast/hast types may appear in this contract.
 *
 * Acceptance gate: serialize(parse(serialize(x))) === serialize(x);
 * headings outside fenced code are a parse error (spec §2).
 */
export interface ContentCodecPort {
  parse: (markdown: string) => Promise<BlockContent>;
  serialize: (content: BlockContent) => Promise<string>;
  /** Domain AST → sanitized HTML fragment (mdast → hast via remark-rehype). */
  toHtml: (content: BlockContent) => Promise<string>;
}
