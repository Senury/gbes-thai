import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/70" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Global Business System
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          An AI-powered, multi-functional platform supporting global expansion for Japanese SMEs.<br />
          Comprehensive support from translation to digital distribution and partner discovery.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center max-w-xl mx-auto">
          <Button
            variant="cta"
            size="xl"
            className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 shadow-lg hover:shadow-xl transition-all duration-300 whitespace-normal leading-snug"
          >
            Register Now and Connect with the World
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 whitespace-normal leading-snug"
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
