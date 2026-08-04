import type { BlockContent } from '@domain';
import { ContentCodecError } from '@domain';
import type { ContentCodecPort, VaultPort } from '@ports';
import { setContentCodec, setVaultPort } from '@ports';
import { previewBlockContent, saveBlockContent } from './blockContent';

function mockVault(overrides: Partial<VaultPort> = {}): VaultPort {
  return {
    initVault: vi.fn(),
    openVault: vi.fn(),
    addBlock: vi.fn(),
    listBlocks: vi.fn(),
    listEdges: vi.fn(),
    edgesFor: vi.fn(),
    backlinks: vi.fn(),
    orphans: vi.fn(),
    resolveName: vi.fn(),
    renameBlock: vi.fn(),
    mutateContent: vi.fn(async (): Promise<void> => undefined),
    deleteBlock: vi.fn(),
    addEdge: vi.fn(),
    removeEdge: vi.fn(),
    ...overrides,
  };
}

function mockCodec(
  overrides: Partial<ContentCodecPort> = {},
): ContentCodecPort {
  const empty: BlockContent = { type: 'root', children: [] };
  return {
    parse: vi.fn().mockResolvedValue(empty),
    serialize: vi.fn().mockResolvedValue(''),
    toHtml: vi.fn().mockResolvedValue(''),
    ...overrides,
  };
}

describe(saveBlockContent, () => {
  beforeEach(() => {
    setVaultPort(mockVault());
    setContentCodec(mockCodec());
  });

  it('parses then persists canonical markdown', async () => {
    const ast: BlockContent = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: 'Hi' }],
        },
      ],
    };
    const parse = vi.fn().mockResolvedValue(ast);
    const serialize = vi.fn().mockResolvedValue('Hi\n');
    const mutateContent = vi.fn(async (): Promise<void> => undefined);
    setContentCodec(mockCodec({ parse, serialize }));
    setVaultPort(mockVault({ mutateContent }));

    await saveBlockContent('block-1', 'Hi');

    expect(parse).toHaveBeenCalledWith('Hi');
    expect(serialize).toHaveBeenCalledWith(ast);
    expect(mutateContent).toHaveBeenCalledWith('block-1', 'Hi\n');
  });

  it('does not mutate when parse rejects headings', async () => {
    const mutateContent = vi.fn(async (): Promise<void> => undefined);
    const parseError = new ContentCodecError(
      'heading_in_content',
      'no headings',
    );
    const parse = vi.fn().mockRejectedValue(parseError);
    setContentCodec(mockCodec({ parse }));
    setVaultPort(mockVault({ mutateContent }));

    await expect(
      saveBlockContent('block-1', '# Title\n\nbody'),
    ).rejects.toMatchObject({ code: 'heading_in_content' });
    expect(mutateContent).not.toHaveBeenCalled();
  });
});

describe(previewBlockContent, () => {
  beforeEach(() => {
    setContentCodec(mockCodec());
  });

  it('parses then projects HTML', async () => {
    const ast: BlockContent = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: 'Hi' }],
        },
      ],
    };
    const parse = vi.fn().mockResolvedValue(ast);
    const toHtml = vi.fn().mockResolvedValue('<p>Hi</p>');
    setContentCodec(mockCodec({ parse, toHtml }));

    await expect(previewBlockContent('Hi')).resolves.toBe('<p>Hi</p>');
    expect(parse).toHaveBeenCalledWith('Hi');
    expect(toHtml).toHaveBeenCalledWith(ast);
  });

  it('rejects invalid markdown before projecting', async () => {
    const toHtml = vi.fn().mockResolvedValue('<p/>');
    const parseError = new ContentCodecError(
      'heading_in_content',
      'no headings',
    );
    setContentCodec(
      mockCodec({
        parse: vi.fn().mockRejectedValue(parseError),
        toHtml,
      }),
    );

    await expect(previewBlockContent('# nope')).rejects.toMatchObject({
      code: 'heading_in_content',
    });
    expect(toHtml).not.toHaveBeenCalled();
  });
});
