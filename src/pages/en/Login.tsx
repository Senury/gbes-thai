import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/en/Navigation";
import Footer from "@/components/en/Footer";
import LoginForm from "@/components/auth/LoginForm";

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/en");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-20">
        <div className="flex justify-center">
          <LoginForm onSuccess={() => navigate("/en/dashboard")} isEnglish={true} />
        </div>
      </main>
      <Footer />
    </div>
  );
}