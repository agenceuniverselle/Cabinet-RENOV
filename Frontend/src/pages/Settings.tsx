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
type SettingsResponse = {
  profile: {
    first_name: string;
    last_name: string;
    email: string;
    bio: string;
    avatar_url: string | null;
  };
  notifications: {
    email: boolean;
    push: boolean;
    weekly_report: boolean;
  };
  preferences: {
    language: "fr" | "en" | "es";
    timezone: string; // ex: "Europe/Paris"
  };
};

function firstLetters(a: string, b: string) {
  const f = (s: string) => (s?.trim()[0] ?? "").toUpperCase();
  return `${f(a)}${f(b) || ""}` || "U";
}

function pickApiError(e: unknown): string {
  if (e instanceof Error) return e.message;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = e as any;
    if (obj?.message) return String(obj.message);
  } catch { /* empty */ }
  return "Une erreur est survenue.";
}

const Settings: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [saving,   setSaving]   = React.useState(false);
  const [pwBusy,   setPwBusy]   = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const [data, setData] = React.useState<SettingsResponse>({
    profile:   { first_name: "", last_name: "", email: "", bio: "", avatar_url: null },
    notifications: { email: true, push: false, weekly_report: true },
    preferences:   { language: "fr", timezone: "Europe/Paris" },
  });

  // Password form
  const [currentPw, setCurrentPw] = React.useState("");
  const [newPw, setNewPw] = React.useState("");
  const [newPw2, setNewPw2] = React.useState("");

  // Load settings
  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/settings`, {
          headers: { Accept: "application/json" },
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const payload = (await res.json()) as SettingsResponse;
        setData(payload);
      } catch (e) {
        toast.error(pickApiError(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Save settings
  const saveAll = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify({
          profile: {
            first_name: data.profile.first_name,
            last_name: data.profile.last_name,
            email: data.profile.email,
            bio: data.profile.bio,
          },
          notifications: data.notifications,
          preferences: data.preferences,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = payload?.message || "Échec de l’enregistrement";
        throw new Error(msg);
      }
      setData((prev) => ({ ...prev, ...(payload as SettingsResponse) }));
      toast.success("Paramètres enregistrés.");
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
    const fd = new FormData();
    fd.append("avatar", file);
    try {
      const res = await fetch(`${API_URL}/settings/avatar`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.message || "Échec du téléversement");
      setData((d) => ({ ...d, profile: { ...d.profile, avatar_url: payload.avatar_url } }));
      toast.success("Avatar mis à jour.");
    } catch (e) {
      toast.error(pickApiError(e));
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // Change password
  const changePassword = async () => {
    if (!currentPw || !newPw || !newPw2) {
      toast.error("Veuillez remplir tous les champs mot de passe.");
      return;
    }
    if (newPw !== newPw2) {
      toast.error("La confirmation du mot de passe ne correspond pas.");
      return;
    }
    try {
      setPwBusy(true);
      const res = await fetch(`${API_URL}/settings/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify({
          current_password: currentPw,
          new_password: newPw,
          new_password_confirmation: newPw2,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.message || "Impossible de changer le mot de passe");
      toast.success("Mot de passe mis à jour.");
      setCurrentPw(""); setNewPw(""); setNewPw2("");
    } catch (e) {
      toast.error(pickApiError(e));
    } finally {
      setPwBusy(false);
    }
  };

  // Shortcuts to mutate state
  const setProfile = (k: keyof SettingsResponse["profile"], v: string | null) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setData((d) => ({ ...d, profile: { ...d.profile, [k]: v } as any }));
  const setNotif = (k: keyof SettingsResponse["notifications"], v: boolean) =>
    setData((d) => ({ ...d, notifications: { ...d.notifications, [k]: v } }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setPref = (k: keyof SettingsResponse["preferences"], v: any) =>
    setData((d) => ({ ...d, preferences: { ...d.preferences, [k]: v } }));

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Paramètres</h1>
        <p className="text-muted-foreground">Gérez les paramètres de votre compte et de la plateforme</p>
      </div>

      {/* Profile */}
      <Card className="p-6 border-0 bg-gradient-card animate-fade-in">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Profil</h2>
        </div>

        <div className="flex items-start gap-6 mb-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={data.profile.avatar_url ?? ""} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {firstLetters(data.profile.first_name, data.profile.last_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarFile} />
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
                value={data.profile.first_name}
                onChange={(e) => setProfile("first_name", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={data.profile.last_name}
                onChange={(e) => setProfile("last_name", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={data.profile.email}
              onChange={(e) => setProfile("email", e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Input
              id="bio"
              value={data.profile.bio}
              onChange={(e) => setProfile("bio", e.target.value)}
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
              <Label htmlFor="emailNotif" className="text-base">Notifications par email</Label>
              <p className="text-sm text-muted-foreground">Recevoir des notifications sur les nouvelles inscriptions</p>
            </div>
            <Switch
              id="emailNotif"
              checked={data.notifications.email}
              onCheckedChange={(v) => setNotif("email", v)}
              disabled={loading}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="pushNotif" className="text-base">Notifications push</Label>
              <p className="text-sm text-muted-foreground">Recevoir des notifications en temps réel</p>
            </div>
            <Switch
              id="pushNotif"
              checked={data.notifications.push}
              onCheckedChange={(v) => setNotif("push", v)}
              disabled={loading}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weeklyReport" className="text-base">Rapport hebdomadaire</Label>
              <p className="text-sm text-muted-foreground">Recevoir un résumé des activités chaque semaine</p>
            </div>
            <Switch
              id="weeklyReport"
              checked={data.notifications.weekly_report}
              onCheckedChange={(v) => setNotif("weekly_report", v)}
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
              value={data.preferences.language}
              onValueChange={(v) => setPref("language", v as SettingsResponse["preferences"]["language"])}
              disabled={loading}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
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
              value={data.preferences.timezone}
              onValueChange={(v) => setPref("timezone", v)}
              disabled={loading}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
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
            <Input id="currentPassword" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <Input id="newPassword" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input id="confirmPassword" type="password" value={newPw2} onChange={(e) => setNewPw2(e.target.value)} />
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
