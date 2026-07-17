"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useFarmStore, CropListing, UserRole } from "@/store/useFarmStore";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import AIChatbot from "@/components/layout/AIChatbot";
import InteractiveMap from "@/components/maps/InteractiveMap";
import { PriceTrendChart, RevenueChart, DemandForecastChart } from "@/components/charts/CustomCharts";
import { 
  Sprout, TrendingUp, CloudRain, Sun, Calendar, Plus, 
  Trash2, Landmark, CheckCircle, Truck, FileText, Star, 
  ShieldAlert, UserCheck, Activity, Thermometer, ShieldCheck,
  Award, Heart, Eye, ArrowRight
} from "lucide-react";
import confetti from "canvas-confetti";
import { Suspense } from "react";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const { 
    currentUser, 
    listings, 
    addListing, 
    updateListingStock, 
    orders, 
    transportBookings, 
    addTransportBooking,
    warehouseBookings,
    addWarehouseBooking,
    schemes, 
    enrollInScheme,
    notifications,
    addNotification,
    achievements,
    unlockAchievement,
    disputes,
    resolveDispute
  } = useFarmStore();

  // Local form states
  const [cropName, setCropName] = useState("");
  const [cropCategory, setCropCategory] = useState("Grains");
  const [cropPrice, setCropPrice] = useState(0);
  const [cropQty, setCropQty] = useState(0);
  const [cropDesc, setCropDesc] = useState("");
  const [cropImg, setCropImg] = useState("https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80");

  const [truckType, setTruckType] = useState("Tata Ace (1.5 Ton)");
  const [truckRoute, setTruckRoute] = useState("");
  const [truckPrice, setTruckPrice] = useState(2500);

  const [whType, setWhType] = useState<"Cold Storage" | "Dry Storage">("Cold Storage");
  const [whCapacity, setWhCapacity] = useState(5);
  const [whMonths, setWhMonths] = useState(3);

  // Dispute resolution form states
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [resNotes, setResNotes] = useState("");
  const [resType, setResType] = useState<"RESOLVED_RELEASE" | "RESOLVED_REFUND" | "RESOLVED_SPLIT">("RESOLVED_RELEASE");
  const [splitFarmer, setSplitFarmer] = useState(0);
  const [splitBuyer, setSplitBuyer] = useState(0);

  // Trigger crop upload
  const handleCropSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName || cropPrice <= 0 || cropQty <= 0) return;

    addListing({
      name: cropName,
      category: cropCategory,
      price: cropPrice,
      quantity: cropQty,
      description: cropDesc,
      image: cropImg,
      location: currentUser.location,
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      rating: 4.8
    });

    addNotification(
      "Crop Uploaded Success! 🎉",
      `Your listing for ${cropQty}kg of ${cropName} is live on marketplace at ₹${cropPrice}/kg.`,
      "success"
    );

    // Reset fields
    setCropName("");
    setCropPrice(0);
    setCropQty(0);
    setCropDesc("");

    // Trigger achievement
    unlockAchievement("ach_01");

    confetti({ particleCount: 50, spread: 60 });
    router.push("/dashboard?tab=inventory");
  };

  // Booking handlers
  const handleBookTruck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!truckRoute) return;

    addTransportBooking({
      driverName: "Kuldeep Singh",
      vehicleNo: "TS 09 EU 1289",
      vehicleType: truckType,
      route: truckRoute,
      price: truckPrice,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    });

    addNotification(
      "Truck Dispatched! 🚚",
      `Assigned Kuldeep Singh for your route: ${truckRoute}. Payout: ₹${truckPrice}.`,
      "success"
    );

    setTruckRoute("");
    confetti({ particleCount: 30 });
  };

  const handleBookWH = (e: React.FormEvent) => {
    e.preventDefault();

    addWarehouseBooking({
      warehouseName: "Warangal Agri Silos (Unit B)",
      type: whType,
      capacity: whCapacity,
      price: whType === "Cold Storage" ? 1500 * whCapacity * whMonths : 800 * whCapacity * whMonths,
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "long" }),
      duration: whMonths
    });

    addNotification(
      "Storage Confirmed! 🏢",
      `Reserved ${whCapacity} tons of ${whType} for ${whMonths} months.`,
      "success"
    );

    confetti({ particleCount: 30 });
  };

  const handleResolveDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute || !resNotes) return;

    const order = orders.find(o => o.id === selectedDispute.orderId);
    if (!order) return;

    if (resType === "RESOLVED_SPLIT") {
      const sum = Number(splitFarmer) + Number(splitBuyer);
      if (Math.round(sum * 100) !== Math.round(order.total * 100)) {
        alert(`Mismatched splits: Sum of splits (₹${sum}) must equal the order total (₹${order.total})`);
        return;
      }
    }

    resolveDispute(
      selectedDispute.orderId,
      resType,
      resNotes,
      resType === "RESOLVED_SPLIT" ? Number(splitFarmer) : undefined,
      resType === "RESOLVED_SPLIT" ? Number(splitBuyer) : undefined
    );

    addNotification(
      "Dispute Resolved ⚖️",
      `Order #${selectedDispute.orderId.slice(-6)} dispute resolved as ${resType}.`,
      "success"
    );

    setSelectedDispute(null);
    setResNotes("");
    setSplitFarmer(0);
    setSplitBuyer(0);

    confetti({ particleCount: 60, spread: 80 });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <AIChatbot />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Dashboard Main Workspace Panel */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-bg-nature/20">
          
          {/* Welcome Intro Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-nature pb-6">
            <div>
              <h1 className="text-2xl font-black text-text-charcoal flex items-center gap-2">
                <Sprout className="h-6 w-6 text-primary" />
                {currentUser.name}&apos;s Workspace
              </h1>
              <p className="text-xs text-gray-500">Manage listings, wallet escrow payments, logistics, and regional AI configurations.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary">
                Network Status: Online (PWA Secured)
              </span>
            </div>
          </div>

          {/* ========================================================
              FARMER DASHBOARD VIEWS
              ======================================================== */}
          {currentUser.role === "Farmer" && (
            <>
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Stats Cards grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Today&apos;s Price (Rice)</div>
                      <div className="text-2xl font-black text-text-charcoal mt-1">₹65.00 <span className="text-xs text-primary font-bold">+3.2%</span></div>
                      <p className="text-[9px] text-gray-500 mt-2">Mandi average rate in Warangal</p>
                    </div>
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Wallet Balance</div>
                      <div className="text-2xl font-black text-primary mt-1">₹{currentUser.walletBalance.toLocaleString("en-IN")}</div>
                      <p className="text-[9px] text-gray-500 mt-2">Available instantly for withdrawal</p>
                    </div>
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Orders Pending</div>
                      <div className="text-2xl font-black text-text-charcoal mt-1">{orders.length} Dispatches</div>
                      <p className="text-[9px] text-gray-500 mt-2">Awaiting logistics pickup</p>
                    </div>
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Yield Score</div>
                      <div className="text-2xl font-black text-text-charcoal mt-1">92 / 100</div>
                      <p className="text-[9px] text-primary font-bold mt-2">Grade A+ (Certified Organic)</p>
                    </div>
                  </div>

                  {/* Weather and Analytics Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Charts */}
                    <div className="lg:col-span-8 space-y-6">
                      <PriceTrendChart />
                      <RevenueChart />
                    </div>
                    
                    {/* Weather card & Quick actions */}
                    <div className="lg:col-span-4 space-y-6">
                      {/* Weather */}
                      <div className="bg-gradient-to-br from-primary to-secondary text-white rounded-3xl p-6 shadow-md space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold uppercase text-green-100">Weather Telemetry</span>
                          <CloudRain className="h-5 w-5 text-accent animate-bounce" />
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black">28°C</span>
                          <span className="text-xs text-green-100">Light Showers</span>
                        </div>
                        <div className="pt-2 border-t border-white/20 text-xs leading-relaxed space-y-1 text-green-50">
                          <p>📍 Location: Warangal, TS</p>
                          <p>💧 Humidity: 82% | Wind: 14 km/h</p>
                        </div>
                        <div className="p-2.5 bg-white/10 rounded-2xl text-[10px] font-bold border border-white/25 leading-normal">
                          🌾 AI Weather Suggestion: Rain expected on Wednesday. Secure grain sacks in dry bays today.
                        </div>
                      </div>

                      {/* Gamification Progress */}
                      <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4">
                        <h4 className="text-xs font-bold text-text-charcoal flex items-center gap-1">
                          <Award className="h-4 w-4 text-primary animate-pulse" />
                          Platform Achievements
                        </h4>
                        <div className="space-y-3.5">
                          {achievements.map((ach) => (
                            <div key={ach.id} className="flex gap-2.5 items-start">
                              <span className="text-xl">{ach.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                  <h5 className="text-[11px] font-bold text-text-charcoal leading-none">{ach.title}</h5>
                                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                                    ach.unlocked ? "bg-green-100 text-primary" : "bg-gray-100 text-gray-400"
                                  }`}>
                                    {ach.unlocked ? "Unlocked" : "Locked"}
                                  </span>
                                </div>
                                <p className="text-[9px] text-gray-500 mt-1 leading-normal">{ach.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Orders List */}
                  <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-text-charcoal">Escrow Transactions & Orders Log</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border-nature text-[10px] text-gray-400 font-extrabold uppercase">
                            <th className="py-2.5">Order ID</th>
                            <th>Produce details</th>
                            <th>Buyer entity</th>
                            <th>Gross Total</th>
                            <th>Payment</th>
                            <th>Dispatch status</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs font-semibold text-text-charcoal">
                          {orders.map((o) => (
                            <tr key={o.id} className="border-b border-border-nature hover:bg-bg-nature/30 transition-colors">
                              <td className="py-3 font-bold text-primary">{o.id}</td>
                              <td>{o.items.map(i => `${i.name} (${i.quantity}kg)`).join(", ")}</td>
                              <td>{o.buyerName}</td>
                              <td className="font-extrabold">₹{o.total.toLocaleString("en-IN")}</td>
                              <td>
                                <span className="bg-green-100 text-primary text-[9px] px-2 py-0.5 rounded-full font-bold">
                                  {o.paymentStatus}
                                </span>
                              </td>
                              <td>
                                <span className="bg-primary/10 text-primary text-[9px] px-2 py-0.5 rounded-full font-bold">
                                  {o.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "upload" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Upload Form */}
                  <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-text-charcoal flex items-center gap-1">
                      <Plus className="h-4.5 w-4.5 text-primary" />
                      List Crop on Marketplace
                    </h3>
                    <form onSubmit={handleCropSubmit} className="space-y-4 text-xs font-semibold text-text-charcoal">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-gray-400 font-bold block mb-1">Crop Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Organic Basmati Rice"
                            value={cropName}
                            onChange={(e) => setCropName(e.target.value)}
                            className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none focus:ring-1 focus:ring-primary text-text-charcoal"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 font-bold block mb-1">Category</label>
                          <select
                            value={cropCategory}
                            onChange={(e) => setCropCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none focus:ring-1 focus:ring-primary text-text-charcoal"
                          >
                            <option>Grains</option>
                            <option>Vegetables</option>
                            <option>Fruits</option>
                            <option>Spices</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-gray-400 font-bold block mb-1">Price (₹ per kg)</label>
                          <input
                            type="number"
                            required
                            min={1}
                            placeholder="65"
                            value={cropPrice || ""}
                            onChange={(e) => setCropPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none focus:ring-1 focus:ring-primary text-text-charcoal"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 font-bold block mb-1">Stock Quantity (kg)</label>
                          <input
                            type="number"
                            required
                            min={100}
                            placeholder="1200"
                            value={cropQty || ""}
                            onChange={(e) => setCropQty(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none focus:ring-1 focus:ring-primary text-text-charcoal"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-400 font-bold block mb-1">Crop Image Address</label>
                        <select
                          value={cropImg}
                          onChange={(e) => setCropImg(e.target.value)}
                          className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none focus:ring-1 focus:ring-primary text-text-charcoal"
                        >
                          <option value="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80">Basmati Rice Grain</option>
                          <option value="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=80">Wheat Golden Grain</option>
                          <option value="https://images.unsplash.com/photo-1508747703725-719ae2c73ee0?w=500&auto=format&fit=crop&q=80">Desi Red Onion</option>
                          <option value="https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=80">Alphonso Mango</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-400 font-bold block mb-1">Harvest Description</label>
                        <textarea
                          rows={3}
                          placeholder="Provide details about soil composition, organic status, moisture levels..."
                          value={cropDesc}
                          onChange={(e) => setCropDesc(e.target.value)}
                          className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none focus:ring-1 focus:ring-primary text-text-charcoal"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
                      >
                        Publish Listing to Public Marketplace
                      </button>
                    </form>
                  </div>

                  {/* Leaf Diagnostics Simulator info */}
                  <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-text-charcoal">Leaf Diagnosis Scanning Help</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      To audit crop health and list with certified grades (e.g. A+), use the Floating AI assistant at the bottom right. 
                    </p>
                    <div className="p-4 bg-bg-nature/40 rounded-2xl border border-border-nature text-xs leading-relaxed text-text-charcoal space-y-2">
                      <p className="font-bold text-primary">Instructions:</p>
                      <ul className="list-disc pl-4 space-y-1 text-gray-500">
                        <li>Open the **FarmLink Smart AI** bot.</li>
                        <li>Find the **AI Crop Health Diagnostics** card.</li>
                        <li>Click **Tomato Blight** or **Rice Blast** to run simulation.</li>
                        <li>AI will scan cellular structures and unlock certified grades for listings!</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "inventory" && (
                <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-text-charcoal">My Live Marketplace Listings</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border-nature text-[10px] text-gray-400 font-extrabold uppercase">
                          <th className="py-2.5">Crop Name</th>
                          <th>Category</th>
                          <th>Price index</th>
                          <th>Stock (kg)</th>
                          <th>Status</th>
                          <th>Publish Date</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs font-semibold text-text-charcoal">
                        {listings.map((l) => (
                          <tr key={l.id} className="border-b border-border-nature">
                            <td className="py-3 font-bold">{l.name}</td>
                            <td>{l.category}</td>
                            <td className="font-bold">₹{l.price}/kg</td>
                            <td>{l.quantity} kg</td>
                            <td>
                              <span className="bg-green-100 text-primary text-[9px] px-2 py-0.5 rounded-full font-bold">
                                {l.status}
                              </span>
                            </td>
                            <td className="text-gray-400">{new Date(l.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "bookings" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Transport truck bookings */}
                  <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-text-charcoal flex items-center gap-1">
                      <Truck className="h-4.5 w-4.5 text-primary" />
                      Book Logistics Truck
                    </h3>
                    <form onSubmit={handleBookTruck} className="space-y-4 text-xs font-semibold text-text-charcoal">
                      <div>
                        <label className="text-[10px] text-gray-400 font-bold block mb-1">Vehicle Class</label>
                        <select
                          value={truckType}
                          onChange={(e) => setTruckType(e.target.value)}
                          className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none focus:ring-1 focus:ring-primary text-text-charcoal"
                        >
                          <option>Tata Ace (1.5 Ton capacity)</option>
                          <option>Mahindra Bolero Pickup (3 Ton capacity)</option>
                          <option>Tata 407 (5 Ton capacity)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-400 font-bold block mb-1">Pickup to Destination Route</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Warangal Farm to Hyderabad Mandi Hub"
                          value={truckRoute}
                          onChange={(e) => setTruckRoute(e.target.value)}
                          className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none focus:ring-1 focus:ring-primary text-text-charcoal"
                        />
                      </div>

                      <div className="p-3 bg-bg-nature/40 rounded-2xl border border-border-nature flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 font-bold">Estimated Cost (Govt Rates):</span>
                        <span className="text-sm font-black text-primary">₹{truckPrice}</span>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
                      >
                        Confirm Booking & Assign Driver
                      </button>
                    </form>

                    {/* Booked list */}
                    <div className="pt-4 border-t border-border-nature space-y-2">
                      <h4 className="text-[10px] font-extrabold uppercase text-gray-400">Active Shipments</h4>
                      {transportBookings.map((tb) => (
                        <div key={tb.id} className="p-3 bg-bg-nature/40 rounded-2xl border border-border-nature flex justify-between items-center text-xs">
                          <div>
                            <div className="font-bold text-text-charcoal">{tb.vehicleType}</div>
                            <div className="text-[10px] text-gray-500 mt-1">{tb.route}</div>
                            <div className="text-[9px] text-primary font-bold mt-1">Driver: {tb.driverName} • {tb.vehicleNo}</div>
                          </div>
                          <span className="bg-orange-100 text-orange-700 font-extrabold text-[9px] px-2 py-0.5 rounded-full">
                            {tb.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cold Warehouse storage bookings */}
                  <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-text-charcoal flex items-center gap-1">
                      <Landmark className="h-4.5 w-4.5 text-primary" />
                      Book Cold Storage Space
                    </h3>
                    <form onSubmit={handleBookWH} className="space-y-4 text-xs font-semibold text-text-charcoal">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-gray-400 font-bold block mb-1">Storage Class</label>
                          <select
                            value={whType}
                            onChange={(e) => setWhType(e.target.value as any)}
                            className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none focus:ring-1 focus:ring-primary text-text-charcoal"
                          >
                            <option value="Cold Storage">Cold Storage (Fruit/Veg)</option>
                            <option value="Dry Storage">Dry Storage (Grain Silos)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 font-bold block mb-1">Space required (Tons)</label>
                          <input
                            type="number"
                            required
                            min={1}
                            placeholder="5"
                            value={whCapacity || ""}
                            onChange={(e) => setWhCapacity(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none focus:ring-1 focus:ring-primary text-text-charcoal"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-400 font-bold block mb-1">Duration (Months)</label>
                        <select
                          value={whMonths}
                          onChange={(e) => setWhMonths(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none focus:ring-1 focus:ring-primary text-text-charcoal"
                        >
                          <option value={1}>1 Month</option>
                          <option value={3}>3 Months (Suggested)</option>
                          <option value={6}>6 Months</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
                      >
                        Confirm Slot Reservation
                      </button>
                    </form>

                    {/* Booked lists */}
                    <div className="pt-4 border-t border-border-nature space-y-2">
                      <h4 className="text-[10px] font-extrabold uppercase text-gray-400">Warehouse Reserves</h4>
                      {warehouseBookings.map((wb) => (
                        <div key={wb.id} className="p-3 bg-bg-nature/40 rounded-2xl border border-border-nature flex justify-between items-center text-xs">
                          <div>
                            <div className="font-bold text-text-charcoal">{wb.warehouseName}</div>
                            <div className="text-[10px] text-gray-500 mt-1">{wb.type} • {wb.capacity} Tons Reserved</div>
                            <div className="text-[9px] text-gray-400 mt-1">Start Date: {wb.startDate} for {wb.duration} months</div>
                          </div>
                          <span className="bg-green-100 text-primary font-extrabold text-[9px] px-2 py-0.5 rounded-full">
                            {wb.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "schemes" && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-text-charcoal flex items-center gap-1.5 mb-2">
                      <Landmark className="h-5 w-5 text-primary" />
                      Government Agricultural Subventions & Insurance
                    </h3>
                    <p className="text-xs text-gray-500">Apply for DBT schemes and low-premium crop insurance portfolios below.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {schemes.map((s) => (
                      <div key={s.id} className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <span className="text-[9px] font-black text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5 inline-block">
                            DBT / Subsidy Enabled
                          </span>
                          <h4 className="text-xs font-bold text-text-charcoal leading-snug">{s.title}</h4>
                          <p className="text-[10px] text-gray-500 leading-relaxed">{s.description}</p>
                          <div className="text-[10px] text-text-charcoal leading-relaxed pt-1.5">
                            <p><strong>Benefit:</strong> {s.subsidy}</p>
                            <p className="mt-1"><strong>Eligibility:</strong> {s.eligibility}</p>
                          </div>
                        </div>

                        {s.enrolled ? (
                          <div className="w-full py-2 bg-green-50 dark:bg-green-950/20 text-primary border border-primary/20 text-center rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Enrolled & Verified
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              enrollInScheme(s.id);
                              addNotification(
                                "Scheme Applied! 🏛️",
                                `You have applied for ${s.title}. Documents sent to Mandi Registrar for verification.`,
                                "success"
                              );
                              confetti({ particleCount: 30 });
                            }}
                            className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-center rounded-xl text-xs font-bold shadow-sm transition-all"
                          >
                            Apply Now / Self Enroll
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "weather" && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-text-charcoal flex items-center gap-1.5 mb-1">
                      <Sun className="h-5 w-5 text-amber-500" />
                      Localized Weather Advisory
                    </h3>
                    <p className="text-xs text-gray-500">Hourly meteorological reports and actionable farming instructions.</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-4 text-center space-y-1">
                      <div className="text-[10px] text-gray-400 font-semibold">Humidity Sensor</div>
                      <div className="text-lg font-bold text-text-charcoal">82%</div>
                      <span className="text-[9px] text-primary font-bold">Favorable soil moist</span>
                    </div>
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-4 text-center space-y-1">
                      <div className="text-[10px] text-gray-400 font-semibold">Precipitation</div>
                      <div className="text-lg font-bold text-text-charcoal">45%</div>
                      <span className="text-[9px] text-yellow-600 font-bold">Mild shower expected</span>
                    </div>
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-4 text-center space-y-1">
                      <div className="text-[10px] text-gray-400 font-semibold">Wind Vector</div>
                      <div className="text-lg font-bold text-text-charcoal">12 km/h</div>
                      <span className="text-[9px] text-primary font-bold">Safe for spraying</span>
                    </div>
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-4 text-center space-y-1">
                      <div className="text-[10px] text-gray-400 font-semibold">Soil Temperature</div>
                      <div className="text-lg font-bold text-text-charcoal">24.5 °C</div>
                      <span className="text-[9px] text-primary font-bold">Perfect root growth</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ========================================================
              BUYER DASHBOARD VIEWS
              ======================================================== */}
          {currentUser.role === "Buyer" && (
            <>
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Stats Cards grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Spending Volume (Total)</div>
                      <div className="text-2xl font-black text-text-charcoal mt-1">₹48,200</div>
                      <p className="text-[9px] text-primary font-bold mt-2">Premium grade produce only</p>
                    </div>
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Active Shipments</div>
                      <div className="text-2xl font-black text-primary mt-1">1 Live Cargo</div>
                      <p className="text-[9px] text-gray-500 mt-2">Tata Ace transit tracking active</p>
                    </div>
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Saved Sellers</div>
                      <div className="text-2xl font-black text-text-charcoal mt-1">4 Farmers</div>
                      <p className="text-[9px] text-gray-500 mt-2">Direct mandi hubs verified</p>
                    </div>
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Carbon Offset Score</div>
                      <div className="text-2xl font-black text-text-charcoal mt-1">3.4 Tons CO₂</div>
                      <p className="text-[9px] text-primary font-bold mt-2">Green logistics enabled</p>
                    </div>
                  </div>

                  {/* Interactive Map Live tracker */}
                  <InteractiveMap />
                </div>
              )}

              {activeTab === "orders" && (
                <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-text-charcoal">My Purchased Orders & Telemetry</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border-nature text-[10px] text-gray-400 font-extrabold uppercase">
                          <th className="py-2.5">Order ID</th>
                          <th>Crops</th>
                          <th>Total Paid</th>
                          <th>Payment type</th>
                          <th>Delivery Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs font-semibold text-text-charcoal">
                        {orders.map((o) => (
                          <tr key={o.id} className="border-b border-border-nature">
                            <td className="py-3 font-bold text-primary">{o.id}</td>
                            <td>{o.items.map(i => `${i.name} (${i.quantity}kg)`).join(", ")}</td>
                            <td className="font-extrabold">₹{o.total.toLocaleString("en-IN")}</td>
                            <td>{o.paymentMethod}</td>
                            <td>{o.deliveryDate}</td>
                            <td>
                              <span className="bg-green-100 text-primary text-[9px] px-2 py-0.5 rounded-full font-bold">
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "wishlist" && (
                <div className="py-12 text-center space-y-2 border border-dashed border-border-nature rounded-3xl bg-white dark:bg-card-bg">
                  <Heart className="h-10 w-10 text-gray-300 mx-auto" />
                  <h3 className="font-bold text-xs text-text-charcoal">Your wishlist is empty</h3>
                  <p className="text-[10px] text-gray-500 max-w-xs mx-auto">Browse the global crop catalog and add items you want to monitor.</p>
                  <button onClick={() => router.push("/marketplace")} className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold">
                    Browse Marketplace
                  </button>
                </div>
              )}
            </>
          )}

          {/* ========================================================
              TRANSPORT DASHBOARD VIEWS
              ======================================================== */}
          {currentUser.role === "Transport" && (
            <>
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Stats Cards grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Driver Income (Month)</div>
                      <div className="text-2xl font-black text-text-charcoal mt-1">₹34,500</div>
                      <p className="text-[9px] text-primary font-bold mt-2">Verified earnings ledger</p>
                    </div>
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Trips Completed</div>
                      <div className="text-2xl font-black text-primary mt-1">14 Deliveries</div>
                      <p className="text-[9px] text-gray-500 mt-2">Rating average: ★ 4.9</p>
                    </div>
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Carbon Offset Credits</div>
                      <div className="text-2xl font-black text-text-charcoal mt-1">280 Points</div>
                      <p className="text-[9px] text-primary font-bold mt-2">Eco-driving certificate active</p>
                    </div>
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Fuel efficiency</div>
                      <div className="text-2xl font-black text-text-charcoal mt-1">16.4 km/l</div>
                      <p className="text-[9px] text-gray-500 mt-2">Tata Ace payload: 1.5 Tons</p>
                    </div>
                  </div>

                  <InteractiveMap />
                </div>
              )}

              {activeTab === "requests" && (
                <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-text-charcoal">Farmer Shipping requests</h3>
                  <div className="p-4 bg-bg-nature/40 border border-border-nature rounded-2xl text-xs space-y-2 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-text-charcoal">Ram Singh (Farmer)</div>
                      <p className="text-[10px] text-gray-500 mt-1">Route: Warangal Farm to Hyderabad Mandi Hub</p>
                      <p className="text-[9px] text-primary font-bold mt-1">Cargo: 1.2 Tons Basmati Rice. Payout: ₹2,400</p>
                    </div>
                    <button className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover shadow-sm">
                      Accept & GPS Guide
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ========================================================
              WAREHOUSE DASHBOARD VIEWS
              ======================================================== */}
          {currentUser.role === "Warehouse" && (
            <>
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Stats Cards grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Reserved capacity</div>
                      <div className="text-2xl font-black text-text-charcoal mt-1">78 Tons / 120 Tons</div>
                      <p className="text-[9px] text-primary font-bold mt-2">65% Silo space filled</p>
                    </div>
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Cold Chamber Temp</div>
                      <div className="text-2xl font-black text-primary mt-1">4.0 °C</div>
                      <p className="text-[9px] text-primary font-bold mt-2">Chamber automated calibration: OK</p>
                    </div>
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Active reserves</div>
                      <div className="text-2xl font-black text-text-charcoal mt-1">8 Farmers</div>
                      <p className="text-[9px] text-gray-500 mt-2">Recurring bookings: 3 dry, 5 cold</p>
                    </div>
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Monthly Billing</div>
                      <div className="text-2xl font-black text-text-charcoal mt-1">₹24,500</div>
                      <p className="text-[9px] text-gray-500 mt-2">Due date: July 5th</p>
                    </div>
                  </div>

                  <InteractiveMap />
                </div>
              )}

              {activeTab === "storage" && (
                <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-text-charcoal">Cold Storage Humidity & Fan telemetry</h3>
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
                    <div className="p-4 border border-border-nature rounded-2xl bg-bg-nature/30 text-center space-y-1">
                      <Thermometer className="h-6 w-6 text-primary mx-auto" />
                      <div className="text-[10px] text-gray-400">Bay 3 (Mango)</div>
                      <div className="text-sm font-bold text-text-charcoal">9.5°C | 70% RH</div>
                    </div>
                    <div className="p-4 border border-border-nature rounded-2xl bg-bg-nature/30 text-center space-y-1">
                      <Thermometer className="h-6 w-6 text-primary mx-auto" />
                      <div className="text-[10px] text-gray-400">Bay 4 (Wheat Dry Silo)</div>
                      <div className="text-sm font-bold text-text-charcoal">Ambient | 12% RH</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ========================================================
              ADMIN PANEL VIEWS
              ======================================================== */}
          {currentUser.role === "Admin" && (
            <>
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Stats Cards grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Platform volume (24h)</div>
                      <div className="text-2xl font-black text-text-charcoal mt-1">₹8,45,200</div>
                      <p className="text-[9px] text-primary font-bold mt-2">+24% volume increase</p>
                    </div>
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Pending crop audits</div>
                      <div className="text-2xl font-black text-primary mt-1">4 Audits</div>
                      <p className="text-[9px] text-gray-500 mt-2">AI diagnostics check complete</p>
                    </div>
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Fraud Alerts</div>
                      <div className="text-2xl font-black text-red-500 mt-1">0 Alerts</div>
                      <p className="text-[9px] text-primary font-bold mt-2">Zero price deviations flagged</p>
                    </div>
                    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                      <div className="text-[10px] text-gray-400 font-extrabold uppercase">Mandi server health</div>
                      <div className="text-2xl font-black text-text-charcoal mt-1">99.98% Up</div>
                      <p className="text-[9px] text-gray-500 mt-2">Response latency: 24ms</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PriceTrendChart />
                    <DemandForecastChart />
                  </div>
                </div>
              )}

              {activeTab === "users" && (
                <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-text-charcoal flex items-center gap-1.5">
                    <UserCheck className="h-5 w-5 text-primary" />
                    Verify Agricultural Trading Entities
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border-nature text-[10px] text-gray-400 font-extrabold uppercase">
                          <th className="py-2.5">User</th>
                          <th>Location</th>
                          <th>Role</th>
                          <th>Govt verified ID</th>
                          <th>Escrow verified</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs font-semibold text-text-charcoal">
                        <tr className="border-b border-border-nature">
                          <td className="py-3 font-bold">Devanand Patil</td>
                          <td>Nashik, MH</td>
                          <td>Farmer</td>
                          <td>AADHAAR-***8921</td>
                          <td><span className="text-primary font-bold">Yes</span></td>
                        </tr>
                        <tr className="border-b border-border-nature">
                          <td className="py-3 font-bold">AgroCorp Retail</td>
                          <td>Mumbai, MH</td>
                          <td>Buyer</td>
                          <td>GSTIN-***8992</td>
                          <td><span className="text-primary font-bold">Yes</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "crops" && (
                <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-text-charcoal">Audits for grade classifications</h3>
                  <div className="p-4 bg-bg-nature/40 border border-border-nature rounded-2xl text-xs space-y-2 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-text-charcoal">Red Potatoes (Devanand Patil)</div>
                      <p className="text-[10px] text-gray-500 mt-1">Audit request details: Standard Grade-A verification</p>
                      <span className="bg-green-100 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-1">
                        AI Disease check: 0% anomalies found
                      </span>
                    </div>
                    <button className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover shadow-sm">
                      Approve Grade-A
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "disputes" && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-text-charcoal flex items-center gap-1.5">
                      <ShieldAlert className="h-5 w-5 text-primary" />
                      Active Escrow & Payout Disputes
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border-nature text-[10px] text-gray-400 font-extrabold uppercase">
                            <th className="py-2.5">Dispute ID</th>
                            <th>Order ID</th>
                            <th>Raised By</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs font-semibold text-text-charcoal">
                          {disputes.map((d: any) => (
                            <tr key={d.id} className="border-b border-border-nature">
                              <td className="py-3 font-bold text-primary">#{d.id.slice(-4)}</td>
                              <td>#{d.orderId.slice(-6)}</td>
                              <td>
                                <span className="font-bold">{d.raisedByRole}</span> (ID: {d.raisedById.slice(-5)})
                              </td>
                              <td>
                                <div className="font-bold">{d.reason}</div>
                                <div className="text-[10px] text-gray-400 font-normal">{d.description}</div>
                              </td>
                              <td>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                  d.status === "OPEN" 
                                    ? "bg-red-50 text-red-700" 
                                    : d.status === "RESOLVED_RELEASE"
                                    ? "bg-green-50 text-primary"
                                    : "bg-blue-50 text-blue-700"
                                }`}>
                                  {d.status}
                                </span>
                              </td>
                              <td>
                                {d.status === "OPEN" ? (
                                  <button
                                    onClick={() => {
                                      setSelectedDispute(d);
                                      const ord = orders.find(o => o.id === d.orderId);
                                      if (ord) {
                                        setSplitFarmer(Math.round(ord.total * 0.6));
                                        setSplitBuyer(Math.round(ord.total * 0.4));
                                      }
                                    }}
                                    className="px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary-hover font-bold animate-pulse"
                                  >
                                    Resolve
                                  </button>
                                ) : (
                                  <div className="text-[10px] text-gray-400 max-w-xs truncate">
                                    Resolved: {d.resolutionNotes}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Resolution Modal */}
                  {selectedDispute && (
                    <>
                      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-card-bg rounded-3xl border border-border-nature shadow-2xl p-6 max-w-md w-full space-y-4 text-xs font-semibold text-text-charcoal relative">
                          <h3 className="text-sm font-black flex items-center gap-1">
                            ⚖️ Resolve Dispute #{selectedDispute.id.slice(-4)}
                          </h3>
                          <p className="text-[10px] text-gray-400 leading-relaxed">
                            Evaluate crop conditions, transport reports, and escrow terms to finalize payout resolution.
                          </p>

                          <form onSubmit={handleResolveDispute} className="space-y-4">
                            <div>
                              <label className="text-[10px] text-gray-400 font-bold block mb-1">Resolution Outcome</label>
                              <select
                                value={resType}
                                onChange={(e) => setResType(e.target.value as any)}
                                className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none"
                              >
                                <option value="RESOLVED_RELEASE">Release Escrow (100% to Farmer)</option>
                                <option value="RESOLVED_REFUND">Refund Escrow (100% to Buyer)</option>
                                <option value="RESOLVED_SPLIT">Split Payout (Custom Ratio)</option>
                              </select>
                            </div>

                            {resType === "RESOLVED_SPLIT" && (
                              <div className="grid grid-cols-2 gap-4 p-3 bg-bg-nature/20 border border-border-nature rounded-2xl">
                                <div>
                                  <label className="text-[10px] text-gray-400 font-bold block mb-1">Farmer Share (₹)</label>
                                  <input
                                    type="number"
                                    min={0}
                                    value={splitFarmer}
                                    onChange={(e) => setSplitFarmer(Number(e.target.value))}
                                    className="w-full px-3 py-1.5 border border-border-nature rounded-xl outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-400 font-bold block mb-1">Buyer Share (₹)</label>
                                  <input
                                    type="number"
                                    min={0}
                                    value={splitBuyer}
                                    onChange={(e) => setSplitBuyer(Number(e.target.value))}
                                    className="w-full px-3 py-1.5 border border-border-nature rounded-xl outline-none"
                                  />
                                </div>
                              </div>
                            )}

                            <div>
                              <label className="text-[10px] text-gray-400 font-bold block mb-1">Resolution Audit Notes</label>
                              <textarea
                                required
                                rows={3}
                                placeholder="Audit logs, inspector findings, or split agreement details..."
                                value={resNotes}
                                onChange={(e) => setResNotes(e.target.value)}
                                className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none"
                              />
                            </div>

                            <div className="flex gap-3 pt-2">
                              <button
                                type="button"
                                onClick={() => setSelectedDispute(null)}
                                className="flex-1 py-2.5 border border-border-nature rounded-xl hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover shadow-sm"
                              >
                                Resolve Now
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "fraud" && (
                <div className="py-12 text-center space-y-2 border border-dashed border-border-nature rounded-3xl bg-white dark:bg-card-bg">
                  <ShieldAlert className="h-10 w-10 text-gray-300 mx-auto" />
                  <h3 className="font-bold text-xs text-text-charcoal">System reports clear</h3>
                  <p className="text-[10px] text-gray-500 max-w-xs mx-auto">No price manipulations or suspicious wallet withdrawals detected.</p>
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-nature flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-500">Loading FarmLink Workspace...</span>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
