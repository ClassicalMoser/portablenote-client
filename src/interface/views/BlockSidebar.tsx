import type { Block } from '@domain';
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';
import { Button } from '@interface/components/ui/button';
import { Input } from '@interface/components/ui/input';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@interface/components/ui/sidebar';

export interface BlockSidebarProps {
  blocks: () => Block[];
  selectedId: () => string | null;
  blockName: () => string;
  busy: () => boolean;
  onBlockNameChange: (value: string) => void;
  onCreateBlock: () => void;
  onSelect: (blockId: string) => void;
}

export function BlockSidebar(props: BlockSidebarProps): JSX.Element {
  const sidebar = useSidebar();

  function selectBlock(blockId: string): void {
    props.onSelect(blockId);
    if (sidebar.isMobile()) {
      sidebar.setOpenMobile(false);
    }
  }

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader class="gap-1 px-3 py-3">
        <p class="text-sidebar-foreground text-sm font-medium">Blocks</p>
        <p class="text-muted-foreground text-xs">Browse and open notes</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <Show
              when={props.blocks().length > 0}
              fallback={
                <p class="text-muted-foreground px-2 text-sm">
                  Open a vault and create a block to get started.
                </p>
              }
            >
              <SidebarMenu>
                <For each={props.blocks()}>
                  {(block) => (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={props.selectedId() === block.id}
                        disabled={props.busy()}
                        onClick={() => selectBlock(block.id)}
                      >
                        <span>{block.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </For>
              </SidebarMenu>
            </Show>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter class="gap-2">
        <Input
          type="text"
          placeholder="New block name"
          value={props.blockName()}
          disabled={props.busy()}
          onInput={(e) => props.onBlockNameChange(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              props.onCreateBlock();
            }
          }}
        />
        <Button
          size="sm"
          disabled={props.busy() || props.blockName().trim().length === 0}
          onClick={props.onCreateBlock}
        >
          Create block
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
