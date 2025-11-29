// GanaPorRegistrarte/GanaPorRegistrarte.jsx
import React from 'react';
import './GanaPorRegistrarte.css';
import izquierda from '../../../../landingPrincipal/elemente-flotante-1.png'
import derecha from '../../../../landingPrincipal/elemento-flotante-2.png'
import Title from '../../../../landingPrincipal/que-ganas-solo-por-registrarte.png'
import icon1 from '../../../../landingPrincipal/musica-y-podcast.png'
import icon2 from '../../../../landingPrincipal/series-y-peliculas.png'
import icon3 from '../../../../landingPrincipal/regalos-y-descuentos.png'
import icon4 from '../../../../landingPrincipal/y-mucho-mas.png'
import icon5 from '../../../../landingPrincipal/Logo-simplia.png'

const GanaPorRegistrarte = () => {
  return (
    <section className="gana-section" id="beneficios">
      {/* Elemento flotante izquierdo */}
      <div className="floating-element floating-left">
        <img 
          src={izquierda}
          alt="" 
          aria-hidden="true"
        />
      </div>

      {/* Elemento flotante derecho */}
      <div className="floating-element floating-right">
        <img 
          src={derecha} 
          alt="" 
          aria-hidden="true"
        />
      </div>

      <div className="gana-container">
        <div className="gana-content">
          
          {/* Título principal */}
          <div className="gana-title">
            <h2 className="sr-only">¿Qué ganas solo por registrarte?</h2>
            <img 
              src={Title}
              alt="¿Qué ganas solo por registrarte?"
              loading="lazy"
            />
          </div>
          {/* Iconos de servicios */}
          <div className="gana-services">
            <div className="service-item">
              <img 
                src={icon1}
                alt="Música y Podcasts"
                loading="lazy"
              />
            </div>
            <div className="service-item">
              <img 
                src={icon2}
                alt="Series y Películas"
                loading="lazy"
              />
            </div>
            <div className="service-item">
              <img 
                src={icon3}
                alt="Regalos y Descuentos"
                loading="lazy"
              />
            </div>
            <div className="service-item">
              <img 
                src={icon4}
                alt="Y mucho más"
                loading="lazy"
              />
            </div>
            <div className="service-item service-logo">
              <img 
                src={icon5}
                alt="Simplia"
                loading="lazy"
              />
            </div>
          </div>

          {/* Texto final con fondo cyan */}
          <p className="cta-highlight">
              Genera <span className="highlight-bold">MUY BUENOS ingresos</span>
            </p>
          <div className="gana-cta-text">        
            <p className="cta-description">
              por solo subir historias y publicar en grupos
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default GanaPorRegistrarte;