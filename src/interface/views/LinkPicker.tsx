import type { Block } from '@domain';
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';
import { Button } from '@interface/components/ui/button';
import { Input } from '@interface/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@interface/components/ui/sheet';

export interface LinkPickerProps {
  open: () => boolean;
  query: () => string;
  candidates: () => Block[];
  /** Other blocks exist but none match the filter (vs vault only has this block). */
  hasLinkableBlocks: () => boolean;
  busy: () => boolean;
  onOpenChange: (open: boolean) => void;
  onQueryChange: (query: string) => void;
  onSelect: (blockId: string) => void;
}

/**
 * Choose a target block for a `[text](block:uuid)` link.
 * Dumb: accessors + callbacks only.
 */
export function LinkPicker(props: LinkPickerProps): JSX.Element {
  return (
    <Sheet
      open={props.open()}
      onOpenChange={(open) => props.onOpenChange(open)}
    >
      <SheetContent side="right" class="flex w-full flex-col sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Link to block</SheetTitle>
          <SheetDescription>
            Insert a block reference at the current selection.
          </SheetDescription>
        </SheetHeader>
        <div class="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4">
          <Input
            type="search"
            placeholder="Filter by name…"
            value={props.query()}
            disabled={props.busy()}
            autofocus
            onInput={(e) => props.onQueryChange(e.currentTarget.value)}
          />
          <div class="min-h-0 flex-1 overflow-auto">
            <Show
              when={props.candidates().length > 0}
              fallback={
                <p class="text-muted-foreground text-sm">
                  {props.hasLinkableBlocks()
                    ? 'No matching blocks.'
                    : 'Create another block first — you need a target to link to.'}
                </p>
              }
            >
              <ul class="flex flex-col gap-1">
                <For each={props.candidates()}>
                  {(block) => (
                    <li>
                      <Button
                        variant="ghost"
                        class="h-auto w-full justify-start px-2 py-2 text-left font-normal"
                        disabled={props.busy()}
                        onClick={() => props.onSelect(block.id)}
                      >
                        {block.name}
                      </Button>
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
