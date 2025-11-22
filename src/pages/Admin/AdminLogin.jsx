// src/pages/Admin/AdminLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import '../../styles/admin.css';

export const AdminLogin = () => {
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
      // 1. Autenticar con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      console.log('✅ Usuario autenticado con UID:', uid);

      // 2. Verificar que existe en la colección admins
      const adminRef = doc(db, 'admins', uid);
      const adminSnap = await getDoc(adminRef);

      if (!adminSnap.exists()) {
        console.error('❌ Usuario no encontrado en colección admins');
        setError('No tienes permisos de administrador');
        await auth.signOut();
        setLoading(false);
        return;
      }

      const adminData = adminSnap.data();

      // 3. Verificar que el rol sea admin
      if (adminData.role !== 'admin') {
        console.error('❌ Usuario sin rol de admin:', adminData.role);
        setError('No tienes permisos de administrador');
        await auth.signOut();
        setLoading(false);
        return;
      }

      console.log('✅ Admin verificado:', adminData.email);

      // 4. Redirigir al dashboard
      navigate('/admin/dashboard');

    } catch (error) {
      console.error('❌ Error al iniciar sesión:', error);
      
      // Mensajes de error específicos
      if (error.code === 'auth/user-not-found') {
        setError('Email no registrado');
      } else if (error.code === 'auth/wrong-password') {
        setError('Contraseña incorrecta');
      } else if (error.code === 'auth/invalid-email') {
        setError('Email inválido');
      } else if (error.code === 'auth/invalid-credential') {
        setError('Email o contraseña incorrectos');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Intenta más tarde.');
      } else {
        setError('Error al iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-box">
        <h1>Simplia Admin</h1>
        <p className="login-subtitle">Panel de Administración</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@simpliacol.com"
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

          {error && <p className="error-message">⚠️ {error}</p>}

          <button 
            type="submit" 
            className="btn-login"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};