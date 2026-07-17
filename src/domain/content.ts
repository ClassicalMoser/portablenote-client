/**
 * Schema-constrained content AST for a single block body.
 * No heading variant — headings are block boundaries (spec §2, invariant 8).
 * Library types (mdast) must never appear here; map at the codec boundary.
 */

export interface BlockContent {
  type: 'root';
  children: ContentBlock[];
}

export type ContentBlock =
  | Paragraph
  | Blockquote
  | List
  | Code
  | ThematicBreak
  | Table
  | Html;

export type Inline =
  | Text
  | Emphasis
  | Strong
  | Delete
  | InlineCode
  | Break
  | Link
  | Image
  | BlockRef;

export interface Paragraph {
  type: 'paragraph';
  children: Inline[];
}

export interface Blockquote {
  type: 'blockquote';
  children: ContentBlock[];
}

export interface List {
  type: 'list';
  ordered: boolean;
  start: number | null;
  spread: boolean;
  children: ListItem[];
}

export interface ListItem {
  type: 'listItem';
  /** GFM task list; null when not a task item. */
  checked: boolean | null;
  spread: boolean;
  children: ContentBlock[];
}

export interface Code {
  type: 'code';
  lang: string | null;
  meta: string | null;
  value: string;
}

export interface ThematicBreak {
  type: 'thematicBreak';
}

export interface Table {
  type: 'table';
  align: ('left' | 'right' | 'center' | null)[];
  children: TableRow[];
}

export interface TableRow {
  type: 'tableRow';
  children: TableCell[];
}

export interface TableCell {
  type: 'tableCell';
  children: Inline[];
}

/** Opaque CommonMark HTML block — kept for roundtrip; editor may treat as raw. */
export interface Html {
  type: 'html';
  value: string;
}

export interface Text {
  type: 'text';
  value: string;
}

export interface Emphasis {
  type: 'emphasis';
  children: Inline[];
}

export interface Strong {
  type: 'strong';
  children: Inline[];
}

/** GFM strikethrough. */
export interface Delete {
  type: 'delete';
  children: Inline[];
}

export interface InlineCode {
  type: 'inlineCode';
  value: string;
}

export interface Break {
  type: 'break';
}

export interface Link {
  type: 'link';
  url: string;
  title: string | null;
  children: Inline[];
}

export interface Image {
  type: 'image';
  url: string;
  title: string | null;
  alt: string | null;
}

/** `[display text](block:uuid)` — distinct from ordinary Link (spec §2). */
export interface BlockRef {
  type: 'blockRef';
  targetId: string;
  children: Inline[];
}

export type ContentCodecErrorCode =
  | 'heading_in_content'
  | 'unsupported_node'
  | 'invalid_block_ref';

export class ContentCodecError extends Error {
  public readonly code: ContentCodecErrorCode;

  public constructor(code: ContentCodecErrorCode, message: string) {
    super(message);
    this.name = 'ContentCodecError';
    this.code = code;
  }
}

export interface BlockRefOccurrence {
  displayText: string;
  targetId: string;
}

function inlineToPlainText(nodes: Inline[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'text': {
          return node.value;
        }
        case 'inlineCode': {
          return node.value;
        }
        case 'break': {
          return '\n';
        }
        case 'image': {
          return node.alt ?? '';
        }
        case 'emphasis':
        case 'strong':
        case 'delete':
        case 'link':
        case 'blockRef': {
          return inlineToPlainText(node.children);
        }
        default: {
          const _exhaustive: never = node;
          return _exhaustive;
        }
      }
    })
    .join('');
}

function walkInlines(nodes: Inline[], visit: (node: Inline) => void): void {
  for (const node of nodes) {
    visit(node);
    switch (node.type) {
      case 'emphasis':
      case 'strong':
      case 'delete':
      case 'link':
      case 'blockRef': {
        walkInlines(node.children, visit);
        break;
      }
      case 'text':
      case 'inlineCode':
      case 'break':
      case 'image': {
        break;
      }
      default: {
        const _exhaustive: never = node;
        return _exhaustive;
      }
    }
  }
}

function walkBlocks(
  blocks: ContentBlock[],
  visit: (node: Inline) => void,
): void {
  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph': {
        walkInlines(block.children, visit);
        break;
      }
      case 'blockquote': {
        walkBlocks(block.children, visit);
        break;
      }
      case 'list': {
        for (const item of block.children) {
          walkBlocks(item.children, visit);
        }
        break;
      }
      case 'table': {
        for (const row of block.children) {
          for (const cell of row.children) {
            walkInlines(cell.children, visit);
          }
        }
        break;
      }
      case 'code':
      case 'thematicBreak':
      case 'html': {
        break;
      }
      default: {
        const _exhaustive: never = block;
        return _exhaustive;
      }
    }
  }
}

/** Spec §9: extract all block-reference links from a content AST. */
export function extractBlockRefs(content: BlockContent): BlockRefOccurrence[] {
  const found: BlockRefOccurrence[] = [];
  walkBlocks(content.children, (node) => {
    if (node.type === 'blockRef') {
      found.push({
        displayText: inlineToPlainText(node.children),
        targetId: node.targetId,
      });
    }
  });
  return found;
}
