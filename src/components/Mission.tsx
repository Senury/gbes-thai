import { Button } from "@/components/ui/button";
import { CheckCircle, Target, Shield, Globe2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const Mission = () => {
  const { t } = useTranslation();
  const benefits = t("mission.benefits", { returnObjects: true }) as string[];
  const highlights = t("mission.highlights", { returnObjects: true }) as Array<{
    title: string;
    description: string;
  }>;
  const highlightIcons = [Target, Shield, Globe2];

  return (
    <section id="mission" className="py-20 bg-section-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              {t("mission.title")}
            </h2>
            <h3 className="text-2xl md:text-3xl font-semibold text-foreground mb-8">
              {t("mission.subtitle")}
            </h3>
            
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            <Button variant="hero" size="lg">
              {t("mission.cta")}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {highlights.map((feature, index) => {
              const Icon = highlightIcons[index];
              return (
                <div
                  key={feature.title}
                  className={`rounded-2xl border border-border bg-card/80 p-6 shadow-soft ${index === 2 ? "md:col-span-2" : ""}`}
                >
                  <div className="rounded-xl p-4 bg-background/70 border border-border">
                    <Icon className="h-8 w-8 text-primary mb-3" />
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
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

export default Mission;
