// src/pages/Admin/BuscadorGlobal.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const BuscadorGlobal = ({ onNavigateToDistribuidor }) => {
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [comisionesConfig, setComisionesConfig] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // ✅ CORRECCIÓN: useEffect en lugar de useState
  useEffect(() => {
    cargarComisionesConfig();
  }, []);

  const cargarComisionesConfig = async () => {
    try {
      const docRef = doc(db, 'configuracion', 'comisiones');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setComisionesConfig(docSnap.data().planes || {});
      }
    } catch (error) {
      console.error('Error al cargar comisiones:', error);
    }
  };

  const mostrarNotificacion = (type, message) => {
    setNotification({ type, message });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  };

  const buscar = async (e) => {
    e.preventDefault();
    
    if (!terminoBusqueda.trim()) {
      setResultados([]);
      setMostrarResultados(false);
      return;
    }

    setBuscando(true);
    setResultados([]);

    try {
      const termino = terminoBusqueda.trim().toLowerCase();
      let resultadosEncontrados = [];

      const distribuidoresRef = collection(db, 'distribuidores');
      const distribuidoresSnapshot = await getDocs(distribuidoresRef);
      
      distribuidoresSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id.toLowerCase();
        const nombre = (data.nombre || '').toLowerCase();
        const email = (data.email || '').toLowerCase();
        
        if (id.includes(termino) || nombre.includes(termino) || email.includes(termino)) {
          resultadosEncontrados.push({
            tipo: 'distribuidor',
            id: docSnap.id,
            nombre: data.nombre,
            email: data.email,
            whatsapp: data.whatsapp,
            estadisticas: data.estadisticas,
            comisiones: data.comisiones,
            activo: data.activo
          });
        }
      });

      const leadsRef = collection(db, 'leads');
      const leadsSnapshot = await getDocs(leadsRef);
      
      const leadsEncontrados = [];
      const distribuidoresDeLeads = new Set();

      leadsSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const codigoUnico = (data.codigoUnico || '').toLowerCase();
        const nombreCliente = (data.nombreCliente || '').toLowerCase();
        const telefono = (data.telefono || '').toLowerCase();
        
        if (codigoUnico.includes(termino) || 
            nombreCliente.includes(termino) || 
            telefono.includes(termino)) {
          leadsEncontrados.push({
            tipo: 'lead',
            id: docSnap.id,
            codigoUnico: data.codigoUnico,
            nombreCliente: data.nombreCliente,
            telefono: data.telefono,
            email: data.email,
            productoInteres: data.productoInteres,
            estado: data.estado,
            distribuidorId: data.distribuidorId,
            fechaHora: data.fechaHora,
            comision: data.comision
          });
          
          if (data.distribuidorId) {
            distribuidoresDeLeads.add(data.distribuidorId);
          }
        }
      });

      for (const distribuidorId of distribuidoresDeLeads) {
        const distribuidorDoc = distribuidoresSnapshot.docs.find(d => d.id === distribuidorId);
        if (distribuidorDoc) {
          const data = distribuidorDoc.data();
          if (!resultadosEncontrados.find(r => r.id === distribuidorId)) {
            resultadosEncontrados.push({
              tipo: 'distribuidor_por_lead',
              id: distribuidorDoc.id,
              nombre: data.nombre,
              email: data.email,
              whatsapp: data.whatsapp,
              estadisticas: data.estadisticas,
              comisiones: data.comisiones,
              activo: data.activo,
              leadsRelacionados: leadsEncontrados.filter(l => l.distribuidorId === distribuidorId)
            });
          }
        }
      }

      resultadosEncontrados.push(...leadsEncontrados);
      setResultados(resultadosEncontrados);
      setMostrarResultados(true);

    } catch (error) {
      console.error('Error al buscar:', error);
      mostrarNotificacion('error', 'Error al realizar la búsqueda');
    } finally {
      setBuscando(false);
    }
  };

  const actualizarEstadoLead = async (leadId, nuevoEstado, leadData) => {
    try {
      const docRef = doc(db, 'leads', leadId);
      const estadoAnterior = leadData.estado;
      
      const actualizacion = {
        estado: nuevoEstado
      };

      if (nuevoEstado === 'compra_ejecutada' && 
          estadoAnterior !== 'compra_ejecutada' && 
          !leadData.comision?.monto) {
        
        const montoComision = comisionesConfig[leadData.productoInteres] || 0;
        
        actualizacion.comision = {
          monto: montoComision,
          montoOriginal: montoComision,
          pagada: false,
          fechaPago: null,
          comprobantePagoId: null
        };
        actualizacion.fechaCompra = new Date().toISOString();

        const distribuidorRef = doc(db, 'distribuidores', leadData.distribuidorId);
        const distribuidorSnap = await getDoc(distribuidorRef);
        
        if (distribuidorSnap.exists()) {
          const comisionesActuales = distribuidorSnap.data().comisiones || {
            saldoDisponible: 0,
            totalGanado: 0,
            totalPagado: 0
          };

          await updateDoc(distribuidorRef, {
            'comisiones.saldoDisponible': comisionesActuales.saldoDisponible + montoComision,
            'comisiones.totalGanado': comisionesActuales.totalGanado + montoComision,
            'estadisticas.conversiones': increment(1)
          });

          mostrarNotificacion('success', `✅ Estado actualizado - Comisión: ${formatearMoneda(montoComision)}`);
        }
      } else {
        mostrarNotificacion('success', '✅ Estado actualizado correctamente');
      }

      await updateDoc(docRef, actualizacion);

      setResultados(resultados.map(r => {
        if (r.tipo === 'lead' && r.id === leadId) {
          return { ...r, ...actualizacion };
        }
        return r;
      }));

    } catch (error) {
      console.error('Error al actualizar estado:', error);
      mostrarNotificacion('error', '❌ Error al actualizar estado');
    }
  };

  const irADistribuidor = (distribuidorId) => {
    if (onNavigateToDistribuidor) {
      onNavigateToDistribuidor(distribuidorId);
      limpiarBusqueda();
    }
  };

  const limpiarBusqueda = () => {
    setTerminoBusqueda('');
    setResultados([]);
    setMostrarResultados(false);
  };

  const copiarTexto = (texto, mensaje) => {
    navigator.clipboard.writeText(texto);
    mostrarNotificacion('success', mensaje || '✅ Copiado al portapapeles');
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const formatearMoneda = (valor) => {
    if (!valor || isNaN(valor)) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  };

  return (
    <div className="buscador-global">
      <form onSubmit={buscar} className="buscador-form">
        <div className="buscador-input-wrapper">
          <span className="buscador-icon">🔍</span>
          <input
            type="text"
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            placeholder="Buscar por código de distribuidor, código de lead, teléfono o nombre..."
            className="buscador-input"
          />
          {terminoBusqueda && (
            <button
              type="button"
              onClick={limpiarBusqueda}
              className="btn-limpiar-busqueda"
            >
              ✕
            </button>
          )}
        </div>
        <button 
          type="submit" 
          className="btn-buscar"
          disabled={buscando}
        >
          {buscando ? (
            <>
              <span className="spinner-small"></span>
              Buscando...
            </>
          ) : (
            '🔎 Buscar'
          )}
        </button>
      </form>

      {mostrarResultados && (
        <div className="resultados-busqueda">
          {resultados.length === 0 ? (
            <div className="sin-resultados">
              <p>❌ No se encontraron resultados para "{terminoBusqueda}"</p>
            </div>
          ) : (
            <>
              <div className="resultados-header">
                <h3>📊 Resultados de búsqueda ({resultados.length})</h3>
                <button onClick={limpiarBusqueda} className="btn-cerrar-resultados">
                  Cerrar
                </button>
              </div>

              <div className="resultados-lista">
                {resultados.map((resultado, index) => {
                  if (resultado.tipo === 'distribuidor' || resultado.tipo === 'distribuidor_por_lead') {
                    return (
                      <div key={index} className="resultado-item distribuidor-item">
                        <div className="resultado-header">
                          <div className="resultado-tipo-badge distribuidor-badge">
                            👤 DISTRIBUIDOR
                            {resultado.tipo === 'distribuidor_por_lead' && (
                              <span className="badge-secundario">vía lead</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span className={`estado-badge ${resultado.activo ? 'activo' : 'inactivo'}`}>
                              {resultado.activo ? '✅ Activo' : '⛔ Inactivo'}
                            </span>
                            <button
                              onClick={() => irADistribuidor(resultado.id)}
                              className="btn-ver-distribuidor"
                              title="Ver detalles completos"
                            >
                              👁️ Ver Detalles
                            </button>
                          </div>
                        </div>

                        <div className="resultado-contenido">
                          <div className="resultado-info-principal">
                            <h4>{resultado.nombre}</h4>
                            <div className="info-grid">
                              <div className="info-item">
                                <span className="label">ID:</span>
                                <code 
                                  onClick={() => copiarTexto(resultado.id, '✅ ID copiado')}
                                  className="clickable-code"
                                  title="Click para copiar"
                                >
                                  {resultado.id}
                                </code>
                              </div>
                              <div className="info-item">
                                <span className="label">Email:</span>
                                <span>{resultado.email}</span>
                              </div>
                              <div className="info-item">
                                <span className="label">WhatsApp:</span>
                                <a 
                                  href={`https://wa.me/${resultado.whatsapp}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="link-whatsapp"
                                >
                                  {resultado.whatsapp}
                                </a>
                              </div>
                            </div>
                          </div>

                          <div className="resultado-stats">
                            <div className="stat-mini">
                              <span className="stat-label">Clicks:</span>
                              <span className="stat-valor">{resultado.estadisticas?.clicks || 0}</span>
                            </div>
                            <div className="stat-mini">
                              <span className="stat-label">Leads:</span>
                              <span className="stat-valor">{resultado.estadisticas?.leads || 0}</span>
                            </div>
                            <div className="stat-mini">
                              <span className="stat-label">Ventas:</span>
                              <span className="stat-valor">{resultado.estadisticas?.conversiones || 0}</span>
                            </div>
                            <div className="stat-mini saldo">
                              <span className="stat-label">Saldo:</span>
                              <span className="stat-valor">
                                {formatearMoneda(resultado.comisiones?.saldoDisponible || 0)}
                              </span>
                            </div>
                          </div>

                          {resultado.leadsRelacionados && resultado.leadsRelacionados.length > 0 && (
                            <div className="leads-relacionados">
                              <h5>🔗 Leads relacionados con tu búsqueda:</h5>
                              {resultado.leadsRelacionados.map((lead, idx) => (
                                <div key={idx} className="lead-mini">
                                  <code>{lead.codigoUnico}</code> - {lead.nombreCliente} ({lead.telefono})
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  if (resultado.tipo === 'lead') {
                    return (
                      <div key={index} className="resultado-item lead-item">
                        <div className="resultado-header">
                          <div className="resultado-tipo-badge lead-badge">
                            📝 LEAD
                          </div>
                          <span className={`badge badge-${resultado.estado || 'pendiente'}`}>
                            {resultado.estado === 'pendiente' && '⏳ Pendiente'}
                            {resultado.estado === 'contactado' && '📞 Contactado'}
                            {resultado.estado === 'compra_ejecutada' && '✅ Ejecutada'}
                            {resultado.estado === 'cancelado' && '❌ Cancelado'}
                          </span>
                        </div>

                        <div className="resultado-contenido">
                          <div className="resultado-info-principal">
                            <h4>{resultado.nombreCliente}</h4>
                            <div className="info-grid">
                              <div className="info-item">
                                <span className="label">Código:</span>
                                <code 
                                  onClick={() => copiarTexto(resultado.codigoUnico, '✅ Código copiado')}
                                  className="clickable-code"
                                  title="Click para copiar"
                                >
                                  {resultado.codigoUnico}
                                </code>
                              </div>
                              <div className="info-item">
                                <span className="label">Teléfono:</span>
                                <a 
                                  href={`https://wa.me/${resultado.telefono}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="link-whatsapp"
                                >
                                  {resultado.telefono}
                                </a>
                              </div>
                              <div className="info-item">
                                <span className="label">Email:</span>
                                <span>{resultado.email || 'N/A'}</span>
                              </div>
                              <div className="info-item">
                                <span className="label">Producto:</span>
                                <span className="producto-tag">{resultado.productoInteres}</span>
                              </div>
                              <div className="info-item">
                                <span className="label">Fecha:</span>
                                <span>{formatearFecha(resultado.fechaHora)}</span>
                              </div>
                              {resultado.comision?.monto > 0 && (
                                <div className="info-item comision-info">
                                  <span className="label">Comisión:</span>
                                  <span className="comision-valor">
                                    {formatearMoneda(resultado.comision.monto)}
                                    {resultado.comision.pagada && <span className="badge-pagada"> ✓ Pagada</span>}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="lead-acciones">
                            <div className="accion-item">
                              <span className="accion-label">Cambiar estado:</span>
                              <select 
                                value={resultado.estado || 'pendiente'} 
                                onChange={(e) => actualizarEstadoLead(resultado.id, e.target.value, resultado)}
                                className="select-estado-buscador"
                              >
                                <option value="pendiente">⏳ Pendiente</option>
                                <option value="contactado">📞 Contactado</option>
                                <option value="compra_ejecutada">✅ Compra Ejecutada</option>
                                <option value="cancelado">❌ Cancelado</option>
                              </select>
                            </div>
                            {resultado.distribuidorId && (
                              <button
                                onClick={() => irADistribuidor(resultado.distribuidorId)}
                                className="btn-ver-distribuidor-lead"
                              >
                                👤 Ver Distribuidor
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </>
          )}
        </div>
      )}

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