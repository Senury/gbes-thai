import { DashboardLayout } from '@/components/DashboardLayout';
import { ProfileForm } from '@/components/ProfileForm';
import { useTranslation } from "react-i18next";

export default function Profile() {
  const { t, i18n } = useTranslation();
  const localePrefix = i18n.language === "ja" ? "ja" : i18n.language === "th" ? "th" : "en";

  return (
    <DashboardLayout language={localePrefix}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("profile.title")}</h1>
          <p className="text-muted-foreground">
            {t("profile.subtitle")}
          </p>
        </div>
        
        <ProfileForm language={localePrefix} />
      </div>
    </DashboardLayout>
  );
}
