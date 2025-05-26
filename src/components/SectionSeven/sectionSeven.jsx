import React from "react";
import '../SectionSeven/sectionSeven.css'
import paso1 from '../../assets/Paso-1-simplia.png'
import paso2 from '../../assets/Paso-2-simplia.png'
import paso3 from '../../assets/Paso-3-simplia.png'
import paso4 from '../../assets/Paso-4-simplia.png'
import btn from '../../assets/Boton-ver-membresias.png'
import separador from '../../assets/linea.png'
import subtitle from '../../assets/Subrayador-titulos.png'

export const SectionSeven = () => {
    return (
        <section className="section-seven">
            <h2 className="section-title">Como adquirir tu membresia</h2>
            <img src={subtitle} alt="subtitle-linea" />
            <div className="steps-grid">
                <img src={paso1} alt="paso 1" />
                <img src={paso2} alt="paso 2" />
                <img src={paso3} alt="paso 3" />
                <img src={paso4} alt="paso 4" />
            </div>
            <div className="btn-container">
                 <img
                    src={btn}
                    alt="boton membresia"
                    className="btn-img"
                    onClick={() => {
                    const target = document.getElementById("membresias");
                    if (target) target.scrollIntoView({ behavior: "smooth" });
                    }}
                />
            </div>
            <img src={separador} alt="Decoración inferior" className="hero-divider" />
        </section>
    )
}
