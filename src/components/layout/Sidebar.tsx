"use client";

import React, { useState } from "react";
import { useFarmStore, UserRole } from "@/store/useFarmStore";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { 
  LayoutDashboard, ShoppingBag, Truck, Warehouse, ShieldAlert,
  PlusCircle, FolderHeart, History, Landmark, ThermometerSnowflake,
  ClipboardList, Users, ShieldCheck, Heart, User, Settings, HelpCircle,
  Menu, ChevronLeft, ChevronRight, MessageSquare, CloudSun, Activity
} from "lucide-react";
import { motion } from "framer-motion";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  
  const { currentUser } = useFarmStore();
  const [collapsed, setCollapsed] = useState(false);

  const roleMenuConfigs: Record<UserRole, SidebarItem[]> = {
    Farmer: [
      { id: "overview", label: "Dashboard", icon: LayoutDashboard },
      { id: "upload", label: "Upload & AI Diagnosis", icon: PlusCircle },
      { id: "inventory", label: "My Inventory", icon: ClipboardList },
      { id: "bookings", label: "Logistics Booking", icon: Truck },
      { id: "schemes", label: "Govt Schemes", icon: Landmark },
      { id: "weather", label: "Weather Forecast", icon: CloudSun },
    ],
    Buyer: [
      { id: "overview", label: "Dashboard", icon: LayoutDashboard },
      { id: "marketplace", label: "Browse Crops", icon: ShoppingBag },
      { id: "orders", label: "Track Orders", icon: History },
      { id: "wishlist", label: "Wishlist", icon: Heart },
    ],
    Transport: [
      { id: "overview", label: "Dashboard", icon: LayoutDashboard },
      { id: "requests", label: "Booking Requests", icon: Truck },
      { id: "vehicles", label: "My Fleet", icon: Settings },
    ],
    Warehouse: [
      { id: "overview", label: "Dashboard", icon: LayoutDashboard },
      { id: "storage", label: "Cold Storage Grid", icon: ThermometerSnowflake },
      { id: "bookings", label: "Reservations", icon: Warehouse },
    ],
    Admin: [
      { id: "overview", label: "Dashboard", icon: LayoutDashboard },
      { id: "users", label: "Manage Users", icon: Users },
      { id: "crops", label: "Audit Crops", icon: ShieldCheck },
      { id: "disputes", label: "Dispute Resolutions", icon: ShieldAlert },
      { id: "fraud", label: "System Health", icon: Activity },
    ],
  };

  const menuItems = roleMenuConfigs[currentUser.role] || [];

  const handleTabClick = (tabId: string) => {
    // If navigating away from the dashboard route, push dashboard route with tab query
    if (pathname !== "/dashboard") {
      router.push(`/dashboard?tab=${tabId}`);
    } else {
      router.push(`/dashboard?tab=${tabId}`);
    }
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`h-[calc(100vh-4rem)] border-r border-border-nature bg-card-bg/60 dark:bg-card-bg/20 backdrop-blur-md sticky top-16 left-0 z-40 flex flex-col justify-between p-4 transition-all`}
    >
      <div className="space-y-6">
        
        {/* Collapse Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl border border-border-nature hover:bg-bg-nature text-gray-500 hover:text-primary transition-all duration-200"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* User Identity Info */}
        {!collapsed && (
          <div className="p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl border border-primary/10">
            <div className="text-[10px] uppercase font-bold text-primary tracking-wider">Active Workspace</div>
            <div className="text-xs font-bold text-text-charcoal truncate mt-1">{currentUser.name}</div>
            <div className="text-[10px] text-gray-400 truncate">{currentUser.location}</div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id && pathname === "/dashboard";
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                  isSelected
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-text-charcoal hover:bg-bg-nature"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isSelected ? "text-white" : "text-gray-400 group-hover:text-primary"}`} />
                {!collapsed && <span>{item.label}</span>}
                {isSelected && !collapsed && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute right-2 w-1.5 h-1.5 rounded-full bg-accent"
                  />
                )}
              </button>
            );
          })}

          {/* Shared Links */}
          <div className="pt-4 border-t border-border-nature my-3">
            <button
              onClick={() => router.push("/marketplace")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-text-charcoal hover:bg-bg-nature transition-all`}
            >
              <ShoppingBag className="h-4.5 w-4.5 text-gray-400 shrink-0" />
              {!collapsed && <span>Global Marketplace</span>}
            </button>

            <button
              onClick={() => router.push("/chat")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-text-charcoal hover:bg-bg-nature transition-all`}
            >
              <MessageSquare className="h-4.5 w-4.5 text-gray-400 shrink-0" />
              {!collapsed && <span>Chat Rooms</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* Footer Info */}
      <div className="space-y-1">
        <button
          onClick={() => router.push("/dashboard?tab=settings")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-primary hover:bg-bg-nature transition-all`}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>

        <button
          onClick={() => router.push("/faq")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-primary hover:bg-bg-nature transition-all`}
        >
          <HelpCircle className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Support FAQ</span>}
        </button>

        {!collapsed && (
          <div className="text-[9px] text-gray-400 text-center pt-2">
            FarmLink AI v1.0.0
          </div>
        )}
      </div>
    </motion.aside>
  );
}
