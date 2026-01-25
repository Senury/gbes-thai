import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User, FileText, Calendar, Package } from "lucide-react";
import SubscriptionStatus from "@/components/SubscriptionStatus";
import { getPlanDetails } from "@/utils/servicePlans";
import { useTranslation } from "react-i18next";

interface Registration {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  phone: string | null;
  service: string;
  created_at: string;
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const localePrefix = i18n.language === "ja" ? "ja" : i18n.language === "th" ? "th" : "en";
  const dateLocale = localePrefix === "ja" ? "ja-JP" : localePrefix === "th" ? "th-TH" : "en-US";
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRegistration() {
      if (!user) return;

      try {
        const { data, error } = await (supabase as any)
          .from('registrations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error fetching registration:', error);
          toast({
            variant: "destructive",
            title: t("dashboard.toasts.errorTitle"),
            description: t("dashboard.toasts.errorDescription"),
          });
        } else if (data && data.length > 0) {
          setRegistration(data[0]);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRegistration();
  }, [user, toast]);

  return (
    <DashboardLayout language={localePrefix}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="rounded-2xl border border-border bg-background/80 p-6">
          <h1 className="text-2xl font-bold mb-2 text-foreground">
            {t("dashboard.welcome", { email: user?.email })}
          </h1>
          <p className="text-muted-foreground">
            {t("dashboard.welcomeSubtitle")}
          </p>
        </div>

        {/* Subscription Status */}
        <SubscriptionStatus language={localePrefix} planOverride={registration?.service} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/80 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.accountStatusTitle")}</CardTitle>
              <div className="h-8 w-8 rounded-full border border-border bg-background flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{t("dashboard.accountStatusActive")}</div>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.accountCreated", { date: new Date(user?.created_at || '').toLocaleDateString(dateLocale) })}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.registrationStatusTitle")}</CardTitle>
              <div className="h-8 w-8 rounded-full border border-border bg-background flex items-center justify-center">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {registration ? t("dashboard.registrationCompleted") : t("dashboard.registrationPending")}
              </div>
              <p className="text-xs text-muted-foreground">
                {registration ? t("dashboard.registrationCompletedNote") : t("dashboard.registrationPendingNote")}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.currentPlanTitle")}</CardTitle>
              <div className="h-8 w-8 rounded-full border border-border bg-background flex items-center justify-center">
                <Package className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {registration ? getPlanDetails(registration.service, localePrefix).name : t("dashboard.noPlan")}
              </div>
              <p className="text-xs text-muted-foreground">
                {registration ? getPlanDetails(registration.service, localePrefix).price : t("dashboard.noPlanDescription")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Registration Details */}
        {registration ? (
          <Card className="bg-card/80 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t("dashboard.registrationDetailsTitle")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.registrationDetailsSubtitle")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t("dashboard.labels.name")}</label>
                  <p className="text-sm">{registration.first_name} {registration.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t("dashboard.labels.email")}</label>
                  <p className="text-sm">{registration.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t("dashboard.labels.company")}</label>
                  <p className="text-sm">{registration.company || t("dashboard.notProvided")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t("dashboard.labels.phone")}</label>
                  <p className="text-sm">{registration.phone || t("dashboard.notProvided")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">{t("dashboard.labels.plan")}</label>
                <Badge className={getPlanDetails(registration.service, localePrefix).color}>
                  {getPlanDetails(registration.service, localePrefix).name} - {getPlanDetails(registration.service, localePrefix).price}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t("dashboard.registeredOn", { date: new Date(registration.created_at).toLocaleDateString(dateLocale) })}
                </span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card/80 border-border">
            <CardHeader>
              <CardTitle>{t("dashboard.completeRegistrationTitle")}</CardTitle>
              <CardDescription>
                {t("dashboard.completeRegistrationDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate(`/${localePrefix}/register`)}>
                {t("dashboard.completeRegistrationCta")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
