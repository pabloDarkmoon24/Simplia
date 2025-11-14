import React, {useState, useEffect} from "react";
import '../SectionFive/sectionFive.css'

import btn1 from '../../assets/boton-lo-quiero-verde.png';
import btn2 from '../../assets/Boton-lo-quiero-morado.png';
import subtitle from '../../assets/Subrayador-titulos.png';

import essencial from '../../assets/Plan-simplia-esencial.png';
import conectado from '../../assets/Plan-simplia-conectado.png';
import total from '../../assets/Plan-simplia-total.png';

// Botón de cuentas completas
import botonCuentasCompletas from '../../assets/boton-cuentas-completas.png';

// IMPORTANTE: Botón de obsequios (mismo para los 3 planes)
import botonObsequios from '../../assets/boton-obsequios.png';

// IMPORTANTE: Imágenes de popup (diferentes para cada plan)
import popupObsequioConectado from '../../assets/popup-obsequio-conectado.png';
import popupObsequioEsencial from '../../assets/popup-obsequio-esencial.png';
import popupObsequioTotal from '../../assets/popup-obsequio-total.png';


export const SectionFive = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showPopup, setShowPopup] = useState(false);
  const [popupImage, setPopupImage] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    // Cerrar popup con tecla ESC
    const handleEsc = (e) => {
      if (e.key === 'Escape' && showPopup) {
        closePopup();
      }
    };
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [showPopup]);

  // Funciones para manejar los clicks de "conocer más"
  const handleConocerMasConectado = () => {
    // Aquí puedes poner la URL o acción que quieras
    console.log("Conocer más Plan Conectado");
  };

  const handleConocerMasEsencial = () => {
    // Aquí puedes poner la URL o acción que quieras
    console.log("Conocer más Plan Esencial");
  };

  const handleConocerMasTotal = () => {
    // Aquí puedes poner la URL o acción que quieras
    console.log("Conocer más Plan Total");
  };

  const handleCuentasCompletas = () => {
    // Aquí puedes poner la URL o acción que quieras
    console.log("Cuentas Completas");
  };

  // Funciones para abrir popup con la imagen de obsequios correspondiente
  const handleObsequiosConectado = () => {
    setPopupImage(popupObsequioEsencial);
    setShowPopup(true);
  };

  const handleObsequiosEsencial = () => {
    setPopupImage(popupObsequioConectado);
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

  return (
    <section className="section-five" id="membresias">
      <h2 className="section-title">Membresias</h2>
      <img src={subtitle} alt="subtitle-linea" />
      
      <div className="plans-container">
        {/* Plan Conectado */}
        <div className="plan-card">
          <img src={conectado} alt="conectado" className="plan-image" />
          <span className="conocer-mas-link" onClick={handleConocerMasConectado}>
            *Conocer más*
          </span>
          <button className="plan-button">
            <img src={btn2} alt="boton morado" />
          </button>
          <button className="obsequios-button" onClick={handleObsequiosConectado}>
            <img src={botonObsequios} alt="Obsequios" />
          </button>
        </div>

        {/* Plan Esencial */}
        <div className="plan-card">
          <img src={essencial} alt="essencial" className="plan-image" />
          <span className="conocer-mas-link" onClick={handleConocerMasEsencial}>
            *Conocer más*
          </span>
          <button className="plan-button">
            <img src={btn1} alt="boton verde" />
          </button>
          <button className="obsequios-button" onClick={handleObsequiosEsencial}>
            <img src={botonObsequios} alt="Obsequios" />
          </button>
        </div>

        {/* Plan Total */}
        <div className="plan-card">
          <img src={total} alt="total" className="plan-image" />
          <span className="conocer-mas-link" onClick={handleConocerMasTotal}>
            *Conocer más*
          </span>
          <button className="plan-button">
            <img src={btn2} alt="boton morado" />
          </button>
          <button className="obsequios-button" onClick={handleObsequiosTotal}>
            <img src={botonObsequios} alt="Obsequios" />
          </button>
        </div>
      </div>

      {/* Nueva sección: Cuentas Completas */}
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
    </section>
  );
};