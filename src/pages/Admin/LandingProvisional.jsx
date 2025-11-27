// src/pages/LandingProvisional/LandingProvisional.jsx
import { useNavigate } from 'react-router-dom';
import './LandingProvisional.css';

export const LandingProvisional = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-provisional">
      {/* Hero Section */}
      <section className="hero-section-provisional">
        <div className="hero-content-provisional">
          <div className="hero-badge">💰 Nuevo</div>
          <h1 className="hero-title">
            ¡GANA DINERO<br />
            <span className="highlight">SOLO POR COMPARTIR</span><br />
            Simplia
          </h1>
          <h2 className="hero-subtitle">CON TUS AMIGOS!</h2>
          
          <p className="hero-description">
            Recomienda Simplia y recibe recompensas<br />
            cada vez que alguien se registra o activa un plan.
          </p>

          <button className="btn-hero" onClick={() => navigate('/distribuidor/login')}>
            🚀 Empieza a ganar ahora
          </button>
        </div>

        <div className="social-icons">
          <div className="social-icon">📱 TikTok</div>
          <div className="social-icon">📸 Instagram</div>
          <div className="social-icon">📘 Facebook</div>
          <div className="social-icon">💬 WhatsApp</div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <h2 className="section-title">¿Qué ganas solo por registrarte?</h2>
        
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">🎁</div>
            <h3>Bono de bienvenida</h3>
            <p>Obtén un bono de bienvenida solo por crear tu cuenta en el sistema de referidos.</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">💰</div>
            <h3>Panel de ganancias</h3>
            <p>Accede a un panel donde podrás ver tus ganancias, referidos y contenido para compartir.</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">🎉</div>
            <h3>Obsequios mensuales</h3>
            <p>Recibe obsequios sorpresa cada mes sólo por estar activo en la red.</p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-it-works-section">
        <h2 className="section-title">¿Qué ganas por compartir en redes sociales?</h2>
        
        <div className="how-it-works-content">
          <div className="how-it-works-text">
            <div className="step">
              <div className="step-number">1</div>
              <p>Cada vez que compartes tu enlace o código en redes, sumas puntos que puedes canjear por beneficios reales.</p>
            </div>

            <div className="step">
              <div className="step-icon">💸</div>
              <p>Si alguien entra por tu enlace, se registra o activa su plan, ganas comisiones automáticas.</p>
            </div>

            <div className="step">
              <div className="step-icon">📈</div>
              <p>Entre más compartas en tus estados, historias o grupos, más ganarás.</p>
            </div>
          </div>

          <div className="how-it-works-image">
            <div className="phone-mockup">
              <div className="phone-screen">
                <div className="profile-icon">👤</div>
                <p className="phone-text">¡Comparte y gana!</p>
              </div>
            </div>
          </div>
        </div>

        <h3 className="highlight-text">¡Estás ganando incluso sin vender!</h3>
      </section>

      {/* Earnings Section */}
      <section className="earnings-section">
        <h2 className="section-title">Genera MUY BUENOS ingresos</h2>
        <p className="section-subtitle">por solo subir historias y publicar en grupos</p>

        <div className="earnings-info">
          <p>🔥 Gana comisiones en efectivo por cada referido que active un plan</p>
          <p>💰 Acumula puntos por compartir tu enlace en redes</p>
          <p>🎁 Recibe bonos especiales por alcanzar metas mensuales</p>
        </div>
      </section>

      {/* Login Section */}
      <section className="login-section">
        <h2 className="section-title">¿Ya tienes cuenta?</h2>
        
        <div className="login-options">
          <button 
            className="btn-login-option btn-provider"
            onClick={() => navigate('/distribuidor/login')}
          >
            👤 Iniciar sesión como Proveedor
          </button>

          <button 
            className="btn-login-option btn-admin"
            onClick={() => navigate('/admin/login')}
          >
            🔐 Iniciar sesión como Admin
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-provisional">
        <p>© 2024 Simplia - Sistema de Referidos</p>
        <p>Todos los derechos reservados</p>
      </footer>
    </div>
  );
};