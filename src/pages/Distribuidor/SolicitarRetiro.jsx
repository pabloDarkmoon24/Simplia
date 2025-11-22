// src/pages/Distribuidor/SolicitarRetiro.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const SolicitarRetiro = ({ distribuidor, onRetiroSolicitado }) => {
  const [leadsPendientes, setLeadsPendientes] = useState([]);
  const [leadsSeleccionados, setLeadsSeleccionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  useEffect(() => {
    cargarLeadsPendientes();
  }, [distribuidor]);

  const mostrarNotificacion = (type, message) => {
    setNotification({ type, message });
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  const cargarLeadsPendientes = async () => {
    try {
      const leadsRef = collection(db, 'leads');
      const q = query(
        leadsRef,
        where('distribuidorId', '==', distribuidor.id),
        where('estado', '==', 'compra_ejecutada')
      );
      
      const snapshot = await getDocs(q);
      const leadsData = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.comision?.monto > 0 && !data.comision?.pagada) {
          leadsData.push({
            id: doc.id,
            ...data
          });
        }
      });

      leadsData.sort((a, b) => new Date(a.fechaCompra) - new Date(b.fechaCompra));
      setLeadsPendientes(leadsData);
    } catch (error) {
      console.error('Error al cargar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLeadSeleccionado = (leadId) => {
    if (leadsSeleccionados.includes(leadId)) {
      setLeadsSeleccionados(leadsSeleccionados.filter(id => id !== leadId));
    } else {
      setLeadsSeleccionados([...leadsSeleccionados, leadId]);
    }
  };

  const seleccionarTodos = () => {
    if (leadsSeleccionados.length === leadsPendientes.length) {
      setLeadsSeleccionados([]);
    } else {
      setLeadsSeleccionados(leadsPendientes.map(lead => lead.id));
    }
  };

  const calcularTotalSeleccionado = () => {
    return leadsPendientes
      .filter(lead => leadsSeleccionados.includes(lead.id))
      .reduce((total, lead) => total + (lead.comision?.monto || 0), 0);
  };

  const solicitarRetiro = async () => {
    if (leadsSeleccionados.length === 0) {
      mostrarNotificacion('error', 'Selecciona al menos una comisión');
      return;
    }

    if (!distribuidor.datosPago?.banco || !distribuidor.datosPago?.numeroCuenta) {
      mostrarNotificacion('error', 'Configura tus datos de pago primero');
      return;
    }

    setProcesando(true);

    try {
      const montoTotal = calcularTotalSeleccionado();
      const leadsIncluidos = leadsPendientes
        .filter(lead => leadsSeleccionados.includes(lead.id))
        .map(lead => ({
          leadId: lead.id,
          codigoUnico: lead.codigoUnico,
          nombreCliente: lead.nombreCliente,
          producto: lead.productoInteres,
          comision: lead.comision.monto,
          fechaVenta: lead.fechaCompra
        }));

      // Crear solicitud de retiro
      await addDoc(collection(db, 'solicitudesRetiro'), {
        distribuidorId: distribuidor.id,
        distribuidorNombre: distribuidor.nombre,
        distribuidorEmail: distribuidor.email,
        monto: montoTotal,
        leadsIncluidos: leadsIncluidos,
        datosPago: distribuidor.datosPago,
        estado: 'pendiente',
        fechaSolicitud: new Date().toISOString()
      });

      mostrarNotificacion('success', '✅ Solicitud enviada correctamente. El administrador procesará tu pago pronto.');
      
      setLeadsSeleccionados([]);
      
      setTimeout(() => {
        if (onRetiroSolicitado) onRetiroSolicitado();
      }, 2000);

    } catch (error) {
      console.error('Error al solicitar retiro:', error);
      mostrarNotificacion('error', '❌ Error al enviar solicitud');
    } finally {
      setProcesando(false);
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
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Cargando información...</p>
      </div>
    );
  }

  const montoSeleccionado = calcularTotalSeleccionado();
  const saldoDisponible = distribuidor.comisiones?.saldoDisponible || 0;

  return (
    <div className="solicitar-retiro-container">
      <h2>💳 Solicitar Retiro</h2>

      {!distribuidor.datosPago?.banco && (
        <div className="alerta-configurar">
          ⚠️ <strong>Debes configurar tus datos de pago antes de solicitar un retiro</strong>
          <p>Ve a la sección "Datos de Pago" para completar tu información bancaria.</p>
        </div>
      )}

      <div className="saldo-info-card">
        <div className="saldo-disponible">
          <span className="label">Saldo Disponible:</span>
          <span className="monto">{formatearMoneda(saldoDisponible)}</span>
        </div>
        {distribuidor.datosPago?.banco && (
          <div className="datos-pago-resumen">
            <strong>Datos de pago configurados:</strong>
            <p>{distribuidor.datosPago.banco} - {distribuidor.datosPago.numeroCuenta}</p>
          </div>
        )}
      </div>

      {leadsPendientes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <p>No tienes comisiones pendientes para retirar</p>
          <p>Las comisiones aparecerán aquí cuando tus leads sean marcados como "Compra Ejecutada"</p>
        </div>
      ) : (
        <>
          <div className="seleccion-header">
            <button onClick={seleccionarTodos} className="btn-seleccionar-todos">
              {leadsSeleccionados.length === leadsPendientes.length ? '☑️' : '☐'} 
              {' '}Seleccionar todos ({leadsPendientes.length})
            </button>
            {leadsSeleccionados.length > 0 && (
              <div className="seleccion-info">
                <span>{leadsSeleccionados.length} seleccionado(s)</span>
                <span className="monto-seleccionado">
                  {formatearMoneda(montoSeleccionado)}
                </span>
              </div>
            )}
          </div>

          <div className="tabla-retiro">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>
                    <input
                      type="checkbox"
                      checked={leadsSeleccionados.length === leadsPendientes.length}
                      onChange={seleccionarTodos}
                    />
                  </th>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Producto</th>
                  <th>Comisión</th>
                  <th>Fecha Venta</th>
                </tr>
              </thead>
              <tbody>
                {leadsPendientes.map((lead) => (
                  <tr 
                    key={lead.id}
                    className={leadsSeleccionados.includes(lead.id) ? 'seleccionado' : ''}
                    onClick={() => toggleLeadSeleccionado(lead.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={leadsSeleccionados.includes(lead.id)}
                        onChange={() => toggleLeadSeleccionado(lead.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td><code>{lead.codigoUnico}</code></td>
                    <td>{lead.nombreCliente}</td>
                    <td>{lead.productoInteres}</td>
                    <td className="comision-cell">
                      {formatearMoneda(lead.comision?.monto || 0)}
                    </td>
                    <td>{formatearFecha(lead.fechaCompra)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {leadsSeleccionados.length > 0 && distribuidor.datosPago?.banco && (
            <div className="retiro-footer">
              <button 
                onClick={solicitarRetiro}
                className="btn-solicitar-retiro"
                disabled={procesando}
              >
                {procesando ? (
                  <>
                    <span className="spinner-small"></span>
                    Enviando solicitud...
                  </>
                ) : (
                  <>
                    💳 Solicitar Retiro de {formatearMoneda(montoSeleccionado)}
                  </>
                )}
              </button>
            </div>
          )}
        </>
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