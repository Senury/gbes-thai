import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            お問い合わせ
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            始める準備はできましたか？今日お問い合わせいただき、一緒に素晴らしいものを構築しましょう。
          </p>
          <p className="text-sm text-primary/70 mt-4 max-w-2xl mx-auto">
            ※ お問い合わせ機能をご利用いただくには、ログインしてアカウント登録が必要です。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                メッセージを送信
              </h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      姓
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      placeholder="田中"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      名
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      placeholder="太郎"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="tanaka@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    メッセージ
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                    placeholder="プロジェクトについて教えてください..."
                  />
                </div>
                <Button variant="hero" size="lg" className="w-full group">
                  メッセージを送信
                  <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="bg-card/50 backdrop-blur-sm border-border hover:shadow-glow transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">メール</h4>
                    <p className="text-muted-foreground">hello@proto.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border hover:shadow-glow transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">電話</h4>
                    <p className="text-muted-foreground">+81 (3) 1234-5678</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border hover:shadow-glow transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">オフィス</h4>
                    <p className="text-muted-foreground">東京, 日本</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;