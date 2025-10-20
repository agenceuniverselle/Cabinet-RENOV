import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  CheckCircle,
  Calendar,
  Users,
  Award
} from "lucide-react";
const API_URL = String(import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api").replace(/\/+$/, "");

const Contact = () => {
  const { toast } = useToast();
 // 🔁 Scroll automatique vers l’ancre (state.scrollTo ou hash #...)
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const stateTarget = (location.state as { scrollTo?: string } | null)?.scrollTo;
    const hashTarget = location.hash ? location.hash.replace(/^#/, "") : undefined;
    const target = stateTarget || hashTarget;
    if (!target) return;

    const scroll = () => {
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const raf = requestAnimationFrame(() => {
      scroll();                     // 1er passage
      const t = setTimeout(scroll, 120);  // 2e passage après layout

      // On nettoie l'état seulement si on venait via state.scrollTo
      const t2 = setTimeout(() => {
        if (stateTarget) {
          navigate(location.pathname + (location.hash || ""), { replace: true, state: {} });
        }
      }, 300);

      return () => {
        clearTimeout(t);
        clearTimeout(t2);
      };
    });

    return () => cancelAnimationFrame(raf);
  }, [location.pathname, location.hash, location.state, navigate]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
    website: "" // honeypot anti-spam (doit rester vide)
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Accepté : +212 6XX..., 06XX..., ou format international
  const validatePhone = (phone: string) =>
    /^(\+?\d{6,15}|0\d{8,10}|(?:\+212|212)\d{9})$/.test(phone.replace(/\s/g, ""));
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Honeypot -> stoppe les bots
  if (formData.website) return;

  // Validations simples
  if (!formData.name || !formData.email || !formData.message) {
    toast({ title: "Champs manquants", description: "Nom, email et message sont obligatoires.", variant: "destructive" });
    return;
  }
  if (!validateEmail(formData.email)) {
    toast({ title: "Email invalide", description: "Merci de saisir un email valide.", variant: "destructive" });
    return;
  }
  if (formData.phone && !validatePhone(formData.phone)) {
    toast({
      title: "Téléphone invalide",
      description: "Utilisez un format valide (ex. +212663628668 ou 0663628668).",
      variant: "destructive",
    });
    return;
  }

  setIsSubmitting(true);

  try {
    const res = await fetch(`${API_URL}/contact-messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      // Si API sur autre domaine et CORS activé côté Laravel, c'est implicite; sinon ajoute `mode: "cors"`
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone.replace(/[\s-]+/g, ""), // normalise
        company: formData.company || null,
        subject: formData.subject || null,
        message: formData.message,
        website: formData.website || "", // honeypot (doit rester vide)
      }),
    });

    if (!res.ok) {
      let errMsg = `Erreur ${res.status}`;
      try {
        const j = await res.json();
        errMsg = j?.message || (j?.errors && Object.values(j.errors).flat()[0]) || errMsg;
      } catch {/* ignore */}
      throw new Error(errMsg);
    }

    const j = await res.json();
    toast({
      title: "Message envoyé ✅",
      description: j?.message ?? "Nous vous répondrons dans les meilleurs délais.",
    });

    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      subject: "",
      message: "",
      website: "",
    });
  } catch (error) {
    toast({
      title: "Erreur",
      description: error instanceof Error ? error.message : "Une erreur est survenue. Veuillez réessayer.",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};


  const contactInfo = [
    {
      icon: Phone,
      title: "Téléphone",
      details: ["+212 663628668"],
      description: ["Lundi – Vendredi : 9h – 18:30", "Samedi : 9h – 13:30"]
    },
    {
      icon: Mail,
      title: "Email",
      details: ["cabinetrenov@gmail.com"],
      description: ["Réponse sous 24h"]
    },
    {
      icon: MapPin,
      title: "Adresse",
      details: [
        "AV. Royaume Arabie Saoudite, Rés. Al Azizia Appart 22, 3e étage"
      ],
      description: ["90000 Tanger, Maroc"]
    },
    {
      icon: Clock,
      title: "Horaires",
      details: ["Lun – Ven : 9h – 18h", "Sam : 9h – 13h"],
      description: ["Sur rendez-vous uniquement"]
    }
  ];

  const services = [
    {
      icon: Calendar,
      title: "Audit gratuit",
      description: "Analyse de vos besoins en formation"
    },
    {
      icon: Users,
      title: "Devis personnalisé",
      description: "Proposition adaptée à votre budget"
    },
    {
      icon: Award,
      title: "Accompagnement",
      description: "Suivi personnalisé tout au long du projet"
    }
  ];

  return (
    <main className="min-h-screen">
      {/* Contact principale */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Badge
            className="
              mb-6 bg-[hsl(var(--accent)_/_0.12)] text-[hsl(var(--accent))]
              border border-[hsl(var(--accent)_/_0.25)] rounded-full
              px-4 py-1 text-sm font-medium tracking-wide
            "
          >
            Contactez-nous
          </Badge>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Formulaire */}
            <Card className="shadow-elegant" >
              <CardHeader>
                <CardTitle className="text-2xl text-primary flex items-center">
                  <Send className="mr-3 h-6 w-6" />
                  Envoyez-nous un message
                </CardTitle>
                <p className="text-muted-foreground">
                  Remplissez ce formulaire et nous vous recontacterons
                  rapidement.
                </p>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {/* honeypot */}
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="hidden"
                    aria-hidden="true"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Nom complet <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Votre nom"
                        required
                        autoComplete="name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="vous@email.com"
                        required
                        autoComplete="email"
                        inputMode="email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Téléphone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+212 663628668"
                        inputMode="tel"
                        autoComplete="tel"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Entreprise</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Nom de votre entreprise"
                        autoComplete="organization"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Sujet</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Ex : Formation en management d'équipe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Message <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Décrivez votre projet de formation, vos besoins, votre contexte…"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="
                      w-full bg-[#235f8f] hover:bg-[#1e557e] text-white border border-transparent
                      focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#235f8f]
                      disabled:opacity-70 disabled:cursor-not-allowed
                    "
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? "Envoi en cours..." : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Envoyer le message
                      </>
                    )}
                  </Button>

                  {/* Message de réassurance */}
                  <p className="text-xs text-muted-foreground text-center">
                    Vos informations sont utilisées uniquement pour vous répondre
                    (aucun partage à des tiers).
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Informations de contact */}
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="shadow-soft hover-lift">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-[hsl(var(--accent)_/_0.15)]">
                        <info.icon className="h-6 w-6 text-[hsl(var(--accent))]" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-primary mb-1">
                          {info.title}
                        </h3>

                        {/* détails cliquables quand pertinent */}
                        <div className="text-sm text-muted-foreground space-y-0.5">
                          {info.title === "Téléphone" ? (
                            <a
                              href="tel:+212663628668"
                              className="hover:underline break-all"
                            >
                              {info.details[0]}
                            </a>
                          ) : info.title === "Email" ? (
                            <a
                              href="mailto:cabinetrenov@gmail.com"
                              className="hover:underline break-all"
                            >
                              {info.details[0]}
                            </a>
                          ) : (
                            info.details.map((line, i) => (
                              <p key={i} className="break-words">{line}</p>
                            ))
                          )}

                          {info.description.map((line, i) => (
                            <p key={i} className="break-words">{line}</p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* WhatsApp 
              <Card className="shadow-elegant border-accent/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">
                        Contact WhatsApp
                      </h3>
                      <p className="text-muted-foreground">Réponse immédiate</p>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/212663628668?text=${encodeURIComponent(
                      "Bonjour, je souhaite recevoir votre plaquette de formations."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Envoyer un message WhatsApp"
                  >
                    <Button
                      variant="outline"
                      size="xl"
                      className="w-full sm:w-auto bg-white/10 border border-[hsl(var(--accent)_/_0.35)] hover:bg-[hsl(var(--accent)_/_0.12)]"
                    >
                      📲 Contactez-nous sur WhatsApp
                    </Button>
                  </a>
                </CardContent>
              </Card>*/}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-12 sm:py-16 section-subtle">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4 bg-accent/10 text-accent">Nos Services</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
              Ce que nous vous proposons
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service, index) => (
              <Card key={index} className="shadow-soft hover-lift border-0 text-center h-full">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center mx-auto mb-6">
                    <service.icon className="h-8 w-8 text-[#7babd0]" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-primary mb-3">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground">{service.description}</p>
                  <CheckCircle className="h-6 w-6 text-accent mx-auto mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-elegant overflow-hidden">
            <div className="w-full aspect-[16/9] sm:aspect-[21/9]">
              <iframe
                title="Localisation du cabinet"
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3238.233588902818!2d-5.834556!3d35.745063!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzXCsDQ0JzQyLjIiTiA1wrA1MCcwNC40Ilc!5e0!3m2!1sfr!2sma!4v1759144414915!5m2!1sfr!2sma"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="text-center p-6">
              <h3 className="text-xl font-semibold text-primary mb-2">
                Notre localisation
              </h3>
              <p className="text-muted-foreground">
                AV. Royaume Arabie Saoudite, Rés. Al Azizia Appart 22, 3e étage — TANGER
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-[#235f8f] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge className="mb-6 bg-accent/20 text-accent">Réponse rapide</Badge>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Une question ? Un projet ?
            </h2>

            <p className="text-base sm:text-xl mb-6 sm:mb-8 text-white/90">
              Notre équipe vous répond sous 24h et vous propose un diagnostic de vos besoins.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a href="tel:+212663628668" aria-label="Appeler le cabinet">
                <Button variant="accent" size="xl" className="w-full sm:w-auto">
                  <Phone className="mr-2" />
                  +212 663628668
                </Button>
              </a>

              <a href="mailto:cabinetrenov@gmail.com" aria-label="Envoyer un email">
                <Button
                  variant="outline"
                  size="xl"
                  className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <Mail className="mr-2" />
                  cabinetrenov@gmail.com
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
