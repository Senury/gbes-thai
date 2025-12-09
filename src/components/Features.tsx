import { Card, CardContent } from "@/components/ui/card";
import { Languages, Megaphone, Users, CreditCard, Bot, Search } from "lucide-react";

const features = [
  {
    icon: Languages,
    title: "多言語翻訳ツール",
    description: "製品情報や企業紹介を複数言語に自動翻訳し、グローバル市場への展開をサポートします。"
  },
  {
    icon: Megaphone,
    title: "複数チャネル一括配信",
    description: "Instagram、Facebook、Googleマップ、X（旧Twitter）など主要SNSへの情報配信を一括管理。"
  },
  {
    icon: Search,
    title: "パートナーマッチング",
    description: "信頼できる海外パートナーとのマッチング機能で、安全で効率的なビジネス展開を実現。"
  },
  {
    icon: CreditCard,
    title: "決済対応",
    description: "安全で効率的な国際決済システムで、取引コストと時間を削減。"
  },
  {
    icon: Bot,
    title: "AIサポート",
    description: "国際取引に関する質問対応や市場分析など、AI搭載のビジネスサポート機能。"
  },
  {
    icon: Users,
    title: "企業審査・構造化",
    description: "企業情報の構造化と審査機能で、海外展開における信頼性とプレゼンテーション力を向上。"
  }
];

const Features = () => {
  return (
    <section id="services" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            サービス概要
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            中小企業の国際進出に必要なすべてを一つのダッシュボードで提供します。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-glow transition-all duration-300 hover:scale-105 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50"
            >
              <CardContent className="p-6">
                <div className="mb-4">
                  <feature.icon className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;