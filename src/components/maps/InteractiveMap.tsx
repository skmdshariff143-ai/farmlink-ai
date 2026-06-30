"use client";

import React, { useState, useEffect } from "react";
import { 
  Map, Navigation, Truck, Warehouse, Eye, EyeOff, 
  MapPin, ShoppingCart, RefreshCw, Layers, Compass
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MapPinData {
  id: string;
  name: string;
  type: "buyer" | "warehouse" | "truck" | "farmer";
  x: number; // percentage width
  y: number; // percentage height
  details: string;
  status?: string;
}

export default function InteractiveMap() {
  const [showBuyers, setShowBuyers] = useState(true);
  const [showWarehouses, setShowWarehouses] = useState(true);
  const [showTrucks, setShowTrucks] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedPin, setSelectedPin] = useState<MapPinData | null>(null);
  const [truckProgress, setTruckProgress] = useState(0);

  // Animate truck movement along path
  useEffect(() => {
    const timer = setInterval(() => {
      setTruckProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 150);
    return () => clearInterval(timer);
  }, []);

  const pins: MapPinData[] = [
    { id: "p1", name: "Reliance Mandi Hub", type: "buyer", x: 75, y: 30, details: "Bulk Purchaser • Active demand: 25 Tons Wheat", status: "Open for bids" },
    { id: "p2", name: "Apex Agro Cold Storage", type: "warehouse", x: 25, y: 40, details: "Capacity: 120 Tons • Cold Chamber Temp: 4°C", status: "30% Space available" },
    { id: "p3", name: "Express Logistics (Tata Ace)", type: "truck", x: 45, y: 55, details: "Driver: Sandeep • Heading to Hyderabad", status: "In Transit" },
    { id: "p4", name: "Karnal Grain Silos", type: "warehouse", x: 60, y: 70, details: "Grain Storage Silos • Automated aeration", status: "Fully Booked" },
    { id: "p5", name: "Devender 5-Ton Truck", type: "truck", x: 80, y: 65, details: "Driver: Devender • Available for booking", status: "Idle" },
    { id: "p6", name: "Organic Basmati Farm", type: "farmer", x: 15, y: 20, details: "Your Farm Site • Main crop: Basmati Rice", status: "Harvest Ready" },
  ];

  const filteredPins = pins.filter(pin => {
    if (pin.type === "farmer") return true;
    if (pin.type === "buyer" && !showBuyers) return false;
    if (pin.type === "warehouse" && !showWarehouses) return false;
    if (pin.type === "truck" && !showTrucks) return false;
    return true;
  });

  // Calculate truck moving coordinates along simulated route from (15, 20) to (75, 30)
  const truckX = 15 + (truckProgress / 100) * (75 - 15);
  const truckY = 20 + (truckProgress / 100) * (30 - 20);

  return (
    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-bold text-text-charcoal flex items-center gap-1.5">
            <Compass className="h-4.5 w-4.5 text-primary" />
            AI Logistics & Demand Map
          </h3>
          <p className="text-[10px] text-gray-500">Live GPS telemetry of nearby trucks, buyers and warehouse capacity</p>
        </div>

        {/* Map Toggles */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowBuyers(!showBuyers)}
            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-1 ${
              showBuyers 
                ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900" 
                : "border-gray-200 text-gray-400 bg-transparent"
            }`}
          >
            <ShoppingCart className="h-3 w-3" />
            Buyers
          </button>
          <button
            onClick={() => setShowWarehouses(!showWarehouses)}
            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-1 ${
              showWarehouses 
                ? "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/20 dark:border-orange-900" 
                : "border-gray-200 text-gray-400 bg-transparent"
            }`}
          >
            <Warehouse className="h-3 w-3" />
            Warehouses
          </button>
          <button
            onClick={() => setShowTrucks(!showTrucks)}
            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-1 ${
              showTrucks 
                ? "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950/20 dark:border-yellow-900" 
                : "border-gray-200 text-gray-400 bg-transparent"
            }`}
          >
            <Truck className="h-3 w-3" />
            Trucks
          </button>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-1 ${
              showHeatmap 
                ? "bg-green-50 border-primary/20 text-primary dark:bg-green-950/20" 
                : "border-gray-200 text-gray-400 bg-transparent"
            }`}
          >
            <Layers className="h-3 w-3" />
            Crop Heatmap
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[320px] rounded-2xl bg-bg-nature/70 dark:bg-bg-nature/10 border border-border-nature overflow-hidden organic-bg">
        {/* SVG Map Graphics */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          
          {/* Heatmap overlay layers */}
          {showHeatmap && (
            <>
              <defs>
                <radialGradient id="heat-grad-1" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#4CAF50" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="heat-grad-2" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#8BC34A" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8BC34A" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* Hotspots */}
              <circle cx="30%" cy="35%" r="100" fill="url(#heat-grad-1)" />
              <circle cx="65%" cy="55%" r="120" fill="url(#heat-grad-2)" />
              <circle cx="75%" cy="25%" r="80" fill="url(#heat-grad-1)" />
            </>
          )}

          {/* Abstract roads / flight-paths */}
          <path d="M 15 20 Q 40 45 75 30" fill="none" stroke="#A3E2B5" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
          <path d="M 25 40 H 75 Q 85 65 60 70" fill="none" stroke="#A3E2B5" strokeWidth="1.5" className="opacity-45" />
          
          {/* Animated GPS Route path */}
          {showTrucks && (
            <>
              <path d="M 15 20 Q 40 45 75 30" fill="none" stroke="#4CAF50" strokeWidth="3" className="opacity-30" />
              {/* Moving Route Dot */}
              <circle cx={`${truckX}%`} cy={`${truckY}%`} r="6" fill="#2E7D32" className="animate-ping" />
            </>
          )}
        </svg>

        {/* Map Pins */}
        {filteredPins.map((pin) => {
          let pinColor = "text-green-600";
          if (pin.type === "buyer") pinColor = "text-blue-500 bg-blue-100 ring-blue-200";
          if (pin.type === "warehouse") pinColor = "text-orange-500 bg-orange-100 ring-orange-200";
          if (pin.type === "truck") pinColor = "text-yellow-600 bg-yellow-100 ring-yellow-200";
          if (pin.type === "farmer") pinColor = "text-primary bg-primary/10 ring-primary/20";

          return (
            <button
              key={pin.id}
              onClick={() => setSelectedPin(pin)}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full ring-4 shadow-md transition-all hover:scale-125 z-10 ${pinColor}`}
            >
              {pin.type === "buyer" && <ShoppingCart className="h-3.5 w-3.5" />}
              {pin.type === "warehouse" && <Warehouse className="h-3.5 w-3.5" />}
              {pin.type === "truck" && <Truck className="h-3.5 w-3.5" />}
              {pin.type === "farmer" && <MapPin className="h-3.5 w-3.5" />}
            </button>
          );
        })}

        {/* Interactive moving Truck Marker */}
        {showTrucks && (
          <div 
            style={{ left: `${truckX}%`, top: `${truckY}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 bg-primary text-white p-1 rounded-full border border-white shadow-md z-20 hover:scale-125 transition-transform"
            title={`Active Pickup: ${truckProgress}% completed`}
          >
            <Navigation className="h-3 w-3 rotate-45 animate-pulse" />
          </div>
        )}

        {/* Selected Pin Details Dialog Overlay */}
        <AnimatePresence>
          {selectedPin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-3 left-3 right-3 rounded-xl bg-card-bg/95 border border-border-nature p-3 shadow-lg flex items-center justify-between z-30 glass"
            >
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${
                  selectedPin.type === "buyer" ? "bg-blue-100 text-blue-600" :
                  selectedPin.type === "warehouse" ? "bg-orange-100 text-orange-600" :
                  selectedPin.type === "truck" ? "bg-yellow-100 text-yellow-600" : "bg-primary/10 text-primary"
                }`}>
                  {selectedPin.type === "buyer" && <ShoppingCart className="h-4 w-4" />}
                  {selectedPin.type === "warehouse" && <Warehouse className="h-4 w-4" />}
                  {selectedPin.type === "truck" && <Truck className="h-4 w-4" />}
                  {selectedPin.type === "farmer" && <MapPin className="h-4 w-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-charcoal leading-none">{selectedPin.name}</h4>
                  <p className="text-[10px] text-gray-500 mt-1">{selectedPin.details}</p>
                  <span className="text-[9px] text-primary font-bold">{selectedPin.status}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPin(null)}
                className="px-2.5 py-1.5 rounded-lg bg-bg-nature hover:bg-primary/10 text-[9px] font-bold text-gray-500 hover:text-primary transition-all"
              >
                Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Map Bottom Status Metrics bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center pt-2">
        <div className="p-2 border border-border-nature rounded-2xl bg-bg-nature/30">
          <div className="text-[10px] text-gray-400 font-semibold">Active Trucks</div>
          <div className="text-sm font-extrabold text-text-charcoal mt-0.5">8 Available</div>
        </div>
        <div className="p-2 border border-border-nature rounded-2xl bg-bg-nature/30">
          <div className="text-[10px] text-gray-400 font-semibold">Transit Progress</div>
          <div className="text-sm font-extrabold text-primary mt-0.5">{truckProgress}% Cargo</div>
        </div>
        <div className="p-2 border border-border-nature rounded-2xl bg-bg-nature/30">
          <div className="text-[10px] text-gray-400 font-semibold">Cold Storage Capacity</div>
          <div className="text-sm font-extrabold text-text-charcoal mt-0.5">42 Tons Available</div>
        </div>
        <div className="p-2 border border-border-nature rounded-2xl bg-bg-nature/30">
          <div className="text-[10px] text-gray-400 font-semibold">Avg. Shipping Cost</div>
          <div className="text-sm font-extrabold text-text-charcoal mt-0.5">₹18 / ton-km</div>
        </div>
      </div>
    </div>
  );
}
