// src/pages/Settings.tsx
import * as React from "react";
import { Save, User, Bell, Globe, Shield } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

// --- Types ---
type UserProfile = {
  first_name: string;
  last_name: string;
  email: string;
  bio: string;
  avatar_url: string | null;
};

type NotificationSettings = {
  email: boolean;
  push: boolean;
  weekly_report: boolean;
};

type Preferences = {
  language: "fr" | "en" | "es";
  timezone: string;
};

function firstLetters(a: string, b: string) {
  const f = (s: string) => (s?.trim()[0] ?? "").toUpperCase();
  return `${f(a)}${f(b) || ""}` || "U";
}

function pickApiError(e: unknown): string {
  if (e instanceof Error) return e.message;
  try {
    const obj = e as any;
    if (obj?.message) return String(obj.message);
  } catch { /* empty */ }
  return "Une erreur est survenue.";
}

const Settings: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [pwBusy, setPwBusy] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  // Charger les données utilisateur depuis localStorage/sessionStorage
  const getUserData = (): UserProfile => {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return {
          first_name: user.first_name || user.name?.split(" ")[0] || "",
          last_name: user.last_name || user.name?.split(" ")[1] || "",
          email: user.email || "",
          bio: user.bio || "",
          avatar_url: user.avatar_url || null,
        };
      } catch {
        // Fallback
      }
    }
    return {
      first_name: "",
      last_name: "",
      email: "",
      bio: "",
      avatar_url: null,
    };
  };

  const [profile, setProfile] = React.useState<UserProfile>(getUserData());
  
  const [notifications, setNotifications] = React.useState<NotificationSettings>({
    email: true,
    push: false,
    weekly_report: true,
  });

  const [preferences, setPreferences] = React.useState<Preferences>({
    language: "fr",
    timezone: "Europe/Paris",
  });

  // Password form
  const [currentPw, setCurrentPw] = React.useState("");
  const [newPw, setNewPw] = React.useState("");
  const [newPw2, setNewPw2] = React.useState("");

  // Sauvegarder les modifications
  const saveAll = async () => {
    try {
      setSaving(true);
      
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Non authentifié");
      }

      // Mettre à jour le profil utilisateur
      const res = await fetch(`${API_URL}/user/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          bio: profile.bio,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.message || "Échec de la mise à jour");
      }

      const updated = await res.json();
      
      // Mettre à jour le localStorage
      const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
      storage.setItem("user", JSON.stringify(updated.user || updated));

      toast.success("Paramètres enregistrés avec succès");
    } catch (e) {
      toast.error(pickApiError(e));
    } finally {
      setSaving(false);
    }
  };

  // Upload avatar
  const onPickAvatar = () => fileRef.current?.click();
  const onAvatarFile = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (!ev.target.files?.length) return;
    const file = ev.target.files[0];
    
    // Vérifier la taille (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 2MB");
      return;
    }

    const fd = new FormData();
    fd.append("avatar", file);
    
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Non authentifié");
      }

      const res = await fetch(`${API_URL}/user/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.message || "Échec du téléversement");
      }

      const result = await res.json();
      
      setProfile((prev) => ({ ...prev, avatar_url: result.avatar_url }));
      
      // Mettre à jour le localStorage
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        user.avatar_url = result.avatar_url;
        const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
        storage.setItem("user", JSON.stringify(user));
      }

      toast.success("Avatar mis à jour");
    } catch (e) {
      toast.error(pickApiError(e));
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // Changer le mot de passe
  const changePassword = async () => {
    if (!currentPw || !newPw || !newPw2) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    if (newPw !== newPw2) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (newPw.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    try {
      setPwBusy(true);
      
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Non authentifié");
      }

      const res = await fetch(`${API_URL}/user/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPw,
          new_password: newPw,
          new_password_confirmation: newPw2,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.message || "Impossible de changer le mot de passe");
      }

      toast.success("Mot de passe mis à jour");
      setCurrentPw("");
      setNewPw("");
      setNewPw2("");
    } catch (e) {
      toast.error(pickApiError(e));
    } finally {
      setPwBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez les paramètres de votre compte et de la plateforme
        </p>
      </div>

      {/* Profile */}
      <Card className="p-6 border-0 bg-gradient-card animate-fade-in">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Profil</h2>
        </div>

        <div className="flex items-start gap-6 mb-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url ?? ""} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {firstLetters(profile.first_name, profile.last_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarFile}
            />
            <Button variant="outline" size="sm" className="mb-2" onClick={onPickAvatar}>
              Changer la photo
            </Button>
            <p className="text-sm text-muted-foreground">JPG, PNG ou GIF. Max 2MB.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={profile.first_name}
                onChange={(e) => setProfile((p) => ({ ...p, first_name: e.target.value }))}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={profile.last_name}
                onChange={(e) => setProfile((p) => ({ ...p, last_name: e.target.value }))}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Input
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
              disabled={loading}
              placeholder="Administrateur de la plateforme"
            />
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6 border-0 bg-gradient-card animate-fade-in">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotif" className="text-base">
                Notifications par email
              </Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des notifications sur les nouvelles inscriptions
              </p>
            </div>
            <Switch
              id="emailNotif"
              checked={notifications.email}
              onCheckedChange={(v) => setNotifications((n) => ({ ...n, email: v }))}
              disabled={loading}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="pushNotif" className="text-base">
                Notifications push
              </Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des notifications en temps réel
              </p>
            </div>
            <Switch
              id="pushNotif"
              checked={notifications.push}
              onCheckedChange={(v) => setNotifications((n) => ({ ...n, push: v }))}
              disabled={loading}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weeklyReport" className="text-base">
                Rapport hebdomadaire
              </Label>
              <p className="text-sm text-muted-foreground">
                Recevoir un résumé des activités chaque semaine
              </p>
            </div>
            <Switch
              id="weeklyReport"
              checked={notifications.weekly_report}
              onCheckedChange={(v) => setNotifications((n) => ({ ...n, weekly_report: v }))}
              disabled={loading}
            />
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-6 border-0 bg-gradient-card animate-fade-in">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Préférences</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Langue</Label>
            <Select
              value={preferences.language}
              onValueChange={(v) => setPreferences((p) => ({ ...p, language: v as "fr" | "en" | "es" }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fuseau horaire</Label>
            <Select
              value={preferences.timezone}
              onValueChange={(v) => setPreferences((p) => ({ ...p, timezone: v }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Europe/Paris">Paris (Europe/Paris)</SelectItem>
                <SelectItem value="Europe/London">London (Europe/London)</SelectItem>
                <SelectItem value="America/New_York">New York (America/New_York)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card className="p-6 border-0 bg-gradient-card animate-fade-in">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Sécurité</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={newPw2}
              onChange={(e) => setNewPw2(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <Button variant="outline" onClick={changePassword} disabled={pwBusy}>
            {pwBusy ? "Mise à jour…" : "Changer le mot de passe"}
          </Button>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveAll}
          disabled={saving || loading}
          className="gap-2 bg-gradient-primary hover:opacity-90 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Enregistrement…" : "Enregistrer les modifications"}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
