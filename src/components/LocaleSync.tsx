import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const LocaleSync = () => {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    const prefix = location.pathname.split("/")[1];
    if (prefix === "ja" || prefix === "en" || prefix === "th") {
      if (i18n.language !== prefix) {
        i18n.changeLanguage(prefix);
      }
    }
  }, [i18n, location.pathname]);

  return null;
};

export default LocaleSync;
