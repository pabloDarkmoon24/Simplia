// src/pages/Distribuidor/ConfigurarDatosPago.jsx
import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const ConfigurarDatosPago = ({ distribuidor, onDatosActualizados }) => {
  const [formData, setFormData] = useState({
    banco: '',
    tipoCuenta: '',
    numeroCuenta: '',
    titular: ''
  });
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  useEffect(() => {
    if (distribuidor?.datosPago) {
      setFormData({
        banco: distribuidor.datosPago.banco || '',
        tipoCuenta: distribuidor.datosPago.tipoCuenta || '',
        numeroCuenta: distribuidor.datosPago.numeroCuenta || '',
        titular: distribuidor.datosPago.titular || distribuidor.nombre
      });
    }
  }, [distribuidor]);

  const mostrarNotificacion = (type, message) => {
    setNotification({ type, message });
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'numeroCuenta') {
      const soloNumeros = value.replace(/\D/g, '');
      setFormData({
        ...formData,
        [name]: soloNumeros
      });
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.banco || !formData.tipoCuenta || !formData.numeroCuenta || !formData.titular) {
      mostrarNotificacion('error', 'Por favor completa todos los campos');
      return;
    }

    if (formData.numeroCuenta.length < 8) {
      mostrarNotificacion('error', 'El número de cuenta debe tener al menos 8 dígitos');
      return;
    }

    setLoading(true);

    try {
      const docRef = doc(db, 'distribuidores', distribuidor.id);
      
      await updateDoc(docRef, {
        datosPago: {
          banco: formData.banco,
          tipoCuenta: formData.tipoCuenta,
          numeroCuenta: formData.numeroCuenta,
          titular: formData.titular,
          fechaActualizacion: new Date().toISOString()
        }
      });

      mostrarNotificacion('success', '✅ Datos de pago actualizados correctamente');
      
      if (onDatosActualizados) {
        setTimeout(() => {
          onDatosActualizados();
        }, 1000);
      }

    } catch (error) {
      console.error('Error al actualizar datos:', error);
      mostrarNotificacion('error', '❌ Error al guardar los datos');
    } finally {
      setLoading(false);
    }
  };

  const bancos = [
    'Bancolombia',
    'Banco de Bogotá',
    'Davivienda',
    'BBVA Colombia',
    'Banco de Occidente',
    'Banco Popular',
    'Banco Caja Social',
    'Banco AV Villas',
    'Banco Agrario',
    'Bancamía',
    'Nequi',
    'Daviplata',
    'Otro'
  ];

  return (
    <div className="configurar-datos-pago-container">
      <h2>⚙️ Configurar Datos de Pago</h2>
      <p className="subtitle">
        Completa tu información bancaria para recibir los pagos de tus comisiones
      </p>

      <form onSubmit={handleSubmit} className="form-datos-pago">
        
        <div className="form-group">
          <label htmlFor="banco">Banco / Entidad Financiera *</label>
          <select
            id="banco"
            name="banco"
            value={formData.banco}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Selecciona un banco</option>
            {bancos.map((banco) => (
              <option key={banco} value={banco}>{banco}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="tipoCuenta">Tipo de Cuenta *</label>
          <select
            id="tipoCuenta"
            name="tipoCuenta"
            value={formData.tipoCuenta}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Selecciona tipo de cuenta</option>
            <option value="Ahorros">Ahorros</option>
            <option value="Corriente">Corriente</option>
            <option value="Nequi">Nequi</option>
            <option value="Daviplata">Daviplata</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="numeroCuenta">Número de Cuenta *</label>
          <input
            type="text"
            id="numeroCuenta"
            name="numeroCuenta"
            value={formData.numeroCuenta}
            onChange={handleChange}
            placeholder="1234567890"
            required
            disabled={loading}
            maxLength="20"
          />
          <small className="input-hint">
            Ingresa solo números, sin espacios ni guiones
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="titular">Nombre del Titular *</label>
          <input
            type="text"
            id="titular"
            name="titular"
            value={formData.titular}
            onChange={handleChange}
            placeholder="Nombre completo como aparece en la cuenta"
            required
            disabled={loading}
          />
          <small className="input-hint">
            Debe coincidir exactamente con el nombre registrado en el banco
          </small>
        </div>

        <div className="datos-resumen">
          <h4>📋 Resumen de tus datos</h4>
          <div className="resumen-grid">
            <div className="resumen-item">
              <span className="label">Banco:</span>
              <span className="value">{formData.banco || '—'}</span>
            </div>
            <div className="resumen-item">
              <span className="label">Tipo:</span>
              <span className="value">{formData.tipoCuenta || '—'}</span>
            </div>
            <div className="resumen-item">
              <span className="label">Cuenta:</span>
              <span className="value">{formData.numeroCuenta || '—'}</span>
            </div>
            <div className="resumen-item">
              <span className="label">Titular:</span>
              <span className="value">{formData.titular || '—'}</span>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn-guardar-datos"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-small"></span>
              Guardando...
            </>
          ) : (
            <>
              💾 Guardar Datos de Pago
            </>
          )}
        </button>

        <div className="info-seguridad">
          <div className="info-icon">🔒</div>
          <div className="info-texto">
            <strong>Tu información está segura</strong>
            <p>Tus datos bancarios se guardan de forma segura y solo se usan para procesar tus pagos.</p>
          </div>
        </div>
      </form>

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