// src/pages/Login.tsx
import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

// Identifiants par défaut (utilisés uniquement si tu veux remplir automatiquement)
const DEFAULT_EMAIL = "admin@cabinet-renov.ma";
const DEFAULT_PWD   = "Cabinet@Renov-2025?";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard/index";

  // ✅ Champs vides au démarrage
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPwd, setShowPwd] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [busy, setBusy] = React.useState(false);

  // Déjà connecté ? on redirige
  React.useEffect(() => {
    const hasToken = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (hasToken) navigate(from, { replace: true });
  }, [from, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setBusy(true);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          json?.message ||
          (res.status === 422 ? "Identifiants invalides" : `Erreur ${res.status}`);
        throw new Error(msg);
      }

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("token", json.token);
      storage.setItem("user", JSON.stringify(json.user));

      toast.success("Connexion réussie");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de connexion");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-muted/40 to-background px-4">
      <Card className="w-full max-w-4xl overflow-hidden rounded-2xl shadow-xl border-0">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Panneau gauche */}
          <div className="relative hidden md:flex flex-col justify-between p-8 bg-gradient-to-br from-[#7babd0] to-[#6ea4c8] text-black">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-black/10 backdrop-blur-sm grid place-items-center font-bold">
                  <span className="text-lg">R</span>
                </div>
                <div className="font-semibold text-xl">RENOV-Cabinet de formation</div>
              </div>

              <div>
                <h2 className="text-2xl font-bold leading-tight">Espace administrateur</h2>
                <p className="text-sm/6 text-black/80 mt-2">
                  Connectez-vous pour gérer les demandes de devis, les formations et les notifications.
                </p>
              </div>

              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 mt-0.5" />
                  Vue d'ensemble claire des demandes
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 mt-0.5" />
                  Tableau de bord administrateur
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 mt-0.5" />
                  Accès aux statistiques et suivi des apprenants
                </li>
              </ul>
            </div>

            <div className="text-xs text-black/80">
              © {new Date().getFullYear()} RENOV. Tous droits réservés.
            </div>
            <div className="pointer-events-none absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
          </div>

          {/* Panneau droit (form) */}
          <div className="p-6 md:p-8 bg-card">
            <div className="mb-6 md:hidden">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#7babd0] grid place-items-center font-bold text-black">
                  <span className="text-lg">R</span>
                </div>
                <div className="font-semibold text-xl">RENOV</div>
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-2">Connexion</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Entrez vos identifiants pour accéder au tableau de bord.
            </p>

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Identifiant (email)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
                  Se souvenir de moi
                </label>

                <a href="#" className="text-sm text-[#7babd0] hover:underline" onClick={(e) => e.preventDefault()}>
                  Mot de passe oublié ?
                </a>
              </div>

              <Button
                type="submit"
                disabled={busy}
                className="w-full h-10 bg-[#7babd0] hover:bg-[#6ea4c8] text-black gap-2"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connexion…
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Accès réservé aux administrateurs.
              </p>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}
