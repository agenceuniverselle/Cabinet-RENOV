// src/components/LogoutItem.tsx (ou où que ce soit)
import { apiFetch } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

function LogoutItem() {
  const navigate = useNavigate();
  
  const onLogout = async () => {
    try {
      // ✅ Le bon chemin est /auth/logout selon api.php
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Erreur logout:", err);
    }
    
    // Nettoyer le localStorage/sessionStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    
    // Rediriger vers la page de login
    navigate("/Renov-login@2025", { replace: true });
  };

  return (
    <DropdownMenuItem className="text-destructive" onClick={onLogout}>
      Déconnexion
    </DropdownMenuItem>
  );
}

export default LogoutItem;
