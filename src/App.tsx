import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import English from "./pages/English";
import Japanese from "./pages/Japanese";
import Thai from "./pages/Thai";
import Register from "./pages/Register";
import EnglishRegister from "./pages/en/Register";
import ThaiRegister from "./pages/th/Register";
import Login from "./pages/Login";
import EnglishLogin from "./pages/en/Login";
import ThaiLogin from "./pages/th/Login";
import Signup from "./pages/Signup";
import EnglishSignup from "./pages/en/Signup";
import ThaiSignup from "./pages/th/Signup";
import Dashboard from "./pages/Dashboard";
import EnglishDashboard from "./pages/en/Dashboard";
import ThaiDashboard from "./pages/th/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import EnglishAdminPanel from "./pages/en/AdminPanel";
import ThaiAdminPanel from "./pages/th/AdminPanel";
import Profile from "./pages/Profile";
import EnglishProfile from "./pages/en/Profile";
import ThaiProfile from "./pages/th/Profile";
import SocialMediaAutomation from "./pages/SocialMediaAutomation";
import EnglishSocialMediaAutomation from "./pages/en/SocialMediaAutomation";
import ThaiSocialMediaAutomation from "./pages/th/SocialMediaAutomation";
import EmailTest from "./pages/EmailTest";
import SimpleEmailTest from "./pages/SimpleEmailTest";
import NotFound from "./pages/NotFound";
import PartnerSearch from "./pages/PartnerSearch";
import EnglishPartnerSearch from "./pages/en/PartnerSearch";
import ThaiPartnerSearch from "./pages/th/PartnerSearch";
import { AuthProvider } from "@/hooks/useAuth";

// Language detection utility
const detectLanguage = () => {
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('ja')) return 'ja';
  if (browserLang.startsWith('th')) return 'th';
  return 'en';
};

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Navigate to={`/${detectLanguage()}`} replace />} />
          <Route path="/dashboard" element={<Navigate to={`/${detectLanguage()}/dashboard`} replace />} />
          <Route path="/ja" element={<Japanese />} />
          <Route path="/ja/dashboard" element={<Dashboard />} />
          <Route path="/ja/admin" element={<AdminPanel />} />
          <Route path="/ja/profile" element={<Profile />} />
          <Route path="/ja/social-media" element={<SocialMediaAutomation />} />
          <Route path="/ja/partner-search" element={<PartnerSearch />} />
          <Route path="/ja/register" element={<Register />} />
          <Route path="/ja/login" element={<Login />} />
          <Route path="/ja/signup" element={<Signup />} />
          <Route path="/en" element={<English />} />
          <Route path="/en/dashboard" element={<EnglishDashboard />} />
          <Route path="/en/admin" element={<EnglishAdminPanel />} />
          <Route path="/en/profile" element={<EnglishProfile />} />
          <Route path="/en/social-media" element={<EnglishSocialMediaAutomation />} />
          <Route path="/en/partner-search" element={<EnglishPartnerSearch />} />
          <Route path="/en/register" element={<EnglishRegister />} />
          <Route path="/en/login" element={<EnglishLogin />} />
          <Route path="/en/signup" element={<EnglishSignup />} />
          <Route path="/th" element={<Thai />} />
          <Route path="/th/dashboard" element={<ThaiDashboard />} />
          <Route path="/th/admin" element={<ThaiAdminPanel />} />
          <Route path="/th/login" element={<ThaiLogin />} />
          <Route path="/th/signup" element={<ThaiSignup />} />
          <Route path="/th/register" element={<ThaiRegister />} />
          <Route path="/th/profile" element={<ThaiProfile />} />
          <Route path="/th/social-media" element={<ThaiSocialMediaAutomation />} />
          <Route path="/th/partner-search" element={<ThaiPartnerSearch />} />
          <Route path="/index" element={<Index />} />
          <Route path="/email-test" element={<EmailTest />} />
          <Route path="/simple-email-test" element={<SimpleEmailTest />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
