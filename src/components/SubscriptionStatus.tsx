import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, RefreshCw, Settings } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

const SubscriptionStatus = () => {
  const { user } = useAuth();
  const { subscription, loading, checkSubscription, openCustomerPortal } = useSubscription();

  if (!user) {
    return null;
  }

  const getStatusVariant = () => {
    if (subscription.subscribed) return "default";
    return "secondary";
  };

  const getStatusText = () => {
    if (subscription.subscribed) return "アクティブ";
    return "未契約";
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "yyyy年MM月dd日", { locale: ja });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          サブスクリプション状況
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={checkSubscription}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          更新
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">ステータス:</span>
          <Badge variant={getStatusVariant()}>
            {getStatusText()}
          </Badge>
        </div>

        {subscription.subscribed && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">プラン:</span>
              <span className="text-sm font-semibold">
                {subscription.subscription_tier}
              </span>
            </div>
            
            {subscription.subscription_end && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">次回更新日:</span>
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
              サブスクリプション管理
            </Button>
          </div>
        )}

        {!subscription.subscribed && (
          <div className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              プレミアム機能をご利用いただくにはサブスクリプションが必要です。
            </p>
            <Button 
              className="w-full" 
              onClick={() => window.location.href = '/#pricing'}
            >
              プランを選択
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;