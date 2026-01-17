import { Github, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-4">
              GBES
            </h3>
            <p className="text-muted-foreground mb-4">
              เสริมพลังให้ SME ญี่ปุ่นขยายธุรกิจไปทั่วโลกด้วยโซลูชันที่ขับเคลื่อนด้วย AI
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
            <h4 className="text-lg font-semibold text-foreground mb-4">ผลิตภัณฑ์</h4>
            <ul className="space-y-2">
              <li><a href="#services" className="text-muted-foreground hover:text-primary transition-colors">บริการ</a></li>
              <li><a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">ราคา</a></li>
              <li><a href="#partners" className="text-muted-foreground hover:text-primary transition-colors">พันธมิตร</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">API</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">บริษัท</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="text-muted-foreground hover:text-primary transition-colors">เกี่ยวกับ</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">ร่วมงานกับเรา</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">ข่าวสาร</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">บล็อก</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">สนับสนุน</h4>
            <ul className="space-y-2">
              <li><a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">ติดต่อ</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">เอกสาร</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">ศูนย์ช่วยเหลือ</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">นโยบายความเป็นส่วนตัว</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-muted-foreground">ภาษา:</span>
          <div className="flex gap-2">
            <Link to="/th" className="px-3 py-1 rounded-full border border-border text-foreground hover:border-primary hover:text-primary transition-colors">
              ไทย
            </Link>
            <Link to="/ja" className="px-3 py-1 rounded-full border border-border text-foreground hover:border-primary hover:text-primary transition-colors">
              日本語
            </Link>
            <Link to="/en" className="px-3 py-1 rounded-full border border-border text-foreground hover:border-primary hover:text-primary transition-colors">
              English
            </Link>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2024 GBES. สงวนลิขสิทธิ์
          </p>
          <p className="text-muted-foreground text-sm mt-2 md:mt-0">
            สร้างด้วย ❤️ เพื่อการขยายธุรกิจระดับโลก
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
