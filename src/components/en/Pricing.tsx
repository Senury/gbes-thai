import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Pricing = () => {
  const { user } = useAuth();
  const { subscription, createCheckout } = useSubscription();
  const { toast } = useToast();

  const handlePlanSelect = async (planId: string, isEnterprise: boolean = false) => {
    if (isEnterprise) {
      // For enterprise plan, show contact info or redirect to contact page
      toast({
        title: "Enterprise Plan",
        description: "Thank you for your inquiry. Our sales team will contact you shortly.",
      });
      return;
    }

    if (planId === "free") {
      // For free plan, just show a success message or redirect to signup
      toast({
        title: "Start Your Free Trial",
        description: "Begin your 1-week free trial and explore all features.",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in first to select a payment plan",
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

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "1-week trial",
      description: "Try our platform for one week",
      features: [
        "10 partner searches total",
        "Basic AI assistance (3x daily)",
        "Single channel distribution",
        "Community support",
        "Feature trial (limited)"
      ],
      isPopular: false,
      isFree: true
    },
    {
      id: "standard",
      name: "Standard",
      price: "$30",
      period: "/month",
      description: "Perfect for serious business use",
      features: [
        "Unlimited partner searches",
        "Full AI assistance features",
        "Multi-channel distribution",
        "Priority support",
        "Basic analytics reports"
      ],
      isPopular: true,
      isFree: false
    },
    {
      id: "business",
      name: "Business", 
      price: "$50",
      period: "/month",
      description: "Advanced features for teams",
      features: [
        "All Standard features",
        "Enhanced AI support",
        "Priority partner matching",
        "Detailed analytics & reports",
        "Team management tools"
      ],
      isPopular: false,
      isFree: false
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Contact us", 
      period: "",
      description: "Custom solutions for large organizations",
      features: [
        "All features included",
        "Dedicated marketing support",
        "Event participation access",
        "Dedicated consultant",
        "Custom integrations & development"
      ],
      isPopular: false,
      isFree: false,
      isEnterprise: true
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Pricing Plans
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start free, upgrade as you grow
          </p>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Experience drives growth. The more you use, the more value you discover.
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
                  Recommended
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
                    <span className="text-muted-foreground ml-2">{plan.period}</span>
                  )}
                </div>
                <p className="text-muted-foreground mt-2 text-sm">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2">
                      <Check className="h-3 w-3 text-primary flex-shrink-0" />
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
                  {isCurrentPlan(plan.name) ? "Current Plan" : 
                   plan.isFree ? "Start Free Trial" :
                   plan.isEnterprise ? "Contact Us" : "Choose Plan"}
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