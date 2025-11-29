// BonosExtras/BonosExtras.jsx
import React from 'react';
import './BonosExtras.css';
import item1 from '../../../../landingPrincipal/item.png';
import item2 from '../../../../landingPrincipal/participa-en-el-ranking.png';

const BonosExtras = () => {
  return (
    <section className="bonos-section" id="bonos">
      <div className="bonos-container">
        
        {/* Título */}
        <div className="bonos-title">
          <h2>
            Recibe <span className="highlight-bonos">BONOS EXTRAS</span> por constancia
          </h2>
        </div>

        {/* Items de bonos */}
        <div className="bonos-items">
          
          {/* Item 1 */}
          <div className="bono-item">
            <img 
              src={item1}
              alt="Cada semana hay retos: comparte en tus historias 3 días seguidos y recibe premios"
              loading="lazy"
            />
          </div>

          {/* Item 2 */}
          <div className="bono-item">
            <img 
              src={item2}
              alt="Participa en el ranking mensual de referidos y gana suscripciones, dinero o premios físicos"
              loading="lazy"
            />
          </div>

        </div>

      </div>
    </section>
  );
};

export default BonosExtras;