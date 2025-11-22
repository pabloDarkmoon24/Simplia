import React, { useState, useEffect, useRef } from "react"; 
import "../Hero/Hero.css"; 
import netflix from "../../assets/netflix.png"; 
import spotify from "../../assets/dezzer.png"; 
import disney from "../../assets/disney.png"; 
import canva from "../../assets/canva.png"; 
import max from "../../assets/max.png"; 
import simplia from "../../assets/logo-simplia.png"; 
import boton from "../../assets/boton-simplia.png" 
import linea from "../../assets/linea.png" 
import { useSwipeable } from "react-swipeable"; 
import tarjeta1 from '../../assets/Tarjeta-2.png' 
import tarjeta2 from '../../assets/Tarjeta-4.png' 
import tarjeta3 from '../../assets/Tarjeta-6.png' 
import tarjeta4 from '../../assets/Tarjeta-8.png' 
import paramount from '../../assets/paramount.png' 
import crunchy from '../../assets/crunchy.png' 
import prime from '../../assets/prime.png' 
import directvgo from '../../assets/directvgo.png' 
 
 
export const Hero = () => { 
  const [current, setCurrent] = useState(0); 
  const timerRef = useRef(); 
 
  const images = [netflix, tarjeta1 ,spotify,tarjeta2, canva,tarjeta3, disney, tarjeta4, max, crunchy,paramount,prime, directvgo];  
 
  const next = () => { 
    setCurrent((prev) => (prev + 1) % images.length); 
    resetAuto(); 
  }; 
 
  const prev = () => { 
    setCurrent((prev) => (prev - 1 + images.length) % images.length); 
    resetAuto(); 
  }; 
 
  const resetAuto = () => { 
    clearInterval(timerRef.current); 
    timerRef.current = setInterval(() => { 
      setCurrent((prev) => (prev + 1) % images.length); 
    }, 2000); 
  }; 
 
  useEffect(() => { 
    resetAuto(); 
    return () => clearInterval(timerRef.current); 
  }, []); 
 
  const handlers = useSwipeable({ 
    onSwipedLeft: next, 
    onSwipedRight: prev, 
    trackMouse: true, // para que funcione también con el mouse 
    preventDefaultTouchmoveEvent: true, 
  }); 
 
  const getClass = (index) => { 
  const total = images.length; 
  const left3 = (current - 3 + total) % total; 
  const left2 = (current - 2 + total) % total; 
  const left1 = (current - 1 + total) % total; 
  const right1 = (current + 1) % total; 
  const right2 = (current + 2) % total; 
  const right3 = (current + 3) % total; 
 
  if (index === current) return "activeSlide"; 
  if (index === left1) return "leftSlide1"; 
  if (index === left2) return "leftSlide2"; 
  if (index === left3) return "leftSlide3"; 
  if (index === right1) return "rightSlide1"; 
  if (index === right2) return "rightSlide2"; 
  if (index === right3) return "rightSlide3"; 
  return "hiddenSlide"; 
}; 

  // Función para manejar el click del botón de membresía
  const handleMembresiaClick = () => {
    const numeroWhatsApp = "573170695865"; // ⚠️ REEMPLAZA CON TU NÚMERO DE WHATSAPP
    const mensaje = "Hola! Estoy interesado en conocer las membresías de Simplia 🎬";
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return ( 
    <section className="hero-section"> 
      <div className="hero-content container"> 
        <img src={simplia} alt="simplia" className="logo" /> 
        <h2 className="hero-title">Una sola membresía,</h2> 
        <h3 className="hero-subtitle-box">Para tus servicios favoritos.</h3> 
 
        <div className="carousel" {...handlers}> 
          <button className="carousel-btn prev" onClick={prev}>‹</button> 
 
          {images.map((img, index) => ( 
            <div key={index} className={`slide ${getClass(index)}`}> 
              <img src={img} alt={`card-${index}`} /> 
            </div> 
          ))} 
 
          <button className="carousel-btn next" onClick={next}>›</button> 
        </div> 
 
        <p className="hero-description"> 
          Por un solo precio, descubre lo fácil que es tenerlo todo. 
        </p> 
        <img 
          src={boton} 
          alt="boton" 
          className="hero-button-img"  
          onClick={handleMembresiaClick}
          style={{ cursor: 'pointer' }}
        /> 
 
        <img src={linea} alt="Decoración inferior" className="hero-divider" /> 
      </div> 
    </section> 
  ); 
};