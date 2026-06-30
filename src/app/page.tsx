"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import AIChatbot from "@/components/layout/AIChatbot";
import { 
  ArrowRight, ShieldCheck, Zap, Users, BarChart3, 
  MapPin, CheckCircle, Smartphone, Mail, ChevronRight, HelpCircle,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const [activeStep, setActiveStep] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const stats = [
    { label: "Farmers Enrolled", value: "48,500+" },
    { label: "Fair Trade Payouts", value: "₹18.4 Cr+" },
    { label: "Avg. Farmer Income", value: "+34%" },
    { label: "Logistics Fleet", value: "4,200+ Trucks" }
  ];

  const steps = [
    {
      title: "1. Upload Harvest",
      desc: "Farmers upload photo of crops. AI detects crop health, estimates yield and grades quality."
    },
    {
      title: "2. AI Price Forecast",
      desc: "Smart predictor matches real-time mandi prices & seasonal demand, recommending the optimal listing price."
    },
    {
      title: "3. Direct Negotiation",
      desc: "Buyers browse listings and deal directly with farmers. Zero middleman commissions."
    },
    {
      title: "4. Carbon-Offset Shipping",
      desc: "Instant booking of temperature-controlled trucks and warehouses, tracked in real-time."
    }
  ];

  const features = [
    {
      icon: Zap,
      title: "AI Disease Detection",
      desc: "Point phone camera at infected leaves. Instant diagnosis and remedies powered by Gemini AI."
    },
    {
      icon: BarChart3,
      title: "Predictive Mandi Pricing",
      desc: "Plan harvest seasons around demand fluctuations, ensuring you sell at peak market values."
    },
    {
      icon: ShieldCheck,
      title: "Secured Escrow Wallet",
      desc: "Transactions are locked in escrow. Farmers are guaranteed payment before dispatches occur."
    },
    {
      icon: Users,
      title: "Government Schemes",
      desc: "Instant eligibility assessments for agricultural subventions, solar pump grants, and crop insurances."
    }
  ];

  const faqs = [
    {
      q: "How does FarmLink AI eliminate middleman fees?",
      a: "Traditional agriculture has 3-4 commission agents. FarmLink AI connects buyers (like supermarkets and food chains) directly with farmers, using an escrow payment and integrated logistics network to deliver without agents."
    },
    {
      q: "Are the logistics temperature-controlled for fresh produce?",
      a: "Yes! Our partner fleet includes cold-chain trucks. During bookings, farmers can filter for refrigerated vehicles and cold-chamber storage bins."
    },
    {
      q: "What devices support the AI Crop Diagnostic tool?",
      a: "Our crop health lens is fully optimized for standard smartphones. It functions seamlessly as a Progressive Web App (PWA), even under low-connectivity 3G/4G networks."
    }
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Floating Assistant Bot */}
      <AIChatbot />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Next-Gen Decentralized Agritech Platform
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl font-black text-text-charcoal leading-[1.1] tracking-tight"
              >
                Connecting Farmers & Buyers <br />
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Directly with AI Diagnostics
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base md:text-lg text-gray-500 font-medium max-w-xl mx-auto lg:mx-0"
              >
                FarmLink AI eliminates middlemen to help farmers get fair prices while providing buyers with fresh produce, integrated smart shipping, and disease-free auditing.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
              >
                <Link
                  href="/marketplace"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary text-white text-sm font-extrabold hover:bg-primary-hover shadow-lg shadow-primary/20 hover:shadow-primary/35 transition-all text-center flex items-center justify-center gap-2"
                >
                  Browse Marketplace
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white dark:bg-card-bg border border-border-nature text-text-charcoal hover:bg-bg-nature text-sm font-extrabold transition-all text-center"
                >
                  Join as Partner / Farmer
                </Link>
              </motion.div>
            </div>

            {/* Hero Right Parallax Mockups */}
            <div className="lg:col-span-5 relative flex justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-full max-w-[360px] aspect-[4/5] rounded-[32px] border border-border-nature bg-white dark:bg-card-bg shadow-2xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-accent" />
                <div className="flex justify-between items-center mb-6">
                  <div className="text-[10px] font-extrabold tracking-widest text-primary uppercase">Mandi Price Index</div>
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                </div>
                
                {/* Floating Widget 1: Price predictor */}
                <div className="space-y-4">
                  <div className="p-3 bg-bg-nature/40 dark:bg-card-bg/50 rounded-2xl border border-border-nature">
                    <div className="text-[10px] text-gray-400 font-semibold">Organic Rice (Mandi)</div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-black text-text-charcoal">₹65.00</span>
                      <span className="text-xs font-bold text-primary">+12.4%</span>
                    </div>
                  </div>

                  {/* SVG mini trend chart */}
                  <svg viewBox="0 0 200 60" className="w-full overflow-visible">
                    <path d="M 0 50 L 40 45 L 80 48 L 120 30 L 160 35 L 200 15" fill="none" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="200" cy="15" r="4" fill="#8BC34A" stroke="#2E7D32" strokeWidth="2" />
                  </svg>

                  {/* AI match card */}
                  <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 space-y-1">
                    <div className="text-[10px] font-bold text-primary flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      AI Harvesting Alert
                    </div>
                    <p className="text-[10px] text-gray-600 dark:text-gray-300 leading-normal">
                      Monsoon showers arriving. Harvest Sharbati wheat within 48 hrs to preserve grade-A gluten content.
                    </p>
                  </div>
                </div>

                {/* Micro illustration blob */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-accent/20 filter blur-2xl pointer-events-none" />
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Ticker */}
      <section className="bg-white dark:bg-card-bg border-y border-border-nature py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {stats.map((s, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-primary">{s.value}</div>
                <div className="text-xs text-gray-400 font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 md:py-24 bg-bg-nature/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-text-charcoal">How FarmLink AI Works</h2>
            <p className="text-xs text-gray-500">A full-stack agricultural logistics and trading workflow streamlined in four steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setActiveStep(idx)}
                className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer ${
                  activeStep === idx 
                    ? "bg-white dark:bg-card-bg border-primary shadow-lg shadow-primary/5" 
                    : "bg-white/50 dark:bg-card-bg/25 border-border-nature"
                }`}
              >
                <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm mb-4">
                  {idx + 1}
                </div>
                <h4 className="text-sm font-bold text-text-charcoal mb-2">{step.title}</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 max-w-xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-text-charcoal">Platform Key Features</h2>
            <p className="text-xs text-gray-500">Eliminating agents while providing enterprise infrastructure to rural smallholders</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="p-6 bg-white dark:bg-card-bg border border-border-nature rounded-3xl hover:border-primary hover:shadow-xl transition-all duration-300 group">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary inline-block mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-text-charcoal mb-2">{f.title}</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-bg-nature/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-text-charcoal">Frequently Asked Questions</h2>
            <p className="text-xs text-gray-500">Clear, transparent answers about our smart marketplace fees and operations</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white dark:bg-card-bg border border-border-nature rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
                  >
                    <span className="text-xs font-bold text-text-charcoal flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 text-[11px] text-gray-500 leading-relaxed border-t border-border-nature pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PWA Download Banner */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Smartphone className="h-10 w-10 mx-auto text-accent animate-float" />
          <h2 className="text-3xl font-black">Install FarmLink AI App</h2>
          <p className="text-sm text-green-100 max-w-md mx-auto">
            Get offline support, push alerts, and direct voice translations straight from your field. Works without internet caching!
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button className="px-6 py-2.5 bg-white text-primary rounded-xl text-xs font-extrabold hover:bg-green-50 shadow-md">
              Download Android PWA
            </button>
            <button className="px-6 py-2.5 bg-primary-hover text-white border border-white/20 rounded-xl text-xs font-extrabold hover:bg-white/10">
              Download iOS App
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-white dark:bg-card-bg border-b border-border-nature">
        <div className="max-w-md mx-auto px-4 text-center space-y-4">
          <Mail className="h-8 w-8 text-primary mx-auto" />
          <h3 className="text-lg font-bold text-text-charcoal">Subscribe to Market Newsletters</h3>
          <p className="text-xs text-gray-500">Weekly mandi rates, localized meteorological trends, and newly approved schemes.</p>
          
          {newsletterSubscribed ? (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 text-primary text-xs font-bold rounded-2xl border border-primary/20">
              Thanks! You have been successfully enrolled in crop updates.
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="Enter email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-2 border border-border-nature rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary text-text-charcoal"
              />
              <button 
                type="submit"
                className="px-5 py-2 bg-primary text-white hover:bg-primary-hover text-xs font-bold rounded-xl transition-all"
              >
                Join
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg-nature/40 dark:bg-bg-nature/5 py-12 border-t border-border-nature">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <span className="text-lg font-bold text-primary">FarmLink AI</span>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Eliminating exploitation of farmers. Building carbon-offset digital agriculture networks using artificial intelligence.
            </p>
          </div>
          <div>
            <h5 className="text-xs font-bold text-text-charcoal mb-3">SaaS Marketplace</h5>
            <ul className="space-y-1.5 text-[10px] text-gray-500">
              <li><Link href="/marketplace">Browse Products</Link></li>
              <li><Link href="/dashboard?tab=bookings">Transport Fleet</Link></li>
              <li><Link href="/dashboard?tab=storage">Cold Storages</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-bold text-text-charcoal mb-3">Govt Schemes</h5>
            <ul className="space-y-1.5 text-[10px] text-gray-500">
              <li><Link href="/dashboard?tab=schemes">PM-KISAN Benefits</Link></li>
              <li><Link href="/dashboard?tab=schemes">Solar Pump Grants</Link></li>
              <li><Link href="/dashboard?tab=schemes">Crop Insurance</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-bold text-text-charcoal mb-3">Legal & Security</h5>
            <ul className="space-y-1.5 text-[10px] text-gray-500">
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Trade</Link></li>
              <li><Link href="/contact">Contact Support</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[10px] text-gray-400 mt-10 border-t border-border-nature pt-6">
          © 2026 FarmLink AI. Powered by Google Cloud & Microsoft Agritech Partners.
        </div>
      </footer>
    </div>
  );
}
