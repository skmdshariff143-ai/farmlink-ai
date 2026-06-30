"use client";

import React, { useEffect } from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error details to console
    console.error("Platform crash caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg-nature flex flex-col items-center justify-center p-6 text-center organic-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-8 shadow-2xl glass relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-red-500" />
        
        <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6 animate-pulse">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <h2 className="text-3xl font-black text-text-charcoal leading-none">500 - Mandi Interrupted</h2>
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          An unexpected server latency anomaly occurred. Our telemetry logs are tracking this issue.
        </p>

        <button
          onClick={() => reset()}
          className="w-full mt-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Fetching Data
        </button>
      </motion.div>
    </div>
  );
}
