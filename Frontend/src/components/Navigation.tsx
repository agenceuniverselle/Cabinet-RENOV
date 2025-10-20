import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Facebook, Linkedin, Instagram } from "lucide-react";

type NavItem = {
  name: string;
  href: string;       // route
  sectionId: string;  // id de la section sur la page cible
};

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation: NavItem[] = [
    { name: "Accueil",        href: "/",            sectionId: "hero-acceuil" },
    { name: "Nos Formations", href: "/formations",  sectionId: "section-formations" },
    { name: "Témoignages",    href: "/testimonials",sectionId: "section-temoignages" },
    { name: "À propos",       href: "/about",       sectionId: "section-a-propos" },
    { name: "Contact",        href: "/contact",     sectionId: "formulaire-contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Va à la route ciblée puis scrolle vers l'ancre. Si on est déjà sur la route, scroll direct.
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

    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      {/* Topbar: réseaux sociaux + téléphone */}
      <div className="w-full border-b border-border/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between">
          {/* Réseaux sociaux */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://www.facebook.com/cabinetrenov?rdid=XKmvlWUloIx5Of99&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F17Qr3Panwt%2F#"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-blue-50 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4 text-blue-600" />
            </a>
            <a
              href="https://www.linkedin.com/in/cabinet-renov?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-blue-50 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4 text-blue-700" />
            </a>
            <a
              href="https://www.instagram.com/cabinetrenov/?igsh=MTdlYWk3NWRnMnFqdA%3D%3D#"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-pink-50 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4 text-pink-600" />
            </a>
            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@cabinetrenov?_t=ZS-909lLLS2L3g&_r=1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              aria-label="TikTok"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 448 512"
                fill="currentColor"
              >
                <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.29V349.4a162.88,162.88,0,1,1-139.53-161.06v82.1a81.27,81.27,0,1,0,56.65,77.28V0h83.53A126.61,126.61,0,0,0,448,125.68Z"/>
              </svg>
            </a>
            {/* YouTube */}
            <a
              href="https://www.youtube.com/@cabinetrenov"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-red-50 transition-colors"
              aria-label="YouTube"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-red-600"
                viewBox="0 0 576 512"
                fill="currentColor"
              >
                <path d="M549.65 124.08A68.37 68.37 0 00506.72 80C460.76 64 288 64 288 64s-172.76 0-218.72 16a68.37 68.37 0 00-42.93 44.08C16 170.41 16 256 16 256s0 85.59 10.35 131.92a68.37 68.37 0 0042.93 44.08C115.24 448 288 448 288 448s172.76 0 218.72-16a68.37 68.37 0 0042.93-44.08C560 341.59 560 256 560 256s0-85.59-10.35-131.92zM232 336V176l142.48 80z"/>
              </svg>
            </a>
          </div>

          {/* Téléphone (desktop) */}
          <a
            href="tel:+212663628668"
            className="hidden sm:flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#235f8f]">
              <Phone className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="font-medium">+212 663 628 668</span>
          </a>
        </div>
      </div>

      {/* Navbar principale */}
      <nav className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-smooth m-0 p-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo cliquable (retour à l'ancre Accueil de la Home) */}
            <Link to="/" className="flex items-center gap-2" onClick={goToSection("/", "hero-acceuil")}>
              <img
                src="/favicon.png"
                alt="Logo"
                className="h-22 w-32 block -mb-0 transition-transform duration-300 hover:scale-105 hover:drop-shadow-[0_8px_22px_hsl(var(--accent)_/_0.35)]"
              />
            </Link>

            {/* Navigation desktop */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={goToSection(item.href, item.sectionId)}
                  className={[
                    "text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "text-primary border-b-2 border-[hsl(var(--accent))] pb-1"
                      : "text-muted-foreground hover:text-foreground"
                  ].join(" ")}
                >
                  {item.name}
                </Link>
              ))}

              {/* CTA vers la section Formations (sur /formations) */}
              <Link to="/formations" onClick={goToSection("/formations", "section-formations")}>
                <Button
                  size="sm"
                  className="shadow-accent bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent-dark))]"
                >
                  Découvrir nos formations
                </Button>
              </Link>
            </div>

            {/* Bouton menu mobile */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Ouvrir/fermer le menu"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Menu mobile */}
          {isOpen && (
            <div className="md:hidden border-t border-border pb-6 animate-fade-in-up">
              {/* Téléphone (mobile) */}
              <div className="flex items-center justify-between py-3">
                <a
                  href="tel:+212663628668"
                  className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#235f8f]">
                    <Phone className="h-3.5 w-3.5 text-white" />
                  </span>
                  <span className="font-medium">+212 663 628 668</span>
                </a>

                <div className="flex items-center gap-2">
                  <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <Facebook className="h-5 w-5 text-blue-600" />
                  </a>
                  <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <Linkedin className="h-5 w-5 text-blue-700" />
                  </a>
                  <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <Instagram className="h-5 w-5 text-pink-600" />
                  </a>
                  <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 448 512" fill="currentColor">
                      <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.29V349.4a162.88,162.88,0,1,1-139.53-161.06v82.1a81.27,81.27,0,1,0,56.65,77.28V0h83.53A126.61,126.61,0,0,0,448,125.68Z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.youtube.com/@cabinetrenov"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 576 512" fill="currentColor">
                      <path d="M549.65 124.08A68.37 68.37 0 00506.72 80C460.76 64 288 64 288 64s-172.76 0-218.72 16a68.37 68.37 0 00-42.93 44.08C16 170.41 16 256 16 256s0 85.59 10.35 131.92a68.37 68.37 0 0042.93 44.08C115.24 448 288 448 288 448s172.76 0 218.72-16a68.37 68.37 0 0042.93-44.08C560 341.59 560 256 560 256s0-85.59-10.35-131.92zM232 336V176l142.48 80z"/>
                    </svg>
                  </a>
                </div>
              </div>

              <div className="mt-2 space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={goToSection(item.href, item.sectionId)}
                    className={[
                      "block text-sm font-medium",
                      isActive(item.href) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    ].join(" ")}
                  >
                    {item.name}
                  </Link>
                ))}

                <Link to="/formations" onClick={goToSection("/formations", "section-formations")}>
                  <Button className="w-full shadow-accent bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent-dark))]">
                    Découvrir nos formations
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
