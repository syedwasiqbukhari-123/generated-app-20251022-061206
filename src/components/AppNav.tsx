import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { NAV_LINKS, APP_NAME } from '@/lib/constants';
import { Button } from './ui/button';
import { useSettingsStore } from '@/stores/settingsStore';
export function AppNav(): JSX.Element {
  const { pathname } = useLocation();
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);
  const { logoUrl, fetchLogoUrl } = useSettingsStore();
  useEffect(() => {
    fetchLogoUrl();
  }, [fetchLogoUrl]);
  const visibleLinks = NAV_LINKS.filter(link => user?.role && link.roles.includes(user.role));
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          {logoUrl ? (
            <div className="bg-muted/50 p-1 rounded-md">
              <img src={logoUrl} alt="App Logo" className="h-6 w-auto object-contain" />
            </div>
          ) : null}
          <span className="text-lg font-bold uppercase tracking-wider text-foreground">{APP_NAME}</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-grow">
        <SidebarMenu>
          {visibleLinks.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton asChild isActive={pathname.startsWith(link.href)}>
                <Link to={link.href}>
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-4 p-2">
            <div className="text-sm">
                <div className="font-semibold text-foreground">{user?.name}</div>
                <div className="text-muted-foreground">{user?.role}</div>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={logout}>
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
            </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}