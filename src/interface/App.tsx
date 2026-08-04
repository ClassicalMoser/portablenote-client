import type { Block } from '@domain';
import type { JSX } from 'solid-js';
import {
  addBlock,
  initVaultWithPicker,
  listBacklinkBlocks,
  listBlocks,
  openVaultWithPicker,
  previewBlockContent,
  restoreSession,
  saveBlockContent,
} from '@application';
import { createSignal, onMount } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
import {
  SidebarInset,
  SidebarProvider,
} from '@interface/components/ui/sidebar';
import {
  AppMenubar,
  BacklinksPanel,
  BlockSidebar,
  WritingSpace,
} from '@interface/views';
import type { EditorMode } from '@interface/views';

export function App(): JSX.Element {
  const [status, setStatus] = createSignal<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = createSignal('');
  const [blockName, setBlockName] = createSignal('');
  const [blocks, setBlocks] = createSignal<Block[]>([]);
  const [selectedId, setSelectedId] = createSignal<string | null>(null);
  /** Per-block drafts — independent of selection and of view mode. */
  const [drafts, setDrafts] = createStore<Record<string, string>>({});
  const [previewHtml, setPreviewHtml] = createSignal('');
  const [linkPickerOpen, setLinkPickerOpen] = createSignal(false);
  const [backlinks, setBacklinks] = createSignal<Block[]>([]);
  /** View mode — independent of which block is selected. */
  const [mode, setMode] = createSignal<EditorMode>('edit');

  const busy = () => status() === 'loading';

  const draft = (): string => {
    const id = selectedId();
    if (id === null) {
      return '';
    }
    return drafts[id] ?? '';
  };

  function ensureDraft(block: Block): void {
    if (drafts[block.id] === undefined) {
      setDrafts(block.id, block.content);
    }
  }

  function pruneDrafts(nextBlocks: Block[]): void {
    const keep = new Set(nextBlocks.map((block) => block.id));
    const next: Record<string, string> = {};
    for (const [id, text] of Object.entries(drafts)) {
      if (keep.has(id)) {
        next[id] = text;
      }
    }
    setDrafts(reconcile(next));
  }

  async function refreshBacklinks(
    blockId: string | null,
    nextBlocks: Block[],
  ): Promise<void> {
    if (blockId === null) {
      setBacklinks([]);
      return;
    }
    const links = await listBacklinkBlocks(blockId, nextBlocks);
    setBacklinks(links);
  }

  async function refreshPreview(): Promise<void> {
    if (mode() !== 'preview' || selectedId() === null) {
      setPreviewHtml('');
      return;
    }
    const html = await previewBlockContent(draft());
    setPreviewHtml(html);
  }

  async function refreshBlocks(): Promise<void> {
    const next = await listBlocks();
    setBlocks(next);
    pruneDrafts(next);
    const id = selectedId();
    if (id !== null) {
      const stillThere = next.find((b) => b.id === id);
      if (stillThere === undefined) {
        setSelectedId(null);
        setPreviewHtml('');
        setBacklinks([]);
      } else {
        // Saved/canonical content wins for the open block after a vault refresh.
        setDrafts(id, stillThere.content);
        if (mode() === 'preview') {
          setPreviewHtml(await previewBlockContent(stillThere.content));
        }
        await refreshBacklinks(id, next);
      }
    } else {
      setBacklinks([]);
    }
  }

  async function handleRestoreSession(): Promise<void> {
    setStatus('loading');
    try {
      const path = await restoreSession();
      if (path === null) {
        setStatus('idle');
        return;
      }
      await refreshBlocks();
      setStatus('success');
      setMessage(`Vault restored at ${path}`);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : String(error));
    }
  }

  // Fire-and-forget: handleRestoreSession reports errors via status/message.
  onMount(() => {
    handleRestoreSession();
  });

  async function handleInitVault(): Promise<void> {
    setStatus('loading');
    setMessage('');
    try {
      const path = await initVaultWithPicker();
      if (path === null) {
        setStatus('idle');
        return;
      }
      await refreshBlocks();
      setStatus('success');
      setMessage(`Vault initialized at ${path}`);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : String(error));
    }
  }

  async function handleOpenVault(): Promise<void> {
    setStatus('loading');
    setMessage('');
    try {
      const path = await openVaultWithPicker();
      if (path === null) {
        setStatus('idle');
        return;
      }
      setSelectedId(null);
      setDrafts(reconcile({}));
      setPreviewHtml('');
      setBacklinks([]);
      setLinkPickerOpen(false);
      await refreshBlocks();
      setStatus('success');
      setMessage(`Vault opened at ${path}`);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : String(error));
    }
  }

  async function handleAddBlock(): Promise<void> {
    const name = blockName().trim();
    if (name.length === 0) {
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      await addBlock(name, '');
      setBlockName('');
      await refreshBlocks();
      setStatus('success');
      setMessage(`Block added: ${name}`);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : String(error));
    }
  }

  async function handleListBlocks(): Promise<void> {
    setStatus('loading');
    setMessage('');
    try {
      await refreshBlocks();
      setStatus('success');
      setMessage(`Found ${blocks().length} blocks`);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : String(error));
    }
  }

  async function handleSelect(blockId: string): Promise<void> {
    const block = blocks().find((b) => b.id === blockId);
    if (block === undefined) {
      return;
    }
    ensureDraft(block);
    setSelectedId(block.id);
    setLinkPickerOpen(false);
    setMessage('');

    try {
      if (mode() === 'preview') {
        setStatus('loading');
        await refreshPreview();
        setStatus('idle');
      }
      await refreshBacklinks(block.id, blocks());
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : String(error));
    }
  }

  async function handleModeChange(next: EditorMode): Promise<void> {
    if (next === 'edit') {
      setMode('edit');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const html = await previewBlockContent(draft());
      setPreviewHtml(html);
      setMode('preview');
      setStatus('idle');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : String(error));
    }
  }

  async function handleSave(): Promise<void> {
    const id = selectedId();
    if (id === null) {
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      await saveBlockContent(id, draft());
      await refreshBlocks();
      setStatus('success');
      setMessage('Content saved');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <SidebarProvider class="min-h-svh">
      <BlockSidebar
        blocks={blocks}
        selectedId={selectedId}
        blockName={blockName}
        busy={busy}
        onBlockNameChange={setBlockName}
        onCreateBlock={handleAddBlock}
        onSelect={handleSelect}
      />
      <SidebarInset class="flex min-h-svh flex-1 flex-col overflow-hidden">
        <AppMenubar
          busy={busy}
          canSave={() => selectedId() !== null}
          mode={mode}
          statusMessage={message}
          statusKind={status}
          onInitVault={handleInitVault}
          onOpenVault={handleOpenVault}
          onRefreshBlocks={handleListBlocks}
          onInsertLink={() => setLinkPickerOpen(true)}
          onModeChange={handleModeChange}
          onSave={handleSave}
        />
        <WritingSpace
          selectedId={selectedId}
          blocks={blocks}
          draft={draft}
          mode={mode}
          previewHtml={previewHtml}
          busy={busy}
          linkPickerOpen={linkPickerOpen}
          onLinkPickerOpenChange={setLinkPickerOpen}
          onNavigateBlock={handleSelect}
          onDraftChange={(value) => {
            const id = selectedId();
            if (id === null) {
              return;
            }
            setDrafts(id, value);
            if (status() !== 'loading' && message() !== '') {
              setMessage('');
              setStatus('idle');
            }
          }}
        />
        <BacklinksPanel
          visible={() => selectedId() !== null}
          backlinks={backlinks}
          busy={busy}
          onSelect={handleSelect}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
