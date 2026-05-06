import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth initialMode="login" />} />
          <Route path="/register" element={<Auth initialMode="register" />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/mascotas" element={<Mascotas />} />
          <Route path="/mascotas/:id" element={<PetDetails />} />
          <Route path="/adoptar/:id" element={<AdoptPet />} />
          <Route path="/dashboard/add-pet" element={<AddPet />} />
          <Route path="/dashboard/edit-pet/:id" element={<EditPet />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/mascotas" element={<AdminMascotas />} />
          <Route path="/admin/solicitudes-refugio" element={<AdminSolicitudesRefugio />} />
          <Route path="/admin/mensajes" element={<AdminMensajes />} />
          <Route path="/cuenta" element={<Cuenta />} />
          <Route path="/refugio" element={<RefugioDashboard />} />
          <Route path="/encuesta" element={<Encuesta />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
