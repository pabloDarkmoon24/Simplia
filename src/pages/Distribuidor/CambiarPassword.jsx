// src/pages/Distribuidor/CambiarPassword.jsx
import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

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

    setCambiando(true);

    try {
      // Verificar que la contraseña actual sea correcta
      // (simulación - en producción deberías validar contra la DB)
      const distribuidorRef = doc(db, 'distribuidores', distribuidorId);
      
      // Actualizar la contraseña en Firestore
      await updateDoc(distribuidorRef, {
        password: passwordNueva,
        ultimoCambioPassword: new Date().toISOString(),
        passwordCambiadaPorUsuario: true
      });

      mostrarNotificacion('success', '✅ Contraseña actualizada correctamente');
      
      // Limpiar formulario
      setPasswordActual('');
      setPasswordNueva('');
      setPasswordConfirmar('');

    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      mostrarNotificacion('error', '❌ Error al cambiar la contraseña');
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