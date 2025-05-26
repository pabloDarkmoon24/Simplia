import React, {useState, useEffect} from "react";
import '../SectionFive/sectionFive.css'

import btn1 from '../../assets/boton-lo-quiero-verde.png';
import btn2 from '../../assets/Boton-lo-quiero-morado.png';
import subtitle from '../../assets/Subrayador-titulos.png';

import essencial from '../../assets/Plan-simplia-esencial.png';
import conectado from '../../assets/Plan-simplia-conectado.png';
import total from '../../assets/Plan-simplia-total.png';

import essencial_mobile from '../../assets/Plan-simplia-esencial-mobile.png';
import conectado_mobile from '../../assets/Plan-simplia-conectado-mobile.png';
import total_mobile from '../../assets/Plan-simplia-total -mobile.png';

export const SectionFive = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const images = {
    essencial: isMobile ? essencial_mobile : essencial,
    conectado: isMobile ? conectado_mobile : conectado,
    total: isMobile ? total_mobile : total,
  };

  return (
    <section className="section-five" id="membresias">
      <h2 className="section-title">Membresias</h2>
      <img src={subtitle} alt="subtitle-linea" />
      <div className="plans-container">
        <div className="plan-card">
          <img src={images.conectado} alt="conectado" className="plan-image" />
          <button><img src={btn2} alt="boton morado" /></button>
        </div>
        <div className="plan-card">
          <img src={images.essencial} alt="essencial" className="plan-image" />
          <button><img src={btn1} alt="boton verde" /></button>
        </div>
        <div className="plan-card">
          <img src={images.total} alt="total" className="plan-image" />
          <button><img src={btn2} alt="total" /></button>
        </div>
      </div>
    </section>
  );
};