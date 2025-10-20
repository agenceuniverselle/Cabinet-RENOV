// src/pages/EditFormationModal.tsx
import * as React from "react";
import { z } from "zod";
import {
  useForm,
  useFieldArray,
  type FieldArrayPath,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { Plus, Minus, Check } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// ✅ mêmes icônes que l’Add
import { iconOptions, iconKeyToComp, ICONS } from "@/icons";

/* ------------------- API helpers ------------------- */
// Tolère VITE_API_URL avec ou sans /api
function resolveApiBase() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = (import.meta as any).env?.VITE_API_URL ?? "http://127.0.0.1:8000/api";
  const base = String(raw).replace(/\/+$/, "");
  return /\/api$/.test(base) ? base : `${base}/api`;
}
const API_URL = resolveApiBase();

// fetch avec token + gestion 401
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
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/* ------------------- Schéma & types ------------------- */
// même approche dynamique que l’Add
const iconKeys = Object.keys(ICONS) as (keyof typeof ICONS)[];
const FormationSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(3),
  category: z.string().min(2),
  certification: z.enum(["Certifiante", "Non certifiante"]),
  participants: z
    .string()
    .regex(/^\s*\d+\s*-\s*\d+\s*$/)
    .transform((s) => s.replace(/\s+/g, "")),
  description: z.string().min(20),
  objectives: z.array(z.string().min(5)).min(1),
  iconKey: z
    .string()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .refine((v) => iconKeys.includes(v as any), "Icône invalide"),
  language: z.enum(["Français", "Arabe", "Anglais"]),
  popular: z.boolean(),
});
export type FormationFormInput = z.infer<typeof FormationSchema>;

/* ------------------- Props ------------------- */
type EditFormationModalProps = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  formation: FormationFormInput; // contient id
  onSaved: (saved: FormationFormInput) => void; // version DB après PUT
};

/* ------------------- composant ------------------- */
export default function EditFormationModal({
  open,
  onOpenChange,
  formation,
  onSaved,
}: EditFormationModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = React.useState<0 | 1>(0);

  const form = useForm<FormationFormInput>({
    resolver: zodResolver(FormationSchema),
    defaultValues: formation,
    mode: "onBlur",
  });

  // si la formation change (nouvelle édition), recharger les valeurs
  React.useEffect(() => {
    form.reset(formation);
    setStep(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formation]);

  // objectifs array
  const { fields, append, remove } = useFieldArray<FormationFormInput>({
    control: form.control,
    name: "objectives" as FieldArrayPath<FormationFormInput>,
  });

  const PreviewIcon = iconKeyToComp(form.watch("iconKey") as keyof typeof ICONS);
  const objectivesError =
    (form.formState.errors.objectives as { message?: string } | undefined)
      ?.message;

  const step1Fields = [
    "title",
    "category",
    "certification",
    "language",
    "iconKey",
  ] as const;

  const goNext = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ok = await form.trigger(step1Fields as any, { shouldFocus: true });
    if (ok) setStep(1);
  };
  const goPrev = () => setStep(0);
  const handleCancel = () => {
    form.reset(formation);
    setStep(0);
    onOpenChange(false);
  };

  // mapping camelCase -> snake_case pour l'API
  const toApiPayload = (v: FormationFormInput) => ({
    title: v.title,
    category: v.category,
    certification: v.certification,
    participants: v.participants,
    description: v.description,
    objectives: v.objectives,
    icon_key: v.iconKey, // clé attendue côté Laravel
    iconKey: v.iconKey,  // tolérance si le back lit camelCase
    language: v.language,
    popular: v.popular ? 1 : 0,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fromApi = (r: any): FormationFormInput => ({
    id: Number(r.id),
    title: String(r.title ?? ""),
    category: String(r.category ?? ""),
    certification: r.certification,
    participants: String(r.participants ?? "8-15"),
    description: String(r.description ?? ""),
    objectives: Array.isArray(r.objectives) ? r.objectives : [],
    iconKey: r.icon_key ?? r.iconKey,
    language: r.language,
    popular: !!r.popular,
  });

  // Empêche les submits implicites
  const submitIntent = React.useRef(false);

  const handleSubmit = async (values: FormationFormInput) => {
    if (!submitIntent.current) return;

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        toast.error("Session expirée. Merci de vous reconnecter.");
        navigate("/dashboard/login", {
          replace: true,
          state: { from: { pathname: "/dashboard/index" } },
        });
        return;
      }

      // PUT sécurisé (requestJson gère Authorization + 401)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await requestJson<any>(`/formations/${values.id}`, {
        method: "PUT",
        body: JSON.stringify(toApiPayload(values)),
      });

      const payload = data?.data ?? data;
      const saved = fromApi(payload);

      toast.success("Formation mise à jour");
      onSaved(saved);
      setStep(0);
      onOpenChange(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Échec de la mise à jour";
      toast.error(msg);

      if (String(msg).toLowerCase().includes("session expirée")) {
        navigate("/dashboard/login", {
          replace: true,
          state: { from: { pathname: "/dashboard/index" } },
        });
      }
    } finally {
      submitIntent.current = false;
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setStep(0);
      }}
    >
      <DialogContent className="sm:max-w-3xl w-[95vw] p-0">
        <DialogHeader className="px-6 pt-4 pb-3 border-b sticky top-0 bg-background z-10">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#235F8F] text-white">
                <PreviewIcon className="h-5 w-5" />
              </span>
              Modifier une formation
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span
                className={`inline-flex items-center justify-center h-6 w-6 rounded-full border ${
                  step === 0
                    ? "bg-[#235F8F] text-white border-[#235F8F]"
                    : "bg-muted text-foreground/70 border-muted-foreground/20"
                }`}
              >
                1
              </span>
              <span className="text-muted-foreground hidden sm:inline">
                Infos générales
              </span>
              <span className="opacity-40">—</span>
              <span
                className={`inline-flex items-center justify-center h-6 w-6 rounded-full border ${
                  step === 1
                    ? "bg-[#235F8F] text-white border-[#235F8F]"
                    : "bg-muted text-foreground/70 border-muted-foreground/20"
                }`}
              >
                2
              </span>
              <span className="text-muted-foreground hidden sm:inline">
                Contenu & objectifs
              </span>
            </div>
          </DialogTitle>
          <DialogDescription>
            {step === 0
              ? "Mettez à jour les informations générales."
              : "Mettez à jour la description et les objectifs pédagogiques."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !(e.shiftKey || e.ctrlKey || e.metaKey) &&
                (e.target as HTMLElement).tagName !== "TEXTAREA"
              ) {
                e.preventDefault();
              }
            }}
            className="flex flex-col max-h-[80vh]"
          >
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {step === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Titre</FormLabel>
                        <FormControl>
                          <Input placeholder="Titre" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <FormControl>
                          <Input placeholder="Catégorie" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="certification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Certification</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choisir..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Certifiante">Certifiante</SelectItem>
                            <SelectItem value="Non certifiante">Non certifiante</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Langue</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Français">Français</SelectItem>
                            <SelectItem value="Arabe">Arabe</SelectItem>
                            <SelectItem value="Anglais">Anglais</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="iconKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icône</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une icône" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {iconOptions.map((opt) => (
                              <SelectItem key={opt.key} value={opt.key}>
                                <div className="flex items-center gap-2">
                                  <opt.Comp className="h-4 w-4" />
                                  <span>{opt.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea rows={6} placeholder="Description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <Label className="mb-2 block">Objectifs</Label>
                    <div className="space-y-2">
                      {fields.map((f, idx) => (
                        <div key={f.id} className="flex gap-2">
                          <Input
                            {...form.register(`objectives.${idx}` as const)}
                            placeholder={`Objectif ${idx + 1}`}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => remove(idx)}
                            className="px-3"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => append("")}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" /> Ajouter un objectif
                        </Button>
                      </div>
                    </div>
                    {typeof objectivesError === "string" && (
                      <p className="mt-2 text-sm font-medium text-destructive">
                        {objectivesError}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="px-6 py-4 border-t">
              <div className="flex w-full items-center justify-between gap-2">
               <div className="flex items-center gap-2">
  {/* Bouton Annuler */}
  <Button
    type="button"
    variant="ghost"
    onClick={handleCancel}
    className="
      bg-transparent 
      text-foreground 
      hover:bg-[#7babd0]/20 
      hover:text-foreground 
      dark:hover:bg-[#7babd0]/30
    "
  >
    Annuler
  </Button>

  {/* Bouton Retour (affiché uniquement au step 1) */}
  {step === 1 && (
    <Button
      type="button"
      variant="outline"
      onClick={goPrev}
      className="
        border border-gray-300 
        text-foreground 
        hover:bg-[#7babd0]/20 
        hover:text-foreground 
        dark:border-gray-600 
        dark:hover:bg-[#7babd0]/30
      "
    >
      Retour
    </Button>
  )}
</div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    Étape {step + 1} / 2
                  </span>
                  {step === 0 ? (
                    <Button
                      type="button"
                      className="bg-[#235F8F] hover:opacity-90 text-white"
                      onClick={goNext}
                    >
                      Suivant
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="bg-[#235F8F] hover:opacity-90 text-white gap-2"
                      disabled={form.formState.isSubmitting}
                      onClick={() => {
                        // intention explicite → évite les submits implicites
                        submitIntent.current = true;
                      }}
                    >
                      <Check className="h-4 w-4" /> Enregistrer
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
