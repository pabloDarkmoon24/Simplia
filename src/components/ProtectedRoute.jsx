// src/components/ProtectedRoute.jsx (o donde esté)
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/config';

export const ProtectedDistribuidorRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="loading-container">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/distribuidor/login" />;
  }

  return children;
};