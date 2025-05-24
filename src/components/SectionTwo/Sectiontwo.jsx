import React from "react";
import "../SectionTwo/SectionTwo.css";
import fondoPc from "../../assets/Ahorrar-es-simplia-Pcs.png";
import fondoMobile from "../../assets/Ahorrar-es-simplia-mobile.png";
import { useIsMobile } from "../../hooks/useIsMobile";

export const SectionTwo = () => {
  const isMobile = useIsMobile();

  return (
    <section className="section-two">
      <img src={isMobile ? fondoMobile : fondoPc} alt="Fondo Simplia" />
    </section>
  );
};
