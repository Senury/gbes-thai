import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SignupForm from "@/components/auth/SignupForm";
import { Button } from "@/components/ui/button";

export default function Signup() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    // User will be redirected to signup form after sign out
  };

  // If user is already logged in, show option to sign out and register new account
  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-20">
          <div className="flex justify-center">
            <div className="w-full max-w-md mx-auto text-center space-y-4">
              <h2 className="text-2xl font-bold">すでにログインしています</h2>
              <p className="text-muted-foreground">
                現在ログインしています。新しいアカウントを登録するには、まずサインアウトしてください。
              </p>
              <Button onClick={handleSignOut} variant="outline">
                サインアウトして新しいアカウントを登録
              </Button>
              <Button onClick={() => navigate("/ja")} variant="default">
                ダッシュボードに移動
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
          <SignupForm onSuccess={() => navigate("/ja/login")} />
        </div>
      </main>
      <Footer />
    </div>
  );
}