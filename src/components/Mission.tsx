import { Button } from "@/components/ui/button";
import { CheckCircle, Target, Shield, Globe2 } from "lucide-react";

const Mission = () => {
  const benefits = [
    "多言語対応の製品翻訳ツール",
    "SNSやGoogleマップなど複数チャネルへの情報一括配信", 
    "信頼できる海外パートナーとのマッチング",
    "決済機能"
  ];

  return (
    <section id="mission" className="py-20 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                私たちの目的
              </span>
            </h2>
            <h3 className="text-2xl md:text-3xl font-semibold text-foreground mb-8">
              中小企業の国際進出をもっと簡単に
            </h3>
            
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            <Button variant="hero" size="lg">
              詳細を見る
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-primary rounded-2xl p-6 shadow-glow">
              <div className="bg-background/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Target className="h-8 w-8 text-primary-foreground mb-3" />
                <h4 className="text-lg font-semibold text-primary-foreground mb-2">
                  一括ソリューション
                </h4>
                <p className="text-primary-foreground/80 text-sm">
                  翻訳からマーケティングまで、すべてを統合
                </p>
              </div>
            </div>

            <div className="bg-gradient-primary rounded-2xl p-6 shadow-glow">
              <div className="bg-background/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Shield className="h-8 w-8 text-primary-foreground mb-3" />
                <h4 className="text-lg font-semibold text-primary-foreground mb-2">
                  安全な取引
                </h4>
                <p className="text-primary-foreground/80 text-sm">
                  ISO認証と国際コンプライアンス準拠
                </p>
              </div>
            </div>

            <div className="bg-gradient-primary rounded-2xl p-6 shadow-glow md:col-span-2">
              <div className="bg-background/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Globe2 className="h-8 w-8 text-primary-foreground mb-3" />
                <h4 className="text-lg font-semibold text-primary-foreground mb-2">
                  グローバルネットワーク
                </h4>
                <p className="text-primary-foreground/80 text-sm">
                  JETRO、商工会議所、ロータリークラブとの連携により、信頼できるビジネス展開をサポート
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;