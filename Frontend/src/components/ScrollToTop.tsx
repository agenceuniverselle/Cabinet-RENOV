import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Défilement en haut de la page à chaque changement de route
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null; // Ce composant n'affiche rien
};

export default ScrollToTop;
