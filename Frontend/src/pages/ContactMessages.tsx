// src/pages/ContactMessages.tsx — Tableau des messages de contact (style cohérent Students)
import * as React from "react";
import {
  Eye,
  Search,
  Download,
  MoreVertical,
  ClipboardList,
  CheckCircle,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Trash2,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = typeof (j as any)?.message === "string" ? (j as any).message : null;
      const firstFromErrors = (() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const e = (j as any)?.errors;
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
export type ContactMessage = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: "Nouveau" | "Lu" | "Traité" | "Archivé";
  internal_notes?: string | null;
  processed_by?: string | null;
  processed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const STATUS_VALUES: ContactMessage["status"][] = [
  "Nouveau",
  "Lu",
  "Traité",
  "Archivé",
];

/* ================== Page ================== */
const ContactMessages: React.FC = () => {
  const navigate = useNavigate();

  // Liste
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<ContactMessage[]>([]);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("Tous");

  const statuses = React.useMemo(() => ["Tous", ...STATUS_VALUES], []);

  // Détails
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [detailsLoading, setDetailsLoading] = React.useState(false);
  const [details, setDetails] = React.useState<ContactMessage | null>(null);

  // Traitement
  const [treatOpen, setTreatOpen] = React.useState(false);
  const [treatBusy, setTreatBusy] = React.useState(false);
  const [treatStatus, setTreatStatus] = React.useState<ContactMessage["status"]>("Lu");
  const [treatNotes, setTreatNotes] = React.useState("");
  const [treatTarget, setTreatTarget] = React.useState<ContactMessage | null>(null);
  // Suppression (dialog)
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<ContactMessage | null>(null);

  // Suppression (facultatif)
  const [deleteBusy, setDeleteBusy] = React.useState(false);

  /* ================== Chargement initial ================== */
  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const payload = await requestJson<{ data?: ContactMessage[] } | ContactMessage[]>(
          "/contact-messages"
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: ContactMessage[] = Array.isArray((payload as any)?.data)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? ((payload as any).data as ContactMessage[])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          : ((payload as any) as ContactMessage[]);
        setItems(data ?? []);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Impossible de charger les messages";
        toast.error(msg);
        if (String(msg).toLowerCase().includes("session expirée")) {
          navigate("/dashboard/login", { replace: true, state: { from: { pathname: "/dashboard/messages" } } });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  /* ================== Filtre ================== */
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = items;

    if (statusFilter !== "Tous") {
      arr = arr.filter((m) => m.status === statusFilter);
    }

    if (!q) return arr;

    return arr.filter((m) => {
      const blob = [
        m.name,
        m.email,
        m.phone,
        m.subject,
        m.message,
        m.status,
        m.internal_notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [items, query, statusFilter]);

  /* ================== Export CSV ================== */
  const exportCsv = () => {
    const rows = [
      [
        "ID",
        "Nom",
        "Email",
        "Téléphone",
        "Sujet",
        "Message",
        "Statut",
        "Traité par",
        "Traité le",
        "Notes internes",
        "Reçu le",
      ],
      ...filtered.map((m) => [
        m.id,
        m.name,
        m.email,
        m.phone ?? "",
        (m.subject ?? "").replace(/\n/g, " "),
        (m.message ?? "").replace(/\n/g, " "),
        m.status,
        m.processed_by ?? "",
        m.processed_at ?? "",
        (m.internal_notes ?? "").replace(/\n/g, " "),
        m.created_at ?? "",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contact-messages.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ================== Détails ================== */
  const openDetails = async (id: number) => {
    try {
      setDetailsOpen(true);
      setDetailsLoading(true);
      const payload = await requestJson<{ data?: ContactMessage } | ContactMessage>(
        `/contact-messages/${id}`
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rec: ContactMessage = (payload as any)?.data ?? (payload as any);
      setDetails(rec);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Impossible de charger le détail";
      toast.error(msg);
      setDetailsOpen(false);
      if (String(msg).toLowerCase().includes("session expirée")) {
        navigate("/dashboard/login", { replace: true, state: { from: { pathname: "/dashboard/messages" } } });
      }
    } finally {
      setDetailsLoading(false);
    }
  };

  /* ================== Marquer / Traiter ================== */
  const openTreat = (m: ContactMessage) => {
    setTreatTarget(m);
    setTreatStatus(m.status ?? "Lu");
    setTreatNotes(m.internal_notes ?? "");
    setTreatOpen(true);
  };

  const saveTreatment = async () => {
    if (!treatTarget) return;
    try {
      setTreatBusy(true);
      const payload = await requestJson<{ data?: ContactMessage } | ContactMessage>(
        `/contact-messages/${treatTarget.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: treatStatus,
            internal_notes: treatNotes,
          }),
        }
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated: ContactMessage = (payload as any)?.data ?? (payload as any);
      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setDetails((d) => (d && d.id === updated.id ? updated : d));
      toast.success("Message mis à jour.");
      setTreatOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Échec de la mise à jour";
      toast.error(msg);
      if (String(msg).toLowerCase().includes("session expirée")) {
        navigate("/dashboard/login", { replace: true, state: { from: { pathname: "/dashboard/messages" } } });
      }
    } finally {
      setTreatBusy(false);
    }
  };
const confirmDelete = (m: ContactMessage) => {
  setDeleteTarget(m);
  setDeleteOpen(true);
};

const deleteOne = async (id?: number) => {
  const delId = id ?? deleteTarget?.id;
  if (!delId) return;
  try {
    setDeleteBusy(true);
    await requestJson(`/contact-messages/${delId}`, { method: "DELETE" });
    setItems(prev => prev.filter(x => x.id !== delId));
    setDetails(d => (d && d.id === delId ? null : d));
    toast.success("Message supprimé.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Échec de la suppression";
    toast.error(msg);
    if (String(msg).toLowerCase().includes("session expirée")) {
      navigate("/dashboard/login", { replace: true, state: { from: { pathname: "/dashboard/messages" } } });
    }
  } finally {
    setDeleteBusy(false);
    setDeleteOpen(false);
    setDeleteTarget(null);
  }
};

  /* ================== Suppression (optionnelle) ================== */
  const deleteMessage = async (m: ContactMessage) => {
    if (!confirm(`Supprimer le message #${m.id} de ${m.name} ?`)) return;
    try {
      setDeleteBusy(true);
      await requestJson(`/contact-messages/${m.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((x) => x.id !== m.id));
      toast.success("Message supprimé.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Échec de la suppression";
      toast.error(msg);
    } finally {
      setDeleteBusy(false);
    }
  };

  /* ================== Rendu ================== */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Messages de contact</h1>
          <p className="text-muted-foreground">Gérez les messages reçus depuis le formulaire de contact.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportCsv}>
          <Download className="h-4 w-4" />
          Exporter
        </Button>
      </div>

      {/* Search + Filtre statut */}
     <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
  <div className="relative w-full md:w-[380px] md:shrink-0 md:grow-0">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      type="search"
      placeholder="Rechercher (nom, email, sujet, message, statut)…"
      className="pl-10 bg-muted/50 border-0"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  </div>
  </div>
      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card animate-fade-in">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Expéditeur</TableHead>
              <TableHead>Coordonnées</TableHead>
              <TableHead>Sujet</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Reçu le</TableHead>
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
                  Aucun message
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => (
                <TableRow key={m.id} className="hover:bg-muted/40">
                  <TableCell>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">#{m.id}</div>
                  </TableCell>

                  <TableCell className="text-sm">
                    <div className="flex items-center gap-2">
                      <MailIcon className="h-4 w-4" />
                      <a href={`mailto:${m.email}`} className="underline underline-offset-2">{m.email}</a>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                      <PhoneIcon className="h-4 w-4" />
                      <span>{m.phone || "—"}</span>
                    </div>
                  </TableCell>

                  <TableCell className="max-w-[260px] truncate" title={m.subject ?? ""}>
                    {m.subject || "—"}
                  </TableCell>

                  <TableCell className="max-w-[360px] truncate" title={m.message}>
                    {m.message}
                  </TableCell>


                  <TableCell className="text-sm">
                    {m.created_at ? new Date(m.created_at).toLocaleString() : "—"}
                  </TableCell>
<TableCell className="text-right w-[100px] pr-4">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="
          h-8 w-8 rounded-full
          text-foreground
          focus-visible:ring-2 focus-visible:ring-[#7babd0] focus-visible:ring-offset-2
          hover:!bg-[#7babd0]/20 data-[state=open]:!bg-[#7babd0]/20
        "
      >
        <MoreVertical className="h-4 w-4" />
        <span className="sr-only">Ouvrir le menu</span>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent
      align="end"
      className="w-48 [--accent:#7babd0] [--accent-foreground:#000]"
    >
      <DropdownMenuItem
        onClick={() => openDetails(m.id)}
        className="gap-2 hover:bg-[#7babd0]/20 data-[highlighted]:bg-[#7babd0]/20
                   data-[state=checked]:bg-[#7babd0] data-[state=checked]:text-black
                   data-[state=checked]:font-semibold"
      >
        <Eye className="h-4 w-4" />
        Voir détails
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => openTreat(m)}
        className="gap-2 hover:bg-[#7babd0]/20 data-[highlighted]:bg-[#7babd0]/20
                   data-[state=checked]:bg-[#7babd0] data-[state=checked]:text-black
                   data-[state=checked]:font-semibold"
      >
        <ClipboardList className="h-4 w-4" />
        Marquer / Traiter
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={() => confirmDelete(m)}
        className="gap-2 text-destructive hover:bg-destructive/10 data-[highlighted]:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
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
            <DialogTitle className="text-xl">Détail du message</DialogTitle>
            <DialogDescription>Informations complètes du message reçu.</DialogDescription>
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
                      : details.status === "Lu"
                      ? "bg-amber-500 text-black hover:bg-amber-500"
                      : details.status === "Archivé"
                      ? "bg-gray-400 text-black hover:bg-gray-400"
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
                <div className="font-medium break-all">
                  <a href={`mailto:${details.email}`} className="underline underline-offset-2">{details.email}</a>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground mb-1">Téléphone</div>
                <div className="font-medium">{details.phone || "—"}</div>
              </div>

              <div className="rounded-lg border p-3 md:col-span-2">
                <div className="text-xs text-muted-foreground mb-1">Sujet</div>
                <div className="font-medium">{details.subject || "—"}</div>
              </div>

              <div className="rounded-lg border p-3 md:col-span-2">
                <div className="text-xs text-muted-foreground mb-1">Message</div>
                <div className="font-medium whitespace-pre-wrap">{details.message}</div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground mb-1">Traité par</div>
                <div className="font-medium">{details.processed_by || "—"}</div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground mb-1">Traité le</div>
                <div className="font-medium">{details.processed_at ? new Date(details.processed_at).toLocaleString() : "—"}</div>
              </div>

              <div className="rounded-lg border p-3 md:col-span-2">
                <div className="text-xs text-muted-foreground mb-1">Notes internes</div>
                <div className="font-medium whitespace-pre-wrap">{details.internal_notes || "—"}</div>
              </div>

              <div className="text-xs text-muted-foreground md:col-span-2">
                Reçu le {details.created_at ? new Date(details.created_at).toLocaleString() : "—"}
              </div>
            </div>
          ) : (
            <div className="text-sm text-destructive">Aucune donnée.</div>
          )}

          <DialogFooter className="flex items-center justify-between">
            <Button
              onClick={() => setDetailsOpen(false)}
              className="bg-[#7babd0] hover:bg-[#6ea4c8] text-black border-0 dark:bg-[#7babd0] dark:hover:bg-[#6ea4c8]"
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
                Marquer / Traiter
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog TRAITER */}
      <Dialog open={treatOpen} onOpenChange={setTreatOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mettre à jour le message</DialogTitle>
            <DialogDescription>
              Changez le <strong>statut</strong> et ajoutez des notes internes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm">
              <span className="font-medium">Client :</span> {treatTarget?.name}
            </div>
            <div className="text-sm">
              <span className="font-medium">Sujet :</span> {treatTarget?.subject || "—"}
            </div>

            <div className="space-y-2">
              <Label htmlFor="treat-status">Statut</Label>
              <Select
                value={treatStatus}
                onValueChange={(v) => setTreatStatus(v as ContactMessage["status"])}
              >
                <SelectTrigger id="treat-status" className="bg-white text-black dark:bg-white dark:text-black">
                  <SelectValue placeholder="Choisir un statut" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black dark:bg-white dark:text-black [--accent:#7babd0] [--accent-foreground:#000]">
                  {STATUS_VALUES.map((s) => (
                    <SelectItem
                      key={s}
                      value={s}
                      className="text-black dark:text-black rounded-md hover:bg-[#7babd0]/20 data-[highlighted]:bg-[#7babd0]/20 data-[state=checked]:bg-[#7babd0] data-[state=checked]:text-black data-[state=checked]:font-semibold"
                    >
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="treat-notes">Notes internes</Label>
              <Textarea
                id="treat-notes"
                rows={5}
                value={treatNotes}
                onChange={(e) => setTreatNotes(e.target.value)}
                placeholder="Résumé du traitement, suite à donner…"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              Utilisez «Traité" quand une réponse a été envoyée et clos le ticket.
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTreatOpen(false)}
              disabled={treatBusy}
              className="bg-[#7babd0] hover:bg-[#6ea4c8] text-black border-0 dark:bg-[#7babd0] dark:hover:bg-[#6ea4c8]"
            >
              Annuler
            </Button>
            <Button onClick={saveTreatment} disabled={treatBusy} className="bg-[#7babd0] text-black">
              {treatBusy ? "Enregistrement…" : "Enregistrer"}
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
        Cette action est <strong>irréversible</strong>. Supprimer définitivement ce message ?
      </AlertDialogDescription>
    </AlertDialogHeader>

    <div className="rounded-lg border p-3 text-sm bg-muted/30">
      {deleteTarget ? (
        <>
          <div><span className="font-medium">Expéditeur :</span> {deleteTarget.name}</div>
          <div><span className="font-medium">Email :</span> {deleteTarget.email}</div>
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

export default ContactMessages;
