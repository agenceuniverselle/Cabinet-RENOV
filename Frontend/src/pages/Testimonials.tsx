import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Quote,
  Building2,
  Users,
  TrendingUp,
  Award,
  ArrowRight,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";


const Testimonials = () => {
  const location = useLocation();
const navigate = useNavigate();

useEffect(() => {
  const target = (location.state as { scrollTo?: string } | null)?.scrollTo;
  if (!target) return;

  // laisse le DOM se peindre puis scrolle
  const raf = requestAnimationFrame(() => {
    const el = document.getElementById(target);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });

    // nettoie l'état APRÈS avoir lancé le scroll pour éviter de re-scroller
    const t = setTimeout(() => {
      navigate(location.pathname, { replace: true, state: {} });
    }, 300);

    // cleanup du setTimeout
    return () => clearTimeout(t);
  });

  // cleanup du rAF si le composant unmount/re-render
  return () => cancelAnimationFrame(raf);
}, [location.pathname, location.state, navigate]);

  const testimonials = [
    {
      id: 1,
      name: "Abdelhak Halal",
      position: "formateur , entrepreneur ",
      sector: "Enseignement",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b5ff?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "J’ai suivi une formation en ligne sur la thématique de l’administration des affaires, qui a duré trois mois. C’était une expérience très intéressante : malgré la distance, nous avons pu tisser des relations et des échanges constructifs. J’ai pu assimiler les connaissances nécessaires pour bien démarrer mon projet.",
      formation: "Administration des affaires",
    },
    {
      id: 2,
      name: "Fatiha Misbah",
      position: "Responsable laboratoire,laboratoire de contrôle qualité",
      sector: "Controle qualité",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "J’ai découvert RENOV à travers une formation sur la qualification du personnel de laboratoire, organisée pour notre société. Le formateur était de grande qualité, et la formation nous a réellement apporté les compétences nécessaires, améliorant ainsi notre efficacité et notre réactivité.",
      formation: "La qualification du personnel de laboratoire",
    },
    {
      id: 3,
      name: "Mohamed Ali",
      position: "Etudiant en master en management qualité",
      sector: "Management qualité",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "En tant qu’étudiant en master, je suis très satisfait de la formation en management de la qualité, dispensée par Mme Karima du cabinet RENOV. Sa méthode pédagogique m’a permis de me projeter dans des situations réelles et son sens du partage a rendu l’expérience particulièrement enrichissante.",
      formation: "Management qualité",
    },
    {
      id: 4,
      name: "Houda Allaoui",
      position: "Cadre RH ",
      sector: "Ressources humaines",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "J’ai participé à une journée de formation organisée par le cabinet RENOV sur le leadership participatif. Ce fut un mélange riche d’informations, de mises en situation et de networking. Ce que j’ai le plus apprécié, c’est l’attention portée aux détails d’organisation, ce qui a rendu tous les participants pleinement satisfaits.",
      formation: "Le leadership participatif",
    },
  ];
  const getInitials = (fullName: string) => {
    const parts = fullName.split(" ");
    const initials = parts.map((p) => p[0]?.toUpperCase() || "").join("");
    return initials.slice(0, 2); // max 2 lettres
  };

  const clients = [
    { logo: "/sinmat.jpeg" },
    { logo: "/sintras.jpeg" },
    { logo: "/clever.jpeg" },
    { logo: "/enactus.jpeg" },
    { logo: "/consulting.jpeg" },
    { logo: "/saadi.jpeg" },
    { logo: "/atlas.jpeg" },
    { logo: "/valbiom.jpeg" },
    { logo: "/universelle.jpeg" },
  ];

  const stats = [
    { icon: Users, value: "200+", label: "Professionnels formés" },
    { icon: Building2, value: "15+", label: "Entreprises clientes" },
    { icon: Award, value: "85%", label: "Taux de satisfaction" },
    { icon: TrendingUp, value: "80%", label: "Amélioration performances" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen bg-[url('/temoi.jpeg')] bg-cover bg-top bg-no-repeat">
        {/* Overlay dégradé bleu */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#235f8f]/60 to-[#235f8f]/80"></div>

        {/* Contenu au centre */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ils nous font confiance
            </h1>
            <p
              className="text-xl text-white/90"
              style={{ animationDelay: "0.2s" }}
            >
              Découvrez les retours d'expérience de nos clients et les résultats
              concrets obtenus grâce à nos formations professionnelles.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="
            relative group
            before:content-['']
            before:absolute before:inset-0
            before:rounded-xl
            before:bg-orange-500
            before:opacity-0
            before:blur-xl
            before:transition-all before:duration-300
            hover:before:opacity-20
          "
              >
                <Card className="relative shadow-soft border-0 text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 accent-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                      <stat.icon className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section  className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent/10 text-accent">Témoignages</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
              Ce que disent nos clients
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Des retours authentiques qui témoignent de l'impact de nos
              formations sur la performance et le développement des équipes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.id}
                className="shadow-elegant hover-lift relative border border-gray-200"
              >
                <CardContent className="p-8">
                  <Quote className="h-8 w-8 text-[#7babd0] mb-4 " />

                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-accent fill-current"
                      />
                    ))}
                  </div>

                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.text}"
                  </p>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-[#7babd0] flex items-center justify-center text-white font-bold">
                      {getInitials(testimonial.name)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-primary">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.position}
                      </p>

                      <div className="mt-3 space-y-1">
                        <Badge variant="outline" className="text-xs">
                          {testimonial.formation}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Références clients */}
      <section className="py-20 section-subtle">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge
              className="
          mb-4
          bg-[hsl(var(--accent)_/_0.12)]
          text-[hsl(var(--accent))]
          border border-[hsl(var(--accent)_/_0.25)]
          rounded-full
          px-4 py-1
          text-sm font-medium tracking-wide
        "
            >
              Nos Références
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
              Plusieurs entreprises nous font confiance
            </h2>
            <p className="text-xl text-muted-foreground">
              De la startup au grand groupe, nous accompagnons tous types
              d'organisations
            </p>
          </div>

          {/* Références clients : mêmes espacements sur toutes les lignes */}
          <div className="flex flex-wrap justify-center gap-12">
            {clients.map((client, index) => (
              <Card
                key={index}
                className="shadow-soft border border-gray-200 hover-lift w-[160px]" // largeur fixe = espacement constant
              >
                <CardContent className="p-6 flex items-center justify-center h-[150px]">
                  <img
                    src={
                      client.logo.startsWith("/")
                        ? client.logo
                        : `/${client.logo}`
                    }
                    alt={`Logo ${client.logo}`}
                    className="h-[220px] w-[350px] object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/placeholder.svg";
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Témoignage */}
      <section className="py-20 bg-[#235f8f] text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-accent/20 text-accent">
                  Ils témoignent
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Votre succès sera notre prochaine référence
                </h2>
                <p className="text-xl text-primary-foreground/90 mb-8">
                  Rejoignez les entreprises qui ont fait le choix de
                  l'excellence avec RENOV et transformez vos compétences en
                  avantage concurrentiel.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="/contact#formulaire-contact">
                    <Button variant="accent" size="lg">
                      Demander un devis
                      <ArrowRight className="ml-2" />
                    </Button>
                  </a>

                  <a href="/formations">
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                    >
                      Voir nos formations
                    </Button>
                  </a>
                </div>
              </div>

              <Card className="shadow-elegant">
                <CardContent className="p-8">
                  <Quote className="h-8 w-8 text-accent mb-4" />
                  <p className="text-muted-foreground italic mb-6">
                    "RENOV a révolutionné notre approche de la formation. Des
                    résultats concrets, une équipe à l'écoute, une méthodologie
                    éprouvée. Nous recommandons sans hésitation."
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Testimonials;