import { useState } from "react";
import LoginForm from "@/components/LoginForm";
import AdminLogin from "@/components/AdminLogin";
import SearchPortal from "@/components/SearchPortal";
import AdminPanel from "@/components/AdminPanel";
import { LoginKey } from "@/lib/supabaseDatabase";

type ViewState = "login" | "admin-login" | "portal" | "admin-panel";

const Index = () => {
  const [view, setView] = useState<ViewState>("login");
  const [userKey, setUserKey] = useState<LoginKey | null>(null);

  const handleUserLogin = (key: LoginKey) => {
    setUserKey(key);
    setView("portal");
  };

  const handleAdminLogin = () => {
    setView("admin-panel");
  };

  const handleLogout = () => {
    setUserKey(null);
    setView("login");
  };

  return (
    <>
      {view === "login" && (
        <LoginForm
          onLogin={handleUserLogin}
          onAdminClick={() => setView("admin-login")}
        />
      )}
      {view === "admin-login" && (
        <AdminLogin
          onLogin={handleAdminLogin}
          onBack={() => setView("login")}
        />
      )}
      {view === "portal" && userKey && (
        <SearchPortal userKey={userKey} onLogout={handleLogout} />
      )}
      {view === "admin-panel" && (
        <AdminPanel onLogout={handleLogout} />
      )}
    </>
  );
};

export default Index;
