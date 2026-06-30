"use client";

import React, { useState, useEffect } from "react";
import { RevenueChart, DemandForecastChart } from "@/components/charts/CustomCharts";
import { Sprout, TrendingUp, DollarSign, Users, ShieldCheck, Activity } from "lucide-react";
import confetti from "canvas-confetti";

export default function DemoPage() {
  const [demandIndex, setDemandIndex] = useState(82);
  const [marketState, setMarketState] = useState<"Bullish" | "Bearish" | "Stable">("Bullish");
  const [forecastPrice, setForecastPrice] = useState(75);
  const [liveTicks, setLiveTicks] = useState<string[]>([
    "Buyer AgroCorp placed bid ₹68/kg for Basmati Rice",
    "Farmer Ram Singh listed 500kg Turmeric Bulbs",
    "Logistics Kuldeep completed delivery ts_902"
  ]);

  // Handle price predictions simulator updates based on demand and market indicators
  useEffect(() => {
    let multiplier = 1;
    if (marketState === "Bullish") multiplier = 1.15;
    if (marketState === "Bearish") multiplier = 0.85;

    const basePrice = 65; // Rice base
    const calculated = Math.round(basePrice * (demandIndex / 80) * multiplier);
    setForecastPrice(calculated);
  }, [demandIndex, marketState]);

  // Animate live activity ticks
  useEffect(() => {
    const crops = ["Wheat", "Potato", "Tomato", "Onion"];
    const buyers = ["Reliance Fresh", "BigBasket", "Mandi Hub", "AgroCorp"];
    
    const interval = setInterval(() => {
      const crop = crops[Math.floor(Math.random() * crops.length)];
      const buyer = buyers[Math.floor(Math.random() * buyers.length)];
      const price = Math.round(30 + Math.random() * 80);
      const newTick = `Buyer ${buyer} placed bid ₹${price}/kg for ${crop}`;
      
      setLiveTicks((prev) => [newTick, prev[0], prev[1]].slice(0, 3));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="min-h-screen bg-bg-nature/30 p-6 md:p-12 font-semibold text-xs text-text-charcoal space-y-8 max-w-6xl mx-auto">
      
      {/* Brand logo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border-nature pb-6 gap-4">
        <div>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-wider block w-max">
            Investor Pitch Mode
          </span>
          <h1 className="text-3xl font-black text-text-charcoal flex items-center gap-2 mt-2">
            <Sprout className="h-8 w-8 text-primary animate-bounce" />
            FarmLink AI — Smart Agriculture SaaS
          </h1>
          <p className="text-xs text-gray-500 mt-1">Multi-tenant marketplace demo illustrating live transaction flow, AI forecasts, and escrow wallet balances.</p>
        </div>
        <button
          onClick={triggerConfetti}
          className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs font-black shadow-lg shadow-primary/25 transition-transform hover:scale-[1.03]"
        >
          Simulate Funding Round Success 🚀
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-border-nature rounded-3xl p-6 shadow-sm space-y-2 relative overflow-hidden">
          <div className="absolute right-4 top-4 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <DollarSign className="h-4.5 w-4.5" />
          </div>
          <div className="text-[10px] text-gray-400 font-extrabold uppercase">Total Revenue (ARR)</div>
          <div className="text-2xl font-black text-text-charcoal mt-1">₹8.45 Cr</div>
          <p className="text-[10px] text-primary font-bold">+18% MoM growth</p>
        </div>

        <div className="bg-white border border-border-nature rounded-3xl p-6 shadow-sm space-y-2 relative overflow-hidden">
          <div className="absolute right-4 top-4 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Users className="h-4.5 w-4.5" />
          </div>
          <div className="text-[10px] text-gray-400 font-extrabold uppercase">Onboarded Traders</div>
          <div className="text-2xl font-black text-text-charcoal mt-1">12,480</div>
          <p className="text-[10px] text-gray-500">Farmers, Buyers, Drivers</p>
        </div>

        <div className="bg-white border border-border-nature rounded-3xl p-6 shadow-sm space-y-2 relative overflow-hidden">
          <div className="absolute right-4 top-4 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <div className="text-[10px] text-gray-400 font-extrabold uppercase">Escrow Volume Secured</div>
          <div className="text-2xl font-black text-primary mt-1">₹1.80 Cr</div>
          <p className="text-[10px] text-primary font-bold">100% payout safety record</p>
        </div>

        <div className="bg-white border border-border-nature rounded-3xl p-6 shadow-sm space-y-2 relative overflow-hidden">
          <div className="absolute right-4 top-4 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
          <div className="text-[10px] text-gray-400 font-extrabold uppercase">Mandi Price Index</div>
          <div className="text-2xl font-black text-text-charcoal mt-1">114.8</div>
          <p className="text-[10px] text-green-500 font-bold">Beat baseline index by 12%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Live charts and prediction engine */}
        <div className="lg:col-span-8 space-y-8">
          <RevenueChart />

          <div className="bg-white border border-border-nature rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-black text-text-charcoal">Interactive AI Price Forecaster Simulator</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">Toggle variables to see expected rice pricing fluctuate on-the-fly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase block mb-1">Mandi Demand Index ({demandIndex}%)</label>
                  <input
                    type="range"
                    min="30"
                    max="150"
                    value={demandIndex}
                    onChange={(e) => setDemandIndex(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase block mb-1">Market Sentiment State</label>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    {["Bullish", "Stable", "Bearish"].map((state) => (
                      <button
                        key={state}
                        onClick={() => setMarketState(state as any)}
                        className={`py-2 rounded-xl font-bold border ${
                          marketState === state
                            ? "bg-primary border-primary text-white"
                            : "border-border-nature hover:bg-gray-50"
                        }`}
                      >
                        {state}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-bg-nature/40 border border-border-nature rounded-2xl p-5 flex flex-col justify-between items-center text-center">
                <span className="text-[9px] font-extrabold uppercase text-gray-400 block">AI Predicted Rice Price</span>
                <div className="text-4xl font-black text-primary my-2">₹{forecastPrice}/kg</div>
                <span className="text-[10px] text-gray-500">Forecast range: ₹{Math.round(forecastPrice * 0.94)} - ₹{Math.round(forecastPrice * 1.06)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Live Activity Feed */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border border-border-nature rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-text-charcoal flex items-center gap-1">
              <Activity className="h-4.5 w-4.5 text-primary animate-pulse" />
              Live Activity Feed
            </h3>
            <div className="space-y-4">
              {liveTicks.map((tick, idx) => (
                <div key={idx} className="p-3 bg-bg-nature/30 border border-border-nature rounded-2xl text-[10px] leading-relaxed">
                  <div className="font-extrabold text-text-charcoal">{tick}</div>
                  <span className="text-[9px] text-gray-400 mt-1 block">Just now</span>
                </div>
              ))}
            </div>
          </div>

          <DemandForecastChart />
        </div>
      </div>
    </div>
  );
}
