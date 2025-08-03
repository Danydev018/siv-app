import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { SidebarApp } from "@/features/core/components/sidebar/SidebarApp";

export const Route = createRootRoute({
  component: () => (
    <>
      <SidebarProvider>
        <SidebarApp />
        <SidebarInset>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
      <TanStackRouterDevtools position="bottom-right" />
    </>
  ),
});
