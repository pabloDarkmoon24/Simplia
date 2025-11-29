// Hero/Hero.jsx
import React from 'react';
import './Hero.css';
import img from '../../../../landingPrincipal/Gana-dinero-solo-por-compartir-simplia.png'
import separador from '../../../../landingPrincipal/separador.png'

const HeroLanding = () => {
  return (
    <section className="hero-section" id="inicio">
      <div className="hero-container">
        <div className="hero-content">
          {/* Imagen principal del hero */}
          <div className="hero-main-image">
            <img 
              src= {img}
              alt="Gana dinero solo por compartir Simplia con tus amigos"
              loading="eager"
            />
          </div>

          {/* Subtítulo */}
          <div className="hero-subtitle">
            <p>
              Recomienda Simplia y recibe recompensas cada vez que alguien se registra o activa un plan.
            </p>
          </div>

          {/* Call to Action Button */}
          <div className="hero-cta">
            <a 
              href="#registro" 
              className="hero-btn-primary"
              aria-label="Comenzar a ganar dinero con Simplia ahora"
            >
              Empieza a ganar ahora
            </a>
          </div>

          {/* Separador */}
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

export default HeroLanding;