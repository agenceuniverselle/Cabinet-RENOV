// dans ton menu utilisateur :
import { apiFetch } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

function LogoutItem() {
  const navigate = useNavigate();
  const onLogout = async () => {
    try { await apiFetch("/logout", { method: "POST" }); } catch { /* empty */ }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };
  return <DropdownMenuItem className="text-destructive" onClick={onLogout}>Déconnexion</DropdownMenuItem>;
}
export default LogoutItem;
