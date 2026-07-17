import type { Block } from '@domain';
import type { JSX } from 'solid-js';
import {
  addBlock,
  initVaultWithPicker,
  listBlocks,
  openVaultWithPicker,
  previewBlockContent,
  restoreSession,
  saveBlockContent,
} from '@application';
import { createSignal, onMount } from 'solid-js';
import { Button } from '@interface/components/ui/button';
import { BlockEditor } from '@interface/views';
import type { EditorMode } from '@interface/views';

function StatusMessage(props: {
  status: () => 'idle' | 'loading' | 'success' | 'error';
  message: () => string;
}): JSX.Element {
  return (
    <>
      {props.message() && (
        <p
          class={
            props.status() === 'error'
              ? 'text-destructive text-sm'
              : 'text-muted-foreground text-sm'
          }
        >
          {props.message()}
        </p>
      )}
    </>
  );
}

export function App(): JSX.Element {
  const [status, setStatus] = createSignal<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = createSignal('');
  const [blockName, setBlockName] = createSignal('');
  const [blocks, setBlocks] = createSignal<Block[]>([]);
  const [selectedId, setSelectedId] = createSignal<string | null>(null);
  const [draft, setDraft] = createSignal('');
  const [mode, setMode] = createSignal<EditorMode>('edit');
  const [previewHtml, setPreviewHtml] = createSignal('');

  const busy = () => status() === 'loading';

  async function refreshBlocks(): Promise<void> {
    const next = await listBlocks();
    setBlocks(next);
    const id = selectedId();
    if (id !== null) {
      const stillThere = next.find((b) => b.id === id);
      if (stillThere === undefined) {
        setSelectedId(null);
        setDraft('');
        setPreviewHtml('');
        setMode('edit');
      } else {
        setDraft(stillThere.content);
      }
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
      setDraft('');
      setPreviewHtml('');
      setMode('edit');
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

  function handleSelect(blockId: string): void {
    const block = blocks().find((b) => b.id === blockId);
    if (block === undefined) {
      return;
    }
    setSelectedId(block.id);
    setDraft(block.content);
    setPreviewHtml('');
    setMode('edit');
    setMessage('');
    setStatus('idle');
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
    <main class="mx-auto flex min-h-svh max-w-2xl flex-col gap-6 p-8">
      <h1 class="text-2xl font-semibold tracking-tight">Portable Note</h1>
      <div class="flex flex-col gap-3">
        <Button onClick={handleInitVault} disabled={busy()}>
          {busy() ? 'Working…' : 'Init vault…'}
        </Button>
        <StatusMessage status={status} message={message} />
        <Button variant="outline" onClick={handleOpenVault} disabled={busy()}>
          Open vault
        </Button>
        <Button
          variant="secondary"
          onClick={handleListBlocks}
          disabled={busy()}
        >
          Refresh blocks
        </Button>
        <div class="flex gap-2">
          <input
            class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:outline-none"
            type="text"
            placeholder="Block name"
            value={blockName()}
            onInput={(e) => setBlockName(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddBlock()}
          />
          <Button onClick={handleAddBlock} disabled={busy()}>
            Create
          </Button>
        </div>
      </div>

      <BlockEditor
        blocks={blocks}
        selectedId={selectedId}
        draft={draft}
        mode={mode}
        previewHtml={previewHtml}
        busy={busy}
        statusMessage={message}
        statusKind={status}
        onSelect={handleSelect}
        onDraftChange={(value) => {
          setDraft(value);
          if (status() !== 'loading' && message() !== '') {
            setMessage('');
            setStatus('idle');
          }
        }}
        onModeChange={handleModeChange}
        onSave={handleSave}
      />
    </main>
  );
}
