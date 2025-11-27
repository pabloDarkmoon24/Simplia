// src/pages/Distribuidor/DistribuidorLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import '../../styles/distribuidor.css';

export const DistribuidorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Estados para recuperar contraseña
  const [mostrarRecuperacion, setMostrarRecuperacion] = useState(false);
  const [emailRecuperacion, setEmailRecuperacion] = useState('');
  const [enviandoRecuperacion, setEnviandoRecuperacion] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      await setPersistence(auth, browserLocalPersistence);

      // Verificar si es distribuidor
      const distribuidoresRef = collection(db, 'distribuidores');
      const q = query(distribuidoresRef, where('email', '==', email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError('Este email no está registrado como distribuidor');
        setLoading(false);
        return;
      }

      const distribuidorData = snapshot.docs[0].data();

      if (!distribuidorData.activo) {
        setError('Tu cuenta está desactivada. Contacta al administrador.');
        setLoading(false);
        return;
      }

      // Login
      await signInWithEmailAndPassword(auth, email, password);

      // Login exitoso
      navigate('/distribuidor/dashboard');

    } catch (error) {
      console.error('❌ Error:', error);
      
      let errorMessage = 'Email o contraseña incorrectos';
      
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos. Intenta más tarde';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Error de conexión. Verifica tu internet';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 🔧 RECUPERAR CONTRASEÑA
  // ============================================
  const handleRecuperarPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setEnviandoRecuperacion(true);

    try {
      if (!emailRecuperacion || !emailRecuperacion.trim()) {
        setError('Por favor ingresa tu email');
        setEnviandoRecuperacion(false);
        return;
      }

      console.log('📧 Verificando si el email es distribuidor:', emailRecuperacion);

      // Verificar que el email sea de un distribuidor
      const distribuidoresRef = collection(db, 'distribuidores');
      const q = query(distribuidoresRef, where('email', '==', emailRecuperacion.trim()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError('Este email no está registrado como distribuidor');
        setEnviandoRecuperacion(false);
        return;
      }

      console.log('✅ Email encontrado en distribuidores, enviando email de recuperación...');

      // Enviar email de recuperación
      await sendPasswordResetEmail(auth, emailRecuperacion.trim());

      console.log('✅ Email de recuperación enviado');

      setSuccessMessage('✅ Se ha enviado un email de recuperación a tu correo. Revisa tu bandeja de entrada.');
      setEmailRecuperacion('');

      // Volver al login después de 5 segundos
      setTimeout(() => {
        setMostrarRecuperacion(false);
        setSuccessMessage('');
      }, 5000);

    } catch (error) {
      console.error('❌ Error al enviar email de recuperación:', error);
      
      let mensajeError = 'Error al enviar email de recuperación';
      
      if (error.code === 'auth/user-not-found') {
        mensajeError = 'No existe una cuenta con este email';
      } else if (error.code === 'auth/invalid-email') {
        mensajeError = 'Email inválido';
      } else if (error.code === 'auth/too-many-requests') {
        mensajeError = 'Demasiados intentos. Espera unos minutos e intenta de nuevo';
      } else if (error.message) {
        mensajeError = error.message;
      }
      
      setError(mensajeError);
    } finally {
      setEnviandoRecuperacion(false);
    }
  };
  const abrirWhatsApp = () => {
    const numeroWhatsApp = '573170695865'; // Formato internacional
    const mensaje = encodeURIComponent('Hola, necesito ayuda para recuperar mi contraseña de acceso al portal de distribuidores de Simplia.');
    window.open(`https://wa.me/${numeroWhatsApp}?text=${mensaje}`, '_blank');
  };

  // ============================================
  // VISTA: RECUPERAR CONTRASEÑA
  // ============================================
  if (mostrarRecuperacion) {
    return (
      <div className="distribuidor-login-container">
        <div className="login-box">
          <div className="login-logo">
            <h1>🔑 Recuperar Contraseña</h1>
            <p className="login-subtitle">Ingresa tu email</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {successMessage && (
            <div className="success-message" style={{
              background: '#d4edda',
              border: '1px solid #c3e6cb',
              color: '#155724',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {successMessage}
            </div>
          )}

          <form onSubmit={handleRecuperarPassword}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={emailRecuperacion}
                onChange={(e) => setEmailRecuperacion(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={enviandoRecuperacion}
                autoComplete="email"
              />
              <small style={{ display: 'block', marginTop: '4px', color: '#666', fontSize: '12px' }}>
                Te enviaremos un link para resetear tu contraseña
              </small>
            </div>

            <button type="submit" className="btn-login" disabled={enviandoRecuperacion}>
              {enviandoRecuperacion ? 'Enviando...' : '📧 Enviar Email de Recuperación'}
            </button>
          </form>

          <div className="login-footer">
            <button
              onClick={() => {
                setMostrarRecuperacion(false);
                setError('');
                setSuccessMessage('');
                setEmailRecuperacion('');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '14px',
                padding: '8px'
              }}
              disabled={enviandoRecuperacion}
            >
              ← Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // VISTA: LOGIN NORMAL
  // ============================================
  return (
    <div className="distribuidor-login-container">
      <div className="login-box">
        <div className="login-logo">
          <h1>🚀 Simplia</h1>
          <p className="login-subtitle">Portal Distribuidores</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <button
            onClick={() => setMostrarRecuperacion(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px',
              padding: '8px 0',
              marginBottom: '12px'
            }}
          >
            ¿Olvidaste tu contraseña?
          </button>
          <p>¿No tienes cuenta?</p>
           <button
            onClick={abrirWhatsApp}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#25D366',
            }}
          >
            💬 Contáctanos por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};