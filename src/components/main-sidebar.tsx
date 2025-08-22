"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  ClipboardCheck,
  GitMerge,
  BrainCircuit,
  Upload,
  Settings,
  CircleUser,
  LogOut,
} from "lucide-react";

import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assessment", label: "Skill Assessment", icon: ClipboardCheck },
  { href: "/roadmap", label: "My Roadmap", icon: GitMerge },
  { href: "/study", label: "Study Zone", icon: BrainCircuit },
  { href: "/upload", label: "Upload Material", icon: Upload },
];

export function MainSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary-foreground/80" />
          <span className="text-xl font-bold font-headline text-primary-foreground">
            StudyGenius
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <SidebarMenu>
           <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings">
                <Link href="#">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Log out">
                <Link href="/">
                  <LogOut />
                  <span>Log Out</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center gap-3 p-2 rounded-md bg-sidebar-accent/10">
            <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarImage src="https://placehold.co/100x100.png" alt="@user" />
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
                <p className="font-semibold truncate">User Name</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">user@example.com</p>
            </div>
        </div>
      </SidebarFooter>
    </>
  );
}
