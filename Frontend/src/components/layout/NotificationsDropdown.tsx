// src/components/layout/NotificationsDropdown.tsx
import * as React from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

/* ------------ API base robuste (avec /api au bon endroit) ------------ */
function resolveApiBase() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = (import.meta as any).env?.VITE_API_URL ?? "http://127.0.0.1:8000/api";
  const base = String(raw).replace(/\/+$/, "");
  return /\/api$/.test(base) ? base : `${base}/api`;
}
const API_URL = resolveApiBase();

/* ------------------------------- Types ------------------------------- */
type DBNotification = {
  id: string | number;
  type?: string;
  data?: Record<string, unknown>;
  read_at: string | null;
  created_at?: string;
};

/* ------- helper fetch JSON avec Bearer + gestion erreurs 401 -------- */
async function requestJson<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(init?.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(String(res.status));
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/* ----------------------------- composant ---------------------------- */
export function NotificationsDropdown() {
  const navigate = useNavigate();
  const [items, setItems] = React.useState<DBNotification[]>([]);
  const [unread, setUnread] = React.useState<number>(0);

  const load = React.useCallback(async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      navigate("/dashboard/login", {
        replace: true,
        state: { from: { pathname: "/dashboard/index" } },
      });
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const listJson = await requestJson<any>(`/notifications?limit=30`);
      const list: DBNotification[] = Array.isArray(listJson)
        ? listJson
        : Array.isArray(listJson?.data)
        ? listJson.data
        : [];
      setItems(list);

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cntJson = await requestJson<any>(`/notifications/unread-count`);
        const c =
          typeof cntJson?.data?.count === "number"
            ? cntJson.data.count
            : typeof cntJson?.count === "number"
            ? cntJson.count
            : 0;
        setUnread(c);
      } catch {
        setUnread(list.filter((n) => !n.read_at).length);
      }
    } catch (e) {
      if (e instanceof Error && e.message === "401") {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        navigate("/dashboard/login", {
          replace: true,
          state: { from: { pathname: "/dashboard/index" } },
        });
        return;
      }
      setItems([]);
      setUnread(0);
    }
  }, [navigate]);

  React.useEffect(() => {
    load();
    const i = setInterval(load, 30000);
    return () => clearInterval(i);
  }, [load]);

  const markRead = async (id: string | number) => {
    try {
      await requestJson(`/notifications/${id}/read`, { method: "PATCH" });
    } catch {
      try {
        await requestJson(`/notifications/${id}/read`, { method: "POST" });
      } catch {
        /* ignore */
      }
    }
    setItems((prev) =>
      prev.map((n) =>
        String(n.id) === String(id)
          ? { ...n, read_at: new Date().toISOString() }
          : n
      )
    );
    setUnread((x) => Math.max(0, x - 1));
  };

  const timeAgo = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso).getTime();
    const s = Math.max(1, Math.floor((Date.now() - d) / 1000));
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const d2 = Math.floor(h / 24);
    return `${d2}j`;
  };

  const badgeText = unread > 9 ? "9+" : String(unread);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white shadow">
              {badgeText}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-96 max-h-[70vh] overflow-y-auto rounded-xl shadow-lg scrollbar-thin scrollbar-thumb-muted-foreground/40 scrollbar-track-transparent"
      >
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {items.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            Aucune notification
          </div>
        ) : (
          items.map((n) => {
            const isNew = !n.read_at;
            const data = (n.data ?? {}) as Record<string, unknown>;
            const kind = String(data.kind ?? "info");
            let title = "Notification";
            let desc = (() => {
              try {
                return JSON.stringify(data);
              } catch {
                return "—";
              }
            })();
            let target = "/dashboard/index";

            if (kind === "new_demande") {
              title = "Nouvelle demande de devis";
              desc = [data.name, data.formation].filter(Boolean).join(" · ");
              target = "/dashboard/students";
            } else if (kind === "new_contact") {
              title = "Nouveau message de contact";
              desc = [data.name, data.subject].filter(Boolean).join(" · ");
              target = "/dashboard/messages";
            }

            return (
              <DropdownMenuItem
                key={String(n.id)}
                className={`flex flex-col items-start gap-1 py-3 transition-colors ${
                  isNew ? "bg-muted/40 hover:bg-muted/60" : "hover:bg-muted/30"
                }`}
                onClick={async () => {
                  await markRead(n.id);
                  navigate(target);
                }}
              >
                <div className="w-full flex items-center justify-between">
                  <div className="font-medium">{title}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {timeAgo(n.created_at)}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{desc || "—"}</div>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationsDropdown;