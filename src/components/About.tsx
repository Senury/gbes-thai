import { Button } from "@/components/ui/button";
import { CheckCircle, Shield, Eye, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();
  const securityFeatures = t("about.features", { returnObjects: true }) as string[];
  const cards = t("about.cards", { returnObjects: true }) as Array<{
    title: string;
    description: string;
  }>;
  const cardIcons = [Shield, Eye, FileText];

  return (
    <section id="trust" className="py-20 bg-section-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              {t("about.title")}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t("about.description")}
            </p>
            
            <div className="space-y-4 mb-8">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <Button variant="hero" size="lg">
              {t("about.cta")}
            </Button>
          </div>

          <div className="space-y-6">
            {cards.map((card, index) => {
              const Icon = cardIcons[index];
              return (
                <div key={card.title} className="rounded-2xl border border-border bg-card/80 p-6 shadow-soft">
                  <div className="bg-background/70 rounded-xl p-4 border border-border text-center">
                    <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      {card.title}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
