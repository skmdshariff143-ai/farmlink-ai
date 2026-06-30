"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFarmStore, UserRole } from "@/store/useFarmStore";
import { 
  Leaf, Phone, Mail, Sparkles, Key, CheckCircle2, ArrowRight,
  ShieldCheck, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const router = useRouter();
  const { setCurrentUser, setRole } = useFarmStore();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("Farmer");
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");
  const [name, setName] = useState("");

  const handleSendOtp = () => {
    if (!phone) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
    }, 1200);
  };

  const handleVerifyAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      // Setup demo session profile
      const demoUser = {
        id: `user_${Date.now().toString().slice(-4)}`,
        name: name || (selectedRole === "Farmer" ? "Ram Singh" : 
                       selectedRole === "Buyer" ? "Reliance Fresh" : 
                       selectedRole === "Transport" ? "Devender" : 
                       selectedRole === "Warehouse" ? "Apex Cold Storage" : "Super Admin"),
        phone: phone || "+91 98765 43210",
        email: email || "user@farmlink.ai",
        role: selectedRole,
        avatar: selectedRole === "Farmer" ? "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80" : 
                selectedRole === "Buyer" ? "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80" : 
                "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
        location: selectedRole === "Farmer" ? "Warangal, Telangana" : "New Delhi, India",
        walletBalance: selectedRole === "Buyer" ? 150000.0 : 12450.0
      };

      setCurrentUser(demoUser);
      setRole(selectedRole); // Trigger identity bindings
      setIsLoading(false);
      
      // Redirect to dashboard page
      router.push("/dashboard?tab=overview");
    }, 1500);
  };

  const handleSocialLogin = (socialName: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const demoUser = {
        id: "user_social",
        name: `Google Partner (${selectedRole})`,
        phone: "+91 99999 88888",
        email: `partner@${socialName.toLowerCase()}.com`,
        role: selectedRole,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
        location: "Mumbai, Maharashtra",
        walletBalance: 25000.0
      };
      setCurrentUser(demoUser);
      setRole(selectedRole);
      setIsLoading(false);
      router.push("/dashboard?tab=overview");
    }, 1000);
  };

  const rolesList: { id: UserRole; label: string; desc: string; icon: string }[] = [
    { id: "Farmer", label: "Farmer / Producer", desc: "Sell crops directly, predict yields & diseases", icon: "🌾" },
    { id: "Buyer", label: "Merchant / Buyer", desc: "Browse crops, track shipments, escrow checkout", icon: "🛒" },
    { id: "Transport", label: "Logistics Trucker", desc: "Accept hauling jobs & track routes", icon: "🚚" },
    { id: "Warehouse", label: "Warehouse Operator", desc: "List storage capacity & dry silos", icon: "🏢" },
    { id: "Admin", label: "Mandi Admin", desc: "Audit listings, verify schemes & fraud protection", icon: "🛡️" }
  ];

  return (
    <div className="min-h-screen bg-bg-nature flex flex-col items-center justify-center p-4 md:p-8 organic-bg">
      
      {/* Brand logo header */}
      <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => router.push("/")}>
        <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-2xl text-white shadow-lg">
          <Leaf className="h-6 w-6" />
        </div>
        <span className="text-2xl font-black tracking-tight text-text-charcoal">
          FarmLink<span className="font-extrabold text-accent">AI</span>
        </span>
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white dark:bg-card-bg rounded-3xl border border-border-nature p-6 sm:p-8 shadow-2xl glass relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-accent" />
        
        {/* Toggle Title */}
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-xl font-black text-text-charcoal">
            {isRegistering ? "Create your FarmLink Account" : "Welcome back to FarmLink"}
          </h2>
          <p className="text-xs text-gray-400">
            {isRegistering 
              ? "Select your agricultural role and enroll" 
              : "Verify with Phone OTP secure two-factor"
            }
          </p>
        </div>

        {/* Tab Options: Sign In vs Register */}
        <div className="flex bg-bg-nature/60 dark:bg-card-bg/50 rounded-2xl p-1 mb-6 border border-border-nature">
          <button
            onClick={() => { setIsRegistering(false); setOtpSent(false); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              !isRegistering ? "bg-white dark:bg-card-bg text-primary shadow-sm" : "text-gray-400"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsRegistering(true); setOtpSent(false); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              isRegistering ? "bg-white dark:bg-card-bg text-primary shadow-sm" : "text-gray-400"
            }`}
          >
            Register
          </button>
        </div>

        {/* Registration Details: Role Selector */}
        {isRegistering && !otpSent && (
          <div className="space-y-4 mb-6">
            <label className="text-xs font-bold text-text-charcoal block mb-2">Select your Platform Profile:</label>
            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
              {rolesList.map((role) => (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all duration-200 flex items-start gap-3 ${
                    selectedRole === role.id 
                      ? "bg-primary/5 border-primary shadow-sm" 
                      : "border-border-nature hover:bg-bg-nature/40"
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{role.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-text-charcoal leading-none">{role.label}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 leading-normal">{role.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Input name */}
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1.5">Full Name / Trading Entity</label>
              <input
                type="text"
                placeholder="e.g. Ram Singh, Reliance Retail"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-border-nature rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary text-text-charcoal"
              />
            </div>
          </div>
        )}

        {/* Sign In Forms */}
        <form onSubmit={handleVerifyAndLogin} className="space-y-4">
          {!isRegistering && (
            <div className="flex gap-4 border-b border-border-nature pb-3 mb-2 justify-center">
              <button
                type="button"
                onClick={() => setAuthMethod("phone")}
                className={`text-xs font-bold flex items-center gap-1.5 pb-1 ${
                  authMethod === "phone" ? "text-primary border-b-2 border-primary" : "text-gray-400"
                }`}
              >
                <Phone className="h-3.5 w-3.5" />
                Phone OTP
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("email")}
                className={`text-xs font-bold flex items-center gap-1.5 pb-1 ${
                  authMethod === "email" ? "text-primary border-b-2 border-primary" : "text-gray-400"
                }`}
              >
                <Mail className="h-3.5 w-3.5" />
                Password Email
              </button>
            </div>
          )}

          {authMethod === "phone" ? (
            <>
              {/* Phone Input */}
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1.5">Mobile Phone Number</label>
                <div className="flex gap-2">
                  <span className="px-3 py-2.5 border border-border-nature bg-bg-nature/40 rounded-xl text-xs text-text-charcoal font-semibold shrink-0">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 px-4 py-2.5 border border-border-nature rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary text-text-charcoal font-semibold"
                  />
                </div>
              </div>

              {/* Send OTP button or OTP Input */}
              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={phone.length < 10 || isLoading}
                  className="w-full py-3 bg-primary text-white rounded-2xl text-xs font-bold hover:bg-primary-hover shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Verification OTP Code"}
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 pt-2"
                >
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1.5">Enter 6-Digit SMS OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="Enter 123456 to bypass"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full text-center tracking-[1em] font-extrabold text-lg px-4 py-2.5 border border-border-nature rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-text-charcoal"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={otpCode.length < 6 || isLoading}
                    className="w-full py-3 bg-primary text-white rounded-2xl text-xs font-bold hover:bg-primary-hover shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Code & Proceed to Dashboard"}
                  </button>
                </motion.div>
              )}
            </>
          ) : (
            <>
              {/* Email Form */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="farmer@farmlink.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-border-nature rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary text-text-charcoal"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1.5">Secret Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 border border-border-nature rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary text-text-charcoal"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary text-white rounded-2xl text-xs font-bold hover:bg-primary-hover shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Identity & Login"}
              </button>
            </>
          )}
        </form>

        {/* Social Dividers */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border-nature" /></div>
          <span className="relative bg-white dark:bg-card-bg px-3 text-[10px] font-extrabold text-gray-400 uppercase">
            Or Partner Login
          </span>
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSocialLogin("Google")}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-2.5 border border-border-nature hover:bg-bg-nature rounded-2xl text-xs font-bold text-text-charcoal transition-all"
          >
            Google OAuth
          </button>
          <button
            onClick={() => handleSocialLogin("Apple")}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-2.5 border border-border-nature hover:bg-bg-nature rounded-2xl text-xs font-bold text-text-charcoal transition-all"
          >
            Apple ID
          </button>
        </div>

        {/* Info badges */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[9px] font-bold text-gray-400">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          Escrow transactions protected by SSL & JWT
        </div>

      </motion.div>
    </div>
  );
}
