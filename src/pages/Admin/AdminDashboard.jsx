// src/pages/Admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { CrearDistribuidor } from './CrearDistribuidor';
import { VerDistribuidores } from './VerDistribuidores';
import { ConfiguracionComisiones } from './ConfiguracionComisiones';
import { SolicitudesRetiro } from './SolicitudesRetiro';
import { BuscadorGlobal } from './BuscadorGlobal'; // NUEVO
import '../../styles/admin.css';

export const AdminDashboard = () => {
  const [vista, setVista] = useState('distribuidores');
  const [estadisticas, setEstadisticas] = useState({
    totalDistribuidores: 0,
    totalClicks: 0,
    totalLeads: 0,
    totalConversiones: 0,
    saldoPendiente: 0,
    totalPagado: 0,
    solicitudesPendientes: 0,
    leadsSinAtender: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    cargarEstadisticas();
    
    const interval = setInterval(() => {
      cargarEstadisticas();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const distribuidoresRef = collection(db, 'distribuidores');
      const distribuidoresSnapshot = await getDocs(distribuidoresRef);

      let totalClicks = 0;
      let totalLeads = 0;
      let saldoPendiente = 0;
      let totalPagado = 0;

      distribuidoresSnapshot.forEach((doc) => {
        const data = doc.data();
        totalClicks += data.estadisticas?.clicks || 0;
        totalLeads += data.estadisticas?.leads || 0;
        saldoPendiente += data.comisiones?.saldoDisponible || 0;
        totalPagado += data.comisiones?.totalPagado || 0;
      });

      const leadsRef = collection(db, 'leads');
      const leadsSnapshot = await getDocs(leadsRef);
      
      let totalConversiones = 0;
      let leadsSinAtender = 0;
      
      leadsSnapshot.forEach((doc) => {
        const data = doc.data();
        
        if (data.estado === 'compra_ejecutada' || data.estado === 'cerrado') {
          totalConversiones++;
        }
        
        if (data.estado === 'pendiente' || data.estado === 'contactado') {
          leadsSinAtender++;
        }
      });

      const solicitudesRef = collection(db, 'solicitudesRetiro');
      const solicitudesSnapshot = await getDocs(solicitudesRef);
      
      let solicitudesPendientes = 0;
      
      solicitudesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.estado === 'pendiente') {
          solicitudesPendientes++;
        }
      });

      setEstadisticas({
        totalDistribuidores: distribuidoresSnapshot.size,
        totalClicks,
        totalLeads: leadsSnapshot.size,
        totalConversiones,
        saldoPendiente,
        totalPagado,
        solicitudesPendientes,
        leadsSinAtender
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-info">
          <h1>🎯 Simplia Admin</h1>
          <p className="header-subtitle">Panel de Control</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          🚪 Cerrar Sesión
        </button>
      </header>

      {/* NUEVO: Buscador Global */}
<div className="buscador-global-container">
  <BuscadorGlobal 
    onNavigateToDistribuidor={(distribuidorId) => {
      setVista('distribuidores');
      // Opcional: pasar el ID al componente VerDistribuidores para que abra automáticamente
    }}
  />
</div>

      {/* Estadísticas Generales */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Distribuidores</h3>
            <p className="stat-number">{estadisticas.totalDistribuidores}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🖱️</div>
          <div className="stat-info">
            <h3>Clicks Totales</h3>
            <p className="stat-number">{estadisticas.totalClicks.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>Leads Totales</h3>
            <p className="stat-number">{estadisticas.totalLeads}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Ventas Completadas</h3>
            <p className="stat-number">{estadisticas.totalConversiones}</p>
          </div>
        </div>
        
        {estadisticas.leadsSinAtender > 0 && (
          <div className="stat-card stat-card-warning pulse">
            <div className="stat-icon">⚠️</div>
            <div className="stat-info">
              <h3>Leads Sin Atender</h3>
              <p className="stat-number">{estadisticas.leadsSinAtender}</p>
            </div>
          </div>
        )}
        
        <div className="stat-card stat-card-success">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Saldo Pendiente</h3>
            <p className="stat-number">{formatearMoneda(estadisticas.saldoPendiente)}</p>
          </div>
        </div>

        <div className="stat-card stat-card-info">
          <div className="stat-icon">💸</div>
          <div className="stat-info">
            <h3>Total Pagado</h3>
            <p className="stat-number">{formatearMoneda(estadisticas.totalPagado)}</p>
          </div>
        </div>
        
        {estadisticas.solicitudesPendientes > 0 && (
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">📨</div>
            <div className="stat-info">
              <h3>Solicitudes Pendientes</h3>
              <p className="stat-number">{estadisticas.solicitudesPendientes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navegación */}
      <div className="admin-nav">
        <button
          className={vista === 'distribuidores' ? 'active' : ''}
          onClick={() => setVista('distribuidores')}
        >
          👥 Distribuidores
          {estadisticas.leadsSinAtender > 0 && (
            <span className="badge-count">{estadisticas.leadsSinAtender}</span>
          )}
        </button>

        <button
          className={vista === 'crear' ? 'active' : ''}
          onClick={() => setVista('crear')}
        >
          ➕ Crear Distribuidor
        </button>

        <button
          className={vista === 'solicitudes' ? 'active' : ''}
          onClick={() => setVista('solicitudes')}
        >
          📨 Solicitudes de Retiro
          {estadisticas.solicitudesPendientes > 0 && (
            <span className="badge-count">{estadisticas.solicitudesPendientes}</span>
          )}
        </button>

        <button
          className={vista === 'comisiones' ? 'active' : ''}
          onClick={() => setVista('comisiones')}
        >
          ⚙️ Configurar Comisiones
        </button>
      </div>

      {/* Contenido Principal */}
      <div className="admin-content">
        {vista === 'crear' && (
          <CrearDistribuidor 
            onCreado={() => {
              setVista('distribuidores');
              cargarEstadisticas();
            }} 
          />
        )}
        
        {vista === 'distribuidores' && (
          <VerDistribuidores 
            onUpdate={cargarEstadisticas}
            leadsSinAtender={estadisticas.leadsSinAtender}
          />
        )}
        
        {vista === 'comisiones' && (
          <ConfiguracionComisiones />
        )}

        {vista === 'solicitudes' && (
          <SolicitudesRetiro onUpdate={cargarEstadisticas} />
        )}
      </div>
    </div>
  );
};