import React, {useState, useEffect} from "react";
import '../SectionFive/sectionFive.css'

import btn1 from '../../assets/boton-lo-quiero-verde.png';
import btn2 from '../../assets/Boton-lo-quiero-morado.png';
import subtitle from '../../assets/Subrayador-titulos.png';

import essencial from '../../assets/Plan-simplia-esencial.png';
import conectado from '../../assets/Plan-simplia-conectado.png';
import total from '../../assets/Plan-simplia-total.png';

// IMPORTANTE: Cambia esta ruta por la imagen de tu botón de cuentas completas
import botonCuentasCompletas from '../../assets/boton-cuentas-completas.png';


export const SectionFive = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          <button><img src={btn2} alt="boton morado" /></button>
        </div>

        {/* Plan Esencial */}
        <div className="plan-card">
          <img src={essencial} alt="essencial" className="plan-image" />
          <span className="conocer-mas-link" onClick={handleConocerMasEsencial}>
            *Conocer más*
          </span>
          <button><img src={btn1} alt="boton verde" /></button>
        </div>

        {/* Plan Total */}
        <div className="plan-card">
          <img src={total} alt="total" className="plan-image" />
          <span className="conocer-mas-link" onClick={handleConocerMasTotal}>
            *Conocer más*
          </span>
          <button><img src={btn2} alt="total" /></button>
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
    </section>
  );
};