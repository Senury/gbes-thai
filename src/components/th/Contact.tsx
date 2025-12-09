import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  const contactInfo = [
    {
      icon: Mail,
      title: "อีเมล",
      info: "support@gbes.com",
      description: "ส่งอีเมลหาเราได้ตลอดเวลา"
    },
    {
      icon: Phone,
      title: "โทรศัพท์",
      info: "+81-3-1234-5678",
      description: "จันทร์-ศุกร์ 9.00-18.00 น. (JST)"
    },
    {
      icon: MapPin,
      title: "สำนักงาน",
      info: "โตเกียว ประเทศญี่ปุ่น",
      description: "เยี่ยมชมสำนักงานใหญ่ของเรา"
    }
  ];

  return (
    <section id="contact" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            ติดต่อเรา
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            พร้อมที่จะขยายธุรกิจของคุณไปทั่วโลกหรือยัง? ติดต่อเราวันนี้และมาพูดคุยกันว่า GBES จะช่วยคุณประสบความสำเร็จในตลาดต่างประเทศได้อย่างไร
          </p>
          <p className="text-sm text-primary/70 mt-4 max-w-2xl mx-auto">
            *หมายเหตุ: คุณต้องเข้าสู่ระบบและลงทะเบียนเพื่อใช้ฟีเจอร์การติดต่อ
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">ส่งข้อความถึงเรา</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                    ชื่อ
                  </label>
                  <Input id="firstName" placeholder="ชื่อของคุณ" />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                    นามสกุล
                  </label>
                  <Input id="lastName" placeholder="นามสกุลของคุณ" />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  อีเมล
                </label>
                <Input id="email" type="email" placeholder="your.email@example.com" />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  ข้อความ
                </label>
                <Textarea 
                  id="message" 
                  placeholder="บอกเราเกี่ยวกับธุรกิจของคุณและเป้าหมายการขยายธุรกิจระหว่างประเทศ..." 
                  rows={6}
                />
              </div>
              
              <Button size="lg" className="w-full">
                ส่งข้อความ
              </Button>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            {contactInfo.map((contact, index) => (
              <Card key={index} className="bg-card border-border hover:bg-card/80 hover:border-primary/20 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <contact.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">{contact.title}</CardTitle>
                      <p className="text-foreground font-medium">{contact.info}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{contact.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
