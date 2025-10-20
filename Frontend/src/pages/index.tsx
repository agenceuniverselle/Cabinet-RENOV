/* eslint-disable no-empty */
// src/pages/Index.tsx
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { PopularCoursesChart } from "@/components/dashboard/PopularCoursesChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { Users, BookOpen } from "lucide-react";

/* ---------- API base + fetch sécurisé ---------- */
function resolveApiBase() {
  // Tolère VITE_API_URL avec ou sans /api
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = (import.meta as any).env?.VITE_API_URL ?? "http://127.0.0.1:8000/api";
  const base = String(raw).replace(/\/+$/, "");
  return /\/api$/.test(base) ? base : `${base}/api`;
}
const API_URL = resolveApiBase();

async function requestJson<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(init?.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      throw new Error("Session expirée. Merci de vous reconnecter.");
    }
    let message = `Erreur ${res.status}`;
    try {
      const j = await res.json();
      const msg = typeof j?.message === "string" ? j.message : null;
      const first = (() => {
        const e = j?.errors;
        if (e && typeof e === "object") {
          const flat = Object.values(e as Record<string, unknown>)
            .flat()
            .find((x) => typeof x === "string");
          return flat as string | undefined;
        }
        return undefined;
      })();
      message = msg || first || message;
    } catch {}
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/* ---------- util: compte paginé Laravel ---------- */
async function fetchPaginatedCount(path: string): Promise<number> {
  // utilise requestJson pour inclure le token si besoin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = await requestJson<any>(path);

  if (payload?.meta?.total != null) return Number(payload.meta.total) || 0;
  if (Array.isArray(payload?.data)) return payload.data.length;
  if (Array.isArray(payload)) return payload.length;
  return 0;
}

const Index: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [formationsCount, setFormationsCount] = React.useState(0);
  const [devisTotal, setDevisTotal] = React.useState(0);
  const [devisTraites, setDevisTraites] = React.useState(0);
  const devisTaux = React.useMemo(
    () => (devisTotal ? Math.round((devisTraites / devisTotal) * 100) : 0),
    [devisTotal, devisTraites]
  );

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [fCount, dTotal, dTraites] = await Promise.all([
          // /formations est public, mais requestJson marche aussi
          fetchPaginatedCount(`/formations`),
          // protégés → token obligatoire
          fetchPaginatedCount(`/demandes-devis`),
          fetchPaginatedCount(`/demandes-devis?status=${encodeURIComponent("Traité")}`),
        ]);
        setFormationsCount(fCount);
        setDevisTotal(dTotal);
        setDevisTraites(dTraites);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.toLowerCase().includes("session expirée")) {
          navigate("/dashboard/login", {
            replace: true,
            state: { from: { pathname: "/dashboard/index" } },
          });
        } else {
          console.error(msg);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const dash = (v: number, suffix = "") => (loading ? "—" : `${v}${suffix}`);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre plateforme e-learning</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Cours actifs" value={dash(formationsCount)} icon={BookOpen} iconColor="text-accent" />
        <StatCard title="Apprenants (devis)" value={dash(devisTotal)} icon={Users} iconColor="text-accent" />
        <StatCard title="Traités (devis)" value={dash(devisTraites)} icon={Users} iconColor="text-accent" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-1">
        <PopularCoursesChart />
      </div>
    </div>
  );
};

export default Index;
