// src/pages/Admin/CrearDistribuidor.jsx
import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase/config';

export const CrearDistribuidor = ({ onCreado }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    whatsapp: '',
    email: '',
    codigoDescuento: ''
  });
  const [idGenerado, setIdGenerado] = useState('');
  const [passwordGenerada, setPasswordGenerada] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  useEffect(() => {
    generarNuevoId();
    generarPassword();
  }, []);

  const generarIdUnico = () => {
    const timestamp = Date.now().toString(36);
    const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let aleatorio = '';
    for (let i = 0; i < 4; i++) {
      aleatorio += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    const idCompleto = (timestamp + aleatorio).toLowerCase();
    return idCompleto.slice(-8);
  };

  const generarPassword = () => {
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    setPasswordGenerada(password);
    return password;
  };

  const generarNuevoId = () => {
    const nuevoId = generarIdUnico();
    setIdGenerado(nuevoId);
    console.log('✅ ID generado:', nuevoId);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'whatsapp') {
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

  const mostrarNotificacion = (type, message) => {
    setNotification({ type, message });
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const validarFormulario = () => {
    if (!formData.nombre.trim()) {
      mostrarNotificacion('error', 'El nombre es obligatorio');
      return false;
    }
    
    if (!formData.whatsapp.trim()) {
      mostrarNotificacion('error', 'El WhatsApp es obligatorio');
      return false;
    }
    
    if (formData.whatsapp.length < 10) {
      mostrarNotificacion('error', 'El WhatsApp debe tener al menos 10 dígitos');
      return false;
    }
    
    if (!formData.email.trim()) {
      mostrarNotificacion('error', 'El email es obligatorio para el login');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      mostrarNotificacion('error', 'El email no es válido');
      return false;
    }

    if (passwordGenerada.length < 6) {
      mostrarNotificacion('error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    setLoading(true);

    // ✅ GUARDAR SESIÓN DEL ADMIN
    const adminUser = auth.currentUser;

    try {
      console.log('📤 Creando distribuidor con ID:', idGenerado);

      const email = formData.email.trim().toLowerCase();
      const password = passwordGenerada;

      // ============================================
      // PASO 1: CREAR USUARIO EN FIREBASE AUTH
      // ============================================
      console.log('🔐 Creando usuario en Firebase Auth...');
      
      let userCredential;
      let uid;

      // ✅ CREAR EN UNA NUEVA INSTANCIA DE AUTH (TEMPORAL)
      // Esto evita cerrar la sesión del admin
      try {
        // Crear usando fetch a la API de Firebase directamente
        const response = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${import.meta.env.VITE_FIREBASE_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              password: password,
              returnSecureToken: true
            })
          }
        );

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message);
        }

        uid = data.localId;
        console.log('✅ Usuario creado con UID:', uid);

      } catch (authError) {
        console.error('❌ Error en Firebase Auth:', authError);
        
        if (authError.message.includes('EMAIL_EXISTS')) {
          mostrarNotificacion('error', '❌ Este email ya está registrado');
        } else if (authError.message.includes('WEAK_PASSWORD')) {
          mostrarNotificacion('error', '❌ La contraseña debe tener al menos 6 caracteres');
        } else if (authError.message.includes('INVALID_EMAIL')) {
          mostrarNotificacion('error', '❌ Email inválido');
        } else {
          mostrarNotificacion('error', `❌ Error: ${authError.message}`);
        }
        setLoading(false);
        return;
      }

      // ============================================
      // PASO 2: CREAR DOCUMENTO EN FIRESTORE
      // ============================================
      const distribuidorData = {
        id: idGenerado,
        uid: uid,
        codigoDistribuidor: idGenerado,
        nombre: formData.nombre.trim(),
        whatsapp: formData.whatsapp.trim(),
        email: email,
        codigoDescuento: formData.codigoDescuento.trim().toUpperCase() || null,
        activo: true,
        rol: 'distribuidor',
        fechaCreacion: new Date().toISOString(),
        
        datosPago: {
          tipoCuenta: '',
          banco: '',
          numeroCuenta: '',
          titular: formData.nombre.trim()
        },
        
        comisiones: {
          saldoDisponible: 0,
          totalGanado: 0,
          totalPagado: 0
        },
        
        estadisticas: {
          clicks: 0,
          leads: 0,
          conversiones: 0
        }
      };

      console.log('📦 Guardando datos en Firestore...');
      const idDocRef = doc(db, 'distribuidores', uid);
      await setDoc(idDocRef, distribuidorData);
      console.log('✅ Documento creado en Firestore');

      // ============================================
      // PASO 3: NOTIFICAR ÉXITO
      // ============================================
      mostrarNotificacion('success', '✅ ¡Distribuidor creado exitosamente!');
      
      // Copiar credenciales automáticamente
      const credenciales = `✨ CREDENCIALES DE ACCESO - SIMPLIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Nombre: ${formData.nombre}
📧 Email: ${email}
🔑 Contraseña: ${password}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Panel: https://simpliacol.com/distribuidor/login
🔗 URL Referencia: https://simpliacol.com/${idGenerado}
${formData.codigoDescuento ? `🎁 Código: ${formData.codigoDescuento.toUpperCase()}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      navigator.clipboard.writeText(credenciales);
      mostrarNotificacion('success', '📋 Credenciales copiadas al portapapeles');

      // Limpiar formulario
      setTimeout(() => {
        setFormData({
          nombre: '',
          whatsapp: '',
          email: '',
          codigoDescuento: ''
        });
        generarNuevoId();
        generarPassword();
        
        if (onCreado) onCreado();
      }, 3000);

    } catch (error) {
      console.error('❌ Error general:', error);
      mostrarNotificacion('error', `❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copiarURL = () => {
    const url = `https://simpliacol.com/${idGenerado}`;
    navigator.clipboard.writeText(url);
    mostrarNotificacion('success', '✅ URL copiada al portapapeles');
  };

  const copiarID = () => {
    navigator.clipboard.writeText(idGenerado);
    mostrarNotificacion('success', '✅ ID copiado al portapapeles');
  };

  const copiarCredenciales = () => {
    if (!formData.email) {
      mostrarNotificacion('error', '⚠️ Primero ingresa el email del distribuidor');
      return;
    }

    const credenciales = `✨ CREDENCIALES DE ACCESO - SIMPLIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: ${formData.email}
🔑 Contraseña: ${passwordGenerada}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Panel: https://simpliacol.com/distribuidor/login
🔗 URL: https://simpliacol.com/${idGenerado}`;
    
    navigator.clipboard.writeText(credenciales);
    mostrarNotificacion('success', '✅ Credenciales copiadas');
  };

  return (
    <div className="crear-distribuidor-wrapper">
      <div className="crear-distribuidor-container">
        <div className="crear-distribuidor-header">
          <h2>✨ Crear Nuevo Distribuidor</h2>
          <p className="subtitle-crear">Completa la información para crear un nuevo distribuidor</p>
        </div>

        <form onSubmit={handleSubmit} className="form-crear">
          
          {/* ID Generado */}
          <div className="form-section">
            <label className="section-title">
              <span className="icon">🔗</span>
              ID Único del Distribuidor
            </label>
            
            <div className="id-generator">
              <div className="id-display-wrapper">
                <code className="id-display">{idGenerado}</code>
                <button 
                  type="button" 
                  onClick={copiarID}
                  className="btn-copy-inline"
                  title="Copiar ID"
                >
                  📋
                </button>
              </div>
              <button type="button" onClick={generarNuevoId} className="btn-regenerar">
                🔄 Generar Nuevo
              </button>
            </div>

            <div className="url-preview">
              <span>
                URL: <strong>simpliacol.com/{idGenerado}</strong>
              </span>
              <button type="button" onClick={copiarURL} className="btn-copiar">
                📋 Copiar URL
              </button>
            </div>
          </div>

          {/* Credenciales de Acceso */}
          <div className="form-section credenciales-section">
            <label className="section-title">
              <span className="icon">🔐</span>
              Credenciales de Acceso al Panel
            </label>

            <div className="credenciales-info">
              <div className="credencial-item">
                <span className="credencial-label">Email (Usuario):</span>
                <span className="credencial-value">{formData.email || 'Ingresa el email abajo'}</span>
              </div>
              <div className="credencial-item">
                <span className="credencial-label">Contraseña:</span>
                <div className="password-display">
                  <code className="credencial-value">{passwordGenerada}</code>
                  <button 
                    type="button" 
                    onClick={generarPassword}
                    className="btn-regenerar-password"
                    title="Generar nueva contraseña"
                  >
                    🔄
                  </button>
                </div>
              </div>
              <div className="credencial-item">
                <span className="credencial-label">URL Panel:</span>
                <span className="credencial-value">simpliacol.com/distribuidor/login</span>
              </div>
            </div>

            <button 
              type="button" 
              onClick={copiarCredenciales}
              className="btn-copiar-credenciales"
              disabled={!formData.email}
            >
              📋 Copiar Todas las Credenciales
            </button>

            <div className="credenciales-warning">
              ⚠️ <strong>Importante:</strong> Guarda estas credenciales antes de continuar.
            </div>
          </div>

          {/* Información Personal */}
          <div className="form-section">
            <label className="section-title">
              <span className="icon">👤</span>
              Información del Distribuidor
            </label>

            <div className="form-group">
              <label htmlFor="nombre">Nombre completo *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez García"
                required
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="whatsapp">
                  WhatsApp *
                  <span className="hint">(con código de país)</span>
                </label>
                <div className="input-with-prefix">
                  <span className="prefix">+</span>
                  <input
                    type="tel"
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="573001234567"
                    required
                    disabled={loading}
                    maxLength="15"
                  />
                </div>
                <small className="input-hint">
                  Ejemplo: 573001234567
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email * (para login)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="distribuidor@email.com"
                  required
                  disabled={loading}
                />
                <small className="input-hint">
                  Este email será su usuario de acceso
                </small>
              </div>
            </div>
          </div>

          {/* Código de Descuento */}
          <div className="form-section">
            <label className="section-title">
              <span className="icon">🎁</span>
              Código de Descuento (Opcional)
            </label>

            <div className="form-group">
              <label htmlFor="codigoDescuento">Código promocional</label>
              <input
                type="text"
                id="codigoDescuento"
                name="codigoDescuento"
                value={formData.codigoDescuento}
                onChange={handleChange}
                placeholder="Ej: PROMO10"
                disabled={loading}
                maxLength="20"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
          </div>

          {/* Resumen */}
          <div className="resumen-card">
            <h4>📋 Resumen</h4>
            <div className="resumen-content">
              <div className="resumen-item">
                <span className="resumen-label">Nombre:</span>
                <span className="resumen-value">{formData.nombre || '—'}</span>
              </div>
              <div className="resumen-item">
                <span className="resumen-label">WhatsApp:</span>
                <span className="resumen-value">+{formData.whatsapp || '—'}</span>
              </div>
              <div className="resumen-item">
                <span className="resumen-label">Email:</span>
                <span className="resumen-value">{formData.email || '—'}</span>
              </div>
              <div className="resumen-item">
                <span className="resumen-label">Contraseña:</span>
                <code className="resumen-value">{passwordGenerada}</code>
              </div>
              <div className="resumen-item">
                <span className="resumen-label">URL:</span>
                <span className="resumen-value">simpliacol.com/{idGenerado}</span>
              </div>
            </div>
          </div>

          {/* Botón Submit */}
          <button 
            type="submit" 
            className="btn-crear-distribuidor"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Creando...
              </>
            ) : (
              <>
                <span>✨</span>
                Crear Distribuidor
              </>
            )}
          </button>
        </form>
      </div>

      {/* Notificación */}
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