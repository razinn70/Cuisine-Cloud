
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { ChefHat, UtensilsCrossed, Plus, Calendar, BarChart3, Wand2, LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";

const navLinks = [
  { href: "/", label: "Discover", icon: UtensilsCrossed },
  { href: "/create-recipe", label: "Create Recipe", icon: Plus },
  { href: "/meal-planner", label: "Meal Planner", icon: Calendar },
  { href: "/generate-recipe", label: "Generate Recipe", icon: Wand2, pro: true },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { user, logOut } = useAuth();

  return (
    <>
      <SidebarContent className="pt-8">
        <SidebarMenu>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            if (!user && (link.href === '/create-recipe' || link.href === '/meal-planner' || link.href === '/analytics' || link.href === '/generate-recipe')) {
              return null;
            }
            return (
              <SidebarMenuItem key={link.href}>
                <Link href={link.href}>
                  <SidebarMenuButton isActive={isActive} tooltip={{children: link.label}}>
                    <link.icon />
                    <span>{link.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      {user && (
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={logOut} tooltip={{children: 'Log Out'}}>
                        <LogOut />
                        <span>Log Out</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      )}
    </>
  );
}
