import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppProvider, useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Requests from '@/pages/Requests';
import RequestDetail from '@/pages/RequestDetail';
import NewRequest from '@/pages/NewRequest';
import UsersPage from '@/pages/UsersPage';
import EquiposPage from '@/pages/EquiposPage';
import ClientesPage from '@/pages/ClientesPage';
import HistorialPage from '@/pages/HistorialPage';
import LecturasPage from '@/pages/LecturasPage';
import Notifications from '@/pages/Notifications';
import NotFound from '@/pages/NotFound';
import { Loader as Loader2 } from 'lucide-react';

const AuthGate = () => {
  const { user, loading } = useApp();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
  if (!user) return <Login />;
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/solicitudes" element={<Requests />} />
        <Route path="/solicitudes/:id" element={<RequestDetail />} />
        <Route path="/nueva" element={<NewRequest />} />
        <Route path="/equipos" element={<EquiposPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/historial" element={<HistorialPage />} />
        <Route path="/lecturas" element={<LecturasPage />} />
        <Route path="/usuarios" element={<UsersPage />} />
        <Route path="/notificaciones" element={<Notifications />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

const App = () => (
  <AppProvider>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<AuthGate />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </AppProvider>
);

export default App;
