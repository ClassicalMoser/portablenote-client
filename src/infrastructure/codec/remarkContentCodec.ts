/**
 * Remark/GFM adapter for ContentCodecPort.
 *
 * Stringify options (canonical output — audit before changing):
 * - fences: always use fenced code blocks (stable vs indented)
 * - bullet: '-' (GFM task lists + common convention)
 * - listItemIndent: 'one' (tight, deterministic)
 * - rule: '-' for thematic breaks
 * - emphasis/strong: '*' markers (CommonMark-default for remark-stringify)
 * - join: leave default (blank between flow nodes, e.g. paragraph→list)
 *
 * HTML preview: domain AST → mdast → remark-rehype → rehype-sanitize → string.
 * Do not invent spacing on the HTML path; save uses parse→serialize for MD determinism.
 * Fixpoint property tests are the acceptance gate for escaping changes.
 */
import type {
  BlockContent,
  ContentBlock,
  Inline,
  ListItem,
  TableCell,
  TableRow,
} from '@domain';
import { ContentCodecError } from '@domain';
import type { ContentCodecPort } from '@ports';
import type { Element, Root as HastRoot } from 'hast';
import type {
  BlockContent as MdastBlock,
  Blockquote as MdastBlockquote,
  Code as MdastCode,
  Delete as MdastDelete,
  Emphasis as MdastEmphasis,
  Heading as MdastHeading,
  Html as MdastHtml,
  Image as MdastImage,
  InlineCode as MdastInlineCode,
  Link as MdastLink,
  List as MdastList,
  ListItem as MdastListItem,
  Paragraph as MdastParagraph,
  PhrasingContent as MdastPhrasing,
  Root as MdastRoot,
  RootContent as MdastRootContent,
  Strong as MdastStrong,
  Table as MdastTable,
  TableCell as MdastTableCell,
  TableRow as MdastTableRow,
  Text as MdastText,
  ThematicBreak as MdastThematicBreak,
} from 'mdast';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

const BLOCK_SCHEME = 'block:';

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkStringify, {
    bullet: '-',
    emphasis: '*',
    fences: true,
    listItemIndent: 'one',
    rule: '-',
    strong: '*',
  });

/** Tag block: links so the preview UI can style refs without executing them. */
function rehypeMarkBlockRefs() {
  return (tree: HastRoot): void => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'a') {
        return;
      }
      const href = node.properties?.href;
      if (typeof href !== 'string' || !href.startsWith(BLOCK_SCHEME)) {
        return;
      }
      const existing = node.properties.className;
      let classes: string[] = [];
      if (Array.isArray(existing)) {
        classes = existing.map(String);
      } else if (typeof existing === 'string') {
        classes = [existing];
      }
      if (!classes.includes('block-ref')) {
        classes.push('block-ref');
      }
      node.properties = {
        ...node.properties,
        className: classes,
      };
    });
  };
}

const htmlProcessor = unified()
  .use(remarkRehype)
  .use(rehypeSanitize, {
    ...defaultSchema,
    protocols: {
      ...defaultSchema.protocols,
      href: [...(defaultSchema.protocols?.href ?? []), 'block'],
    },
  })
  // After sanitize so `block-ref` class is not stripped by the schema allow-list.
  .use(rehypeMarkBlockRefs)
  .use(rehypeStringify);

function assertNever(node: { type: string }): never {
  throw new ContentCodecError(
    'unsupported_node',
    `Unsupported markdown node type: ${node.type}`,
  );
}

function isBlockUrl(url: string): boolean {
  return url.startsWith(BLOCK_SCHEME);
}

function blockTargetId(url: string): string {
  const targetId = url.slice(BLOCK_SCHEME.length);
  if (targetId.length === 0) {
    throw new ContentCodecError(
      'invalid_block_ref',
      'block: link is missing a target id',
    );
  }
  return targetId;
}

function fromPhrasing(node: MdastPhrasing): Inline {
  switch (node.type) {
    case 'text': {
      return { type: 'text', value: (node as MdastText).value };
    }
    case 'emphasis': {
      return {
        type: 'emphasis',
        children: (node as MdastEmphasis).children.map(fromPhrasing),
      };
    }
    case 'strong': {
      return {
        type: 'strong',
        children: (node as MdastStrong).children.map(fromPhrasing),
      };
    }
    case 'delete': {
      return {
        type: 'delete',
        children: (node as MdastDelete).children.map(fromPhrasing),
      };
    }
    case 'inlineCode': {
      return { type: 'inlineCode', value: (node as MdastInlineCode).value };
    }
    case 'break': {
      return { type: 'break' };
    }
    case 'link': {
      const link = node as MdastLink;
      if (isBlockUrl(link.url)) {
        return {
          type: 'blockRef',
          targetId: blockTargetId(link.url),
          children: link.children.map(fromPhrasing),
        };
      }
      return {
        type: 'link',
        url: link.url,
        title: link.title ?? null,
        children: link.children.map(fromPhrasing),
      };
    }
    case 'image': {
      const image = node as MdastImage;
      return {
        type: 'image',
        url: image.url,
        title: image.title ?? null,
        alt: image.alt ?? null,
      };
    }
    case 'html':
    case 'linkReference':
    case 'imageReference':
    case 'footnoteReference': {
      throw new ContentCodecError(
        'unsupported_node',
        `Unsupported phrasing node type: ${node.type}`,
      );
    }
    default: {
      return assertNever(node);
    }
  }
}

function fromBlock(node: MdastBlock | MdastRootContent): ContentBlock {
  switch (node.type) {
    case 'heading': {
      throw new ContentCodecError(
        'heading_in_content',
        `Heading level ${(node as MdastHeading).depth} is not allowed in block content (spec §2)`,
      );
    }
    case 'paragraph': {
      return {
        type: 'paragraph',
        children: (node as MdastParagraph).children.map(fromPhrasing),
      };
    }
    case 'blockquote': {
      return {
        type: 'blockquote',
        children: (node as MdastBlockquote).children.map(fromBlock),
      };
    }
    case 'list': {
      const list = node as MdastList;
      return {
        type: 'list',
        ordered: list.ordered ?? false,
        start: list.start ?? null,
        // Always tight. CommonMark treats a blank line between items as one
        // Loose list; remark-stringify then emits a blank line after every
        // Item, which looks like the list was split apart.
        spread: false,
        children: list.children.map(
          (item): ListItem => ({
            type: 'listItem',
            checked: item.checked ?? null,
            spread: false,
            children: item.children.map(fromBlock),
          }),
        ),
      };
    }
    case 'code': {
      const code = node as MdastCode;
      return {
        type: 'code',
        lang: code.lang ?? null,
        meta: code.meta ?? null,
        value: code.value,
      };
    }
    case 'thematicBreak': {
      return { type: 'thematicBreak' };
    }
    case 'table': {
      const table = node as MdastTable;
      return {
        type: 'table',
        align: (table.align ?? []).map((a) => a ?? null),
        children: table.children.map(
          (row): TableRow => ({
            type: 'tableRow',
            children: row.children.map(
              (cell): TableCell => ({
                type: 'tableCell',
                children: cell.children.map(fromPhrasing),
              }),
            ),
          }),
        ),
      };
    }
    case 'html': {
      return { type: 'html', value: (node as MdastHtml).value };
    }
    case 'listItem':
    case 'tableRow':
    case 'tableCell':
    case 'definition':
    case 'footnoteDefinition':
    case 'yaml': {
      throw new ContentCodecError(
        'unsupported_node',
        `Unsupported block node type: ${node.type}`,
      );
    }
    default: {
      return assertNever(node);
    }
  }
}

function fromMdast(root: MdastRoot): BlockContent {
  return {
    type: 'root',
    children: root.children.map(fromBlock),
  };
}

function toPhrasing(node: Inline): MdastPhrasing {
  switch (node.type) {
    case 'text': {
      return { type: 'text', value: node.value } satisfies MdastText;
    }
    case 'emphasis': {
      return {
        type: 'emphasis',
        children: node.children.map(toPhrasing),
      } satisfies MdastEmphasis;
    }
    case 'strong': {
      return {
        type: 'strong',
        children: node.children.map(toPhrasing),
      } satisfies MdastStrong;
    }
    case 'delete': {
      return {
        type: 'delete',
        children: node.children.map(toPhrasing),
      } satisfies MdastDelete;
    }
    case 'inlineCode': {
      return {
        type: 'inlineCode',
        value: node.value,
      } satisfies MdastInlineCode;
    }
    case 'break': {
      return { type: 'break' };
    }
    case 'link': {
      return {
        type: 'link',
        url: node.url,
        title: node.title,
        children: node.children.map(toPhrasing),
      } satisfies MdastLink;
    }
    case 'image': {
      return {
        type: 'image',
        url: node.url,
        title: node.title,
        alt: node.alt ?? undefined,
      } satisfies MdastImage;
    }
    case 'blockRef': {
      return {
        type: 'link',
        url: `${BLOCK_SCHEME}${node.targetId}`,
        title: null,
        children: node.children.map(toPhrasing),
      } satisfies MdastLink;
    }
    default: {
      const _exhaustive: never = node;
      return _exhaustive;
    }
  }
}

function toBlock(node: ContentBlock): MdastBlock {
  switch (node.type) {
    case 'paragraph': {
      return {
        type: 'paragraph',
        children: node.children.map(toPhrasing),
      } satisfies MdastParagraph;
    }
    case 'blockquote': {
      return {
        type: 'blockquote',
        children: node.children.map(toBlock),
      } satisfies MdastBlockquote;
    }
    case 'list': {
      return {
        type: 'list',
        ordered: node.ordered,
        start: node.start ?? undefined,
        spread: node.spread,
        children: node.children.map(
          (item): MdastListItem => ({
            type: 'listItem',
            checked: item.checked,
            spread: item.spread,
            children: item.children.map(toBlock),
          }),
        ),
      } satisfies MdastList;
    }
    case 'code': {
      return {
        type: 'code',
        lang: node.lang,
        meta: node.meta,
        value: node.value,
      } satisfies MdastCode;
    }
    case 'thematicBreak': {
      return { type: 'thematicBreak' } satisfies MdastThematicBreak;
    }
    case 'table': {
      return {
        type: 'table',
        align: node.align,
        children: node.children.map(
          (row): MdastTableRow => ({
            type: 'tableRow',
            children: row.children.map(
              (cell): MdastTableCell => ({
                type: 'tableCell',
                children: cell.children.map(toPhrasing),
              }),
            ),
          }),
        ),
      } satisfies MdastTable;
    }
    case 'html': {
      return { type: 'html', value: node.value } satisfies MdastHtml;
    }
    default: {
      const _exhaustive: never = node;
      return _exhaustive;
    }
  }
}

function toMdast(content: BlockContent): MdastRoot {
  return {
    type: 'root',
    children: content.children.map(toBlock),
  };
}

export const remarkContentCodec: ContentCodecPort = {
  async parse(markdown: string): Promise<BlockContent> {
    const tree = processor.parse(markdown) as MdastRoot;
    return fromMdast(tree);
  },

  async serialize(content: BlockContent): Promise<string> {
    return processor.stringify(toMdast(content));
  },

  async toHtml(content: BlockContent): Promise<string> {
    const mdast = toMdast(content);
    const hast = (await htmlProcessor.run(mdast)) as HastRoot;
    return htmlProcessor.stringify(hast);
  },
};
