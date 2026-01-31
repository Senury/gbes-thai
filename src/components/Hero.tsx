import { Button } from "@/components/ui/button";
import { ArrowRight, Play, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t, i18n } = useTranslation();
  const localePrefix = i18n.language === "ja" ? "ja" : i18n.language === "th" ? "th" : "en";
  const stats = t("hero.stats", { returnObjects: true }) as Array<{ label: string; value: string }>;
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

          {/* Bento Grid Visual */}
          <div className="relative w-full max-w-[520px] mx-auto lg:mx-0 lg:justify-self-end">
            <div className="grid grid-cols-6 grid-rows-5 gap-3 h-[420px] sm:h-[480px]">

              {/* Globe/Map Card - Large */}
              <div className="col-span-4 row-span-3 rounded-3xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/20 p-5 relative overflow-hidden group">
                {/* Animated concentric circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute w-32 h-32 rounded-full border border-primary/20 animate-[ping_3s_ease-in-out_infinite]" />
                  <div className="absolute w-48 h-48 rounded-full border border-primary/10 animate-[ping_3s_ease-in-out_infinite_0.5s]" />
                  <div className="absolute w-64 h-64 rounded-full border border-primary/5 animate-[ping_3s_ease-in-out_infinite_1s]" />
                </div>

                {/* Connection dots */}
                <div className="absolute top-8 left-8 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <div className="absolute top-16 right-12 h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:0.3s]" />
                <div className="absolute bottom-20 left-16 h-2 w-2 rounded-full bg-amber-500 animate-pulse [animation-delay:0.6s]" />
                <div className="absolute bottom-12 right-8 h-2 w-2 rounded-full bg-emerald-500 animate-pulse [animation-delay:0.9s]" />
                <div className="absolute top-1/2 left-1/3 h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:1.2s]" />

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-2xl bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center shadow-lg">
                    <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                </div>

                {/* Label */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-xs font-medium text-primary/80 uppercase tracking-wider">Global Network</div>
                  <div className="text-sm text-foreground/70 mt-0.5">Thailand · Japan · SEA</div>
                </div>
              </div>

              {/* Live Activity Card */}
              <div className="col-span-2 row-span-2 rounded-2xl bg-card border border-border p-4 flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Live</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">847</div>
                  <div className="text-[10px] text-muted-foreground">Active now</div>
                </div>
              </div>

              {/* Languages Card */}
              <div className="col-span-2 row-span-1 rounded-2xl bg-card border border-border p-3 flex items-center gap-3">
                <div className="flex -space-x-1">
                  <div className="h-6 w-6 rounded-full bg-red-100 border-2 border-background flex items-center justify-center text-[10px]">🇯🇵</div>
                  <div className="h-6 w-6 rounded-full bg-blue-100 border-2 border-background flex items-center justify-center text-[10px]">🇹🇭</div>
                  <div className="h-6 w-6 rounded-full bg-slate-100 border-2 border-background flex items-center justify-center text-[10px]">🇺🇸</div>
                </div>
                <div className="text-xs text-muted-foreground">3 languages</div>
              </div>

              {/* NEXI Insurance Card */}
              <div className="col-span-3 row-span-2 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100/50 dark:from-blue-950/30 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/30 p-4 flex flex-col justify-between">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100">NEXI Backed</div>
                  <div className="text-xs text-blue-700/70 dark:text-blue-300/70">Trade insurance</div>
                </div>
              </div>

              {/* Quick Connect Card */}
              <div className="col-span-3 row-span-2 rounded-2xl bg-card border border-border p-4 flex flex-col justify-between group hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">Direct Chat</div>
                  <div className="text-xs text-muted-foreground">No middlemen</div>
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
