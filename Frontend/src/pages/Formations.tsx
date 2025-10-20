import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Search,
  ArrowRight,
  Users,
  Globe2,
  CheckCircle,
  BadgeCheck,
  Briefcase,
  Lightbulb,
  Wrench,
  Microscope,
  Building2,
} from "lucide-react";

import { ICONS, iconKeyToComp } from "@/icons";

/* ----------------------- API base robuste (/api) ----------------------- */
function resolveApiBase() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = (import.meta as any).env?.VITE_API_URL ?? "http://127.0.0.1:8000/api";
  const base = String(raw).replace(/\/+$/, "");
  return /\/api$/.test(base) ? base : `${base}/api`;
}
const API_URL = resolveApiBase();

/* ----------------------------- Types UI -------------------------------- */
type UIFormation = {
  id: number;
  title: string;
  category: string;
  certification: "Certifiante" | "Non certifiante";
  participants: string;
  description: string;
  objectives: string[];
  iconKey: keyof typeof ICONS;
  language: "Français" | "Arabe" | "Anglais";
  popular?: boolean;
};

/* ---------------------------- Helpers JSON ----------------------------- */
function toObjectives(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter((x) => typeof x === "string") as string[];
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === "string") as string[];
    } catch {/* ignore */}
  }
  return [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeFormation(r: any): UIFormation {
  return {
    id: Number(r.id),
    title: String(r.title ?? ""),
    category: String(r.category ?? ""),
    certification: (r.certification ?? "Certifiante") as UIFormation["certification"],
    participants: String(r.participants ?? "8-15"),
    description: String(r.description ?? ""),
    objectives: toObjectives(r.objectives),
    iconKey: (r.iconKey ?? r.icon_key ?? "BadgeCheck") as UIFormation["iconKey"],
    language: (r.language ?? "Français") as UIFormation["language"],
    popular: !!r.popular,
  };
}

async function fetchFormations(): Promise<UIFormation[]> {
  const res = await fetch(`${API_URL}/formations`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const data = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
  return data.map(normalizeFormation);
}

/* ============================= Composant =============================== */
const Formations: React.FC = () => {
  const [formations, setFormations] = useState<UIFormation[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [quote, setQuote] = useState({
    formation: "",
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await fetchFormations();
        setFormations(list);
      } catch {
        setFormations([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* -------------------- Groupes de catégories (sidebar) -------------------- */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoryGroups: Record<string, { icon: any; subcategories: string[] }> = {
  "Management": {
    icon: Briefcase,
    subcategories: [
      "Management & Leadership",
      "Travail en Équipe & Management",
      "Prise de Parole & Expression Orale",
      "Communication Digitale & Réseautage",
      "Communication & Soft Skills",
    ],
  },
  "Ressources Humaines": {
    icon: Building2,
    subcategories: [
      "Organisation & Gestion RH",
      "Recrutement & Intégration",
      "Performance & Compétences",
      "Éthique & RSE",
      "Digitalisation & Innovation RH",
      "Législation & Réglementation",
    ],
  },
  "Développement Personnel": {
    icon: Lightbulb,
    subcategories: [
      "Développement Personnel & Soft Skills",
      "Développement & Motivation",
      "Bien-être & Santé au Travail",
    ],
  },
  "Qualité & Normes": {
    icon: BadgeCheck,
    subcategories: [
      "Qualité & Normes",
      "Contrôle Qualité & Audit",
      "Normes & Accréditation",
      "Outils & Techniques d’Analyse",
    ],
  },
  "Maintenance Industrielle": {
    icon: Wrench,
    subcategories: [
      "Maintenance Industrielle",
    ],
  },
  "Laboratoire": {
    icon: Microscope,
    subcategories: [
      "Gestion des Risques en Laboratoire",
      "Gestion des Risques & Conflits",
    ],
  },
};
  /* --------------------------- Normalisation & utils --------------------------- */
  const norm = (s?: string) =>
    String(s ?? "")
      .toLocaleLowerCase("fr")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "") // accents
      .replace(/&/g, " et ")          // harmonise & vs "et"
      .replace(/[-–—]/g, " ")         // tirets -> espace
      .replace(/\s+/g, " ")           // espaces multiples
      .trim();

  // fuzzy match: exact ou inclus (dans les deux sens)
  const fuzzyEq = (a: string, b: string) => {
    const A = norm(a);
    const B = norm(b);
    return A === B || A.includes(B) || B.includes(A);
  };

  // cat normalisée -> groupe (mapping direct pour les cas "propres")
  const catToGroup = useMemo(() => {
    const map: Record<string, string> = {};
    Object.entries(categoryGroups).forEach(([group, { subcategories }]) => {
      subcategories.forEach((sub) => {
        map[norm(sub)] = group;
      });
    });
    return map;
  }, [categoryGroups]);

  // Compteurs par groupe — version tolérante
  const countsByGroup = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.keys(categoryGroups).forEach((g) => (counts[g] = 0));

    const unknown = new Set<string>();

    formations.forEach((f) => {
      const fc = f.category;

      // 1) tentative mapping direct exact (normalisé)
      const directGroup = catToGroup[norm(fc)];
      if (directGroup) {
        counts[directGroup] += 1;
        return;
      }

      // 2) fuzzy: compare à chaque groupe (nom + sous-catégories)
      let matched = false;
      for (const [group, { subcategories }] of Object.entries(categoryGroups)) {
        if (fuzzyEq(fc, group)) {
          counts[group] += 1;
          matched = true;
          break;
        }
        for (const sub of subcategories) {
          if (fuzzyEq(fc, sub)) {
            counts[group] += 1;
            matched = true;
            break;
          }
        }
        if (matched) break;
      }

      if (!matched) unknown.add(fc);
    });

    counts["Toutes"] = formations.length;

    // Aide debug en dev
    if (import.meta.env.DEV && unknown.size) {
      // eslint-disable-next-line no-console
      console.warn("[Formations] Catégories non reconnues :", Array.from(unknown));
    }

    return counts;
  }, [formations, categoryGroups, catToGroup]);

  // Filtrage robuste
  const formationsFiltered = useMemo(() => {
    const q = norm(query);

    return formations.filter((f) => {
      // correspondance groupe sélectionné
      const fc = f.category;
      const inGroup =
        selectedCategory === "Toutes"
          ? true
          : fuzzyEq(fc, selectedCategory) ||
            !!categoryGroups[selectedCategory]?.subcategories.some((sub) => fuzzyEq(fc, sub));

      if (!inGroup) return false;
      if (!q) return true;

      return (
        norm(f.title).includes(q) ||
        norm(f.description).includes(q) ||
        (f.objectives ?? []).some((o) => norm(o).includes(q))
      );
    });
  }, [formations, selectedCategory, query]);

  /* ------------------------- Demande de devis (modal) ------------------------ */
  async function handleQuoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSending(true);
      const res = await fetch(`${API_URL}/demandes-devis`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          formation: quote.formation,
          name: quote.name,
          email: quote.email,
          phone: quote.phone,
          notes: quote.notes,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        const msg = (j?.message && String(j.message)) || "Erreur lors de l’envoi";
        throw new Error(msg);
      }

      toast.success("Demande envoyée avec succès");
      setIsQuoteOpen(false);
      setQuote({ formation: "", name: "", email: "", phone: "", notes: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de l’envoi");
    } finally {
      setSending(false);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openQuote = (f: any) => {
    setQuote((q) => ({ ...q, formation: f.title }));
    setIsQuoteOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleQuoteChange = (e: any) => {
    setQuote({ ...quote, [e.target.name]: e.target.value });
  };
useEffect(() => {
  const targetId = (location.state as { scrollTo?: string } | null)?.scrollTo;
  if (!targetId) return;

  const element = document.getElementById(targetId);
  if (element) {
    // Petit délai pour laisser React terminer le rendu du DOM
    setTimeout(() => {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  }

  // Nettoyage de l’état pour éviter re-scrolls futurs
  navigate(location.pathname, { replace: true, state: {} });
}, [location.state, location.pathname, navigate]);


  /* --------------------------------- UI --------------------------------- */
  const faqs = [
    {
      question: "Comment s'inscrire à une formation ?",
      answer:
        "Vous pouvez vous inscrire directement via notre formulaire de contact ou nous appeler. Nous vous enverrons ensuite un devis personnalisé et les modalités d'inscription.",
      cta: true,
      ctaLabel: "Nous contacter",
      ctaLink: "/contact",
    },
    {
      question: "Les formations peuvent-elles être prises en charge ?",
      answer:
        "Oui, nos formations sont éligibles aux dispositifs de financement (OPCO, CPF, Plan de développement des compétences). Nous vous aidons dans vos démarches.",
    },
    {
      question: "Proposez-vous des formations sur-mesure ?",
      answer:
        "Absolument ! Nous concevons des programmes sur-mesure adaptés à vos besoins spécifiques, votre secteur d'activité et vos contraintes organisationnelles.",
      cta: true,
      ctaLabel: "Faire une demande de formation",
      ctaLink: "/contact",
    },
    {
      question: "Quelle est votre approche pédagogique ?",
      answer:
        "Notre méthode privilégie la pratique (80%) sur la théorie (20%). Nous utilisons des études de cas réels, mises en situation et projets pratiques pour maximiser l'apprentissage.",
    },
    {
      question: "Délivrez-vous des certifications ?",
      answer:
        "Oui, nos formations donnent lieu à des attestations de fin de formation et certaines sont certifiantes selon les standards professionnels reconnus.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Catégories */}
      <section  className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 mb-5">
            <h2 className="text-xl font-semibold text-primary">
              Catégories
              {selectedCategory !== "Toutes" && (
                <span className="ml-2 text-muted-foreground font-normal">· {selectedCategory}</span>
              )}
            </h2>
            <div className="relative w-full max-w-xs">
              <Input
                placeholder="Rechercher dans la catégorie…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Grille des cartes catégories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(categoryGroups).map(([groupName, { icon: Icon }]) => {
              const active = selectedCategory === groupName;
              const count = countsByGroup[groupName] ?? 0;

              return (
                <button
                  key={groupName}
                  onClick={() => {
                    setSelectedCategory(groupName);
                    setSelectedSubcategory(null);
                  }}
                  className={[
                    "group w-full rounded-2xl border p-4 text-left transition-all",
                    "hover:shadow-md hover:-translate-y-0.5",
                    active ? "border-accent ring-2 ring-accent/30 bg-accent/5" : "border-border bg-background",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                      <Icon className="h-5 w-5 text-orange-500" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-tight">{groupName}</p>
                      <p className="text-xs text-muted-foreground">{count} formations</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Liste des formations */}
      <section className="pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading && <div className="text-sm text-muted-foreground">Chargement…</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {!loading &&
              formationsFiltered.map((formation) => {
                const Icon = iconKeyToComp((formation.iconKey as keyof typeof ICONS) ?? "BadgeCheck");

                return (
                  <Card
                    key={formation.id}
                    className="shadow-elegant hover-lift border border-gray-200 flex flex-col min-h-[480px]"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-center">
                        <div className="w-20 h-20 rounded-xl flex items-center justify-center mx-auto">
                          <Icon className="w-16 h-16 text-[#235f8f]" />
                        </div>
                      </div>
                      <CardTitle className="text-lg text-primary mt-2 text-center">{formation.title}</CardTitle>
                      <Badge variant="outline" className="w-fit text-xs mx-auto">
                        {formation.category}
                      </Badge>
                    </CardHeader>

                    <CardContent className="pt-0 flex-1 flex flex-col">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{formation.description}</p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <div className="flex items-center">
                          <BadgeCheck className="h-3 w-3 mr-1 text-[#7babd0]" />
                          {formation.certification}
                        </div>

                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {formation.participants}
                        </div>

                        <div className="flex items-center">
                          <Globe2 className="h-3 w-3 mr-1 text-[#7babd0]" />
                          {formation.language}
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        <p className="text-xs text-muted-foreground font-medium">Objectifs principaux :</p>
                        <ul className="space-y-1">
                          {(formation.objectives ?? []).slice(0, 2).map((o, i) => (
                            <li key={i} className="flex items-start text-xs text-muted-foreground">
                              <CheckCircle className="h-3 w-3 text-accent mr-2 mt-0.5 flex-shrink-0" />
                              {o}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-auto flex justify-center">
                        <Button variant="accent" size="sm" className="h-10 w-80" onClick={() => openQuote(formation)}>
                          Demander un devis
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>

          {/* Aucune formation */}
          {!loading && formationsFiltered.length === 0 && (
            <div className="text-center text-muted-foreground py-16">
              Aucune formation trouvée. Essaie une autre recherche ou choisis “Toutes”.
            </div>
          )}
        </div>

        {/* 🔽 MODAL Devis */}
        <Dialog open={isQuoteOpen} onOpenChange={setIsQuoteOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Demande de devis</DialogTitle>
              <DialogDescription>Remplissez ce formulaire, nous revenons vers vous rapidement.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleQuoteSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="formation">Formation</Label>
                <Input
                  id="formation"
                  name="formation"
                  value={quote.formation}
                  readOnly
                  className="bg-muted/60 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nom complet <span className="text-red-500" aria-hidden="true">*</span>
                  </Label>
                  <Input id="name" name="name" value={quote.name} onChange={handleQuoteChange} placeholder="Votre nom" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500" aria-hidden="true">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={quote.email}
                    onChange={handleQuoteChange}
                    placeholder="vous@exemple.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Téléphone <span className="text-red-500" aria-hidden="true">*</span>
                </Label>
                <Input id="phone" name="phone" value={quote.phone} onChange={handleQuoteChange} placeholder="+212 6 XX XX XX XX" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Remarques / notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={quote.notes}
                  onChange={handleQuoteChange}
                  placeholder="Précisez vos besoins, contraintes, dates souhaitées…"
                />
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setIsQuoteOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="accent" disabled={sending}>
                  {sending ? "Envoi…" : "Envoyer la demande"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      {/* FAQ */}
      <section className="py-20 section-subtle">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-accent/10 text-accent">FAQ</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">Questions fréquentes</h2>
              <p className="text-xl text-muted-foreground">Tout ce que vous devez savoir sur nos formations</p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-primary hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pt-4 space-y-4">
                    <p>{faq.answer}</p>

                    {faq.cta && (
                      <div className="flex justify-end mt-6 pr-4">
                        <Link to={faq.ctaLink!}>
                          <Button variant="accent" size="sm">
                            {faq.ctaLabel}
                          </Button>
                        </Link>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Formations;
