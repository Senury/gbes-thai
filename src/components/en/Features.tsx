import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Languages, 
  Share2, 
  Bot, 
  FileCheck, 
  Presentation,
  Instagram,
  Facebook,
  MapPin,
  Twitter
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Languages,
      title: "Translation & Distribution Tools",
      description: "Support for Instagram, Facebook, Google Maps, X(Twitter), and more platforms with multilingual capabilities"
    },
    {
      icon: Bot,
      title: "AI Support",
      description: "Intelligent assistance for international trade inquiries and business guidance"
    },
    {
      icon: FileCheck,
      title: "Company Information Structuring & Review",
      description: "Systematic organization and verification of business information for international markets"
    },
    {
      icon: Presentation,
      title: "Presentation Features for Overseas Users",
      description: "Professional presentation tools designed for international business communication"
    }
  ];

  return (
    <section id="services" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Service Overview
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything startups need in one dashboard
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-card border-border hover:bg-card/80 hover:border-primary/20 transition-all duration-300 group"
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 text-sm text-muted-foreground bg-secondary/30 px-6 py-3 rounded-full">
            <span>Supported Platforms:</span>
            <Instagram className="h-4 w-4" />
            <Facebook className="h-4 w-4" />
            <MapPin className="h-4 w-4" />
            <Twitter className="h-4 w-4" />
            <span>and more</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;