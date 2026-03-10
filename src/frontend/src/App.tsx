import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { AdminLayout } from "./components/admin/AdminLayout";
import { LoginPage } from "./pages/admin/LoginPage";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <AdminLayout onLogout={() => setIsAuthenticated(false)} />
      <Toaster />
    </>
  );
}
