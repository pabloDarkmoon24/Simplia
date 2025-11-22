// src/components/WhatsAppButton/FormularioContacto.jsx
import { useState } from 'react';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Toast } from '../Toast/Toast';
import './FormularioContacto.css';

export const FormularioContacto = ({ distribuidor, onClose, onSubmit, planPreseleccionado = '' }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    producto: planPreseleccionado || '' // ← USAR PLAN PRESELECCIONADO
  });
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generarCodigoUnico = () => {
    const prefijo = distribuidor?.id?.toUpperCase().substring(0, 3) || 'SIM';
    const numero = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefijo}-${numero}`;
  };

  const mostrarToast = (type, title, message, code = null) => {
    setToastData({ type, title, message, code });
    setShowToast(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const codigoUnico = generarCodigoUnico();

      // Guardar lead en Firebase
      await addDoc(collection(db, 'leads'), {
        distribuidorId: distribuidor?.id || 'default',
        codigoUnico: codigoUnico,
        nombreCliente: formData.nombre,
        telefono: formData.telefono,
        email: formData.email,
        productoInteres: formData.producto,
        fechaHora: new Date().toISOString(),
        estado: 'pendiente'
      });

      // Actualizar contador de leads del distribuidor
      if (distribuidor?.id && distribuidor.id !== 'default') {
        const docRef = doc(db, 'distribuidores', distribuidor.id);
        await updateDoc(docRef, {
          'estadisticas.leads': increment(1)
        });
      }

      console.log('✅ Lead guardado con código:', codigoUnico);

      // Mostrar notificación de éxito
      mostrarToast(
        'success',
        '¡Registro exitoso! 🎉',
        'Redirigiendo a WhatsApp...',
        codigoUnico
      );

      // Esperar 2.5 segundos antes de continuar
      setTimeout(() => {
        setShowToast(false);
        onClose(); // Cerrar modal
        
        // Esperar un poco más y abrir WhatsApp
        setTimeout(() => {
          onSubmit({
            ...formData,
            codigo: codigoUnico
          });
        }, 300);
      }, 2500);

    } catch (error) {
      console.error('Error al guardar lead:', error);
      
      // Mostrar notificación de error
      mostrarToast(
        'error',
        'Error al procesar',
        'Hubo un problema. Por favor intenta de nuevo.'
      );
      
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={!loading ? onClose : undefined}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button 
            className="modal-close" 
            onClick={onClose}
            disabled={loading}
          >
            ✕
          </button>
          
          <h3>¡Hablemos! 👋</h3>
          <p className="modal-subtitle">Completa el formulario para continuar</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="nombre"
                placeholder="Tu nombre completo *"
                value={formData.nombre}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <input
                type="tel"
                name="telefono"
                placeholder="Tu WhatsApp (ej: 3001234567) *"
                value={formData.telefono}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Tu email (opcional)"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <select
                name="producto"
                value={formData.producto}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Selecciona un plan *</option>
                <option value="Plan Esencial 🎬">Plan Esencial 🎬</option>
                <option value="Plan Conectado 📱">Plan Conectado 📱</option>
                <option value="Plan Total 🌟">Plan Total 🌟</option>
                <option value="Cuentas Completas 📦">Cuentas Completas 📦</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Procesando...
                </>
              ) : (
                'Continuar a WhatsApp'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="toast-container">
          <Toast
            type={toastData.type}
            title={toastData.title}
            message={toastData.message}
            code={toastData.code}
            onClose={() => setShowToast(false)}
            duration={null}
          />
        </div>
      )}
    </>
  );
};