import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Shield, Globe2, CheckCircle } from "lucide-react";

const Mission = () => {
  const benefits = [
    "เครื่องมือแปลผลิตภัณฑ์หลายภาษา",
    "การกระจายข้อมูลไปยังหลายช่องทาง (SNS, Google Maps ฯลฯ)",
    "การจับคู่กับพันธมิตรต่างประเทศที่เชื่อถือได้",
    "ฟีเจอร์การชำระเงิน"
  ];

  const features = [
    {
      icon: Target,
      title: "โซลูชันครบวงจร",
      description: "ทุกสิ่งที่จำเป็นสำหรับการขยายธุรกิจระหว่างประเทศในแดชบอร์ดเดียว"
    },
    {
      icon: Shield,
      title: "การทำธุรกรรมที่ปลอดภัย",
      description: "ระบบชำระเงินที่ปลอดภัยและรวดเร็ว"
    },
    {
      icon: Globe2,
      title: "เครือข่ายทั่วโลก",
      description: "เครือข่ายพันธมิตรระหว่างประเทศที่ได้รับการยืนยันอย่างกว้างขวาง"
    }
  ];

  return (
    <section id="mission" className="py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-6">
              ทำให้การขยายธุรกิจระหว่างประเทศ{" "}
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                เป็นเรื่องง่ายสำหรับ SME
              </span>
            </h2>
            
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground text-lg">{benefit}</p>
                </div>
              ))}
            </div>
            
            <Button size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300">
              เรียนรู้เพิ่มเติม
            </Button>
          </div>
          
          <div className="grid gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;
