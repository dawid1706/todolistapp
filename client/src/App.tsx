import { Route, Routes, Navigate } from "react-router-dom";
import Home from "@/app/page";
import LoginPage from "@/app/login/page";
import RegisterPage from "@/app/register/page";
import DashboardPage from "@/app/dashboard/page";
import NewInvoicePage from "@/app/dashboard/invoices/new/page";
import EditInvoicePage from "@/app/dashboard/invoices/[id]/page";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard/invoices/new" element={<NewInvoicePage />} />
      <Route path="/dashboard/invoices/:id" element={<EditInvoicePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
