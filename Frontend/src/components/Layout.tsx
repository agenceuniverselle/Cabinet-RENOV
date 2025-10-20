// src/components/Layout.tsx
import { Outlet } from "react-router-dom";

import WhatsAppButton from "@/pages/WhatsAppButton";
import Navigation from "./Navigation";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Outlet /> {/* <-- c'est ici que les pages publiques s'affichent */}
      </main>
 {/* <WhatsAppButton /> */} {/* 🔹 Désactivé temporairement */}
      <Footer />
    </div>
  );
};

export default Layout;
