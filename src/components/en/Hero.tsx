import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-bg.jpg";
import { Link } from "react-router-dom";

const Hero = () => {
  const handleScrollToServices = () => {
    const servicesSection = document.getElementById("services");
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

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
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center max-w-2xl mx-auto">
          <Button
            variant="cta"
            size="xl"
            className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-7 shadow-lg hover:shadow-xl transition-all duration-300 whitespace-normal leading-snug"
            asChild
          >
            <Link to="/en/signup" className="inline-flex items-center">
              Register Now and Connect with the World
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-7 whitespace-normal leading-snug"
            onClick={handleScrollToServices}
          >
            Learn More
          </Button>
        </div>

        <div className="mt-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <div className="h-2 w-2 bg-primary rounded-full mr-2"></div>
            <span className="text-base font-medium text-foreground">Live • 1,234 users online</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
