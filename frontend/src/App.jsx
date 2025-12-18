import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import CustomerHome from './pages/customer/CustomerHome.jsx';
import CustomerProfile from './pages/customer/CustomerProfile.jsx';
import CustomerServiceHistory from './pages/customer/CustomerServiceHistory.jsx';
import CustomerExaminationDetail from './pages/customer/CustomerExaminationDetail.jsx';
import CustomerVaccinationDetail from './pages/customer/CustomerVaccinationDetail.jsx';
import CustomerPurchaseDetail from './pages/customer/CustomerPurchaseDetail.jsx';
import CustomerPets from './pages/customer/CustomerPets.jsx';
import CustomerPetHistory from './pages/customer/CustomerPetHistory.jsx';
import CustomerVaccinationPackages from './pages/customer/CustomerVaccinationPackages.jsx';
import StaffHome from './pages/staff/StaffHome.jsx';
import StaffInvoiceHistory from './pages/staff/StaffInvoiceHistory.jsx';
import StaffServiceInvoiceDetail from './pages/staff/StaffServiceInvoiceDetail.jsx';
import StaffAddServiceInvoice from './pages/staff/StaffAddServiceInvoice.jsx';
import DocServiceHistory from './pages/staff/DocServiceHistory.jsx';
import DocExamination from './pages/staff/DocExamination.jsx';

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
          path="staff/invoices"
          element={
            <ProtectedRoute allowedRoles={["receptionist"]}>
              <StaffInvoiceHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/invoices/:maHD"
          element={
            <ProtectedRoute allowedRoles={["receptionist"]}>
              <StaffServiceInvoiceDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/invoices/new"
          element={
            <ProtectedRoute allowedRoles={["receptionist"]}>
              <StaffAddServiceInvoice />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/doctor/history"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DocServiceHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/doctor/khambenh/:maSDDV"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DocExamination />
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

        <Route
          path="/customer/tiemphong/:maSDDV"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerVaccinationDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/muahang/:maSDDV"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerPurchaseDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/pets"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerPets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/pets/:maTC/history"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerPetHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/packages"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerVaccinationPackages />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}