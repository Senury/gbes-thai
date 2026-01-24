import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Mission from "@/components/Mission";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import Partners from "@/components/Partners";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ExportImportChat from "@/components/ExportImportChat";

const English = () => {
  const { i18n } = useTranslation();

  // Handle URL hash scrolling on page load
  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    };

    // Check hash on initial load
    handleHashScroll();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashScroll);
    
    return () => {
      window.removeEventListener('hashchange', handleHashScroll);
    };
  }, []);

  useEffect(() => {
    i18n.changeLanguage("en");
  }, [i18n]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Mission />
      <Features />
      <Pricing />
      <Partners />
      <About />
      <Contact />
      <Footer />
      <ExportImportChat />
    </div>
  );
};

export default English;
