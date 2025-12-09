import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Scale } from "lucide-react";

const Partners = () => {
  const partners = [
    {
      icon: Shield,
      name: "NEXI",
      fullName: "Nippon Export and Investment Insurance",
      description: "ให้บริการประกันภัยสำหรับการค้าและการลงทุนระหว่างประเทศ"
    },
    {
      icon: Users,
      name: "หอการค้า",
      fullName: "หอการค้าท้องถิ่นและหน่วยงานเทศบาล",
      description: "การสนับสนุนธุรกิจระดับภูมิภาคและความช่วยเหลือด้านการบริหารสำหรับการขยายธุรกิจระหว่างประเทศ"
    },
    {
      icon: Scale,
      name: "ผู้เชี่ยวชาญด้านกฎหมายและโลจิสติกส์",
      fullName: "ผู้ให้บริการมืออาชีพ",
      description: "การสนับสนุนเชิงปฏิบัติจากผู้เชี่ยวชาญด้านกฎหมายและโลจิสติกส์สำหรับการดำเนินงานระหว่างประเทศ"
    }
  ];

  return (
    <section id="partners" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            พันธมิตรและองค์กรสนับสนุน
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            ความร่วมมือกับสถาบันที่เชื่อถือได้เพื่อให้การสนับสนุนครบวงจรสำหรับการขยายธุรกิจระหว่างประเทศของคุณ
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {partners.map((partner, index) => (
            <Card key={index} className="bg-card border-border hover:bg-card/80 hover:border-primary/20 transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <partner.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-foreground">{partner.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{partner.fullName}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{partner.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
