import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MainLayout from './layouts/MainLayout'; // Importamos el Layout
import Users from './pages/Users';
import Profile from './pages/Profile';
import Companies from './pages/Companies';
import Requests from './pages/Requests';
import RequestDetails from './pages/RequestDetails';
import PaymentsReport from './pages/PaymentsReport';
import AttendanceReport from './pages/AttendanceReport';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* RUTA PÚBLICA (Sin Header/Footer) */}
          <Route path="/" element={<Login />} />

          {/* RUTAS PROTEGIDAS (Con Layout) */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Aquí puedes agregar más páginas protegidas en el futuro */}
            <Route path="/users" element={<Users />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/requests/:id" element={<RequestDetails />} />

            <Route path="/reports/payments" element={<PaymentsReport />} />
            <Route path="/reports/attendance" element={<AttendanceReport />} />

            <Route path="/profile" element={<Profile />} />

            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;