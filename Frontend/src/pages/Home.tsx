import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Target,
  Users,
  TrendingUp,
  Award,
  CheckCircle,
  ArrowRight,
  Star,
  BarChart3
} from "lucide-react";
import heroImage from "@/assets/hero-training.jpg";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 🔁 Scroll automatique vers une ancre spécifique
  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!target) return;
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      const t = setTimeout(() => navigate(location.pathname, { replace: true, state: {} }), 300);
      return () => clearTimeout(t);
    });
    return () => cancelAnimationFrame(raf);
  }, [location.pathname, location.state, navigate]);

  const stats = [
    { icon: Users, label: "Participants formés", value: "200+" },
    { icon: Award, label: "Taux de satisfaction", value: "85%" },
    { icon: BarChart3, label: "Amélioration des performances", value: "80%" },
    { icon: GraduationCap, label: "Formations disponibles", value: "70+" },
  ];

  const features = [
    { icon: Target, title: "Analyse des besoins", description: "Identifier vos besoins réels et vos priorités stratégiques" },
    { icon: Users, title: "Programmes sur-mesure", description: "Formations adaptées à votre secteur et vos objectifs" },
    { icon: TrendingUp, title: "Méthodes innovantes", description: "80 % de pratique, 20 % de théorie pour un impact maximal" },
    { icon: Award, title: "Résultats mesurables", description: "Suivi post-formation et ajustements continus" }
  ];

  const sectors = [
    "Industrie & Agroalimentaire",
    "BTP & Construction",
    "Commerce & Distribution",
    "Éducation",
    "Laboratoires",
    "Marché privé et public",
  ];

  return (
    <main className="min-h-screen flex flex-col">
      {/* ✅ Hero Section */}
      <section
        id="hero-acceuil"
        className="relative flex items-center justify-center text-center overflow-hidden min-h-[80vh] sm:min-h-[85vh] lg:min-h-[calc(100vh-80px)]"
        aria-label="Présentation du cabinet de formation"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#235f8f]/70 to-[#235f8f]/80" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="mb-6 sm:mb-8 bg-accent text-accent-foreground animate-pulse">
            Cabinet de Formation Professionnelle
          </Badge>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6">
            Ensemble, développons vos{" "}
            <span className="block text-accent mt-1 sm:mt-2">compétences</span>
          </h1>
          <p className="text-base sm:text-lg md:text-2xl max-w-3xl mx-auto mb-8 text-white/90">
            Transformez vos compétences en leviers de performance durable avec nos formations certifiantes, programmes sur-mesure et consulting stratégique.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/formations">
              <Button variant="accent" size="xl" className="w-full sm:w-auto">
                <GraduationCap className="mr-2" /> Découvrir nos formations
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="xl" className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20">
                Demander un devis <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ✅ Stats Section */}
      <section className="py-12 sm:py-16 bg-[hsl(27_93%_65%_/_0.05)]" aria-label="Chiffres clés">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <Card key={i} className="text-center shadow-md hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 sm:p-8 flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[hsl(27_93%_65%_/_0.15)] rounded-full flex items-center justify-center mb-4">
                    <stat.icon className="h-6 w-6 text-[hsl(27_93%_65%)]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm sm:text-base text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ Features Section */}
      <section className="py-12 sm:py-20 bg-background" aria-label="Notre approche">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-[hsl(var(--accent)_/_0.12)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)_/_0.25)] rounded-full px-3 py-1">
              Notre Approche
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3">Une méthodologie éprouvée</h2>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Analyser • Concevoir • Réaliser • Évaluer
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-6 text-center flex flex-col items-center">
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[hsl(var(--accent)_/_0.15)] mb-5">
                    <f.icon className="h-7 w-7 text-[hsl(var(--accent))]" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ Secteurs d'excellence */}
      <section className="py-12 sm:py-16 bg-muted/10" aria-label="Secteurs d'excellence">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3">Secteurs d'excellence</h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Nous accompagnons des entreprises dans tous les secteurs
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
            {sectors.map((sector, i) => (
              <Card key={i} className="shadow-soft hover-lift border border-accent/20 transition-transform hover:-translate-y-1">
                <CardContent className="p-6 text-center flex flex-col items-center">
                  <CheckCircle className="h-8 w-8 text-accent mb-3" />
                  <h3 className="font-semibold text-primary text-base sm:text-lg">{sector}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ CTA Section */}
      <section className="py-16 sm:py-20 bg-[#235f8f] text-white text-center" aria-label="Appel à l'action">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center flex-wrap mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-accent fill-current mx-1" />
              ))}
              <span className="ml-2 text-base sm:text-lg font-semibold">85 % de satisfaction</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Prêt à développer vos compétences ?
            </h2>
            <p className="text-base sm:text-xl mb-6 text-white/90">
              Contactez-nous pour une analyse gratuite de vos besoins en formation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact#formulaire-contact">
                <Button variant="accent" size="xl" className="w-full sm:w-auto">
                  Demander une consultation <ArrowRight className="ml-2" />
                </Button>
              </a>
              <a href="/BROCHURE_RENOV.pdf" download>
                <Button
                  variant="outline"
                  size="xl"
                  className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  Télécharger notre brochure
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;