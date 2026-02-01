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
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-hero-surface pt-20 sm:pt-24 md:pt-28 lg:pt-0">
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center py-6 sm:py-8 md:py-10 lg:py-0">
          <div className="animate-fade-in-up space-y-4 sm:space-y-6 md:space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-sm sm:text-base text-foreground mb-4 sm:mb-6">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {t("hero.badge")}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold text-foreground mb-4 sm:mb-5 md:mb-6 tracking-tight leading-tight">
              {t("hero.titlePrefix")}{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                {t("hero.titleHighlight")}
              </span>
              {titleSuffix ? ` ${titleSuffix}` : null}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-xl text-muted-foreground max-w-xl md:max-w-3xl lg:max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t("hero.description")}
            </p>

            <div data-testid="hero-buttons" className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:items-center lg:items-start lg:justify-start justify-center">
              <Button variant="cta" size="xl" className="group w-full sm:w-auto" asChild>
                <Link to={`/${localePrefix}/signup`} className="inline-flex items-center">
                  {t("hero.ctaPrimary")}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="glass" size="default" className="group w-[70%] mx-auto sm:mx-0 sm:w-auto sm:!h-14" onClick={handleScrollToServices}>
                <Play className="mr-2 h-4 w-4" />
                {t("hero.ctaSecondary")}
              </Button>
            </div>

            <div data-testid="stats-grid" className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-xl sm:rounded-2xl border border-border bg-card/80 px-3 sm:px-4 py-2.5 sm:py-3 shadow-soft">
                  <div className="text-lg sm:text-xl font-semibold text-foreground">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bento Grid Visual */}
          <div className="relative w-full sm:max-w-[460px] md:max-w-[520px] lg:max-w-[520px] mx-auto lg:mx-0 lg:justify-self-end">
            <div className="grid grid-cols-6 grid-rows-5 gap-1.5 sm:gap-2 md:gap-3 h-[340px] sm:h-[400px] md:h-[460px] lg:h-[480px]">

              {/* Globe/Map Card - Large */}
              <div className="col-span-4 row-span-3 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/20 p-3 sm:p-4 md:p-5 relative overflow-hidden group">
                {/* Animated concentric circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute w-32 h-32 rounded-full border border-primary/20 animate-[ping_3s_ease-in-out_infinite]" />
                  <div className="absolute w-48 h-48 rounded-full border border-primary/10 animate-[ping_3s_ease-in-out_infinite_0.5s]" />
                  <div className="absolute w-64 h-64 rounded-full border border-primary/5 animate-[ping_3s_ease-in-out_infinite_1s]" />
                </div>

                {/* Connection dots */}
                <div className="absolute top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse" />
                <div className="absolute top-8 sm:top-12 md:top-16 right-6 sm:right-8 md:right-12 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary animate-pulse [animation-delay:0.3s]" />
                <div className="absolute bottom-12 sm:bottom-16 md:bottom-20 left-8 sm:left-12 md:left-16 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-amber-500 animate-pulse [animation-delay:0.6s]" />
                <div className="absolute bottom-6 sm:bottom-8 md:bottom-12 right-4 sm:right-6 md:right-8 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse [animation-delay:0.9s]" />
                <div className="absolute top-1/2 left-1/3 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary animate-pulse [animation-delay:1.2s]" />

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 rounded-xl sm:rounded-2xl bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center shadow-lg">
                    <svg className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                </div>

                {/* Label */}
                <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-2 sm:left-3 md:left-4 right-2 sm:right-3 md:right-4">
                  <div data-testid="global-network" className="text-[10px] sm:text-xs font-medium text-primary/80 uppercase tracking-wider">{t("hero.bento.globalNetwork")}</div>
                </div>
              </div>

              {/* Live Activity Card */}
              <div className="col-span-2 row-span-2 rounded-xl sm:rounded-2xl bg-card border border-border p-2 sm:p-3 md:p-4 flex flex-col justify-between">
                <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                  <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500" />
                  </span>
                  <span className="text-[6px] sm:text-[8px] md:text-[10px] uppercase tracking-wider text-muted-foreground">{t("hero.bento.live")}</span>
                </div>
                <div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{t("hero.bento.liveCount")}</div>
                  <div className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground">{t("hero.bento.activeNow")}</div>
                </div>
              </div>

              {/* Languages Card */}
              <div className="col-span-2 row-span-1 rounded-xl sm:rounded-2xl bg-card border border-border p-2 sm:p-3 flex flex-col justify-center items-center gap-1 sm:gap-2 min-w-0">
                <div className="flex -space-x-0.5 sm:-space-x-1 shrink-0">
                  <div className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 rounded-full bg-red-100 border border-background sm:border-2 flex items-center justify-center text-[6px] sm:text-[8px] md:text-[10px]">🇯🇵</div>
                  <div className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 rounded-full bg-blue-100 border border-background sm:border-2 flex items-center justify-center text-[6px] sm:text-[8px] md:text-[10px]">🇹🇭</div>
                  <div className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 rounded-full bg-slate-100 border border-background sm:border-2 flex items-center justify-center text-[6px] sm:text-[8px] md:text-[10px]">🇺🇸</div>
                </div>
                <div className="text-[10px] sm:text-xs font-medium text-muted-foreground text-center">{t("hero.bento.languages")}</div>
              </div>

              {/* Partner Search Card */}
              <Link data-testid="partner-search-card" to={`/${localePrefix}/partner-search`} className="col-span-3 row-span-2 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-50 to-purple-100/50 dark:from-violet-950/30 dark:to-purple-900/20 border border-violet-200/50 dark:border-violet-800/30 p-2 sm:p-3 md:p-4 flex flex-col justify-between group hover:border-violet-400/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-md sm:rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-violet-600/70 dark:text-violet-400/70 group-hover:text-violet-700 dark:group-hover:text-violet-300 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <div data-testid="partner-search" className="text-[10px] sm:text-xs md:text-sm font-medium text-violet-900 dark:text-violet-100">{t("hero.bento.partnerSearch")}</div>
                  <div className="text-[8px] sm:text-[10px] md:text-xs text-violet-700/70 dark:text-violet-300/70">{t("hero.bento.findPartners")}</div>
                </div>
              </Link>

              {/* Business Chat Card */}
              <Link data-testid="business-chat-card" to={`/${localePrefix}/messages`} className="col-span-3 row-span-2 rounded-xl sm:rounded-2xl bg-card border border-border p-2 sm:p-3 md:p-4 flex flex-col justify-between group hover:border-primary/30 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-md sm:rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs md:text-sm font-medium text-foreground">{t("hero.bento.businessChat")}</div>
                  <div className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground">{t("hero.bento.instantMessaging")}</div>
                </div>
              </Link>

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
