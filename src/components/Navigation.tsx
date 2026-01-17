import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
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
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate("/ja");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, [signOut, navigate]);

  const handleMenuToggle = useCallback(() => {
    console.log("Menu toggle clicked, current state:", isOpen);
    setIsOpen(prev => !prev);
  }, [isOpen]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSectionClick = useCallback((sectionId: string) => {
    console.log("Section clicked:", sectionId);
    console.log("Current location:", location.pathname);
    
    // If we're not on the home page, navigate there first, then scroll
    if (location.pathname !== '/ja') {
      navigate('/ja');
      // Use setTimeout to ensure navigation completes before scrolling
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        console.log("Element found:", element);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // If we're already on home page, just scroll
      const element = document.getElementById(sectionId);
      console.log("Element found on same page:", element);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    closeMenu();
  }, [navigate, location.pathname, closeMenu]);

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              GBES
            </div>
          </div>
          
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center gap-2 text-sm">
              <button onClick={() => handleSectionClick('home')} className="px-3 py-2 rounded-full text-foreground hover:text-primary hover:bg-primary/10 transition-colors whitespace-nowrap">
                ホーム
              </button>
              <button onClick={() => handleSectionClick('mission')} className="px-3 py-2 rounded-full text-foreground hover:text-primary hover:bg-primary/10 transition-colors whitespace-nowrap">
                ミッション
              </button>
              <button onClick={() => handleSectionClick('services')} className="px-3 py-2 rounded-full text-foreground hover:text-primary hover:bg-primary/10 transition-colors whitespace-nowrap">
                サービス
              </button>
              <Link to="/ja/partner-search" className="px-3 py-2 rounded-full text-foreground hover:text-primary hover:bg-primary/10 transition-colors whitespace-nowrap">
                パートナー探し
              </Link>
              <button onClick={() => handleSectionClick('pricing')} className="px-3 py-2 rounded-full text-foreground hover:text-primary hover:bg-primary/10 transition-colors whitespace-nowrap">
                料金プラン
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-3 py-2 rounded-full text-foreground hover:text-primary transition-colors whitespace-nowrap" aria-label="その他メニュー">
                    <span className="mr-1">その他</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSectionClick('contact')} className="px-3">
                    お問い合わせ
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/ja/social-media')} className="px-3">
                    SNS自動化
                  </DropdownMenuItem>
                  <div className="h-px bg-border rounded" />
                  <DropdownMenuItem onClick={() => navigate('/en')} className="px-3">
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/th')} className="px-3">
                    ไทย
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                {!user.user_metadata?.registered && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/ja/register">登録</Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  ログアウト
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/ja/login">ログイン</Link>
                </Button>
                <Button variant="cta" size="lg" asChild>
                  <Link to="/ja/signup">新規登録</Link>
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMenuToggle}
            >
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background/95 backdrop-blur-md">
            <Link to="/ja" className="block px-3 py-2 text-foreground hover:text-primary transition-colors duration-200" onClick={closeMenu}>
              ホーム
            </Link>
            <button onClick={() => handleSectionClick('mission')} className="block px-3 py-2 text-foreground hover:text-primary transition-colors duration-200">
              ミッション
            </button>
            <button onClick={() => handleSectionClick('services')} className="block px-3 py-2 text-foreground hover:text-primary transition-colors duration-200">
              サービス
            </button>
            <Link to="/ja/partner-search" className="block px-3 py-2 text-foreground hover:text-primary transition-colors duration-200" onClick={closeMenu}>
              パートナー探し
            </Link>
            <button onClick={() => handleSectionClick('pricing')} className="block px-3 py-2 text-foreground hover:text-primary transition-colors duration-200">
              料金プラン
            </button>
            <button onClick={() => handleSectionClick('contact')} className="block px-3 py-2 text-foreground hover:text-primary transition-colors duration-200">
              お問い合わせ
            </button>
            <Link to="/en" className="block px-3 py-2 text-muted-foreground hover:text-primary transition-colors duration-200" onClick={closeMenu}>
              English
            </Link>
            <Link to="/th" className="block px-3 py-2 text-muted-foreground hover:text-primary transition-colors duration-200" onClick={closeMenu}>
              ไทย
            </Link>
            <div className="px-3 py-2 space-y-2">
              {user ? (
                <>
                  <div className="text-sm text-muted-foreground px-3">
                    {user.email}
                  </div>
                  {!user.user_metadata?.registered && (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link to="/ja/register">登録</Link>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="w-full" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    ログアウト
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link to="/ja/login">ログイン</Link>
                  </Button>
                  <Button variant="cta" size="lg" className="w-full" asChild>
                    <Link to="/ja/signup">新規登録</Link>
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
