


import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import StoreDashboard from "./pages/StoreDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Udhaar from "./pages/Udhaar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Store Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute role="store">
            <StoreDashboard />
          </ProtectedRoute>
        } />

        <Route path="/products" element={
          <ProtectedRoute role="store">
            <Products />
          </ProtectedRoute>
        } />

        <Route path="/customers" element={
          <ProtectedRoute role="store">
            <Customers />
          </ProtectedRoute>
        } />

        <Route path="/orders" element={
          <ProtectedRoute role="store">
            <Orders />
          </ProtectedRoute>
        } />

        <Route path="/udhaar" element={
          <ProtectedRoute role="store">
            <Udhaar />
          </ProtectedRoute>
        } />

        {/* Super Admin Routes */}
        <Route path="/superadmin" element={
          <ProtectedRoute role="superadmin">
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;


