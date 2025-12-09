import { useEffect } from "react";
import Navigation from "@/components/en/Navigation";
import Hero from "@/components/en/Hero";
import Mission from "@/components/en/Mission";
import Features from "@/components/en/Features";
import Pricing from "@/components/en/Pricing";
import Partners from "@/components/en/Partners";
import About from "@/components/en/About";
import Contact from "@/components/en/Contact";
import Footer from "@/components/en/Footer";
import ExportImportChat from "@/components/en/ExportImportChat";

const English = () => {
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