// src/pages/Distribuidor/MisComisiones.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';

export const MisComisiones = ({ distribuidorId }) => {
  const [leads, setLeads] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [solicitudesRetiro, setSolicitudesRetiro] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState(null);
  const [showComprobanteModal, setShowComprobanteModal] = useState(false);
  const [filtroHistorial, setFiltroHistorial] = useState('todos');

  useEffect(() => {
    cargarDatos();
  }, [distribuidorId]);

  const cargarDatos = async () => {
    try {
      // Obtener UID del usuario autenticado
      const user = auth.currentUser;
      
      if (!user) {
        console.error('❌ No hay usuario autenticado');
        setLoading(false);
        return;
      }

      const distribuidorUID = user.uid;
      console.log('🔍 Cargando datos para distribuidor UID:', distribuidorUID);

      // ========================================
      // CARGAR LEADS CON COMISIÓN
      // ========================================
      console.log('📝 Cargando leads...');
      const leadsRef = collection(db, 'leads');
      const snapshotLeads = await getDocs(leadsRef);
      const leadsData = [];

      snapshotLeads.forEach((doc) => {
        const data = doc.data();
        
        // Filtrar por distribuidorId, estado y que tenga comisión
        if (
          data.distribuidorId === distribuidorUID &&
          data.estado === 'compra_ejecutada' &&
          data.comision?.monto > 0
        ) {
          leadsData.push({
            id: doc.id,
            ...data
          });
        }
      });

      leadsData.sort((a, b) => new Date(b.fechaCompra) - new Date(a.fechaCompra));
      console.log('✅ Leads cargados:', leadsData.length);
      setLeads(leadsData);

      // ========================================
      // CARGAR HISTORIAL DE PAGOS
      // ========================================
      console.log('💰 Cargando historial de pagos...');
      const pagosRef = collection(db, 'pagosComisiones');
      const snapshotPagos = await getDocs(pagosRef);
      const pagosData = [];

      snapshotPagos.forEach((doc) => {
        const data = doc.data();
        
        // Filtrar por distribuidorId
        if (data.distribuidorId === distribuidorUID) {
          pagosData.push({
            id: doc.id,
            ...data
          });
        }
      });

      pagosData.sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));
      console.log('✅ Pagos cargados:', pagosData.length);
      setPagos(pagosData);

      // ========================================
      // CARGAR SOLICITUDES DE RETIRO
      // ========================================
      console.log('📋 Cargando solicitudes de retiro...');
      const solicitudesRef = collection(db, 'solicitudesRetiro');
      const snapshotSolicitudes = await getDocs(solicitudesRef);
      const solicitudesData = [];

      snapshotSolicitudes.forEach((doc) => {
        const data = doc.data();
        
        // Filtrar por distribuidorId
        if (data.distribuidorId === distribuidorUID) {
          solicitudesData.push({
            id: doc.id,
            ...data
          });
        }
      });

      solicitudesData.sort((a, b) => {
        const dateA = a.fechaSolicitud ? new Date(a.fechaSolicitud) : new Date(0);
        const dateB = b.fechaSolicitud ? new Date(b.fechaSolicitud) : new Date(0);
        return dateB - dateA;
      });

      console.log('✅ Solicitudes cargadas:', solicitudesData.length);
      setSolicitudesRetiro(solicitudesData);

    } catch (error) {
      console.error('❌ Error al cargar comisiones:', error);
    } finally {
      setLoading(false);
    }
  };

  const verComprobante = (pago) => {
    setComprobanteSeleccionado(pago);
    setShowComprobanteModal(true);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
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

  const leadsPendientes = leads.filter(l => !l.comision?.pagada && !l.comision?.enProcesoRetiro);
  const leadsEnProceso = leads.filter(l => !l.comision?.pagada && l.comision?.enProcesoRetiro);
  
  const solicitudesPendientes = solicitudesRetiro.filter(s => s.estado === 'pendiente');
  const solicitudesRechazadas = solicitudesRetiro.filter(s => s.estado === 'rechazada');

  const historialFiltrado = () => {
    if (filtroHistorial === 'todos') {
      return [...pagos, ...solicitudesRechazadas].sort((a, b) => {
        const dateA = a.fechaPago ? new Date(a.fechaPago) : new Date(a.fechaSolicitud);
        const dateB = b.fechaPago ? new Date(b.fechaPago) : new Date(b.fechaSolicitud);
        return dateB - dateA;
      });
    }
    if (filtroHistorial === 'aprobados') return pagos;
    if (filtroHistorial === 'rechazados') return solicitudesRechazadas;
    return [];
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Cargando comisiones...</p>
      </div>
    );
  }

  return (
    <div className="mis-comisiones-container">
      <h2>💰 Mis Comisiones</h2>

      {/* Comisiones Pendientes */}
      <div className="comisiones-section">
        <h3>⏳ Comisiones Pendientes de Pago</h3>
        
        {leadsPendientes.length === 0 ? (
          <div className="empty-state-small">
            <p>No tienes comisiones pendientes disponibles para retiro</p>
            {leadsEnProceso.length > 0 && (
              <p>Tienes {leadsEnProceso.length} comisión(es) en proceso de retiro</p>
            )}
          </div>
        ) : (
          <div className="tabla-comisiones">
            <table>
              <thead>
                <tr>
                  <th>Código Lead</th>
                  <th>Cliente</th>
                  <th>Producto</th>
                  <th>Comisión</th>
                  <th>Fecha Venta</th>
                </tr>
              </thead>
              <tbody>
                {leadsPendientes.map((lead) => (
                  <tr key={lead.id}>
                    <td><code>{lead.codigoUnico}</code></td>
                    <td>{lead.nombreCliente}</td>
                    <td>{lead.productoInteres}</td>
                    <td className="comision-pendiente">
                      {formatearMoneda(lead.comision?.monto || 0)}
                    </td>
                    <td>{formatearFecha(lead.fechaCompra)}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan="3" style={{ textAlign: 'right', fontWeight: 700 }}>
                    TOTAL PENDIENTE:
                  </td>
                  <td className="total-pendiente" colSpan="2">
                    {formatearMoneda(
                      leadsPendientes.reduce((sum, lead) => sum + (lead.comision?.monto || 0), 0)
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Comisiones en Proceso de Retiro */}
      {leadsEnProceso.length > 0 && (
        <div className="comisiones-section">
          <h3>⏰ En Proceso de Retiro</h3>
          <p className="subtitle">Estas comisiones están incluidas en solicitudes pendientes de aprobación</p>
          
          <div className="tabla-comisiones">
            <table>
              <thead>
                <tr>
                  <th>Código Lead</th>
                  <th>Cliente</th>
                  <th>Producto</th>
                  <th>Comisión</th>
                  <th>Fecha Solicitud</th>
                </tr>
              </thead>
              <tbody>
                {leadsEnProceso.map((lead) => (
                  <tr key={lead.id}>
                    <td><code>{lead.codigoUnico}</code></td>
                    <td>{lead.nombreCliente}</td>
                    <td>{lead.productoInteres}</td>
                    <td className="comision-monto">
                      {formatearMoneda(lead.comision?.monto || 0)}
                    </td>
                    <td>{formatearFecha(lead.comision?.fechaSolicitudRetiro)}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan="3" style={{ textAlign: 'right', fontWeight: 700 }}>
                    TOTAL EN PROCESO:
                  </td>
                  <td className="total-pendiente" colSpan="2">
                    {formatearMoneda(
                      leadsEnProceso.reduce((sum, lead) => sum + (lead.comision?.monto || 0), 0)
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Solicitudes Pendientes */}
      {solicitudesPendientes.length > 0 && (
        <div className="comisiones-section">
          <h3>📋 Solicitudes Pendientes de Aprobación</h3>
          
          <div className="historial-pagos-grid">
            {solicitudesPendientes.map((solicitud) => (
              <div key={solicitud.id} className="pago-card pendiente">
                <div className="pago-card-header">
                  <span className="pago-fecha">
                    {formatearFecha(solicitud.fechaSolicitud)}
                  </span>
                  <span className="badge badge-pendiente">
                    ⏳ Pendiente
                  </span>
                </div>
                <div className="pago-card-body">
                  <div className="pago-monto">
                    {formatearMoneda(solicitud.monto)}
                  </div>
                  <div className="pago-detalles">
                    <div className="pago-detalle">
                      <span className="label">Leads incluidos:</span>
                      <span className="value">{solicitud.leadsIncluidos?.length || 0}</span>
                    </div>
                    <div className="pago-detalle">
                      <span className="label">Estado:</span>
                      <span className="value">Esperando aprobación del administrador</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historial de Pagos y Rechazos */}
      <div className="comisiones-section">
        <h3>📜 Historial de Solicitudes</h3>
        
        {/* Filtros */}
        <div className="historial-filtros">
          <button
            className={filtroHistorial === 'todos' ? 'active' : ''}
            onClick={() => setFiltroHistorial('todos')}
          >
            Todos ({pagos.length + solicitudesRechazadas.length})
          </button>
          <button
            className={filtroHistorial === 'aprobados' ? 'active' : ''}
            onClick={() => setFiltroHistorial('aprobados')}
          >
            ✅ Aprobados ({pagos.length})
          </button>
          <button
            className={filtroHistorial === 'rechazados' ? 'active' : ''}
            onClick={() => setFiltroHistorial('rechazados')}
          >
            ❌ Rechazados ({solicitudesRechazadas.length})
          </button>
        </div>
        
        {historialFiltrado().length === 0 ? (
          <div className="empty-state-small">
            <p>
              {filtroHistorial === 'todos' && 'Aún no tienes historial'}
              {filtroHistorial === 'aprobados' && 'Aún no has recibido pagos'}
              {filtroHistorial === 'rechazados' && 'No tienes solicitudes rechazadas'}
            </p>
          </div>
        ) : (
          <div className="historial-pagos-grid">
            {historialFiltrado().map((item) => {
              const esRechazo = item.estado === 'rechazada';
              
              return (
                <div key={item.id} className={'pago-card ' + (esRechazo ? 'rechazada' : '')}>
                  <div className="pago-card-header">
                    <span className="pago-fecha">
                      {formatearFecha(esRechazo ? item.fechaRechazo : item.fechaPago)}
                    </span>
                    <span className={esRechazo ? 'badge badge-cancelado' : 'badge badge-completada'}>
                      {esRechazo ? '❌ Rechazado' : '✅ Pagado'}
                    </span>
                  </div>
                  <div className="pago-card-body">
                    <div className="pago-monto">
                      {formatearMoneda(item.monto)}
                    </div>
                    <div className="pago-detalles">
                      {!esRechazo && (
                        <>
                          <div className="pago-detalle">
                            <span className="label">Método:</span>
                            <span className="value">{item.metodoPago}</span>
                          </div>
                          <div className="pago-detalle">
                            <span className="label">Referencia:</span>
                            <span className="value"><code>{item.referenciaPago}</code></span>
                          </div>
                        </>
                      )}
                      
                      {esRechazo && (
                        <>
                          <div className="pago-detalle">
                            <span className="label">Fecha Solicitud:</span>
                            <span className="value">{formatearFecha(item.fechaSolicitud)}</span>
                          </div>
                          {item.motivoRechazo && (
                            <div className="pago-detalle motivo-rechazo">
                              <span className="label">Motivo:</span>
                              <span className="value">{item.motivoRechazo}</span>
                            </div>
                          )}
                        </>
                      )}
                      
                      <div className="pago-detalle">
                        <span className="label">Leads incluidos:</span>
                        <span className="value">{item.leadsIncluidos?.length || 0}</span>
                      </div>
                      
                      {!esRechazo && item.comprobante?.imagenBase64 && (
                        <div className="pago-detalle comprobante-disponible">
                          <span className="label">Comprobante:</span>
                          <button 
                            onClick={() => verComprobante(item)}
                            className="btn-ver-comprobante-dist"
                          >
                            🖼️ Ver Comprobante
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resumen Total */}
      <div className="resumen-comisiones">
        <div className="resumen-item">
          <span className="resumen-label">Total Comisiones Generadas:</span>
          <span className="resumen-valor">
            {formatearMoneda(
              leads.reduce((sum, lead) => sum + (lead.comision?.monto || 0), 0)
            )}
          </span>
        </div>
        <div className="resumen-item">
          <span className="resumen-label">Total Pagado:</span>
          <span className="resumen-valor pagado">
            {formatearMoneda(
              pagos.reduce((sum, pago) => sum + pago.monto, 0)
            )}
          </span>
        </div>
        <div className="resumen-item">
          <span className="resumen-label">En Proceso de Retiro:</span>
          <span className="resumen-valor">
            {formatearMoneda(
              leadsEnProceso.reduce((sum, lead) => sum + (lead.comision?.monto || 0), 0)
            )}
          </span>
        </div>
        <div className="resumen-item">
          <span className="resumen-label">Disponible para Retiro:</span>
          <span className="resumen-valor pendiente">
            {formatearMoneda(
              leadsPendientes.reduce((sum, lead) => sum + (lead.comision?.monto || 0), 0)
            )}
          </span>
        </div>
      </div>

      {/* Modal Ver Comprobante */}
      {showComprobanteModal && comprobanteSeleccionado && (
        <div className="modal-overlay-dist" onClick={() => setShowComprobanteModal(false)}>
          <div className="modal-comprobante-dist" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-dist">
              <h3>🖼️ Comprobante de Pago</h3>
              <button 
                onClick={() => setShowComprobanteModal(false)}
                className="btn-close-modal-dist"
              >
                ✕
              </button>
            </div>

            <div className="modal-body-dist">
              <div className="comprobante-info">
                <div className="info-row-dist">
                  <span className="label">Monto:</span>
                  <span className="value destacado">{formatearMoneda(comprobanteSeleccionado.monto)}</span>
                </div>
                <div className="info-row-dist">
                  <span className="label">Referencia:</span>
                  <span className="value"><code>{comprobanteSeleccionado.referenciaPago}</code></span>
                </div>
                <div className="info-row-dist">
                  <span className="label">Fecha de pago:</span>
                  <span className="value">{formatearFecha(comprobanteSeleccionado.fechaPago)}</span>
                </div>
                {comprobanteSeleccionado.observaciones && (
                  <div className="info-row-dist observaciones">
                    <span className="label">Observaciones:</span>
                    <span className="value">{comprobanteSeleccionado.observaciones}</span>
                  </div>
                )}
              </div>

              {comprobanteSeleccionado.comprobante?.imagenBase64 ? (
                <>
                  <div className="comprobante-imagen-container">
                    <img 
                      src={comprobanteSeleccionado.comprobante.imagenBase64} 
                      alt="Comprobante de pago"
                      className="comprobante-imagen"
                    />
                  </div>

                  <a 
                    href={comprobanteSeleccionado.comprobante.imagenBase64} 
                    download={`comprobante_${comprobanteSeleccionado.referenciaPago}.jpg`}
                    className="btn-descargar-comprobante"
                  >
                    📥 Descargar Comprobante
                  </a>
                </>
              ) : (
                <div className="sin-comprobante">
                  <p>⚠️ Este pago no tiene comprobante adjunto</p>
                </div>
              )}
            </div>

            <div className="modal-footer-dist">
              <button 
                onClick={() => setShowComprobanteModal(false)}
                className="btn-cerrar-modal-dist"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};