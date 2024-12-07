import './style.css';
import { createRoot } from 'react-dom/client';
import { StoreInspector } from './StoreInspector';

const main = document.createElement('div');
main.id = 'main';
document.body.appendChild(main);

const root = createRoot(main);
root.render(<StoreInspector />);
