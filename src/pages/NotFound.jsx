// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import './NotFound.css';

export const NotFound = () => {
  return (
    <div className="not-found-page">
      {/* Partículas decorativas */}
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>

      <div className="not-found-content">
        <div className="not-found-icon">🔍</div>
        <h1>404</h1>
        <h2>Página no encontrada</h2>
        <p>
          El distribuidor que buscas no existe o ha sido desactivado. 
          Verifica que la URL sea correcta.
        </p>
      </div>
    </div>
  );
};