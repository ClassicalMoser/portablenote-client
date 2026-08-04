import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/solid-router';
import { App } from './App';
import { RootLayout } from './RootLayout';

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
});

const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
});

declare module '@tanstack/solid-router' {
  // Module augmentation for typed router APIs (`Link`, `navigate`, etc.).
  // oxlint-disable-next-line unused-imports/no-unused-vars -- ambient register interface
  interface Register {
    router: typeof router;
  }
}
