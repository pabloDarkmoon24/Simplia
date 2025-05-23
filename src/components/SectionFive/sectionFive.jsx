import React from "react";
import '../SectionFive/sectionFive.css'

import essencial from '../../assets/Plan-simplia-esencial.png'
import conectado from '../../assets/Plan-simplia-conectado.png'
import total from '../../assets/Plan-simplia-total.png'
import btn1 from '../../assets/boton-lo-quiero-verde.png'
import btn2 from '../../assets/Boton-lo-quiero-morado.png'
import subtitle from '../../assets/Subrayador-titulos.png'

export const SectionFive = () => {
    return(
        <section className="section-five">
            <h2 className="section-title">Membresías</h2>
            <img src={subtitle} alt="subtitle-linea" />
            <div className="plans-container">
                <div className="plan-card">
                    <img src={conectado} alt="conectado" className="plan-image" />
                    <button><img src={btn2} alt="boton morado" /></button>
                </div>
                <div className="plan-card">
                    <img src={essencial} alt="essencial" className="plan-image" />
                    <button><img src={btn1} alt="boton verde" /></button>
                </div>
                <div className="plan-card">
                    <img src={total} alt="total" className="plan-image" />
                    <button><img src={btn2} alt="total" /></button>
                </div>
            </div>
        </section>
    )
}