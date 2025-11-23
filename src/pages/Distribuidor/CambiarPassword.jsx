// src/pages/Distribuidor/CambiarPassword.jsx
import { useState } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { db, auth } from '../../firebase/config';

export const CambiarPassword = ({ distribuidorId, distribuidorEmail }) => {
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmar, setPasswordConfirmar] = useState('');
  const [mostrarPasswords, setMostrarPasswords] = useState(false);
  const [cambiando, setCambiando] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  const mostrarNotificacion = (type, message) => {
    setNotification({ type, message });
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  const validarPassword = (password) => {
    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return null;
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!passwordActual || !passwordNueva || !passwordConfirmar) {
      mostrarNotificacion('error', 'Todos los campos son obligatorios');
      return;
    }

    if (passwordNueva !== passwordConfirmar) {
      mostrarNotificacion('error', 'Las contraseñas nuevas no coinciden');
      return;
    }

    const errorValidacion = validarPassword(passwordNueva);
    if (errorValidacion) {
      mostrarNotificacion('error', errorValidacion);
      return;
    }

    if (passwordActual === passwordNueva) {
      mostrarNotificacion('error', 'La nueva contraseña debe ser diferente a la actual');
      return;
    }

    // Obtener usuario autenticado
    const user = auth.currentUser;
    
    if (!user) {
      mostrarNotificacion('error', 'Sesión no válida');
      return;
    }

    setCambiando(true);

    try {
      console.log('🔒 Iniciando cambio de contraseña...');

      // PASO 1: Re-autenticar al usuario con su contraseña actual
      console.log('🔑 Re-autenticando usuario...');
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordActual
      );

      await reauthenticateWithCredential(user, credential);
      console.log('✅ Usuario re-autenticado correctamente');

      // PASO 2: Cambiar la contraseña en Firebase Authentication
      console.log('🔄 Actualizando contraseña en Firebase Auth...');
      await updatePassword(user, passwordNueva);
      console.log('✅ Contraseña actualizada en Firebase Auth');

      // PASO 3: Actualizar metadatos en Firestore
      console.log('📝 Actualizando metadatos en Firestore...');
      const distribuidorRef = doc(db, 'distribuidores', user.uid);
      
      await setDoc(
        distribuidorRef,
        {
          ultimoCambioPassword: new Date().toISOString(),
          passwordCambiadaPorUsuario: true
        },
        { merge: true }
      );

      console.log('✅ Contraseña cambiada exitosamente');

      mostrarNotificacion('success', '✅ Contraseña actualizada correctamente');
      
      // Limpiar formulario
      setPasswordActual('');
      setPasswordNueva('');
      setPasswordConfirmar('');

    } catch (error) {
      console.error('❌ Error al cambiar contraseña:', error);
      
      // Manejar errores específicos de Firebase Auth
      let mensajeError = 'Error al cambiar la contraseña';
      
      if (error.code === 'auth/wrong-password') {
        mensajeError = 'La contraseña actual es incorrecta';
      } else if (error.code === 'auth/weak-password') {
        mensajeError = 'La contraseña es muy débil';
      } else if (error.code === 'auth/requires-recent-login') {
        mensajeError = 'Por seguridad, debes cerrar sesión y volver a iniciar sesión para cambiar tu contraseña';
      } else if (error.code === 'auth/network-request-failed') {
        mensajeError = 'Error de conexión. Verifica tu internet';
      }
      
      mostrarNotificacion('error', `❌ ${mensajeError}`);
    } finally {
      setCambiando(false);
    }
  };

  return (
    <div className="cambiar-password-container">
      <div className="cambiar-password-card">
        <div className="password-header">
          <h2>🔒 Cambiar Contraseña</h2>
          <p className="password-subtitle">
            Actualiza tu contraseña para mantener tu cuenta segura
          </p>
        </div>

        <form onSubmit={handleCambiarPassword} className="password-form">
          <div className="form-group-password">
            <label>Contraseña actual *</label>
            <div className="password-input-wrapper">
              <input
                type={mostrarPasswords ? 'text' : 'password'}
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
                placeholder="Ingresa tu contraseña actual"
                disabled={cambiando}
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="form-group-password">
            <label>Nueva contraseña *</label>
            <div className="password-input-wrapper">
              <input
                type={mostrarPasswords ? 'text' : 'password'}
                value={passwordNueva}
                onChange={(e) => setPasswordNueva(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                disabled={cambiando}
                autoComplete="new-password"
              />
            </div>
            <small className="password-hint">
              La contraseña debe tener al menos 6 caracteres
            </small>
          </div>

          <div className="form-group-password">
            <label>Confirmar nueva contraseña *</label>
            <div className="password-input-wrapper">
              <input
                type={mostrarPasswords ? 'text' : 'password'}
                value={passwordConfirmar}
                onChange={(e) => setPasswordConfirmar(e.target.value)}
                placeholder="Repite la nueva contraseña"
                disabled={cambiando}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="mostrar-password-check">
            <label>
              <input
                type="checkbox"
                checked={mostrarPasswords}
                onChange={(e) => setMostrarPasswords(e.target.checked)}
              />
              <span>Mostrar contraseñas</span>
            </label>
          </div>

          <div className="password-actions">
            <button 
              type="submit"
              className="btn-cambiar-password"
              disabled={cambiando}
            >
              {cambiando ? (
                <>
                  <span className="spinner-small"></span>
                  Cambiando...
                </>
              ) : (
                '🔒 Cambiar Contraseña'
              )}
            </button>
          </div>
        </form>

        <div className="password-info-box">
          <h4>💡 Consejos de seguridad</h4>
          <ul>
            <li>✅ Usa una contraseña única que no uses en otros sitios</li>
            <li>✅ Combina letras, números y caracteres especiales</li>
            <li>✅ No compartas tu contraseña con nadie</li>
            <li>✅ Cámbiala periódicamente</li>
          </ul>
        </div>

        <div className="password-info-box" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '2px solid #3b82f6' }}>
          <h4>ℹ️ Importante</h4>
          <ul>
            <li>🔐 Tu contraseña se almacena de forma segura en Firebase</li>
            <li>🔄 El cambio es inmediato y afecta tu próximo inicio de sesión</li>
            <li>📧 Tu email de acceso es: <strong>{distribuidorEmail || user?.email}</strong></li>
          </ul>
        </div>
      </div>

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