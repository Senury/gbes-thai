import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, ChevronDown, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { hasSubscription, isPremium, loading: roleLoading, registrationCompleted } = useUserRole();
  const isRegistrationComplete =
    registrationCompleted ||
    Boolean(user?.user_metadata?.registered) ||
    user?.user_metadata?.registration_status === 'completed';
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/th");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleSectionClick = (sectionId: string) => {
    if (location.pathname !== '/th') {
      navigate('/th');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    closeMenu();
  };

  const handleHomeClick = () => {
    if (location.pathname !== '/th') {
      navigate('/th');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    closeMenu();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/th" className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              GBES
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center gap-2 text-sm">
              <button onClick={handleHomeClick} className="px-3 py-2 rounded-full text-foreground hover:text-primary hover:bg-primary/10 transition-colors whitespace-nowrap">
                หน้าแรก
              </button>
              <button onClick={() => handleSectionClick('mission')} className="px-3 py-2 rounded-full text-foreground hover:text-primary hover:bg-primary/10 transition-colors whitespace-nowrap">
                พันธกิจ
              </button>
              <button onClick={() => handleSectionClick('services')} className="px-3 py-2 rounded-full text-foreground hover:text-primary hover:bg-primary/10 transition-colors whitespace-nowrap">
                บริการ
              </button>
              <Link to="/th/partner-search" className="px-3 py-2 rounded-full text-foreground hover:text-primary hover:bg-primary/10 transition-colors whitespace-nowrap">
                ค้นหาพันธมิตร
              </Link>
              <button onClick={() => handleSectionClick('pricing')} className="px-3 py-2 rounded-full text-foreground hover:text-primary hover:bg-primary/10 transition-colors whitespace-nowrap">
                ราคา
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-3 py-2 rounded-full text-foreground hover:text-primary transition-colors whitespace-nowrap" aria-label="เมนูเพิ่มเติม">
                    <span className="mr-1">เพิ่มเติม</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSectionClick('contact')} className="px-3">
                    ติดต่อ
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/th/social-media')} className="px-3">
                    โซเชียล
                  </DropdownMenuItem>
                  <div className="h-px bg-border rounded" />
                  <DropdownMenuItem onClick={() => navigate('/ja')} className="px-3">
                    日本語
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/en')} className="px-3">
                    English
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate('/th/dashboard')}>
                  <User className="h-4 w-4 mr-2" />
                  {user.email}
                </Button>
                {!roleLoading && !(hasSubscription || isPremium || isRegistrationComplete) && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/th/register">ลงทะเบียน</Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  ออกจากระบบ
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/th/login">เข้าสู่ระบบ</Link>
                </Button>
                <Button variant="cta" size="lg" asChild>
                  <Link to="/th/signup">สมัครสมาชิก</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
            <button onClick={handleHomeClick} className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium text-left w-full">
              หน้าแรก
            </button>
            <button onClick={() => handleSectionClick('mission')} className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium">
              พันธกิจ
            </button>
            <button onClick={() => handleSectionClick('services')} className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium">
              บริการ
            </button>
            <Link to="/th/partner-search" className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium" onClick={closeMenu}>
              ค้นหาพันธมิตร
            </Link>
            <button onClick={() => handleSectionClick('pricing')} className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium">
              ราคา
            </button>
            <button onClick={() => handleSectionClick('partners')} className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium">
              พันธมิตร
            </button>
            <button onClick={() => handleSectionClick('contact')} className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium">
              ติดต่อ
            </button>
            <Link to="/en" className="text-muted-foreground hover:text-primary block px-3 py-2 text-base font-medium" onClick={closeMenu}>
              English
            </Link>
            <Link to="/ja" className="text-muted-foreground hover:text-primary block px-3 py-2 text-base font-medium" onClick={closeMenu}>
              日本語
            </Link>
            
            <div className="px-3 py-2 space-y-2">
              {user ? (
                <>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => { closeMenu(); navigate('/th/dashboard'); }}>
                    <User className="h-4 w-4 mr-2" />
                    {user.email}
                  </Button>
                  {!roleLoading && !(hasSubscription || isPremium || isRegistrationComplete) && (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link to="/th/register" onClick={closeMenu}>ลงทะเบียน</Link>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => {
                    closeMenu();
                    handleSignOut();
                  }}>
                    <LogOut className="h-4 w-4 mr-2" />
                    ออกจากระบบ
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link to="/th/login" onClick={closeMenu}>เข้าสู่ระบบ</Link>
                  </Button>
                  <Button variant="cta" size="lg" className="w-full" asChild>
                    <Link to="/th/signup" onClick={closeMenu}>สมัครสมาชิก</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
