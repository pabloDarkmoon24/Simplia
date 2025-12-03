// Navbar/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logoSimplia from '../../../../landingPrincipal/Logo-simplia.png'; // Ajusta la ruta según tu estructura

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img src={logoSimplia} alt="Simplia" />
        </Link>

        {/* Botón de Login */}
        <Link to="/distribuidor/login" className="navbar-login-btn">
          Iniciar Sesión
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;