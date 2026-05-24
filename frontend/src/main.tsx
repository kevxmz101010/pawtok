import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

/**
 * Punto de Entrada de React (main.tsx)
 * Este es el archivo que Vite (tu herramienta de construcción) busca primero.
 * Su único trabajo es tomar el componente principal (`App`) e inyectarlo en el HTML (`index.html`).
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
