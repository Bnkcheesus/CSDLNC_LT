import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import CustomerHome from './pages/customer/CustomerHome.jsx';
import CustomerProfile from './pages/customer/CustomerProfile.jsx';
import CustomerServiceHistory from './pages/customer/CustomerServiceHistory.jsx';
import CustomerExaminationDetail from './pages/customer/CustomerExaminationDetail.jsx';
import StaffHome from './pages/staff/StaffHome.jsx';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route
          path="/staff/home"
          element={
            <ProtectedRoute allowedRoles={["manager", "receptionist", "sales", "doctor"]}>
              <StaffHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/home"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/history"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerServiceHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/khambenh/:maSDDV"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerExaminationDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}