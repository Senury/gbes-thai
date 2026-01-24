import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();
  const cards = t("contact.cards", { returnObjects: true }) as Array<{
    title: string;
    info: string;
    description: string;
  }>;
  const cardIcons = [Mail, Phone, MapPin];

  return (
    <section id="contact" className="py-20 bg-section-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            {t("contact.title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("contact.subtitle")}
          </p>
          <p className="text-sm text-primary/70 mt-4 max-w-2xl mx-auto">
            {t("contact.note")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12">
          <Card className="bg-card/80 border-border">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-foreground">
                  {t("contact.formTitle")}
                </h3>
                <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {t("contact.responseTime")}
                </div>
              </div>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t("contact.labels.firstName")}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      placeholder={t("contact.placeholders.firstName")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t("contact.labels.lastName")}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      placeholder={t("contact.placeholders.lastName")}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("contact.labels.email")}
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder={t("contact.placeholders.email")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("contact.labels.message")}
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                    placeholder={t("contact.placeholders.message")}
                  />
                </div>
                <Button variant="cta" size="lg" className="w-full group">
                  {t("contact.submit")}
                  <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {cards.map((card, index) => {
              const Icon = cardIcons[index];
              return (
                <Card key={card.title} className="bg-card/80 border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{card.title}</h4>
                        <p className="text-muted-foreground text-sm">{card.info}</p>
                        <p className="text-xs text-muted-foreground mt-2">{card.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
