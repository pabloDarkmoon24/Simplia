// src/pages/Admin/ConfiguracionComisiones.jsx
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';

export const ConfiguracionComisiones = () => {
  const [comisiones, setComisiones] = useState({
    "Plan Esencial 🎬": 10000,
    "Plan Conectado 📱": 15000,
    "Plan Total 🌟": 30000
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [cambiosPendientes, setCambiosPendientes] = useState({});

  useEffect(() => {
    cargarComisiones();
  }, []);

  const mostrarNotificacion = (type, message) => {
    setNotification({ type, message });
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  const cargarComisiones = async () => {
    try {
      const docRef = doc(db, 'configuracion', 'comisiones');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setComisiones(data.planes || comisiones);
      } else {
        // Si no existe, crear documento inicial
        await setDoc(docRef, {
          planes: comisiones,
          ultimaActualizacion: new Date().toISOString(),
          actualizadoPor: auth.currentUser?.email || 'admin',
          historial: []
        });
      }
    } catch (error) {
      console.error('❌ Error al cargar comisiones:', error);
      mostrarNotificacion('error', '❌ Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (plan, valor) => {
    const nuevoValor = parseInt(valor) || 0;
    const valorAnterior = comisiones[plan];
    
    setComisiones({
      ...comisiones,
      [plan]: nuevoValor
    });

    // Registrar cambio pendiente
    if (nuevoValor !== valorAnterior) {
      setCambiosPendientes({
        ...cambiosPendientes,
        [plan]: { anterior: valorAnterior, nuevo: nuevoValor }
      });
    } else {
      // Si se vuelve al valor original, quitar del registro de cambios
      const nuevosCambios = { ...cambiosPendientes };
      delete nuevosCambios[plan];
      setCambiosPendientes(nuevosCambios);
    }
  };

  const guardarCambios = async () => {
    if (Object.keys(cambiosPendientes).length === 0) {
      mostrarNotificacion('error', 'No hay cambios para guardar');
      return;
    }

    setSaving(true);

    try {
      const docRef = doc(db, 'configuracion', 'comisiones');
      const docSnap = await getDoc(docRef);
      
      const historialPrevio = docSnap.exists() ? (docSnap.data().historial || []) : [];

      await setDoc(docRef, {
        planes: comisiones,
        ultimaActualizacion: new Date().toISOString(),
        actualizadoPor: auth.currentUser?.email || 'admin',
        historial: [
          ...historialPrevio,
          {
            fecha: new Date().toISOString(),
            usuario: auth.currentUser?.email || 'admin',
            cambios: cambiosPendientes
          }
        ]
      });

      mostrarNotificacion('success', '✅ Comisiones actualizadas correctamente');
      setCambiosPendientes({});
      
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      mostrarNotificacion('error', '❌ Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  const descartarCambios = () => {
    cargarComisiones();
    setCambiosPendientes({});
    mostrarNotificacion('success', 'Cambios descartados');
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
      <div className="loading-container">
        <p>Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="configuracion-comisiones-container">
      <div className="config-header">
        <div>
          <h2>⚙️ Configuración de Comisiones</h2>
          <p className="subtitle">
            Ajusta las comisiones para cada plan. Los cambios solo afectarán nuevas ventas.
          </p>
        </div>
        
        {Object.keys(cambiosPendientes).length > 0 && (
          <div className="cambios-pendientes-badge">
            {Object.keys(cambiosPendientes).length} cambio(s) sin guardar
          </div>
        )}
      </div>

      <div className="comisiones-grid">
        {Object.entries(comisiones).map(([plan, monto]) => {
          const tieneCambios = cambiosPendientes[plan];
          
          return (
            <div 
              key={plan} 
              className={`comision-card ${tieneCambios ? 'tiene-cambios' : ''}`}
            >
              <div className="comision-card-header">
                <h3>{plan}</h3>
                {tieneCambios && (
                  <span className="badge-cambio">Modificado</span>
                )}
              </div>

              <div className="comision-input-group">
                <label>Comisión por venta:</label>
                <div className="input-with-currency">
                  <span className="currency-symbol">$</span>
                  <input
                    type="number"
                    value={monto}
                    onChange={(e) => handleChange(plan, e.target.value)}
                    disabled={saving}
                    min="0"
                    step="1000"
                  />
                  <span className="currency-label">COP</span>
                </div>
              </div>

              <div className="comision-preview">
                <span className="preview-label">Vista previa:</span>
                <span className="preview-value">{formatearMoneda(monto)}</span>
              </div>

              {tieneCambios && (
                <div className="cambio-detalle">
                  <span className="valor-anterior">
                    Anterior: {formatearMoneda(tieneCambios.anterior)}
                  </span>
                  <span className="flecha">→</span>
                  <span className="valor-nuevo">
                    Nuevo: {formatearMoneda(tieneCambios.nuevo)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="config-actions">
        <button 
          onClick={guardarCambios}
          className="btn-guardar-config"
          disabled={saving || Object.keys(cambiosPendientes).length === 0}
        >
          {saving ? (
            <>
              <span className="spinner-small"></span>
              Guardando...
            </>
          ) : (
            <>
              💾 Guardar Cambios
            </>
          )}
        </button>

        {Object.keys(cambiosPendientes).length > 0 && (
          <button 
            onClick={descartarCambios}
            className="btn-descartar-config"
            disabled={saving}
          >
            ❌ Descartar Cambios
          </button>
        )}
      </div>

      <div className="config-info-box">
        <h4>ℹ️ Información importante</h4>
        <ul>
          <li>✅ Los cambios solo afectarán a <strong>nuevas ventas</strong></li>
          <li>✅ Las comisiones de ventas ya completadas <strong>no cambiarán</strong></li>
          <li>✅ Se guarda un historial de todos los cambios realizados</li>
        </ul>
      </div>

      {/* Notificación Toast */}
      {showNotification && (
        <div className={`notification-toast notification-${notification.type}`}>
          <span className="notification-icon">
            {notification.type === 'success' ? '✅' : '❌'}
          </span>
          <span className="notification-message">{notification.message}</span>
          <button 
            className="notification-close"
            onClick={() => setShowNotification(false)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};