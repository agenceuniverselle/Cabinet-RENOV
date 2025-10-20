// src/pages/Categories.tsx
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ------------ utils API centralisés ------------
// 👉 Garde 127.0.0.1 si tu utilises un proxy Vite; sinon mets l’IP de l’API
export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

// ✅ Pas de cookies par défaut (évite le CORS strict)
export async function apiFetch(
  input: string,
  init: RequestInit = {},
  opts?: { withCredentials?: boolean }
) {
  const token = localStorage.getItem("token");
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const withCreds = opts?.withCredentials === true;

  return fetch(`${API_URL}${input.startsWith("/") ? "" : "/"}${input}`, {
    ...init,
    headers,
    credentials: withCreds ? "include" : "omit",
  });
}
// -----------------------------------------------

type Category = {
  id: number;
  name: string;
  slug: string;
  icon_key?: string | null;
  description?: string | null;
  parent_id?: number | null;
  sort_order: number;
  is_active: boolean;
};

export default function CategoriesPage() {
  const { toast } = useToast();

  const [mode, setMode] = useState<"category" | "subcategory">("category");
  const [list, setList] = useState<Category[]>([]);
  const [parents, setParents] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Édition
  const [editingId, setEditingId] = useState<number | null>(null);

  // Suppression (dialog)
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState<{
    name: string;
    parent_id: number | null;
    icon_key: string;
    sort_order: number;
    description: string;
  }>({
    name: "",
    parent_id: null,
    icon_key: "",
    sort_order: 0,
    description: "",
  });

  const parentValue = form.parent_id === null ? "__none" : String(form.parent_id);

  // 🔹 Charger toutes les catégories
  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/public/categories?per_page=500");
      const ct = res.headers.get("content-type") || "";

      if (!ct.includes("application/json")) {
        const text = await res.text();
        console.error("Réponse non-JSON:", res.status, text.slice(0, 400));
        toast({
          title: "Erreur API",
          description:
            "La réponse de /public/categories n’est pas au format JSON. Vérifie la route publique / l’auth.",
          variant: "destructive",
        });
        return;
      }

      const json = await res.json();
      const items: Category[] = json.data ?? json;
      setList(items);
    } catch (e) {
      console.error(e);
      toast({
        title: "Chargement impossible",
        description: "Erreur lors du chargement des catégories.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Charger les catégories racines
  const fetchParents = async () => {
    try {
      const res = await apiFetch("/public/categories/roots");
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) return;
      const json = await res.json();
      setParents(json as Category[]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAll();
    fetchParents();
  }, []);

  // 🔹 Construction de l’arborescence (tri stable côté front)
  const tree = useMemo(() => {
    const byParent: Record<string, Category[]> = {};
    list.forEach((c) => {
      const key = String(c.parent_id ?? "root");
      (byParent[key] ||= []).push(c);
    });
    Object.values(byParent).forEach((arr) =>
      arr.sort((a, b) => a.name.localeCompare(b.name))
    );
    return byParent;
  }, [list]);

  // 🔹 Réinitialiser le formulaire
  const resetForm = () =>
    setForm({ name: "", parent_id: null, icon_key: "", sort_order: 0, description: "" });

  // 🔹 Démarrer l’édition
  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name ?? "",
      parent_id: cat.parent_id ?? null,
      icon_key: cat.icon_key ?? "",
      sort_order: cat.sort_order ?? 0,
      description: cat.description ?? "",
    });
    setMode(cat.parent_id ? "subcategory" : "category");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🔹 Annuler l’édition
  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
    setMode("category");
  };

  // 🔹 Soumission du formulaire (create/update)
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "subcategory" && form.parent_id === null) {
      toast({
        title: "Parent requis",
        description: "Veuillez choisir la catégorie parente.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name: form.name,
      icon_key: form.icon_key || null,
      description: form.description || null,
      sort_order: form.sort_order ?? 0,
      parent_id: mode === "subcategory" ? form.parent_id : null,
    };

    try {
      const isEdit = editingId !== null;
      const url = isEdit ? `/categories/${editingId}` : "/categories";
      const method = isEdit ? "PUT" : "POST";

      const res = await apiFetch(
        url,
        {
          method,
          body: JSON.stringify(payload),
        },
        { withCredentials: false }
      );

      if (!res.ok) {
        const ct = res.headers.get("content-type") || "";
        let msg = `Erreur ${res.status}`;
        if (ct.includes("application/json")) {
          const err = await res.json().catch(() => ({}));
          msg =
            (err.message as string) ||
            (err.errors ? JSON.stringify(err.errors) : "") ||
            JSON.stringify(err) ||
            msg;
        } else {
          const text = await res.text();
          msg = text || msg;
        }
        toast({
          title: "Échec de l’enregistrement",
          description: msg,
          variant: "destructive",
        });
        return;
      }

      await fetchAll();
      await fetchParents();
      if (isEdit) {
        toast({ title: "Catégorie mise à jour", description: `“${form.name}” a été modifiée.` });
        cancelEdit();
      } else {
        toast({ title: "Catégorie créée", description: `“${form.name}” a été ajoutée.` });
        resetForm();
        setMode("category");
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Erreur réseau/API",
        description: "Operation impossible. Vérifie la connexion et les logs API.",
        variant: "destructive",
      });
    }
  };

  // 🔹 Ouvrir le dialog de suppression
  const requestDelete = (cat: Category) => setToDelete(cat);

  // 🔹 Confirmer la suppression
  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const res = await apiFetch(`/categories/${toDelete.id}`, { method: "DELETE" });

      if (!res.ok) {
        const ct = res.headers.get("content-type") || "";
        let msg = `Erreur ${res.status}`;
        if (ct.includes("application/json")) {
          const err = await res.json().catch(() => ({}));
          msg =
            (err.message as string) ||
            (err.errors ? JSON.stringify(err.errors) : "") ||
            JSON.stringify(err) ||
            msg;
        } else {
          const text = await res.text();
          msg = text || msg;
        }
        toast({
          title: "Suppression refusée",
          description: msg,
          variant: "destructive",
        });
        return;
      }

      if (editingId === toDelete.id) cancelEdit();
      await fetchAll();
      await fetchParents();
      toast({ title: "Catégorie supprimée", description: `“${toDelete.name}” a été supprimée.` });
      setToDelete(null);
    } catch (e) {
      console.error(e);
      toast({
        title: "Erreur réseau/API",
        description: "Suppression impossible pour le moment.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {editingId
              ? `Modifier une ${mode === "category" ? "catégorie" : "sous-catégorie"}`
              : `Ajouter une ${mode === "category" ? "catégorie" : "sous-catégorie"}`}
          </CardTitle>
          {editingId && (
            <Button type="button" variant="ghost" onClick={cancelEdit} className="gap-2">
              <X className="h-4 w-4" />
              Annuler
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {/* Choix du mode */}
          <div className="mb-4 flex gap-2">
            <Button
              type="button"
              variant={mode === "category" ? "default" : "secondary"}
              onClick={() => {
                setMode("category");
                setForm((f) => ({ ...f, parent_id: null }));
              }}
              disabled={!!editingId}
              title={editingId ? "Désactivé en mode édition" : ""}
            >
              {editingId ? "Catégorie (édition)" : "Créer une catégorie"}
            </Button>
            <Button
              type="button"
              variant={mode === "subcategory" ? "default" : "secondary"}
              onClick={() => setMode("subcategory")}
              disabled={!!editingId && form.parent_id === null}
              title={editingId && form.parent_id === null ? "Cet enregistrement est une catégorie" : ""}
            >
              {editingId ? "Sous-catégorie (édition)" : "Créer une sous-catégorie"}
            </Button>
          </div>

          {/* Formulaire */}
          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm">Nom *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            {mode === "subcategory" && (
              <div>
                <label className="text-sm">Catégorie parente *</label>
                <Select
                  value={parentValue}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, parent_id: v === "__none" ? null : Number(v) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie parente" />
                  </SelectTrigger>
                  <SelectContent>
                    {parents.length === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Aucune catégorie parente trouvée
                      </div>
                    )}
                    {parents.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm">Icône (clé front)</label>
              <Input
                placeholder="Briefcase, Building2, Lightbulb…"
                value={form.icon_key}
                onChange={(e) => setForm((f) => ({ ...f, icon_key: e.target.value }))}
              />
            </div>

            {/* Optionnel: garde sort_order si utile côté back
            <div>
              <label className="text-sm">Ordre</label>
              <Input
                type="number"
                min={0}
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
              />
            </div> */}

            <div className="md:col-span-2">
              <label className="text-sm">Description</label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2 flex gap-2">
              <Button
                type="submit"
                disabled={
                  loading ||
                  (mode === "subcategory" && (form.parent_id === null || parents.length === 0))
                }
              >
                {editingId ? "Mettre à jour" : "Enregistrer"}
              </Button>

              {editingId && (
                <Button type="button" variant="secondary" onClick={cancelEdit}>
                  Annuler
                </Button>
              )}

              {mode === "subcategory" && parents.length === 0 && !editingId && (
                <span className="text-sm text-muted-foreground self-center">
                  Crée d’abord au moins une catégorie racine.
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Catégories (arborescence)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Chargement…</div>
          ) : (
            <div className="space-y-2">
              {(tree["root"] ?? []).map((root) => (
                <div key={root.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">
                      {root.name}{" "}
                      <span className="text-xs text-muted-foreground">({root.slug})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => startEdit(root)}
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => requestDelete(root)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="pl-4 mt-2 space-y-1">
                    {(tree[String(root.id)] ?? []).map((ch) => (
                      <div key={ch.id} className="text-sm flex items-center justify-between">
                        <span>— {ch.name}</span>
                        <span className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => startEdit(ch)}
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => requestDelete(ch)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </span>
                      </div>
                    ))}
                    {(tree[String(root.id)] ?? []).length === 0 && (
                      <div className="text-sm text-muted-foreground">Aucune sous-catégorie</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmation suppression */}
      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete
                ? toDelete.parent_id
                  ? `Supprimer la sous-catégorie “${toDelete.name}” ?`
                  : `Supprimer la catégorie “${toDelete.name}” ? Assure-toi qu'elle n'a pas d'enfants.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
