import { render } from 'solid-js/web';
import { App } from '@interface';
/* @refresh reload */
import '@composition';
import './index.css';

const root = document.querySelector('#root');

if (root === null) {
  throw new Error('Root element #root not found');
}

render(() => <App />, root);
