
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Shield, Globe, Scale } from "lucide-react";

const partners = [
  {
    icon: Shield,
    name: "NEXI",
    fullName: "日本貿易保険",
    description: "海外取引のリスクヘッジと保険サービスで、安全な国際展開を保証"
  },
  {
    icon: Globe,
    name: "商工会議所・地方自治体",
    fullName: "地域連携ネットワーク",
    description: "全国の商工会議所と地方自治体との連携により、地域企業の海外展開を支援"
  },
  {
    icon: Scale,
    name: "専門家ネットワーク",
    fullName: "法律・物流専門家",
    description: "国際法務、物流、税務の専門家による実務レベルでの包括的サポート"
  }
];

const Partners = () => {
  return (
    <section id="partners" className="py-20 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            パートナー＆支援団体
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            信頼できる専門機関との連携により、安全で確実な国際展開をサポートします
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {partners.map((partner, index) => (
            <Card 
              key={index}
              className="group hover:shadow-glow transition-all duration-300 hover:scale-105 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50"
            >
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <partner.icon className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {partner.name}
                    </h3>
                    <h4 className="text-lg text-primary mb-3">
                      {partner.fullName}
                    </h4>
                    <p className="text-muted-foreground">
                      {partner.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
