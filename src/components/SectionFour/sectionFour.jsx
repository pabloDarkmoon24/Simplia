import React, { useEffect, useState } from "react";
import '../SectionFour/sectionFour.css';

import card1 from '../../assets/Beneficio-bonos-especiales.png';
import card2 from '../../assets/Beneficio-descentos-exclusivos.png';
import card3 from '../../assets/Beneficio-obsequios-extra.png';
import card4 from '../../assets/Beneficio-suscripciones-sorpresa.png';

import card1_mobile from '../../assets/Simplia-bonos-mobile.png';
import card2_mobile from '../../assets/Simplia-descuentos-mobile.png';
import card3_mobile from '../../assets/simplia-obsequios-mobile.png';
import card4_mobile from '../../assets/simplis-suscripciones-mobile.png';

export const SectionFour = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const images = {
    card1: isMobile ? card1_mobile : card1,
    card2: isMobile ? card2_mobile : card2,
    card3: isMobile ? card3_mobile : card3,
    card4: isMobile ? card4_mobile : card4,
  };

  return (
    <section className="section-four">
      <h2 className="section-title">
        ¿Y si además de pagar menos... <span>te damos más?</span>
      </h2>
      <div className="cards-container">
        <img src={images.card2} alt="Descuentos-Exclusivos" />
        <img src={images.card4} alt="Suscripciones-Sorpresa" />
        <img src={images.card1} alt="Bonos-extra" />
        <img src={images.card3} alt="Obsequios-Extra" />
      </div>
      <div className="botton-message">
        Porque aqui no solo ahorras, ganas
      </div>
    </section>
  );
};
