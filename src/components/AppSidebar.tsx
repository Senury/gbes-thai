import { 
  Home, 
  User, 
  Users, 
  FileText, 
  LogOut,
  Shield,
  BarChart3,
  ArrowLeft
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  language?: 'en' | 'ja' | 'th';
}

export function AppSidebar({ language = 'en' }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const currentPath = location.pathname;

  const getText = (en: string, ja: string, th: string) => {
    if (language === 'en') return en;
    if (language === 'th') return th;
    return ja;
  };

  const userItems = [
    { 
      title: getText("Dashboard", "ダッシュボード", "แดชบอร์ด"), 
      url: `/${language}/dashboard`, 
      icon: Home 
    },
    { 
      title: getText("Profile", "プロフィール", "โปรไฟล์"), 
      url: `/${language}/profile`, 
      icon: User 
    },
    { 
      title: getText("Registration", "登録", "ลงทะเบียน"), 
      url: `/${language}/register`, 
      icon: FileText 
    },
  ];

  const adminItems = [
    { 
      title: getText("Admin Panel", "管理パネル", "แผงผู้ดูแล"), 
      url: `/${language}/admin`, 
      icon: Shield 
    },
    { 
      title: getText("All Users", "全ユーザー", "ผู้ใช้ทั้งหมด"), 
      url: `/${language}/admin/users`, 
      icon: Users 
    },
    { 
      title: getText("Analytics", "分析", "การวิเคราะห์"), 
      url: `/${language}/admin/analytics`, 
      icon: BarChart3 
    },
  ];

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/20 text-primary font-medium" : "hover:bg-muted/50";

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          variant: "destructive",
          title: getText("Error", "エラー", "ข้อผิดพลาด"),
          description: getText("Failed to sign out", "サインアウトに失敗しました", "ออกจากระบบล้มเหลว"),
        });
      } else {
        toast({
          title: getText("Signed out successfully", "サインアウトしました", "ออกจากระบบเรียบร้อย"),
        });
        navigate(`/${language}`);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: getText("Error", "エラー", "ข้อผิดพลาด"),
        description: getText("Failed to sign out", "サインアウトに失敗しました", "ออกจากระบบล้มเหลว"),
      });
    }
  };

  if (!user) return null;

  return (
    <Sidebar
      className={state === "collapsed" ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <div className="flex items-center px-2 pt-2 gap-2">
        <div className={`flex-1 flex ${state === "collapsed" ? "justify-center" : "justify-start"}`}>
          <SidebarTrigger />
        </div>
        <div className="w-[160px] flex justify-end">
          <button
            onClick={() => navigate(`/${language === 'ja' ? 'ja' : language === 'th' ? 'th' : 'en'}`)}
            className={`flex items-center text-sm text-muted-foreground transition-colors ${
              state === 'collapsed' ? 'opacity-0 pointer-events-none select-none' : 'hover:text-foreground'
            }`}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            <span>{getText("Back to site", "サイトに戻る", "กลับสู่เว็บไซต์")}</span>
          </button>
        </div>
      </div>

      <SidebarContent>
        {/* User Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {getText("Main", "メイン", "หลัก")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Menu - Show only for admin users */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {getText("Admin", "管理", "ผู้ดูแล")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings & Logout */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {state !== "collapsed" && <span>{getText("Sign Out", "サインアウト", "ออกจากระบบ")}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
