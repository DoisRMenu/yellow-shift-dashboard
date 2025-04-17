
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Clock, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

export function MainSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Servidor 10</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Sistema de Ponto">
                  <Link to="/">
                    <Clock className="h-4 w-4" />
                    <span>Sistema de Ponto</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard de Turnos">
                  <Link to="/">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard de Turnos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Administradores">
                  <Link to="/">
                    <UserRound className="h-4 w-4" />
                    <span>Administradores</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
