// src/pages/Distribuidor/DistribuidorDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { MisLeads } from './MisLeads';
import { MisComisiones } from './MisComisiones';
import { SolicitarRetiro } from './SolicitarRetiro';
import { CambiarPassword } from './CambiarPassword';
import '../../styles/distribuidor.css';
import { ConfigurarDatosPago } from './ConfigurarDatosPago';

// Popup simple reutilizable
const Popup = ({ message, onClose }) => (
  <div className="popup-overlay">
    <div className="popup-box">
      <p>{message}</p>
      <button onClick={onClose} className="popup-btn">Cerrar</button>
    </div>
  </div>
);

export const DistribuidorDashboard = () => {
  const [vista, setVista] = useState('resumen');
  const [distribuidor, setDistribuidor] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    clicks: 0,
    leads: 0,
    conversiones: 0,
    saldoDisponible: 0,
    totalGanado: 0,
    totalPagado: 0
  });
  const [loading, setLoading] = useState(true);
  const [popupMessage, setPopupMessage] = useState(null);
  const navigate = useNavigate();

  // ⭐ ESCUCHAR CAMBIOS EN EL ESTADO DE AUTENTICACIÓN
  useEffect(() => {
    console.log('👂 Escuchando estado de autenticación...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('✅ Usuario autenticado encontrado:', user.uid);
        console.log('📧 Email:', user.email);
        
        // Cargar datos del distribuidor
        await cargarDatos(user.uid);
      } else {
        console.log('❌ No hay usuario autenticado. Redirigiendo al login...');
        setLoading(false);
        navigate('/distribuidor/login');
      }
    });

    // Cleanup: desuscribirse al desmontar el componente
    return () => unsubscribe();
  }, [navigate]);

  const cargarDatos = async (uid) => {
    try {
      console.log('📊 Cargando datos del distribuidor UID:', uid);

      const distribuidorRef = doc(db, 'distribuidores', uid);
      const distribuidorSnap = await getDoc(distribuidorRef);

      if (!distribuidorSnap.exists()) {
        console.error('❌ Distribuidor no encontrado en Firestore');
        await signOut(auth);
        navigate('/distribuidor/login');
        return;
      }

      const distribuidorData = {
        uid: uid,
        id: distribuidorSnap.data().id,
        ...distribuidorSnap.data()
      };

      console.log('✅ Datos del distribuidor:', distribuidorData);

      if (!distribuidorData.activo) {
        console.error('❌ Distribuidor inactivo');
        await signOut(auth);
        navigate('/distribuidor/login');
        return;
      }

      setDistribuidor(distribuidorData);
      setEstadisticas({
        clicks: distribuidorData.estadisticas?.clicks || 0,
        leads: distribuidorData.estadisticas?.leads || 0,
        conversiones: distribuidorData.estadisticas?.conversiones || 0,
        saldoDisponible: distribuidorData.comisiones?.saldoDisponible || 0,
        totalGanado: distribuidorData.comisiones?.totalGanado || 0,
        totalPagado: distribuidorData.comisiones?.totalPagado || 0
      });

      console.log('✅ Datos cargados correctamente');

    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      navigate('/distribuidor/login');
    } finally {
      setLoading(false);
    }
  };

  const recargarDatos = async () => {
    const user = auth.currentUser;
    if (user) {
      await cargarDatos(user.uid);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('👋 Cerrando sesión...');
      await signOut(auth);
      console.log('✅ Sesión cerrada');
      navigate('/distribuidor/login');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
    }
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  };

  if (loading) {
    return (
      <div className="distribuidor-dashboard">
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (!distribuidor) {
    return (
      <div className="distribuidor-dashboard">
        <div className="error-container">
          <h2>❌ Error al cargar datos</h2>
          <p>No se pudieron cargar tus datos. Intenta iniciar sesión de nuevo.</p>
          <button onClick={() => navigate('/distribuidor/login')} className="btn-primary">
            Volver al login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="distribuidor-dashboard">
      {popupMessage && (
        <Popup message={popupMessage} onClose={() => setPopupMessage(null)} />
      )}

      <header className="distribuidor-header">
        <div className="header-info">
          <h1>💼 Panel Distribuidor</h1>
          <p className="distribuidor-nombre">Hola, <strong>{distribuidor?.nombre}</strong></p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          🚪 Cerrar Sesión
        </button>
      </header>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-info">
            <h3>Clicks</h3>
            <p className="stat-number">{estadisticas.clicks}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>Leads</h3>
            <p className="stat-number">{estadisticas.leads}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Ventas</h3>
            <p className="stat-number">{estadisticas.conversiones}</p>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Saldo Disponible</h3>
            <p className="stat-number">{formatearMoneda(estadisticas.saldoDisponible)}</p>
          </div>
        </div>

        <div className="stat-card stat-card-info">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <h3>Total Ganado</h3>
            <p className="stat-number">{formatearMoneda(estadisticas.totalGanado)}</p>
          </div>
        </div>

        <div className="stat-card stat-card-gray">
          <div className="stat-icon">✓</div>
          <div className="stat-info">
            <h3>Total Pagado</h3>
            <p className="stat-number">{formatearMoneda(estadisticas.totalPagado)}</p>
          </div>
        </div>
      </div>

      <div className="distribuidor-nav">
        <button
          className={vista === 'resumen' ? 'active' : ''}
          onClick={() => setVista('resumen')}
        >
          📊 Resumen
        </button>
        <button
          className={vista === 'leads' ? 'active' : ''}
          onClick={() => setVista('leads')}
        >
          📝 Mis Leads
        </button>
        <button
          className={vista === 'comisiones' ? 'active' : ''}
          onClick={() => setVista('comisiones')}
        >
          💰 Mis Comisiones
        </button>
        <button
          className={vista === 'retiro' ? 'active' : ''}
          onClick={() => setVista('retiro')}
        >
          💳 Solicitar Retiro
        </button>
        <button
          className={vista === 'datos' ? 'active' : ''}
          onClick={() => setVista('datos')}
        >
          ⚙️ Datos de Pago
        </button>
        <button
          className={vista === 'password' ? 'active' : ''}
          onClick={() => setVista('password')}
        >
          🔒 Cambiar Contraseña
        </button>
      </div>

      <div className="distribuidor-content">
        {vista === 'resumen' && (
          <div className="resumen-container">
            <h2>📊 Resumen General</h2>
            
            <div className="resumen-grid">
              <div className="resumen-card">
                <h3>🔗 Tu Enlace de Distribuidor</h3>
                <div className="enlace-box">
                  <code>https://simpliacol.com/{distribuidor?.id}</code>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`https://simpliacol.com/${distribuidor?.id}`);
                      setPopupMessage('✅ Enlace copiado al portapapeles');
                    }}
                    className="btn-copiar-enlace"
                  >
                    📋 Copiar
                  </button>
                </div>
                <p className="enlace-hint">
                  Comparte este enlace con tus clientes para rastrear tus ventas
                </p>
              </div>

              <div className="resumen-card">
                <h3>💡 Cómo Funciona</h3>
                <ul className="lista-instrucciones">
                  <li>✅ Comparte tu enlace con clientes potenciales</li>
                  <li>✅ Cuando compren, ganarás comisión automáticamente</li>
                  <li>✅ Solicita retiro cuando tengas saldo disponible</li>
                  <li>✅ Configura tus datos bancarios para recibir pagos</li>
                </ul>
              </div>

              <div className="resumen-card">
                <h3>📈 Tus Números</h3>
                <div className="numeros-grid">
                  <div className="numero-item">
                    <span className="numero-label">Clicks:</span>
                    <span className="numero-value">{estadisticas.clicks}</span>
                  </div>
                  <div className="numero-item">
                    <span className="numero-label">Leads:</span>
                    <span className="numero-value">{estadisticas.leads}</span>
                  </div>
                  <div className="numero-item">
                    <span className="numero-label">Ventas:</span>
                    <span className="numero-value">{estadisticas.conversiones}</span>
                  </div>
                  <div className="numero-item destacado">
                    <span className="numero-label">Saldo:</span>
                    <span className="numero-value">{formatearMoneda(estadisticas.saldoDisponible)}</span>
                  </div>
                </div>
              </div>
            </div>

            {!distribuidor?.datosPago?.configurado && (
              <div className="alerta-datos-pago">
                ⚠️ <strong>Importante:</strong> Configura tus datos de pago para poder recibir tus comisiones.
                <button onClick={() => setVista('datos')} className="btn-configurar-ahora">
                  Configurar Ahora
                </button>
              </div>
            )}
          </div>
        )}

        {vista === 'leads' && (
          <MisLeads distribuidorId={distribuidor?.uid} />
        )}

        {vista === 'comisiones' && (
          <MisComisiones distribuidorId={distribuidor?.uid} />
        )}

        {vista === 'retiro' && (
          <SolicitarRetiro 
            distribuidor={distribuidor} 
            onRetiroSolicitado={recargarDatos}
          />
        )}

        {vista === 'datos' && (
          <ConfigurarDatosPago 
            distribuidorData={distribuidor}
            onActualizar={recargarDatos}
            onCambiarSeccion={setVista}
          />
        )}

        {vista === 'password' && (
          <CambiarPassword 
            distribuidorId={distribuidor?.uid}
            distribuidorEmail={distribuidor?.email}
          />
        )}
      </div>
    </div>
  );
};