// src/pages/Distribuidor/MisLeads.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';

export const MisLeads = ({ distribuidorId }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (distribuidorId) {
      cargarLeads();
    }
  }, [distribuidorId]);

  const cargarLeads = async () => {
    try {
      console.log('📝 Cargando leads para distribuidor:', distribuidorId);

      const user = auth.currentUser;
      if (!user) {
        console.error('❌ No hay usuario autenticado');
        setError('Debes iniciar sesión');
        setLoading(false);
        return;
      }

      const leadsRef = collection(db, 'leads');
      const q = query(
        leadsRef,
        where('distribuidorId', '==', user.uid)
      );
      
      const snapshot = await getDocs(q);
      const leadsData = [];

      snapshot.forEach((doc) => {
        leadsData.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Ordenar por fecha más reciente
      leadsData.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));

      console.log('✅ Leads cargados:', leadsData.length);
      setLeads(leadsData);
      setError(null);

    } catch (error) {
      console.error('❌ Error al cargar leads:', error);
      setError('Error al cargar leads');
    } finally {
      setLoading(false);
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

  const obtenerBadgeEstado = (estado) => {
    const badges = {
      pendiente: { emoji: '⏳', texto: 'Pendiente', clase: 'badge-pendiente' },
      contactado: { emoji: '📞', texto: 'Contactado', clase: 'badge-contactado' },
      compra_ejecutada: { emoji: '✅', texto: 'Completada', clase: 'badge-completada' },
      cancelado: { emoji: '❌', texto: 'Cancelado', clase: 'badge-cancelado' }
    };

    return badges[estado] || badges.pendiente;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Cargando leads...</p>
      </div>
    );
  }

  return (
    <div className="mis-leads-container">
      <h2>📝 Mis Leads</h2>
      <p className="subtitle">Total de leads: {leads.length}</p>

      {leads.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>Aún no tienes leads registrados</p>
          <p>Comparte tu enlace para empezar a recibir clientes</p>
        </div>
      ) : (
        <div className="tabla-leads">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Cliente</th>

                <th>Producto</th>
                <th>Estado</th>
                <th>Comisión</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const badge = obtenerBadgeEstado(lead.estado);
                return (
                  <tr key={lead.id}>
                    <td><code>{lead.codigoUnico}</code></td>
                    <td>
                      <strong>{lead.nombreCliente}</strong>
                      {lead.email && <><br /><small>{lead.email}</small></>}
                    </td>

                    <td>{lead.productoInteres}</td>
                    <td>
                      <span className={`badge ${badge.clase}`}>
                        {badge.emoji} {badge.texto}
                      </span>
                    </td>
                    <td>
                      {lead.comision?.monto ? (
                        <span className={`comision-monto ${lead.comision.pagada ? 'pagada' : ''}`}>
                          {formatearMoneda(lead.comision.monto)}
                          {lead.comision.pagada && <span className="badge-pagado">✓ Pagado</span>}
                        </span>
                      ) : (
                        <span className="sin-comision">Sin comisión</span>
                      )}
                    </td>
                    <td>{formatearFecha(lead.fechaHora)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};