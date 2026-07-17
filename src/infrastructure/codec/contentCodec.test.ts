import type { BlockContent, Inline, Paragraph } from '@domain';
import { ContentCodecError, extractBlockRefs } from '@domain';
import {
  assert as fcAssert,
  asyncProperty,
  array,
  constant,
  oneof,
  stringMatching,
  tuple,
  uuid,
} from 'fast-check';
import type { Arbitrary } from 'fast-check';
import { remarkContentCodec } from './remarkContentCodec';

const BLOCK_UUID = 'b4e8d3f2-4a1c-4e2d-8f3a-123456789abc';

function arbSafeText(): Arbitrary<string> {
  return stringMatching(/^[A-Za-z0-9][A-Za-z0-9 ]{0,23}$/u).filter(
    (s) => s.trim().length > 0,
  );
}

/** Avoid adjacent delimiter runs (`**`+`**`) that CommonMark cannot round-trip. */
function arbMarkedInline(): Arbitrary<Inline> {
  return oneof(
    arbSafeText().map((value) => ({
      type: 'emphasis' as const,
      children: [{ type: 'text' as const, value }],
    })),
    arbSafeText().map((value) => ({
      type: 'strong' as const,
      children: [{ type: 'text' as const, value }],
    })),
    tuple(arbSafeText(), uuid()).map(([value, targetId]) => ({
      type: 'blockRef' as const,
      targetId,
      children: [{ type: 'text' as const, value }],
    })),
  );
}

function arbInline(): Arbitrary<Inline> {
  return oneof(
    arbSafeText().map((value) => ({ type: 'text' as const, value })),
    arbSafeText().map((value) => ({ type: 'inlineCode' as const, value })),
    arbMarkedInline(),
  );
}

function arbParagraph(): Arbitrary<Paragraph> {
  // Separate inlines with plain text so marker runs cannot abut.
  return array(arbInline(), { minLength: 1, maxLength: 3 }).map((parts) => {
    const children: Inline[] = [];
    for (const [index, part] of parts.entries()) {
      if (index > 0) {
        children.push({ type: 'text', value: ' ' });
      }
      children.push(part);
    }
    return { type: 'paragraph' as const, children };
  });
}

function arbBlockContent(): Arbitrary<BlockContent> {
  return array(
    oneof(
      arbParagraph(),
      arbSafeText().map((value) => ({
        type: 'code' as const,
        lang: 'txt' as string | null,
        meta: null as string | null,
        value,
      })),
      constant({ type: 'thematicBreak' as const }),
    ),
    { minLength: 1, maxLength: 3 },
  ).map((children) => ({ type: 'root' as const, children }));
}

describe('content codec', () => {
  describe('heading rejection', () => {
    it('rejects ATX headings outside fenced code', async () => {
      await expect(remarkContentCodec.parse('# Title\n\nbody')).rejects.toThrow(
        ContentCodecError,
      );
      await expect(
        remarkContentCodec.parse('# Title\n\nbody'),
      ).rejects.toMatchObject({ code: 'heading_in_content' });
    });

    it('rejects setext headings outside fenced code', async () => {
      await expect(
        remarkContentCodec.parse('Title\n=====\n\nbody'),
      ).rejects.toMatchObject({ code: 'heading_in_content' });
    });

    it('allows heading syntax inside fenced code', async () => {
      const content = await remarkContentCodec.parse(
        '```md\n# not a heading\n```\n',
      );
      expect(content.children).toHaveLength(1);
      expect(content.children[0]).toMatchObject({
        type: 'code',
        value: '# not a heading',
      });
    });
  });

  describe('blockRef mapping', () => {
    it('maps block: links to blockRef nodes', async () => {
      const md = `See also [Getting Started](block:${BLOCK_UUID}) for more.`;
      const content = await remarkContentCodec.parse(md);
      const para = content.children[0] as Paragraph;
      expect(para.type).toBe('paragraph');
      const ref = para.children.find((n) => n.type === 'blockRef');
      expect(ref).toStrictEqual({
        type: 'blockRef',
        targetId: BLOCK_UUID,
        children: [{ type: 'text', value: 'Getting Started' }],
      });
      expect(para.children.some((n) => n.type === 'link')).toBeFalsy();
    });

    it('keeps ordinary https links as link nodes', async () => {
      const content = await remarkContentCodec.parse(
        'Visit [Example](https://example.com).',
      );
      const para = content.children[0] as Paragraph;
      const link = para.children.find((n) => n.type === 'link');
      expect(link).toMatchObject({
        type: 'link',
        url: 'https://example.com',
      });
    });

    it('round-trips BlockRef through serialize', async () => {
      const original: BlockContent = {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              { type: 'text', value: 'See ' },
              {
                type: 'blockRef',
                targetId: BLOCK_UUID,
                children: [{ type: 'text', value: 'Getting Started' }],
              },
              { type: 'text', value: '.' },
            ],
          },
        ],
      };
      const md = await remarkContentCodec.serialize(original);
      expect(md).toContain(`](block:${BLOCK_UUID})`);
      const parsed = await remarkContentCodec.parse(md);
      expect(parsed).toStrictEqual(original);
    });

    it('extractBlockRefs finds display text and target ids', async () => {
      const content = await remarkContentCodec.parse(
        `A [one](block:${BLOCK_UUID}) and [two](block:${BLOCK_UUID}).`,
      );
      expect(extractBlockRefs(content)).toStrictEqual([
        { displayText: 'one', targetId: BLOCK_UUID },
        { displayText: 'two', targetId: BLOCK_UUID },
      ]);
    });
  });

  describe('fixpoint', () => {
    const fixtures: string[] = [
      'Hello world.\n',
      'A **bold** and *italic* word.\n',
      'Strike ~~this~~ out.\n',
      'Inline `code` here.\n',
      '- a\n- b\n',
      '1. first\n2. second\n',
      '- [ ] todo\n- [x] done\n',
      '```ts\nconst x = 1;\n```\n',
      '> nested\n>\n> > quote\n',
      '| a | b |\n| --- | --- |\n| 1 | 2 |\n',
      '---\n',
      `Link [here](block:${BLOCK_UUID}) and [web](https://example.com "title").\n`,
    ];

    it.each(fixtures)('holds for fixture %#', async (fixture) => {
      const once = await remarkContentCodec.serialize(
        await remarkContentCodec.parse(fixture),
      );
      const twice = await remarkContentCodec.serialize(
        await remarkContentCodec.parse(once),
      );
      expect(twice).toBe(once);
    });

    it('keeps unordered lists tight across a mid-list blank line', async () => {
      const md = `Intro:
- Cool things
- Neat things

- lame things
- ordered and unordered
`;
      const once = await remarkContentCodec.serialize(
        await remarkContentCodec.parse(md),
      );
      // Remark-stringify joins flow with a blank (paragraph->list); mid-list blank
      // Would mark a loose list - we keep items tight on canonicalize.
      expect(once).toBe(`Intro:

- Cool things
- Neat things
- lame things
- ordered and unordered
`);
      const html = await remarkContentCodec.toHtml(
        await remarkContentCodec.parse(md),
      );
      expect(html).toContain('<ul>');
      expect(html.match(/<li>/gu)).toHaveLength(4);
    });

    it('holds for constructible ASTs (property)', async () => {
      await fcAssert(
        asyncProperty(arbBlockContent(), async (ast) => {
          const once = await remarkContentCodec.serialize(ast);
          const twice = await remarkContentCodec.serialize(
            await remarkContentCodec.parse(once),
          );
          expect(twice).toBe(once);
        }),
        { numRuns: 40 },
      );
    });
  });

  describe('toHtml preview', () => {
    it('projects paragraphs and emphasis to sanitized HTML', async () => {
      const content = await remarkContentCodec.parse('Hello **world**.');
      const html = await remarkContentCodec.toHtml(content);
      expect(html).toContain('<p>');
      expect(html).toContain('<strong>world</strong>');
      expect(html).not.toContain('<script');
    });

    it('marks block: links with block-ref class', async () => {
      const content = await remarkContentCodec.parse(
        `[Getting Started](block:${BLOCK_UUID})`,
      );
      const html = await remarkContentCodec.toHtml(content);
      expect(html).toContain('class="block-ref"');
      expect(html).toContain(`href="block:${BLOCK_UUID}"`);
    });

    it('does not emit raw HTML script tags from mdast html nodes', async () => {
      const html = await remarkContentCodec.toHtml({
        type: 'root',
        children: [
          {
            type: 'html',
            value: '<p onclick="alert(1)">ok</p>',
          },
        ],
      });
      expect(html).not.toContain('onclick');
    });
  });
});
