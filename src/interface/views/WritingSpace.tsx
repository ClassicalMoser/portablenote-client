import type { Block } from '@domain';
import {
  filterLinkTargets,
  insertBlockLink,
  parseBlockRefTargetId,
} from '@application';
import type { JSX } from 'solid-js';
import { createEffect, createSignal, onCleanup, Show } from 'solid-js';
import { LinkPicker } from './LinkPicker';

export type EditorMode = 'edit' | 'preview';

export interface WritingSpaceProps {
  selectedId: () => string | null;
  blocks: () => Block[];
  draft: () => string;
  mode: () => EditorMode;
  previewHtml: () => string;
  busy: () => boolean;
  linkPickerOpen: () => boolean;
  onDraftChange: (value: string) => void;
  onLinkPickerOpenChange: (open: boolean) => void;
  onNavigateBlock: (blockId: string) => void;
}

/**
 * Primary writing surface: edit markdown or read sanitized preview.
 * Dumb: accessors + callbacks only. Background is the app canvas, not a field.
 * Link insert uses application helpers; edge creation happens on save (core).
 */
export function WritingSpace(props: WritingSpaceProps): JSX.Element {
  let textareaRef: HTMLTextAreaElement | undefined;
  const [linkQuery, setLinkQuery] = createSignal('');
  const [savedSelection, setSavedSelection] = createSignal({
    start: 0,
    end: 0,
  });

  // Capture caret/selection when the picker opens (menubar or sheet).
  createEffect(() => {
    if (!props.linkPickerOpen()) {
      return;
    }
    const el = textareaRef;
    const fallback = props.draft().length;
    setSavedSelection({
      start: el?.selectionStart ?? fallback,
      end: el?.selectionEnd ?? fallback,
    });
    setLinkQuery('');
  });

  function candidates(): Block[] {
    return filterLinkTargets(props.blocks(), linkQuery(), props.selectedId());
  }

  function hasLinkableBlocks(): boolean {
    return filterLinkTargets(props.blocks(), '', props.selectedId()).length > 0;
  }

  function handleLinkSelect(blockId: string): void {
    const target = props.blocks().find((block) => block.id === blockId);
    if (target === undefined) {
      return;
    }
    const selection = savedSelection();
    const result = insertBlockLink(
      props.draft(),
      selection.start,
      selection.end,
      { id: target.id, name: target.name },
    );
    props.onDraftChange(result.markdown);
    props.onLinkPickerOpenChange(false);
    queueMicrotask(() => {
      const el = textareaRef;
      if (el === undefined) {
        return;
      }
      el.focus();
      el.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  function handlePreviewClick(event: MouseEvent): void {
    const eventTarget = event.target;
    if (!(eventTarget instanceof Element)) {
      return;
    }
    const anchor = eventTarget.closest('a.block-ref');
    if (!(anchor instanceof HTMLAnchorElement)) {
      return;
    }
    event.preventDefault();
    const href = anchor.getAttribute('href') ?? '';
    const targetId = parseBlockRefTargetId(href);
    if (targetId !== null) {
      props.onNavigateBlock(targetId);
    }
  }

  const [previewEl, setPreviewEl] = createSignal<HTMLDivElement | null>(null);

  // DOM listener (not JSX) so preview stays a non-interactive region for a11y.
  createEffect(() => {
    const el = previewEl();
    if (el === null) {
      return;
    }
    el.addEventListener('click', handlePreviewClick);
    onCleanup(() => {
      el.removeEventListener('click', handlePreviewClick);
    });
  });

  return (
    <section class="bg-background flex min-h-0 flex-1 flex-col">
      <Show
        when={props.selectedId() !== null}
        fallback={
          <div class="text-muted-foreground flex flex-1 items-center justify-center px-8 text-center text-sm">
            Select a block from the sidebar, or create one to start writing.
          </div>
        }
      >
        <Show
          when={props.mode() === 'edit'}
          fallback={
            <div
              ref={(el) => setPreviewEl(el)}
              class="md-preview prose prose-sm dark:prose-invert min-h-0 w-full max-w-none flex-1 overflow-auto px-6 py-6 md:px-10 md:py-8 [&_a.block-ref]:text-primary [&_a.block-ref]:no-underline hover:[&_a.block-ref]:underline"
              // Preview HTML is codec-sanitized (rehype-sanitize).
              // oxlint-disable-next-line solid/no-innerhtml -- trusted preview projection
              innerHTML={props.previewHtml()}
            />
          }
        >
          {/*
            Plain textarea — not the zaidan Textarea primitive. The writing
            canvas should share the page background with no field chrome/ring.
          */}
          <textarea
            ref={(el) => {
              textareaRef = el;
            }}
            id="block-content"
            class="text-foreground placeholder:text-muted-foreground field-sizing-content min-h-0 w-full flex-1 resize-none border-0 bg-transparent px-6 py-6 font-mono text-sm shadow-none outline-none focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:px-10 md:py-8"
            value={props.draft()}
            disabled={props.busy()}
            placeholder="Start writing…"
            onInput={(e) => props.onDraftChange(e.currentTarget.value)}
          />
        </Show>
      </Show>

      <LinkPicker
        open={props.linkPickerOpen}
        query={linkQuery}
        candidates={candidates}
        hasLinkableBlocks={hasLinkableBlocks}
        busy={props.busy}
        onOpenChange={props.onLinkPickerOpenChange}
        onQueryChange={setLinkQuery}
        onSelect={handleLinkSelect}
      />
    </section>
  );
}
