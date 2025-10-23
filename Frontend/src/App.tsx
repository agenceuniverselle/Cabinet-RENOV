// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { DashboardLayout } from "@/components/layout/DashboardLayout";

import Home from "@/pages/Home";
import About from "@/pages/About";
import Formations from "@/pages/Formations";
import Testimonials from "@/pages/Testimonials";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";

import Index from "@/pages";
import Courses from "@/pages/Courses";
import Students from "@/pages/Students";
import Instructors from "@/pages/Instructors";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Layout from "./components/Layout";
import Login from "@/pages/Login";
import ContactMessages from "@/pages/ContactMessages";
import ScrollToTop from "./components/ScrollToTop";
import Categories from "./pages/Categories";
// ✅ Ajout des pages légales
import MentionsLegales from "@/pages/MentionsLegales";
import PolitiqueConfidentialite from "@/pages/PolitiqueConfidentialite";
import Cookies from "@/pages/Cookies";
import TrashView from "./pages/TrashView";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
      <ScrollToTop />
        <Routes>
          {/* --- Branche PUBLIC --- */}
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="formations" element={<Formations />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="contact" element={<Contact />} />
                 {/* ✅ Pages légales */}
            <Route path="mentions-legales" element={<MentionsLegales />} />
            <Route path="politique-de-confidentialite" element={<PolitiqueConfidentialite />} />
            <Route path="politique-des-cookies" element={<Cookies />} />
            {/* 404 publique */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* --- Branche DASHBOARD --- */}
          <Route path="/dashboard/*" element={<DashboardLayout />}>
            <Route path="index" element={<Index />} />
            <Route path="courses" element={<Courses />} />
            <Route path="students" element={<Students />} />
            <Route path="instructors" element={<Instructors />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="messages" element={<ContactMessages />} />
            <Route path="categories" element={<Categories />} />
            <Route path="trash" element={<TrashView />} />
            {/* 404 interne au dashboard */}
            <Route path="*" element={<NotFound />} />
          </Route>
                      <Route path="/Renov-login@2025" element={<Login />} />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
< Test webhook Thu Oct 23 08:15:12 UTC 2025 -->
< Test webhook Thu Oct 23 08:50:32 UTC 2025 -->
