import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

const FloatingCTA = () => {
  const { t, i18n } = useTranslation();
  const localePrefix = i18n.language === "ja" ? "ja" : i18n.language === "th" ? "th" : "en";

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button variant="cta" size="xl" asChild className="shadow-cta">
        <Link to={`/${localePrefix}/signup`} className="flex items-center gap-3">
          <UserPlus className="h-5 w-5" />
          {t("floatingCta.label")}
        </Link>
      </Button>
    </div>
  );
};

export default FloatingCTA;
