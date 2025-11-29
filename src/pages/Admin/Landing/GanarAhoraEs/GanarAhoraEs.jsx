// GanarAhoraEs/GanarAhoraEs.jsx
import React from 'react';
import './GanarAhoraEs.css';
import logoSimplia from '../../../../landingPrincipal/Logo-simplia.png';
import botonRegistro from '../../../../landingPrincipal/registrate-ahora.png';

const GanarAhoraEs = () => {
  
  const scrollToRegistro = () => {
    const registroSection = document.getElementById('registro');
    if (registroSection) {
      registroSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="ganar-ahora-section" id="ganar-ahora">
      <div className="ganar-ahora-container">
        
        {/* Título */}
        <div className="ganar-ahora-title">
          <h2>Ganar ahora es:</h2>
        </div>

        {/* Logo Simplia */}
        <div className="ganar-ahora-logo">
          <img 
            src={logoSimplia}
            alt="Simplia"
            loading="lazy"
          />
        </div>

        {/* Grid de beneficios */}
        <div className="beneficios-grid">
          <div className="beneficio-card">
            <p>Ingresos pasivos</p>
          </div>
          
          <div className="beneficio-card">
            <p>Sin jefes</p>
          </div>
          
          <div className="beneficio-card">
            <p>Sin horarios</p>
          </div>
          
          <div className="beneficio-card">
            <p>Todo a tu ritmo.</p>
          </div>
        </div>

        {/* Botón de registro */}
        <div className="ganar-ahora-cta">
          <button onClick={scrollToRegistro} className="btn-registro-ahora">
            <img 
              src={botonRegistro}
              alt="Regístrate ahora ¡PULSA AQUÍ!"
            />
          </button>
        </div>

      </div>
    </section>
  );
};

export default GanarAhoraEs;