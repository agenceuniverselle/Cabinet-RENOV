import { Home, Users, FolderTree, Trash2 } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Tableau de bord", icon: LayoutDashboard, path: "/dashboard/index" },
  { title: "Formations", icon: BookOpen, path: "/dashboard/courses" },
    { title: "Categorie", icon: FolderTree, path: "/dashboard/categories" },
  { title: "Apprenants", icon: Users, path: "/dashboard/students" },
  { title: "Contact-messages", icon: MessageCircle, path: "/dashboard/messages" },
    { title: "Corbeille", icon: Trash2, path: "/dashboard/trash" },
  { title: "Paramètres", icon: Settings, path: "/dashboard/settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative h-screen bg-card border-r border-border transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-30 h-10 rounded-lg bg-gradient-primary flex items-center justify-center overflow-hidden">
              <img
                src="/favicon.png"
                alt="Cabinet-Renov logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-semibold text-lg">Administrateur</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    "hover:bg-sidebar-accent",
                    isActive
                      ? "bg-[#7babd0] text-black dark:bg-[#7babd0] dark:text-white shadow-md"
                      : "text-sidebar-foreground dark:text-gray-200 hover:dark:text-[#7babd0]"
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <span className="font-medium text-sm">{item.title}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">Version 1.0.0</div>
        </div>
      )}
    </aside>
  );
}

// ✅ pour compatibilité: import nommé ET import par défaut
export default Sidebar;
