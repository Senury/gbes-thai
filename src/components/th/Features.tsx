import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Languages, 
  Bot, 
  FileCheck, 
  Presentation,
  Instagram,
  Facebook,
  MapPin,
  Twitter
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Languages,
      title: "เครื่องมือแปลและกระจายข้อมูล",
      description: "รองรับ Instagram, Facebook, Google Maps, X(Twitter) และแพลตฟอร์มอื่นๆ พร้อมความสามารถหลายภาษา"
    },
    {
      icon: Bot,
      title: "การสนับสนุน AI",
      description: "ความช่วยเหลืออัจฉริยะสำหรับการสอบถามการค้าระหว่างประเทศและคำแนะนำทางธุรกิจ"
    },
    {
      icon: FileCheck,
      title: "การจัดโครงสร้างและตรวจสอบข้อมูลบริษัท",
      description: "การจัดระเบียบและยืนยันข้อมูลธุรกิจอย่างเป็นระบบสำหรับตลาดต่างประเทศ"
    },
    {
      icon: Presentation,
      title: "ฟีเจอร์นำเสนอสำหรับผู้ใช้ต่างประเทศ",
      description: "เครื่องมือนำเสนอแบบมืออาชีพที่ออกแบบมาสำหรับการสื่อสารธุรกิจระหว่างประเทศ"
    }
  ];

  return (
    <section id="services" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            ภาพรวมบริการ
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            ทุกสิ่งที่สตาร์ทอัพต้องการในแดชบอร์ดเดียว
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-card border-border hover:bg-card/80 hover:border-primary/20 transition-all duration-300 group"
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 text-sm text-muted-foreground bg-secondary/30 px-6 py-3 rounded-full">
            <span>แพลตฟอร์มที่รองรับ:</span>
            <Instagram className="h-4 w-4" />
            <Facebook className="h-4 w-4" />
            <MapPin className="h-4 w-4" />
            <Twitter className="h-4 w-4" />
            <span>และอื่นๆ</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
