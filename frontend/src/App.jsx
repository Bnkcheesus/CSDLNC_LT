import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/home"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <div>Admin Home</div>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/doctor/home"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <div>Doctor Home</div>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/reception/home"
          element={
            <ProtectedRoute allowedRoles={["receptionist"]}>
              <div>Receptionist Home</div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sales/home"
          element={
            <ProtectedRoute allowedRoles={["sales"]}>
              <div>Sales Home</div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/home"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <div>Customer Home</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}