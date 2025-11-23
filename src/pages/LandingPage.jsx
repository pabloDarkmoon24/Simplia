// src/pages/LandingPage.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/config';

import { Hero } from '../components/Hero/Hero';
import { SectionTwo } from '../components/SectionTwo/Sectiontwo';
import { SectionTreee } from '../components/SectionTree/sectionThree';
import { SectionFour } from '../components/SectionFour/sectionFour';
import { SectionFive } from '../components/SectionFive/sectionFive';
import { SectionSix } from '../components/SectionSix/sectionSix';
import { SectionSeven } from '../components/SectionSeven/sectionSeven';
import { SectionEight } from '../components/SectionEight/sectionEight';
import { SectionNine } from '../components/SectionNine/sectionNine';
import { WhatsAppButton } from '../components/WhatsAppButton/WhatsAppButton';
import { NotFound } from './NotFound';

export const LandingPage = () => {
  const { distribuidorId } = useParams();
  const [distribuidor, setDistribuidor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [clickRegistrado, setClickRegistrado] = useState(false);

  useEffect(() => {
    if (distribuidorId) {
      cargarDistribuidor();
      registrarClick();
    } else {
      // Si no hay distribuidorId, mostrar landing normal sin distribuidor
      setLoading(false);
    }
  }, [distribuidorId]);

  const cargarDistribuidor = async () => {
    try {
      console.log('🔍 Buscando distribuidor con ID:', distribuidorId);

      // Buscar por el campo "id" personalizado
      const distribuidoresRef = collection(db, 'distribuidores');
      const q = query(distribuidoresRef, where('id', '==', distribuidorId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log('❌ Distribuidor no encontrado');
        setNotFound(true);
        setLoading(false);
        return;
      }

      const distribuidorDoc = snapshot.docs[0];
      const distribuidorData = {
        ...distribuidorDoc.data(),
        uid: distribuidorDoc.id // UID del documento en Firestore
      };

      console.log('✅ Distribuidor encontrado:', distribuidorData);

      // Verificar si está activo
      if (!distribuidorData.activo) {
        console.log('⚠️ Distribuidor inactivo');
        setNotFound(true);
        setLoading(false);
        return;
      }

      setDistribuidor(distribuidorData);
      setLoading(false);

    } catch (error) {
      console.error('❌ Error al cargar distribuidor:', error);
      setNotFound(true);
      setLoading(false);
    }
  };

const registrarClick = async () => {
  if (clickRegistrado || !distribuidorId) return;

  try {
    // Buscar el UID del distribuidor
    const distribuidoresRef = collection(db, 'distribuidores');
    const q = query(distribuidoresRef, where('id', '==', distribuidorId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('⚠️ Distribuidor no encontrado, no se registra click');
      return;
    }

    const distribuidorDoc = snapshot.docs[0];
    const distribuidorUID = distribuidorDoc.id;

    // SOLO registrar click en colección clicks
    // El contador se actualizará desde el backend o admin
    const clickRef = doc(collection(db, 'clicks'));
    await setDoc(clickRef, {
      distribuidorId: distribuidorUID,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      fecha: new Date().toISOString(),
      contado: false // Flag para saber si ya se contó
    });

    console.log('✅ Click registrado para distribuidor:', distribuidorUID);
    setClickRegistrado(true);

    // NO incrementar aquí porque requiere autenticación
    // El admin puede ver los clicks y los cuenta

  } catch (error) {
    console.error('❌ Error al registrar click:', error);
    // NO mostrar error al usuario, es solo tracking
  }
};

  // Mostrar loading
  if (loading) {
    return (
      <div className="loading-page" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div className="loading-spinner" style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '20px', fontSize: '18px' }}>Cargando...</p>
      </div>
    );
  }

  // Mostrar 404 si no existe o está inactivo
  if (notFound) {
    return <NotFound />;
  }

  // Mostrar landing normal
  return (
    <>
      <Hero distribuidor={distribuidor} />
      <SectionTwo />
      <SectionTreee />
      <SectionFour />
      <SectionFive />
      <SectionSix />
      <SectionSeven />
      <SectionEight />
      <SectionNine />
      
      {/* Pasar datos del distribuidor al botón de WhatsApp */}
      <WhatsAppButton distribuidor={distribuidor} />
    </>
  );
};