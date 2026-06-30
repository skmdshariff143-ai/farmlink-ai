"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useFarmStore } from "@/store/useFarmStore";
import InteractiveMap from "@/components/maps/InteractiveMap";
import { Truck } from "lucide-react";

function TransportDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const { transportBookings } = useFarmStore();

  return (
    <div className="p-6 md:p-8 space-y-8">
      
      <div className="flex justify-between items-center border-b border-border-nature pb-6">
        <div>
          <h1 className="text-2xl font-black text-text-charcoal flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            Transport & Logistics Portal
          </h1>
          <p className="text-xs text-gray-500">Manage cargo haulage contracts, vehicle maintenance logs, and dispatch routing.</p>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
              <div className="text-[10px] text-gray-400 font-extrabold uppercase">Driver Income (Month)</div>
              <div className="text-2xl font-black text-text-charcoal mt-1">₹34,500</div>
            </div>
            <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
              <div className="text-[10px] text-gray-400 font-extrabold uppercase">Trips Completed</div>
              <div className="text-2xl font-black text-primary mt-1">14 Deliveries</div>
            </div>
            <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
              <div className="text-[10px] text-gray-400 font-extrabold uppercase">Carbon Offset Credits</div>
              <div className="text-2xl font-black text-text-charcoal mt-1">280 Points</div>
            </div>
            <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
              <div className="text-[10px] text-gray-400 font-extrabold uppercase">Fuel Efficiency</div>
              <div className="text-2xl font-black text-text-charcoal mt-1">16.4 km/l</div>
            </div>
          </div>

          <InteractiveMap />
        </div>
      )}

      {activeTab === "requests" && (
        <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4 text-xs font-semibold text-text-charcoal">
          <h3 className="text-sm font-bold">Farmer Shipment Contracts</h3>
          {transportBookings.map((tb) => (
            <div key={tb.id} className="p-4 bg-bg-nature/40 border border-border-nature rounded-2xl flex justify-between items-center">
              <div>
                <div className="font-bold text-text-charcoal">{tb.vehicleType} needed</div>
                <p className="text-[10px] text-gray-500 mt-1">Route: {tb.route}</p>
                <p className="text-[9px] text-primary font-bold mt-1">Estimated payout: ₹{tb.price} • Assigned: {tb.driverName}</p>
              </div>
              <span className="bg-orange-100 text-orange-700 font-extrabold text-[9px] px-2 py-0.5 rounded-full">
                {tb.status}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default function TransportDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-nature flex items-center justify-center p-6">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TransportDashboardContent />
    </Suspense>
  );
}
