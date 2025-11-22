// src/pages/Distribuidor/DistribuidorLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import '../../styles/distribuidor.css';

export const DistribuidorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Intentando login con:', email);

      // 1. Autenticar con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      console.log('✅ Usuario autenticado con UID:', uid);

      // 2. Verificar que existe en distribuidores
      const distribuidorRef = doc(db, 'distribuidores', uid);
      const distribuidorSnap = await getDoc(distribuidorRef);

      if (!distribuidorSnap.exists()) {
        console.error('❌ No existe en distribuidores');
        setError('No tienes permisos de distribuidor');
        await auth.signOut();
        setLoading(false);
        return;
      }

      const distribuidorData = distribuidorSnap.data();
      console.log('✅ Distribuidor encontrado:', distribuidorData);

      // 3. Verificar que está activo
      if (!distribuidorData.activo) {
        console.error('❌ Distribuidor inactivo');
        setError('Tu cuenta está inactiva. Contacta al administrador.');
        await auth.signOut();
        setLoading(false);
        return;
      }

      console.log('✅ Login exitoso, redirigiendo...');

      // 4. Redirigir al dashboard
      navigate('/distribuidor/dashboard');

    } catch (error) {
      console.error('❌ Error en login:', error);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('Email o contraseña incorrectos');
      } else if (error.code === 'auth/invalid-email') {
        setError('Email inválido');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Intenta más tarde.');
      } else {
        setError('Error al iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="distribuidor-login-container">
      <div className="login-box">
        <div className="login-logo">
          <h1>🎯 Simplia</h1>
          <p className="login-subtitle">Panel de Distribuidor</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={loading}
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
            />
          </div>

          <button 
            type="submit" 
            className="btn-login"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <p>¿Problemas para acceder? Contacta al administrador</p>
        </div>
      </div>
    </div>
  );
};