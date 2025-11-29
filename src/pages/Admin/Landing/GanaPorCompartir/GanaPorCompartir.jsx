// GanaPorCompartir/GanaPorCompartir.jsx
import React from 'react';
import './GanaPorCompartir.css';
import compartirImage from '../../../../landingPrincipal/que-ganas-por-compartir-en-redes-sociales.png';

const GanaPorCompartir = () => {
  return (
    <section className="compartir-section" id="compartir">
      <div className="compartir-container">
        <div className="compartir-content">
          
          {/* Imagen principal completa */}
          <div className="compartir-image">
            <h2 className="sr-only">¿Qué ganas por compartir en redes sociales?</h2>
            <img 
              src={compartirImage}
              alt="Qué ganas por compartir en redes sociales - Gana puntos, comisiones automáticas y más beneficios"
              loading="lazy"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default GanaPorCompartir;