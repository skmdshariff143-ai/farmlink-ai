"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useFarmStore } from "@/store/useFarmStore";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import AIChatbot from "@/components/layout/AIChatbot";
import InteractiveMap from "@/components/maps/InteractiveMap";
import { ShoppingBag, History, Heart, ClipboardCheck } from "lucide-react";

function BuyerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const { orders, currentUser } = useFarmStore();

  const cartTotal = orders.reduce((sum, o) => sum + o.total, 0);

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
                <ShoppingBag className="h-6 w-6 text-primary" />
                Buyer Procurement Hub
              </h1>
              <p className="text-xs text-gray-500">Track shipments, verify mandi escrow payouts, and manage saved suppliers.</p>
            </div>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                  <div className="text-[10px] text-gray-400 font-extrabold uppercase">Spending Volume (Total)</div>
                  <div className="text-2xl font-black text-text-charcoal mt-1">₹{cartTotal.toLocaleString("en-IN")}</div>
                </div>
                <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                  <div className="text-[10px] text-gray-400 font-extrabold uppercase">Active Shipments</div>
                  <div className="text-2xl font-black text-primary mt-1">1 Cargo</div>
                </div>
                <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                  <div className="text-[10px] text-gray-400 font-extrabold uppercase">Saved Sellers</div>
                  <div className="text-2xl font-black text-text-charcoal mt-1">4 Farmers</div>
                </div>
                <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                  <div className="text-[10px] text-gray-400 font-extrabold uppercase">Carbon Offset Score</div>
                  <div className="text-2xl font-black text-text-charcoal mt-1">3.4 Tons CO₂</div>
                </div>
              </div>

              <InteractiveMap />
            </div>
          )}

          {activeTab === "orders" && (
            <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-text-charcoal">My Purchased Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border-nature text-[10px] text-gray-400 font-extrabold uppercase">
                      <th className="py-2.5">Order ID</th>
                      <th>Crops Details</th>
                      <th>Total Paid</th>
                      <th>Payment Type</th>
                      <th>Delivery Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b border-border-nature font-semibold">
                        <td className="py-3 font-bold text-primary">{o.id}</td>
                        <td>{o.items.map(i => `${i.name} (${i.quantity}kg)`).join(", ")}</td>
                        <td className="font-extrabold">₹{o.total.toLocaleString("en-IN")}</td>
                        <td>{o.paymentMethod}</td>
                        <td>{o.deliveryDate}</td>
                        <td>{o.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "wishlist" && (
            <div className="py-16 text-center space-y-4 border border-dashed border-border-nature rounded-3xl bg-white dark:bg-card-bg">
              <Heart className="h-10 w-10 text-gray-300 mx-auto animate-pulse" />
              <h3 className="font-bold text-xs text-text-charcoal">Your wishlist is empty</h3>
              <p className="text-[10px] text-gray-400">Search the catalog and add products you want to keep an eye on.</p>
              <button onClick={() => router.push("/marketplace")} className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md">
                Browse Marketplace
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default function BuyerDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-nature flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-500">Loading Buyer Workspace...</span>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
  // Alias renaming to compile correctly
  function DashboardContent() {
    return <BuyerDashboardContent />;
  }
}
