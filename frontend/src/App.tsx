import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  EmployeesPage,
  AttendancePage,
  ReportsPage,
  KioskPage,
  UserManagementPage,
  ManualAttendancePage,
} from './pages';

function App() {
  return (
    <Routes>
      {/* Public routes - Kiosk for employees to mark attendance */}
      <Route path="/" element={<KioskPage />} />
      <Route path="/kiosk" element={<KioskPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes - Admin panel */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/manual-attendance" element={<ManualAttendancePage />} />
        </Route>
      </Route>

      {/* 404 - Redirect to kiosk */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
