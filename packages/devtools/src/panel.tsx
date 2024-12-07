import './style.css';
import { createRoot } from 'react-dom/client';
import { Inspector } from './components/Inspector';
import { createStore, StoreProvider } from 'rippling';

const main = document.createElement('div');
main.id = 'main';
document.body.appendChild(main);
const store = createStore();
const root = createRoot(main);
root.render(
  <StoreProvider value={store}>
    <Inspector />
  </StoreProvider>,
);
