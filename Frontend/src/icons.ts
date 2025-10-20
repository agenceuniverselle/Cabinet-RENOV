// src/icons.ts
import {
  // Base
  BarChart3, GraduationCap, Users, TrendingUp,
  // Tout ce dont tu as besoin dans ta liste longue
  Briefcase, ClipboardList, UserCog, Workflow, Target, RefreshCw, Building2, Users2,
  FileText, Scale, FileSearch, BookOpen, ClipboardCheck, Sparkles, Brain, UserSquare2,
  UsersRound, Handshake, HeartHandshake, Languages, Laptop, Kanban, Megaphone, Mic,
  AlertTriangle, BadgeCheck, Timer, Lightbulb, Flame, Globe, Share2, Rocket, MessageSquare,
  ListOrdered, Presentation, Globe2, Leaf, Medal, ShieldPlus, Bolt, Utensils, FileBadge2,
  CheckCheck, LineChart, CalendarRange, Cog, Activity, Wrench, Hammer, Microscope,
  FlaskConical, Files, Sigma, Ruler, ShieldAlert,
} from "lucide-react";

export const ICONS = {
  // Base
  BarChart3, GraduationCap, Users, TrendingUp,
  // Liste étendue
  Briefcase, ClipboardList, UserCog, Workflow, Target, RefreshCw, Building2, Users2,
  FileText, Scale, FileSearch, BookOpen, ClipboardCheck, Sparkles, Brain, UserSquare2,
  UsersRound, Handshake, HeartHandshake, Languages, Laptop, Kanban, Megaphone, Mic,
  AlertTriangle, BadgeCheck, Timer, Lightbulb, Flame, Globe, Share2, Rocket, MessageSquare,
  ListOrdered, Presentation, Globe2, Leaf, Medal, ShieldPlus, Bolt, Utensils, FileBadge2,
  CheckCheck, LineChart, CalendarRange, Cog, Activity, Wrench, Hammer, Microscope,
  FlaskConical, Files, Sigma, Ruler, ShieldAlert,
} as const;

export type IconKey = keyof typeof ICONS;

export const iconOptions = (Object.keys(ICONS) as IconKey[]).map((k) => ({
  key: k,
  label: k,
  Comp: ICONS[k],
}));

export const iconKeyToComp = (key?: string) => {
  const m = ICONS as Record<string, React.ComponentType<{ className?: string }>>;
  return (key && m[key]) || BarChart3;
};
