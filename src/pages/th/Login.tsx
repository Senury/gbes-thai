import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/th/Navigation";
import Footer from "@/components/th/Footer";
import LoginForm from "@/components/auth/LoginForm";

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/th");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-20">
        <div className="flex justify-center">
          <LoginForm onSuccess={() => navigate("/th/dashboard")} isEnglish={false} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
