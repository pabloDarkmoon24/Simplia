import React, { useState, useEffect } from "react";
import "../Hero/Hero.css";
import netflix from "../../assets/netflix.png";
import spotify from "../../assets/spotify.png";
import disney from "../../assets/disney.png";
import canva from "../../assets/canva.png";
import max from "../../assets/max.png";
import simplia from "../../assets/logo-simplia.png";
import boton from "../../assets/boton-simplia.png"
import linea from "../../assets/linea.png"

const images = [canva, spotify, netflix, disney, max];

export const Hero = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);
 
  const getClass = (index) => {
    const total = images.length;
    const left2 = (current - 2 + total) % total;
    const left1 = (current - 1 + total) % total;
    const right1 = (current + 1) % total;
    const right2 = (current + 2) % total;

    if (index === current) return 'activeSlide';
    if (index === left1) return 'leftSlide1';
    if (index === left2) return 'leftSlide2';
    if (index === right1) return 'rightSlide1';
    if (index === right2) return 'rightSlide2';
    return 'hiddenSlide';
  };

  return (
    <section className="hero-section">
      <div className="hero-content container">
        <img src={simplia} alt="simplia" className="logo"/><br />
        <h2 className="hero-title">Una sola membresía,</h2><br />
        <h3 className="hero-subtitle-box">Para tus servicios favoritos.</h3>

        <div className="carousel">
          {images.map((img, index) => (
            <div key={index} className={`slide ${getClass(index)}`}>
              <img src={img} alt={`card-${index}`} />
            </div>
          ))}
        </div>

        <p className="hero-description">
          Por un solo precio, descubre lo fácil que es tenerlo todo.
        </p> <br />
        <img src={boton} alt="boton" className="hero-button-img" />

        <img src={linea} alt="Decoración inferior" className="hero-divider" />

      </div>
    </section>
  );
};


