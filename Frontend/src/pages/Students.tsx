// src/pages/Students.tsx
import * as React from "react";
import {
  Eye,
  Search,
  Download,
  MoreVertical,
  ClipboardList,
  Pencil,
  Trash,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/* ================== API base + fetch sécurisé ================== */
function resolveApiBase() {
  // tolère VITE_API_URL avec ou sans /api
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
      // Session expirée ou pas de token
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      throw new Error("Session expirée. Merci de vous reconnecter.");
    }
    let message = `Erreur ${res.status}`;
    try {
      const j = await res.json();
      const msg = typeof j?.message === "string" ? j.message : null;
      const firstFromErrors = (() => {
        const e = j?.errors;
        if (e && typeof e === "object") {
          const flat = Object.values(e as Record<string, unknown>)
            .flat()
            .find((x) => typeof x === "string");
          return flat as string | undefined;
        }
        return undefined;
      })();
      message = msg || firstFromErrors || message;
    } catch {/* ignore */}
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/* ================== Types ================== */
type DemandeDevis = {
  id: number;
  formation: string;
  name: string;
  email: string;
  phone?: string | null;
  notes?: string | null;
  status: "En attente" | "Traité";
  traitement_notes?: string | null;
  processed_by?: string | null;
  processed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const Students: React.FC = () => {
  const navigate = useNavigate();
// Suppression
const [deleteOpen, setDeleteOpen] = React.useState(false);
const [deleteBusy, setDeleteBusy] = React.useState(false);
const [deleteTarget, setDeleteTarget] = React.useState<DemandeDevis | null>(null);

  // Liste
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<DemandeDevis[]>([]);
  const [query, setQuery] = React.useState("");

  // --- Filtre formation ---
  const [formationFilter, setFormationFilter] = React.useState<string>("Toutes");
  const formations = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.formation && set.add(i.formation));
    return ["Toutes", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  // Détails
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [detailsLoading, setDetailsLoading] = React.useState(false);
  const [details, setDetails] = React.useState<DemandeDevis | null>(null);

  // Traitement
  const [treatOpen, setTreatOpen] = React.useState(false);
  const [treatBusy, setTreatBusy] = React.useState(false);
  const [treatNote, setTreatNote] = React.useState("");
  const [treatStatus, setTreatStatus] =
    React.useState<DemandeDevis["status"]>("Traité");
  const [treatTarget, setTreatTarget] =
    React.useState<DemandeDevis | null>(null);

  // Edition (modifier)
  const [editOpen, setEditOpen] = React.useState(false);
  const [editBusy, setEditBusy] = React.useState(false);
  const [editData, setEditData] = React.useState<
    Pick<DemandeDevis, "id" | "name" | "email" | "phone" | "formation" | "notes"> | null
  >(null);
  const [editStatus, setEditStatus] =
    React.useState<DemandeDevis["status"]>("En attente");

  /* ================== Chargement initial (protégé) ================== */
  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const payload = await requestJson<{ data?: DemandeDevis[] } | DemandeDevis[]>("/demandes-devis");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: DemandeDevis[] = Array.isArray((payload as any)?.data)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? (payload as any).data
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          : (payload as any);
        setItems(data ?? []);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Impossible de charger les demandes";
        toast.error(msg);
        if (String(msg).toLowerCase().includes("session expirée")) {
          navigate("/dashboard/login", { replace: true, state: { from: { pathname: "/dashboard/students" } } });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  /* ================== Filtre côté client ================== */
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = items;

    if (formationFilter !== "Toutes") {
      arr = arr.filter((d) => d.formation === formationFilter);
    }

    if (!q) return arr;

    return arr.filter((d) => {
      const blob = [
        d.name,
        d.email,
        d.phone,
        d.formation,
        d.status,
        d.notes,
        d.traitement_notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [items, query, formationFilter]);

  /* ================== Export CSV (local) ================== */
  const exportCsv = () => {
    const rows = [
      [
        "ID",
        "Nom",
        "Email",
        "Téléphone",
        "Formation",
        "Notes client",
        "Statut",
        "Traité par",
        "Traité le",
        "Notes internes",
        "Créé le",
      ],
      ...filtered.map((d) => [
        d.id,
        d.name,
        d.email,
        d.phone ?? "",
        d.formation,
        (d.notes ?? "").replace(/\n/g, " "),
        d.status,
        d.processed_by ?? "",
        d.processed_at ?? "",
        (d.traitement_notes ?? "").replace(/\n/g, " "),
        d.created_at ?? "",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "demandes-devis.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ================== Détails (show protégé) ================== */
  const openDetails = async (id: number) => {
    try {
      setDetailsOpen(true);
      setDetailsLoading(true);
      const payload = await requestJson<{ data?: DemandeDevis } | DemandeDevis>(`/demandes-devis/${id}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rec: DemandeDevis = (payload as any)?.data ?? payload;
      setDetails(rec);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Impossible de charger le détail";
      toast.error(msg);
      setDetailsOpen(false);
      if (String(msg).toLowerCase().includes("session expirée")) {
        navigate("/dashboard/login", { replace: true, state: { from: { pathname: "/dashboard/students" } } });
      }
    } finally {
      setDetailsLoading(false);
    }
  };

  /* ================== Traitement (PATCH protégé) ================== */
  const openTreat = (d: DemandeDevis) => {
    setTreatTarget(d);
    setTreatNote(d.traitement_notes ?? "");
    setTreatStatus(d.status ?? "En attente");
    setTreatOpen(true);
  };

  const saveTreatment = async () => {
    if (!treatTarget) return;
    try {
      setTreatBusy(true);
      const payload = await requestJson<{ data?: DemandeDevis } | DemandeDevis>(`/demandes-devis/${treatTarget.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: treatStatus,
          traitement_notes: treatNote,
        }),
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated: DemandeDevis = (payload as any)?.data ?? payload;

      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setDetails((d) => (d && d.id === updated.id ? updated : d));

      toast.success("Demande mise à jour.");
      setTreatOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Échec de la mise à jour (traitement)";
      toast.error(msg);
      if (String(msg).toLowerCase().includes("session expirée")) {
        navigate("/dashboard/login", { replace: true, state: { from: { pathname: "/dashboard/students" } } });
      }
    } finally {
      setTreatBusy(false);
    }
  };

  /* ================== Edition (PATCH protégé) ================== */
  const openEdit = (d: DemandeDevis) => {
    setEditData({
      id: d.id,
      name: d.name ?? "",
      email: d.email ?? "",
      phone: d.phone ?? "",
      formation: d.formation ?? "",
      notes: d.notes ?? "",
    });
    setEditStatus(d.status);
    setEditOpen(true);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!editData) return;
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const validateEdit = () => {
    if (!editData) return "Formulaire vide";
    if (!editData.name || editData.name.trim().length < 2) return "Nom invalide";
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(editData.email)) return "Email invalide";
    if (!editData.formation || editData.formation.trim().length < 2) return "Formation invalide";
    return null;
  };

  const saveEdit = async () => {
    const err = validateEdit();
    if (err) {
      toast.error(err);
      return;
    }
    if (!editData) return;

    try {
      setEditBusy(true);
      const payload = await requestJson<{ data?: DemandeDevis } | DemandeDevis>(`/demandes-devis/${editData.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: editStatus,
          name: editData.name,
          email: editData.email,
          phone: editData.phone ?? "",
          formation: editData.formation,
          notes: editData.notes ?? "",
        }),
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated: DemandeDevis = (payload as any)?.data ?? payload;

      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setDetails((d) => (d && d.id === updated.id ? updated : d));

      toast.success("Demande modifiée.");
      setEditOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Échec de la mise à jour (édition)";
      toast.error(msg);
      if (String(msg).toLowerCase().includes("session expirée")) {
        navigate("/dashboard/login", { replace: true, state: { from: { pathname: "/dashboard/students" } } });
      }
    } finally {
      setEditBusy(false);
    }
  };
// Ouvre la confirmation de suppression
const confirmDelete = (d: DemandeDevis) => {
  setDeleteTarget(d);
  setDeleteOpen(true);
};

// Supprime (DELETE protégé)
const deleteOne = async (id?: number) => {
  const delId = id ?? deleteTarget?.id;
  if (!delId) return;
  try {
    setDeleteBusy(true);
    await requestJson(`/demandes-devis/${delId}`, { method: "DELETE" });

    // MAJ liste + éventuellement détail
    setItems(prev => prev.filter(x => x.id !== delId));
    setDetails(d => (d && d.id === delId ? null : d));

    toast.success("Demande supprimée.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Échec de la suppression";
    toast.error(msg);
    if (String(msg).toLowerCase().includes("session expirée")) {
      navigate("/dashboard/login", {
        replace: true,
        state: { from: { pathname: "/dashboard/students" } },
      });
    }
  } finally {
    setDeleteBusy(false);
    setDeleteOpen(false);
    setDeleteTarget(null);
  }
};

  /* ================== Rendu ================== */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Demandes de devis</h1>
          <p className="text-muted-foreground">
            Statut par défaut : <strong>En attente</strong>. Mettez à jour
            après traitement.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportCsv}>
          <Download className="h-4 w-4" />
          Exporter
        </Button>
      </div>

      {/* Search + Filtre formation */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher (nom, email, formation, téléphone, statut, notes)…"
            className="pl-10 bg-muted/50 border-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

       {/* === Filtre formation === */}
<div className="w-full md:w-auto">
  <Label className="sr-only">Formation</Label>
  <Select value={formationFilter} onValueChange={setFormationFilter}>
    <SelectTrigger className="w-[260px] bg-white text-black dark:bg-white dark:text-black">
      <SelectValue placeholder="Toutes les formations" />
    </SelectTrigger>

    {/* On fixe aussi les vars accent pour coherencer */}
    <SelectContent className="bg-white text-black dark:bg-white dark:text-black [--accent:#7babd0] [--accent-foreground:#000]">
      {formations.map((f) => (
        <SelectItem
          key={f}
          value={f}
          className={cn(
            "text-black dark:text-black rounded-md",
            // Survol + navigation clavier
            "hover:bg-[#7babd0]/20 data-[highlighted]:bg-[#7babd0]/20",
            // ✅ Sélection immédiate (non dépendante du hover)
            "data-[state=checked]:bg-[#7babd0] data-[state=checked]:text-black data-[state=checked]:font-semibold"
          )}
        >
          {f}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>


      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card animate-fade-in">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Client</TableHead>
              <TableHead>Coordonnées</TableHead>
              <TableHead>Formation</TableHead>
              <TableHead>Notes client</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Traité par / le</TableHead>
              <TableHead className="text-right w-[100px] pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Chargement…
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Aucune demande
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((d) => (
                <TableRow key={d.id} className="hover:bg-muted/40">
                  <TableCell>
                    <div className="font-medium">{d.name}</div>
                    <div className="text-xs text-muted-foreground">#{d.id}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{d.email}</div>
                    <div className="text-xs text-muted-foreground">{d.phone || "—"}</div>
                  </TableCell>
                  <TableCell className="max-w-[240px]">{d.formation}</TableCell>
                  <TableCell className="max-w-[320px] truncate" title={d.notes ?? ""}>
                    {d.notes || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        d.status === "Traité"
                          ? "bg-emerald-600 text-white hover:bg-emerald-600"
                          : "bg-[#7babd0] text-black hover:bg-[#7babd0]"
                      }
                    >
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {d.processed_by ? d.processed_by : "—"}
                    <br />
                    <span className="text-xs text-muted-foreground">
                      {d.processed_at ? new Date(d.processed_at).toLocaleString() : "—"}
                    </span>
                  </TableCell>

                  {/* Actions: menu kebab */}
                  <TableCell className="text-right w-[100px] pr-4">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="
          h-8 w-8 rounded-full
          text-foreground
          /* ✅ anneau focus bleu */
          focus-visible:ring-2 focus-visible:ring-[#7babd0] focus-visible:ring-offset-2
          /* ✅ fond bleu doux au survol et quand ouvert */
          hover:!bg-[#7babd0]/20
          data-[state=open]:!bg-[#7babd0]/20
          hover:!text-foreground
        "
      >
        <MoreVertical className="h-4 w-4" />
        <span className="sr-only">Ouvrir le menu</span>
      </Button>
    </DropdownMenuTrigger>

    {/* ✅ Accent global bleu */}
    <DropdownMenuContent
      align="end"
      className="
        w-48
        [--accent:#7babd0]
        [--accent-foreground:#000]
        focus-visible:ring-[#7babd0]
        focus-visible:ring-offset-2
      "
    >
      <DropdownMenuItem
        onClick={() => openDetails(d.id)}
        className="
          gap-2
          hover:bg-[#7babd0]/20
          data-[highlighted]:bg-[#7babd0]/20
          data-[state=checked]:bg-[#7babd0]
          data-[state=checked]:text-black
          data-[state=checked]:font-semibold
        "
      >
        <Eye className="h-4 w-4" />
        Voir détails
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => openEdit(d)}
        className="
          gap-2
          hover:bg-[#7babd0]/20
          data-[highlighted]:bg-[#7babd0]/20
          data-[state=checked]:bg-[#7babd0]
          data-[state=checked]:text-black
          data-[state=checked]:font-semibold
        "
      >
        <Pencil className="h-4 w-4" />
        Modifier…
      </DropdownMenuItem>


      <DropdownMenuItem
        onClick={() => openTreat(d)}
        className="
          gap-2
          hover:bg-[#7babd0]/20
          data-[highlighted]:bg-[#7babd0]/20
          data-[state=checked]:bg-[#7babd0]
          data-[state=checked]:text-black
          data-[state=checked]:font-semibold
        "
      >
        <ClipboardList className="h-4 w-4" />
        Traiter…
      </DropdownMenuItem>
       <DropdownMenuSeparator />
      <DropdownMenuItem
  onClick={() => confirmDelete(d)}
  className="gap-2 text-destructive hover:bg-destructive/10 data-[highlighted]:bg-destructive/10"
>
  <Trash className="h-4 w-4" />
  Supprimer…
</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</TableCell>

                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog DÉTAILS */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Détail de la demande</DialogTitle>
            <DialogDescription>Informations complètes de la demande de devis.</DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="text-sm text-muted-foreground">Chargement…</div>
          ) : details ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground mb-1">Identifiant</div>
                <div className="font-medium">#{details.id}</div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground mb-1">Statut</div>
                <Badge
                  variant="secondary"
                  className={
                    details.status === "Traité"
                      ? "bg-emerald-600 text-white hover:bg-emerald-600"
                      : "bg-[#7babd0] text-black hover:bg-[#7babd0]"
                  }
                >
                  {details.status}
                </Badge>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground mb-1">Nom</div>
                <div className="font-medium">{details.name}</div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground mb-1">Email</div>
                <div className="font-medium break-all">{details.email}</div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground mb-1">Téléphone</div>
                <div className="font-medium">{details.phone || "—"}</div>
              </div>

              <div className="rounded-lg border p-3 md:col-span-2">
                <div className="text-xs text-muted-foreground mb-1">Formation</div>
                <div className="font-medium">{details.formation}</div>
              </div>

              <div className="rounded-lg border p-3 md:col-span-2">
                <div className="text-xs text-muted-foreground mb-1">Notes client</div>
                <div className="font-medium whitespace-pre-wrap">{details.notes || "—"}</div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground mb-1">Traité par</div>
                <div className="font-medium">{details.processed_by || "—"}</div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground mb-1">Traité le</div>
                <div className="font-medium">
                  {details.processed_at ? new Date(details.processed_at).toLocaleString() : "—"}
                </div>
              </div>

              <div className="rounded-lg border p-3 md:col-span-2">
                <div className="text-xs text-muted-foreground mb-1">Notes internes</div>
                <div className="font-medium whitespace-pre-wrap">
                  {details.traitement_notes || "—"}
                </div>
              </div>

              <div className="text-xs text-muted-foreground md:col-span-2">
                Créée le {details.created_at ? new Date(details.created_at).toLocaleString() : "—"}
              </div>
            </div>
          ) : (
            <div className="text-sm text-destructive">Aucune donnée.</div>
          )}

          <DialogFooter className="flex items-center justify-between">
           <Button
  onClick={() => setDetailsOpen(false)}
  className="
    bg-[#7babd0] 
    hover:bg-[#6ea4c8] 
    text-black 
    border-0
    dark:bg-[#7babd0] 
    dark:hover:bg-[#6ea4c8]
  "
>
  Fermer
</Button>


            {details && details.status !== "Traité" && (
              <Button
                onClick={() => {
                  setDetailsOpen(false);
                  openTreat(details);
                }}
                className="h-10 px-4 bg-[#7babd0] hover:bg-[#6ea4c8] text-black border-0"
              >
                Traiter cette demande
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog TRAITER */}
      <Dialog open={treatOpen} onOpenChange={setTreatOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Traitement de la demande</DialogTitle>
            <DialogDescription>
              Ajustez le <strong>statut</strong> et renseignez vos notes internes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm">
              <span className="font-medium">Client :</span> {treatTarget?.name}
            </div>
            <div className="text-sm">
              <span className="font-medium">Formation :</span> {treatTarget?.formation}
            </div>

            <div className="space-y-2">
  <Label htmlFor="treat-status">Statut</Label>
  <Select
    value={treatStatus}
    onValueChange={(v) => setTreatStatus(v as DemandeDevis["status"])}
  >
    <SelectTrigger
      id="treat-status"
      className="bg-white text-black dark:bg-white dark:text-black"
    >
      <SelectValue placeholder="Choisir un statut" />
    </SelectTrigger>
    <SelectContent
      className="
        bg-white text-black dark:bg-white dark:text-black
        [--accent:#7babd0] [--accent-foreground:#000]
      "
    >
      <SelectItem
        value="En attente"
        className="
          text-black dark:text-black
          rounded-md
          hover:bg-[#7babd0]/20
          data-[highlighted]:bg-[#7babd0]/20
          data-[state=checked]:bg-[#7babd0]
          data-[state=checked]:text-black
          data-[state=checked]:font-semibold
        "
      >
        En attente
      </SelectItem>

      <SelectItem
        value="Traité"
        className="
          text-black dark:text-black
          rounded-md
          hover:bg-[#7babd0]/20
          data-[highlighted]:bg-[#7babd0]/20
          data-[state=checked]:bg-[#7babd0]
          data-[state=checked]:text-black
          data-[state=checked]:font-semibold
        "
      >
        Traité
      </SelectItem>
    </SelectContent>
  </Select>
</div>


            <div className="space-y-2">
              <Label htmlFor="treat-notes">Notes internes</Label>
              <Textarea
                id="treat-notes"
                rows={5}
                value={treatNote}
                onChange={(e) => setTreatNote(e.target.value)}
                placeholder="Résumé du traitement, proposition, suite à donner…"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
  variant="outline"
  onClick={() => setTreatOpen(false)}
  disabled={treatBusy}
  className="
    bg-[#7babd0]
    hover:bg-[#6ea4c8]
    text-black
    border-0
    dark:bg-[#7babd0]
    dark:hover:bg-[#6ea4c8]
  "
>
  Annuler
</Button>


            <Button onClick={saveTreatment} disabled={treatBusy} className="bg-[#7babd0] text-black">
              {treatBusy ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog MODIFIER */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier la demande</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations du client et de la formation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
           <div className="space-y-2">
  <Label htmlFor="edit-status">Statut</Label>
  <Select value={editStatus} onValueChange={(v) => setEditStatus(v as DemandeDevis["status"])}>
    <SelectTrigger
      id="edit-status"
      className="bg-white text-black dark:bg-white dark:text-black"
    >
      <SelectValue placeholder="Choisir un statut" />
    </SelectTrigger>
    <SelectContent
      className="
        bg-white text-black dark:bg-white dark:text-black
        [--accent:#7babd0] [--accent-foreground:#000]
      "
    >
      <SelectItem
        value="En attente"
        className="
          text-black dark:text-black
          rounded-md
          hover:bg-[#7babd0]/20
          data-[highlighted]:bg-[#7babd0]/20
          data-[state=checked]:bg-[#7babd0]
          data-[state=checked]:text-black
          data-[state=checked]:font-semibold
        "
      >
        En attente
      </SelectItem>
      <SelectItem
        value="Traité"
        className="
          text-black dark:text-black
          rounded-md
          hover:bg-[#7babd0]/20
          data-[highlighted]:bg-[#7babd0]/20
          data-[state=checked]:bg-[#7babd0]
          data-[state=checked]:text-black
          data-[state=checked]:font-semibold
        "
      >
        Traité
      </SelectItem>
    </SelectContent>
  </Select>
</div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom complet</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editData?.name ?? ""}
                  onChange={handleEditChange}
                  placeholder="Nom complet"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={editData?.email ?? ""}
                  onChange={handleEditChange}
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Téléphone</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  value={editData?.phone ?? ""}
                  onChange={handleEditChange}
                  placeholder="+212 6 xx xx xx xx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-formation">Formation</Label>
                <Input
                  id="edit-formation"
                  name="formation"
                  value={editData?.formation ?? ""}
                  onChange={handleEditChange}
                  placeholder="Intitulé de la formation"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes du client</Label>
              <Textarea
                id="edit-notes"
                name="notes"
                rows={4}
                value={editData?.notes ?? ""}
                onChange={handleEditChange}
                placeholder="Remarques communiquées par le client…"
              />
            </div>
          </div>

          <DialogFooter>
         <Button
  variant="outline"
  onClick={() => setEditOpen(false)}
  disabled={editBusy}
  className="
    bg-[#7babd0] 
    hover:bg-[#6ea4c8] 
    text-black 
    border-0
    dark:bg-[#7babd0] 
    dark:hover:bg-[#6ea4c8]
  "
>
  Annuler
</Button>


            <Button onClick={saveEdit} disabled={editBusy} className="bg-[#7babd0] text-black">
              {editBusy ? "Enregistrement…" : "Enregistrer les modifications"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
  open={deleteOpen}
  onOpenChange={(o) => {
    if (!o) {
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  }}
>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
      <AlertDialogDescription>
        Cette action est <strong>irréversible</strong>. Voulez-vous vraiment supprimer cette demande ?
      </AlertDialogDescription>
    </AlertDialogHeader>

    <div className="rounded-lg border p-3 text-sm bg-muted/30">
      {deleteTarget ? (
        <>
          <div><span className="font-medium">Client :</span> {deleteTarget.name}</div>
          <div><span className="font-medium">Formation :</span> {deleteTarget.formation}</div>
          <div className="text-muted-foreground">ID #{deleteTarget.id}</div>
        </>
      ) : (
        <div className="text-muted-foreground">Aucune sélection.</div>
      )}
    </div>

    <AlertDialogFooter>
      <AlertDialogCancel disabled={deleteBusy}>Annuler</AlertDialogCancel>
      <AlertDialogAction
        disabled={deleteBusy}
        onClick={() => deleteOne()}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        {deleteBusy ? "Suppression…" : "Supprimer définitivement"}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

    </div>
  );
};

export default Students;
