"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ChefHat, UtensilsCrossed, Plus, Calendar } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";

const navLinks = [
  { href: "/", label: "Discover", icon: UtensilsCrossed },
  { href: "/create-recipe", label: "Create Recipe", icon: Plus },
  { href: "/meal-planner", label: "Meal Planner", icon: Calendar },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <ChefHat className="w-6 h-6 text-primary" />
          <span className="font-bold font-headline text-lg group-data-[collapsible=icon]:hidden">
            Cuisine Cloud
          </span>
        </div>
        <div className="ml-auto">
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            if (!user && (link.href === '/create-recipe' || link.href === '/meal-planner')) {
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
    </>
  );
}
