import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, RefreshCw, Settings } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ja, enUS, th as thLocale } from "date-fns/locale";

interface SubscriptionStatusProps {
  language?: 'ja' | 'en' | 'th';
}

const translations = {
  ja: {
    title: "サブスクリプション状況",
    refresh: "更新",
    statusLabel: "ステータス:",
    statusActive: "アクティブ",
    statusInactive: "未契約",
    planLabel: "プラン:",
    renewalLabel: "次回更新日:",
    manage: "サブスクリプション管理",
    upgradeCopy: "プレミアム機能をご利用いただくにはサブスクリプションが必要です。",
    upgradeCta: "プランを選択",
  },
  en: {
    title: "Subscription Status",
    refresh: "Refresh",
    statusLabel: "Status:",
    statusActive: "Active",
    statusInactive: "Not Subscribed",
    planLabel: "Plan:",
    renewalLabel: "Next Renewal:",
    manage: "Manage Subscription",
    upgradeCopy: "Subscribe to access premium functionality.",
    upgradeCta: "View Plans",
  },
  th: {
    title: "สถานะการสมัครสมาชิก",
    refresh: "รีเฟรช",
    statusLabel: "สถานะ:",
    statusActive: "ใช้งานอยู่",
    statusInactive: "ยังไม่ได้สมัคร",
    planLabel: "แพ็กเกจ:",
    renewalLabel: "รอบบิลถัดไป:",
    manage: "จัดการการสมัคร",
    upgradeCopy: "จำเป็นต้องสมัครสมาชิกเพื่อใช้งานฟีเจอร์ระดับพรีเมียม",
    upgradeCta: "เลือกแพ็กเกจ",
  },
} as const;

const localeMap = {
  ja,
  en: enUS,
  th: thLocale,
};

const SubscriptionStatus = ({ language = 'ja' }: SubscriptionStatusProps) => {
  const { user } = useAuth();
  const { subscription, loading, checkSubscription, openCustomerPortal } = useSubscription();
  const t = translations[language] ?? translations.ja;
  const locale = localeMap[language] ?? ja;
  const localePrefix = language === 'ja' ? 'ja' : language === 'th' ? 'th' : 'en';

  if (!user) {
    return null;
  }

  const getStatusVariant = () => {
    if (subscription.subscribed) return "default";
    return "secondary";
  };

  const getStatusText = () => {
    if (subscription.subscribed) return t.statusActive;
    return t.statusInactive;
  };

  const formatDate = (dateString: string) => {
    const template = language === 'en' ? "PPP" : language === 'th' ? "dd MMMM yyyy" : "yyyy年MM月dd日";
    return format(new Date(dateString), template, { locale });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          {t.title}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={checkSubscription}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          {t.refresh}
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t.statusLabel}</span>
          <Badge variant={getStatusVariant()}>
            {getStatusText()}
          </Badge>
        </div>

        {subscription.subscribed && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t.planLabel}</span>
              <span className="text-sm font-semibold">
                {subscription.subscription_tier}
              </span>
            </div>
            
            {subscription.subscription_end && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t.renewalLabel}</span>
                <span className="text-sm">
                  {formatDate(subscription.subscription_end)}
                </span>
              </div>
            )}
          </>
        )}

        {subscription.subscribed && (
          <div className="pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={openCustomerPortal}
            >
              <Settings className="h-4 w-4 mr-2" />
              {t.manage}
            </Button>
          </div>
        )}

        {!subscription.subscribed && (
          <div className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              {t.upgradeCopy}
            </p>
            <Button 
              className="w-full" 
              onClick={() => window.location.href = `/${localePrefix}#pricing`}
            >
              {t.upgradeCta}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;
