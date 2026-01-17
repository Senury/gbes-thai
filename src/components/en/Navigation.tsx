import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, ChevronDown } from "lucide-react";
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

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/en");
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
    console.log("Section clicked:", sectionId);
    console.log("Current location:", location.pathname);
    
    // If we're not on the home page, navigate there first, then scroll
    if (location.pathname !== '/en') {
      navigate('/en');
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
  };

  const handleHomeClick = () => {
    if (location.pathname !== '/en') {
      navigate('/en');
    } else {
      // Scroll to top if already on home page
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
            <Link to="/en" className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              GBES
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center gap-2">
              <button onClick={handleHomeClick} className="px-3 py-2 rounded-full text-sm text-foreground hover:text-primary hover:bg-primary/10 transition-colors whitespace-nowrap">
                Home
              </button>
              <button onClick={() => handleSectionClick('mission')} className="px-3 py-2 rounded-full text-sm text-foreground hover:text-primary hover:bg-primary/10 transition-colors whitespace-nowrap">
                Mission
              </button>
              <button onClick={() => handleSectionClick('services')} className="px-3 py-2 rounded-full text-sm text-foreground hover:text-primary hover:bg-primary/10 transition-colors whitespace-nowrap">
                Services
              </button>
              <Link to="/en/partner-search" className="px-3 py-2 rounded-full text-sm text-foreground hover:text-primary hover:bg-primary/10 transition-colors whitespace-nowrap">
                Partners
              </Link>
              <button onClick={() => handleSectionClick('pricing')} className="px-3 py-2 rounded-full text-sm text-foreground hover:text-primary hover:bg-primary/10 transition-colors whitespace-nowrap">
                Pricing
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-3 py-2 rounded-full text-sm text-foreground hover:text-primary transition-colors whitespace-nowrap" aria-label="More links">
                    <span className="mr-1">More</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSectionClick('contact')} className="px-3">
                    Contact
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/en/social-media')} className="px-3">
                    Social
                  </DropdownMenuItem>
                  <div className="h-px bg-border rounded" />
                  <DropdownMenuItem onClick={() => navigate('/ja')} className="px-3">
                    日本語
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/th')} className="px-3">
                    ไทย
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                {!user.user_metadata?.registered && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/en/register">Register</Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/en/login">Login</Link>
                </Button>
                <Button variant="cta" size="lg" asChild>
                  <Link to="/en/signup">Sign Up</Link>
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
              Home
            </button>
            <button onClick={() => handleSectionClick('mission')} className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium">
              Mission
            </button>
            <button onClick={() => handleSectionClick('services')} className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium">
              Services
            </button>
            <Link to="/en/partner-search" className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium" onClick={closeMenu}>
              Partner Search
            </Link>
            <button onClick={() => handleSectionClick('pricing')} className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium">
              Pricing
            </button>
            <button onClick={() => handleSectionClick('partners')} className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium">
              Partners
            </button>
            <button onClick={() => handleSectionClick('contact')} className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium">
              Contact
            </button>
            <Link to="/ja" className="text-muted-foreground hover:text-primary block px-3 py-2 text-base font-medium" onClick={closeMenu}>
              日本語
            </Link>
            <Link to="/th" className="text-muted-foreground hover:text-primary block px-3 py-2 text-base font-medium" onClick={closeMenu}>
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
                      <Link to="/en/register" onClick={closeMenu}>Register</Link>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => {
                    closeMenu();
                    handleSignOut();
                  }}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link to="/en/login" onClick={closeMenu}>Login</Link>
                  </Button>
                  <Button variant="cta" size="lg" className="w-full" asChild>
                    <Link to="/en/signup" onClick={closeMenu}>Sign Up</Link>
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
