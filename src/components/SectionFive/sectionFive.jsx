import React, { useState, useEffect } from "react";
import '../SectionFive/sectionFive.css'

import btn1 from '../../assets/boton-lo-quiero-verde.png';
import btn2 from '../../assets/boton-lo-quiero-morado.png';
import subtitle from '../../assets/Subrayador-titulos.png';

import essencial from '../../assets/Plan-simplia-esencial.png';
import conectado from '../../assets/Plan-simplia-conectado.png';
import total from '../../assets/Plan-simplia-total.png';

// Botón de cuentas completas
import botonCuentasCompletas from '../../assets/boton-cuentas-completas.png';

// Botón de obsequios
import botonObsequios from '../../assets/boton-obsequios.png';

// Imágenes de popup
import popupObsequioConectado from '../../assets/popup-obsequio-conectado.png';
import popupObsequioEsencial from '../../assets/popup-obsequio-esencial.png';
import popupObsequioTotal from '../../assets/popup-obsequio-total.png';

// IMPORTANTE: Importar el formulario de contacto
import { FormularioContacto } from "../WhatsAppButton/FormularioContacto";

export const SectionFive = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showPopup, setShowPopup] = useState(false);
  const [popupImage, setPopupImage] = useState(null);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // NUEVO: Estado para controlar el formulario
  const [showFormulario, setShowFormulario] = useState(false);
  const [planPreseleccionado, setPlanPreseleccionado] = useState('');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (showPopup) closePopup();
        if (showInfoPopup) closeInfoPopup();
        if (showFormulario) setShowFormulario(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [showPopup, showInfoPopup, showFormulario]);

  // Información de los planes
  const planInfo = {
    esencial: {
      title: "📦 Plan Esencial\nPANTALLAS",
      subtitle: "Disfruta de tus plataformas favoritas con un plan diseñado para uso personal, sin compartir y sin complicaciones.",
      sections: [
        {
          title: "🎬 Netflix – Plan Básico",
          items: [
            "✔ Cuenta propia (no compartida)",
            "✔ Incluye correo y contraseña",
            "✔ Disponible para uso en Colombia"
          ]
        },
        {
          title: "🧡 Disney+ Premium",
          items: [
            "✔ Acceso premium mediante activación por enlace",
            "✔ Exclusivo para Smart TV que generen código de activación",
            "❗ No funciona en dispositivos sin opción de ingresar código"
          ]
        },
        {
          title: "🎁 Bonos y Obsequios Incluidos",
          subtitle: "Con tu Plan Esencial recibes acceso gratuito por 1 mes a:",
          items: [
            "Canva",
            "Crunchyroll",
            "Deezer",
            "Canales deportivos seleccionados",
            "Luego del primer mes, cada plataforma tiene un costo de solo $2.000 COP."
          ]
        }
      ]
    },

    conectado: {
      title: "📦 Plan Conectado\nPANTALLAS",
      subtitle: "Disfruta de tus plataformas favoritas con un plan diseñado para uso personal, sin compartir y sin complicaciones.",
      sections: [
        {
          title: "🎬 Netflix – Plan Básico",
          items: [
            "✔ Cuenta propia (no compartida)",
            "✔ Incluye correo y contraseña",
            "✔ Funciona en Colombia"
          ]
        },
        {
          title: "🧡 Disney+ Premium PANTALLAS",
          items: [
            "✔ Acceso premium mediante activación por enlace",
            "✔ Compatible únicamente con Smart TV que generen código de activación",
            "❗ No funciona en dispositivos que no permitan ingresar código"
          ]
        },
        {
          title: "🔵 Prime Video",
          items: [
            "✔ Activación mediante enlace",
            "✔ Solo compatible con Smart TV que generen código",
            "❗ No disponible para dispositivos sin ingreso por código"
          ]
        },
        {
          title: "🎁 Bonos y Obsequios Incluidos",
          subtitle: "Con tu Plan Conectado recibes acceso gratuito por 2 meses a:",
          items: [
            "Canva",
            "Crunchyroll",
            "Deezer",
            "Canales deportivos seleccionados",
            "Luego del segundo mes, cada plataforma tiene un costo de solo $2.000 COP."
          ]
        }
      ]
    },

    total: {
      title: "📦 Plan Total\nPANTALLAS",
      subtitle: "Disfruta de todas tus plataformas favoritas con un plan completo, personal y sin compartir.",
      sections: [
        {
          title: "🎬 Netflix – Plan Básico",
          items: [
            "✔ Cuenta propia (no compartida)",
            "✔ Incluye correo y contraseña",
            "✔ Funciona en Colombia"
          ]
        },
        {
          title: "🧡 Disney+ Premium",
          items: [
            "✔ Acceso premium mediante activación por enlace",
            "✔ Compatible únicamente con Smart TV que generen código de activación",
            "❗ No funciona en dispositivos que no permitan ingresar código",
            "📺 Incluye 1 pantalla"
          ]
        },
        {
          title: "🔵 Prime Video",
          items: [
            "✔ Activación mediante enlace",
            "✔ Solo compatible con Smart TV que generen código",
            "❗ No disponible en dispositivos sin ingreso por código",
            "📺 Incluye 1 pantalla"
          ]
        },
        {
          title: "💜 Max",
          items: [
            "✔ Activación mediante enlace",
            "✔ Solo compatible con Smart TV que generen código",
            "❗ No disponible en dispositivos sin ingreso por código",
            "📺 Incluye 1 pantalla"
          ]
        },
        {
          title: "🟣 Paramount+",
          items: [
            "✔ Se entrega usuario y contraseña",
            "📺 Incluye 1 pantalla"
          ]
        },
        {
          title: "🎁 Bonos y Obsequios Incluidos",
          subtitle: "Con tu Plan Total recibes acceso gratuito por 3 meses a:",
          items: [
            "Canva",
            "Crunchyroll",
            "Deezer",
            "Canales deportivos seleccionados",
            "Luego del tercer mes, cada plataforma tiene un costo de solo $2.000 COP."
          ]
        }
      ]
    }
  };

  // Funciones para manejar los clicks de "conocer más"
  const handleConocerMasConectado = () => {
    setSelectedPlan(planInfo.esencial);
    setShowInfoPopup(true);
  };

  const handleConocerMasEsencial = () => {
    setSelectedPlan(planInfo.conectado);
    setShowInfoPopup(true);
  };

  const handleConocerMasTotal = () => {
    setSelectedPlan(planInfo.total);
    setShowInfoPopup(true);
  };

  const handleCuentasCompletas = () => {
    window.open('https://forms.gle/JKk6RM1AByfaQWAb8', '_blank');
  };

  // NUEVAS FUNCIONES: Abrir formulario con plan preseleccionado
  const handleLoQuieroEsencial = () => {
    setPlanPreseleccionado('Plan Esencial 🎬');
    setShowFormulario(true);
  };

  const handleLoQuieroConectado = () => {
    setPlanPreseleccionado('Plan Conectado 📱');
    setShowFormulario(true);
  };

  const handleLoQuieroTotal = () => {
    setPlanPreseleccionado('Plan Total 🌟');
    setShowFormulario(true);
  };

  // Funciones para abrir popup con la imagen de obsequios
  const handleObsequiosConectado = () => {
    setPopupImage(popupObsequioConectado);
    setShowPopup(true);
  };

  const handleObsequiosEsencial = () => {
    setPopupImage(popupObsequioEsencial);
    setShowPopup(true);
  };

  const handleObsequiosTotal = () => {
    setPopupImage(popupObsequioTotal);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupImage(null);
  };

  const closeInfoPopup = () => {
    setShowInfoPopup(false);
    setSelectedPlan(null);
  };

  return (
    <section className="section-five" id="membresias">
      <h2 className="section-title">Membresias</h2>
      <img src={subtitle} alt="subtitle-linea" />
      
      <div className="plans-container">
        {/* Plan Esencial (primero - izquierda) */}
        <div className="plan-card">
          <img src={conectado} alt="essencial" className="plan-image" />
          <span className="conocer-mas-link" onClick={handleConocerMasConectado}>
            *Conocer más*
          </span>
          <button className="plan-button" onClick={handleLoQuieroEsencial}>
            <img src={btn2} alt="boton morado" />
          </button>
          <button className="obsequios-button" onClick={handleObsequiosConectado}>
            <img src={botonObsequios} alt="Obsequios" />
          </button>
        </div>

        {/* Plan Conectado (segundo - centro) */}
        <div className="plan-card">
          <img src={essencial} alt="conectado" className="plan-image" />
          <span className="conocer-mas-link" onClick={handleConocerMasEsencial}>
            *Conocer más*
          </span>
          <button className="plan-button" onClick={handleLoQuieroConectado}>
            <img src={btn1} alt="boton verde" />
          </button>
          <button className="obsequios-button" onClick={handleObsequiosEsencial}>
            <img src={botonObsequios} alt="Obsequios" />
          </button>
        </div>

        {/* Plan Total (tercero - derecha) */}
        <div className="plan-card">
          <img src={total} alt="total" className="plan-image" />
          <span className="conocer-mas-link" onClick={handleConocerMasTotal}>
            *Conocer más*
          </span>
          <button className="plan-button" onClick={handleLoQuieroTotal}>
            <img src={btn2} alt="boton morado" />
          </button>
          <button className="obsequios-button" onClick={handleObsequiosTotal}>
            <img src={botonObsequios} alt="Obsequios" />
          </button>
        </div>
      </div>

      {/* Sección: Cuentas Completas */}
      <div className="cuentas-completas-section">
        <h3 className="cuentas-completas-title">
          ¿Estás interesado en Adquirir <br /> Cuentas completas?
        </h3>
        <button className="cuentas-completas-button" onClick={handleCuentasCompletas}>
          <img src={botonCuentasCompletas} alt="Cuentas completas" />
        </button>
      </div>

      {/* Popup para mostrar imagen de obsequios */}
      {showPopup && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={closePopup}>
              ✕
            </button>
            <img src={popupImage} alt="Obsequios" className="popup-image" />
          </div>
        </div>
      )}

      {/* Popup para mostrar información del plan */}
      {showInfoPopup && selectedPlan && (
        <div className="popup-overlay" onClick={closeInfoPopup}>
          <div className="popup-info-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={closeInfoPopup}>
              ✕
            </button>
            <div className="popup-info-body">
              <h2 className="plan-info-title">{selectedPlan.title}</h2>
              <p className="plan-info-subtitle">{selectedPlan.subtitle}</p>
              
              {selectedPlan.sections.map((section, index) => (
                <div key={index} className="plan-info-section">
                  <h3 className="section-title">{section.title}</h3>
                  {section.subtitle && (
                    <p className="section-subtitle">{section.subtitle}</p>
                  )}
                  <ul className="section-items">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NUEVO: Formulario de contacto con plan preseleccionado */}
      {showFormulario && (
        <FormularioContacto
          onClose={() => setShowFormulario(false)}
          planPreseleccionado={planPreseleccionado}
        />
      )}
    </section>
  );
};