import React from "react";
import '../SectionSix/sectionsix.css'
import netflix from '../../assets/Simplia-Netflix.png'
import disney from '../../assets/Simplia Disney.png'
import canva from '../../assets/Simplia-Canva.png'
import max from '../../assets/Simplia-Max.png'
import paramount from '../../assets/Simplia-paramount.png'
import prime from '../../assets/Simplia-Prime-video.png'
import spotify from '../../assets/Simplia-Spotify.png'
import crunchy from '../../assets/Simpli-crunchyroll.png'
import subtitle from '../../assets/Subrayador-titulos.png'


export const SectionSix = () => {
    return (
        <section className="section-six">
            <h2 className="section-title">Modo de Uso</h2>
            <img src={subtitle} alt="subtitle-linea" />
            <p className="section-subtitle">
                Como usar correctamente las <br />
                Plataformas disponibles con tu membresía
            </p>
            <div className="guides-grid">
            <img src={disney} alt="Disney" />
            <img src={netflix} alt="Netflix" className="netflix-card" />
            <img src={max} alt="Max" />
            <img src={prime} alt="Prime Video" />
            <img src={spotify} alt="Spotify" />
            <img src={paramount} alt="Paramount+" />
            <img src={canva} alt="Canva" />
            <img src={crunchy} alt="Crunchyroll" />
            </div>
        </section>
    )
}







