"use client";

import React, { useState, Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import AIChatbot from "@/components/layout/AIChatbot";
import { useFarmStore } from "@/store/useFarmStore";
import { Settings, User, Bell, Shield, Wallet, Check } from "lucide-react";
import confetti from "canvas-confetti";

function SettingsPageContent() {
  const { currentUser, updateProfile, addNotification } = useFarmStore();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [location, setLocation] = useState(currentUser.location);
  const [phone, setPhone] = useState(currentUser.phone);
  
  const [activeSubTab, setActiveSubTab] = useState("profile");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email, location, phone });
    addNotification("Profile Updated 🎉", "Your profile configuration has been saved successfully.", "success");
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
                <Settings className="h-6 w-6 text-primary" />
                Account Settings
              </h1>
              <p className="text-xs text-gray-500">Manage account credentials, two-factor settings, and notification thresholds.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Settings tabs */}
            <div className="lg:col-span-3 space-y-2">
              <button
                onClick={() => setActiveSubTab("profile")}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeSubTab === "profile" ? "bg-primary text-white" : "hover:bg-bg-nature text-text-charcoal"
                }`}
              >
                <User className="h-4 w-4" />
                Profile Settings
              </button>
              <button
                onClick={() => setActiveSubTab("notifications")}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeSubTab === "notifications" ? "bg-primary text-white" : "hover:bg-bg-nature text-text-charcoal"
                }`}
              >
                <Bell className="h-4 w-4" />
                Notifications
              </button>
              <button
                onClick={() => setActiveSubTab("security")}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeSubTab === "security" ? "bg-primary text-white" : "hover:bg-bg-nature text-text-charcoal"
                }`}
              >
                <Shield className="h-4 w-4" />
                Security & 2FA
              </button>
            </div>

            {/* Config workspace */}
            <div className="lg:col-span-9 bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-6 shadow-sm">
              {activeSubTab === "profile" && (
                <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold text-text-charcoal">
                  <h3 className="text-sm font-bold border-b border-border-nature pb-3 mb-2">Edit General Profile</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold block mb-1">Full Trading Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold block mb-1">Mobile Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold block mb-1">Trading Location / Region</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-3 py-2 border border-border-nature rounded-xl outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <button type="submit" className="px-6 py-2.5 bg-primary text-white hover:bg-primary-hover font-bold rounded-xl shadow-md">
                    Save Profile Changes
                  </button>
                </form>
              )}

              {activeSubTab === "notifications" && (
                <div className="space-y-4 text-xs font-semibold text-text-charcoal">
                  <h3 className="text-sm font-bold border-b border-border-nature pb-3 mb-2">Notification Thresholds</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-primary" />
                      <span>SMS Alerts on Mandi Price shifts (above 4%)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-primary" />
                      <span>WhatsApp notifications on logistics shipping updates</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-primary" />
                      <span>Weekly email digest on agricultural subventions</span>
                    </label>
                  </div>
                </div>
              )}

              {activeSubTab === "security" && (
                <div className="space-y-4 text-xs font-semibold text-text-charcoal">
                  <h3 className="text-sm font-bold border-b border-border-nature pb-3 mb-2">Security Verification</h3>
                  <div className="p-4 bg-bg-nature/40 rounded-2xl border border-border-nature space-y-2">
                    <p className="font-bold text-primary">Two-Factor Authentication (2FA)</p>
                    <p className="text-[10px] text-gray-500">Your phone number is locked as a secure 2FA token endpoint using SMS OTP deliveries.</p>
                    <div className="text-[10px] text-primary font-bold">Enabled & Verified Status</div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-nature flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-500">Loading settings...</span>
        </div>
      </div>
    }>
      <SettingsPageContent />
    </Suspense>
  );
}
