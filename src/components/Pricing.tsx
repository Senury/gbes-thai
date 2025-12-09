import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    id: "free",
    name: "フリー",
    price: "¥0",
    period: "1週間限定",
    description: "まずは1週間体験してみてください",
    features: [
      "1週間で10回までのパートナー検索",
      "基本AI支援（1日3回まで）",
      "1チャネル配信のみ",
      "コミュニティサポート",
      "機能体験（制限あり）"
    ],
    isPopular: false,
    isFree: true
  },
  {
    id: "standard",
    name: "スタンダード",
    price: "¥2,980",
    period: "月額",
    description: "本格的なビジネス活用に",
    features: [
      "無制限パートナー検索",
      "AI支援機能フル活用",
      "複数チャネル配信",
      "優先サポート",
      "基本分析レポート"
    ],
    isPopular: true,
    isFree: false
  },
  {
    id: "business",
    name: "ビジネス", 
    price: "¥4,980",
    period: "月額",
    description: "チーム・組織での本格運用",
    features: [
      "スタンダードの全機能",
      "AI強化サポート",
      "優先パートナーマッチング",
      "詳細分析・レポート機能",
      "チーム管理機能"
    ],
    isPopular: false,
    isFree: false
  },
  {
    id: "enterprise",
    name: "エンタープライズ",
    price: "お問い合わせ", 
    period: "",
    description: "大規模組織向けカスタムソリューション",
    features: [
      "全ての機能",
      "専用マーケティング支援",
      "イベント参加権",
      "専属コンサルタント",
      "カスタム統合・開発"
    ],
    isPopular: false,
    isFree: false,
    isEnterprise: true
  }
];

const Pricing = () => {
  const { user } = useAuth();
  const { subscription, createCheckout } = useSubscription();
  const { toast } = useToast();

  const handlePlanSelect = async (planId: string, isEnterprise: boolean = false) => {
    if (isEnterprise) {
      // For enterprise plan, show contact info or redirect to contact page
      toast({
        title: "エンタープライズプラン",
        description: "お問い合わせありがとうございます。営業担当者よりご連絡いたします。",
      });
      return;
    }

    if (planId === "free") {
      // For free plan, just show a success message or redirect to signup
      toast({
        title: "フリープランをご利用ください",
        description: "今すぐ無料で機能をお試しいただけます。",
      });
      return;
    }

    if (!user) {
      toast({
        title: "ログインが必要です",
        description: "プランを選択するにはまずログインしてください",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Selecting plan:', planId);
    await createCheckout(planId);
  };

  const isCurrentPlan = (planName: string) => {
    return subscription.subscribed && subscription.subscription_tier === planName;
  };
  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            料金プラン
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            まずは無料で体験、必要に応じてアップグレード
          </p>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            製品体験がそのまま営業ツール。使えば使うほど価値を実感していただけます
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-glow hover:scale-105 ${
                plan.isPopular ? 'border-primary shadow-glow' : 'border-border'
              } ${isCurrentPlan(plan.name) ? 'border-green-500 bg-green-50/10' : ''} ${
                plan.isFree ? 'border-green-300' : ''
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold rounded-bl-lg">
                  <Star className="inline h-4 w-4 mr-1" />
                  おすすめ
                </div>
              )}

              {plan.isFree && (
                <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-sm font-semibold rounded-bl-lg">
                  FREE
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg font-bold text-foreground">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className={`text-3xl font-bold ${plan.isEnterprise ? 'text-2xl' : ''} bg-gradient-primary bg-clip-text text-transparent`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground ml-2">/ {plan.period}</span>
                  )}
                </div>
                <p className="text-muted-foreground mt-2 text-sm">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                      <span className="text-foreground text-xs">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={
                    isCurrentPlan(plan.name) ? "secondary" : 
                    plan.isFree ? "outline" :
                    plan.isPopular ? "hero" : 
                    plan.isEnterprise ? "default" : "outline"
                  } 
                  className="w-full"
                  onClick={() => handlePlanSelect(plan.id, plan.isEnterprise)}
                  disabled={isCurrentPlan(plan.name)}
                >
                  {isCurrentPlan(plan.name) ? "現在のプラン" : 
                   plan.isFree ? "無料で始める" :
                   plan.isEnterprise ? "お問い合わせ" : "プランを選択"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;