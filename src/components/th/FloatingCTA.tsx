import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";

const FloatingCTA = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <Button variant="cta" size="xl" asChild className="shadow-2xl animate-glow">
        <Link to="/th/signup" className="flex items-center gap-3">
          <UserPlus className="h-5 w-5" />
          สมัครสมาชิก
        </Link>
      </Button>
    </div>
  );
};

export default FloatingCTA;
