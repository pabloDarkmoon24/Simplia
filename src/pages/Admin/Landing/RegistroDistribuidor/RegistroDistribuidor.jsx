// RegistroDistribuidor/RegistroDistribuidor.jsx
import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../../firebase/config';
import './RegistroDistribuidor.css';
import chanchito from '../../../../landingPrincipal/cerdito-volador.png';
import botonRegistro from '../../../../landingPrincipal/boton-registrarme.png';

const RegistroDistribuidor = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    email: '',
    password: '',
    whatsappContacto: '',
    ciudad: ''
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [credenciales, setCredenciales] = useState(null);
  const [error, setError] = useState('');

  // WhatsApp FIJO de soporte
  const WHATSAPP_SOPORTE = '573170695865';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación especial para whatsappContacto y cédula (solo números)
    if (name === 'whatsappContacto' || name === 'cedula') {
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

  const validarFormulario = () => {
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio');
      return false;
    }
    
    if (!formData.cedula.trim()) {
      setError('La cédula es obligatoria');
      return false;
    }
    
    if (formData.cedula.length < 6) {
      setError('La cédula debe tener al menos 6 dígitos');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('El email es obligatorio');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      setError('El email no es válido');
      return false;
    }

    if (!formData.password.trim()) {
      setError('La contraseña es obligatoria');
      return false;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    if (!formData.whatsappContacto.trim()) {
      setError('El WhatsApp es obligatorio');
      return false;
    }
    
    if (formData.whatsappContacto.length < 10) {
      setError('El WhatsApp debe tener al menos 10 dígitos');
      return false;
    }
    
    if (!formData.ciudad.trim()) {
      setError('La ciudad es obligatoria');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validarFormulario()) {
      return;
    }
    
    setLoading(true);

    try {
      const idGenerado = generarIdUnico();
      const email = formData.email.trim().toLowerCase();
      const password = formData.password.trim();

      console.log('📝 Iniciando registro...');

      // ============================================
      // PASO 1: CREAR USUARIO EN FIREBASE AUTH
      // ============================================
      console.log('🔐 Creando usuario en Firebase Auth...');
      
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
        console.error('❌ Error en Auth:', data.error);
        
        if (data.error.message.includes('EMAIL_EXISTS')) {
          setError('Este email ya está registrado');
        } else if (data.error.message.includes('WEAK_PASSWORD')) {
          setError('La contraseña debe tener al menos 6 caracteres');
        } else if (data.error.message.includes('INVALID_EMAIL')) {
          setError('Email inválido');
        } else {
          setError(`Error: ${data.error.message}`);
        }
        setLoading(false);
        return;
      }

      const uid = data.localId;
      console.log('✅ Usuario creado con UID:', uid);

      // ============================================
      // PASO 2: CREAR DOCUMENTO EN FIRESTORE
      // ============================================
      const distribuidorData = {
        id: idGenerado,
        uid: uid,
        codigoDistribuidor: idGenerado,
        nombre: formData.nombre.trim(),
        cedula: formData.cedula.trim(),
        whatsapp: WHATSAPP_SOPORTE, // ← WhatsApp FIJO de soporte
        whatsappContacto: formData.whatsappContacto.trim(), // ← WhatsApp del cliente (informativo)
        email: email,
        ciudad: formData.ciudad.trim(),
        codigoDescuento: null,
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

      console.log('📦 Guardando en Firestore con UID:', uid);
      console.log('📞 WhatsApp soporte:', WHATSAPP_SOPORTE);
      console.log('📱 WhatsApp contacto cliente:', formData.whatsappContacto);
      
      // Guardar en Firestore usando el UID como ID del documento
      const distribuidorRef = doc(db, 'distribuidores', uid);
      await setDoc(distribuidorRef, distribuidorData);
      
      console.log('✅ Distribuidor registrado exitosamente');

      // ============================================
      // PASO 3: MOSTRAR CREDENCIALES
      // ============================================
      setCredenciales({
        nombre: formData.nombre,
        cedula: formData.cedula,
        email: email,
        password: password,
        link: `simpliacol.com/${idGenerado}`,
        linkCompleto: `https://simpliacol.com/${idGenerado}`,
        ciudad: formData.ciudad
      });

      setShowModal(true);

      // Limpiar formulario
      setFormData({
        nombre: '',
        cedula: '',
        email: '',
        password: '',
        whatsappContacto: '',
        ciudad: ''
      });

    } catch (error) {
      console.error('❌ Error general:', error);
      setError(`Error al registrar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copiarCredenciales = () => {
    if (!credenciales) return;

    const texto = `✨ CREDENCIALES DE ACCESO - SIMPLIA 🎉
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Nombre:   ${credenciales.nombre} 
📧 Mi email: ${credenciales.email}
🔑 Mi contraseña: ${credenciales.password}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Panel: https://simpliacol.com/distribuidor/login
🔗 Mi link de referido: ${credenciales.link}`;

    navigator.clipboard.writeText(texto);
    
    // Cambiar el texto del botón temporalmente
    const btn = document.querySelector('.btn-copiar-modal');
    const textoOriginal = btn.textContent;
    btn.textContent = '✅ ¡Copiado!';
    btn.style.background = 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
    
    setTimeout(() => {
      btn.textContent = textoOriginal;
      btn.style.background = 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)';
    }, 2000);
  };

  const irAMiPanel = () => {
    window.location.href = '/distribuidor/login';
  };

  return (
    <section className="registro-section" id="registro">
      <div className="registro-container">
        
        {/* Título */}
        <div className="registro-title">
          <h2>¡Regístrate y empieza a ganar hoy!</h2>
        </div>

        {/* Contenido principal */}
        <div className="registro-content">
          
          {/* Chanchito */}
          <div className="registro-imagen">
            <img 
              src={chanchito}
              alt="Simplia - Gana dinero"
              loading="lazy"
            />
          </div>

          {/* Formulario */}
          <div className="registro-form-wrapper">
            <form onSubmit={handleSubmit} className="registro-form">
              <p>¡Únete ahora! <br />  ¡Empieza a ganar hoy!</p>
              
              <div className="form-field">
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Nombre completo"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-field">
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  placeholder="Cédula"
                  disabled={loading}
                  required
                  maxLength="15"
                />
              </div>

              <div className="form-field">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Correo electrónico"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-field">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Contraseña (mínimo 6 caracteres)"
                  disabled={loading}
                  required
                  minLength="6"
                />
              </div>

              <div className="form-field">
                <input
                  type="tel"
                  name="whatsappContacto"
                  value={formData.whatsappContacto}
                  onChange={handleChange}
                  placeholder="WhatsApp"
                  disabled={loading}
                  required
                  maxLength="15"
                />
              </div>

              <div className="form-field">
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  placeholder="Ciudad"
                  disabled={loading}
                  required
                />
              </div>

              {error && (
                <div className="error-message">
                  ⚠️ {error}
                </div>
              )}

              <button 
                type="submit" 
                className="btn-registrarme"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading-text">Registrando...</span>
                ) : (
                  <img src={botonRegistro} alt="Registrarme ¡PULSA AQUÍ!" />
                )}
              </button>

            </form>
          </div>

        </div>
      </div>

      {/* Modal de credenciales */}
      {showModal && credenciales && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            
            <div className="modal-header">
              <h3><center>Bienvenido a Simplia  hora de comenzar a ganar🎉</center></h3>
            </div>

            <div className="modal-body">
              <div className="credencial-item">
                <span className="credencial-label">📧 Mi email:</span>
                <span className="credencial-valor">{credenciales.email}</span>
              </div>

              {/* <div className="credencial-item">
                <span className="credencial-label">🔑 Mi contraseña:</span>
                <span className="credencial-valor">{credenciales.password}</span>
              </div> */}

              <div className="credencial-item">
                <span className="credencial-label">🔗 Mi link de referido:</span>
                <span className="credencial-valor">{credenciales.link}</span>
              </div>

              <div className="credencial-item">
                <span className="credencial-label">Nombre:</span>
                <span className="credencial-valor">{credenciales.nombre}</span>
              </div>

              <div className="credencial-item">
                <span className="credencial-label">Cédula:</span>
                <span className="credencial-valor">{credenciales.cedula}</span>
              </div>

              <div className="credencial-item">
                <span className="credencial-label">Ciudad:</span>
                <span className="credencial-valor">{credenciales.ciudad}</span>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={copiarCredenciales} className="btn-copiar-modal">
                📋 Copiar al portapapeles
              </button>
              <button onClick={irAMiPanel} className="btn-ir-panel">
                🚀 Ir a mi panel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RegistroDistribuidor;