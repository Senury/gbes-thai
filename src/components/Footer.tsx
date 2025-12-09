import { Github, Twitter, Linkedin, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              GBES
            </div>
            <p className="text-muted-foreground">
              日本の中小企業のグローバル展開を支援するAI搭載プラットフォームです。
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">プロダクト</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">機能</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">料金</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">API</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">ドキュメント</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">会社</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">会社概要</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">ブログ</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">採用情報</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">お問い合わせ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">サポート</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">ヘルプセンター</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">ステータス</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">利用規約</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">プライバシー</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2024 GBES。すべての権利を保有しています。
          </p>
          <p className="text-muted-foreground text-sm flex items-center">
            <Heart className="h-4 w-4 text-red-500 mx-1" /> GBESチームによって作られました
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;