import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppNav } from "@/components/AppNav";
import { useIsMobile } from "@/hooks/use-mobile";
type AppLayoutProps = {
  children: React.ReactNode;
};
export function AppLayout({ children }: AppLayoutProps): JSX.Element {
  const isMobile = useIsMobile();
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <AppNav />
      <SidebarInset>
        <div className="absolute left-2 top-2 z-20 lg:hidden">
          <SidebarTrigger />
        </div>
        <main className="h-screen overflow-y-auto bg-muted/40">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}