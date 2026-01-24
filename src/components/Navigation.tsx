import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { hasSubscription, isPremium, loading: roleLoading, registrationCompleted } = useUserRole();
  const isRegistrationComplete =
    registrationCompleted ||
    Boolean(user?.user_metadata?.registered) ||
    user?.user_metadata?.registration_status === 'completed';
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const localePrefix = i18n.language === "ja" ? "ja" : i18n.language === "th" ? "th" : "en";

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate(`/${localePrefix}`);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, [signOut, navigate, localePrefix]);

  const handleMenuToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, [isOpen]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSectionClick = useCallback((sectionId: string) => {
    // If we're not on the home page, navigate there first, then scroll
    if (location.pathname !== `/${localePrefix}`) {
      navigate(`/${localePrefix}`);
      // Use setTimeout to ensure navigation completes before scrolling
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // If we're already on home page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    closeMenu();
  }, [navigate, location.pathname, closeMenu, localePrefix]);

  return (
    <nav className="fixed top-4 left-4 right-4 z-50 bg-background/80 backdrop-blur-xl border border-border shadow-soft rounded-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-primary shadow-glow" />
              <div className="leading-none">
                <div className="text-lg font-bold text-foreground">GBES</div>
                <div className="text-[11px] text-muted-foreground">Global Business Expansion</div>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:flex flex-1 justify-center">
            <div className="flex items-center gap-2 text-sm">
              <button onClick={() => handleSectionClick("home")} className="px-3 py-2 rounded-full text-foreground hover:text-primary hover:bg-primary/10 transition-colors whitespace-nowrap">
                {t("nav.home")}
              </button>
              <button onClick={() => handleSectionClick("mission")} className="px-3 py-2 rounded-full text-foreground hover:text-primary hover:bg-primary/10 transition-colors whitespace-nowrap">
                {t("nav.mission")}
              </button>
              <button onClick={() => handleSectionClick("services")} className="px-3 py-2 rounded-full text-foreground hover:text-primary hover:bg-primary/10 transition-colors whitespace-nowrap">
                {t("nav.services")}
              </button>
              <Link
                to={`/${localePrefix}/partner-search`}
                className="px-3 py-2 rounded-full text-foreground hover:text-primary hover:bg-primary/10 transition-colors whitespace-nowrap"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                {t("nav.partners")}
              </Link>
              <button onClick={() => handleSectionClick("pricing")} className="px-3 py-2 rounded-full text-foreground hover:text-primary hover:bg-primary/10 transition-colors whitespace-nowrap">
                {t("nav.pricing")}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-3 py-2 rounded-full text-foreground hover:text-primary transition-colors whitespace-nowrap" aria-label={t("nav.moreLabel")}>
                    <span className="mr-1">{t("nav.more")}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSectionClick("contact")} className="px-3">
                    {t("nav.contact")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/${localePrefix}/social-media`)} className="px-3">
                    {t("nav.social")}
                  </DropdownMenuItem>
                  <div className="h-px bg-border rounded" />
                  <DropdownMenuItem onClick={() => { i18n.changeLanguage("ja"); navigate("/ja"); }} className="px-3">
                    {t("nav.languageJa")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { i18n.changeLanguage("en"); navigate("/en"); }} className="px-3">
                    {t("nav.languageEn")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { i18n.changeLanguage("th"); navigate("/th"); }} className="px-3">
                    {t("nav.languageTh")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate(`/${localePrefix}/dashboard`)}>
                  <User className="h-4 w-4 mr-2" />
                  {user.email}
                </Button>
                {!roleLoading && !(hasSubscription || isPremium || isRegistrationComplete) && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/${localePrefix}/register`}>{t("nav.register")}</Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("nav.logout")}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/${localePrefix}/login`}>{t("nav.login")}</Link>
                </Button>
                <Button variant="cta" size="lg" asChild>
                  <Link to={`/${localePrefix}/signup`}>{t("nav.signup")}</Link>
                </Button>
              </>
            )}
          </div>

          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMenuToggle}
            >
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background/95 backdrop-blur-md border-t border-border rounded-b-2xl">
            <Link to={`/${localePrefix}`} className="block px-3 py-2 text-foreground hover:text-primary transition-colors duration-200" onClick={closeMenu}>
              {t("nav.home")}
            </Link>
            <button onClick={() => handleSectionClick("mission")} className="block px-3 py-2 text-foreground hover:text-primary transition-colors duration-200">
              {t("nav.mission")}
            </button>
            <button onClick={() => handleSectionClick("services")} className="block px-3 py-2 text-foreground hover:text-primary transition-colors duration-200">
              {t("nav.services")}
            </button>
            <Link
              to={`/${localePrefix}/partner-search`}
              className="block px-3 py-2 text-foreground hover:text-primary transition-colors duration-200"
              onClick={() => {
                closeMenu();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              {t("nav.partners")}
            </Link>
            <button onClick={() => handleSectionClick("pricing")} className="block px-3 py-2 text-foreground hover:text-primary transition-colors duration-200">
              {t("nav.pricing")}
            </button>
            <button onClick={() => handleSectionClick("contact")} className="block px-3 py-2 text-foreground hover:text-primary transition-colors duration-200">
              {t("nav.contact")}
            </button>
            <Link to="/ja" className="block px-3 py-2 text-muted-foreground hover:text-primary transition-colors duration-200" onClick={() => { i18n.changeLanguage("ja"); closeMenu(); }}>
              {t("nav.languageJa")}
            </Link>
            <Link to="/en" className="block px-3 py-2 text-muted-foreground hover:text-primary transition-colors duration-200" onClick={() => { i18n.changeLanguage("en"); closeMenu(); }}>
              {t("nav.languageEn")}
            </Link>
            <Link to="/th" className="block px-3 py-2 text-muted-foreground hover:text-primary transition-colors duration-200" onClick={() => { i18n.changeLanguage("th"); closeMenu(); }}>
              {t("nav.languageTh")}
            </Link>
            <div className="px-3 py-2 space-y-2">
              {user ? (
                <>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => { closeMenu(); navigate(`/${localePrefix}/dashboard`); }}>
                    <User className="h-4 w-4 mr-2" />
                    {user.email}
                  </Button>
                  {!roleLoading && !(hasSubscription || isPremium || isRegistrationComplete) && (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link to={`/${localePrefix}/register`} onClick={closeMenu}>{t("nav.register")}</Link>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="w-full" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("nav.logout")}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link to={`/${localePrefix}/login`}>{t("nav.login")}</Link>
                  </Button>
                  <Button variant="cta" size="lg" className="w-full" asChild>
                    <Link to={`/${localePrefix}/signup`}>{t("nav.signup")}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
