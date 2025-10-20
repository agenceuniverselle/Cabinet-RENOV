// src/components/AddFormationModal.tsx
import * as React from "react";
import { z } from "zod";
import {
  useForm,
  useFieldArray,
  type FieldArrayPath,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";import {
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
} from "@/components/ui/form";// ✅ centralisation des icônes
import { iconOptions, iconKeyToComp, ICONS } from "@/icons";// ---------- API ----------
const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";
type LaravelValidationPayload = {
  message?: unknown;
  errors?: Record<string, unknown>;
};function extractApiErrorMessage(raw: unknown): string {
  const data = (raw ?? {}) as {
    message?: unknown;
    errors?: Record<string, unknown>;
  };  if (typeof data.message === "string" && data.message.trim().length > 0) {
    return data.message;
  }  if (data.errors && typeof data.errors === "object") {
    const values = Object.values(data.errors);
    for (const v of values) {
      if (Array.isArray(v)) {
        const first = v.find(
          (x): x is string => typeof x === "string" && x.trim().length > 0
        );
        if (first) return first;
      } else if (typeof v === "string" && v.trim().length > 0) {
        return v;
      }
    }
  }  return "Validation échouée";
}// ---------- Schéma Zod ----------
const iconKeys = Object.keys(ICONS) as (keyof typeof ICONS)[];
const FormationSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().min(3, "Titre trop court"),
  category: z.string().min(2, "Catégorie requise"),
  certification: z.enum(["Certifiante", "Non certifiante"]).default("Certifiante"),
  participants: z
    .string()
    .regex(/^\s*\d+\s*-\s*\d+\s*$/, "Format attendu : 8-15")
    .default("8-15")
    .transform((s) => s.replace(/\s+/g, "")),
  description: z.string().min(20, "Description trop courte"),
  objectives: z.array(z.string().min(5, "Objectif trop court")).min(1, "Ajoutez au moins un objectif"),
  iconKey: z
    .string()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .refine((v) => iconKeys.includes(v as any), "Icône invalide")
    .default("BarChart3"),
  language: z.enum(["Français", "Arabe", "Anglais"]).default("Français"),
});// ✅ Type RHF clair
type FormationBase = z.infer<typeof FormationSchema>;
export type FormationFormInput = Omit<FormationBase, "objectives"> & {
  objectives: string[];
};type AddFormationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optionnel : sera appelé avec l’objet créé (normalisé FormationFormInput) */
  onSubmit?: (data: FormationFormInput) => Promise<void> | void;
  initialValues?: Partial<FormationFormInput>;
};// ---------- Helper : normaliser la réponse API ----------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toFormInputFromApi(data: any): FormationFormInput {
  return {
    id: data?.id,
    title: data?.title ?? "",
    category: data?.category ?? "",
    certification: data?.certification ?? "Certifiante",
    participants: data?.participants ?? "8-15",
    description: data?.description ?? "",
    objectives: Array.isArray(data?.objectives) ? data.objectives : [],
    iconKey: data?.iconKey ?? data?.icon_key ?? "BarChart3",
    language: data?.language ?? "Français",
  };
}export function AddFormationModal({
  open,
  onOpenChange,
  onSubmit,
  initialValues,
}: AddFormationModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = React.useState<0 | 1>(0);    
// 🔗 Catégories pour le Select
const [cats, setCats] = React.useState<Array<{id:number; name:string; parent_id:number|null}>>([]);

React.useEffect(() => {
  (async () => {
    try {
      const base = String(API_URL).replace(/\/+$/,'');
      const res  = await fetch(base + "/public/categories?per_page=500");
      const ct   = res.headers.get("content-type") || "";
      const json = ct.includes("application/json") ? await res.json() : [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items = Array.isArray(json && (json as any).data) ? (json as any).data : json;
      setCats(items || []);
    } catch (e) {
      console.error("/public/categories fetch failed", e);
    }
  })();
}, []);

const catOptions = React.useMemo(() => {
  const parents = new Map<number, string>();
  cats.filter(c => c.parent_id === null).forEach(p => parents.set(p.id, p.name));
  return cats
    .filter(c => c.name)
    .sort((a,b) => ((a.parent_id ?? 0) - (b.parent_id ?? 0)) || a.name.localeCompare(b.name))
    .map(c => ({
      value: c.name,
      label: c.parent_id ? ((parents.get(c.parent_id) || "") + " ▸ " + c.name) : c.name,
    }));
}, [cats]);
  const form = useForm<FormationFormInput>({
    resolver: zodResolver(FormationSchema),
    defaultValues: {
      title: "",
      category: "",
      certification: "Certifiante",
      participants: "8-15",
      description: "",
      objectives:
        initialValues?.objectives ?? [
          "Définir des objectifs clairs pour la fonction RH",
          "Mettre en place des indicateurs de suivi (KPI)",
        ],
      iconKey: "BarChart3",
      language: "Français",
    
      ...initialValues,
    },
    mode: "onBlur",
  });  const { fields, append, remove } = useFieldArray<FormationFormInput>({
    control: form.control,
    name: "objectives" as FieldArrayPath<FormationFormInput>,
  });  // ---------- Submit vers Laravel ----------
  const handleSubmit = async (values: FormationFormInput) => {
    try {
      // 🔐 Vérifier le token avant l'appel
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        toast.error("Session expirée. Merci de vous reconnecter.");
        navigate("/dashboard/login", {
          replace: true,
          state: { from: { pathname: "/dashboard/index" } },
        });
        return;
      }      // on envoie camelCase + snake_case pour être 100% compatibles
      const body = JSON.stringify({ ...values, icon_key: values.iconKey });      const res = await fetch(`${API_URL}/formations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });      if (!res.ok) {
        if (res.status === 401) {
          // Nettoyage + redirection
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          toast.error("Session expirée. Merci de vous reconnecter.");
          navigate("/dashboard/login", {
            replace: true,
            state: { from: { pathname: "/dashboard/index" } },
          });
          return;
        }
        if (res.status === 422) {
          const raw: unknown = await res.json().catch(() => ({}));
          const firstMsg = extractApiErrorMessage(raw);
          throw new Error(firstMsg);
        }
        const text = await res.text().catch(() => "");
        throw new Error(text || "Erreur serveur");
      }      const payload = await res.json().catch(() => ({}));
      const created = toFormInputFromApi(payload?.data ?? payload);      if (onSubmit) await onSubmit(created);      toast.success("Formation enregistrée");
      form.reset();
      setStep(0);
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de l’enregistrement"
      );
    }
  };  const PreviewIcon = iconKeyToComp(form.watch("iconKey"));
  const objectivesError =
    (form.formState.errors.objectives as { message?: string } | undefined)
      ?.message;  // Validation partielle avant step 2
  const step1Fields = [
    "title",
    "category",
    "certification",
    "language",
    "iconKey",
  ] as const;  const goNext = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ok = await form.trigger(step1Fields as any, { shouldFocus: true });
    if (ok) setStep(1);
  };  const handleCancel = () => {
    form.reset();
    setStep(0);
    onOpenChange(false);
  };  const goPrev = () => setStep(0);  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setStep(0);
      }}
    >
      <DialogContent className="sm:max-w-3xl w-[95vw] p-0">
        {/* Header sticky */}
        <DialogHeader className="px-6 pt-4 pb-3 border-b sticky top-0 bg-background z-10">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#235F8F] text-white">
                <PreviewIcon className="h-5 w-5" />
              </span>
              Ajouter une formation
            </div>            {/* Indicateur d'étapes */}
            <div className="flex items-center gap-3 text-sm">
              <span
                className={[
                  "inline-flex items-center justify-center h-6 w-6 rounded-full border",
                  step === 0
                    ? "bg-[#235F8F] text-white border-[#235F8F]"
                    : "bg-muted text-foreground/70 border-muted-foreground/20",
                ].join(" ")}
                aria-current={step === 0}
              >
                1
              </span>
              <span className="text-muted-foreground hidden sm:inline">
                Infos générales
              </span>
              <span className="opacity-40">—</span>
              <span
                className={[
                  "inline-flex items-center justify-center h-6 w-6 rounded-full border",
                  step === 1
                    ? "bg-[#235F8F] text-white border-[#235F8F]"
                    : "bg-muted text-foreground/70 border-muted-foreground/20",
                ].join(" ")}
                aria-current={step === 1}
              >
                2
              </span>
              <span className="text-muted-foreground hidden sm:inline">
                Contenu & objectifs
              </span>
            </div>
          </DialogTitle>          <DialogDescription>
            {step === 0
              ? "Renseignez les informations générales."
              : "Ajoutez une description claire et vos objectifs pédagogiques."}
          </DialogDescription>
        </DialogHeader>        <Form {...form}>
          {/* Layout : zone scroll + footer fixe */}
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col max-h-[80vh]"
          >
            {/* Zone scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {step === 0 ? (
                // ---------- ETAPE 1 : Infos générales ----------
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Titre */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Titre</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Pilotage de la fonction RH"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />                  {/* Catégorie */}
                  <FormField
                    control={form.control}
                    
    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner une catégorie" />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {catOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
                        <FormMessage
   />
                      </FormItem>
                    )}
                  />                  {/* Certification */}
                  <FormField
                    control={form.control}
                    name="certification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Certification</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choisir..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Certifiante">
                              Certifiante
                            </SelectItem>
                            <SelectItem value="Non certifiante">
                              Non certifiante
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />                  {/* Langue */}
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Langue</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
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
                  />                  {/* Icône */}
                  <FormField
                    control={form.control}
                    name="iconKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icône</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
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
                // ---------- ETAPE 2 : Contenu & objectifs ----------
                <div className="grid grid-cols-1 gap-4">
                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={6}
                            placeholder="Apprenez à piloter..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />                  {/* Objectifs dynamiques */}
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
                            −
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
                          + Ajouter un objectif
                        </Button>
                      </div>
                    </div>                    {typeof objectivesError === "string" && (
                      <p className="mt-2 text-sm font-medium text-destructive">
                        {objectivesError}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>            {/* Footer fixe */}
            <DialogFooter className="px-6 py-4 border-t">
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex items-center gap-2">
  {/* Annuler */}
  <Button
    type="button"
    variant="ghost"
    onClick={handleCancel}
    className="
      bg-transparent text-foreground
      hover:bg-[#7babd0]/20 hover:text-foreground
      dark:hover:bg-[#7babd0]/30
    "
  >
    Annuler
  </Button>  {/* Retour */}
  {step === 1 && (
    <Button
      type="button"
      variant="outline"
      onClick={goPrev}
      className="
        border border-gray-300 text-foreground
        hover:bg-[#7babd0]/20 hover:text-foreground
        dark:border-gray-600
        dark:hover:bg-[#7babd0]/30
      "
    >
      Retour
    </Button>
  )}
</div>                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    Étape {step + 1} / 2
                  </span>                  {step === 0 ? (
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
                    >
                      Enregistrer
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