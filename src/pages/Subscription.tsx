import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Settings, CreditCard } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getPlanDetails, normalizePlanKey } from "@/utils/servicePlans";
import { format } from "date-fns";
import { ja, enUS, th as thLocale } from "date-fns/locale";

interface Registration {
  id: string;
  service: string;
  created_at: string;
}

const localeMap = {
  ja,
  en: enUS,
  th: thLocale,
};

const Subscription = () => {
  const { t, i18n } = useTranslation();
  const localePrefix = i18n.language === "ja" ? "ja" : i18n.language === "th" ? "th" : "en";
  const locale = localeMap[localePrefix] ?? ja;
  const { user } = useAuth();
  const { subscription, loading, checkSubscription, openCustomerPortal } = useSubscription();
  const { hasSubscription, subscriptionTier } = useUserRole();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const serviceOptions = t("register.services", { returnObjects: true }) as Array<{
    id: string;
    name: string;
    price: string;
    description: string;
    features: string[];
  }>;

  useEffect(() => {
    async function fetchRegistration() {
      if (!user) return;
      const { data } = await (supabase as any)
        .from('registrations')
        .select('id, service, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setRegistration(data[0]);
      }
    }

    fetchRegistration();
  }, [user]);

  if (!user) {
    return null;
  }

  const hasOverridePlan = Boolean(registration?.service);
  const isSubscribed = subscription.subscribed || hasSubscription || hasOverridePlan;
  const planKey = registration?.service || subscription.subscription_tier || subscriptionTier;
  const planDetails = getPlanDetails(planKey, localePrefix as "ja" | "en" | "th");
  const normalizedPlanKey = normalizePlanKey(planKey);
  const currentPlan = serviceOptions.find((plan) => plan.id === normalizedPlanKey);
  const planFeatures = currentPlan?.features ?? [];

  const formatDate = (dateString: string) => {
    const template = localePrefix === 'en' ? "PPP" : localePrefix === 'th' ? "dd MMMM yyyy" : "yyyy年MM月dd日";
    return format(new Date(dateString), template, { locale });
  };

  return (
    <DashboardLayout language={localePrefix}>
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <Card className="bg-card/80 border-border shadow-soft">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold flex items-center">
                <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary h-10 w-10 mr-3">
                  <CreditCard className="h-5 w-5" />
                </span>
                {t("subscriptionPage.title")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("subscriptionPage.subtitle")}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkSubscription}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              {t("subscriptionPage.refresh")}
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background/90 p-4">
                <p className="text-xs uppercase text-muted-foreground">{t("subscriptionPage.statusLabel")}</p>
                <div className="mt-2">
                  <Badge variant={isSubscribed ? "default" : "secondary"}>
                    {isSubscribed ? t("subscriptionPage.statusActive") : t("subscriptionPage.statusInactive")}
                  </Badge>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/90 p-4">
                <p className="text-xs uppercase text-muted-foreground">{t("subscriptionPage.planLabel")}</p>
                <div className="mt-2">
                  <div className="text-lg font-semibold text-foreground">{planDetails.name}</div>
                  {planDetails.price !== "N/A" && (
                    <div className="text-sm text-muted-foreground">
                      {t("subscriptionPage.priceLabel")} {planDetails.price}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/90 p-4">
                <p className="text-xs uppercase text-muted-foreground">{t("subscriptionPage.renewalLabel")}</p>
                <div className="mt-2 text-sm text-foreground">
                  {subscription.subscription_end ? formatDate(subscription.subscription_end) : t("subscriptionPage.noRenewal")}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={openCustomerPortal}
              >
                <Settings className="h-4 w-4 mr-2" />
                {t("subscriptionPage.manageButton")}
              </Button>
              <Button
                className="w-full sm:w-auto"
                onClick={() => (window.location.href = `/${localePrefix}#pricing`)}
              >
                {t("subscriptionPage.changeButton")}
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={openCustomerPortal}
              >
                {t("subscriptionPage.cancelButton")}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              {t("subscriptionPage.portalHint")}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {t("subscriptionPage.featuresTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {planFeatures.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {planFeatures.map((feature) => (
                  <div key={feature} className="flex items-start gap-2 rounded-xl border border-border bg-background/90 px-3 py-2 text-sm text-muted-foreground">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("subscriptionPage.noFeatures")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Subscription;
