import React from "react";
import '../SectionFour/sectionFour.css'

import card1 from '../../assets/Beneficio-bonos-especiales.png'
import card2 from '../../assets/Beneficio-descentos-exclusivos.png'
import card3 from '../../assets/Beneficio-obsequios-extra.png'
import card4 from '../../assets/Beneficio-suscripciones-sorpresa.png'



export const SectionFour = () => {
    return  (
        <section className="section-four">
            <h2 className="section-title">
                ¿Y si además de pagar menos... <span>te damos más?</span>
            </h2>
            <div className="cards-container">
                <img src={card2} alt="Descuentos-Exclusivos" />
                <img src={card4} alt="Suscripciones-Sorpresa" />
                <img src={card1} alt="Bonos-extra" />
                <img src={card3} alt="Obsequios-Extra" />
            </div>
            <div className="botton-message">
                Porque aqui no solo ahorras, ganas
            </div>
        </section>
    )
}