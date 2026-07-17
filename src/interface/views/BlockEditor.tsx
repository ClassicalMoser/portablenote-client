import type { Block } from '@domain';
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';
import { Button } from '@interface/components/ui/button';
import { Label } from '@interface/components/ui/label';
import { Textarea } from '@interface/components/ui/textarea';

export type EditorMode = 'edit' | 'preview';

export interface BlockEditorProps {
  blocks: () => Block[];
  selectedId: () => string | null;
  draft: () => string;
  mode: () => EditorMode;
  previewHtml: () => string;
  busy: () => boolean;
  statusMessage: () => string;
  statusKind: () => 'idle' | 'loading' | 'success' | 'error';
  onSelect: (blockId: string) => void;
  onDraftChange: (value: string) => void;
  onModeChange: (mode: EditorMode) => void | Promise<void>;
  onSave: () => void;
}

/**
 * Raw markdown editor + HTML preview for a selected block.
 * Dumb: accessors + callbacks only.
 */
export function BlockEditor(props: BlockEditorProps): JSX.Element {
  return (
    <section class="flex min-h-0 flex-1 flex-col gap-3">
      <Label class="text-sm font-medium">Blocks</Label>
      <Show
        when={props.blocks().length > 0}
        fallback={
          <p class="text-muted-foreground text-sm">
            Open a vault and create a block to edit content.
          </p>
        }
      >
        <ul class="border-border max-h-40 overflow-y-auto rounded-md border">
          <For each={props.blocks()}>
            {(block) => (
              <li>
                <button
                  type="button"
                  class="hover:bg-muted w-full px-3 py-2 text-left text-sm"
                  classList={{
                    'bg-muted font-medium': props.selectedId() === block.id,
                  }}
                  disabled={props.busy()}
                  onClick={() => props.onSelect(block.id)}
                >
                  {block.name}
                </button>
              </li>
            )}
          </For>
        </ul>
      </Show>

      <Show when={props.selectedId() !== null}>
        <div class="flex min-h-0 flex-1 flex-col gap-2">
          <div class="flex items-center justify-between gap-2">
            <Label for="block-content" class="text-sm font-medium">
              Content
            </Label>
            <div class="flex gap-1">
              <Button
                size="sm"
                variant={props.mode() === 'edit' ? 'default' : 'outline'}
                disabled={props.busy()}
                onClick={() => props.onModeChange('edit')}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant={props.mode() === 'preview' ? 'default' : 'outline'}
                disabled={props.busy()}
                onClick={() => props.onModeChange('preview')}
              >
                Preview
              </Button>
            </div>
          </div>

          <Show
            when={props.mode() === 'edit'}
            fallback={
              <div
                class="border-input md-preview prose prose-sm prose-invert bg-background max-w-none min-h-48 flex-1 overflow-auto rounded-md border px-3 py-2 [&_a.block-ref]:text-primary [&_a.block-ref]:no-underline hover:[&_a.block-ref]:underline"
                // Preview HTML is codec-sanitized (rehype-sanitize).
                // oxlint-disable-next-line solid/no-innerhtml -- trusted preview projection
                innerHTML={props.previewHtml()}
              />
            }
          >
            <Textarea
              id="block-content"
              class="border-input bg-background min-h-48 flex-1 rounded-md border px-3 py-2 font-mono text-sm"
              value={props.draft()}
              disabled={props.busy()}
              placeholder="Block body — no headings outside fenced code"
              onInput={(e) => props.onDraftChange(e.currentTarget.value)}
            />
          </Show>

          <div class="flex items-center gap-2">
            <Button onClick={() => props.onSave()} disabled={props.busy()}>
              Save content
            </Button>
            <Show when={props.statusMessage()}>
              <p
                class={
                  props.statusKind() === 'error'
                    ? 'text-destructive text-sm'
                    : 'text-muted-foreground text-sm'
                }
              >
                {props.statusMessage()}
              </p>
            </Show>
          </div>
        </div>
      </Show>
    </section>
  );
}
