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
      toast({
        title: "แพ็กเกจ Enterprise",
        description: "ขอบคุณสำหรับความสนใจ ทีมขายของเราจะติดต่อกลับโดยเร็ว",
      });
      return;
    }

    if (planId === "free") {
      toast({
        title: "เริ่มทดลองใช้ฟรี",
        description: "เริ่มทดลองใช้ฟรี 1 สัปดาห์และสำรวจฟีเจอร์ทั้งหมด",
      });
      return;
    }

    if (!user) {
      toast({
        title: "ต้องเข้าสู่ระบบ",
        description: "กรุณาเข้าสู่ระบบก่อนเลือกแผนการชำระเงิน",
        variant: "destructive",
      });
      return;
    }
    
    await createCheckout(planId);
  };

  const isCurrentPlan = (planName: string) => {
    return subscription.subscribed && subscription.subscription_tier === planName;
  };

  const plans = [
    {
      id: "free",
      name: "ฟรี",
      price: "฿0",
      period: "ทดลอง 1 สัปดาห์",
      description: "ทดลองใช้แพลตฟอร์มของเรา 1 สัปดาห์",
      features: [
        "ค้นหาพันธมิตร 10 ครั้ง",
        "ความช่วยเหลือ AI พื้นฐาน (3 ครั้ง/วัน)",
        "การกระจายช่องทางเดียว",
        "การสนับสนุนจากชุมชน",
        "ทดลองใช้ฟีเจอร์ (จำกัด)"
      ],
      isPopular: false,
      isFree: true
    },
    {
      id: "standard",
      name: "Standard",
      price: "฿1,000",
      period: "/เดือน",
      description: "เหมาะสำหรับการใช้งานธุรกิจอย่างจริงจัง",
      features: [
        "ค้นหาพันธมิตรไม่จำกัด",
        "ฟีเจอร์ AI เต็มรูปแบบ",
        "การกระจายหลายช่องทาง",
        "การสนับสนุนลำดับความสำคัญ",
        "รายงานวิเคราะห์พื้นฐาน"
      ],
      isPopular: true,
      isFree: false
    },
    {
      id: "business",
      name: "Business", 
      price: "฿1,700",
      period: "/เดือน",
      description: "ฟีเจอร์ขั้นสูงสำหรับทีม",
      features: [
        "ฟีเจอร์ Standard ทั้งหมด",
        "การสนับสนุน AI ขั้นสูง",
        "การจับคู่พันธมิตรลำดับความสำคัญ",
        "การวิเคราะห์และรายงานโดยละเอียด",
        "เครื่องมือจัดการทีม"
      ],
      isPopular: false,
      isFree: false
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "ติดต่อเรา", 
      period: "",
      description: "โซลูชันที่กำหนดเองสำหรับองค์กรขนาดใหญ่",
      features: [
        "ฟีเจอร์ทั้งหมดรวมอยู่",
        "การสนับสนุนการตลาดเฉพาะ",
        "การเข้าร่วมกิจกรรม",
        "ที่ปรึกษาเฉพาะ",
        "การรวมระบบและพัฒนาที่กำหนดเอง"
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
            แผนราคา
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            เริ่มฟรี อัพเกรดเมื่อธุรกิจเติบโต
          </p>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            ประสบการณ์ขับเคลื่อนการเติบโต ยิ่งใช้มากยิ่งค้นพบคุณค่ามากขึ้น
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
                  แนะนำ
                </div>
              )}

              {plan.isFree && (
                <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-sm font-semibold rounded-bl-lg">
                  ฟรี
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
                  {isCurrentPlan(plan.name) ? "แผนปัจจุบัน" : 
                   plan.isFree ? "เริ่มทดลองใช้ฟรี" :
                   plan.isEnterprise ? "ติดต่อเรา" : "เลือกแผน"}
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
