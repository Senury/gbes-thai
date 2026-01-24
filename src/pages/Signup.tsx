import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SignupForm from "@/components/auth/SignupForm";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import PageShell from "@/components/PageShell";

export default function Signup() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const localePrefix = i18n.language === "ja" ? "ja" : i18n.language === "th" ? "th" : "en";

  const handleSignOut = async () => {
    await signOut();
    // User will be redirected to signup form after sign out
  };

  // If user is already logged in, show option to sign out and register new account
  if (user) {
    return (
        <div className="min-h-screen bg-background">
          <Navigation />
        <PageShell className="container mx-auto px-4 py-20">
          <div className="flex justify-center">
            <div className="w-full max-w-md mx-auto text-center space-y-4">
              <h2 className="text-2xl font-bold">{t("auth.signup.alreadyLoggedInTitle")}</h2>
              <p className="text-muted-foreground">
                {t("auth.signup.alreadyLoggedInDescription")}
              </p>
              <Button onClick={handleSignOut} variant="outline">
                {t("auth.signup.signOutToRegister")}
              </Button>
              <Button onClick={() => navigate(`/${localePrefix}`)} variant="default">
                {t("auth.signup.goToDashboard")}
              </Button>
            </div>
          </div>
        </PageShell>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageShell className="container mx-auto px-4 py-20">
        <div className="flex justify-center">
          <SignupForm onSuccess={() => navigate(`/${localePrefix}/login`)} />
        </div>
      </PageShell>
      <Footer />
    </div>
  );
}
