import { Button } from "@/components/ui/button";
import { ArrowRight, Play, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t, i18n } = useTranslation();
  const localePrefix = i18n.language === "ja" ? "ja" : i18n.language === "th" ? "th" : "en";
  const stats = t("hero.stats", { returnObjects: true }) as Array<{ label: string; value: string }>;
  const benefits = t("mission.benefits", { returnObjects: true }) as string[];
  const titleSuffix = t("hero.titleSuffix");

  const handleScrollToServices = () => {
    const servicesSection = document.getElementById("services");
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-start lg:items-center overflow-hidden bg-hero-surface pt-24 md:pt-28 lg:pt-0">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 sm:gap-12 lg:gap-16 items-start lg:items-center py-4 sm:py-8 lg:py-0">
          <div className="animate-fade-in-up space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-foreground mb-6">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {t("hero.badge")}
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-foreground mb-6 tracking-tight">
              {t("hero.titlePrefix")}{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                {t("hero.titleHighlight")}
              </span>
              {titleSuffix ? ` ${titleSuffix}` : null}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              {t("hero.description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Button variant="cta" size="xl" className="group" asChild>
                <Link to={`/${localePrefix}/signup`} className="inline-flex items-center">
                  {t("hero.ctaPrimary")}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="glass" size="lg" className="group" onClick={handleScrollToServices}>
                <Play className="mr-2 h-4 w-4" />
                {t("hero.ctaSecondary")}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-border bg-card/80 px-4 py-4 shadow-soft">
                  <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative w-full max-w-[560px] md:max-w-[680px] mx-auto lg:mx-0 lg:justify-self-end">
            <div className="rounded-[32px] border border-border bg-[linear-gradient(140deg,#f8fafc,rgba(15,23,42,0.04))] p-6 sm:p-7 lg:p-8 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.7)]">
              <div className="space-y-5 sm:space-y-6">
                <div className="overflow-hidden rounded-[26px] border border-border bg-background shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                  <img
                    src={heroImage}
                    alt="GBES platform preview"
                    className="h-[220px] sm:h-[300px] lg:h-[360px] w-full object-cover"
                  />
                </div>

                <div className="rounded-2xl border border-border bg-background/90 px-4 py-4 sm:px-5 sm:py-5">
                  <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    {t("hero.panelHighlightsLabel")}
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-foreground">
                    {benefits.slice(0, 3).map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-l-2 border-primary/60 pl-3 text-sm leading-relaxed text-foreground">
                  {t("hero.note")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 hidden lg:flex transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
