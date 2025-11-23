// src/pages/Distribuidor/DistribuidorLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import '../../styles/distribuidor.css';

export const DistribuidorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Configurando persistencia de sesión...');
      
      // ⭐ CONFIGURAR PERSISTENCIA ANTES DE LOGIN
      await setPersistence(auth, browserLocalPersistence);
      console.log('✅ Persistencia configurada: LOCAL');

      console.log('🔑 Intentando login con:', email);

      // Iniciar sesión
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('✅ Usuario autenticado:', user.uid);

      // Verificar que el usuario sea un distribuidor
      const distribuidoresRef = collection(db, 'distribuidores');
      const q = query(distribuidoresRef, where('email', '==', email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.error('❌ Email no está registrado como distribuidor');
        setError('Este email no está registrado como distribuidor');
        await auth.signOut();
        setLoading(false);
        return;
      }

      const distribuidorData = snapshot.docs[0].data();

      if (!distribuidorData.activo) {
        console.error('❌ Cuenta desactivada');
        setError('Tu cuenta está desactivada. Contacta al administrador.');
        await auth.signOut();
        setLoading(false);
        return;
      }

      console.log('✅ Distribuidor verificado. Redirigiendo...');
      
      // ✅ Sesión persistirá automáticamente
      navigate('/distribuidor/dashboard');

    } catch (error) {
      console.error('❌ Error en login:', error);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Email o contraseña incorrectos';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos. Intenta más tarde';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Error de conexión. Verifica tu internet';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="distribuidor-login-container">
      <div className="login-box">
        <div className="login-logo">
          <h1>🚀 Simplia</h1>
          <p className="login-subtitle">Portal Distribuidores</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

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
          <p>¿No tienes cuenta?</p>
          <a href="mailto:admin@simpliacol.com">Contacta al administrador</a>
        </div>
      </div>
    </div>
  );
};