/* eslint-disable no-empty */
// src/components/dashboard/PopularCoursesChart.tsx
import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";

/* ---------- API base + fetch sécurisé ---------- */
// Tolère VITE_API_URL avec ou sans /api
function resolveApiBase() {
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

/* ---------- Types ---------- */
type DemandeDevis = { id: number; formation: string | null; status: "En attente" | "Traité" };
type ChartRow = { name: string; students: number };
type Props = { height?: number; className?: string };

/* ---------- Fetch paginé protégé ---------- */
async function fetchAllDemandes(status: "Toutes" | "En attente" | "Traité"): Promise<DemandeDevis[]> {
  const base =
    status === "Toutes"
      ? `/demandes-devis`
      : `/demandes-devis?status=${encodeURIComponent(status)}`;

  let page = 1;
  const out: DemandeDevis[] = [];

  while (true) {
    const path = base + (base.includes("?") ? "&" : "?") + `page=${page}&per_page=200`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = await requestJson<any>(path);

    if (Array.isArray(payload)) {
      out.push(...payload);
      break;
    }
    if (Array.isArray(payload?.data)) {
      const pageData = payload.data as DemandeDevis[];
      out.push(...pageData);
      const cur = Number(payload?.meta?.current_page ?? page);
      const last = Number(payload?.meta?.last_page ?? cur);
      if (!last || cur >= last || pageData.length === 0) break;
      page = cur + 1;
      continue;
    }
    break;
  }

  return out;
}

function buildChartData(demandes: DemandeDevis[], topN = 10): ChartRow[] {
  const map = new Map<string, number>();
  for (const d of demandes) {
    const key = (d.formation ?? "").trim() || "(Sans intitulé)";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  const sorted = Array.from(map.entries())
    .map(([name, students]) => ({ name, students }))
    .sort((a, b) => b.students - a.students);

  if (sorted.length > topN) {
    const head = sorted.slice(0, topN);
    const tail = sorted.slice(topN).reduce((n, r) => n + r.students, 0);
    return tail > 0 ? [...head, { name: "Autres", students: tail }] : head;
  }
  return sorted;
}

export function PopularCoursesChart({ height = 420, className }: Props) {
  const navigate = useNavigate();

  const [status, setStatus] = React.useState<"Toutes" | "En attente" | "Traité">("Toutes");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<ChartRow[]>([]);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const demandes = await fetchAllDemandes(status);
      setData(buildChartData(demandes, 8));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur de chargement";
      setError(msg);
      setData([]);
      if (String(msg).toLowerCase().includes("session expirée")) {
        navigate("/dashboard/login", {
          replace: true,
          state: { from: { pathname: "/dashboard/index" } },
        });
      }
    } finally {
      setLoading(false);
    }
  }, [status, navigate]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <Card className={`p-6 animate-fade-in border-0 bg-gradient-card ${className ?? ""}`}>
      <div className="flex items-center justify-between mb-4 gap-4">
        <h3 className="text-lg font-semibold">Formations par apprenants</h3>
        <div className="flex items-center gap-2">
  <span className="text-sm text-muted-foreground hidden sm:inline">Statut :</span>

  <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
    {/* Trigger : fond blanc + ring bleu */}
    <SelectTrigger
      className="
        w-[160px]
        bg-white text-black dark:bg-white dark:text-black
        focus-visible:ring-2 focus-visible:ring-[#7babd0] focus-visible:ring-offset-2
      "
    >
      <SelectValue placeholder="Toutes" />
    </SelectTrigger>

    {/* Content : on fixe l'accent au bleu */}
    <SelectContent
      align="end"
      className="
        bg-white text-black dark:bg-white dark:text-black
        [--accent:#7babd0] [--accent-foreground:#000]
        focus-visible:ring-[#7babd0] focus-visible:ring-offset-2
      "
    >
      {["Toutes","En attente","Traité"].map((val) => (
        <SelectItem
          key={val}
          value={val}
          className="
            text-black dark:text-black rounded-md
            hover:bg-[#7babd0]/20
            data-[highlighted]:bg-[#7babd0]/20
            data-[state=checked]:bg-[#7babd0]
            data-[state=checked]:text-black
            data-[state=checked]:font-semibold
          "
        >
          {val}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

      </div>

      {loading ? (
        <div className="h-[300px] grid place-items-center text-sm text-muted-foreground">Chargement…</div>
      ) : error ? (
        <div className="h-[300px] grid place-items-center text-sm text-destructive">{error}</div>
      ) : data.length === 0 ? (
        <div className="h-[300px] grid place-items-center text-sm text-muted-foreground">
          Aucune donnée à afficher.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              angle={-30}
              textAnchor="end"
              height={70}
              interval={0}
            />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => [`${v}`, "Apprenants"]}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Bar dataKey="students" fill="hsl(217 91% 60%)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
