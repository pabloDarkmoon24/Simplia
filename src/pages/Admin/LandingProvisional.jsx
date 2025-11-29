// src/pages/LandingProvisional/LandingProvisional.jsx
import { useNavigate } from 'react-router-dom';
import HeroLanding from './Landing/Hero/Hero';
import GanaPorRegistrarte from './Landing/GanaPorRegistrarte/GanaPorRegistrarte';
import GanaPorCompartir from './Landing/GanaPorCompartir/GanaPorCompartir';
import ComoIniciar from './Landing/ComoIniciar/ComoIniciar';
import RegistroDistribuidor from './Landing/RegistroDistribuidor/RegistroDistribuidor';

export const LandingProvisional = () => {
  const navigate = useNavigate();

  return (
    <>
    <HeroLanding />
    <GanaPorRegistrarte />
    <GanaPorCompartir/>
    <ComoIniciar />
    <RegistroDistribuidor/>
    </>
    
  );
};