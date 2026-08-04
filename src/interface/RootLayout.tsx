import { Outlet } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';

export function RootLayout(): JSX.Element {
  return (
    <div class="bg-background text-foreground h-svh overflow-hidden">
      <Outlet />
    </div>
  );
}
