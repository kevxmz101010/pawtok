import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Mascotas from './pages/Mascotas';
import PetDetails from './pages/PetDetails';
import AdoptPet from './pages/AdoptPet';
import AddPet from './pages/AddPet';
import EditPet from './pages/EditPet';
import AdminDashboard from './pages/AdminDashboard';
import AdminMascotas from './pages/AdminMascotas';
import AdminSolicitudesRefugio from './pages/AdminSolicitudesRefugio';
import AdminMensajes from './pages/AdminMensajes';
import Cuenta from './pages/Cuenta';
import RefugioDashboard from './pages/RefugioDashboard';
import Encuesta from './pages/Encuesta';
import PublicShelterProfile from './pages/PublicShelterProfile';

function PendingRefugioIsolationGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Aislamiento: Si un refugio no está aprobado aún (Pendiente o Rechazado), permanece en /refugio o /onboarding
  const isPendingShelter = isAuthenticated && user?.rol === 'REFUGIO' && user?.estadoRefugio && user.estadoRefugio !== 'Aprobado';
  if (!isLoading && isPendingShelter) {
    if (location.pathname !== '/refugio' && location.pathname !== '/onboarding') {
      return <Navigate to="/refugio" replace />;
    }
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <ConfirmProvider>
        <ToastProvider>
          <BrowserRouter>
            <PendingRefugioIsolationGuard>
              <Routes>
                {/* Rutas Públicas */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Auth initialMode="login" />} />
                <Route path="/register" element={<Auth initialMode="register" />} />
                <Route path="/mascotas" element={<Mascotas />} />
                <Route path="/mascotas/:id" element={<PetDetails />} />
                <Route path="/refugios/:id" element={<PublicShelterProfile />} />
                <Route path="/encuesta" element={<Encuesta />} />

                {/* Rutas Protegidas - Solo Adoptantes Particulares */}
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/cuenta" element={<ProtectedRoute allowedRoles={['USUARIO']}><Cuenta /></ProtectedRoute>} />
                <Route path="/adoptar/:id" element={<ProtectedRoute allowedRoles={['USUARIO']}><AdoptPet /></ProtectedRoute>} />

                {/* Rutas Protegidas - Refugios y Admins */}
                <Route path="/refugio" element={<ProtectedRoute allowedRoles={['REFUGIO', 'ADMIN']}><RefugioDashboard /></ProtectedRoute>} />
                <Route path="/dashboard/add-pet" element={<ProtectedRoute allowedRoles={['REFUGIO', 'ADMIN']}><AddPet /></ProtectedRoute>} />
                <Route path="/dashboard/edit-pet/:id" element={<ProtectedRoute allowedRoles={['REFUGIO', 'ADMIN']}><EditPet /></ProtectedRoute>} />

                {/* Rutas Protegidas - Solo Administradores */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/mascotas" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminMascotas /></ProtectedRoute>} />
                <Route path="/admin/solicitudes-refugio" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminSolicitudesRefugio /></ProtectedRoute>} />
                <Route path="/admin/mensajes" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminMensajes /></ProtectedRoute>} />
              </Routes>
            </PendingRefugioIsolationGuard>
          </BrowserRouter>
        </ToastProvider>
      </ConfirmProvider>
    </AuthProvider>
  );
}
