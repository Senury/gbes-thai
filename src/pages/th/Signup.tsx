import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/th/Navigation";
import Footer from "@/components/th/Footer";
import SignupForm from "@/components/auth/SignupForm";
import { Button } from "@/components/ui/button";

export default function Signup() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-20">
          <div className="flex justify-center">
            <div className="w-full max-w-md mx-auto text-center space-y-4">
              <h2 className="text-2xl font-bold">เข้าสู่ระบบแล้ว</h2>
              <p className="text-muted-foreground">
                คุณเข้าสู่ระบบอยู่แล้ว หากต้องการลงทะเบียนบัญชีใหม่ กรุณาออกจากระบบก่อน
              </p>
              <Button onClick={handleSignOut} variant="outline">
                ออกจากระบบและลงทะเบียนบัญชีใหม่
              </Button>
              <Button onClick={() => navigate("/th")} variant="default">
                ไปที่แดชบอร์ด
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-20">
        <div className="flex justify-center">
          <SignupForm onSuccess={() => navigate("/th/login")} isEnglish={false} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
