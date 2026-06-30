"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFarmStore } from "@/store/useFarmStore";
import { Sprout, Phone, Mail, User, MapPin } from "lucide-react";
import confetti from "canvas-confetti";

export default function RegisterPage() {
  const router = useRouter();
  const { setCurrentUser } = useFarmStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [roleSelect, setRoleSelect] = useState<"Farmer" | "Buyer" | "Transport" | "Warehouse" | "Admin">("Farmer");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email || !location) return;

    setLoading(true);
    setTimeout(() => {
      // Register user locally in store
      setCurrentUser({
        id: `user_${Date.now()}`,
        name,
        phone,
        email,
        role: roleSelect,
        avatar: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80",
        location,
        walletBalance: roleSelect === "Buyer" ? 100000.0 : 0.0
      });

      confetti({ particleCount: 100, spread: 60 });
      setLoading(false);
      router.push(`/${roleSelect.toLowerCase()}`);
    }, 1000);
  };

  return (
    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-8 shadow-xl space-y-6 text-xs text-text-charcoal font-semibold">
      <div className="text-center space-y-2">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
          <Sprout className="h-6 w-6 animate-bounce" />
        </div>
        <h2 className="text-lg font-black leading-tight">Create Account</h2>
        <p className="text-[10px] text-gray-500">Join FarmLink AI agriculture platform today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[10px] text-gray-400 font-bold block mb-1">Onboarding Role</label>
          <select
            value={roleSelect}
            onChange={(e) => setRoleSelect(e.target.value as any)}
            className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none bg-transparent font-bold"
          >
            <option value="Farmer">Farmer (Sell crops)</option>
            <option value="Buyer">Buyer (Buy crops)</option>
            <option value="Transport">Transport Provider</option>
            <option value="Warehouse">Warehouse Provider</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] text-gray-400 font-bold block mb-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              required
              placeholder="Ram Singh"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-border-nature rounded-xl outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-gray-400 font-bold block mb-1">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                required
                placeholder="+91..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-border-nature rounded-xl outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-400 font-bold block mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="email"
                required
                placeholder="ram@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-border-nature rounded-xl outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-gray-400 font-bold block mb-1">Trading Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              required
              placeholder="Warangal, Telangana"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-border-nature rounded-xl outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold shadow-md"
        >
          {loading ? "Registering account..." : "Complete Onboarding"}
        </button>
      </form>

      <div className="text-center text-[10px] text-gray-400 border-t border-border-nature pt-3">
        Already have an account?{" "}
        <button onClick={() => router.push("/login")} className="text-primary font-bold hover:underline">
          Sign In
        </button>
      </div>
    </div>
  );
}
