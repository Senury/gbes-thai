import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, Eye, FileText } from "lucide-react";

const About = () => {
  const securityFeatures = [
    {
      icon: CheckCircle,
      title: "ISO Certification Planned",
      description: "Pursuing international information security standards"
    },
    {
      icon: Shield,
      title: "Data Protection",
      description: "Advanced encryption and secure data handling protocols"
    },
    {
      icon: Eye,
      title: "Complete Transparency",
      description: "Clear data usage policies and transparent business practices"
    },
    {
      icon: FileText,
      title: "Legal Compliance",
      description: "Adherence to domestic and international laws and regulations"
    }
  ];

  const trustCards = [
    {
      title: "ISO Certification Compliance",
      description: "Committed to achieving international information security standards"
    },
    {
      title: "Complete Transparency",
      description: "Full visibility into data usage and business operations"
    },
    {
      title: "Legal Compliance",
      description: "Strict adherence to all applicable laws and regulations"
    }
  ];

  return (
    <section id="about" className="py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Safety and Trust
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            GBES is committed to the highest standards of data protection, transparency, and legal compliance. 
            Your business information and international expansion efforts are secured with enterprise-grade protection.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {securityFeatures.map((feature, index) => (
            <Card key={index} className="bg-card border-border text-center hover:bg-card/80 hover:border-primary/20 transition-all duration-300 group">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors duration-300">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mb-12">
          <Button size="lg" variant="outline" className="shadow-lg hover:shadow-xl transition-all duration-300">
            Security Details
          </Button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {trustCards.map((card, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-foreground text-center">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center leading-relaxed">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;