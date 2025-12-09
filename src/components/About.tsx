import { Button } from "@/components/ui/button";
import { CheckCircle, Shield, Eye, FileText } from "lucide-react";

const About = () => {
  const securityFeatures = [
    "ISO認証取得を予定（情報セキュリティ基準）",
    "データの透明性と契約の明確化", 
    "国内外の法律とコンプライアンスに準拠",
    "エンドツーエンド暗号化によるデータ保護",
    "定期的なセキュリティ監査と更新"
  ];

  return (
    <section id="trust" className="py-20 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                安全性と信頼
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              GBESは最高レベルのセキュリティ基準と透明性を維持し、
              お客様のビジネス情報と取引を安全に保護します。
              国際基準に準拠した信頼できるプラットフォームを提供しています。
            </p>
            
            <div className="space-y-4 mb-8">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <Button variant="hero" size="lg">
              セキュリティ詳細
            </Button>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-primary rounded-2xl p-6 shadow-glow">
              <div className="bg-background/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                <Shield className="h-8 w-8 text-primary-foreground mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-primary-foreground mb-2">
                  ISO認証準拠
                </h4>
                <p className="text-primary-foreground/80 text-sm">
                  国際セキュリティ基準に基づく安全なシステム設計
                </p>
              </div>
            </div>

            <div className="bg-gradient-primary rounded-2xl p-6 shadow-glow">
              <div className="bg-background/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                <Eye className="h-8 w-8 text-primary-foreground mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-primary-foreground mb-2">
                  完全な透明性
                </h4>
                <p className="text-primary-foreground/80 text-sm">
                  すべての取引と契約条件を明確に開示
                </p>
              </div>
            </div>

            <div className="bg-gradient-primary rounded-2xl p-6 shadow-glow">
              <div className="bg-background/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                <FileText className="h-8 w-8 text-primary-foreground mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-primary-foreground mb-2">
                  法的コンプライアンス
                </h4>
                <p className="text-primary-foreground/80 text-sm">
                  国内外の法律と規制に完全準拠
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;