"use client";

import React from "react";
import Link from "next/link";
import { Leaf, ArrowLeft, Bot } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-nature flex flex-col items-center justify-center p-6 text-center organic-bg">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-8 shadow-2xl glass relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-accent" />
        
        {/* Animated Bot icon */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6"
        >
          <Bot className="h-8 w-8" />
        </motion.div>

        <h2 className="text-3xl font-black text-text-charcoal leading-none">404 - Lost in Fields</h2>
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          The page you are looking for has been harvested, moved, or never seeded in our directory database.
        </p>

        <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Home Page
          </Link>
          <Link
            href="/marketplace"
            className="flex-1 py-2.5 border border-border-nature hover:bg-bg-nature rounded-xl text-xs font-bold text-text-charcoal transition-all"
          >
            Marketplace
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
