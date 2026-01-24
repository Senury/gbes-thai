import { Github, Twitter, Linkedin, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t, i18n } = useTranslation();

  return (
    <footer className="bg-section-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-primary shadow-glow" />
              <div>
                <div className="text-lg font-bold text-foreground">GBES</div>
                <div className="text-xs text-muted-foreground">Global Business Expansion</div>
              </div>
            </div>
            <p className="text-muted-foreground">
              {t("footer.description")}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">{t("footer.product")}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.links.services")}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.links.pricing")}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.links.api")}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.links.documentation")}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">{t("footer.company")}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.links.about")}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.links.news")}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.links.careers")}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.links.contact")}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">{t("footer.support")}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.links.helpCenter")}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.links.status")}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.links.terms")}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t("footer.links.privacy")}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-muted-foreground">{t("footer.languageLabel")}</span>
          <div className="flex gap-2">
            <Link to="/ja" onClick={() => i18n.changeLanguage("ja")} className="px-3 py-1 rounded-full border border-border text-foreground hover:border-primary hover:text-primary transition-colors">
              {t("nav.languageJa")}
            </Link>
            <Link to="/en" onClick={() => i18n.changeLanguage("en")} className="px-3 py-1 rounded-full border border-border text-foreground hover:border-primary hover:text-primary transition-colors">
              {t("nav.languageEn")}
            </Link>
            <Link to="/th" onClick={() => i18n.changeLanguage("th")} className="px-3 py-1 rounded-full border border-border text-foreground hover:border-primary hover:text-primary transition-colors">
              {t("nav.languageTh")}
            </Link>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            {t("footer.rights")}
          </p>
          <p className="text-muted-foreground text-sm flex items-center">
            <Heart className="h-4 w-4 text-red-500 mx-1" /> {t("footer.madeBy")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
