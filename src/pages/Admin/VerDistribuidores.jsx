// src/pages/Admin/VerDistribuidores.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc, increment, query, where } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';

export const VerDistribuidores = ({ onUpdate, leadsSinAtender }) => {
  const [distribuidores, setDistribuidores] = useState([]);
  const [leads, setLeads] = useState([]);
  const [leadsPorDistribuidor, setLeadsPorDistribuidor] = useState({});
  const [loading, setLoading] = useState(true);
  const [distribuidorSeleccionado, setDistribuidorSeleccionado] = useState(null);
  const [mostrarLeads, setMostrarLeads] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [distribuidorAEliminar, setDistribuidorAEliminar] = useState(null);
  const [comisionesConfig, setComisionesConfig] = useState({});
  
  // Estados para cambiar contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [distribuidorPassword, setDistribuidorPassword] = useState(null);
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [cambiandoPassword, setCambiandoPassword] = useState(false);

  useEffect(() => {
    cargarDistribuidores();
    cargarComisionesConfig();
    cargarLeadsSinAtender();
  }, []);

  const mostrarNotificacion = (type, message) => {
    setNotification({ type, message });
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  const cargarComisionesConfig = async () => {
    try {
      const docRef = doc(db, 'configuracion', 'comisiones');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setComisionesConfig(docSnap.data().planes || {});
      }
    } catch (error) {
      console.error('❌ Error al cargar configuración de comisiones:', error);
    }
  };

const cargarLeadsSinAtender = async () => {
  try {
    // NO usar query, cargar TODO y filtrar en cliente
    const leadsRef = collection(db, 'leads');
    const snapshot = await getDocs(leadsRef);
    const conteo = {};
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const distribuidorId = data.distribuidorId;
      const estado = data.estado;
      
      // Filtrar en el cliente
      if (distribuidorId && (estado === 'pendiente' || estado === 'contactado')) {
        conteo[distribuidorId] = (conteo[distribuidorId] || 0) + 1;
      }
    });
    
    setLeadsPorDistribuidor(conteo);
    console.log('🔔 Leads sin atender por distribuidor:', conteo);
  } catch (error) {
    console.error('❌ Error al cargar leads sin atender:', error);
  }
};
const cargarDistribuidores = async () => {
  try {
    console.log('📊 Iniciando carga de distribuidores...');
    
    // 1. Cargar distribuidores
    const distribuidoresRef = collection(db, 'distribuidores');
    const snapshot = await getDocs(distribuidoresRef);

    // 2. Cargar todos los clicks
    console.log('🖱️ Cargando clicks...');
    const clicksRef = collection(db, 'clicks');
    const clicksSnapshot = await getDocs(clicksRef);
    
    // Contar clicks por distribuidorId (que es el UID de Firebase Auth)
    const clicksPorUID = {};
    clicksSnapshot.forEach((clickDoc) => {
      const clickData = clickDoc.data();
      const uid = clickData.distribuidorId; // Este es el UID de Firebase Auth
      if (uid) {
        clicksPorUID[uid] = (clicksPorUID[uid] || 0) + 1;
      }
    });
    
    console.log('✅ Clicks contabilizados por UID:', clicksPorUID);
    console.log('📊 Total de clicks en sistema:', clicksSnapshot.size);

    // 3. Construir array de distribuidores
    const distribuidoresData = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const uid = docSnap.id; // Este es el UID del documento (Firebase Auth UID)
      
      const totalClicks = clicksPorUID[uid] || 0;
      
      console.log(`Distribuidor: ${data.nombre || 'Sin nombre'} (UID: ${uid}) - Clicks: ${totalClicks}`);
      
      distribuidoresData.push({
        ...data,
        uid: uid,
        docId: uid,
        // Mantener estadísticas originales pero actualizar clicks
        estadisticas: {
          clicks: totalClicks,
          leads: data.estadisticas?.leads || 0,
          conversiones: data.estadisticas?.conversiones || 0
        }
      });
    });

    // 4. Ordenar por fecha de creación
    distribuidoresData.sort((a, b) => {
      const dateA = new Date(a.fechaCreacion || 0);
      const dateB = new Date(b.fechaCreacion || 0);
      return dateB - dateA;
    });

    setDistribuidores(distribuidoresData);
    console.log('✅ Distribuidores cargados:', distribuidoresData);
  } catch (error) {
    console.error('❌ Error al cargar distribuidores:', error);
    mostrarNotificacion('error', 'Error al cargar distribuidores');
  } finally {
    setLoading(false);
  }
};

const cargarLeadsDistribuidor = async (distribuidorUID) => {
  try {
    console.log('📝 Cargando leads del distribuidor UID:', distribuidorUID);

    // IMPORTANTE: NO usar query con where()
    // Cargar TODOS los leads y filtrar en el cliente
    const leadsRef = collection(db, 'leads');
    const snapshot = await getDocs(leadsRef);

    const leadsData = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // Filtrar en el cliente
      if (data.distribuidorId === distribuidorUID) {
        leadsData.push({
          id: docSnap.id,
          ...data
        });
      }
    });

    leadsData.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));

    setLeads(leadsData);
    setMostrarLeads(true);
    console.log('✅ Leads cargados:', leadsData.length);
  } catch (error) {
    console.error('❌ Error al cargar leads:', error);
    mostrarNotificacion('error', 'Error al cargar leads: ' + error.message);
  }
};

  const copiarURL = (id) => {
    const url = `https://simpliacol.com/${id}`;
    navigator.clipboard.writeText(url);
    mostrarNotificacion('success', `✅ URL copiada: ${url}`);
  };

  const toggleActivo = async (distribuidorUID, estadoActual) => {
    try {
      const docRef = doc(db, 'distribuidores', distribuidorUID);
      await updateDoc(docRef, {
        activo: !estadoActual
      });

      setDistribuidores(distribuidores.map(d => 
        d.uid === distribuidorUID ? { ...d, activo: !estadoActual } : d
      ));

      mostrarNotificacion('success', `✅ Distribuidor ${!estadoActual ? 'activado' : 'desactivado'}`);
    } catch (error) {
      console.error('❌ Error al actualizar estado:', error);
      mostrarNotificacion('error', '❌ Error al actualizar estado');
    }
  };

  const solicitarEliminar = (distribuidor) => {
    setDistribuidorAEliminar(distribuidor);
    setShowConfirmDialog(true);
  };

  const confirmarEliminar = async () => {
    if (!distribuidorAEliminar) return;

    try {
      await deleteDoc(doc(db, 'distribuidores', distribuidorAEliminar.uid));
      
      setDistribuidores(distribuidores.filter(d => d.uid !== distribuidorAEliminar.uid));
      
      mostrarNotificacion('success', '✅ Distribuidor eliminado exitosamente');
      
      setTimeout(() => {
        cargarDistribuidores();
      }, 1000);

    } catch (error) {
      console.error('❌ Error al eliminar distribuidor:', error);
      mostrarNotificacion('error', '❌ Error al eliminar distribuidor');
    } finally {
      setShowConfirmDialog(false);
      setDistribuidorAEliminar(null);
    }
  };

  const cancelarEliminar = () => {
    setShowConfirmDialog(false);
    setDistribuidorAEliminar(null);
  };

  const verDetalle = (distribuidor) => {
    setDistribuidorSeleccionado(distribuidor);
    cargarLeadsDistribuidor(distribuidor.uid);
  };

  const cerrarDetalle = () => {
    setMostrarLeads(false);
    setDistribuidorSeleccionado(null);
    setLeads([]);
    cargarLeadsSinAtender();
    if (onUpdate) onUpdate();
  };

  const generarPasswordAleatoria = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const abrirModalPassword = (distribuidor) => {
    setDistribuidorPassword(distribuidor);
    setNuevaPassword(generarPasswordAleatoria());
    setShowPasswordModal(true);
  };

const cambiarPasswordDistribuidor = async () => {
  if (!nuevaPassword || nuevaPassword.trim().length < 6) {
    mostrarNotificacion('error', 'La contraseña debe tener al menos 6 caracteres');
    return;
  }

  setCambiandoPassword(true);

  try {
    console.log('🔑 Cambiando contraseña del distribuidor:', distribuidorPassword.email);

    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    
    if (!apiKey) {
      throw new Error('API Key de Firebase no configurada');
    }

    // Usar el endpoint correcto de Firebase Auth
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          localId: distribuidorPassword.uid,
          password: nuevaPassword.trim(),
          returnSecureToken: false
        })
      }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error('❌ Error de Firebase Auth:', data.error || data);
      throw new Error(data.error?.message || 'Error al cambiar contraseña');
    }

    console.log('✅ Contraseña actualizada en Firebase Auth');

    // Actualizar metadatos en Firestore
    const distribuidorRef = doc(db, 'distribuidores', distribuidorPassword.uid);
    await updateDoc(distribuidorRef, {
      ultimoCambioPassword: new Date().toISOString(),
      passwordCambiadaPorAdmin: true,
      adminQueCambio: auth.currentUser?.email || 'admin'
    });

    console.log('✅ Metadatos actualizados en Firestore');

    // Copiar credenciales al portapapeles
    const credenciales = `🔐 Credenciales de acceso - Simplia

📧 Email: ${distribuidorPassword.email}
🔑 Contraseña: ${nuevaPassword.trim()}

🌐 Portal: https://simpliacol.com/distribuidor/login

⚠️ Importante: Cambia tu contraseña después del primer inicio de sesión.`;
    
    await navigator.clipboard.writeText(credenciales);
    
    mostrarNotificacion('success', `✅ Contraseña de ${distribuidorPassword.nombre} actualizada correctamente`);
    
    setTimeout(() => {
      mostrarNotificacion('success', '📋 Credenciales copiadas al portapapeles');
    }, 1000);

    setTimeout(() => {
      setShowPasswordModal(false);
      setDistribuidorPassword(null);
      setNuevaPassword('');
    }, 2000);
    
    await cargarDistribuidores();

  } catch (error) {
    console.error('❌ Error al cambiar contraseña:', error);
    
    let mensajeError = 'Error al cambiar la contraseña';
    
    if (error.message.includes('USER_NOT_FOUND')) {
      mensajeError = 'Usuario no encontrado en Firebase Auth';
    } else if (error.message.includes('WEAK_PASSWORD')) {
      mensajeError = 'La contraseña es muy débil (mínimo 6 caracteres)';
    } else if (error.message.includes('INVALID_ID_TOKEN')) {
      mensajeError = 'Token inválido. Recarga la página';
    } else if (error.message.includes('API Key')) {
      mensajeError = 'Error de configuración. Verifica las variables de entorno';
    }
    
    mostrarNotificacion('error', `❌ ${mensajeError}`);
  } finally {
    setCambiandoPassword(false);
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
        mostrarNotificacion('success', '✅ Estado actualizado');
      }

      await updateDoc(docRef, actualizacion);

      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, ...actualizacion } : lead
      ));

      await cargarLeadsSinAtender();
      if (onUpdate) onUpdate();

    } catch (error) {
      console.error('❌ Error al actualizar estado:', error);
      mostrarNotificacion('error', '❌ Error al actualizar estado');
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <p>Cargando distribuidores...</p>
      </div>
    );
  }

  // Vista de Leads
  if (mostrarLeads && distribuidorSeleccionado) {
    const saldoDistribuidor = distribuidorSeleccionado.comisiones?.saldoDisponible || 0;
    const totalGanado = distribuidorSeleccionado.comisiones?.totalGanado || 0;

    return (
      <div className="leads-container">
        <button onClick={cerrarDetalle} className="btn-volver">
          ← Volver a Distribuidores
        </button>

        <div className="distribuidor-info">
          <h2>Leads de: {distribuidorSeleccionado.nombre}</h2>
          <p>
            <strong>ID:</strong> <code>{distribuidorSeleccionado.id}</code> | 
            <strong> WhatsApp:</strong> {distribuidorSeleccionado.whatsappContacto} | 
            <strong> email:</strong> {distribuidorSeleccionado.email} | 
            <strong> ciudad:</strong> {distribuidorSeleccionado.ciudad} | 
            <strong> cedula:</strong> {distribuidorSeleccionado.cedula} | 
          </p>
          <div className="stats-mini">
            <span>📊 Clicks: {distribuidorSeleccionado.estadisticas?.clicks || 0}</span>
            <span>📝 Leads: {distribuidorSeleccionado.estadisticas?.leads || 0}</span>
            <span>✅ Conversiones: {distribuidorSeleccionado.estadisticas?.conversiones || 0}</span>
            <span className="saldo-badge">💰 Saldo: {formatearMoneda(saldoDistribuidor)}</span>
            <span>📈 Total Ganado: {formatearMoneda(totalGanado)}</span>
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="empty-state">
            <p>No hay leads registrados para este distribuidor.</p>
          </div>
        ) : (
          <div className="tabla-leads">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Producto</th>
                  <th>Comisión</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td><code>{lead.codigoUnico}</code></td>
                    <td>{lead.nombreCliente}</td>
                    <td>
                      <a href={`https://wa.me/${lead.telefono}`} target="_blank" rel="noopener noreferrer">
                        {lead.telefono}
                      </a>
                    </td>
                    <td>{lead.email || '-'}</td>
                    <td>{lead.productoInteres}</td>
                    <td>
                      {lead.comision?.monto ? (
                        <span className="comision-monto">
                          {formatearMoneda(lead.comision.monto)}
                          {lead.comision.pagada && <span className="badge-pagada"> ✓</span>}
                        </span>
                      ) : (
                        <span style={{ color: '#ccc' }}>-</span>
                      )}
                    </td>
                    <td style={{ fontSize: '12px' }}>{formatearFecha(lead.fechaHora)}</td>
                    <td>
                      <span className={`badge badge-${lead.estado || 'pendiente'}`}>
                        {lead.estado === 'pendiente' ? '⏳ Pendiente' : 
                         lead.estado === 'contactado' ? '📞 Contactado' : 
                         lead.estado === 'compra_ejecutada' ? '✅ Ejecutada' :
                         lead.estado === 'cancelado' ? '❌ Cancelado' :
                         '✅ Cerrado'}
                      </span>
                    </td>
                    <td>
                      <select 
                        value={lead.estado || 'pendiente'} 
                        onChange={(e) => actualizarEstadoLead(lead.id, e.target.value, lead)}
                        className="select-estado"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="contactado">Contactado</option>
                        <option value="compra_ejecutada">Compra Ejecutada</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // Vista de Distribuidores
  return (
    <div className="ver-distribuidores-container">
      <h2>Distribuidores Registrados</h2>
      <p className="subtitle">Total: {distribuidores.length}</p>

      {distribuidores.length === 0 ? (
        <div className="empty-state">
          <p>No hay distribuidores registrados.</p>
          <p>Crea uno usando el botón "+ Crear Distribuidor"</p>
        </div>
      ) : (
        <div className="tabla-distribuidores">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>ID</th>
                <th>WhatsApp</th>
                <th>Clicks</th>
                <th>Leads</th>
                <th>Ventas</th>
                <th>Saldo</th>
                <th>Código Desc.</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {distribuidores.map((distribuidor) => (
                <tr key={distribuidor.uid} className={!distribuidor.activo ? 'inactivo' : ''}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div>
                        <strong>{distribuidor.nombre || 'Sin nombre'}</strong>
                        <br />
                        <small style={{ color: '#999' }}>{distribuidor.email || 'Sin email'}</small>
                      </div>
                      {leadsPorDistribuidor[distribuidor.uid] > 0 && (
                        <span className="badge-leads-nuevos">
                          {leadsPorDistribuidor[distribuidor.uid]} nuevo{leadsPorDistribuidor[distribuidor.uid] > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <code style={{ 
                      background: '#f5f5f5', 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}>
                      {distribuidor.id}
                    </code>
                  </td>
                  <td>{distribuidor.whatsappContacto || 'N/A'}</td>
                  <td className="stat-cell">{distribuidor.estadisticas?.clicks || 0}</td>
                  <td className="stat-cell">{distribuidor.estadisticas?.leads || 0}</td>
                  <td className="stat-cell">{distribuidor.estadisticas?.conversiones || 0}</td>
                  <td className="stat-cell saldo-cell">
                    {formatearMoneda(distribuidor.comisiones?.saldoDisponible || 0)}
                  </td>
                  <td>
                    {distribuidor.codigoDescuento ? (
                      <span className="codigo-descuento">{distribuidor.codigoDescuento}</span>
                    ) : (
                      <span style={{ color: '#ccc' }}>-</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${distribuidor.activo ? 'badge-activo' : 'badge-inactivo'}`}>
                      {distribuidor.activo ? '✅ Activo' : '⛔ Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="acciones-buttons">
                      <button 
                        onClick={() => verDetalle(distribuidor)}
                        className="btn-accion btn-ver"
                        title="Ver leads"
                        style={{ position: 'relative' }}
                      >
                        👁️
                        {leadsPorDistribuidor[distribuidor.uid] > 0 && (
                          <span className="badge-count-mini">{leadsPorDistribuidor[distribuidor.uid]}</span>
                        )}
                      </button>
                      <button 
                        onClick={() => copiarURL(distribuidor.id)}
                        className="btn-accion btn-copiar"
                        title="Copiar URL"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => abrirModalPassword(distribuidor)}
                        className="btn-accion btn-password"
                        title="Cambiar contraseña"
                      >
                        🔑
                      </button>
                      <button 
                        onClick={() => toggleActivo(distribuidor.uid, distribuidor.activo)}
                        className={`btn-accion ${distribuidor.activo ? 'btn-desactivar' : 'btn-activar'}`}
                        title={distribuidor.activo ? 'Desactivar' : 'Activar'}
                      >
                        {distribuidor.activo ? '⏸️' : '▶️'}
                      </button>
                      <button 
                        onClick={() => solicitarEliminar(distribuidor)}
                        className="btn-accion btn-eliminar"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showConfirmDialog && distribuidorAEliminar && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <div className="confirm-dialog-icon">⚠️</div>
            <h3>¿Eliminar distribuidor?</h3>
            <p>
              ¿Estás seguro de eliminar al distribuidor <strong>"{distribuidorAEliminar.nombre}"</strong>?
            </p>
            <p className="confirm-dialog-warning">
              Esta acción no se puede deshacer.
            </p>
            <div className="confirm-dialog-buttons">
              <button onClick={cancelarEliminar} className="btn-dialog-cancel">
                Cancelar
              </button>
              <button onClick={confirmarEliminar} className="btn-dialog-confirm">
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && distribuidorPassword && (
        <div className="modal-overlay" onClick={() => !cambiandoPassword && setShowPasswordModal(false)}>
          <div className="modal-password-admin" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔑 Cambiar Contraseña</h3>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="btn-close-modal"
                disabled={cambiandoPassword}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="distribuidor-info-password">
                <h4>{distribuidorPassword.nombre}</h4>
                <p>{distribuidorPassword.email}</p>
              </div>

              <div className="form-group">
                <label>Nueva contraseña *</label>
                <div className="password-generator">
                  <input
                    type="text"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    disabled={cambiandoPassword}
                  />
                  <button
                    onClick={() => setNuevaPassword(generarPasswordAleatoria())}
                    className="btn-regenerar-password"
                    disabled={cambiandoPassword}
                    type="button"
                  >
                    🔄
                  </button>
                </div>
                <small>La contraseña se copiará automáticamente al portapapeles</small>
              </div>

              <div className="password-preview">
                <div className="preview-item">
                  <span className="preview-label">Email:</span>
                  <span className="preview-value">{distribuidorPassword.email}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Password:</span>
                  <span className="preview-value password-value">{nuevaPassword}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="btn-modal-cancelar"
                disabled={cambiandoPassword}
              >
                Cancelar
              </button>
              <button 
                onClick={cambiarPasswordDistribuidor}
                className="btn-modal-confirmar"
                disabled={cambiandoPassword || !nuevaPassword || nuevaPassword.length < 6}
              >
                {cambiandoPassword ? (
                  <>
                    <span className="spinner-small"></span>
                    Cambiando...
                  </>
                ) : (
                  <>
                    🔑 Cambiar Contraseña
                  </>
                )}
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