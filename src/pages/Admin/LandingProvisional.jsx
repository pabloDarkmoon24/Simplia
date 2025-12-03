// src/pages/LandingProvisional/LandingProvisional.jsx
import { useNavigate } from 'react-router-dom';
import HeroLanding from './Landing/Hero/Hero';
import GanaPorRegistrarte from './Landing/GanaPorRegistrarte/GanaPorRegistrarte';
import GanaPorCompartir from './Landing/GanaPorCompartir/GanaPorCompartir';
import ComoIniciar from './Landing/ComoIniciar/ComoIniciar';
import RegistroDistribuidor from './Landing/RegistroDistribuidor/RegistroDistribuidor';
import BonosExtras from './Landing/BonosExtras/BonosExtras';
import GanarAhoraEs from './Landing/GanarAhoraEs/GanarAhoraEs';
import Navbar from './Landing/Navbar/Navbar';

export const LandingProvisional = () => {
  const navigate = useNavigate();

  return (
    <>
    <Navbar />
    <HeroLanding />
    <GanaPorRegistrarte />
    <GanaPorCompartir/>
    <ComoIniciar />
    <RegistroDistribuidor/>
    <BonosExtras />
    <GanarAhoraEs />

    </>
    
  );
};