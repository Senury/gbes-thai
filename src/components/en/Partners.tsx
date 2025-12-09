
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Shield, Users, Scale, Handshake, Globe } from "lucide-react";

const Partners = () => {
  const partners = [
    {
      icon: Shield,
      name: "NEXI",
      fullName: "Nippon Export and Investment Insurance",
      description: "Providing insurance services for international trade and investment"
    },
    {
      icon: Users,
      name: "Chambers of Commerce",
      fullName: "Local Chambers & Municipal Governments",
      description: "Regional business support and administrative assistance for international expansion"
    },
    {
      icon: Scale,
      name: "Legal & Logistics Experts",
      fullName: "Professional Service Providers",
      description: "Practical support from legal and logistics specialists for international operations"
    }
  ];

  return (
    <section id="partners" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Partners & Support Organizations
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Collaborating with trusted institutions to provide comprehensive support for your international business expansion
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {partners.map((partner, index) => (
            <Card key={index} className="bg-card border-border hover:bg-card/80 hover:border-primary/20 transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <partner.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-foreground">{partner.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{partner.fullName}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{partner.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
