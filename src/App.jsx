// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AdminLogin } from './pages/Admin/AdminLogin';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { DistribuidorLogin } from './pages/Distribuidor/DistribuidorLogin';
import { DistribuidorDashboard } from './pages/Distribuidor/DistribuidorDashboard';


function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta raíz redirige al login de admin */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        
        {/* Rutas de Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        
        {/* Rutas de Distribuidor */}
        <Route path="/distribuidor/login" element={<DistribuidorLogin />} />
        <Route path="/distribuidor/dashboard" element={<DistribuidorDashboard />} />
        
        {/* Landing con ID de distribuidor */}
        <Route path="/:distribuidorId" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;