import React from "react";
import '../SectionTree/sectionthree.css'

import icon1 from '../../assets/Icono-musica-y-podcast.png'
import icon2 from '../../assets/Icono-series-y-peliculas.png'
import icon3 from '../../assets/Icono-edicion-y-diseno.png'
import icon4 from '../../assets/icono-bonos-y-descuentos.png'
import icon5 from '../../assets/icono-y-mas.png'

export const SectionTreee = () =>{
    return (
        <section className="section-three">
            <div className="icons-container">
                <img src={icon1} alt="musica" />
                <img src={icon2} alt="series" />
                <img src={icon3} alt="diseño" />
                <img src={icon4} alt="descuentos" />
                <img src={icon5} alt="mas" />
            </div>
            <div className="info-box">
            Música y podcasts, películas y series,<br />
            edición y diseño, descuentos, obsequios...<br />
            y más.
            </div>  
            <p className="line-text">
                Olvidate de pagar una por una.
            </p>      
            <p className="highlight-box">
                <span >Con Simplia, lo tienes todo, por mucho menos</span>
            </p>    
        </section>
    )
}
