/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Courses.tsx
import * as React from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";

// ✅ source unique des icônes
import { ICONS, iconKeyToComp } from "@/icons";

import {
  AddFormationModal,
  type FormationFormInput,
} from "@/pages/AddFormationModal";
import EditFormationModal from "./EditFormationModal";

/* -------------------------------- API BASE -------------------------------- */
function resolveApiBase() {
  // Si VITE_API_URL contient déjà /api, on ne le rajoute pas
  const raw =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (import.meta as any).env?.VITE_API_URL ?? "http://127.0.0.1:8000/api";
  const base = String(raw).replace(/\/+$/, "");
  return /\/api$/.test(base) ? base : `${base}/api`;
}
const API_URL = resolveApiBase();

/* ----------------------------- Types & helpers ----------------------------- */
type ApiFormation = {
  id: number;
  title: string;
  category: string;
  certification: "Certifiante" | "Non certifiante";
  participants: string;
  description: string;
  objectives: string[];
  iconKey: keyof typeof ICONS;
  language: "Français" | "Arabe" | "Anglais";
  popular: boolean;
  created_at?: string;
  updated_at?: string;
};

type CourseCard = ApiFormation & {
  instructor?: string;
  students?: number;
  price?: number;
  status?: string;
  image?: string;
};

// 🔧 Parse éventuel JSON string → array
function toObjectives(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter((x) => typeof x === "string") as string[];
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === "string") as string[];
    } catch { /* ignore */ }
  }
  return [];
}

// 🔧 Normalisation robuste de la clé d'icône
function normalizeIconKey(raw: unknown): keyof typeof ICONS {
  if (!raw) return "BarChart3";
  const s = String(raw).trim();

  // correspondance directe (ex: "BarChart3", "Users")
  if (s in ICONS) return s as keyof typeof ICONS;

  // canoniser : minuscules + retirer séparateurs
  const k = s.toLowerCase().replace(/[\s_-]+/g, "");

  const map: Record<string, keyof typeof ICONS> = {
    barchart3: "BarChart3",
    graduationcap: "GraduationCap",
    users: "Users",
    trendingup: "TrendingUp",
  };

  return map[k] ?? "BarChart3";
}

// Fetch helper avec token
async function requestJson<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

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
    } catch { /* empty */ }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/* ---------------------- Normalisation d’un record API ---------------------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeFormation(rec: any): ApiFormation {
  return {
    id: Number(rec.id),
    title: String(rec.title ?? ""),
    category: String(rec.category ?? ""),
    certification: rec.certification as ApiFormation["certification"],
    participants: String(rec.participants ?? ""),
    description: String(rec.description ?? ""),
    objectives: toObjectives(rec.objectives),
    iconKey: normalizeIconKey(rec.iconKey ?? rec.icon_key), // ✅ clé icône normalisée
    language: (rec.language ?? "Français") as ApiFormation["language"],
    popular: !!rec.popular,
    created_at: rec.created_at,
    updated_at: rec.updated_at,
  };
}

/* --------------------------------- API CRUD -------------------------------- */
async function apiList(): Promise<ApiFormation[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body = await requestJson<any>("/formations");
  const raw = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
  return raw.map(normalizeFormation);
}

async function apiCreate(payload: FormationFormInput): Promise<ApiFormation> {
  const toApi = { ...payload, icon_key: payload.iconKey };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (toApi as any).iconKey;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const created = await requestJson<any>("/formations", {
    method: "POST",
    body: JSON.stringify(toApi),
  });
  return normalizeFormation(created?.data ?? created);
}

async function apiUpdate(id: number, partial: Partial<ApiFormation>): Promise<ApiFormation> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toApi: any = { ...partial };
  if (partial.iconKey) {
    toApi.icon_key = partial.iconKey;
    delete toApi.iconKey;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await requestJson<any>(`/formations/${id}`, {
    method: "PUT",
    body: JSON.stringify(toApi),
  });
  return normalizeFormation(updated?.data ?? updated);
}

async function apiDelete(id: number): Promise<void> {
  await requestJson(`/formations/${id}`, { method: "DELETE" });
}

const ALL = "__all__";

/* ------------------------------- Page Courses ------------------------------ */
const Courses: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState<CourseCard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<null | { id: number } & FormationFormInput>(null);

  const [confirmDelete, setConfirmDelete] = React.useState<{
    open: boolean;
    course?: CourseCard;
    busy?: boolean;
  }>({ open: false });

  // Charger depuis API
  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await apiList();
        const cards: CourseCard[] = list.map((f) => ({ ...f, status: "Actif" }));
        setItems(cards);
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "Impossible de charger les formations");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filtres
  const [filters, setFilters] = React.useState<{ category: string; language: string; objective: string }>({
    category: "",
    language: "",
    objective: "",
  });

  const categories = React.useMemo(
    () => Array.from(new Set(items.map((i) => i.category).filter(Boolean))),
    [items]
  ) as string[];

  const languages = React.useMemo(
    () => Array.from(new Set(items.map((i) => i.language).filter(Boolean))),
    [items]
  ) as string[];

  const objectives = React.useMemo(() => {
    const all = items.flatMap((i) => i.objectives ?? []);
    return Array.from(new Set(all)).filter(Boolean);
  }, [items]) as string[];

  const resetFilters = () => setFilters({ category: "", language: "", objective: "" });

  // Création (optimiste + normalisation)
  const handleCreate = async (created: FormationFormInput) => {
    const normalized: CourseCard = {
      ...(created as any),
      iconKey: normalizeIconKey((created as any).iconKey ?? (created as any).icon_key),
      status: "Actif",
    };
    setItems((prev) => [normalized, ...prev]);
    toast.success("Formation créée");
  };

  // Édition minimaliste (titre)
  const handleEdit = async (c: CourseCard) => {
    const newTitle = window.prompt("Nouveau titre :", c.title);
    if (newTitle === null) return;
    try {
      const updated = await apiUpdate(c.id, { title: newTitle || c.title });
      setItems((prev) => prev.map((x) => (x.id === c.id ? { ...x, ...updated } : x)));
      toast.success("Formation mise à jour");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Mise à jour impossible");
    }
  };

  // Duplication
  const handleDuplicate = async (course: CourseCard) => {
    const payload: FormationFormInput = {
      title: `${course.title} (copie)`,
      category: course.category,
      certification: course.certification,
      participants: course.participants,
      description: course.description,
      objectives: course.objectives ?? [],
      iconKey: normalizeIconKey(course.iconKey), // ✅
      language: course.language,
      popular: course.popular,
    };
    try {
      const created = await apiCreate(payload);
      setItems((prev) => [{ ...created, status: "Actif" }, ...prev]);
      toast.success("Formation dupliquée");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Duplication impossible");
    }
  };

  // Suppression (optimiste + rollback)
  const deleteForReal = async (course: CourseCard) => {
    const previous = items;
    setItems((prev) => prev.filter((c) => c.id !== course.id));
    try {
      await apiDelete(course.id);
      toast.success("Formation supprimée");
    } catch (e: unknown) {
      setItems(previous);
      toast.error(e instanceof Error ? e.message : "Suppression impossible");
    }
  };

  // Filtre combiné
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((c) => {
      const matchesQuery = !q ? true : `${c.title ?? ""} ${c.category ?? ""}`.toLowerCase().includes(q);
      const matchesCategory = !filters.category || c.category === filters.category;
      const matchesLanguage = !filters.language || c.language === filters.language;
      const matchesObjective = !filters.objective || (c.objectives?.some((o) => o === filters.objective) ?? false);
      return matchesQuery && matchesCategory && matchesLanguage && matchesObjective;
    });
  }, [items, query, filters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestion des Cours</h1>
          <p className="text-muted-foreground">Gérez vos cours et leur contenu</p>
        </div>
        <Button className="gap-2 bg-[#7babd0] hover:opacity-90 text-black" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Nouveau cours
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un cours..."
            className="pl-10 bg-muted/50 border-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filtres inline */}
      <div className="rounded-xl border bg-background p-3">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_1.2fr_auto] items-end">
          {/* Catégorie */}
          <div className="min-w-[180px]">
            <label className="text-sm font-medium">Catégorie</label>
            <div className="mt-1">
              <Select
                value={filters.category || ALL}
                onValueChange={(v) => setFilters((f) => ({ ...f, category: v === ALL ? "" : v }))}
              >
                <SelectTrigger className="bg-white text-black dark:bg:white dark:text-black">
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black dark:bg-white dark:text-black [--accent:#7babd0] [--accent-foreground:#000]">
                  <SelectItem
                    value={ALL}
                    className="text-black dark:text-black rounded-md hover:bg-[#7babd0]/20 data-[highlighted]:bg-[#7babd0]/20 data-[state=checked]:bg-[#7babd0] data-[state=checked]:text-black data-[state=checked]:font-semibold"
                  >
                    Toutes
                  </SelectItem>
                  {categories.map((c) => (
                    <SelectItem
                      key={c}
                      value={c}
                      className="text-black dark:text-black rounded-md hover:bg-[#7babd0]/20 data-[highlighted]:bg-[#7babd0]/20 data-[state=checked]:bg-[#7babd0] data-[state=checked]:text-black data-[state=checked]:font-semibold"
                    >
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Langue */}
          <div className="min-w-[160px]">
            <label className="text-sm font-medium">Langue</label>
            <div className="mt-1">
              <Select
                value={filters.language || ALL}
                onValueChange={(v) => setFilters((f) => ({ ...f, language: v === ALL ? "" : v }))}
              >
                <SelectTrigger className="bg-white text-black dark:bg-white dark:text-black">
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black dark:bg-white dark:text-black [--accent:#7babd0] [--accent-foreground:#000]">
                  <SelectItem
                    value={ALL}
                    className="text-black dark:text-black rounded-md hover:bg-[#7babd0]/20 data-[highlighted]:bg-[#7babd0]/20 data-[state=checked]:bg-[#7babd0] data-[state=checked]:text-black data-[state=checked]:font-semibold"
                  >
                    Toutes
                  </SelectItem>
                  {languages.map((l) => (
                    <SelectItem
                      key={l}
                      value={l}
                      className="text-black dark:text-black rounded-md hover:bg-[#7babd0]/20 data-[highlighted]:bg-[#7babd0]/20 data-[state=checked]:bg-[#7babd0] data-[state=checked]:text-black data-[state=checked]:font-semibold"
                    >
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Objectif */}
          <div className="min-w-[220px]">
            <label className="text-sm font-medium">Objectif</label>
            <div className="mt-1">
              <Select
                value={filters.objective || ALL}
                onValueChange={(v) => setFilters((f) => ({ ...f, objective: v === ALL ? "" : v }))}
              >
                <SelectTrigger className="bg-white text-black dark:bg-white dark:text-black">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black dark:bg-white dark:text-black [--accent:#7babd0] [--accent-foreground:#000]">
                  <SelectItem
                    value={ALL}
                    className="text-black dark:text-black rounded-md hover:bg-[#7babd0]/20 data-[highlighted]:bg-[#7babd0]/20 data-[state=checked]:bg-[#7babd0] data-[state=checked]:text-black data-[state=checked]:font-semibold"
                  >
                    Tous
                  </SelectItem>
                  {objectives.map((o) => (
                    <SelectItem
                      key={o}
                      value={o}
                      className="text-black dark:text-black rounded-md hover:bg-[#7babd0]/20 data-[highlighted]:bg-[#7babd0]/20 data-[state=checked]:bg-[#7babd0] data-[state=checked]:text-black data-[state=checked]:font-semibold"
                    >
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={resetFilters}>
          Réinitialiser
        </Button>
      </div>

      {/* Loading */}
      {loading && <Card className="p-6 text-sm text-muted-foreground">Chargement des formations…</Card>}

      {/* Empty state */}
      {!loading && filtered.length === 0 ? (
        <Card className="p-8 flex flex-col items-center justify-center text-center border-dashed">
          <div className="mb-3 text-xl font-medium">Aucune formation</div>
          <p className="text-muted-foreground mb-6">
            Ajoutez votre première formation pour la voir apparaître ici.
          </p>
          <Button className="gap-2 bg-[#7babd0] hover:opacity-90 text-black" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Nouvelle formation
          </Button>
        </Card>
      ) : null}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => {
            // ✅ Icone calculée au moment du rendu
            const Icon = iconKeyToComp(normalizeIconKey(course.iconKey));
            const showBanner = !course.image;
            const isPopular = !!course.popular;

            return (
              <Card
                key={course.id}
                className={[
                  "overflow-hidden transition-all duration-200 animate-fade-in border",
                  isPopular ? "border-[#235F8F]/50 shadow-md" : "border-0 bg-gradient-card",
                ].join(" ")}
              >
                {/* Bandeau */}
                {showBanner ? (
                  <div className="relative w-full h-40 bg-[#eaf3fb] flex items-center justify-center">
                    <div className="flex items-center gap-3">
                      <span className="h-12 w-12 rounded-xl bg-[#235F8F] text-white inline-flex items-center justify-center">
                        <Icon className="h-6 w-6" />
                      </span>
                      <div className="text-sm text-muted-foreground">
                        {course.category || "Formation"}
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2">
                      {course.language && (
                        <Badge
                          variant="outline"
                          className="bg-white text-black border-gray-300 dark:bg-white dark:text-black dark:border-gray-400"
                        >
                          {course.language}
                        </Badge>
                      )}
                      {course.certification === "Certifiante" && (
                        <Badge className="bg-[#235F8F] text-white">Certifiante</Badge>
                      )}
                      {isPopular && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3" /> Populaire
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      {course.language && (
                        <Badge
                          variant="outline"
                          className="bg-white text-black border-gray-300 dark:bg-white dark:text-black dark:border-gray-400"
                        >
                          {course.language}
                        </Badge>
                      )}

                      {course.certification === "Certifiante" && (
                        <Badge className="bg-[#235F8F] text-white">Certifiante</Badge>
                      )}

                      {isPopular && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3" /> Populaire
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Corps */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {course.category && <span>{course.category}</span>}
                      </div>
                    </div>

                    {/* Menu actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="
                            h-8 w-8
                            text-foreground
                            focus-visible:ring-2 focus-visible:ring-[#7babd0] focus-visible:ring-offset-2
                            hover:!bg-[#7babd0]/20
                            data-[state=open]:!bg-[#7babd0]/20
                            hover:!text-foreground
                          "
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        align="end"
                        className="
                          [--accent:#7babd0] [--accent-foreground:#000]
                          focus-visible:ring-[#7babd0] focus-visible:ring-offset-2
                        "
                      >
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing({
                              id: course.id,
                              title: course.title ?? "",
                              category: course.category ?? "",
                              certification: course.certification ?? "Certifiante",
                              participants: course.participants ?? "8-15",
                              description: course.description ?? "",
                              objectives: course.objectives ?? ["Objectif 1"],
                              iconKey: (course.iconKey as any) ?? "BarChart3",
                              language: course.language ?? "Français",
                              popular: !!course.popular,
                            });
                          }}
                          className="
                            hover:bg-[#7babd0]/20
                            data-[highlighted]:bg-[#7babd0]/20
                          "
                        >
                          Modifier
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleDuplicate(course)}
                          className="
                            hover:bg-[#7babd0]/10
                          "
                        >
                          Dupliquer
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-destructive hover:bg-red-100 focus-visible:ring-0"
                          onClick={() => setConfirmDelete({ open: true, course, busy: false })}
                        >
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {course.description && (
                    <p className="text-sm text-muted-foreground mb-3 overflow-hidden max-h-12">
                      {course.description}
                    </p>
                  )}

                  {course.objectives && course.objectives.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {course.objectives.slice(0, 3).map((o, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {o}
                        </Badge>
                      ))}
                      {course.objectives.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{course.objectives.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-muted-foreground">
                      {course.participants ? `${course.participants} participants` : "—"}
                    </span>
                    <Badge
                      variant="secondary"
                      className="
                        bg-[#7babd0]/20 text-[#235F8F]
                        dark:bg-[#7babd0]/25 dark:text-[#b4dcf3]
                        border border-[#7babd0]/30
                        font-medium
                      "
                    >
                      {course.status ?? "Actif"}
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de création */}
      <AddFormationModal open={open} onOpenChange={setOpen} onSubmit={handleCreate} />

      {editing && (
        <EditFormationModal
          open={!!editing}
          onOpenChange={(o) => {
            if (!o) setEditing(null);
          }}
          formation={{
            ...editing,
            // typing friendly
            iconKey: (editing.iconKey ?? "BarChart3") as
              | "BarChart3"
              | "GraduationCap"
              | "Users"
              | "TrendingUp",
          }}
          onSaved={(saved) => {
            setItems((prev) =>
              prev.map((c) =>
                c.id === saved.id
                  ? {
                      ...c,
                      title: saved.title,
                      category: saved.category,
                      certification: saved.certification,
                      participants: saved.participants,
                      description: saved.description,
                      objectives: saved.objectives,
                      iconKey: normalizeIconKey((saved as any).iconKey ?? (saved as any).icon_key), // ✅
                      language: saved.language,
                      popular: !!saved.popular,
                    }
                  : c
              )
            );
            setEditing(null);
          }}
        />
      )}

      {/* Dialog de confirmation de suppression */}
      <AlertDialog
        open={confirmDelete.open}
        onOpenChange={(o) => setConfirmDelete((prev) => ({ ...prev, open: o }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete.course
                ? `Voulez-vous vraiment supprimer « ${confirmDelete.course.title} » ? Cette action est irréversible.`
                : "Voulez-vous vraiment supprimer cet élément ?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setConfirmDelete({ open: false })}
              disabled={!!confirmDelete.busy}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:opacity-90"
              onClick={async () => {
                if (!confirmDelete.course) return;
                try {
                  setConfirmDelete((p) => ({ ...p, busy: true }));
                  await deleteForReal(confirmDelete.course);
                  setConfirmDelete({ open: false });
                } catch {
                  setConfirmDelete({ open: false });
                }
              }}
              disabled={!!confirmDelete.busy}
            >
              {confirmDelete.busy ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Courses;
