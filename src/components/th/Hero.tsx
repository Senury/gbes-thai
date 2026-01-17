import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/70" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
          ยินดีต้อนรับสู่{" "}
          <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Global Business System
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          แพลตฟอร์มอัจฉริยะที่ขับเคลื่อนด้วย AI สนับสนุนการขยายธุรกิจระดับโลกสำหรับ SME ญี่ปุ่น<br />
          การสนับสนุนครบวงจรตั้งแต่การแปลภาษาไปจนถึงการจัดจำหน่ายดิจิทัลและการค้นหาพันธมิตร
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button variant="cta" size="xl" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300">
            ลงทะเบียนเลยและเชื่อมต่อกับโลก
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-6">
            เรียนรู้เพิ่มเติม
          </Button>
        </div>

        <div className="mt-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <div className="h-2 w-2 bg-primary rounded-full mr-2"></div>
            <span className="text-base font-medium text-foreground">ไลฟ์ • ผู้ใช้งานออนไลน์ 1,234 ราย</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
