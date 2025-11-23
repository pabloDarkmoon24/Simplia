// src/pages/Admin/SolicitudesRetiro.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';

export const SolicitudesRetiro = ({ onUpdate }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  
  // Estados para el modal de SUBIR comprobante
  const [showComprobanteModal, setShowComprobanteModal] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [comprobante, setComprobante] = useState({
    imagen: null,
    imagenBase64: null,
    imagenPreview: null,
    referencia: '',
    observaciones: ''
  });
  const [subiendoComprobante, setSubiendoComprobante] = useState(false);

  // Estados para el modal de VER comprobante
  const [showVerComprobanteModal, setShowVerComprobanteModal] = useState(false);
  const [comprobanteVerSeleccionado, setComprobanteVerSeleccionado] = useState(null);

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const mostrarNotificacion = (type, message) => {
    setNotification({ type, message });
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  const cargarSolicitudes = async () => {
    try {
      const solicitudesRef = collection(db, 'solicitudesRetiro');
      const snapshot = await getDocs(solicitudesRef);

      const solicitudesData = [];
      snapshot.forEach((doc) => {
        solicitudesData.push({
          id: doc.id,
          ...doc.data()
        });
      });

      solicitudesData.sort((a, b) => {
        if (a.estado === 'pendiente' && b.estado !== 'pendiente') return -1;
        if (a.estado !== 'pendiente' && b.estado === 'pendiente') return 1;
        return new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud);
      });

      setSolicitudes(solicitudesData);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      mostrarNotificacion('error', 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalComprobante = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setShowComprobanteModal(true);
    setComprobante({
      imagen: null,
      imagenBase64: null,
      imagenPreview: null,
      referencia: `PAGO-${Date.now()}`,
      observaciones: ''
    });
  };

  const verComprobanteAdmin = (solicitud) => {
    setComprobanteVerSeleccionado(solicitud);
    setShowVerComprobanteModal(true);
  };

  const comprimirYConvertirImagen = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          let width = img.width;
          let height = img.height;
          const maxWidth = 1200;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          const sizeInKB = Math.round((base64.length * 0.75) / 1024);
          
          console.log(`✅ Imagen comprimida: ${sizeInKB}KB`);
          resolve(base64);
        };
        
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImagenChange = async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      mostrarNotificacion('error', 'Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      mostrarNotificacion('error', 'La imagen no debe superar 10MB');
      return;
    }

    try {
      mostrarNotificacion('success', '🔄 Comprimiendo imagen...');
      
      const base64 = await comprimirYConvertirImagen(file);
      
      setComprobante({
        ...comprobante,
        imagen: file,
        imagenBase64: base64,
        imagenPreview: base64
      });
      
      mostrarNotificacion('success', '✅ Imagen lista para subir');
      
    } catch (error) {
      console.error('Error al procesar imagen:', error);
      mostrarNotificacion('error', '❌ Error al procesar la imagen');
    }
  };

  const procesarSolicitudConComprobante = async () => {
    if (!comprobante.imagenBase64) {
      mostrarNotificacion('error', 'Debes subir una imagen del comprobante');
      return;
    }

    if (!comprobante.referencia.trim()) {
      mostrarNotificacion('error', 'Debes ingresar una referencia de pago');
      return;
    }

    setSubiendoComprobante(true);

    try {
      const solicitud = solicitudSeleccionada;
      const timestamp = Date.now();

      console.log('📤 Iniciando procesamiento de pago...');

      const batch = writeBatch(db);
      const montoTotal = solicitud.monto;
      const leadsIncluidos = solicitud.leadsIncluidos;

      leadsIncluidos.forEach(lead => {
        const leadRef = doc(db, 'leads', lead.leadId);
        batch.update(leadRef, {
          'comision.pagada': true,
          'comision.fechaPago': new Date().toISOString()
        });
      });

      const pagoRef = await addDoc(collection(db, 'pagosComisiones'), {
        distribuidorId: solicitud.distribuidorId,
        distribuidorNombre: solicitud.distribuidorNombre,
        distribuidorEmail: solicitud.distribuidorEmail,
        monto: montoTotal,
        leadsIncluidos: leadsIncluidos,
        metodoPago: 'Transferencia Bancaria',
        banco: solicitud.datosPago?.banco || 'No especificado',
        numeroCuenta: solicitud.datosPago?.numeroCuenta || 'No especificado',
        referenciaPago: comprobante.referencia.trim(),
        observaciones: comprobante.observaciones.trim() || `Pago procesado desde solicitud de retiro ${solicitud.id}`,
        fechaPago: new Date().toISOString(),
        realizadoPor: auth.currentUser?.email || 'admin',
        estado: 'completado',
        solicitudId: solicitud.id,
        comprobante: {
          imagenBase64: comprobante.imagenBase64,
          nombreArchivo: `comprobante_${solicitud.distribuidorId}_${timestamp}.jpg`,
          fechaSubida: new Date().toISOString(),
          subidoPor: auth.currentUser?.email || 'admin',
          tipoImagen: 'image/jpeg'
        }
      });

      console.log('✅ Pago registrado con ID:', pagoRef.id);

      const distribuidorRef = doc(db, 'distribuidores', solicitud.distribuidorId);
      const distribuidorSnap = await getDocs(collection(db, 'distribuidores'));
      let distribuidorData = null;

      distribuidorSnap.forEach((docSnap) => {
        if (docSnap.id === solicitud.distribuidorId) {
          distribuidorData = docSnap.data();
        }
      });

      if (distribuidorData) {
        const comisionesActuales = distribuidorData.comisiones || {
          saldoDisponible: 0,
          totalGanado: 0,
          totalPagado: 0
        };

        batch.update(distribuidorRef, {
          'comisiones.saldoDisponible': Math.max(0, comisionesActuales.saldoDisponible - montoTotal),
          'comisiones.totalPagado': (comisionesActuales.totalPagado || 0) + montoTotal
        });
      }

      leadsIncluidos.forEach(lead => {
        const leadRef = doc(db, 'leads', lead.leadId);
        batch.update(leadRef, {
          'comision.comprobantePagoId': pagoRef.id
        });
      });

      const solicitudRef = doc(db, 'solicitudesRetiro', solicitud.id);
      batch.update(solicitudRef, {
        estado: 'procesada',
        fechaProcesamiento: new Date().toISOString(),
        procesadoPor: auth.currentUser?.email || 'admin',
        pagoId: pagoRef.id,
        comprobante: {
          imagenBase64: comprobante.imagenBase64,
          referencia: comprobante.referencia.trim(),
          fechaSubida: new Date().toISOString()
        }
      });

      await batch.commit();

      console.log('✅ Todas las operaciones completadas exitosamente');

      mostrarNotificacion('success', `✅ Pago procesado exitosamente - ${formatearMoneda(montoTotal)}`);
      
      setShowComprobanteModal(false);
      setSolicitudSeleccionada(null);
      setComprobante({
        imagen: null,
        imagenBase64: null,
        imagenPreview: null,
        referencia: '',
        observaciones: ''
      });
      
      await cargarSolicitudes();
      
      if (onUpdate) onUpdate();

    } catch (error) {
      console.error('❌ Error al procesar solicitud:', error);
      console.error('Detalles del error:', error.message);
      mostrarNotificacion('error', `❌ Error al procesar pago: ${error.message}`);
    } finally {
      setSubiendoComprobante(false);
    }
  };

const rechazarSolicitud = async (solicitud) => {
  const motivo = window.prompt('Ingresa el motivo del rechazo:');
  
  if (!motivo || motivo.trim() === '') return;

  setProcesando(solicitud.id);

  try {
    console.log('❌ Rechazando solicitud:', solicitud.id);

    // 🔓 PASO 1: DESBLOQUEAR LOS LEADS (devolver disponibilidad)
    console.log('🔓 Desbloqueando leads para que puedan solicitar retiro de nuevo...');
    
    const desbloquearPromises = solicitud.leadsIncluidos.map(async (lead) => {
      const leadRef = doc(db, 'leads', lead.leadId);
      return updateDoc(leadRef, {
        'comision.enProcesoRetiro': false,
        'comision.solicitudRetiroId': null,
        'comision.fechaSolicitudRetiro': null
      });
    });

    await Promise.all(desbloquearPromises);
    console.log('✅ Leads desbloqueados - ahora pueden volver a solicitar retiro');

    // 📝 PASO 2: MARCAR SOLICITUD COMO RECHAZADA
    const solicitudRef = doc(db, 'solicitudesRetiro', solicitud.id);
    
    await updateDoc(solicitudRef, {
      estado: 'rechazada',
      motivoRechazo: motivo.trim(),
      fechaRechazo: new Date().toISOString(),
      rechazadoPor: auth.currentUser?.email || 'admin'
    });

    console.log('✅ Solicitud marcada como rechazada');

    mostrarNotificacion('success', '✅ Solicitud rechazada. Los leads están disponibles de nuevo para el distribuidor.');
    await cargarSolicitudes();
    
    if (onUpdate) onUpdate();

  } catch (error) {
    console.error('❌ Error al rechazar solicitud:', error);
    mostrarNotificacion('error', '❌ Error al rechazar solicitud');
  } finally {
    setProcesando(null);
  }
};

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Cargando solicitudes...</p>
      </div>
    );
  }

  const solicitudesPendientes = solicitudes.filter(s => s.estado === 'pendiente');
  const solicitudesProcesadas = solicitudes.filter(s => s.estado === 'procesada');
  const solicitudesRechazadas = solicitudes.filter(s => s.estado === 'rechazada');

  return (
    <div className="solicitudes-retiro-container">
      <h2>📨 Solicitudes de Retiro</h2>
      <p className="subtitle">
        {solicitudesPendientes.length} solicitud(es) pendiente(s)
      </p>

      {/* Solicitudes Pendientes */}
      {solicitudesPendientes.length > 0 && (
        <div className="solicitudes-section">
          <h3>⏳ Pendientes de Aprobación</h3>
          
          <div className="solicitudes-grid">
            {solicitudesPendientes.map((solicitud) => (
              <div key={solicitud.id} className="solicitud-card pendiente">
                <div className="solicitud-header">
                  <div>
                    <h4>{solicitud.distribuidorNombre}</h4>
                    <p className="solicitud-email">{solicitud.distribuidorEmail}</p>
                  </div>
                  <div className="solicitud-monto">
                    {formatearMoneda(solicitud.monto)}
                  </div>
                </div>

                <div className="solicitud-body">
                  <div className="solicitud-info-grid">
                    <div className="info-item">
                      <span className="label">Fecha Solicitud:</span>
                      <span className="value">{formatearFecha(solicitud.fechaSolicitud)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Leads Incluidos:</span>
                      <span className="value">{solicitud.leadsIncluidos.length}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Banco:</span>
                      <span className="value">{solicitud.datosPago?.banco || 'No especificado'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Cuenta:</span>
                      <span className="value">{solicitud.datosPago?.numeroCuenta || 'No especificado'}</span>
                    </div>
                  </div>

                  <div className="solicitud-leads">
                    <strong>Leads incluidos en este pago:</strong>
                    <ul>
                      {solicitud.leadsIncluidos.map((lead, index) => (
                        <li key={index}>
                          <code>{lead.codigoUnico}</code> - {lead.nombreCliente} ({formatearMoneda(lead.comision)})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="solicitud-actions">
                  <button 
                    onClick={() => rechazarSolicitud(solicitud)}
                    className="btn-rechazar"
                    disabled={procesando === solicitud.id}
                  >
                    {procesando === solicitud.id ? '⏳' : '❌'} Rechazar
                  </button>
                  <button 
                    onClick={() => abrirModalComprobante(solicitud)}
                    className="btn-aprobar"
                    disabled={procesando === solicitud.id}
                  >
                    ✅ Aprobar y Subir Comprobante
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {solicitudesPendientes.length === 0 && (
        <div className="empty-state">
          <p>✅ No hay solicitudes pendientes</p>
        </div>
      )}

      {/* Solicitudes Procesadas */}
      {solicitudesProcesadas.length > 0 && (
        <div className="solicitudes-section">
          <h3>✅ Procesadas</h3>
          
          <div className="tabla-solicitudes">
            <table>
              <thead>
                <tr>
                  <th>Distribuidor</th>
                  <th>Monto</th>
                  <th>Referencia</th>
                  <th>Fecha Solicitud</th>
                  <th>Fecha Procesamiento</th>
                  <th>Comprobante</th>
                </tr>
              </thead>
              <tbody>
                {solicitudesProcesadas.map((solicitud) => (
                  <tr key={solicitud.id}>
                    <td>
                      <strong>{solicitud.distribuidorNombre}</strong>
                      <br />
                      <small>{solicitud.distribuidorEmail}</small>
                    </td>
                    <td className="monto-procesado">{formatearMoneda(solicitud.monto)}</td>
                    <td>
                      <code>{solicitud.comprobante?.referencia || 'N/A'}</code>
                    </td>
                    <td>{formatearFecha(solicitud.fechaSolicitud)}</td>
                    <td>{formatearFecha(solicitud.fechaProcesamiento)}</td>
                    <td>
                      {solicitud.comprobante?.imagenBase64 ? (
                        <button
                          onClick={() => verComprobanteAdmin(solicitud)}
                          className="btn-ver-comprobante"
                        >
                          🖼️ Ver
                        </button>
                      ) : (
                        <span style={{ color: '#999' }}>Sin comprobante</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Solicitudes Rechazadas */}
      {solicitudesRechazadas.length > 0 && (
        <div className="solicitudes-section">
          <h3>❌ Rechazadas</h3>
          
          <div className="tabla-solicitudes">
            <table>
              <thead>
                <tr>
                  <th>Distribuidor</th>
                  <th>Monto</th>
                  <th>Fecha Solicitud</th>
                  <th>Fecha Rechazo</th>
                  <th>Motivo Rechazo</th>
                </tr>
              </thead>
              <tbody>
                {solicitudesRechazadas.map((solicitud) => (
                  <tr key={solicitud.id}>
                    <td>
                      <strong>{solicitud.distribuidorNombre}</strong>
                      <br />
                      <small>{solicitud.distribuidorEmail}</small>
                    </td>
                    <td className="monto-rechazado">{formatearMoneda(solicitud.monto)}</td>
                    <td>{formatearFecha(solicitud.fechaSolicitud)}</td>
                    <td>{formatearFecha(solicitud.fechaRechazo)}</td>
                    <td><small>{solicitud.motivoRechazo}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal SUBIR Comprobante */}
      {showComprobanteModal && solicitudSeleccionada && (
        <div className="modal-overlay" onClick={() => !subiendoComprobante && setShowComprobanteModal(false)}>
          <div className="modal-comprobante" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📸 Subir Comprobante de Pago</h3>
              <button 
                onClick={() => setShowComprobanteModal(false)}
                className="btn-close-modal"
                disabled={subiendoComprobante}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="pago-info-resumen">
                <div className="info-row">
                  <span className="label">Distribuidor:</span>
                  <span className="value">{solicitudSeleccionada.distribuidorNombre}</span>
                </div>
                <div className="info-row">
                  <span className="label">Monto a pagar:</span>
                  <span className="value destacado">{formatearMoneda(solicitudSeleccionada.monto)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Cuenta:</span>
                  <span className="value">
                    {solicitudSeleccionada.datosPago?.banco} - {solicitudSeleccionada.datosPago?.numeroCuenta}
                  </span>
                </div>
              </div>

              <div className="upload-section">
                <label className="upload-label">
                  <span className="label-text">Comprobante de pago *</span>
                  <div className={`upload-area ${comprobante.imagenPreview ? 'has-image' : ''}`}>
                    {comprobante.imagenPreview ? (
                      <div className="image-preview">
                        <img src={comprobante.imagenPreview} alt="Preview" />
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            setComprobante({
                              ...comprobante,
                              imagen: null,
                              imagenBase64: null,
                              imagenPreview: null
                            });
                          }}
                          className="btn-remove-image"
                          type="button"
                        >
                          🗑️ Cambiar imagen
                        </button>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <span className="upload-icon">📸</span>
                        <p>Click para seleccionar imagen</p>
                        <small>JPG, PNG o WEBP (máx. 10MB - se comprimirá automáticamente)</small>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImagenChange}
                      disabled={subiendoComprobante}
                      style={{ display: 'none' }}
                    />
                  </div>
                </label>
              </div>

              <div className="form-group">
                <label>Referencia de pago *</label>
                <input
                  type="text"
                  value={comprobante.referencia}
                  onChange={(e) => setComprobante({ ...comprobante, referencia: e.target.value })}
                  placeholder="Ej: PAGO-20250121-001"
                  disabled={subiendoComprobante}
                />
              </div>

              <div className="form-group">
                <label>Observaciones (opcional)</label>
                <textarea
                  value={comprobante.observaciones}
                  onChange={(e) => setComprobante({ ...comprobante, observaciones: e.target.value })}
                  placeholder="Notas adicionales sobre el pago..."
                  rows="3"
                  disabled={subiendoComprobante}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => setShowComprobanteModal(false)}
                className="btn-modal-cancelar"
                disabled={subiendoComprobante}
              >
                Cancelar
              </button>
              <button 
                onClick={procesarSolicitudConComprobante}
                className="btn-modal-confirmar"
                disabled={subiendoComprobante || !comprobante.imagenBase64 || !comprobante.referencia.trim()}
              >
                {subiendoComprobante ? (
                  <>
                    <span className="spinner-small"></span>
                    Procesando...
                  </>
                ) : (
                  <>
                    ✅ Procesar Pago
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal VER Comprobante (IGUAL AL CLIENTE) */}
      {showVerComprobanteModal && comprobanteVerSeleccionado && (
        <div className="modal-overlay-dist" onClick={() => setShowVerComprobanteModal(false)}>
          <div className="modal-comprobante-dist" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-dist">
              <h3>🖼️ Comprobante de Pago</h3>
              <button 
                onClick={() => setShowVerComprobanteModal(false)}
                className="btn-close-modal-dist"
              >
                ✕
              </button>
            </div>

            <div className="modal-body-dist">
              <div className="comprobante-info">
                <div className="info-row-dist">
                  <span className="label">Monto:</span>
                  <span className="value destacado">{formatearMoneda(comprobanteVerSeleccionado.monto)}</span>
                </div>
                <div className="info-row-dist">
                  <span className="label">Referencia:</span>
                  <span className="value"><code>{comprobanteVerSeleccionado.comprobante?.referencia}</code></span>
                </div>
                <div className="info-row-dist">
                  <span className="label">Fecha de pago:</span>
                  <span className="value">{formatearFecha(comprobanteVerSeleccionado.fechaProcesamiento)}</span>
                </div>
                {comprobanteVerSeleccionado.comprobante?.observaciones && (
                  <div className="info-row-dist observaciones">
                    <span className="label">Observaciones:</span>
                    <span className="value">{comprobanteVerSeleccionado.comprobante.observaciones}</span>
                  </div>
                )}
              </div>

              {comprobanteVerSeleccionado.comprobante?.imagenBase64 ? (
                <>
                  <div className="comprobante-imagen-container">
                    <img 
                      src={comprobanteVerSeleccionado.comprobante.imagenBase64} 
                      alt="Comprobante de pago"
                      className="comprobante-imagen"
                    />
                  </div>

                  <a 
                    href={comprobanteVerSeleccionado.comprobante.imagenBase64} 
                    download={`comprobante_${comprobanteVerSeleccionado.distribuidorNombre}_${comprobanteVerSeleccionado.comprobante.referencia}.jpg`}
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
                onClick={() => setShowVerComprobanteModal(false)}
                className="btn-cerrar-modal-dist"
              >
                Cerrar
              </button>
            </div>
          </div>
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

