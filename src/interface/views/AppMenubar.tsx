import type { JSX } from 'solid-js';
import { Show } from 'solid-js';
import { Button } from '@interface/components/ui/button';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  MenubarSeparator,
  MenubarTrigger,
} from '@interface/components/ui/menubar';
import { SidebarTrigger } from '@interface/components/ui/sidebar';
import type { EditorMode } from '@interface/views';

export interface AppMenubarProps {
  busy: () => boolean;
  canSave: () => boolean;
  mode: () => EditorMode;
  statusMessage: () => string;
  statusKind: () => 'idle' | 'loading' | 'success' | 'error';
  onInitVault: () => void;
  onOpenVault: () => void;
  onRefreshBlocks: () => void;
  onInsertLink: () => void;
  onModeChange: (mode: EditorMode) => void;
  onSave: () => void;
}

/**
 * App chrome toolbar: vault menu, block actions, edit/preview toggle.
 * Not a classic three-menu menubar — only Vault needs a menu.
 */
export function AppMenubar(props: AppMenubarProps): JSX.Element {
  const canEditBlock = () => !props.busy() && props.canSave();
  const canLink = () => canEditBlock() && props.mode() === 'edit';

  return (
    <header class="border-sidebar-border bg-sidebar flex h-12 shrink-0 items-center gap-2 border-b px-2">
      <SidebarTrigger class="size-8" />
      <span class="text-sm font-semibold tracking-tight">Portable Note</span>

      <Menubar class="border-0 bg-transparent p-0 shadow-none">
        <MenubarMenu>
          <MenubarTrigger disabled={props.busy()}>Vault</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem
                disabled={props.busy()}
                onSelect={() => props.onInitVault()}
              >
                Init vault…
              </MenubarItem>
              <MenubarItem
                disabled={props.busy()}
                onSelect={() => props.onOpenVault()}
              >
                Open vault…
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem
                disabled={props.busy()}
                onSelect={() => props.onRefreshBlocks()}
              >
                Refresh blocks
              </MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>

      <div class="bg-border mx-1 hidden h-5 w-px sm:block" aria-hidden="true" />

      <Button
        variant="outline"
        size="sm"
        disabled={!canEditBlock()}
        onClick={() => props.onSave()}
      >
        Save
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={!canLink()}
        onClick={() => props.onInsertLink()}
      >
        Link
      </Button>

      <div class="bg-border mx-1 hidden h-5 w-px sm:block" aria-hidden="true" />

      <fieldset
        class="m-0 inline-flex items-center rounded-md border p-0"
        disabled={!canEditBlock()}
      >
        <legend class="sr-only">Editor mode</legend>
        <Button
          variant={props.mode() === 'edit' ? 'secondary' : 'ghost'}
          size="sm"
          class="rounded-r-none border-0"
          aria-pressed={props.mode() === 'edit'}
          onClick={() => props.onModeChange('edit')}
        >
          Edit
        </Button>
        <Button
          variant={props.mode() === 'preview' ? 'secondary' : 'ghost'}
          size="sm"
          class="rounded-l-none border-0"
          aria-pressed={props.mode() === 'preview'}
          onClick={() => props.onModeChange('preview')}
        >
          Preview
        </Button>
      </fieldset>

      <Show when={props.statusMessage()}>
        <p
          class={
            props.statusKind() === 'error'
              ? 'text-destructive ml-auto truncate text-sm'
              : 'text-muted-foreground ml-auto truncate text-sm'
          }
        >
          {props.statusMessage()}
        </p>
      </Show>
    </header>
  );
}
