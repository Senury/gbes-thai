import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  isFree?: boolean;
  isEnterprise?: boolean;
}

const Pricing = () => {
  const { user } = useAuth();
  const { subscription, createCheckout } = useSubscription();
  const { toast } = useToast();
  const { t } = useTranslation();
  const plans = t("pricing.plans", { returnObjects: true }) as Plan[];

  const handlePlanSelect = async (planId: string, isEnterprise: boolean = false) => {
    if (isEnterprise) {
      // For enterprise plan, show contact info or redirect to contact page
      toast({
        title: t("pricing.toasts.enterpriseTitle"),
        description: t("pricing.toasts.enterpriseDescription"),
      });
      return;
    }

    if (planId === "free") {
      // For free plan, just show a success message or redirect to signup
      toast({
        title: t("pricing.toasts.freeTitle"),
        description: t("pricing.toasts.freeDescription"),
      });
      return;
    }

    if (!user) {
      toast({
        title: t("pricing.toasts.loginTitle"),
        description: t("pricing.toasts.loginDescription"),
        variant: "destructive",
      });
      return;
    }
    
    console.log('Selecting plan:', planId);
    await createCheckout(planId);
  };

  const isCurrentPlan = (planId: string) => {
    return subscription.subscribed && subscription.subscription_tier === planId;
  };
  return (
    <section id="pricing" className="py-20 bg-section-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            {t("pricing.title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("pricing.subtitle")}
          </p>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            {t("pricing.note")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative overflow-hidden transition-all duration-300 ${
                plan.isPopular ? 'border-primary bg-card/90 ring-1 ring-primary/20' : 'border-border bg-card/80'
              } ${isCurrentPlan(plan.name) ? 'border-green-500 bg-green-50/10' : ''} ${
                plan.isFree ? 'border-green-300' : ''
              } hover:shadow-soft flex flex-col`}
            >
              {plan.isPopular && (
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-full">
                  <Star className="inline h-4 w-4 mr-1" />
                  {t("pricing.badges.popular")}
                </div>
              )}

              {plan.isFree && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 text-xs font-semibold rounded-full">
                  {t("pricing.badges.free")}
                </div>
              )}
              
              <CardHeader className="text-left pb-4">
                <CardTitle className="text-lg font-semibold text-foreground">{plan.name}</CardTitle>
                <div className="mt-4 flex items-end gap-2">
                  <span className={`text-3xl font-semibold ${plan.isEnterprise ? 'text-2xl' : ''} text-foreground`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground text-sm">/ {plan.period}</span>
                  )}
                </div>
                <p className="text-muted-foreground mt-2 text-sm">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="pt-0 flex flex-col flex-1">
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-2">
                      <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                      <span className="text-foreground text-xs leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={
                    isCurrentPlan(plan.id) ? "secondary" : 
                    plan.isFree ? "outline" :
                    plan.isPopular ? "hero" : 
                    plan.isEnterprise ? "default" : "outline"
                  } 
                  className="w-full mt-auto"
                  onClick={() => handlePlanSelect(plan.id, plan.isEnterprise)}
                  disabled={isCurrentPlan(plan.id)}
                >
                  {isCurrentPlan(plan.id) ? t("pricing.buttons.currentPlan") : 
                   plan.isFree ? t("pricing.buttons.freeStart") :
                   plan.isEnterprise ? t("pricing.buttons.contact") : t("pricing.buttons.selectPlan")}
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
