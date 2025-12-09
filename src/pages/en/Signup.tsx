import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/en/Navigation";
import Footer from "@/components/en/Footer";
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
              <h2 className="text-2xl font-bold">Already Logged In</h2>
              <p className="text-muted-foreground">
                You're currently signed in. To register a new account, please sign out first.
              </p>
              <Button onClick={handleSignOut} variant="outline">
                Sign Out and Register New Account
              </Button>
              <Button onClick={() => navigate("/en")} variant="default">
                Go to Dashboard
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
          <SignupForm onSuccess={() => navigate("/en/login")} isEnglish={true} />
        </div>
      </main>
      <Footer />
    </div>
  );
}