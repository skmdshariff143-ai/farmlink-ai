"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sprout, Phone } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-8 shadow-xl space-y-6 text-xs text-text-charcoal font-semibold">
      <div className="text-center space-y-2">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
          <Sprout className="h-6 w-6 animate-bounce" />
        </div>
        <h2 className="text-lg font-black leading-tight">Reset Passcode</h2>
        <p className="text-[10px] text-gray-500">We will send a temporary SMS reset code</p>
      </div>

      {success ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-center space-y-3">
          <span className="text-primary block font-bold">SMS Passcode Code Sent!</span>
          <p className="text-[10px] text-gray-500">Please check your mobile message inbox. Use temporary passcode <strong>123456</strong> to sign in.</p>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-2 bg-primary text-white rounded-xl font-bold"
          >
            Go to Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] text-gray-400 font-bold block mb-1">Registered Phone Number</label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold shadow-md"
          >
            {loading ? "Requesting SMS..." : "Request Reset OTP"}
          </button>
        </form>
      )}

      <div className="text-center text-[10px] text-gray-400 border-t border-border-nature pt-3">
        Remember your password?{" "}
        <button onClick={() => router.push("/login")} className="text-primary font-bold hover:underline">
          Sign In
        </button>
      </div>
    </div>
  );
}
