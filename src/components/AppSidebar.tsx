import { useState } from "react";
import { 
  Home, 
  User, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Shield,
  BarChart3
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
  language?: 'en' | 'ja';
}

export function AppSidebar({ language = 'en' }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const currentPath = location.pathname;

  const isEnglish = language === 'en';

  const userItems = [
    { 
      title: isEnglish ? "Dashboard" : "ダッシュボード", 
      url: `/${language}/dashboard`, 
      icon: Home 
    },
    { 
      title: isEnglish ? "Profile" : "プロフィール", 
      url: `/${language}/profile`, 
      icon: User 
    },
    { 
      title: isEnglish ? "Registration" : "登録", 
      url: `/${language}/register`, 
      icon: FileText 
    },
  ];

  const adminItems = [
    { 
      title: isEnglish ? "Admin Panel" : "管理パネル", 
      url: `/${language}/admin`, 
      icon: Shield 
    },
    { 
      title: isEnglish ? "All Users" : "全ユーザー", 
      url: `/${language}/admin/users`, 
      icon: Users 
    },
    { 
      title: isEnglish ? "Analytics" : "分析", 
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
          title: isEnglish ? "Error" : "エラー",
          description: isEnglish ? "Failed to sign out" : "サインアウトに失敗しました",
        });
      } else {
        toast({
          title: isEnglish ? "Signed out successfully" : "サインアウトしました",
        });
        navigate(`/${language}`);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: isEnglish ? "Error" : "エラー",
        description: isEnglish ? "Failed to sign out" : "サインアウトに失敗しました",
      });
    }
  };

  if (!user) return null;

  return (
    <Sidebar
      className={state === "collapsed" ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        {/* User Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {isEnglish ? "Main" : "メイン"}
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
            {isEnglish ? "Admin" : "管理"}
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
                  {state !== "collapsed" && <span>{isEnglish ? "Sign Out" : "サインアウト"}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}