import { Card, CardContent } from "@/components/ui/card";
import { Languages, Megaphone, Users, CreditCard, Bot, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

const Features = () => {
  const { t } = useTranslation();
  const items = t("features.items", { returnObjects: true }) as Array<{
    title: string;
    description: string;
  }>;
  const icons = [Languages, Megaphone, Search, CreditCard, Bot, Users];
  const features = items.map((item, index) => ({
    ...item,
    icon: icons[index],
  }));

  return (
    <section id="services" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            {t("features.title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group transition-all duration-300 bg-card/80 border-border hover:border-primary/40 hover:shadow-soft"
            >
              <CardContent className="p-6">
                <div className="mb-5 flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 border border-primary/20">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
