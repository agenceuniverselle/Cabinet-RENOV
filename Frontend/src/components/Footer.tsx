import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Linkedin,
  Instagram,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const goToSection = (path: string, sectionId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const scrollToEl = () => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    if (location.pathname === path) {
      scrollToEl();
    } else {
      navigate(path, { state: { scrollTo: sectionId } });
    }
  };

  return (
    <footer className="bg-[#235f8f] text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Link
                to="/"
                onClick={goToSection("/", "hero-acceuil")}
                className="flex items-center gap-2 group transition-transform duration-300"
                aria-label="Retour à l’accueil (section héros)"
              >
                <img
                  src="/logo.png"
                  alt="RENOV Logo"
                  className="h-16 w-16 object-contain transition-transform duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_8px_22px_rgba(255,255,255,0.3)]"
                />
              </Link>
              <span className="text-xl font-bold group-hover:text-accent transition-colors">
                Formation Professionnelle
              </span>
            </div>

            <p className="text-sm text-primary-foreground/80">
              Ensemble, développons vos compétences. Cabinet de formation professionnelle
              accompagnant dirigeants, équipes et entrepreneurs.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" onClick={goToSection("/", "hero-acceuil")} className="text-primary-foreground/80 hover:text-accent transition-colors">Accueil</Link></li>
              <li><Link to="/about" onClick={goToSection("/about", "section-a-propos")} className="text-primary-foreground/80 hover:text-accent transition-colors">À propos</Link></li>
              <li><Link to="/formations" onClick={goToSection("/formations", "section-formations")} className="text-primary-foreground/80 hover:text-accent transition-colors">Nos Formations</Link></li>
              <li><Link to="/testimonials" onClick={goToSection("/testimonials", "section-temoignages")} className="text-primary-foreground/80 hover:text-accent transition-colors">Témoignages</Link></li>
              <li><Link to="/contact" onClick={goToSection("/contact", "formulaire-contact")} className="text-primary-foreground/80 hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Nos Services</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>Formations certifiantes</li>
              <li>Programmes sur-mesure</li>
              <li>Consulting stratégique</li>
              <li>Développement personnel</li>
              <li>Management & Leadership</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2 text-primary-foreground/80">
                <Phone className="h-4 w-4" />
                <span>+212 663628668</span>
              </li>
              <li className="flex items-center space-x-2 text-primary-foreground/80">
                <Mail className="h-4 w-4" />
                <span>cabinetrenov@gmail.com</span>
              </li>
              <li className="flex items-start space-x-2 text-primary-foreground/80">
                <MapPin className="h-5 w-5 mt-1" />
                <span>AV. Royaume Arabie Saoudite, Rés. Al Azizia Appart 22, 3éme étage — TANGER, Maroc</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 🔹 Bloc Informations légales */}
        <div className="border-t border-primary-foreground/20 mt-10 pt-6 text-sm text-primary-foreground/80 flex flex-col sm:flex-row gap-4 sm:justify-center text-center">
          <Link to="/mentions-legales" className="hover:text-accent transition-colors">Mentions légales</Link>
          <span className="hidden sm:inline">•</span>
          <Link to="/politique-de-confidentialite" className="hover:text-accent transition-colors">Politique de confidentialité</Link>
          <span className="hidden sm:inline">•</span>
          <Link to="/politique-des-cookies" className="hover:text-accent transition-colors">Politique des cookies</Link>
        </div>

        {/* Bas de page */}
        <div className="border-t border-primary-foreground/20 mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/80 text-center sm:text-left">
            &copy; {new Date().getFullYear()} Cabinet RENOV. Tous droits réservés.
          </p>

          {/* Réseaux sociaux */}
          <div className="flex items-center space-x-2">
            <a href="https://www.facebook.com/cabinetrenov" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="hover:text-blue-600 hover:bg-blue-50" title="Facebook">
                <Facebook className="h-5 w-5" />
              </Button>
            </a>
            <a href="https://www.linkedin.com/in/cabinet-renov" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="hover:text-blue-700 hover:bg-blue-50" title="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </Button>
            </a>
            <a href="https://www.instagram.com/cabinetrenov" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="hover:text-pink-600 hover:bg-pink-50" title="Instagram">
                <Instagram className="h-5 w-5" />
              </Button>
            </a>
            <a href="https://www.youtube.com/@cabinetrenov" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="hover:text-red-600 hover:bg-red-50" title="YouTube">
                <Youtube className="h-5 w-5" />
              </Button>
            </a>
            {/* TikTok */}
<a
  href="https://www.tiktok.com/@cabinetrenov?_t=ZS-909lLLS2L3g&_r=1"
  target="_blank"
  rel="noopener noreferrer"
>
  <Button
    variant="ghost"
    size="icon"
    className="hover:text-pink-600 hover:bg-pink-50"
    title="TikTok"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 448 512"
      fill="currentColor"
    >
      <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.29V349.4a162.88,162.88,0,1,1-139.53-161.06v82.1a81.27,81.27,0,1,0,56.65,77.28V0h83.53A126.61,126.61,0,0,0,448,125.68Z"/>
    </svg>
  </Button>
</a>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
