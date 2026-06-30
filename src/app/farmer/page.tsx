"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useFarmStore, UserRole } from "@/store/useFarmStore";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import AIChatbot from "@/components/layout/AIChatbot";
import { PriceTrendChart, RevenueChart } from "@/components/charts/CustomCharts";
import { 
  Sprout, Plus, ClipboardList, Truck, Landmark, CloudSun,
  CloudRain, Award, Bell
} from "lucide-react";
import confetti from "canvas-confetti";

function FarmerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const { 
    currentUser, 
    listings, 
    addListing, 
    orders, 
    transportBookings, 
    addTransportBooking,
    warehouseBookings,
    addWarehouseBooking,
    schemes, 
    enrollInScheme,
    addNotification,
    achievements,
    unlockAchievement
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

    setCropName("");
    setCropPrice(0);
    setCropQty(0);
    setCropDesc("");

    unlockAchievement("ach_01");
    confetti({ particleCount: 50, spread: 60 });
    router.push("/farmer?tab=inventory");
  };

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
      `Assigned Kuldeep Singh for your route: ${truckRoute}.`,
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
                <Sprout className="h-6 w-6 text-primary animate-bounce" />
                Farmer Portal
              </h1>
              <p className="text-xs text-gray-500">Mandi crop listing management, AI diagnosis scans, and logistics booking.</p>
            </div>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                  <div className="text-[10px] text-gray-400 font-extrabold uppercase">Today&apos;s Price (Rice)</div>
                  <div className="text-2xl font-black text-text-charcoal mt-1">₹65.00 <span className="text-xs text-primary font-bold">+3.2%</span></div>
                </div>
                <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                  <div className="text-[10px] text-gray-400 font-extrabold uppercase">Wallet Balance</div>
                  <div className="text-2xl font-black text-primary mt-1">₹{currentUser.walletBalance.toLocaleString("en-IN")}</div>
                </div>
                <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                  <div className="text-[10px] text-gray-400 font-extrabold uppercase">Orders Pending</div>
                  <div className="text-2xl font-black text-text-charcoal mt-1">{orders.length} Dispatches</div>
                </div>
                <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm">
                  <div className="text-[10px] text-gray-400 font-extrabold uppercase">Yield Score</div>
                  <div className="text-2xl font-black text-text-charcoal mt-1">92 / 100</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  <PriceTrendChart />
                  <RevenueChart />
                </div>
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-gradient-to-br from-primary to-secondary text-white rounded-3xl p-6 shadow-md space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold uppercase text-green-100">Weather Telemetry</span>
                      <CloudRain className="h-5 w-5 text-accent animate-bounce" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black">28°C</span>
                      <span className="text-xs text-green-100">Light Showers</span>
                    </div>
                    <div className="p-2.5 bg-white/10 rounded-2xl text-[10px] font-bold border border-white/25">
                      🌾 AI Suggestion: Rain expected on Wednesday. Secure grain sacks in dry bays today.
                    </div>
                  </div>

                  <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-text-charcoal flex items-center gap-1">
                      <Award className="h-4 w-4 text-primary animate-pulse" />
                      Platform Achievements
                    </h4>
                    <div className="space-y-3.5">
                      {achievements.map((ach) => (
                        <div key={ach.id} className="flex gap-2.5 items-start text-xs">
                          <span className="text-xl">{ach.icon}</span>
                          <div className="flex-1">
                            <h5 className="font-bold text-text-charcoal">{ach.title}</h5>
                            <p className="text-[9px] text-gray-500 mt-1">{ach.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "upload" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                        className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold block mb-1">Category</label>
                      <select
                        value={cropCategory}
                        onChange={(e) => setCropCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none"
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
                        value={cropPrice || ""}
                        onChange={(e) => setCropPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold block mb-1">Stock Quantity (kg)</label>
                      <input
                        type="number"
                        required
                        min={100}
                        value={cropQty || ""}
                        onChange={(e) => setCropQty(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Crop Image Address</label>
                    <select
                      value={cropImg}
                      onChange={(e) => setCropImg(e.target.value)}
                      className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none"
                    >
                      <option value="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80">Basmati Rice Grain</option>
                      <option value="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=80">Wheat Golden Grain</option>
                      <option value="https://images.unsplash.com/photo-1508747703725-719ae2c73ee0?w=500&auto=format&fit=crop&q=80">Desi Red Onion</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Harvest Description</label>
                    <textarea
                      rows={3}
                      value={cropDesc}
                      onChange={(e) => setCropDesc(e.target.value)}
                      className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs font-bold"
                  >
                    Publish Listing
                  </button>
                </form>
              </div>

              <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4 text-xs leading-relaxed text-text-charcoal">
                <h3 className="text-sm font-bold">Crop Disease Scanner Guide</h3>
                <p className="text-gray-500">
                  Click the floating assistant bot on the bottom-right corner of the page to trigger the leaf diagnostic scans.
                </p>
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-text-charcoal">My Live Crop Listings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border-nature text-[10px] text-gray-400 font-extrabold uppercase">
                      <th className="py-2.5">Crop Name</th>
                      <th>Category</th>
                      <th>Price index</th>
                      <th>Stock (kg)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((l) => (
                      <tr key={l.id} className="border-b border-border-nature font-semibold">
                        <td className="py-3 font-bold">{l.name}</td>
                        <td>{l.category}</td>
                        <td>₹{l.price}/kg</td>
                        <td>{l.quantity} kg</td>
                        <td>{l.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-text-charcoal">Book Logistics Truck</h3>
                <form onSubmit={handleBookTruck} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Vehicle Type</label>
                    <select
                      value={truckType}
                      onChange={(e) => setTruckType(e.target.value)}
                      className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none"
                    >
                      <option>Tata Ace (1.5 Ton)</option>
                      <option>Mahindra Bolero (3 Ton)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Route</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Warangal Farm to Hyderabad Hub"
                      value={truckRoute}
                      onChange={(e) => setTruckRoute(e.target.value)}
                      className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none"
                    />
                  </div>
                  <button type="submit" className="w-full py-3 bg-primary text-white rounded-2xl text-xs font-bold">
                    Assign Driver
                  </button>
                </form>
              </div>

              <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-text-charcoal">Book Cold Warehouse Space</h3>
                <form onSubmit={handleBookWH} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Storage Class</label>
                    <select
                      value={whType}
                      onChange={(e) => setWhType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none"
                    >
                      <option value="Cold Storage">Cold Storage</option>
                      <option value="Dry Storage">Dry Storage</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Space (Tons)</label>
                    <input
                      type="number"
                      required
                      value={whCapacity || ""}
                      onChange={(e) => setWhCapacity(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none"
                    />
                  </div>
                  <button type="submit" className="w-full py-3 bg-primary text-white rounded-2xl text-xs font-bold">
                    Reserve Slot
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "schemes" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {schemes.map((s) => (
                <div key={s.id} className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4 text-xs">
                  <div>
                    <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full block w-max mb-2">
                      DBT Enabled
                    </span>
                    <h4 className="font-bold text-text-charcoal">{s.title}</h4>
                    <p className="text-[10px] text-gray-500 mt-1">{s.description}</p>
                    <p className="mt-2"><strong>Benefit:</strong> {s.subsidy}</p>
                  </div>
                  {s.enrolled ? (
                    <div className="w-full py-2 bg-green-50 text-primary text-center rounded-xl font-bold">Enrolled</div>
                  ) : (
                    <button
                      onClick={() => {
                        enrollInScheme(s.id);
                        addNotification("Scheme Enrolled", `Applied for ${s.title}`, "success");
                        confetti({ particleCount: 30 });
                      }}
                      className="w-full py-2 bg-primary text-white text-center rounded-xl font-bold"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "weather" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-center">
              <div className="bg-white border border-border-nature rounded-3xl p-4">
                <div className="text-gray-400">Humidity</div>
                <div className="text-lg font-bold">82%</div>
              </div>
              <div className="bg-white border border-border-nature rounded-3xl p-4">
                <div className="text-gray-400">Rain Chance</div>
                <div className="text-lg font-bold">45%</div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default function FarmerDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-nature flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-500">Loading Farmer Workspace...</span>
        </div>
      </div>
    }>
      <FarmerDashboardContent />
    </Suspense>
  );
}
