import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LoginForm from "@/components/auth/LoginForm";
import { useTranslation } from "react-i18next";
import PageShell from "@/components/PageShell";

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const localePrefix = i18n.language === "ja" ? "ja" : i18n.language === "th" ? "th" : "en";

  useEffect(() => {
    if (user) {
      navigate(`/${localePrefix}`);
    }
  }, [user, navigate, localePrefix]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageShell className="container mx-auto px-4 py-20">
        <div className="flex justify-center">
          <LoginForm onSuccess={() => navigate(`/${localePrefix}/dashboard`)} />
        </div>
      </PageShell>
      <Footer />
    </div>
  );
}
