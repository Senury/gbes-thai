
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Globe, Scale } from "lucide-react";
import { useTranslation } from "react-i18next";

const Partners = () => {
  const { t } = useTranslation();
  const partners = t("partners.items", { returnObjects: true }) as Array<{
    name: string;
    fullName: string;
    description: string;
  }>;
  const partnerIcons = [Shield, Globe, Scale];

  return (
    <section id="partners" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            {t("partners.title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("partners.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {partners.map((partner, index) => (
            <Card 
              key={index}
              className="group transition-all duration-300 bg-card/80 border-border hover:border-primary/40 hover:shadow-soft"
            >
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      {(() => {
                        const Icon = partnerIcons[index];
                        return <Icon className="h-6 w-6 text-primary" />;
                      })()}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {partner.name}
                    </h3>
                    <h4 className="text-lg text-primary mb-3">
                      {partner.fullName}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {partner.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
