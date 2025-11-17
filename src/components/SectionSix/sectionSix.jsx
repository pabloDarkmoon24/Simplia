import React, {useState} from "react";
import '../SectionSix/sectionsix.css'
import subtitle from '../../assets/Subrayador-titulos.png'


import netflix from '../../assets/Simplia-Netflix.png'
import disney from '../../assets/Simplia Disney.png'
import canva from '../../assets/Simplia-Canva.png'
import max from '../../assets/Simplia-Max.png'
import paramount from '../../assets/Simplia-paramount.png'
import prime from '../../assets/Simplia-Prime-video.png'
import dezzer from '../../assets/Simplia-Spotify.png'
import crunchy from '../../assets/Simpli-crunchyroll.png'

import guiaNetflix from '../../assets/GUIA-NETFLIX.jpg'
import guiaDisney from '../../assets/GUIA-DISNEY.jpg'
import guiaCanva from '../../assets/GUIA-CANVA.jpeg'
import guiaMax from '../../assets/GUIA-MAX.jpg'
import guiaParamount from '../../assets/GUIA-PARAMOUNT.jpeg'
import guiaPrime from '../../assets/GUIA-PRIME.jpeg'
import guiaSpotify from '../../assets/GUIA-DEZZER.jpg'
import guiaCrunchy from '../../assets/GUIA-CRUNCHY.jpeg'


const plataformas = [
  { img: disney, alt: "Disney", guia: guiaDisney },
  { img: netflix, alt: "Netflix", guia: guiaNetflix, className: "netflix-card" },
  { img: max, alt: "Max", guia: guiaMax },
  { img: prime, alt: "Prime Video", guia: guiaPrime },
  { img: dezzer, alt: "Spotify", guia: guiaSpotify },
  { img: paramount, alt: "Paramount+", guia: guiaParamount },
  { img: canva, alt: "Canva", guia: guiaCanva },
  { img: crunchy, alt: "Crunchyroll", guia: guiaCrunchy }
];

export const SectionSix = () => {
  const [popup, setPopup] = useState({ visible: false, guia: null });

  return (
    <section className="section-six">
      <h2 className="section-title">Modo de Uso</h2>
      <img src={subtitle} alt="subtitle-linea" />
      <p className="section-subtitle">
        Como usar correctamente las <br />
        Plataformas disponibles con tu membresía
      </p>

      <div className="guides-grid">
        {plataformas.map(({ img, alt, guia, className }, i) => (
          <img
            key={i}
            src={img}
            alt={alt}
            className={className || ""}
            onClick={() => setPopup({ visible: true, guia })}
          />
        ))}
      </div>

      {popup.visible && (
        <div className="popup-overlay" onClick={() => setPopup({ visible: false, guia: null })}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <img src={popup.guia} alt="Guía" />
            <button className="close-btn" onClick={() => setPopup({ visible: false, guia: null })}>×</button>
          </div>
        </div>
      )}
    </section>
  );
};






