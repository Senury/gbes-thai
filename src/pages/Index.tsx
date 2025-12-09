import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Mission from "@/components/Mission";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import Partners from "@/components/Partners";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";

const Index = () => {
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
      <FloatingCTA />
    </div>
  );
};

export default Index;
