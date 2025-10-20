import { Hand } from "lucide-react";

 const WhatsAppButton = () => {
  // Message sans emoji pour éviter tout problème d'encodage
  const message = encodeURIComponent(
    "Bonjour, je souhaite recevoir votre plaquette de formations."
  );

  return (
    <a
      href={`https://wa.me/212663628668?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-5 right-5 z-50"
    >
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform duration-300 hover:scale-110">
        {/* Icône WhatsApp centrée */}
        <img
          src="/whatssap.png"
          alt="WhatsApp"
          className="h-7 w-7 select-none pointer-events-none"
        />

        {/* Petite main animée au-dessus de l'icône */}
        <span className="absolute -top-2 right-0 animate-bounce text-white">
          <Hand className="h-4 w-4" />
        </span>

        {/* Onde pulsante */}
        <span
          className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366]/50 animate-ping"
          aria-hidden="true"
        />
      </span>
    </a>
  );
};

export default WhatsAppButton;