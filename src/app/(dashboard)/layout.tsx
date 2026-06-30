import React, { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import AIChatbot from "@/components/layout/AIChatbot";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <AIChatbot />
      <div className="flex flex-1 overflow-hidden">
        <Suspense fallback={<div className="w-64 bg-white border-r animate-pulse" />}>
          <Sidebar />
        </Suspense>
        <main className="flex-1 overflow-y-auto bg-bg-nature/20">
          {children}
        </main>
      </div>
    </div>
  );
}
