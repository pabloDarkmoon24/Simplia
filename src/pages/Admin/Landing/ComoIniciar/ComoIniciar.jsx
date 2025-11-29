// ComoIniciar/ComoIniciar.jsx
import React from 'react';
import './ComoIniciar.css';
import titleImage from '../../../../landingPrincipal/estas-ganando-incluso-sin-vender.png';
import paso1 from '../../../../landingPrincipal/paso-1.png';
import paso2 from '../../../../landingPrincipal/paso-2.png';
import paso3 from '../../../../landingPrincipal/paso-3.png';
import paso4 from '../../../../landingPrincipal/paso-4.png';
import subtitle from '../../../../assets/Subrayador-titulos.png';
import separador from '../../../../landingPrincipal/separador.png'

const ComoIniciar = () => {
  return (
    <section className="como-iniciar-section" id="como-iniciar">
      
      {/* Parte superior con imagen de fondo */}
      <div className="como-iniciar-top">
        <div className="como-iniciar-container">
          {/* Título principal como imagen */}
          <div className="como-iniciar-title">
            <img 
              src={titleImage}
              alt="¡Estás ganando incluso sin vender!"
              loading="lazy"
            />
          </div>

        </div>
        
      </div>

      {/* Parte inferior con color sólido */}
      <div className="como-iniciar-bottom">
        <div className="como-iniciar-container">
                    {/* Subtítulo */}
          <div className="como-iniciar-subtitle">
            <h3>¿Cómo iniciar a ganar ingresos?</h3>
            <img src={subtitle} alt="subtitle-linea" />
          </div>

          {/* Grid de pasos */}
          <div className="pasos-grid">
            <div className="paso-card">
              <img 
                src={paso1}
                alt="Paso 1: Diligencia el formulario para registrarte"
                loading="lazy"
              />
            </div>

            <div className="paso-card">
              <img 
                src={paso2}
                alt="Paso 2: Esto te enviará a un chat de WhatsApp para brindarte el acceso a tu panel"
                loading="lazy"
              />
            </div>

            <div className="paso-card">
              <img 
                src={paso3}
                alt="Paso 3: Descarga el contenido publicitario junto con tu link de referido y publícalo en historias, grupos, redes"
                loading="lazy"
              />
            </div>

            <div className="paso-card">
              <img 
                src={paso4}
                alt="Paso 4: Y listo! cada vez que alguien adquiera un plan de Simplia con tu link, ganarás comisiones en automático"
                loading="lazy"
              />
            </div>
            
          </div>
        <div className="hero-separator">
                      <img 
                        src={separador}
                        alt="" 
                        aria-hidden="true"
                      />
            </div>

          
        </div>
      </div>

    </section>
  );
};

export default ComoIniciar;