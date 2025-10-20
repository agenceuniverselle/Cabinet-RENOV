import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Eye,
  Heart,
  Users,
  TrendingUp,
  Award,
  CheckCircle,
  Star,
  Lightbulb,
  Compass,
  ArrowRight
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const About = () => {
   const location = useLocation();
  const navigate = useNavigate();

  //⚙️ Scroll automatique quand on arrive avec { state: { scrollTo: "<id>" } }
  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!target) return;

    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });

      // Nettoie l'état APRÈS avoir lancé le scroll, pour éviter le re-scroll
      const t = setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 300);

      return () => clearTimeout(t);
    });

    return () => cancelAnimationFrame(raf);
  }, [location.pathname, location.state, navigate]);

  const values = [
    {
      icon: Target,
      title: "Excellence",
      description:
        "Nous visons l'excellence dans chaque formation, avec des contenus de haute qualité et une approche personnalisée."
    },
    {
      icon: Heart,
      title: "Engagement",
      description:
        "Nous nous engageons à accompagner nos clients jusqu'à l'atteinte de leurs objectifs de développement."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description:
        "Nous intégrons les dernières innovations pédagogiques pour maximiser l'impact de nos formations."
    },
    {
      icon: Users,
      title: "Proximité",
      description:
        "Nous privilégions une relation de confiance et un accompagnement sur-mesure avec chaque client."
    }
  ];

  const team = [
    {
      role: "Formateur Senior",
      expertise: "Gestion des Ressources Humaines",
      experience: "25 ans d'expérience"
    },
    {
      role: "Coach",
      expertise: "Gestion de Carrière & Développement Personnel",
      experience: "Plus de 10 ans d'expérience"
    },
    {
      role: "Formateur Senior",
      expertise: "Management de la Qualité",
      experience: "Plus de 10 ans d'expérience"
    },
    {
      role: "Formateur Senior",
      expertise: "Production Pharmaceutique & Qualification du Personnel",
      experience: "Plus de 20 ans d'expérience"
    },
    {
      role: "Formateur Senior",
      expertise: "Maintenance Industrielle & GMAO",
      experience: "Plus de 12 ans d'expérience"
    },
    {
      role: "Formateur Senior",
      expertise: "Organisation & Optimisation des Processus",
      experience: "Plus de 10 ans d'expérience"
    },
    {
      role: "Formateur Senior",
      expertise: "Gestion Commerciale & Techniques de Vente",
      experience: "Plus de 20 ans d'expérience"
    },
    {
      role: "Experts BTP",
      expertise: "Interventions Bâtiment & Travaux Publics",
      experience: "Plus de 15 ans d'expérience"
    }
  ];

  const achievements = [
    "Expertise et pédagogie au service de vos compétences",
    "Partenaire de confiance pour de nombreuses entreprises",
    "Plus de 200 professionnels formés avec succès",
    "Taux de satisfaction supérieur à 85%",
    "Présence multi-secteurs au Maroc"
  ];

  return (
    <main className="min-h-screen">
      {/* Hero léger (sans image) */}
      <section
        className="relative overflow-hidden bg-gradient-to-r from-[#235f8f] to-[#2f7bb2] text-white"
        aria-label="À propos de RENOV"
      >
        <div className="absolute inset-0 opacity-15 pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
        </div>
      </section>

      {/* Mission, Vision, Philosophie */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Mission */}
            <Card
              className="
                shadow-elegant transition-smooth
                hover:shadow-[0_4px_20px_#7babd0]
                hover:translate-y-[-3px] hover:bg-[#7babd0]/5
              "
            >
              <CardContent className="p-8 text-center">
                <div className="h-20 w-20 mx-auto mb-6 flex items-center justify-center">
                  <Compass className="h-16 w-16 text-[#7babd0]" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4 hover:text-[#7babd0] transition-colors">
                  Notre Mission
                </h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  Accompagner dirigeants, équipes et entrepreneurs avec des
                  formations certifiantes adaptées au marché, des programmes
                  sur-mesure et du consulting stratégique.
                </p>
              </CardContent>
            </Card>

            {/* Vision */}
            <Card
              className="
                shadow-elegant transition-smooth
                hover:shadow-[0_4px_20px_#7babd0]
                hover:translate-y-[-3px] hover:bg-[#7babd0]/5
              "
            >
              <CardContent className="p-8 text-center">
                <div className="h-20 w-20 mx-auto mb-6 flex items-center justify-center">
                  <Eye className="h-16 w-16 text-[#7babd0]" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4 hover:text-[#7babd0] transition-colors">
                  Notre Vision
                </h3>
                <p className="text-muted-foreground whitespace-pre-line whitespace-pre-line">
                  Transformer les compétences en leviers de performance durable.<br /> 
Chaque talent peut révéler son plein potentiel.
                </p>
              </CardContent>
            </Card>

            {/* Philosophie */}
            <Card
              className="
                shadow-elegant transition-smooth
                hover:shadow-[0_4px_20px_#7babd0]
                hover:translate-y-[-3px] hover:bg-[#7babd0]/5
              "
            >
              <CardContent className="p-8 text-center">
                <div className="h-20 w-20 mx-auto mb-6 flex items-center justify-center">
                  <Lightbulb className="h-16 w-16 text-[#7babd0]" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4 hover:text-[#7babd0] transition-colors">
                  Notre Philosophie
                </h3>
                <p className="text-muted-foreground whitespace-pre-line whitespace-pre-line">
                  Dans un monde en évolution, la formation est stratégique,
                  personnalisée et mesurable<br /> 
une nécessité, pas une option.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-12 sm:py-16 section-subtle" aria-label="Nos valeurs">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4 bg-accent/10 text-accent">Nos Valeurs</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
              Ce qui nous guide au quotidien
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {values.map((item, idx) => (
              <Card
                key={idx}
                className="group h-full shadow-soft hover-lift border-0 bg-card/80 backdrop-blur"
              >
                <CardContent className="p-6 text-center h-full flex flex-col items-center">
                  <div
                    className="
                      w-14 h-14 rounded-full flex items-center justify-center mb-4
                      bg-[hsl(var(--accent)_/_0.15)] group-hover:bg-[hsl(var(--accent))]
                      transition-smooth
                    "
                  >
                    <item.icon
                      className="
                        h-7 w-7 text-[hsl(var(--accent))] group-hover:text-[hsl(var(--primary-foreground))]
                      "
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Équipe */}
      <section className="py-12 sm:py-16" aria-label="Notre équipe">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <Badge
              className="
                mb-4 bg-[hsl(var(--accent)_/_0.12)]
                text-[hsl(var(--accent))] border border-[hsl(var(--accent)_/_0.25))]
              "
            >
              Notre Équipe
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4">
              Des experts à votre service
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Une équipe pluridisciplinaire d’experts passionnés, unis par la
              volonté de faire progresser nos clients vers l’excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {team.map((member, idx) => (
              <Card key={idx} className="shadow-elegant hover-lift h-full">
                <CardContent className="p-6 text-center flex flex-col h-full">
                  <Users className="h-10 w-10 mx-auto mb-4 text-[#7babd0]" aria-hidden="true" />
                  <p className="text-accent font-medium mb-1">{member.role}</p>
                  <p className="text-sm text-muted-foreground mb-3">{member.expertise}</p>
                  <Badge variant="secondary" className="text-[11px] self-center">
                    {member.experience}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Réalisations */}
      <section className="py-12 sm:py-16 section-subtle" aria-label="Nos réalisations">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4 bg-accent/10 text-accent">Nos Réalisations</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
              Des résultats qui parlent
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {achievements.map((ach, idx) => (
              <Card key={idx} className="shadow-soft hover-lift">
                <CardContent className="p-6 flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-accent flex-shrink-0" aria-hidden="true" />
                  <p className="text-muted-foreground whitespace-pre-line">{ach}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-[#235f8f] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 sm:h-6 sm:w-6 text-accent fill-current mr-1" aria-hidden="true" />
              ))}
              <span className="ml-2 text-sm sm:text-lg font-semibold">Excellence reconnue</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Rejoignez nos clients satisfaits
            </h2>

            <p className="text-base sm:text-xl mb-6 sm:mb-8 text-white/90">
              Découvrez comment RENOV peut transformer vos compétences en avantage concurrentiel.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a href="/contact#formulaire-contact" aria-label="Demander un devis">
                <Button variant="accent" size="xl" className="w-full sm:w-auto">
                  Demander un devis
                  <ArrowRight className="ml-2" />
                </Button>
              </a>

              <Link to="/formations" aria-label="Voir nos formations">
                <Button
                  variant="outline"
                  size="xl"
                  className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  Voir nos formations
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;