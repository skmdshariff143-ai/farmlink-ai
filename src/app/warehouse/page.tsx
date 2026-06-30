"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useFarmStore } from "@/store/useFarmStore";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import AIChatbot from "@/components/layout/AIChatbot";
import InteractiveMap from "@/components/maps/InteractiveMap";
import { Warehouse, Thermometer, Calendar } from "lucide-react";

function WarehouseDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const { warehouseBookings } = useFarmStore();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <AIChatbot />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-bg-nature/20">
          
          <div className="flex justify-between items-center border-b border-border-nature pb-6">
            <div>
              <h1 className="text-2xl font-black text-text-charcoal flex items-center gap-2">
                <Warehouse className="h-6 w-6 text-primary" />
                Warehouse & Silos Management
              </h1>
              <p className="text-xs text-gray-500">Monitor cold storage telemetry, list capacity slots, and check reservations.</p>
            </div>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                  <div className="text-[10px] text-gray-400 font-extrabold uppercase">Reserved capacity</div>
                  <div className="text-2xl font-black text-text-charcoal mt-1">78 Tons / 120 Tons</div>
                </div>
                <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                  <div className="text-[10px] text-gray-400 font-extrabold uppercase">Cold Chamber Temp</div>
                  <div className="text-2xl font-black text-primary mt-1">4.0 °C</div>
                </div>
                <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                  <div className="text-[10px] text-gray-400 font-extrabold uppercase">Active reserves</div>
                  <div className="text-2xl font-black text-text-charcoal mt-1">8 Farmers</div>
                </div>
                <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                  <div className="text-[10px] text-gray-400 font-extrabold uppercase">Monthly Billing</div>
                  <div className="text-2xl font-black text-text-charcoal mt-1">₹24,500</div>
                </div>
              </div>

              <InteractiveMap />
            </div>
          )}

          {activeTab === "storage" && (
            <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4 text-xs font-semibold">
              <h3 className="text-sm font-bold">Cold Storage Bays</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-4 border border-border-nature rounded-2xl bg-bg-nature/30 text-center space-y-1">
                  <Thermometer className="h-6 w-6 text-primary mx-auto" />
                  <div className="text-[10px] text-gray-400">Bay 1 (Potato)</div>
                  <div className="text-sm font-bold text-text-charcoal">4.0°C | 85% RH</div>
                </div>
                <div className="p-4 border border-border-nature rounded-2xl bg-bg-nature/30 text-center space-y-1">
                  <Thermometer className="h-6 w-6 text-primary mx-auto" />
                  <div className="text-[10px] text-gray-400">Bay 2 (Onion)</div>
                  <div className="text-sm font-bold text-text-charcoal">12.0°C | 60% RH</div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default function WarehouseDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-nature flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-500">Loading Warehouse Workspace...</span>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
  function DashboardContent() {
    return <WarehouseDashboardContent />;
  }
}
