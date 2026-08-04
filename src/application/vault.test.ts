/**
 * Thin vault query use cases: each delegates to VaultPort.
 */
import type { Edge, EdgesForBlock } from '@domain';
import type { VaultPort } from '@ports';
import { setVaultPort } from '@ports';
import { backlinks, edgesFor, listEdges, orphans, resolveName } from './vault';

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

describe('vault graph queries', () => {
  it('listEdges delegates to the port', async () => {
    const edges: Edge[] = [
      {
        id: 'e1',
        source: 'a',
        target: 'b',
      },
    ];
    const listEdgesFn = vi.fn().mockResolvedValue(edges);
    setVaultPort(mockVault({ listEdges: listEdgesFn }));

    await expect(listEdges()).resolves.toStrictEqual(edges);
    expect(listEdgesFn).toHaveBeenCalledTimes(1);
  });

  it('edgesFor delegates with block id', async () => {
    const split: EdgesForBlock = { outgoing: [], incoming: [] };
    const edgesForFn = vi.fn().mockResolvedValue(split);
    setVaultPort(mockVault({ edgesFor: edgesForFn }));

    await expect(edgesFor('block-1')).resolves.toStrictEqual(split);
    expect(edgesForFn).toHaveBeenCalledWith('block-1');
  });

  it('backlinks delegates with block id', async () => {
    const backlinksFn = vi.fn().mockResolvedValue(['src-a', 'src-b']);
    setVaultPort(mockVault({ backlinks: backlinksFn }));

    await expect(backlinks('target')).resolves.toStrictEqual([
      'src-a',
      'src-b',
    ]);
    expect(backlinksFn).toHaveBeenCalledWith('target');
  });

  it('orphans delegates to the port', async () => {
    const orphansFn = vi.fn().mockResolvedValue(['orphan-1']);
    setVaultPort(mockVault({ orphans: orphansFn }));

    await expect(orphans()).resolves.toStrictEqual(['orphan-1']);
    expect(orphansFn).toHaveBeenCalledTimes(1);
  });

  it('resolveName returns null when missing', async () => {
    const resolveNameFn = vi.fn().mockResolvedValue(null);
    setVaultPort(mockVault({ resolveName: resolveNameFn }));

    await expect(resolveName('Missing')).resolves.toBeNull();
    expect(resolveNameFn).toHaveBeenCalledWith('Missing');
  });
});
