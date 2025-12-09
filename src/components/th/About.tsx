import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, Eye, FileText } from "lucide-react";

const About = () => {
  const securityFeatures = [
    {
      icon: CheckCircle,
      title: "วางแผนได้รับการรับรอง ISO",
      description: "มุ่งมั่นสู่มาตรฐานความปลอดภัยข้อมูลระหว่างประเทศ"
    },
    {
      icon: Shield,
      title: "การปกป้องข้อมูล",
      description: "การเข้ารหัสขั้นสูงและโปรโตคอลการจัดการข้อมูลที่ปลอดภัย"
    },
    {
      icon: Eye,
      title: "ความโปร่งใสอย่างสมบูรณ์",
      description: "นโยบายการใช้ข้อมูลที่ชัดเจนและแนวปฏิบัติทางธุรกิจที่โปร่งใส"
    },
    {
      icon: FileText,
      title: "การปฏิบัติตามกฎหมาย",
      description: "การปฏิบัติตามกฎหมายและข้อบังคับทั้งในประเทศและต่างประเทศ"
    }
  ];

  const trustCards = [
    {
      title: "การปฏิบัติตามมาตรฐาน ISO",
      description: "มุ่งมั่นที่จะบรรลุมาตรฐานความปลอดภัยข้อมูลระหว่างประเทศ"
    },
    {
      title: "ความโปร่งใสอย่างสมบูรณ์",
      description: "การมองเห็นเต็มที่เกี่ยวกับการใช้ข้อมูลและการดำเนินธุรกิจ"
    },
    {
      title: "การปฏิบัติตามกฎหมาย",
      description: "การปฏิบัติตามกฎหมายและข้อบังคับที่เกี่ยวข้องอย่างเคร่งครัด"
    }
  ];

  return (
    <section id="about" className="py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            ความปลอดภัยและความน่าเชื่อถือ
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            GBES มุ่งมั่นที่จะมีมาตรฐานสูงสุดในด้านการปกป้องข้อมูล ความโปร่งใส และการปฏิบัติตามกฎหมาย
            ข้อมูลธุรกิจและความพยายามในการขยายธุรกิจระหว่างประเทศของคุณได้รับการปกป้องด้วยระบบความปลอดภัยระดับองค์กร
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {securityFeatures.map((feature, index) => (
            <Card key={index} className="bg-card border-border text-center hover:bg-card/80 hover:border-primary/20 transition-all duration-300 group">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors duration-300">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mb-12">
          <Button size="lg" variant="outline" className="shadow-lg hover:shadow-xl transition-all duration-300">
            รายละเอียดความปลอดภัย
          </Button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {trustCards.map((card, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-foreground text-center">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center leading-relaxed">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
