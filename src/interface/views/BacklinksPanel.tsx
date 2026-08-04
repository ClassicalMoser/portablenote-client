import type { Block } from '@domain';
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';
import { Button } from '@interface/components/ui/button';

export interface BacklinksPanelProps {
  /** False when no block is open — panel stays muted/empty. */
  visible: () => boolean;
  backlinks: () => Block[];
  busy: () => boolean;
  onSelect: (blockId: string) => void;
}

/**
 * Incoming graph edges for the open block (spec §3 / core backlinks).
 * Dumb: accessors + callbacks only.
 */
export function BacklinksPanel(props: BacklinksPanelProps): JSX.Element {
  return (
    <Show when={props.visible()}>
      <aside class="border-sidebar-border bg-sidebar shrink-0 border-t px-4 py-3 md:px-6">
        <p class="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
          Backlinks
        </p>
        <Show
          when={props.backlinks().length > 0}
          fallback={
            <p class="text-muted-foreground text-sm">No incoming links.</p>
          }
        >
          <ul class="flex flex-wrap gap-2">
            <For each={props.backlinks()}>
              {(block) => (
                <li>
                  <Button
                    variant="outline"
                    size="sm"
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
      </aside>
    </Show>
  );
}
