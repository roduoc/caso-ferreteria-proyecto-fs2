import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
//activa react router
//react router agrega navegacion entre paginas a react
//sin react router la app mostraria siempre lo mismo sin importar la url
//se encarga de leer la url y cambiar de pagina
import { HashRouter } from 'react-router-dom';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);