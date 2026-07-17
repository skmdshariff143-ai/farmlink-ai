"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import InteractiveMap from "@/components/maps/InteractiveMap";
import { useFarmStore } from "@/store/useFarmStore";
import { apiClient } from "@/services/api";
import { ShoppingBag, ArrowLeft, Truck, Package, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import confetti from "canvas-confetti";

function OrderTrackingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeOrderId = searchParams.get("id");

  const { orders, disputes, raiseDispute, currentUser, addNotification } = useFarmStore();
  
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(activeOrderId);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [dispReason, setDispReason] = useState("Quality Issues");
  const [dispDesc, setDispDesc] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeOrderId) {
      setSelectedOrderId(activeOrderId);
    }
  }, [activeOrderId]);

  const selectedOrder = orders.find(o => o.id === (selectedOrderId || (orders[0]?.id)));

  const getStepIcon = (step: number, currentStep: number) => {
    if (step < currentStep) return <CheckCircle2 className="h-5 w-5 text-primary" />;
    if (step === currentStep) return <Truck className="h-5 w-5 text-secondary animate-bounce" />;
    return <Clock className="h-5 w-5 text-gray-300" />;
  };

  const getStepClass = (step: number, currentStep: number) => {
    if (step <= currentStep) return "border-primary text-text-charcoal";
    return "border-gray-200 text-gray-300";
  };

  return (
    <div className="min-h-screen bg-bg-nature/20 font-semibold text-xs text-text-charcoal pb-12">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6 md:p-12 space-y-8">
        
        {/* Navigation header */}
        <div className="flex items-center gap-2 border-b border-border-nature pb-6">
          <button onClick={() => router.back()} className="h-8 w-8 rounded-full border border-border-nature flex items-center justify-center bg-white hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-text-charcoal flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              Order Tracking & Payout Ledger
            </h1>
            <p className="text-[10px] text-gray-500">Check delivery progress, carrier dispatches, and secure escrow receipts.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <span className="text-gray-500 mt-4 block">Resolving purchase registry...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border-nature bg-white rounded-3xl space-y-4">
            <Package className="h-10 w-10 text-gray-300 mx-auto" />
            <h3 className="font-bold text-xs text-text-charcoal">No orders placed yet</h3>
            <p className="text-[10px] text-gray-400">Head to the marketplace to purchase fresh crop yields.</p>
            <button onClick={() => router.push("/marketplace")} className="px-5 py-2 bg-primary text-white rounded-xl font-bold shadow-md">
              Explore Mandi Listings
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Orders List */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-sm font-black text-text-charcoal">All Purchases</h3>
              <div className="space-y-3">
                {orders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setSelectedOrderId(o.id);
                      setShowDisputeForm(false);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      selectedOrder?.id === o.id
                        ? "bg-white border-primary shadow-sm"
                        : "bg-white/60 border-border-nature hover:bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase mb-1">
                      <span>Order #{o.id.slice(-6)}</span>
                      <span className={`px-2 py-0.5 rounded-full ${o.paymentStatus === "Paid" ? "bg-green-50 text-primary" : o.paymentStatus === "Refunded" ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-700"}`}>
                        {o.paymentStatus}
                      </span>
                    </div>
                    <div className="font-bold text-text-charcoal truncate">
                      {o.items.map((i: any) => i.name).join(", ")}
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-border-nature/50 text-[10px] text-gray-500">
                      <span>₹{o.total.toLocaleString("en-IN")}</span>
                      <span className="font-bold">{o.status}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Order Progress & Tracking */}
            {selectedOrder && (
              <div className="lg:col-span-8 space-y-6">
                
                {/* Stepper Card */}
                <div className="bg-white border border-border-nature rounded-3xl p-6 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-base font-black">Shipment Progress</h2>
                    <p className="text-[10px] text-gray-500 mt-0.5">Estimated Delivery: {selectedOrder.deliveryDate}</p>
                  </div>

                  {/* Stepper progress bar */}
                  <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0 pt-4 pb-2">
                    {/* Connecting line */}
                    <div className="absolute top-[22px] left-3.5 right-3.5 h-0.5 bg-gray-100 hidden md:block" />
                    
                    {[
                      { title: "Ordered", desc: "Escrow funds locked" },
                      { title: "Packed", desc: "Grade certified" },
                      { title: "In Transit", desc: "Carrier dispatch" },
                      { title: "Delivered", desc: "Farmer payout release" }
                    ].map((step, idx) => (
                      <div key={idx} className="flex md:flex-col items-center gap-4 md:gap-2 z-10 w-max md:w-32 text-left md:text-center">
                        <div className={`h-9 w-9 rounded-full border-2 bg-white flex items-center justify-center ${getStepClass(idx, selectedOrder.trackingStep)}`}>
                          {getStepIcon(idx, selectedOrder.trackingStep)}
                        </div>
                        <div>
                          <div className="font-black text-text-charcoal">{step.title}</div>
                          <p className="text-[8.5px] text-gray-400 mt-0.5 leading-tight">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Escrow & Dispute Console */}
                <div className="bg-white border border-border-nature rounded-3xl p-6 shadow-sm space-y-4 text-xs font-semibold text-text-charcoal">
                  <h3 className="text-sm font-black flex items-center gap-1.5">
                    🛡️ Escrow Protection Console
                  </h3>
                  {process.env.NEXT_PUBLIC_DEMO_MODE !== "false" && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-800 text-[10px] font-bold">
                      ℹ️ Demo mode — payments are simulated, no real transactions occur.
                    </div>
                  )}
                  
                  {selectedOrder.disputed ? (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl space-y-2.5">
                      <div className="flex items-center gap-2 text-orange-700 font-extrabold">
                        <Clock className="h-4 w-4 animate-spin" />
                        Active Dispute Registered
                      </div>
                      {(() => {
                        const disp = disputes.find(d => d.orderId === selectedOrder.id);
                        return disp ? (
                          <div className="space-y-1">
                            <div><strong>Reason:</strong> {disp.reason}</div>
                            <div className="text-gray-500 font-normal leading-relaxed">{disp.description}</div>
                            <div className="pt-1.5 text-[9px] font-extrabold uppercase text-gray-400">
                              Dispute Status: {disp.status}
                            </div>
                            {disp.resolutionNotes && (
                              <div className="mt-2 p-2 bg-white/60 border border-orange-100 rounded-xl">
                                <strong>Resolution Notes:</strong> {disp.resolutionNotes}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500">Wait, matching dispute records...</p>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50/50 border border-border-nature rounded-2xl flex justify-between items-center">
                        <div>
                          <div className="font-extrabold text-primary">Escrow Secured (₹{selectedOrder.total.toLocaleString("en-IN")})</div>
                          <p className="text-[9.5px] text-gray-500 font-normal mt-0.5">Funds are held in neutral escrow until dispatch is verified and delivered.</p>
                        </div>
                        <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                      </div>

                      {selectedOrder.paymentStatus === "Paid" && (
                        <div>
                          {!showDisputeForm ? (
                            <button
                              onClick={() => setShowDisputeForm(true)}
                              className="px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-bold transition-all"
                            >
                              Report Issue / Raise Dispute
                            </button>
                          ) : (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (!dispDesc) return;
                                raiseDispute(selectedOrder.id, dispReason, dispDesc);
                                addNotification(
                                  "Dispute Raised ⚠️",
                                  `You raised a dispute for Order #${selectedOrder.id.slice(-6)}: ${dispReason}.`,
                                  "warning"
                                );
                                setDispDesc("");
                                setShowDisputeForm(false);
                                confetti({ particleCount: 30, colors: ["#ea580c"] });
                              }}
                              className="p-4 bg-gray-50 border border-border-nature rounded-2xl space-y-4"
                            >
                              <div className="font-bold text-gray-700">Flag Order Discrepancy</div>
                              <div>
                                <label className="text-[10px] text-gray-400 font-bold block mb-1">Reason for Dispute</label>
                                <select
                                  value={dispReason}
                                  onChange={(e) => setDispReason(e.target.value)}
                                  className="w-full px-3 py-2 border border-border-nature rounded-xl bg-white outline-none"
                                >
                                  <option>Quality Issues (Damaged/Spoiled)</option>
                                  <option>Weight/Quantity Mismatch</option>
                                  <option>Late/Failed Delivery</option>
                                  <option>Incorrect Crop Variety</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] text-gray-400 font-bold block mb-1">Details & Description</label>
                                <textarea
                                  required
                                  rows={3}
                                  placeholder="Provide quality inspection details, weight differences, or shipping delay comments..."
                                  value={dispDesc}
                                  onChange={(e) => setDispDesc(e.target.value)}
                                  className="w-full px-3 py-2 border border-border-nature rounded-xl bg-white outline-none"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setShowDisputeForm(false)}
                                  className="flex-1 py-2 border border-border-nature bg-white rounded-xl hover:bg-gray-100"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm"
                                >
                                  File Dispute
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Logistics GPS Map */}
                <InteractiveMap />
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-nature flex items-center justify-center p-6">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OrderTrackingContent />
    </Suspense>
  );
}
