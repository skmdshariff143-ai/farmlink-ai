"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useFarmStore } from "@/store/useFarmStore";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import AIChatbot from "@/components/layout/AIChatbot";
import { PriceTrendChart, DemandForecastChart } from "@/components/charts/CustomCharts";
import { ShieldAlert, Users, ShieldCheck, Activity } from "lucide-react";

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

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
                <ShieldAlert className="h-6 w-6 text-primary" />
                System Admin Panel
              </h1>
              <p className="text-xs text-gray-500">Verify user certifications, check crop grading reviews, and monitor server latency logs.</p>
            </div>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                  <div className="text-[10px] text-gray-400 font-extrabold uppercase">Platform Volume (24h)</div>
                  <div className="text-2xl font-black text-text-charcoal mt-1">₹8,45,200</div>
                </div>
                <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                  <div className="text-[10px] text-gray-400 font-extrabold uppercase">Pending audits</div>
                  <div className="text-2xl font-black text-primary mt-1">4 Audits</div>
                </div>
                <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                  <div className="text-[10px] text-gray-400 font-extrabold uppercase">Fraud Alerts</div>
                  <div className="text-2xl font-black text-red-500 mt-1">0 Alerts</div>
                </div>
                <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                  <div className="text-[10px] text-gray-400 font-extrabold uppercase">Mandi server health</div>
                  <div className="text-2xl font-black text-text-charcoal mt-1">99.98% Up</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PriceTrendChart />
                <DemandForecastChart />
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4 text-xs font-semibold">
              <h3 className="text-sm font-bold">Verify Trading Accounts</h3>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-nature text-[10px] text-gray-400 font-extrabold uppercase">
                    <th className="py-2.5">User name</th>
                    <th>Location</th>
                    <th>Role</th>
                    <th>Escrow verified</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border-nature">
                    <td className="py-3 font-bold">Devanand Patil</td>
                    <td>Nashik, MH</td>
                    <td>Farmer</td>
                    <td>Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-nature flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-500">Loading Admin Workspace...</span>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
  function DashboardContent() {
    return <AdminDashboardContent />;
  }
}
