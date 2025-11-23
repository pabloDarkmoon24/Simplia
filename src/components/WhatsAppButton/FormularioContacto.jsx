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
    producto: planPreseleccionado || ''
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

      console.log('📝 Guardando lead para distribuidor UID:', distribuidor?.uid);

      await addDoc(collection(db, 'leads'), {
        distribuidorId: distribuidor?.uid || 'default',
        codigoUnico: codigoUnico,
        nombreCliente: formData.nombre,
        telefono: formData.telefono,
        email: formData.email || '',
        productoInteres: formData.producto,
        fechaHora: new Date().toISOString(),
        estado: 'pendiente'
      });

      console.log('✅ Lead guardado con código:', codigoUnico);

      if (distribuidor?.uid && distribuidor.uid !== 'default') {
        const docRef = doc(db, 'distribuidores', distribuidor.uid);
        await updateDoc(docRef, {
          'estadisticas.leads': increment(1)
        });
        console.log('✅ Contador de leads actualizado');
      }

      mostrarToast(
        'success',
        '¡Registro exitoso! 🎉',
        'Redirigiendo a WhatsApp...',
        codigoUnico
      );

      setTimeout(() => {
        setShowToast(false);
        
        const mensaje = `¡Hola! Soy ${formData.nombre}. Mi código es: *${codigoUnico}*. Estoy interesado en ${formData.producto}`;
        const whatsappNumber = distribuidor?.whatsapp || '573001234567';
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
        
        console.log('📱 Abriendo WhatsApp:', url);
        
        const whatsappWindow = window.open(url, '_blank');
        
        if (!whatsappWindow || whatsappWindow.closed || typeof whatsappWindow.closed === 'undefined') {
          window.location.href = url;
        }
        
        onClose();
        setLoading(false);

      }, 2500);

    } catch (error) {
      console.error('❌ Error al guardar lead:', error);
      
      mostrarToast(
        'error',
        'Error al procesar',
        'Hubo un problema. Por favor intenta de nuevo.'
      );
      
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <>
      {/* Modal del Formulario - CON CLASE WRAPPER */}
      <div className="formulario-contacto modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button 
            className="modal-close" 
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar"
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
                autoComplete="name"
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
                autoComplete="tel"
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
                autoComplete="email"
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

          <p className="modal-footer-text">
            Tus datos están seguros con nosotros
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          type={toastData.type}
          title={toastData.title}
          message={toastData.message}
          code={toastData.code}
          onClose={() => setShowToast(false)}
          duration={null}
        />
      )}
    </>
  );
};