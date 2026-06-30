"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFarmStore } from "@/store/useFarmStore";
import { Sprout, Phone, Lock, ChevronRight } from "lucide-react";
import confetti from "canvas-confetti";

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useFarmStore();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [roleSelect, setRoleSelect] = useState<"Farmer" | "Buyer" | "Transport" | "Warehouse" | "Admin">("Farmer");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setTimeout(() => {
      setStep("otp");
      setLoading(false);
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    setTimeout(() => {
      // Apply active identity role selection
      setRole(roleSelect);
      confetti({ particleCount: 80, spread: 60 });
      setLoading(false);
      
      // Redirect to respective dashboard page
      router.push(`/${roleSelect.toLowerCase()}`);
    }, 1000);
  };

  return (
    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-8 shadow-xl space-y-6 text-xs text-text-charcoal font-semibold">
      {/* Brand logo */}
      <div className="text-center space-y-2">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
          <Sprout className="h-6 w-6 animate-bounce" />
        </div>
        <h2 className="text-lg font-black leading-tight">Welcome to FarmLink AI</h2>
        <p className="text-[10px] text-gray-500">Sign in to access your customized agricultural portal</p>
      </div>

      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="text-[10px] text-gray-400 font-bold block mb-1">Select Identity Role</label>
            <select
              value={roleSelect}
              onChange={(e) => setRoleSelect(e.target.value as any)}
              className="w-full px-3 py-2.5 border border-border-nature rounded-xl outline-none focus:ring-1 focus:ring-primary bg-transparent font-bold"
            >
              <option value="Farmer">Farmer (Sell harvests)</option>
              <option value="Buyer">Buyer (Procure harvests)</option>
              <option value="Transport">Logistics Transport Provider</option>
              <option value="Warehouse">Warehouse Cold Storage Owner</option>
              <option value="Admin">System Administrator</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-gray-400 font-bold block mb-1">Mobile Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-border-nature rounded-xl outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold flex items-center justify-center gap-1.5 shadow-md"
          >
            {loading ? "Sending SMS OTP..." : "Get OTP Verification Code"}
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="p-3.5 bg-bg-nature/40 rounded-2xl border border-border-nature text-center">
            <span className="text-gray-500 block">OTP Sent to {phone}</span>
            <span className="text-[10px] text-primary font-bold mt-1 block">Passcode is simulated as: 123456</span>
          </div>

          <div>
            <label className="text-[10px] text-gray-400 font-bold block mb-1">Enter 6-Digit Passcode</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-border-nature rounded-xl outline-none focus:ring-1 focus:ring-primary text-center tracking-widest font-black text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold flex items-center justify-center gap-1 shadow-md"
          >
            {loading ? "Verifying..." : "Verify & Sign In"}
          </button>
        </form>
      )}

      {/* Navigation helpers */}
      <div className="flex justify-between items-center text-[10px] text-gray-400 pt-2 border-t border-border-nature">
        <button onClick={() => router.push("/register")} className="hover:text-primary transition-colors">
          Create Account
        </button>
        <button onClick={() => router.push("/forgot-password")} className="hover:text-primary transition-colors">
          Forgot Password?
        </button>
      </div>
    </div>
  );
}
