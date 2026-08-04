import { RouterProvider } from '@tanstack/solid-router';
import { render } from 'solid-js/web';
import { router } from '@interface/router';
/* @refresh reload */
import { wireTauriInfrastructureToPorts } from '@composition';
import './index.css';

const root = document.querySelector('#root');

wireTauriInfrastructureToPorts();

if (root === null) {
  throw new Error('Root element #root not found');
}

render(() => <RouterProvider router={router} />, root);
