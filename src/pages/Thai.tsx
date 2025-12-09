import { useEffect } from "react";
import Navigation from "@/components/th/Navigation";
import Hero from "@/components/th/Hero";
import Mission from "@/components/th/Mission";
import Features from "@/components/th/Features";
import Pricing from "@/components/th/Pricing";
import Partners from "@/components/th/Partners";
import About from "@/components/th/About";
import Contact from "@/components/th/Contact";
import Footer from "@/components/th/Footer";
import ExportImportChat from "@/components/th/ExportImportChat";

const Thai = () => {
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

export default Thai;
