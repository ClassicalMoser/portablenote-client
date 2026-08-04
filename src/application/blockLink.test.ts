import type { Block } from '@domain';
import type { VaultPort } from '@ports';
import { setVaultPort } from '@ports';
import {
  filterLinkTargets,
  insertBlockLink,
  listBacklinkBlocks,
  parseBlockRefTargetId,
  resolveBacklinkBlocks,
} from './blockLink';

function block(id: string, name: string): Block {
  return {
    id,
    name,
    content: '',
    created: '2026-01-01T00:00:00Z',
    modified: '2026-01-01T00:00:00Z',
  };
}

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
    mutateContent: vi.fn(),
    deleteBlock: vi.fn(),
    addEdge: vi.fn(),
    removeEdge: vi.fn(),
    ...overrides,
  };
}

describe(insertBlockLink, () => {
  it('wraps a non-empty selection in a block ref', () => {
    const result = insertBlockLink('See here for more.', 4, 8, {
      id: 'target-uuid',
      name: 'Getting Started',
    });

    expect(result.markdown).toBe('See [here](block:target-uuid) for more.');
    expect(result.selectionStart).toBe('See [here](block:target-uuid)'.length);
    expect(result.selectionEnd).toBe(result.selectionStart);
  });

  it('uses the target name when the selection is empty', () => {
    const result = insertBlockLink('See  for more.', 4, 4, {
      id: 'target-uuid',
      name: 'Getting Started',
    });

    expect(result.markdown).toBe(
      'See [Getting Started](block:target-uuid) for more.',
    );
  });

  it('clamps out-of-range selection to the string bounds', () => {
    const result = insertBlockLink('Hi', -5, 99, {
      id: 'id',
      name: 'Name',
    });

    expect(result.markdown).toBe('[Hi](block:id)');
  });
});

describe(filterLinkTargets, () => {
  const blocks = [
    block('a', 'Alpha'),
    block('b', 'Beta Notes'),
    block('c', 'Gamma'),
  ];

  it('excludes the source block', () => {
    expect(filterLinkTargets(blocks, '', 'b').map((b) => b.id)).toStrictEqual([
      'a',
      'c',
    ]);
  });

  it('filters by case-insensitive name substring', () => {
    expect(
      filterLinkTargets(blocks, 'eta', null).map((b) => b.name),
    ).toStrictEqual(['Beta Notes']);
  });

  it('returns all non-excluded blocks for an empty query', () => {
    expect(filterLinkTargets(blocks, '  ', null)).toHaveLength(3);
  });
});

describe(parseBlockRefTargetId, () => {
  it('extracts the uuid from a block: href', () => {
    expect(parseBlockRefTargetId('block:abc-123')).toBe('abc-123');
  });

  it('returns null for ordinary urls', () => {
    expect(parseBlockRefTargetId('https://example.com')).toBeNull();
  });

  it('returns null for an empty block: target', () => {
    expect(parseBlockRefTargetId('block:')).toBeNull();
    expect(parseBlockRefTargetId('block:   ')).toBeNull();
  });
});

describe(resolveBacklinkBlocks, () => {
  const blocks = [block('a', 'Alpha'), block('b', 'Beta')];

  it('preserves backlink order and drops unknown ids', () => {
    expect(
      resolveBacklinkBlocks(['b', 'missing', 'a'], blocks).map((b) => b.id),
    ).toStrictEqual(['b', 'a']);
  });
});

describe(listBacklinkBlocks, () => {
  it('loads backlink ids then resolves against the block list', async () => {
    const blocks = [block('a', 'Alpha'), block('b', 'Beta')];
    const backlinks = vi.fn().mockResolvedValue(['b']);
    setVaultPort(mockVault({ backlinks }));

    await expect(listBacklinkBlocks('a', blocks)).resolves.toStrictEqual([
      blocks[1],
    ]);
    expect(backlinks).toHaveBeenCalledWith('a');
  });
});
